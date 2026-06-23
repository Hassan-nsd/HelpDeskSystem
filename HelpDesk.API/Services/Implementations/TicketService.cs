using HelpDesk.API.Data;
using HelpDesk.API.DTOs;
using HelpDesk.API.Models;
using HelpDesk.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.API.Services.Implementations
{
     public class TicketService : ITicketService
     {
          private readonly AppDbContext _context;

          public TicketService(AppDbContext context)
          {
               _context = context;
          }

          public async Task<IEnumerable<TicketDto>> GetTickets(
              string role,
              int userId)
          {
               var query = _context.Tickets
                   .Include(t => t.Category)
                   .Include(t => t.Priority)
                   .Include(t => t.Status)
                   .Include(t => t.Creator)
                   .Include(t => t.Assignee)
                   .AsQueryable();

               if (role == "Employee")
                    query = query.Where(t => t.CreatedBy == userId);

               else if (role == "Support Agent")
                    query = query.Where(t => t.AssignedTo == userId);

               return await query
                   .Select(t => new TicketDto
                   {
                        Id = t.Id,
                        ReferenceNumber = t.ReferenceNumber,
                        Title = t.Title,
                        Description = t.Description,
                        Category = t.Category!.Name,
                        Priority = t.Priority!.Name,
                        Status = t.Status!.Name,
                        CreatedBy = t.Creator!.FullName,
                        AssignedTo = t.Assignee != null
                           ? t.Assignee.FullName
                           : null,
                        UpdatedAt = t.UpdatedAt
                   })
                   .ToListAsync();
          }

          public async Task<TicketDto?> GetTicket(int id)
          {
               return await _context.Tickets
                   .Include(t => t.Category)
                   .Include(t => t.Priority)
                   .Include(t => t.Status)
                   .Include(t => t.Creator)
                   .Include(t => t.Assignee)
                   .Where(t => t.Id == id)
                   .Select(t => new TicketDto
                   {
                        Id = t.Id,
                        ReferenceNumber = t.ReferenceNumber,
                        Title = t.Title,
                        Description = t.Description,
                        Category = t.Category!.Name,
                        Priority = t.Priority!.Name,
                        Status = t.Status!.Name,
                        CreatedBy = t.Creator!.FullName,
                        CreatedAt = t.CreatedAt,
                        AssignedTo = t.Assignee != null
                           ? t.Assignee.FullName
                           : null,
                        UpdatedAt = t.UpdatedAt
                   })
                   .FirstOrDefaultAsync();
          }

          public Task<Ticket> CreateTicket(CreateTicketDto dto, int userId)
          {
               throw new NotImplementedException();
          }

          public async Task<Ticket?> UpdateTicket(int id, Ticket updated)
          {
               var ticket = await _context.Tickets.FindAsync(id);

               if (ticket == null)
                    return null;

               ticket.Title = updated.Title;
               ticket.Description = updated.Description;
               ticket.CategoryId = updated.CategoryId;
               ticket.PriorityId = updated.PriorityId;
               ticket.StatusId = updated.StatusId;
               ticket.AssignedTo = updated.AssignedTo;
               ticket.UpdatedAt = DateTime.UtcNow;

               await _context.SaveChangesAsync();

               return ticket;
          }

          public async Task<IEnumerable<AssignableUserDto>> GetAssignableUsers()
          {
               return await _context.Users
                   .Where(u =>
                       u.RoleId == 3 ||
                       u.RoleId == 4)
                   .Select(u => new AssignableUserDto
                   {
                        Id = u.Id,
                        FullName = u.FullName,
                        RoleId = u.RoleId,
                        AssignedTicketsCount =
                           _context.Tickets.Count(
                               t => t.AssignedTo == u.Id)
                   })
                   .OrderBy(u => u.AssignedTicketsCount)
                   .ThenBy(u => u.FullName)
                   .ToListAsync();
          }

          public async Task<(bool Success, string Message)> AssignTicket(int id, AssignTicketDto dto)
          {
               var ticket = await _context.Tickets
                   .FirstOrDefaultAsync(t => t.Id == id);

               if (ticket == null)
                    return (false, "Ticket not found");

               var user = await _context.Users
                   .FirstOrDefaultAsync(u => u.Id == dto.UserId);

               if (user == null)
                    return (false, "User not found");

               if (user.RoleId != 3 &&
                   user.RoleId != 4)
               {
                    return (false,
                        "Can only assign to managers or support agents");
               }

               ticket.AssignedTo = dto.UserId;
               ticket.UpdatedAt = DateTime.UtcNow;

               _context.Notifications.Add(new Notification
               {
                    UserId = dto.UserId,
                    TicketId = ticket.Id,
                    Message =
                       $"A ticket ({ticket.ReferenceNumber}) has been assigned to you.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
               });

               await _context.SaveChangesAsync();

               return (true, "Ticket assigned");
          }

          public async Task<(bool Success, string Message)>UpdateStatus(int id, string status, string role)
          {
               var ticket =
                   await _context.Tickets.FindAsync(id);

               if (ticket == null)
                    return (false, "Ticket not found");

               List<string> allowedStatuses = new();

               if (role == "Admin" || role == "Manager")
               {
                    allowedStatuses = new()
        {
            "in progress",
            "pending",
            "resolved",
            "closed"
        };
               }
               else if (role == "Support Agent")
               {
                    allowedStatuses = new()
        {
            "in progress",
            "pending",
            "resolved"
        };
               }
               else
               {
                    return (false, "Forbidden");
               }

               if (!allowedStatuses.Contains(status.ToLower()))
               {
                    return (false, "Status not allowed");
               }

               var statusEntity =
                   await _context.Statuses
                       .FirstOrDefaultAsync(s =>
                           s.Name.ToLower() ==
                           status.ToLower());

               if (statusEntity == null)
                    return (false, "Invalid status");

               ticket.StatusId = statusEntity.Id;
               ticket.UpdatedAt = DateTime.UtcNow;

               _context.Notifications.Add(new Notification
               {
                    UserId = ticket.CreatedBy,
                    TicketId = ticket.Id,
                    Message =
                       $"Your ticket ({ticket.ReferenceNumber}) status changed to {statusEntity.Name}.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
               });

               await _context.SaveChangesAsync();

               return (true, "Status updated successfully");
          }

          
     }
}