namespace ReservationService.Dtos;

public class ReservationResponse
{
    public string Id { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string EventId { get; set; } = null!;
    public int NumberOfSeats { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}