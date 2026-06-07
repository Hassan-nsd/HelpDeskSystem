using HelpDesk.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.API.Controllers
{
     [ApiController]
     [Route("api/[controller]")]
     [Authorize]
     public class CategoriesController : ControllerBase
     {
          private readonly AppDbContext _context;

          public CategoriesController(AppDbContext context)
          {
               _context = context;
          }

          [HttpGet]
          public async Task<IActionResult> GetCategories()
          {
               var categories = await _context.Categories
                   .Select(c => new
                   {
                        c.Id,
                        c.Name
                   })
                   .ToListAsync();

               return Ok(categories);
          }
     }
}