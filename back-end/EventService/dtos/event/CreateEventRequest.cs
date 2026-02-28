namespace EventService.dtos;

public class CreateEventRequest
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    
    public int Capacity { get; set; }
    public string RoomId { get; set; } = null!;
}