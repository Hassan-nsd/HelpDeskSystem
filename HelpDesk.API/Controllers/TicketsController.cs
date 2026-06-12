using System.Security.Claims;
using HelpDesk.API.Data;
using HelpDesk.API.DTO;
using HelpDesk.API.DTOs;
using HelpDesk.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.API.Controllers
{
     [ApiController]
     [Route("api/[controller]")]
     [Authorize]
     public class TicketsController : ControllerBase
     {
          private readonly AppDbContext _context;

          public TicketsController(AppDbContext context)
          {
               _context = context;
          }

          [HttpGet]
          public async Task<IActionResult> GetTickets()
          {
               var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

               var userId = int.Parse(
                   User.FindFirst("userId")!.Value
               );

               var query = _context.Tickets
                   .Include(t => t.Category)
                   .Include(t => t.Priority)
                   .Include(t => t.Status)
                   .Include(t => t.Creator)
                   .Include(t => t.Assignee)
                   .AsQueryable();

               if (role == "Employee")
               {
                    query = query.Where(t => t.CreatedBy == userId);
               }
               else if (role == "Support Agent")
               {
                    query = query.Where(t => t.AssignedTo == userId);
               }

               var tickets = await query
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

               return Ok(tickets);
          }

          [HttpGet("{id}")]
          public async Task<IActionResult> GetTicket(int id)
          {
               var ticket = await _context.Tickets
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

               if (ticket == null)
                    return NotFound();

               return Ok(ticket);
          }

          [Authorize(Roles = "Admin,Employee,Manager")]
          [HttpPost]
          public async Task<IActionResult> CreateTicket(
    CreateTicketDto dto)
          {
               var userId = int.Parse(
                   User.FindFirst("userId")!.Value
               );

               var ticket = new Ticket
               {
                    Title = dto.Title,
                    Description = dto.Description,
                    CategoryId = dto.CategoryId,
                    PriorityId = dto.PriorityId,

                    CreatedBy = userId,

                    StatusId = 1,

                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,

                    ReferenceNumber =
                       $"TKT-{Guid.NewGuid().ToString()[..4]}"
               };

               _context.Tickets.Add(ticket);

               await _context.SaveChangesAsync();

               return Ok(ticket);
          }


          [HttpPut("{id}")]
          public async Task<IActionResult> UpdateTicket(
            int id,
            Ticket updated)
          {
               var ticket =
                   await _context.Tickets.FindAsync(id);

               if (ticket == null)
                    return NotFound();

               ticket.Title = updated.Title;
               ticket.Description = updated.Description;
               ticket.CategoryId = updated.CategoryId;
               ticket.PriorityId = updated.PriorityId;
               ticket.StatusId = updated.StatusId;
               ticket.AssignedTo = updated.AssignedTo;
               ticket.UpdatedAt = DateTime.UtcNow;

               await _context.SaveChangesAsync();

               return Ok(ticket);
          }

          [HttpGet("assignable-users")]
          [Authorize(Roles = "Admin,Manager")]
          public async Task<IActionResult> GetAssignableUsers()
          {
               var users = await _context.Users
                   .Where(u =>
                       u.RoleId == 3 ||
                       u.RoleId == 4)
                   .Select(u => new AssignableUserDto
                   {
                        Id = u.Id,
                        FullName = u.FullName,
                        RoleId = u.RoleId,

                        AssignedTicketsCount =
                           _context.Tickets.Count(t =>
                               t.AssignedTo == u.Id)
                   })
                   .OrderBy(u => u.AssignedTicketsCount)
                   .ThenBy(u => u.FullName)
                   .ToListAsync();

               return Ok(users);
          }

          [HttpPut("{id}/assign")]
          [Authorize(Roles = "Admin,Manager")]
          public async Task<IActionResult> AssignTicket(
              int id,
              AssignTicketDto dto)
          {
               var ticket = await _context.Tickets
                   .FirstOrDefaultAsync(t => t.Id == id);

               if (ticket == null)
                    return NotFound();

               var user = await _context.Users
                   .FirstOrDefaultAsync(u => u.Id == dto.UserId);

               if (user == null)
                    return BadRequest();

               if (
                   user.RoleId != 3 &&
                   user.RoleId != 4)
               {
                    return BadRequest(
                        "Can only assign to managers or support agents."
                    );
               }

               ticket.AssignedTo = dto.UserId;
               ticket.UpdatedAt = DateTime.UtcNow;

               await _context.SaveChangesAsync();

               return Ok();
          }

          [HttpPut("{id}/status")]
          public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTicketStatusDto dto)
          {
               var ticket = await _context.Tickets.FindAsync(id);

               if (ticket == null)
                    return NotFound();

               var role = User.FindFirst(ClaimTypes.Role)?.Value;

               var allowedStatuses = new List<string>();

               if (role == "Admin" || role == "Manager")
               {
                    allowedStatuses = new() { "in progress", "pending", "resolved", "closed" };
               }
               else if (role == "Support Agent")
               {
                    allowedStatuses = new() { "in progress", "pending", "resolved" };
               }
               else
               {
                    return Forbid();
               }

               if (!allowedStatuses.Contains(dto.Status.ToLower()))
                    return BadRequest("Status not allowed");

               var statusEntity = await _context.Statuses
                   .FirstOrDefaultAsync(s => s.Name.ToLower() == dto.Status.ToLower());

               if (statusEntity == null)
                    return BadRequest("Invalid status");

               ticket.StatusId = statusEntity.Id;
               ticket.UpdatedAt = DateTime.UtcNow;

               await _context.SaveChangesAsync();

               return Ok(new { message = "Status updated successfully" });
          }
     }
}