using Microsoft.Extensions.Options;
using MongoDB.Driver;
using ReservationService.Models;
using ReservationService.Settings;
namespace ReservationService.Services;


public class ReservationRepository
{
    private readonly IMongoCollection<Reservation> _reservations;
    
    
    public async Task<int> GetConfirmedSeatsByEventAsync(string eventId)
    {
        var list = await _reservations
            .Find(r => r.EventId == eventId && r.Status == "confirmed")
            .ToListAsync();

        return list.Sum(r => r.NumberOfSeats);
    }

    public ReservationRepository(IOptions<MongoDbSettings> mongoSettings)
    {
        var settings = mongoSettings.Value;
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _reservations = database.GetCollection<Reservation>(settings.ReservationsCollection);
    }

    public async Task CreateAsync(Reservation reservation)
        => await _reservations.InsertOneAsync(reservation);

    public async Task<Reservation?> GetByIdAsync(string id)
        => await _reservations.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task<List<Reservation>> GetByUserIdAsync(string userId)
        => await _reservations.Find(r => r.UserId == userId).ToListAsync();

    public async Task<List<Reservation>> GetByEventIdAsync(string eventId)
        => await _reservations.Find(r => r.EventId == eventId).ToListAsync();

    public async Task UpdateStatusAsync(string id, string status)
        => await _reservations.UpdateOneAsync(
            r => r.Id == id,
            Builders<Reservation>.Update.Set(r => r.Status, status));

    public async Task DeleteAsync(string id)
        => await _reservations.DeleteOneAsync(r => r.Id == id);
}