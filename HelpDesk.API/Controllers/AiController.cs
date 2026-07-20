using System.Text.Json;
using HelpDesk.API.Data;
using HelpDesk.API.DTO;
using HelpDesk.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HelpDesk.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;
    private readonly ILogger<AiController> _logger;
    private readonly AppDbContext _context;

    public AiController(
     IAiService aiService,
     AppDbContext context,
     ILogger<AiController> logger)
    {
        _aiService = aiService;
        _context = context;
        _logger = logger;
    }

    [HttpPost("analyze-ticket")]
    public async Task<IActionResult> AnalyzeTicket(
        [FromBody] AnalyzeTicketRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) ||
            string.IsNullOrWhiteSpace(request.Description))
        {
            return BadRequest(new
            {
                message = "Title and description are required."
            });
        }

        if (request.Categories == null || request.Categories.Count == 0)
        {
            return BadRequest(new
            {
                message = "At least one category is required."
            });
        }

        try
        {
            string allowedCategories =
                string.Join(", ", request.Categories);

            string ticketText =
                $"""
                    Analyze this helpdesk ticket.

                    Title: {request.Title.Trim()}
                    Description: {request.Description.Trim()}

                    Allowed categories:
                    {allowedCategories}

                    Select exactly one category from the allowed categories.
                    Never invent a category.
                    Return only valid JSON.
                    """;

            string result =
                await _aiService.TestConnectionAsync(ticketText);

            AiTicketAnalysis? analysis =
                JsonSerializer.Deserialize<AiTicketAnalysis>(
                    result,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

            if (analysis is null)
            {
                return StatusCode(500, new
                {
                    message = "The AI returned an empty response."
                });
            }

            string? matchingCategory =
                 request.Categories.FirstOrDefault(category =>
                 string.Equals(
                    category.Trim(),
                    analysis.Category.Trim(),
                    StringComparison.OrdinalIgnoreCase));

                if (matchingCategory == null)
                {
                     return StatusCode(500, new
                     {
                        message = "The AI returned an invalid category."
                     });
                }

            analysis.Category = matchingCategory;

            return Ok(analysis);
        }
        catch (JsonException exception)
        {
            _logger.LogError(
                exception,
                "The AI returned invalid JSON.");

            return StatusCode(500, new
            {
                message = "The AI returned an invalid response."
            });
        }
        catch (HttpRequestException exception)
        {
            _logger.LogError(
                exception,
                "The Azure AI request failed.");

            return StatusCode(502, new
            {
                message = "The AI service is currently unavailable."
            });
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "An unexpected AI analysis error occurred.");

            return StatusCode(500, new
            {
                message = "The ticket analysis failed."
            });
        }
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat(
   [FromBody] ChatRequestDto request)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new
            {
                message = "A chat message is required."
            });
        }

        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new
            {
                message = "The logged-in user could not be identified."
            });
        }

        try
        {
            var conversation = await _context.ChatConversations
                .Where(item => item.UserId == userId)
                .OrderByDescending(item => item.UpdatedAt)
                .FirstOrDefaultAsync();

            if (conversation == null)
            {
                conversation = new ChatConversation
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ChatConversations.Add(conversation);
                await _context.SaveChangesAsync();
            }

            var userMessage = new ChatMessage
            {
                ConversationId = conversation.Id,
                Role = "user",
                Content = request.Message.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.ChatMessages.Add(userMessage);
            await _context.SaveChangesAsync();

            var previousMessages = await _context.ChatMessages
                .Where(item =>
                    item.ConversationId == conversation.Id &&
                    item.Id != userMessage.Id)
                .OrderByDescending(item => item.CreatedAt)
                .Take(20)
                .OrderBy(item => item.CreatedAt)
                .Select(item => new ChatMessageDto
                {
                    Role = item.Role,
                    Content = item.Content
                })
                .ToListAsync();

            var reply = await _aiService.ChatAsync(
                request.Message.Trim(),
                previousMessages);

            var assistantMessage = new ChatMessage
            {
                ConversationId = conversation.Id,
                Role = "assistant",
                Content = reply,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChatMessages.Add(assistantMessage);

            conversation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                reply,
                conversationId = conversation.Id
            });
        }
        catch (HttpRequestException exception)
        {
            _logger.LogError(
                exception,
                "The Azure AI chatbot request failed.");

            return StatusCode(502, new
            {
                message = "The AI service is currently unavailable."
            });
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "An unexpected chatbot error occurred.");

            return StatusCode(500, new
            {
                message = "The chatbot is currently unavailable."
            });
        }
    }

    [HttpGet("chat/history")]
    public async Task<IActionResult> GetChatHistory()
    {
        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new
            {
                message = "The logged-in user could not be identified."
            });
        }

        var conversation = await _context.ChatConversations
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.UpdatedAt)
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            return Ok(Array.Empty<object>());
        }

        var messages = await _context.ChatMessages
            .Where(item =>
                item.ConversationId == conversation.Id)
            .OrderBy(item => item.CreatedAt)
            .Select(item => new
            {
                item.Id,
                item.Role,
                item.Content,
                item.CreatedAt
            })
            .ToListAsync();

        return Ok(messages);
    }


    [HttpDelete("chat/history")]
    public async Task<IActionResult> ClearChatHistory()
    {
        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var conversations = await _context.ChatConversations
            .Where(item => item.UserId == userId)
            .ToListAsync();

        if (conversations.Count > 0)
        {
            _context.ChatConversations.RemoveRange(conversations);
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }
}
