using HelpDesk.API.Data;
using HelpDesk.API.DTO;
using HelpDesk.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HelpDesk.API.Controllers
{
     [Route("api/[controller]")]
     [ApiController]
     [Authorize]
     public class CommentsController : ControllerBase
     {
          private readonly AppDbContext _context;

          public CommentsController(AppDbContext context)
          {
               _context = context;
          }

          [HttpGet("{ticketId}")]
          public async Task<ActionResult<IEnumerable<TicketCommentDto>>> GetComments(int ticketId)
          {
               var comments = await _context.TicketComments
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

               return Ok(comments);
          }

          [HttpPost]
          public async Task<IActionResult> AddComment(CreateCommentDto dto)
          {
               var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId");

               if (userIdClaim == null)
               {
                    return Unauthorized();
               }

               var comment = new TicketComment
               {
                    TicketId = dto.TicketId,
                    UserId = int.Parse(userIdClaim.Value),
                    Comment = dto.Comment,
                    CreatedAt = DateTime.UtcNow
               };

               _context.TicketComments.Add(comment);

               var ticket = await _context.Tickets
    .FirstOrDefaultAsync(t => t.Id == dto.TicketId);

               if (ticket != null)
               {
                    if (ticket.CreatedBy != comment.UserId)
                    {
                         _context.Notifications.Add(new Notification
                         {
                              UserId = ticket.CreatedBy,
                              TicketId = ticket.Id,
                              Message = $"A new comment was added to ticket {ticket.ReferenceNumber}.",
                              IsRead = false,
                              CreatedAt = DateTime.UtcNow
                         });
                    }

                    if (ticket.AssignedTo.HasValue &&
                        ticket.AssignedTo.Value != comment.UserId)
                    {
                         _context.Notifications.Add(new Notification
                         {
                              UserId = ticket.AssignedTo.Value,
                              TicketId = ticket.Id,
                              Message = $"A new comment was added to ticket {ticket.ReferenceNumber}.",
                              IsRead = false,
                              CreatedAt = DateTime.UtcNow
                         });
                    }
               }

               await _context.SaveChangesAsync();

               return Ok();
          }

          [HttpDelete("{id}")]
          public async Task<IActionResult> DeleteComment(int id)
          {
               var comment = await _context.TicketComments.FindAsync(id);

               if (comment == null)
               {
                    return NotFound();
               }

               _context.TicketComments.Remove(comment);

               await _context.SaveChangesAsync();

               return Ok();
          }

          [HttpPut("{id}")]
          public async Task<IActionResult> UpdateComment(int id, UpdateCommentDto dto)
          {
               var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId");

               if (userIdClaim == null)
               {
                    return Unauthorized();
               }

               var comment = await _context.TicketComments.FindAsync(id);

               if (comment == null)
               {
                    return NotFound();
               }

               if (comment.UserId != int.Parse(userIdClaim.Value))
               {
                    return Forbid();
               }

               comment.Comment = dto.Comment;

               await _context.SaveChangesAsync();

               return Ok(comment);
          }
     }
}