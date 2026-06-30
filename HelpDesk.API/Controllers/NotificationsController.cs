using HelpDesk.API.DTOs;
using HelpDesk.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.API.Controllers
{
     [ApiController]
     [Route("api/[controller]")]
     [Authorize]
     public class NotificationsController : ControllerBase
     {
          private readonly INotificationService
            _notificationService;

          public NotificationsController(INotificationService notificationService)
          {
               _notificationService = notificationService;
          }

          [HttpGet]
          public async Task<IActionResult> GetNotifications()
          {
               var userId = int.Parse(
                   User.FindFirst("userId")!.Value
               );

               var notifications =
                await _notificationService.GetNotifications(userId);

               return Ok(notifications);
          }

          [HttpPut("{id}/read")]
          public async Task<IActionResult> MarkAsRead(int id)
          {
               var success =
                await _notificationService.MarkAsRead(id);

               if (!success)
                    return NotFound();

               return Ok();
          }

        [AllowAnonymous]
        [HttpPost("contact-admin")]
        public async Task<IActionResult> ContactAdmin([FromBody] ContactAdminDto dto)
        {
            await _notificationService
                .CreatePasswordHelpRequest(dto.Email);

            return Ok(new
            {
                message = "Administrator notified"
            });
        }

        [HttpPut("reset-password/{userId}")]
        public async Task<IActionResult> ResetPassword(
             int userId,
            [FromBody] ResetPasswordDto dto)
        {
            var success =
                await _notificationService
                    .ResetPassword(userId, dto.NewPassword);

            if (!success)
                return NotFound();

            return Ok(new
            {
                message = "Password Changed!"
            });
        }   

    }


}

public class ContactAdminDto
{
    public string Email { get; set; } = "";
}