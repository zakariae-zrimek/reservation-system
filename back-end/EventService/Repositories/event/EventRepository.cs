using EventService.config;
using EventService.Models;
using MongoDB.Driver;

namespace EventService.Repositories;

public class EventRepository : IEventRepository
{
    private readonly IMongoCollection<Event> _events;

    public EventRepository(MongoDbContext context)
    {
        _events = context.Events;
    }

    public async Task<List<Event>> GetAllAsync() =>
        await _events.Find(_ => true).ToListAsync();

    public async Task<Event?> GetByIdAsync(string id) =>
        await _events.Find(e => e.Id == id).FirstOrDefaultAsync();

    public async Task<Event> CreateAsync(Event ev)
    {
        await _events.InsertOneAsync(ev);
        return ev;
    }

    public async Task<bool> UpdateAsync(string id, Event ev)
    {
        ev.Id = id;
        var result = await _events.ReplaceOneAsync(e => e.Id == id, ev);
        return result.MatchedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _events.DeleteOneAsync(e => e.Id == id);
        return result.DeletedCount > 0;
    }
}