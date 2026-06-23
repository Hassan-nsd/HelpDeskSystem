using HelpDesk.API.DTOs;
using HelpDesk.API.Models;

namespace HelpDesk.API.Services.Interfaces
{
     public interface ITicketService
     {
          Task<IEnumerable<TicketDto>> GetTickets(string role, int userId);

          Task<TicketDto?> GetTicket(int id);

          Task<Ticket> CreateTicket(CreateTicketDto dto, int userId);

          Task<Ticket?> UpdateTicket(int id, Ticket updated);

          Task<IEnumerable<AssignableUserDto>> GetAssignableUsers();

          Task<(bool Success, string Message)> AssignTicket(int id, AssignTicketDto dto);

          Task<(bool Success, string Message)> UpdateStatus(
              int id,
              string status,
              string role);
     }
}