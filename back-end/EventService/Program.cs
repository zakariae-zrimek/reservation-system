using EventService.config;
using EventService.Repositories;
using EventService.Services;
using Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger/OpenAPI
builder.Services.AddOpenApi();

// ===== MongoDB Settings =====
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDb"));

// Mongo Context (Singleton)
builder.Services.AddSingleton<MongoDbContext>();

// ===== DI: Repository + Service   (Room) =====
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IRoomService, RoomService>();

// ===== DI: Repository + Service (Service) =====

builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IEventService, EventService.Services.EventService>();

// ===== File Storage (uploads/images) =====
builder.Services.AddSingleton<IFileStorage, LocalFileStorage>();
builder.Services.AddHealthChecks();

builder.Services.AddHealthChecks();
builder.Services.AddConsul(builder.Configuration);

var app = builder.Build();
app.MapHealthChecks("/health");

app.UseConsulRegistration();
// Swagger (dev)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // Si tu as aussi Swagger UI via un autre package, tu peux l'ajouter ici.
}

// Middlewares
app.UseHttpsRedirection();

// IMPORTANT: pour servir les fichiers dans wwwroot (uploads/images)
app.UseStaticFiles();

app.MapControllers();

app.Run();