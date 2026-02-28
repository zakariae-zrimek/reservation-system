using EventService.Models;

namespace EventService.dtos;

public class EventWithRoomDto
{
    public string? Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime Date { get; set; }

    public string RoomId { get; set; } = null!;
    public Room? Room { get; set; }   // détails room
}