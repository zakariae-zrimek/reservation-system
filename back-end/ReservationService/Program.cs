using ReservationService.Services;
using ReservationService.Settings;
using Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// MongoDB settings
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDb"));

// Repositories
builder.Services.AddSingleton<ReservationRepository>();

// HttpClient pour appeler EventService
builder.Services.AddHttpClient<EventServiceClient>(client =>
{
    var baseUrl = builder.Configuration["Services:EventServiceBaseUrl"];
    client.BaseAddress = new Uri(baseUrl!);
});



builder.Services.AddHealthChecks();
builder.Services.AddConsul(builder.Configuration);

var app = builder.Build();
app.MapHealthChecks("/health");

app.UseConsulRegistration();



app.UseHttpsRedirection();

app.MapControllers();

app.Run();