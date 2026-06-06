import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTickets } from "../services/api";
import "../styles/Dashboard.css";

import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaHome,
  FaPlusSquare,
  FaTicketAlt,
  FaBook,
  FaChartBar,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

function Tickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    loadTickets();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, []);

  const loadTickets = async () => {
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (error) {
      console.error(error);
    }
  };

  function roleName() {
    if (localStorage.roleId == 1) return "Admin";
    if (localStorage.roleId == 2) return "Employee";
    if (localStorage.roleId == 3) return "Support Agent";
    if (localStorage.roleId == 4) return "Manager";
  }

  return (
    <div className="dashboard-container">
      {/* SIDEBAR (same as Dashboard) */}
      <aside className="sidebar">
        <div className="logo">
          <h2>IT Help Desk</h2>
          <span>Ticketing System</span>
        </div>

        <nav>
          <a href="/dashboard">
            <FaHome /> Dashboard
          </a>

          <a>
            <FaPlusSquare /> Create Ticket
          </a>

          <a href="/tickets" className="active">
            <FaTicketAlt /> My Tickets
          </a>

          <a>
            <FaBook /> Knowledge Base
          </a>

          <a>
            <FaChartBar /> Reports
          </a>

          <a>
            <FaUsers /> Users
          </a>

          <a>
            <FaCog /> Settings
          </a>

          <a className="logout">
            <FaSignOutAlt /> Logout
          </a>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        {/* TOPBAR (Dashboard navbar + user profile) */}
        <header className="topbar">
          <div className="left">
            <FaBars />
            <input type="text" placeholder="Search tickets..." />
          </div>

          <div className="right">
            <FaBell className="icon" />

            <div className="user-info">
              <FaUserCircle size={35} />
              <div>
                <h4>{localStorage.fullName}</h4>
                <span>{roleName()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE TITLE */}
        <h2 className="page-title">My Tickets</h2>

        {/* TABLE (UNCHANGED) */}
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.referenceNumber}</td>
                  <td>{ticket.title}</td>
                  <td>
                    <td>{ticket.status}</td>
                    <td>{ticket.priority}</td>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Tickets;
