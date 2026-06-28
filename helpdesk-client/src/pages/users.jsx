import { useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

import "../styles/Dashboard.css";
import "../styles/users.css";

import NavBar from "../components/navbar";
import TopBar from "../components/topbar";

function Users() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@company.com",
      role: "Employee",
      status: "Active",
      lastActive: "May 21, 11:20 AM",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      role: "Support Agent",
      status: "Active",
      lastActive: "May 21, 11:15 AM",
    },
    {
      id: 3,
      name: "Robert Admin",
      email: "admin@company.com",
      role: "Administrator",
      status: "Inactive",
      lastActive: "May 20, 04:32 PM",
    },
    {
      id: 4,
      name: "Jessica Brown",
      email: "jessica@company.com",
      role: "Employee",
      status: "Active",
      lastActive: "May 19, 08:20 PM",
    },
  ];

  const getRoleClass = (role) => {
    switch (role.toLowerCase()) {
      case "administrator":
        return "admin";
      case "support agent":
        return "support";
      case "employee":
        return "employee";
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

      <main className="main-content">
        <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="users-header">
          <h2 className="page-title">Users Management</h2>

          <div className="users-filters">
            <select>
              <option>All Roles</option>
              <option>Employee</option>
              <option>Support Agent</option>
              <option>Administrator</option>
            </select>

            <select>
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <button className="add-user-btn">
              <FaPlus />
              Add User
            </button>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>

                  <td>{user.email}</td>

                  <td>
                    <span className={`role-badge ${getRoleClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        user.status === "Active"
                          ? "status resolved"
                          : "status closed"
                      }
                    >
                      {user.status}
                    </span>
                  </td>

                  <td>{user.lastActive}</td>

                  <td className="actions">
                    <button className="action-btn edit-btn">
                      <FaEdit />
                    </button>

                    <button className="action-btn delete-btn">
                      <FaTrash />
                    </button>
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

export default Users;
