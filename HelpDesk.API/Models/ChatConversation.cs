using OpenAI.Chat;

namespace HelpDesk.API.Models
{
    public class ChatConversation
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public List<ChatMessage> Messages { get; set; } = new();
    }
}