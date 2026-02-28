using Microsoft.AspNetCore.Http;

namespace EventService.Services;

public interface IFileStorage
{
    Task<string?> SaveImageAsync(IFormFile? file, CancellationToken ct = default);
}