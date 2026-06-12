namespace HelpDesk.API.DTO
{
     public class TicketCommentDto
     {
          public int Id { get; set; }

          public int TicketId { get; set; }

          public int UserId { get; set; }

          public string UserName { get; set; } = string.Empty;

          public string Comment { get; set; } = string.Empty;

          public DateTime CreatedAt { get; set; }
     }
}