using EventService.dtos;
using EventService.Models;

namespace EventService.Services;

public interface IEventService
{
    Task<List<Event>> GetAllAsync();
    Task<Event?> GetByIdAsync(string id);
    Task<Event> CreateAsync(Event ev);
    Task<bool> UpdateAsync(string id, Event ev);
    Task<bool> DeleteAsync(string id);
    // With Room
    Task<EventWithRoomDto?> GetWithRoomAsync(string id);
    Task<List<EventWithRoomDto>> GetAllWithRoomsAsync();
}