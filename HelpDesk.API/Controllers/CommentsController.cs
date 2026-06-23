using System.Security.Claims;
using HelpDesk.API.Data;
using HelpDesk.API.DTO;
using HelpDesk.API.Models;
using HelpDesk.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.API.Controllers
{
     [Route("api/[controller]")]
     [ApiController]
     [Authorize]
     public class CommentsController : ControllerBase
     {
          private readonly ICommentService _commentService;

          public CommentsController(ICommentService commentService)
          {
               _commentService = commentService;
          }

          [HttpGet("{ticketId}")]
          public async Task<ActionResult<IEnumerable<TicketCommentDto>>> GetComments(int ticketId)
          {
               var comments = await _commentService.GetComments(ticketId);

               return Ok(comments);
          }

          [HttpPost]
          public async Task<IActionResult> AddComment(CreateCommentDto dto)
          {
               var userIdClaim = User.FindFirst("userId");

               if (userIdClaim == null)
                    return Unauthorized();

               await _commentService.AddComment(dto, int.Parse(userIdClaim.Value));

               return Ok();
          }

          [HttpDelete("{id}")]
          public async Task<IActionResult> DeleteComment(int id)
          {
               var success =
                await _commentService.DeleteComment(id);

               if (!success)
                    return NotFound();

               return Ok();

          }

          [HttpPut("{id}")]
          public async Task<IActionResult> UpdateComment(int id, UpdateCommentDto dto)
          {
               var userIdClaim =
                User.FindFirst("userId");

               if (userIdClaim == null)
                    return Unauthorized();

               var comment =
                   await _commentService.UpdateComment(
                       id,
                       dto,
                       int.Parse(userIdClaim.Value));

               if (comment == null)
                    return NotFound();

               return Ok(comment);
          }
     }
}