using Consul;
using Microsoft.Extensions.Primitives;

// ✅ Aliases pour éviter le conflit Consul.RouteConfig vs Yarp.RouteConfig
using IProxyConfigProvider = Yarp.ReverseProxy.Configuration.IProxyConfigProvider;
using IProxyConfig = Yarp.ReverseProxy.Configuration.IProxyConfig;

using YarpRouteConfig = Yarp.ReverseProxy.Configuration.RouteConfig;
using YarpClusterConfig = Yarp.ReverseProxy.Configuration.ClusterConfig;
using YarpRouteMatch = Yarp.ReverseProxy.Configuration.RouteMatch;
using YarpDestinationConfig = Yarp.ReverseProxy.Configuration.DestinationConfig;

public sealed class ConsulProxyConfigProvider : IProxyConfigProvider, IDisposable
{
    private readonly IConsulClient _consul;
    private readonly TimeSpan _refreshInterval;
    private volatile ProxyConfig _currentConfig;
    private readonly CancellationTokenSource _disposeCts = new();

    public ConsulProxyConfigProvider(IConsulClient consul, TimeSpan? refreshInterval = null)
    {
        _consul = consul;
        _refreshInterval = refreshInterval ?? TimeSpan.FromSeconds(5);

        // config vide au démarrage
        _currentConfig = new ProxyConfig(
            Array.Empty<YarpRouteConfig>(),
            Array.Empty<YarpClusterConfig>());

        _ = RefreshLoopAsync(_disposeCts.Token);
    }

    public IProxyConfig GetConfig() => _currentConfig;

    private async Task RefreshLoopAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                var newConfig = await BuildConfigFromConsulAsync(ct);

                // swap + signal change à YARP
                var old = _currentConfig;
                _currentConfig = newConfig;
                old.SignalChange();

                Console.WriteLine($"[Consul/YARP] Config refreshed: {DateTime.Now:HH:mm:ss}");
            }
            catch (Exception ex)
            {
                Console.WriteLine("[Consul/YARP] Refresh failed: " + ex.Message);
            }

            await Task.Delay(_refreshInterval, ct);
        }
    }

    private async Task<ProxyConfig> BuildConfigFromConsulAsync(CancellationToken ct)
    {
        // ✅ Récupération dynamique des instances "passing"
        var eventDest = await GetDestinationsAsync("event-service", ct);
        var userDest = await GetDestinationsAsync("user-service", ct);
        var interestDest = await GetDestinationsAsync("user-interest-service", ct);
        var reservDest = await GetDestinationsAsync("reservation-service", ct);

        // ✅ Clusters dynamiques
        var clusters = new List<YarpClusterConfig>
        {
            new() { ClusterId = "event", Destinations = eventDest },
            new() { ClusterId = "user", Destinations = userDest },
            new() { ClusterId = "interest", Destinations = interestDest },
            new() { ClusterId = "reservation", Destinations = reservDest },
        };

        // ✅ Routes (adapte si tes paths sont différents)
        var routes = new List<YarpRouteConfig>
        {
            // User/Auth -> user-service
            new()
            {
                RouteId = "auth",
                ClusterId = "user",
                Match = new YarpRouteMatch { Path = "/api/auth/{**catch-all}" }
            },
            new()
            {
                RouteId = "users",
                ClusterId = "user",
                Match = new YarpRouteMatch { Path = "/api/users/{**catch-all}" }
            },

            // Event + Rooms -> event-service
            new()
            {
                RouteId = "events",
                ClusterId = "event",
                Match = new YarpRouteMatch { Path = "/api/events/{**catch-all}" }
            },
            new()
            {
                RouteId = "rooms",
                ClusterId = "event",
                Match = new YarpRouteMatch { Path = "/api/rooms/{**catch-all}" }
            },

            // Reservations -> reservation-service
            new()
            {
                RouteId = "reservations",
                ClusterId = "reservation",
                Match = new YarpRouteMatch { Path = "/api/reservations/{**catch-all}" }
            },

            // Interests -> user-interest-service
            // ⚠️ Change le prefix si ton API n'est pas /api/interests/...
            new()
            {
                RouteId = "interests",
                ClusterId = "interest",
                Match = new YarpRouteMatch { Path = "/api/interests/{**catch-all}" }
            }
        };

        return new ProxyConfig(routes, clusters);
    }

    private async Task<IReadOnlyDictionary<string, YarpDestinationConfig>> GetDestinationsAsync(
        string serviceName,
        CancellationToken ct)
    {
        var result = await _consul.Health.Service(serviceName, tag: "", passingOnly: true, ct);

        var dict = new Dictionary<string, YarpDestinationConfig>(StringComparer.OrdinalIgnoreCase);

        int i = 0;
        foreach (var e in result.Response)
        {
            var addr = e.Service.Address;
            var port = e.Service.Port;

            if (string.IsNullOrWhiteSpace(addr) || port <= 0)
                continue;

            dict[$"{serviceName}-{i++}"] = new YarpDestinationConfig
            {
                Address = $"http://{addr}:{port}"
            };
        }

        // Si aucune instance, on renvoie dict vide (YARP renverra 503 pour ce cluster)
        return dict;
    }

    public void Dispose()
    {
        _disposeCts.Cancel();
        _disposeCts.Dispose();
    }

    private sealed class ProxyConfig : IProxyConfig
    {
        private readonly CancellationTokenSource _cts = new();

        public ProxyConfig(IReadOnlyList<YarpRouteConfig> routes, IReadOnlyList<YarpClusterConfig> clusters)
        {
            Routes = routes;
            Clusters = clusters;
            ChangeToken = new CancellationChangeToken(_cts.Token);
        }

        public IReadOnlyList<YarpRouteConfig> Routes { get; }
        public IReadOnlyList<YarpClusterConfig> Clusters { get; }
        public IChangeToken ChangeToken { get; }

        public void SignalChange()
        {
            if (!_cts.IsCancellationRequested)
                _cts.Cancel();
        }
    }
}