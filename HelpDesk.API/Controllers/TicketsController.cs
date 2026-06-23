using System.Security.Claims;
using HelpDesk.API.Data;
using HelpDesk.API.DTO;
using HelpDesk.API.DTOs;
using HelpDesk.API.Models;
using HelpDesk.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.API.Controllers
{
     [ApiController]
     [Route("api/[controller]")]
     [Authorize]
     public class TicketsController : ControllerBase
     {
          private readonly ITicketService _ticketService;

          public TicketsController(ITicketService ticketService)
          {
               _ticketService = ticketService;
          }

          [HttpGet]
          public async Task<IActionResult> GetTickets()
          {
               var role =
                   User.FindFirst(ClaimTypes.Role)?.Value!;

               var userId =
                   int.Parse(User.FindFirst("userId")!.Value);

               var tickets =
                   await _ticketService.GetTickets(role, userId);

               return Ok(tickets);
          }

          [HttpGet("{id}")]
          public async Task<IActionResult> GetTicket(int id)
          {
               var ticket =
                   await _ticketService.GetTicket(id);

               if (ticket == null)
                    return NotFound();

               return Ok(ticket);
          }

          [Authorize(Roles = "Admin,Employee,Manager")]
          [HttpPost]
          public async Task<IActionResult> CreateTicket(
            CreateTicketDto dto)
          {
               var userId =
                   int.Parse(User.FindFirst("userId")!.Value);

               var ticket =
                   await _ticketService.CreateTicket(dto, userId);

               return Ok(ticket);
          }


          [HttpPut("{id}")]
          public async Task<IActionResult> UpdateTicket(int id, Ticket updated)
          {
               var ticket =
                   await _ticketService.UpdateTicket(id, updated);

               if (ticket == null)
                    return NotFound();

               return Ok(ticket);
          }

          [HttpGet("assignable-users")]
          [Authorize(Roles = "Admin,Manager")]
          public async Task<IActionResult> GetAssignableUsers()
          {
               var users =
                   await _ticketService.GetAssignableUsers();

               return Ok(users);
          }

          [HttpPut("{id}/assign")]
          [Authorize(Roles = "Admin,Manager")]
          public async Task<IActionResult> AssignTicket(int id, AssignTicketDto dto)
          {
               var result =
                   await _ticketService.AssignTicket(id, dto);

               if (!result.Success)
                    return BadRequest(result.Message);

               return Ok(new
               {
                    message = result.Message
               });
          }

          [HttpPut("{id}/status")]
          public async Task<IActionResult> UpdateStatus(int id, UpdateTicketStatusDto dto)
          {
               var role =
                   User.FindFirst(ClaimTypes.Role)?.Value!;

               var result =
                   await _ticketService.UpdateStatus(
                       id,
                       dto.Status,
                       role);

               if (!result.Success)
                    return BadRequest(result.Message);

               return Ok(new
               {
                    message = result.Message
               });
          }
     }
}