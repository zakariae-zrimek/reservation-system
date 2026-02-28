using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserService.Dtos;
using UserService.Models;
using UserService.Services;

namespace UserService.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserRepository _users;
    private readonly IConfiguration _config;

    public AuthController(UserRepository users, IConfiguration config)
    {
        _users = users;
        _config = config;
    }

    
    // POST: api/auth/introspect
    [HttpPost("introspect")]
    public IActionResult Introspect([FromBody] IntrospectRequest request)
    {
        var jwt = _config.GetSection("Jwt");
        var key = jwt["Key"]!;
        var issuer = jwt["Issuer"]!;
        var audience = jwt["Audience"]!;

        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            var principal = tokenHandler.ValidateToken(request.Token, validationParameters, out _);

            // Récupérer userId depuis "sub"
            var userId =
                principal.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;

            var role =
                principal.Claims.FirstOrDefault(c => c.Type == "role")?.Value
                ?? principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value; // ✅ fallback
            // Ton role est dans claim "role" (tu l’as déjà changé ✅)
            return Ok(new
            {
                valid = true,
                userId,
                role
            });
        }
        catch
        {
            return Ok(new { valid = false });
        }
    }
    
    
    
    
    
    // POST: api/auth/validate
    [HttpPost("validate")]
    public IActionResult ValidateToken([FromBody] ValidateTokenRequest request)
    {
        var jwt = _config.GetSection("Jwt");
        var key = jwt["Key"]!;
        var issuer = jwt["Issuer"]!;
        var audience = jwt["Audience"]!;

        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            tokenHandler.ValidateToken(request.Token, validationParameters, out _);
            return Ok(true);
        }
        catch
        {
            return Ok(false);
        }
    }
// POST: api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        request.Email = request.Email.Trim().ToLowerInvariant();

        var existing = await _users.GetByEmailAsync(request.Email);
        if (existing != null)
            return Conflict(new { message = "Email déjà utilisé." });

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = request.Email,
            Role = "user" ,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        };

        await _users.CreateAsync(user);

        var response = new UserResponse
        {
            Id = user.Id!,
            Name = user.Name,
            Email = user.Email,
            Role  =user.Role,
            CreatedAt = user.CreatedAt
        };

        return Created("", response);
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        request.Email = request.Email.Trim().ToLowerInvariant();

        var user = await _users.GetByEmailAsync(request.Email);
        if (user == null)
            return Unauthorized(new { message = "Email ou mot de passe incorrect." });

        var ok = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!ok)
            return Unauthorized(new { message = "Email ou mot de passe incorrect." });

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            token,
            user = new UserResponse
            {
                Id = user.Id!,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            }
        });
    }

    private string GenerateJwtToken(User user)
    {
        var jwt = _config.GetSection("Jwt");
        var key = jwt["Key"]!;
        var issuer = jwt["Issuer"]!;
        var audience = jwt["Audience"]!;
        var expiresMinutes = int.Parse(jwt["ExpiresMinutes"]!);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id!),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("role", user.Role),
            new Claim("name", user.Name) ,
            new Claim("userId" , user.Id)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}