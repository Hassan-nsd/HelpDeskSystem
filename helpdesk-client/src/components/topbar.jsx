import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaUserCircle } from "react-icons/fa";
import { getNotifications, markNotificationAsRead } from "../services/api";
import "../styles/topbar.css";

function TopBar({ toggleSidebar }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
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

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      );

      if (notification.ticketId) {
        navigate(`/tickets/${notification.ticketId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  function roleName() {
    if (localStorage.roleId == 1) return "Admin";
    if (localStorage.roleId == 2) return "Employee";
    if (localStorage.roleId == 3) return "Support Agent";
    if (localStorage.roleId == 4) return "Manager";
    return "";
  }

  return (
    <header className="topbar">
      <div className="left">
        <FaBars className="menu-btn" onClick={toggleSidebar} />{" "}
        <input type="text" placeholder="Search tickets..." />
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

              {notifications.length === 0 ? (
                <p className="empty-notification">No notifications</p>
              ) : (
                notifications.map((notification) => (
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

        <div className="user-info">
          <FaUserCircle size={35} />
          <div>
            <h4>{localStorage.fullName}</h4>
            <span>{roleName()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
