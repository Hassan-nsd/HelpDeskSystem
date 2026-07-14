using HelpDesk.API.Models;

namespace HelpDesk.API.DTO
{
     public class ChatRequestDto
     {
          public string Message { get; set; } = string.Empty;

          public List<ChatMessageDto> History { get; set; } = new();
     }
}
