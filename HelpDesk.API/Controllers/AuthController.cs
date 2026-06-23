using System.Security.Claims;
using HelpDesk.API.Models;
using HelpDesk.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
          private readonly IAuthService _authService;

          public AuthController(IAuthService authService)
          {
               _authService = authService;
          }

          [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("API is working");
        }

          [HttpPost("login")]
          public IActionResult Login([FromBody] LoginModel model)
          {
               if (model == null ||
                   string.IsNullOrWhiteSpace(model.Email) ||
                   string.IsNullOrWhiteSpace(model.Password))
               {
                    return BadRequest(new
                    {
                         message = "Email and password are required"
                    });
               }

               var result = _authService.Login(model);

               if (result == null)
               {
                    return Unauthorized(new
                    {
                         message = "Invalid email or password"
                    });
               }

               return Ok(result);
          }

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
     }
}