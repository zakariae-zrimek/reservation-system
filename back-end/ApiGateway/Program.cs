using System.Net.Http.Json;
using Yarp.ReverseProxy;

var builder = WebApplication.CreateBuilder(args);

// ✅ AJOUT CORS ICI
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend5173", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173") // Vite
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddHttpClient("UserService", client =>
{
    var baseUrl = builder.Configuration["UserService:BaseUrl"];
    client.BaseAddress = new Uri(baseUrl!);
});

var app = builder.Build();

// ✅ ACTIVER CORS ICI (IMPORTANT: avant ton middleware auth)
app.UseCors("Frontend5173");

app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    var path = (context.Request.Path.Value ?? "").ToLowerInvariant();
    var method = context.Request.Method.ToUpperInvariant();

    // 🔓 Routes publiques
    bool isPublicAuth =
        path == "/api/auth/login" ||
        path == "/api/auth/register" ||
        path == "/api/auth/validate" ||
        path == "/api/auth/introspect" ||
        // ✅ Autoriser la lecture des images
        path.StartsWith("/uploads/images");

    // 🔓 Public GET: events & rooms
    bool isPublicReadCatalog =
        (path.StartsWith("/api/events") || path.StartsWith("/api/rooms")) &&
        method == "GET";

    if (isPublicAuth || isPublicReadCatalog)
    {
        await next();
        return;
    }

    var auth = context.Request.Headers.Authorization.ToString();
    if (string.IsNullOrWhiteSpace(auth) || !auth.StartsWith("Bearer "))
    {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsync("Missing Bearer token");
        return;
    }

    var token = auth["Bearer ".Length..].Trim();

    var http = context.RequestServices
        .GetRequiredService<IHttpClientFactory>()
        .CreateClient("UserService");

    var resp = await http.PostAsJsonAsync("/api/auth/introspect", new { token });

    if (!resp.IsSuccessStatusCode)
    {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsync("UserService introspect failed");
        return;
    }

    var data = await resp.Content.ReadFromJsonAsync<IntrospectResponse>();
    if (data == null || data.Valid != true)
    {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsync("Invalid token");
        return;
    }

    var role = (data.Role ?? "").ToLowerInvariant();

    bool adminOnly =
        (path.StartsWith("/api/events") || path.StartsWith("/api/rooms")) &&
        (method is "POST" or "PUT" or "PATCH" or "DELETE");

    if (adminOnly && role != "admin")
    {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsync("Admin role required");
        return;
    }

    bool reservationWrite =
        path.StartsWith("/api/reservations") &&
        (method is "POST" or "PUT" or "PATCH" or "DELETE");

    if (reservationWrite && role != "user")
    {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsync("User role required");
        return;
    }

    context.Request.Headers["X-User-Id"] = data.UserId ?? "";
    context.Request.Headers["X-User-Role"] = data.Role ?? "";

    await next();
});

app.MapReverseProxy();
app.Run();

public class IntrospectResponse
{
    public bool Valid { get; set; }
    public string? UserId { get; set; }
    public string? Role { get; set; }
}