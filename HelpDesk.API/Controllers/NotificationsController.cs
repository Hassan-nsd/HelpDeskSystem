using HelpDesk.API.Data;
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
          private readonly AppDbContext _context;

          public NotificationsController(AppDbContext context)
          {
               _context = context;
          }

          [HttpGet]
          public async Task<IActionResult> GetNotifications()
          {
               var userId = int.Parse(
                   User.FindFirst("userId")!.Value
               );

               var notifications = await _context.Notifications
                   .Where(n => n.UserId == userId)
                   .OrderByDescending(n => n.CreatedAt)
                   .ToListAsync();

               return Ok(notifications);
          }

          [HttpPut("{id}/read")]
          public async Task<IActionResult> MarkAsRead(int id)
          {
               var notification =
                   await _context.Notifications.FindAsync(id);

               if (notification == null)
                    return NotFound();

               notification.IsRead = true;

               await _context.SaveChangesAsync();

               return Ok();
          }

     }
}