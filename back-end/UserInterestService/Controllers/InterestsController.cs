using Microsoft.AspNetCore.Mvc;
using UserInterestService.Dtos;
using UserInterestService.Services;

namespace UserInterestService.Controllers;

[ApiController]
[Route("api/interests")]
public class InterestsController : ControllerBase
{
    private readonly InterestService _service;

    public InterestsController(InterestService service)
    {
        _service = service;
    }
    
    
    // GET api/interests/users/{userId}/recommendations
    [HttpGet("users/{userId}/recommendations")]
    public async Task<IActionResult> GetRecommendations(string userId)
    {
        var list = await _service.GetRecommendationsAsync(userId);
        return Ok(list);
    }

    // POST api/interests
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] InterestRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.EventId))
            return BadRequest(new { message = "userId et eventId sont obligatoires." });

        await _service.AddInterestAsync(request.UserId, request.EventId);
        return Ok(new { message = "Interest ajouté." });
    }

    // DELETE api/interests
    [HttpDelete]
    public async Task<IActionResult> Remove([FromBody] InterestRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.EventId))
            return BadRequest(new { message = "userId et eventId sont obligatoires." });

        await _service.RemoveInterestAsync(request.UserId, request.EventId);
        return Ok(new { message = "Interest supprimé." });
    }

    // GET api/interests/users/{userId}
    [HttpGet("users/{userId}")]
    public async Task<IActionResult> GetUserInterests(string userId)
    {
        var list = await _service.GetUserInterestsAsync(userId);
        return Ok(list);
    }

    // GET api/interests/events/{eventId}/users
    [HttpGet("events/{eventId}/users")]
    public async Task<IActionResult> GetEventUsers(string eventId)
    {
        var list = await _service.GetEventInterestedUsersAsync(eventId);
        return Ok(list);
    }
}