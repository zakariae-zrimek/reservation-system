using EventService.config;
using EventService.Models;
using MongoDB.Driver;

namespace EventService.Repositories;

public class RoomRepository : IRoomRepository
{
    private readonly IMongoCollection<Room> _rooms;

    public RoomRepository(MongoDbContext context)
    {
        _rooms = context.Rooms;
    }

    public async Task<List<Room>> GetAllAsync() =>
        await _rooms.Find(_ => true).ToListAsync();

    public async Task<Room?> GetByIdAsync(string id) =>
        await _rooms.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task<Room> CreateAsync(Room room)
    {
        await _rooms.InsertOneAsync(room);
        return room;
    }

    public async Task<bool> UpdateAsync(string id, Room room)
    {
        room.Id = id;
        var result = await _rooms.ReplaceOneAsync(r => r.Id == id, room);
        return result.MatchedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _rooms.DeleteOneAsync(r => r.Id == id);
        return result.DeletedCount > 0;
    }
    
    public async Task<List<Room>> GetByIdsAsync(List<string> ids)
    {
        if (ids == null || ids.Count == 0) return new();
        return await _rooms.Find(r => ids.Contains(r.Id)).ToListAsync(); // ✅ $in
    }
}