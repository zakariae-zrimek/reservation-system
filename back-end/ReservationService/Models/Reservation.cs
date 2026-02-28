using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ReservationService.Models;

public class Reservation
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("userId")]
    public string UserId { get; set; } = null!;

    [BsonElement("eventId")]
    public string EventId { get; set; } = null!;

    [BsonElement("numberOfSeats")]
    public int NumberOfSeats { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = "confirmed"; // confirmed / cancelled

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}