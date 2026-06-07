import "../styles/Dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../services/api";
import NavBar from "../components/navbar";
import TopBar from "../components/topbar";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#2563eb", "#F9B115", "#00E5A8", "#8A5CFF"];

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }
  }, []);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const data = [
    { name: "Open", value: dashboard?.openTickets ?? 0 },
    { name: "In Progress", value: dashboard?.inProgressTickets ?? 0 },
    { name: "Resolved", value: dashboard?.resolvedTickets ?? 0 },
    { name: "Closed", value: dashboard?.closedTickets ?? 0 },
  ];

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboard();
        setDashboard(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);
  function roleName() {
    if (localStorage.roleId == 1) {
      return "Admin";
    } else if (localStorage.roleId == 2) {
      return "Employee";
    } else if (localStorage.roleId == 3) {
      return "Support Agent";
    } else if (localStorage.roleId == 4) {
      return "Manager";
    }
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
      default:
        return "";
    }
  };

  function goToTickets() {
    navigate("/tickets");
  }

  return (
    <div className="dashboard-container">
      <NavBar isOpen={sidebarOpen} />
      {/* Main */}
      <main className="main-content">
        <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <h2 className="page-title">Dashboard Overview</h2>

        {/* Cards */}
        <div className="cards">
          <div className="card open">
            <h4>Open Tickets</h4>
            <h1>{dashboard?.openTickets ?? 0}</h1>
            {/* <p>+12 from last week</p> */}
          </div>

          <div className="card progress">
            <h4>In Progress</h4>
            <h1>{dashboard?.inProgressTickets ?? 0}</h1>
            {/* <p>+8 from last week</p> */}
          </div>

          <div className="card resolved">
            <h4>Resolved</h4>
            <h1>{dashboard?.resolvedTickets ?? 0}</h1>
            {/* <p>+18 from last week</p> */}
          </div>

          <div className="card closed">
            <h4>Closed</h4>
            <h1>{dashboard?.closedTickets ?? 0}</h1>
            {/* <p>+20 from last week</p> */}
          </div>
        </div>

        {/* Charts & Table */}
        <div className="content-grid">
          <div className="chart-card">
            <h3>Tickets By Status</h3>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="table-card">
            <div className="table-header">
              <h3>Recent Tickets</h3>
            </div>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Requester</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {dashboard?.recentTickets?.map((ticket) => (
                  <tr key={ticket.referenceNumber}>
                    <td>{ticket.referenceNumber}</td>
                    <td>{ticket.title}</td>

                    <td>{ticket.requester || ticket.createdBy || "-"}</td>

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
                  </tr>
                ))}
              </tbody>{" "}
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
