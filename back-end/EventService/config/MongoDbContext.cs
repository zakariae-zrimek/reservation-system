using Microsoft.Extensions.Options;
using MongoDB.Driver;
using EventService.Models;

namespace EventService.config;

public class MongoDbContext
{
    public IMongoDatabase Database { get; }

    public MongoDbContext(IOptions<MongoDbSettings> options)
    {
        var settings = options.Value;
        var client = new MongoClient(settings.ConnectionString);
        Database = client.GetDatabase(settings.Database);
    }

    public IMongoCollection<Room> Rooms => Database.GetCollection<Room>("Rooms");
    public IMongoCollection<Event> Events => Database.GetCollection<Event>("Events");
}