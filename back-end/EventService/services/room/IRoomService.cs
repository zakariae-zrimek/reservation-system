using EventService.Models;

namespace EventService.Services;

public interface IRoomService
{
    Task<List<Room>> GetAllAsync();
    Task<Room?> GetByIdAsync(string id);
    Task<Room> CreateAsync(Room room);

    Task<bool> UpdateAsync(string id, Room room);
    Task<bool> DeleteAsync(string id);
    
    Task<List<Room>> GetByIdsAsync(List<string> ids); // ✅ NEW

    
}