using Microsoft.AspNetCore.Mvc;
using ReservationService.Dtos;
using ReservationService.Models;
using ReservationService.Services;

namespace ReservationService.Controllers;

[ApiController]
[Route("api/reservations")]
public class ReservationsController : ControllerBase
{
    private readonly ReservationRepository _repo;
    private readonly EventServiceClient _eventClient;

    public ReservationsController(ReservationRepository repo, EventServiceClient eventClient)
    {
        _repo = repo;
        _eventClient = eventClient;
    }
    
    [HttpGet("test-event/{eventId}")]
    public async Task<IActionResult> TestEvent(string eventId)
    {
        var exists = await _eventClient.EventExistsAsync(eventId);

        return Ok(new
        {
            eventId,
            exists
        });
    }

    // POST api/reservations
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReservationRequest request)
    {
        // ✅ userId vient de la Gateway
        var userId = Request.Headers["X-User-Id"].ToString();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "UserId manquant (Gateway)." });

        if (request.NumberOfSeats <= 0)
            return BadRequest(new { message = "NumberOfSeats doit être > 0." });

        // 1) Vérifier capacity
        var capacity = await _eventClient.GetEventCapacityAsync(request.EventId);
        if (capacity == null)
            return BadRequest(new { message = "EventId invalide (event introuvable)." });

        var taken = await _repo.GetConfirmedSeatsByEventAsync(request.EventId);
        var remaining = capacity.Value - taken;

        if (request.NumberOfSeats > remaining)
        {
            return BadRequest(new
            {
                message = "Event complet ou pas assez de places.",
                capacity = capacity.Value,
                taken,
                remaining,
                requested = request.NumberOfSeats
            });
        }

        // (optionnel) Event exists check (tu peux le supprimer car capacity déjà le vérifie)
        var exists = await _eventClient.EventExistsAsync(request.EventId);
        if (!exists)
            return BadRequest(new { message = "EventId invalide (event introuvable)." });

        var reservation = new Reservation
        {
            UserId = userId,               // ✅ depuis header
            EventId = request.EventId,
            NumberOfSeats = request.NumberOfSeats,
            Status = "confirmed",
            CreatedAt = DateTime.UtcNow
        };

        await _repo.CreateAsync(reservation);

        return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, ToResponse(reservation));
    }

    // GET api/reservations/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var r = await _repo.GetByIdAsync(id);
        if (r == null) return NotFound();

        return Ok(ToResponse(r));
    }

    // GET api/reservations/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(string userId)
    {
        var list = await _repo.GetByUserIdAsync(userId);
        return Ok(list.Select(ToResponse));
    }

    // GET api/reservations/event/{eventId}
    [HttpGet("event/{eventId}")]
    public async Task<IActionResult> GetByEvent(string eventId)
    {
        var list = await _repo.GetByEventIdAsync(eventId);
        return Ok(list.Select(ToResponse));
    }

    // PATCH api/reservations/{id}/cancel
    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(string id)
    {
        var r = await _repo.GetByIdAsync(id);
        if (r == null) return NotFound();

        if (r.Status == "cancelled")
            return Ok(new { message = "Réservation déjà annulée." });

        await _repo.UpdateStatusAsync(id, "cancelled");
        return Ok(new { message = "Réservation annulée." });
    }

    // DELETE api/reservations/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var r = await _repo.GetByIdAsync(id);
        if (r == null) return NotFound();

        await _repo.DeleteAsync(id);
        return NoContent();
    }

    private static ReservationResponse ToResponse(Reservation r) => new()
    {
        Id = r.Id!,
        UserId = r.UserId,
        EventId = r.EventId,
        NumberOfSeats = r.NumberOfSeats,
        Status = r.Status,
        CreatedAt = r.CreatedAt
    };
}