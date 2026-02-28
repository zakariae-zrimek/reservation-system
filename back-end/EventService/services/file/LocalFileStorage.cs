using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace EventService.Services;

public class LocalFileStorage : IFileStorage
{
    private readonly IWebHostEnvironment _env;

    public LocalFileStorage(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string?> SaveImageAsync(IFormFile? file, CancellationToken ct = default)
    {
        if (file is null || file.Length == 0) return null;

        // (Optionnel) vérifier le type
        var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowed.Contains(file.ContentType))
            throw new InvalidOperationException("Format image non supporté (jpeg/png/webp).");

        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "images");
        Directory.CreateDirectory(uploadsDir);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"room_{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(uploadsDir, fileName);

        using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream, ct);

        // Chemin public
        return $"/uploads/images/{fileName}";
    }
}