using Microsoft.AspNetCore.Http;

namespace EventService.DTOs;

public class UpdateRoomRequest
{
    public string Name { get; set; } = null!;
    public int Capacity { get; set; }
    public string? Location { get; set; }
    public string? Type { get; set; }

    // Image optionnelle (si tu veux remplacer)
    public IFormFile? Image { get; set; }
}