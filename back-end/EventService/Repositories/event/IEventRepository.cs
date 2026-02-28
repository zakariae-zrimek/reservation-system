using EventService.Models;

namespace EventService.Repositories;

public interface IEventRepository
    {
        Task<List<Event>> GetAllAsync();
        Task<Event?> GetByIdAsync(string id);
        Task<Event> CreateAsync(Event ev);
        Task<bool> UpdateAsync(string id, Event ev);
        Task<bool> DeleteAsync(string id);
    }