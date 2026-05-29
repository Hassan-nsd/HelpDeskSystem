using HelpDesk.API.Data;
using HelpDesk.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HelpDeskSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            AppDbContext context,
            IConfiguration configuration
        )
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public IActionResult Register(
            [FromBody] LoginModel model
        )
        {
            var existingUser =
                _context.Users.FirstOrDefault(
                    u => u.Email == model.Email
                );

            if (existingUser != null)
            {
                return BadRequest(
                    new
                    {
                        message =
                            "User already exists"
                    }
                );
            }

            var user = new User
            {
                Email = model.Email,

                Password =
                    BCrypt.Net.BCrypt.HashPassword(
                        model.Password
                    )
            };

            _context.Users.Add(user);

            _context.SaveChanges();

            return Ok(
                new
                {
                    message =
                        "User registered successfully"
                }
            );
        }

        [HttpPost("login")]
        public IActionResult Login(
            [FromBody] LoginModel model
        )
        {
            var user =
                _context.Users.FirstOrDefault(
                    u => u.Email == model.Email
                );

            if (
                user == null ||
                !BCrypt.Net.BCrypt.Verify(
                    model.Password,
                    user.Password
                )
            )
            {
                return Unauthorized(
                    new
                    {
                        message =
                            "Invalid email or password"
                    }
                );
            }

            var claims =
                new[]
                {
                    new Claim(
                        ClaimTypes.Email,
                        user.Email
                    )
                };

            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        _configuration["Jwt:Key"]!
                    )
                );

            var creds =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256
                );

            var token =
                new JwtSecurityToken(
                    issuer:
                        _configuration["Jwt:Issuer"],

                    audience:
                        _configuration["Jwt:Audience"],

                    claims:
                        claims,

                    expires:
                        DateTime.Now.AddHours(2),

                    signingCredentials:
                        creds
                );

            return Ok(
                new
                {
                    token =
                        new JwtSecurityTokenHandler()
                            .WriteToken(token)
                }
            );
        }
    }
}