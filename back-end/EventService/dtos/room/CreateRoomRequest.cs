using Microsoft.AspNetCore.Http;

namespace EventService.DTOs;

public class CreateRoomRequest
{
    public string Name { get; set; } = null!;
    public int Capacity { get; set; }
    public string? Location { get; set; }
    // public string? Type { get; set; }

    // Fichier image envoyé
    public IFormFile? Image { get; set; }
}