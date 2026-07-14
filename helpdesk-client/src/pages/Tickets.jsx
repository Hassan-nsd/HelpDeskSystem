import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getTickets,
  deleteTicket,
  updateTicket,
  getCategories,
  getPriorities,
} from "../services/api";
import "../styles/Dashboard.css";
import NavBar from "../components/navbar";
import TopBar from "../components/topbar";
import "../styles/tickets.css";

function Tickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState({
    id: 0,
    title: "",
    description: "",
    priorityId: "",
    categoryId: "",
  });
  const [allTickets, setAllTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const roleId = Number(localStorage.roleId);
  const canEdit = (ticket) => {
    if (roleId === 1 || roleId === 4) return true;
    if (roleId === 2 && ticket.status?.toLowerCase() === "open") return true;

    return false;
  };

  const canDelete = (ticket) => {
    if (roleId === 1 || roleId === 4) return true;
    if (roleId === 2 && ticket.status?.toLowerCase() === "open") return true;
    return false;
  };

  const isAdminOrManager = roleId === 1 || roleId === 4;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    loadTickets();
    loadDropdowns();
  }, [navigate]);

  const loadDropdowns = async () => {
    try {
      const cats = await getCategories();
      const prios = await getPriorities();

      setCategories(cats);
      setPriorities(prios);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTickets = async () => {
    try {
      const data = await getTickets();
      setAllTickets(data);
      setTickets(data);
    } catch (error) {
      console.error(error);
    }
  };

  const applyFilters = (status, priority, assignment) => {
    let filtered = [...allTickets];

    if (status !== "all") {
      filtered = filtered.filter(
        (t) => t.status?.toLowerCase() === status.toLowerCase(),
      );
    }

    if (priority !== "all") {
      filtered = filtered.filter(
        (t) => t.priority?.toLowerCase() === priority.toLowerCase(),
      );
    }

    if (assignment !== "all") {
      if (assignment === "assigned") {
        filtered = filtered.filter((t) => t.assignedTo !== null);
      } else {
        filtered = filtered.filter((t) => t.assignedTo === null);
      }
    }

    setTickets(filtered);
  };

  function roleName() {
    if (localStorage.roleId === 1) return "Admin";
    if (localStorage.roleId === 2) return "Employee";
    if (localStorage.roleId === 3) return "Support Agent";
    if (localStorage.roleId === 4) return "Manager";
  }

  const openEdit = (ticket) => {
    setEditingTicket({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      categoryId: ticket.categoryId,
      priorityId: ticket.priorityId,
    });

    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await updateTicket(editingTicket.id, editingTicket);

      setShowEditModal(false);

      loadTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTicket(ticketToDelete);

      const updatedTickets = allTickets.filter((t) => t.id !== ticketToDelete);

      setAllTickets(updatedTickets);
      setTickets(updatedTickets);

      setShowDeleteModal(false);
      setTicketToDelete(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "open";
      case "in progress":
        return "progress";
      case "pending":
        return "pending";
      case "resolved":
        return "resolved";
      case "closed":
        return "closed";
      default:
        return "";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "high";
      case "medium":
        return "medium";
      case "low":
        return "low";
      case "critical":
        return "critical";
      default:
        return "";
    }
  };

  return (
    <div className="dashboard-container">
      <NavBar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* MAIN */}
      <main className="main-content">
        <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="users-header">
          <h2 className="page-title">Tickets</h2>

          <div className="users-filters">
            <select
              value={statusFilter}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(value);
                applyFilters(value, priorityFilter, assignmentFilter);
              }}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                const value = e.target.value;
                setPriorityFilter(value);
                applyFilters(statusFilter, value, assignmentFilter);
              }}
            >
              <option value="all">All Priorities</option>

              {priorities.map((priority) => (
                <option key={priority.id} value={priority.name.toLowerCase()}>
                  {priority.name}
                </option>
              ))}
            </select>

            {(roleId === 1 || roleId === 4) && (
              <select
                value={assignmentFilter}
                onChange={(e) => {
                  const value = e.target.value;
                  setAssignmentFilter(value);
                  applyFilters(statusFilter, priorityFilter, value);
                }}
              >
                <option value="all">All Tickets</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            )}
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{ticket.referenceNumber}</td>

                    <td>{ticket.title}</td>

                    <td>
                      <span
                        className={`status ${getStatusClass(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`priority ${getPriorityClass(ticket.priority)}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td
                      className="actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canEdit(ticket) && (
                        <button
                          className="action-btn edit-btn"
                          onClick={() => openEdit(ticket)}
                        >
                          <FaEdit />
                        </button>
                      )}

                      {canDelete(ticket) && (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => {
                            setTicketToDelete(ticket.id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showEditModal && (
          <div className="modal-overlay">
            <div className="edit-modal">
              <h2>Edit Ticket</h2>

              <label>Title</label>

              <input
                value={editingTicket.title}
                onChange={(e) =>
                  setEditingTicket({
                    ...editingTicket,
                    title: e.target.value,
                  })
                }
              />

              <label>Description</label>

              <textarea
                rows={4}
                value={editingTicket.description}
                onChange={(e) =>
                  setEditingTicket({
                    ...editingTicket,
                    description: e.target.value,
                  })
                }
              />

              <label>Category</label>

              <select
                value={editingTicket.categoryId}
                onChange={(e) =>
                  setEditingTicket({
                    ...editingTicket,
                    categoryId: Number(e.target.value),
                  })
                }
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <label>Priority</label>

              <select
                value={editingTicket.priorityId}
                onChange={(e) =>
                  setEditingTicket({
                    ...editingTicket,
                    priorityId: Number(e.target.value),
                  })
                }
              >
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>

              <div className="modal-buttons">
                <button
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button className="save-btn" onClick={handleUpdate}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="delete-modal">
              <h2>Delete Ticket</h2>

              <p>Are you sure you want to delete this ticket?</p>

              <p className="delete-warning">This action cannot be undone.</p>

              <div className="modal-buttons">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTicketToDelete(null);
                  }}
                >
                  Cancel
                </button>

                <button className="delete-confirm-btn" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Tickets;
