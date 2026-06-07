using HelpDesk.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.API.Controllers
{
     [ApiController]
     [Route("api/[controller]")]
     [Authorize]
     public class PrioritiesController : ControllerBase
     {
          private readonly AppDbContext _context;

          public PrioritiesController(AppDbContext context)
          {
               _context = context;
          }

          [HttpGet]
          public async Task<IActionResult> GetPriorities()
          {
               var priorities = await _context.Priorities
                   .Select(p => new
                   {
                        p.Id,
                        p.Name
                   })
                   .ToListAsync();

               return Ok(priorities);
          }
     }
}