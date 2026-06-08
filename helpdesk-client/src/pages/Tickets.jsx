import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTickets } from "../services/api";
import "../styles/Dashboard.css";
import NavBar from "../components/navbar";
import TopBar from "../components/topbar";
import "../styles/tickets.css";

function Tickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

        <h2 className="page-title">My Tickets</h2>
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
                    <span className={`status ${getStatusClass(ticket.status)}`}>
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
