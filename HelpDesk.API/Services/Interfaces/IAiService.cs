using HelpDesk.API.DTO;
using HelpDesk.API.Models;
namespace HelpDesk.API.Services;

public interface IAiService
{
    Task<string> TestConnectionAsync(string message);

     Task<string> ChatAsync(string message, List<ChatMessageDto> history);
}