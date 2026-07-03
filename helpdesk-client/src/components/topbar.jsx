import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaUserCircle } from "react-icons/fa";
import { getNotifications, markNotificationAsRead } from "../services/api";
import "../styles/topbar.css";

function TopBar({ toggleSidebar }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();

      console.log("Notifications:", data);

      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newUserPassword) {
      alert("Fill all fields");
      return;
    }

    try {
      const response = await fetch(
        "http://https://helpdesk-api-hassan-byhgdng9emaadxbq.francecentral-01.azurewebsites.net/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword: newUserPassword,
          }),
        },
      );

      if (response.ok) {
        alert("Password changed successfully");

        setShowChangePasswordModal(false);
        setCurrentPassword("");
        setNewUserPassword("");
      } else {
        alert("Failed to change password");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Ticket notifications
      if (notification.ticketId) {
        await markNotificationAsRead(notification.id);

        setNotifications((prev) =>
          prev.filter((n) => n.id !== notification.id),
        );

        navigate(`/tickets/${notification.ticketId}`);
        return;
      }

      // Password help notifications
      if (notification.targetUserId) {
        setSelectedUserId(notification.targetUserId);

        setSelectedNotificationId(notification.id);

        setShowResetModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      alert("Please enter a temporary password.");
      return;
    }

    try {
      const response = await fetch(
        `http://https://helpdesk-api-hassan-byhgdng9emaadxbq.francecentral-01.azurewebsites.net/api/notifications/reset-password/${selectedUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            newPassword,
          }),
        },
      );

      if (response.ok) {
        // Mark notification as read only after success
        if (selectedNotificationId) {
          await markNotificationAsRead(selectedNotificationId);
        }

        setNotifications((prev) =>
          prev.filter((n) => n.id !== selectedNotificationId),
        );

        alert("Password reset successfully.");

        setShowResetModal(false);
        setSelectedUserId(null);
        setSelectedNotificationId(null);
        setNewPassword("");
      } else {
        alert("Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  const closeModal = () => {
    setShowResetModal(false);
    setSelectedUserId(null);
    setSelectedNotificationId(null);
    setNewPassword("");
  };

  function roleName() {
    if (localStorage.roleId == 1) return "Admin";
    if (localStorage.roleId == 2) return "Employee";
    if (localStorage.roleId == 3) return "Support Agent";
    if (localStorage.roleId == 4) return "Manager";
    return "";
  }

  return (
    <>
      <header className="topbar">
        <div className="left">
          <FaBars className="menu-btn" onClick={toggleSidebar} />
        </div>

        <div className="right">
          <div className="notification-wrapper">
            <FaBell
              className="icon"
              onClick={() => setShowNotifications(!showNotifications)}
            />

            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}

            {showNotifications && (
              <div className="notification-dropdown">
                <h4>Notifications</h4>

                {notifications.filter((n) => !n.isRead).length === 0 ? (
                  <p className="empty-notification">No new notifications</p>
                ) : (
                  notifications
                    .filter((n) => !n.isRead)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${
                          !notification.isRead ? "unread" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <p>{notification.message}</p>

                        <small>
                          {new Date(notification.createdAt).toLocaleString()}
                        </small>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>

          <div className="profile-wrapper">
            <div
              className="user-info"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <FaUserCircle size={35} />

              <div>
                <h4>
                  <span id="fullName">{localStorage.fullName}</span>
                </h4>
                <span>{roleName()}</span>
              </div>
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div
                  className="profile-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowChangePasswordModal(true);
                  }}
                >
                  🔒 Change Password
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showChangePasswordModal && (
        <div className="modal-overlay">
          <div className="reset-modal">
            <h2>Change Password</h2>

            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="New password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
            />

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowChangePasswordModal(false)}
              >
                Cancel
              </button>

              <button className="save-btn" onClick={handleChangePassword}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="reset-modal">
            <h2>Reset User Password</h2>

            <p>Enter a temporary password for the user.</p>

            <input
              type="password"
              placeholder="Temporary password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>

              <button className="save-btn" onClick={handleResetPassword}>
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TopBar;
