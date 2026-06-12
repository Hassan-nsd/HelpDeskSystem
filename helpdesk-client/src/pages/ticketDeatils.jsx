import NavBar from "../components/navbar";
import { useState, useEffect, useCallback } from "react";
import "../styles/Dashboard.css";
import "../styles/ticketDetails.css";
import {
  FaArrowLeft,
  FaDownload,
  FaFileAlt,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTicketById,
  getAssignableUsers,
  assignTicket,
  getComments,
  addComment,
  deleteComment,
  updateComment,
  updateTicketStatus,
} from "../services/api";

const getStatusClass = (status) => {
  const statusClasses = {
    open: "status-open",
    "in progress": "status-progress",
    pending: "status-pending",
    resolved: "status-resolved",
    closed: "status-closed",
  };
  return statusClasses[status?.toLowerCase()] || "";
};

const getPriorityClass = (priority) => {
  const priorityClasses = {
    high: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
    critical: "priority-critical",
  };
  return priorityClasses[priority?.toLowerCase()] || "";
};

const canAssign =
  localStorage.getItem("roleId") === "1" ||
  localStorage.getItem("roleId") === "4";

function TicketDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const currentUserId = Number(localStorage.getItem("userId") || 0);
  const roleId = Number(localStorage.getItem("roleId"));
  const isAdmin = roleId === 1;
  const isManager = roleId === 4;
  const isSupportAgent = roleId === 3;
  const [selectedStatus, setSelectedStatus] = useState("");

  const allowedStatuses = () => {
    if (isAdmin || isManager) {
      return ["in progress", "pending", "resolved", "closed"];
    }
    if (isSupportAgent) {
      return ["in progress", "pending", "resolved"];
    }
    return [];
  };

  const loadTicket = useCallback(async () => {
    try {
      const data = await getTicketById(id);
      setTicket(data);
      setSelectedStatus("");
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    try {
      const data = await getComments(id);
      setComments(data);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    loadTicket();
    loadComments();
    if (canAssign) {
      loadAssignableUsers();
    }
  }, [id, loadTicket, loadComments]);

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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(ticket.id, newComment);
      setNewComment("");
      await loadComments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (!confirmDelete) return;

    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditedComment(comment.comment);
  };

  const handleSaveEdit = async (commentId) => {
    try {
      await updateComment(commentId, editedComment);
      setEditingCommentId(null);
      setEditedComment("");
      await loadComments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedComment("");
  };

  // New function to update the status when the button is clicked
  const handleUpdateStatus = async () => {
    try {
      await updateTicketStatus(ticket.id, selectedStatus); // Call the API to update status
      alert("Status updated successfully");
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
                <span className="detail-value">{ticket?.referenceNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Title</span>
                <span className="detail-value">{ticket?.title}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Category</span>
                <span className="detail-value">{ticket?.category}</span>
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
                <span className="detail-label">Created By</span>
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
                          {user.fullName} - {user.role} (
                          {user.assignedTicketsCount} tickets)
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
              <div className="detail-row">
                <span className="detail-label">Status</span>
                {isAdmin || isManager || isSupportAgent ? (
                  <div className="assign-container">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="assign-select"
                    >
                      <option value="" disabled>
                        Change Status
                      </option>
                      {allowedStatuses().map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      className="status-update-btn"
                      onClick={handleUpdateStatus}
                    >
                      Update Status
                    </button>
                  </div>
                ) : (
                  <span className="detail-value">{ticket.status}</span>
                )}
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
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet.</p>
              ) : (
                comments.map((comment) => {
                  const isOwner = currentUserId === parseInt(comment.userId);
                  const canDeleteComment = isOwner || isAdmin || isManager;

                  return (
                    <div className="comment" key={comment.id}>
                      <div className="avatar">
                        {comment.userName?.charAt(0).toUpperCase()}
                      </div>

                      <div className="comment-body">
                        <div className="comment-header">
                          <strong className="comment-user">
                            {comment.userName}
                          </strong>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="edit-comment-container">
                            <textarea
                              value={editedComment}
                              onChange={(e) => setEditedComment(e.target.value)}
                              className="edit-comment-textarea"
                            />
                            <div className="edit-actions">
                              <button
                                className="save-edit-btn"
                                onClick={() => handleSaveEdit(comment.id)}
                              >
                                Save
                              </button>
                              <button
                                className="cancel-edit-btn"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="comment-content">
                            <p className="comment-text">{comment.comment}</p>
                            <div className="comment-buttons">
                              {isOwner && (
                                <button
                                  className="comment-icon-btn edit-btn"
                                  onClick={() => handleEditComment(comment)}
                                >
                                  <FaEdit />
                                </button>
                              )}
                              {canDeleteComment && (
                                <button
                                  className="comment-icon-btn delete-btn"
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="comment-input">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
              />
              <button className="send-btn" onClick={handleAddComment}>
                Add Comment
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TicketDetails;
