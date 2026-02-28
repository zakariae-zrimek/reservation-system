using Neo4j.Driver;

namespace UserInterestService.Services;

public class InterestService
{
    private readonly IDriver _driver;

    public InterestService(IDriver driver)
    {
        _driver = driver;
    }
    
    public async Task<List<string>> GetRecommendationsAsync(string userId)
    {
        var query = @"
MATCH (u:User {userId: $userId})-[:INTERESTED_IN]->(e:Event)<-[:INTERESTED_IN]-(other:User)-[:INTERESTED_IN]->(recommended:Event)
WHERE NOT (u)-[:INTERESTED_IN]->(recommended)
RETURN recommended.eventId AS eventId, COUNT(*) AS score
ORDER BY score DESC
";

        await using var session = _driver.AsyncSession();

        return await session.ExecuteReadAsync(async tx =>
        {
            var cursor = await tx.RunAsync(query, new { userId });
            var list = new List<string>();

            await cursor.ForEachAsync(record =>
            {
                list.Add(record["eventId"].As<string>());
            });

            return list;
        });
    }
    
    
    

    // Add interest: (User)-[:INTERESTED_IN]->(Event)
    public async Task AddInterestAsync(string userId, string eventId)
    {
        var query = @"
        MERGE (u:User {userId: $userId})
        MERGE (e:Event {eventId: $eventId})
        MERGE (u)-[:INTERESTED_IN]->(e)
        ";

        await using var session = _driver.AsyncSession();
        await session.ExecuteWriteAsync(async tx =>
        {
            await tx.RunAsync(query, new { userId, eventId });
        });
    }

    // Remove interest
    public async Task RemoveInterestAsync(string userId, string eventId)
    {
        var query = @"
MATCH (u:User {userId: $userId})-[r:INTERESTED_IN]->(e:Event {eventId: $eventId})
DELETE r
";

        await using var session = _driver.AsyncSession();
        await session.ExecuteWriteAsync(async tx =>
        {
            await tx.RunAsync(query, new { userId, eventId });
        });
    }

    // List eventIds interested by user
    public async Task<List<string>> GetUserInterestsAsync(string userId)
    {
        var query = @"
        MATCH (u:User {userId: $userId})-[:INTERESTED_IN]->(e:Event)
        RETURN e.eventId AS eventId
        ORDER BY eventId
        ";

        await using var session = _driver.AsyncSession();
        var result = await session.ExecuteReadAsync(async tx =>
        {
            var cursor = await tx.RunAsync(query, new { userId });
            var list = new List<string>();

            await cursor.ForEachAsync(record =>
            {
                list.Add(record["eventId"].As<string>());
            });

            return list;
        });

        return result;
    }

    // List userIds interested in event
    public async Task<List<string>> GetEventInterestedUsersAsync(string eventId)
    {
        var query = @"
MATCH (u:User)-[:INTERESTED_IN]->(e:Event {eventId: $eventId})
RETURN u.userId AS userId
ORDER BY userId
";

        await using var session = _driver.AsyncSession();
        var result = await session.ExecuteReadAsync(async tx =>
        {
            var cursor = await tx.RunAsync(query, new { eventId });
            var list = new List<string>();

            await cursor.ForEachAsync(record =>
            {
                list.Add(record["userId"].As<string>());
            });

            return list;
        });

        return result;
    }
}