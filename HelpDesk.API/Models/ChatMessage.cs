namespace HelpDesk.API.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }

        public int ConversationId { get; set; }

        public string Role { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public ChatConversation? Conversation { get; set; }
    }
}