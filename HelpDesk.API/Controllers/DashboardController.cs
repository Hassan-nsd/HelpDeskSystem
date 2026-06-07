using HelpDesk.API.Data;
using HelpDesk.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.API.Controllers
{
     [ApiController]
     [Route("api/[controller]")]
     [Authorize]
     public class DashboardController : ControllerBase
     {
          private readonly AppDbContext _context;

          public DashboardController(AppDbContext context)
          {
               _context = context;
          }

          [HttpGet]
          public async Task<IActionResult> GetDashboard()
          {
               var openStatusId = await _context.Statuses
                   .Where(s => s.Name == "Open")
                   .Select(s => s.Id)
                   .FirstOrDefaultAsync();

               var progressStatusId = await _context.Statuses
                   .Where(s => s.Name == "In Progress")
                   .Select(s => s.Id)
                   .FirstOrDefaultAsync();

               var resolvedStatusId = await _context.Statuses
                   .Where(s => s.Name == "Resolved")
                   .Select(s => s.Id)
                   .FirstOrDefaultAsync();

               var closedStatusId = await _context.Statuses
                   .Where(s => s.Name == "Closed")
                   .Select(s => s.Id)
                   .FirstOrDefaultAsync();

               var statusCounts = await _context.Tickets
                   .GroupBy(t => t.StatusId)
                   .Select(g => new
                   {
                        StatusId = g.Key,
                        Count = g.Count()
                   })
                   .ToListAsync();

               var dashboard = new DashboardDto
               {
                    OpenTickets = statusCounts
                       .FirstOrDefault(s => s.StatusId == openStatusId)?.Count ?? 0,

                    InProgressTickets = statusCounts
                       .FirstOrDefault(s => s.StatusId == progressStatusId)?.Count ?? 0,

                    ResolvedTickets = statusCounts
                       .FirstOrDefault(s => s.StatusId == resolvedStatusId)?.Count ?? 0,

                    ClosedTickets = statusCounts
                       .FirstOrDefault(s => s.StatusId == closedStatusId)?.Count ?? 0,

                    RecentTickets = await _context.Tickets
                       .Include(t => t.Status)
                       .Include(t => t.Priority)
                       .Include(t => t.Creator)
                       .OrderByDescending(t => t.CreatedAt)
                       .Take(5)
                       .Select(t => new
                       {
                            t.ReferenceNumber,
                            t.Title,
                            Requester = t.Creator!.FullName,
                            Status = t.Status!.Name,
                            Priority = t.Priority!.Name,
                            t.UpdatedAt
                       })
                       .ToListAsync()
               };

               return Ok(dashboard);
          }
     }
}