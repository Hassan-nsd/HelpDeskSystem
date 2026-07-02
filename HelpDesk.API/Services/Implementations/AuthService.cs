using HelpDesk.API.Data;
using HelpDesk.API.Models;
using HelpDesk.API.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HelpDesk.API.Services.Implementations
{
     public class AuthService : IAuthService
     {
          private readonly AppDbContext _context;
          private readonly IConfiguration _configuration;

          public AuthService(
              AppDbContext context,
              IConfiguration configuration)
          {
               _context = context;
               _configuration = configuration;
          }

          public object? Login(LoginModel model)
          {
               var user = _context.Users
                   .FirstOrDefault(u => u.Email == model.Email);

               if (user == null || user.Password != model.Password)
               {
                    return null;
               }

               var token = GenerateJwtToken(user);

               return new
               {
                    message = "Login successful",
                    token,
                    user = new
                    {
                         user.Id,
                         user.FullName,
                         user.Email,
                         user.RoleId
                    }
               };
          }

          private string GenerateJwtToken(User user)
          {
               var roleName = GetRoleName(user.RoleId);

               var claims = new[]
               {
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, roleName),
                new Claim("roleId", user.RoleId.ToString()),
                new Claim("userId", user.Id.ToString())
            };

               var key = new SymmetricSecurityKey(
                   Encoding.UTF8.GetBytes(
                       _configuration["Jwt:Key"]!)
               );

               var credentials = new SigningCredentials(
                   key,
                   SecurityAlgorithms.HmacSha256);

               var token = new JwtSecurityToken(
                   issuer: _configuration["Jwt:Issuer"],
                   audience: _configuration["Jwt:Audience"],
                   claims: claims,
                   expires: DateTime.UtcNow.AddHours(2),
                   signingCredentials: credentials
               );

               return new JwtSecurityTokenHandler()
                   .WriteToken(token);
          }

          private string GetRoleName(int roleId)
          {
               return roleId switch
               {
                    1 => "Admin",
                    2 => "Employee",
                    3 => "Support Agent",
                    4 => "Manager",
                    _ => "User"
               };
          }

        public async Task<bool> ChangePassword(
            int userId,
            string currentPassword,
            string newPassword)
        {
            var user =
                await _context.Users.FindAsync(userId);

            if (user == null)
                return false;

            if (user.Password != currentPassword)
                return false;

            user.Password = newPassword;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}