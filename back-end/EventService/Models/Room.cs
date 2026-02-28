using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EventService.Models;

[BsonIgnoreExtraElements] // évite les erreurs si Mongo a des champs en plus
public class Room
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("capacity")]
    public int Capacity { get; set; }

    [BsonElement("location")]
    public string? Location { get; set; }

    // [BsonElement("type")]
    // public string? Type { get; set; }

    [BsonElement("imageUrl")]
    public string? ImageUrl { get; set; }
}