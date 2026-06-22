using HelpDesk.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace HelpDesk.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options
        ) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Ticket> Tickets => Set<Ticket>();

        public DbSet<Category> Categories => Set<Category>();

        public DbSet<Priority> Priorities => Set<Priority>();

        public DbSet<Status> Statuses => Set<Status>();

        public DbSet<TicketComment> TicketComments { get; set; }

        public DbSet<TicketAttachment> TicketAttachments { get; set; }

        public DbSet<Notification> Notifications { get; set; }
     }
}