using HelpDesk.API.Data;
using HelpDesk.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.API.Services.Implementations
{
     public class NotificationService : INotificationService
     {
          private readonly AppDbContext _context;

          public NotificationService(AppDbContext context)
          {
               _context = context;
          }

          public async Task<IEnumerable<Notification>>GetNotifications(int userId)
          {
               return await _context.Notifications
                   .Where(n => n.UserId == userId)
                   .OrderByDescending(n => n.CreatedAt)
                   .ToListAsync();
          }

          public async Task<bool> MarkAsRead(int id)
          {
               var notification =
                   await _context.Notifications.FindAsync(id);

               if (notification == null)
                    return false;

               notification.IsRead = true;

               await _context.SaveChangesAsync();

               return true;
          }
     }
}
