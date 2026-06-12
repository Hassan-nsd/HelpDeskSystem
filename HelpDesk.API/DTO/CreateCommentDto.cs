namespace HelpDesk.API.DTO
{
     public class CreateCommentDto
     {
          public int TicketId { get; set; }

          public string Comment { get; set; } = string.Empty;
     }
}