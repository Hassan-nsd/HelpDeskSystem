using System.Text.Json;
using HelpDesk.API.DTO;
using HelpDesk.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;
    private readonly ILogger<AiController> _logger;

    public AiController(
        IAiService aiService,
        ILogger<AiController> logger)
    {
        _aiService = aiService;
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
     public async Task<IActionResult> Chat([FromBody] ChatRequestDto request)
     {
          if (request == null || string.IsNullOrWhiteSpace(request.Message))
          {
               return BadRequest(new
               {
                    message = "A chat message is required."
               });
          }

          try
          {
               var reply = await _aiService.ChatAsync(
                   request.Message,
                   request.History
               );

               return Ok(new
               {
                    reply
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
}
