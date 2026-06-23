using HelpDesk.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

     }
}