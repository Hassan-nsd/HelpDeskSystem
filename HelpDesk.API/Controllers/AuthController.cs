using HelpDesk.API.Data;
using HelpDesk.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HelpDesk.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // TEST ENDPOINT
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("API is working");
        }

        // LOGIN
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            if (model == null ||
                string.IsNullOrWhiteSpace(model.Email) ||
                string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            var user = _context.Users.FirstOrDefault(u => u.Email == model.Email);

            if (user == null || user.Password != model.Password)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Login successful",
                token,

                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.RoleId
                }
            });
        }

        // PROTECTED ENDPOINT (any logged user)
        [Authorize]
        [HttpGet("profile")]
        public IActionResult Profile()
        {
            return Ok(new
            {
                message = "Protected endpoint",
                name = User.Identity?.Name,
                role = User.FindFirst(ClaimTypes.Role)?.Value
            });
        }

        // JWT GENERATION
        private string GenerateJwtToken(User user)
        {
            var roleName = GetRoleName(user.RoleId);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, roleName),
                new Claim("roleId", user.RoleId.ToString()),
                new Claim("userId", user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

          private string GetRoleName(int roleId)
          {
               return roleId switch
               {
                    1 => "Admin",
                    2 => "Employee",
                    3 => "Support Agent",
                    4 => "Manager",
                    _ => "User"
               };
          }
     }
}