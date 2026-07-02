using HelpDesk.API.Models;

namespace HelpDesk.API.Services.Interfaces
{
     public interface IAuthService
     {
          object? Login(LoginModel model);

        Task<bool> ChangePassword(
            int userId,
            string currentPassword,
            string newPassword
            );
    }       
}
  