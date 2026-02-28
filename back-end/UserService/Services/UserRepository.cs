using Microsoft.Extensions.Options;
using MongoDB.Driver;
using UserService.Models;
using UserService.Settings;

namespace UserService.Services;

public class UserRepository
{
    private readonly IMongoCollection<User> _users;

    public UserRepository(IOptions<MongoDbSettings> mongoSettings)
    {
        var settings = mongoSettings.Value;
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _users = database.GetCollection<User>(settings.UsersCollection);
    }

    public async Task<User?> GetByEmailAsync(string email)
        => await _users.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task<User?> GetByIdAsync(string id)
        => await _users.Find(u => u.Id == id).FirstOrDefaultAsync();

    public async Task<List<User>> GetAllAsync()
        => await _users.Find(_ => true).ToListAsync();

    public async Task CreateAsync(User user)
        => await _users.InsertOneAsync(user);
}