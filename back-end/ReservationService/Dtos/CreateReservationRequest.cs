namespace ReservationService.Dtos;

public class CreateReservationRequest
{
    public string EventId { get; set; } = null!;
    public int NumberOfSeats { get; set; }
}