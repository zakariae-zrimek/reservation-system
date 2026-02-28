using EventService.DTOs;
using EventService.Models;
using EventService.Services;
using Microsoft.AspNetCore.Mvc;

namespace EventService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _service;
    private readonly IFileStorage _fileStorage;

    public RoomsController(IRoomService service, IFileStorage fileStorage)
    {
        _service = service;
        _fileStorage = fileStorage;
    }

    // GET /api/rooms
    [HttpGet]
    public async Task<ActionResult<List<Room>>> GetAll()
        => await _service.GetAllAsync();

    // GET /api/rooms/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Room>> GetById(string id)
    {
        var room = await _service.GetByIdAsync(id);
        if (room is null) return NotFound();
        return room;
    }

    // POST /api/rooms (multipart/form-data)
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<Room>> Create([FromForm] CreateRoomRequest req, CancellationToken ct)
    {
        var imageUrl = await _fileStorage.SaveImageAsync(req.Image, ct);

        var room = new Room
        {
            Name = req.Name,
            Capacity = req.Capacity,
            Location = req.Location,
            // Type = req.Type,
            ImageUrl = imageUrl
        };

        var created = await _service.CreateAsync(room);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/rooms/{id} (multipart/form-data) -> update + image optionnelle
    [HttpPut("{id}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(string id, [FromForm] UpdateRoomRequest req, CancellationToken ct)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        // si une nouvelle image est envoyée, on la sauvegarde et on remplace l'URL
        var newImageUrl = await _fileStorage.SaveImageAsync(req.Image, ct);

        existing.Name = req.Name;
        existing.Capacity = req.Capacity;
        existing.Location = req.Location;
        // existing.Type = req.Type;

        if (!string.IsNullOrWhiteSpace(newImageUrl))
            existing.ImageUrl = newImageUrl;

        var ok = await _service.UpdateAsync(id, existing);
        if (!ok) return NotFound();

        return NoContent();
    }

    // DELETE /api/rooms/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}