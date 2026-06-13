using HelpDesk.API.Data;
using HelpDesk.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttachmentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public AttachmentsController(
            AppDbContext context,
            IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpPost("{ticketId}")]
        public async Task<IActionResult> Upload(
            int ticketId,
            IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file selected.");

            var uploadsFolder =
                Path.Combine(_environment.ContentRootPath, "Uploads");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName =
                $"{Guid.NewGuid()}_{file.FileName}";

            var filePath =
                Path.Combine(uploadsFolder, uniqueFileName);

            using var stream =
                new FileStream(filePath, FileMode.Create);

            await file.CopyToAsync(stream);

            var attachment = new TicketAttachment
            {
                TicketId = ticketId,
                FileName = file.FileName,
                FilePath = $"/attachments/{uniqueFileName}",
                UploadedAt = DateTime.UtcNow
            };

            _context.TicketAttachments.Add(attachment);

            await _context.SaveChangesAsync();

            return Ok(attachment);
        }

        [HttpGet("ticket/{ticketId}")]
        public IActionResult GetByTicket(int ticketId)
        {
            var attachments = _context.TicketAttachments
                .Where(a => a.TicketId == ticketId)
                .ToList();

            return Ok(attachments);
        }
    }
}