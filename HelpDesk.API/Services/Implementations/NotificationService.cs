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

        public async Task CreatePasswordHelpRequest(string email)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                throw new Exception("User not found");

            var admins = await _context.Users
                .Where(u => u.RoleId == 1)
                .ToListAsync();

            foreach (var admin in admins)
            {
                _context.Notifications.Add(
                    new Notification
                    {
                        UserId = admin.Id,
                        TargetUserId = user.Id,
                        Message = $"{user.Email} requested password assistance",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    });
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> ResetPassword(
            int userId,
            string password)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                throw new Exception("User not found");

            user.Password = password;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
