using HelpDesk.API.Models;

namespace HelpDesk.API.Services.Interfaces
{
     public interface IAuthService
     {
          object? Login(LoginModel model);
     }
}