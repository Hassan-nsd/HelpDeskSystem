namespace HelpDesk.API.DTOs
{
    public class TicketDto
    {
        public int Id { get; set; }

        public string ReferenceNumber { get; set; } = "";

        public string Title { get; set; } = "";

        public string Description { get; set; } = "";

        public string Category { get; set; } = "";

        public string Priority { get; set; } = "";

        public string Status { get; set; } = "";

        public string CreatedBy { get; set; } = "";

        public DateTime CreatedAt { get; set; }

        public string? AssignedTo { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}