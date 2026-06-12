using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.API.Models
{
     public class TicketComment
     {
          public int Id { get; set; }

          public int TicketId { get; set; }

          public int UserId { get; set; }

          public string Comment { get; set; } = string.Empty;

          public DateTime CreatedAt { get; set; }

          [ForeignKey(nameof(TicketId))]
          public Ticket? Ticket { get; set; }

          [ForeignKey(nameof(UserId))]
          public User? User { get; set; }
     }
}