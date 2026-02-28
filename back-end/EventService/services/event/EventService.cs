using EventService.dtos;
using EventService.Models;
using EventService.Repositories;

namespace EventService.Services;

public class EventService : IEventService
{
    private readonly IEventRepository _eventRepo;
    private readonly IRoomRepository _roomRepo;

    public EventService(IEventRepository eventRepo, IRoomRepository roomRepo)
    {
        _eventRepo = eventRepo;
        _roomRepo = roomRepo;
    }
    public async Task<EventWithRoomDto?> GetWithRoomAsync(string id)
    {
        var ev = await _eventRepo.GetByIdAsync(id);
        if (ev is null) return null;

        var room = await _roomRepo.GetByIdAsync(ev.RoomId); // join manuel

        return new EventWithRoomDto
        {
            Id = ev.Id,
            Name = ev.Name,
            Description = ev.Description,
            Date = ev.Date,
            RoomId = ev.RoomId,
            Room = room // peut être null si Room supprimée
        };
    }
    
    public async Task<List<EventWithRoomDto>> GetAllWithRoomsAsync()
    {
        var events = await _eventRepo.GetAllAsync();
        if (events.Count == 0) return new();

        var roomIds = events
            .Select(e => e.RoomId)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        var rooms = await _roomRepo.GetByIdsAsync(roomIds);
        var roomsDict = rooms.ToDictionary(r => r.Id);

        return events.Select(e => new EventWithRoomDto
        {
            Id = e.Id,
            Name = e.Name,
            Description = e.Description,
            Date = e.Date,
            Room = (e.RoomId != null && roomsDict.TryGetValue(e.RoomId, out var room))
                ? room
                : null
        }).ToList();
    }


    public Task<List<Event>> GetAllAsync() => _eventRepo.GetAllAsync();
    public Task<Event?> GetByIdAsync(string id) => _eventRepo.GetByIdAsync(id);
    public Task<Event> CreateAsync(Event ev) => _eventRepo.CreateAsync(ev);
    public Task<bool> UpdateAsync(string id, Event ev) => _eventRepo.UpdateAsync(id, ev);
    public Task<bool> DeleteAsync(string id) => _eventRepo.DeleteAsync(id);
}