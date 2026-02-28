using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EventService.Models;

[BsonIgnoreExtraElements]
public class Event
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("description")]
    public string? Description { get; set; }

    // Stocké en DateTime dans Mongo
    [BsonElement("date")]
    public DateTime Date { get; set; }
    
    [BsonElement("capacity")]
    public int Capacity { get; set; }

    // Référence vers Room
    [BsonElement("roomId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string RoomId { get; set; } = null!;
}