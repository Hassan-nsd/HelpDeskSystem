using HelpDesk.API.Models;

namespace HelpDesk.API.Services.Interfaces
{
     public interface INotificationService
     {
          Task<IEnumerable<Notification>> GetNotifications(
              int userId);

          Task<bool> MarkAsRead(int id);
     }
}