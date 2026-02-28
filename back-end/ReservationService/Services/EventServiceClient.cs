using System.Net;

namespace ReservationService.Services;

public class EventServiceClient
{
    private readonly HttpClient _http;

    public EventServiceClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<bool> EventExistsAsync(string eventId)
    {
        var response = await _http.GetAsync($"/api/events/{eventId}");
        return response.IsSuccessStatusCode;
    }
    
    public async Task<int?> GetEventCapacityAsync(string eventId)
    {
        // Si tu as ajouté /capacity dans EventService :
        var response = await _http.GetAsync($"/api/events/{eventId}/capacity");

        if (response.StatusCode == HttpStatusCode.NotFound) return null;
        if (!response.IsSuccessStatusCode) return null;

        var data = await response.Content.ReadFromJsonAsync<CapacityResponse>();
        return data?.Capacity;
    }

    private class CapacityResponse
    {
        public string EventId { get; set; } = null!;
        public int Capacity { get; set; }
    }
}