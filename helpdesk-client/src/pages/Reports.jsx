import { useEffect, useState } from "react";
import NavBar from "../components/navbar";
import TopBar from "../components/topbar";
import { getReports } from "../services/api";

import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import "../styles/reports.css";

const COLORS = ["#2563eb", "#F9B115", "#64748b", "#00E5A8", "#8A5CFF"];

function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await getReports();
      setReport(data);
    } catch (err) {
      console.error(err);
    }
  };

  const pieData = [
    { name: "Open", value: report?.openTickets ?? 0 },
    { name: "In Progress", value: report?.inProgressTickets ?? 0 },
    { name: "Pending", value: report?.pendingTickets ?? 0 },
    { name: "Resolved", value: report?.resolvedTickets ?? 0 },
    { name: "Closed", value: report?.closedTickets ?? 0 },
  ];

  const totalTickets = pieData.reduce((sum, item) => sum + item.value, 0);

  const assignmentData = [
    {
      name: "Assigned",
      value: report?.assignedTickets ?? 0,
    },
    {
      name: "Unassigned",
      value: report?.unassignedTickets ?? 0,
    },
  ];

  const priorityData = [
    {
      name: "Low",
      tickets: report?.lowTickets ?? 0,
    },
    {
      name: "Medium",
      tickets: report?.mediumTickets ?? 0,
    },
    {
      name: "High",
      tickets: report?.highTickets ?? 0,
    },
    {
      name: "Critical",
      tickets: report?.criticalTickets ?? 0,
    },
  ];

  return (
    <div className="dashboard-container">
      <NavBar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="main-content">
        <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <h2 className="page-title">Reports & Analytics</h2>

        <div className="report-cards">
          <div className="report-card">
            <h1>{report?.totalTickets ?? 0}</h1>
            <p>Total Tickets</p>
          </div>

          <div className="report-card">
            <h1>4.6 hrs</h1>
            <p>Avg Resolution Time</p>
          </div>

          <div className="report-card">
            <h1>{report?.openTickets ?? 0}</h1>
            <p>Open Tickets</p>
          </div>

          <div className="report-card">
            <h1>{report?.supportAgentsOnline ?? 0}</h1>
            <p>Support Agents</p>
          </div>
        </div>

        <div className="reports-grid">
          <div className="report-panel">
            <h3>Tickets By Status</h3>

            <div className="pie-container">
              <div className="status-chart">
                <PieChart width={350} height={280}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={100}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>

                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pie-center-number"
                  >
                    {totalTickets}
                  </text>

                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pie-center-label"
                  >
                    Total Tickets
                  </text>
                </PieChart>
              </div>

              <div className="pie-legend">
                {pieData.map((item, index) => {
                  const percentage =
                    totalTickets > 0
                      ? ((item.value / totalTickets) * 100).toFixed(1)
                      : 0;

                  return (
                    <div key={index} className="legend-item">
                      <span
                        className="legend-color"
                        style={{ backgroundColor: COLORS[index] }}
                      />

                      <span>{item.name}</span>

                      <strong>
                        {item.value} ({percentage}%)
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="report-panel">
            <h3>Assignment Overview</h3>

            <div className="pie-container">
              <div className="assignment-chart">
                <PieChart width={350} height={280}>
                  <Pie
                    data={assignmentData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={95}
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#ef4444" />
                  </Pie>
                </PieChart>
              </div>

              <div className="pie-legend">
                {assignmentData.map((item, index) => {
                  const total =
                    (report?.assignedTickets ?? 0) +
                    (report?.unassignedTickets ?? 0);

                  const percentage =
                    total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

                  return (
                    <div key={index} className="legend-item">
                      <span
                        className="legend-color"
                        style={{
                          backgroundColor: index === 0 ? "#2563eb" : "#ef4444",
                        }}
                      />

                      <span>{item.name}</span>

                      <strong>
                        {item.value} ({percentage}%)
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="report-panel full-width">
            <h3>Tickets By Priority</h3>

            <div className="priority-chart">
              <BarChart width={900} height={320} data={priorityData}>
                <CartesianGrid stroke="#1c2d6b" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="tickets" radius={[8, 8, 0, 0]}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#b91c1c" />
                </Bar>
              </BarChart>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Reports;
