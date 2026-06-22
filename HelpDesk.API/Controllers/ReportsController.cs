using HelpDesk.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
     private readonly AppDbContext _context;

     public ReportsController(AppDbContext context)
     {
          _context = context;
     }

     [HttpGet]
     public async Task<IActionResult> GetReportData()
     {
          var totalTickets = await _context.Tickets.CountAsync();

          var openTickets = await _context.Tickets
              .CountAsync(t => t.Status != null && t.Status.Name == "Open");

          var inProgressTickets = await _context.Tickets
              .CountAsync(t => t.Status != null && t.Status.Name == "In Progress");

          var pendingTickets = await _context.Tickets
              .CountAsync(t => t.Status != null && t.Status.Name == "Pending");

          var resolvedTickets = await _context.Tickets
              .CountAsync(t => t.Status != null && t.Status.Name == "Resolved");

          var closedTickets = await _context.Tickets
              .CountAsync(t => t.Status != null && t.Status.Name == "Closed");

          var supportAgentsOnline = await _context.Users
              .CountAsync(u => u.RoleId == 3);

          var lowTickets = await _context.Tickets
              .CountAsync(t => t.Priority != null && t.Priority.Name == "Low");

          var mediumTickets = await _context.Tickets
              .CountAsync(t => t.Priority != null && t.Priority.Name == "Medium");

          var highTickets = await _context.Tickets
              .CountAsync(t => t.Priority != null && t.Priority.Name == "High");

          var criticalTickets = await _context.Tickets
              .CountAsync(t => t.Priority != null && t.Priority.Name == "Critical");

          var assignedTickets = await _context.Tickets
              .CountAsync(t => t.AssignedTo != null);

          var unassignedTickets = await _context.Tickets
              .CountAsync(t => t.AssignedTo == null);

          var emailCat = await _context.Tickets
              .CountAsync(t => t.Category!= null && t.Category.Name == "Email");

          var accReCat = await _context.Tickets
              .CountAsync(t => t.Category != null && t.Category.Name == "Access Request");

         var  hardwareCat = await _context.Tickets
              .CountAsync(t => t.Category != null && t.Category.Name == "Hardware");

         var networkCat = await _context.Tickets
              .CountAsync(t => t.Category != null && t.Category.Name == "Network");

         var softwareCat = await _context.Tickets
              .CountAsync(t => t.Category != null && t.Category.Name == "Software");

         var otherCat = await _context.Tickets
              .CountAsync(t => t.Category != null && t.Category.Name == "Other");

        return Ok(new
          {
               totalTickets,
               openTickets,
               inProgressTickets,
               pendingTickets,
               resolvedTickets,
               closedTickets,
               supportAgentsOnline,
               lowTickets,
               mediumTickets,
               highTickets,
               criticalTickets,
               assignedTickets,
               unassignedTickets,
               emailCat,
               accReCat,
               hardwareCat,
               networkCat,
               softwareCat,
               otherCat,

        });
     }
}
