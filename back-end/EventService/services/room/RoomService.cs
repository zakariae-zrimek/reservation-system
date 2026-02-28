using EventService.Models;
using EventService.Repositories;

namespace EventService.Services;

public class RoomService : IRoomService
{
    private readonly IRoomRepository _repo;

    public RoomService(IRoomRepository repo)
    {
        _repo = repo;
    }

    public Task<List<Room>> GetAllAsync() => _repo.GetAllAsync();
    public Task<Room?> GetByIdAsync(string id) => _repo.GetByIdAsync(id);
    public Task<Room> CreateAsync(Room room) => _repo.CreateAsync(room);
    public Task<bool> UpdateAsync(string id, Room room) => _repo.UpdateAsync(id, room);
    public Task<bool> DeleteAsync(string id) => _repo.DeleteAsync(id);
    public Task<List<Room>> GetByIdsAsync(List<string> ids) => _repo.GetByIdsAsync(ids); // ✅ clean

    
}