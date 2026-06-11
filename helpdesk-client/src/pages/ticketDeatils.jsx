import NavBar from "../components/navbar";
import { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import "../styles/ticketDetails.css";
import { FaArrowLeft, FaDownload, FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
  getTicketById,
  getAssignableUsers,
  assignTicket,
} from "../services/api";

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "open":
      return "status-open";
    case "in progress":
      return "status-progress";
    case "pending":
      return "status-pending";
    case "resolved":
      return "status-resolved";
    case "closed":
      return "status-closed";
    default:
      return "";
  }
};

const getPriorityClass = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "priority-high ";
    case "medium":
      return "priority-medium";
    case "low":
      return "priority-low";
    case "critical":
      return "priority-critical";
    default:
      return "";
  }
};

const canAssign = localStorage.roleId == 1 || localStorage.roleId == 4;

function TicketDetails() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    loadTicket();

    if (canAssign) {
      loadAssignableUsers();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      const data = await getTicketById(id);
      console.log(data);
      setTicket(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadAssignableUsers = async () => {
    try {
      const data = await getAssignableUsers();

      setAssignableUsers(data);

      if (data.length > 0) {
        setSelectedUser(data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleAssign = async () => {
    try {
      await assignTicket(ticket.id, selectedUser);

      await loadTicket();

      alert("Ticket assigned successfully");
    } catch (error) {
      console.error(error);
    }
  };

  if (!ticket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <NavBar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="main-content">
        <button className="back-btn" onClick={() => navigate("/tickets")}>
          <FaArrowLeft />
          Back to My Tickets
        </button>

        <div className="ticket-content">
          {/* Ticket Details */}
          <div className="details-card">
            <div className="card-header">
              <h2>Ticket Details</h2>
              <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>

            <div className="ticket-details-grid">
              <div className="detail-row">
                <span className="detail-label">Ticket ID</span>
                <span className={`detail-value }`}>
                  {ticket?.referenceNumber}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Title</span>
                <span className="detail-value">{ticket?.title}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Category</span>
                <span className="detail-value"> {ticket?.category}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Priority</span>
                <span
                  className={`detail-value ${getPriorityClass(ticket.priority)}`}
                >
                  {ticket?.priority}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">CreatedBy</span>
                <span className="detail-value">{ticket?.createdBy}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Assigned To</span>

                {ticket?.assignedTo ? (
                  <span className="detail-value">{ticket.assignedTo}</span>
                ) : canAssign ? (
                  <div className="assign-container">
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="assign-select"
                    >
                      {assignableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName}
                          {" - "}
                          {user.role}
                          {" ("}
                          {user.assignedTicketsCount}
                          {" tickets)"}
                        </option>
                      ))}
                    </select>

                    <button className="assign-btn" onClick={handleAssign}>
                      Assign
                    </button>
                  </div>
                ) : (
                  <span className="detail-value">Unassigned</span>
                )}
              </div>
              <div className="detail-row">
                <span className="detail-label">Created At</span>
                <span className="detail-value">{ticket?.createdAt}</span>
              </div>
            </div>

            <div className="ticket-description">
              <h4>Description</h4>
              <p>{ticket?.description}</p>
            </div>

            <div className="attachment-section">
              <h4>Attachment</h4>

              <div className="attachment-box">
                <div className="attachment-file">
                  <FaFileAlt />
                  <span>vpn_error_screenshot.png (2.4 MB)</span>
                </div>

                <FaDownload className="download-btn" />
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="comments-card">
            <h2>Comments</h2>

            <div className="comments-list">
              <div className="comment">
                <div className="avatar">J</div>

                <div className="comment-body">
                  <div className="comment-header">
                    <strong>John Smith</strong>
                    <span>May 21, 10:35 AM</span>
                  </div>

                  <p>
                    I cannot access the VPN. It keeps showing connection failed
                    even after restarting my laptop.
                  </p>
                </div>
              </div>

              <div className="comment">
                <div className="avatar agent">S</div>

                <div className="comment-body">
                  <div className="comment-header">
                    <strong>Sarah Johnson</strong>
                    <span>May 21, 10:45 AM</span>
                  </div>

                  <p>
                    Thank you for reporting the issue. We are currently
                    reviewing your VPN configuration.
                  </p>
                </div>
              </div>

              <div className="comment">
                <div className="avatar">J</div>

                <div className="comment-body">
                  <div className="comment-header">
                    <strong>John Smith</strong>
                    <span>May 21, 11:10 AM</span>
                  </div>

                  <p>
                    Thank you. Please let me know if you need any additional
                    information.
                  </p>
                </div>
              </div>
            </div>

            <div className="comment-input">
              <textarea placeholder="Write a comment..."></textarea>

              <button className="send-btn">Add Comment</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TicketDetails;
