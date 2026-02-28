using Consul;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Infrastructure;

public static class ConsulRegistrationExtensions
{
    public static IServiceCollection AddConsul(this IServiceCollection services, IConfiguration config)
    {
        services.AddSingleton<IConsulClient>(_ =>
            new ConsulClient(c => c.Address = new Uri(config["Consul:Address"]!))
        );

        return services;
    }

    public static WebApplication UseConsulRegistration(this WebApplication app)
    {
        var config = app.Configuration;

        var serviceName = config["Service:Name"] ?? "service";
        var serviceHost = config["Service:Host"] ?? "host.docker.internal";
        var servicePort = int.Parse(config["Service:Port"] ?? "0");

        var serviceId = $"{serviceName}-{Guid.NewGuid()}";

        app.Lifetime.ApplicationStarted.Register(() =>
        {
            _ = Task.Run(async () =>
            {
                var consul = app.Services.GetRequiredService<IConsulClient>();

                var registration = new AgentServiceRegistration
                {
                    ID = serviceId,
                    Name = serviceName,
                    Address = serviceHost,
                    Port = servicePort,
                    Check = new AgentServiceCheck
                    {
                        HTTP = $"http://{serviceHost}:{servicePort}/health",
                        Interval = TimeSpan.FromSeconds(10),
                        Timeout = TimeSpan.FromSeconds(3),
                        DeregisterCriticalServiceAfter = TimeSpan.FromMinutes(1)
                    }
                };

                await consul.Agent.ServiceRegister(registration);
                Console.WriteLine($"✅ Registered in Consul: {serviceName} ({serviceId})");
            });
        });

        app.Lifetime.ApplicationStopping.Register(() =>
        {
            _ = Task.Run(async () =>
            {
                var consul = app.Services.GetRequiredService<IConsulClient>();
                await consul.Agent.ServiceDeregister(serviceId);
                Console.WriteLine($"🧹 Deregistered: {serviceId}");
            });
        });

        return app;
    }
}