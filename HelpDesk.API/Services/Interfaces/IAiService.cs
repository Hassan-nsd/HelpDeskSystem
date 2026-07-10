namespace HelpDesk.API.Services;

public interface IAiService
{
    Task<string> TestConnectionAsync(string message);
}