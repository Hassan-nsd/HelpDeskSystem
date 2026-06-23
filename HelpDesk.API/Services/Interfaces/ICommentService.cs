using HelpDesk.API.DTO;
using HelpDesk.API.Models;

namespace HelpDesk.API.Services.Interfaces
{
     public interface ICommentService
     {
          Task<IEnumerable<TicketCommentDto>> GetComments(int ticketId);

          Task<bool> AddComment(CreateCommentDto dto, int userId);

          Task<TicketComment?> UpdateComment(
              int id,
              UpdateCommentDto dto,
              int userId);

          Task<bool> DeleteComment(int id);
     }
}