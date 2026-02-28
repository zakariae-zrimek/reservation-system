using Neo4j.Driver;
using UserInterestService.Settings;
using UserInterestService.Services;
using Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Lire config Neo4j
builder.Services.Configure<Neo4jSettings>(
    builder.Configuration.GetSection("Neo4j")
);

// Enregistrer le driver Neo4j (singleton)
builder.Services.AddSingleton<IDriver>(_ =>
{
    var neo = builder.Configuration.GetSection("Neo4j");
    var uri = neo["Uri"]!;
    var username = neo["Username"]!;
    var password = neo["Password"]!;
    return GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
});


builder.Services.AddSingleton<InterestService>();

builder.Services.AddHealthChecks();
builder.Services.AddConsul(builder.Configuration);

var app = builder.Build();
app.MapHealthChecks("/health");

app.UseConsulRegistration();


app.UseHttpsRedirection();
app.MapControllers();
app.Run();