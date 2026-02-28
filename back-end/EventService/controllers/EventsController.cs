using EventService.dtos;
using EventService.Models;
using EventService.Services;
using Microsoft.AspNetCore.Mvc;

namespace EventService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly IEventService _service;

    public EventsController(IEventService service)
    {
        _service = service;
    }
    
    
    [HttpGet("{id}/capacity")]
    public async Task<IActionResult> GetCapacity(string id)
    {
        var ev = await _service.GetByIdAsync(id);
        if (ev == null) return NotFound(new { message = "Event introuvable." });

        return Ok(new { eventId = ev.Id, capacity = ev.Capacity });
    }
    
    
    [HttpGet("{id}/details")]
    public async Task<ActionResult<EventWithRoomDto>> GetDetails(string id)
    {
        var result = await _service.GetWithRoomAsync(id);
        if (result is null) return NotFound();
        return Ok(result);
    }
    
    [HttpGet("details")]
    public async Task<ActionResult<List<EventWithRoomDto>>> GetAllDetails()
    {
        var results = await _service.GetAllWithRoomsAsync();
        return Ok(results);
    }

    [HttpGet]
    public async Task<ActionResult<List<Event>>> GetAll()
        => await _service.GetAllAsync();

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var ev = await _service.GetByIdAsync(id);

        if (ev == null)
            return NotFound(new { message = "Event Not Found." });

        return Ok(ev);
    }

    [HttpPost]
    public async Task<ActionResult<Event>> Create([FromBody] CreateEventRequest req)
    {
        var ev = new Event
        {
            Name = req.Name,
            Description = req.Description,
            Date = req.Date,
            Capacity = req.Capacity,
            RoomId = req.RoomId
        };

        var created = await _service.CreateAsync(ev);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateEventRequest req)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        existing.Name = req.Name;
        existing.Description = req.Description;
        existing.Capacity = req.Capacity;
        existing.Date = req.Date;
        
        existing.RoomId = req.RoomId;

        var ok = await _service.UpdateAsync(id, existing);
        if (!ok) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}