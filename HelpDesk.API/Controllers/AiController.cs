using System.Text.Json;
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

        try
        {
            string ticketText =
                $"Title: {request.Title.Trim()}\n" +
                $"Description: {request.Description.Trim()}";

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
}
