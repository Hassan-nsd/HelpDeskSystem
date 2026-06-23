using HelpDesk.API.Data;
using HelpDesk.API.DTO;
using HelpDesk.API.Models;
using HelpDesk.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.API.Services.Implementations
{
     public class CommentService : ICommentService
     {
          private readonly AppDbContext _context;

          public CommentService(AppDbContext context)
          {
               _context = context;
          }

          public async Task<IEnumerable<TicketCommentDto>>GetComments(int ticketId)
          {
               return await _context.TicketComments
                   .Include(c => c.User)
                   .Where(c => c.TicketId == ticketId)
                   .OrderBy(c => c.CreatedAt)
                   .Select(c => new TicketCommentDto
                   {
                        Id = c.Id,
                        TicketId = c.TicketId,
                        UserId = c.UserId,
                        UserName = c.User!.FullName,
                        Comment = c.Comment,
                        CreatedAt = c.CreatedAt
                   })
                   .ToListAsync();
          }

          public async Task<bool> AddComment(
            CreateCommentDto dto,
            int userId)
          {
               var comment = new TicketComment
               {
                    TicketId = dto.TicketId,
                    UserId = userId,
                    Comment = dto.Comment,
                    CreatedAt = DateTime.UtcNow
               };

               _context.TicketComments.Add(comment);

               var ticket = await _context.Tickets
                   .FirstOrDefaultAsync(t => t.Id == dto.TicketId);

               if (ticket != null)
               {
                    if (ticket.CreatedBy != userId)
                    {
                         _context.Notifications.Add(new Notification
                         {
                              UserId = ticket.CreatedBy,
                              TicketId = ticket.Id,
                              Message =
                                 $"A new comment was added to ticket {ticket.ReferenceNumber}.",
                              IsRead = false,
                              CreatedAt = DateTime.UtcNow
                         });
                    }

                    if (ticket.AssignedTo.HasValue &&
                        ticket.AssignedTo.Value != userId)
                    {
                         _context.Notifications.Add(new Notification
                         {
                              UserId = ticket.AssignedTo.Value,
                              TicketId = ticket.Id,
                              Message =
                                 $"A new comment was added to ticket {ticket.ReferenceNumber}.",
                              IsRead = false,
                              CreatedAt = DateTime.UtcNow
                         });
                    }
               }

               await _context.SaveChangesAsync();

               return true;
          }

          public async Task<TicketComment?> UpdateComment(int id, UpdateCommentDto dto, int userId)
          {
               var comment =
                   await _context.TicketComments.FindAsync(id);

               if (comment == null)
                    return null;

               if (comment.UserId != userId)
                    return null;

               comment.Comment = dto.Comment;

               await _context.SaveChangesAsync();

               return comment;
          }

          public async Task<bool> DeleteComment(int id)
          {
               var comment =
                   await _context.TicketComments.FindAsync(id);

               if (comment == null)
                    return false;

               _context.TicketComments.Remove(comment);

               await _context.SaveChangesAsync();

               return true;
          }
     }
}
