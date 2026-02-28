namespace UserService.Dtos;

public class UserResponse
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    
    public string Role { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}