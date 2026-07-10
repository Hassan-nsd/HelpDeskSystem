using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace HelpDesk.API.Services;

public class AzureOpenAiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public AzureOpenAiService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> TestConnectionAsync(string message)
    {
        string endpoint =
            _configuration["AzureOpenAI:Endpoint"]
            ?? throw new InvalidOperationException(
                "AzureOpenAI endpoint is missing.");

        string apiKey =
            _configuration["AzureOpenAI:ApiKey"]
            ?? throw new InvalidOperationException(
                "AzureOpenAI API key is missing.");

        string deploymentName =
            _configuration["AzureOpenAI:DeploymentName"]
            ?? throw new InvalidOperationException(
                "AzureOpenAI deployment name is missing.");

        string requestUrl =
            $"{endpoint.TrimEnd('/')}/responses";

        var requestBody = new
        {
            model = deploymentName,
            input = new[]
            {
                new
                {
                    role = "system",
                    content = new[]
                    {
                        new
                        {
                            type = "input_text",
                            text =
                           """
                            You are an AI assistant for a helpdesk ticketing system.

                            Analyze the submitted ticket and return only valid JSON using this exact structure:

                            {
                                "category": "string",
                                "priority": "Low | Medium | High | Critical",
                                "summary": "string",
                                "suggestedReply": "string"
                            }

                            Rules:
                            - Keep the summary to one sentence.
                            - Keep the suggested reply professional and concise.
                            - Do not ask follow-up questions.
                            - Do not include markdown.
                            - Do not include text before or after the JSON.
                            """
                        }
                    }
                },
                new
                {
                    role = "user",
                    content = new[]
                    {
                        new
                        {
                            type = "input_text",
                            text = message
                        }
                    }
                }
            }
        };

        string json = JsonSerializer.Serialize(requestBody);

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            requestUrl);

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", apiKey);

        request.Content = new StringContent(
            json,
            Encoding.UTF8,
            "application/json");

        using HttpResponseMessage response =
            await _httpClient.SendAsync(request);

        string responseJson =
            await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"Azure AI request failed with status " +
                $"{(int)response.StatusCode}: {responseJson}");
        }

        return ExtractOutputText(responseJson);
    }

    private static string ExtractOutputText(string responseJson)
    {
        using JsonDocument document =
            JsonDocument.Parse(responseJson);

        JsonElement root = document.RootElement;

        if (!root.TryGetProperty("output", out JsonElement output))
        {
            throw new InvalidOperationException(
                "Azure AI response did not contain an output field.");
        }

        foreach (JsonElement outputItem in output.EnumerateArray())
        {
            if (!outputItem.TryGetProperty(
                    "content",
                    out JsonElement content))
            {
                continue;
            }

            foreach (JsonElement contentItem in content.EnumerateArray())
            {
                if (contentItem.TryGetProperty(
                        "text",
                        out JsonElement text))
                {
                    return text.GetString() ?? string.Empty;
                }
            }
        }

        throw new InvalidOperationException(
            "No generated text was found in the Azure AI response.");
    }
}