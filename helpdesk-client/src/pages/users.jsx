import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaBan } from "react-icons/fa";
import {
  getUsers,
  deleteUser,
  deactivateUser,
  createUser,
  updateUser,
} from "../services/api";
import "../styles/Dashboard.css";
import "../styles/users.css";
import NavBar from "../components/navbar";
import TopBar from "../components/topbar";
import Chatbot from "../components/Chatbot";

function Users() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    roleId: 2,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState({
    id: 0,
    fullName: "",
    email: "",
    roleId: 2,
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();

      setAllUsers(data);

      let filtered = [...data];

      if (roleFilter !== "all") {
        filtered = filtered.filter((u) => u.roleId === Number(roleFilter));
      }

      if (statusFilter !== "all") {
        const active = statusFilter === "active";
        filtered = filtered.filter((u) => u.isActive === active);
      }

      setUsers(filtered);
    } catch (err) {
      console.error(err);
      alert("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const confirmDeactivate = async () => {
    try {
      await deactivateUser(selectedUser.id);
      setShowDeactivateModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      await createUser({
        fullName: newUser.fullName,
        email: newUser.email,
        password: newUser.password,
        roleId: Number(newUser.roleId),
      });

      setShowAddModal(false);

      setNewUser({
        fullName: "",
        email: "",
        password: "",
        roleId: 2,
      });

      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1:
        return "Administrator";
      case 2:
        return "Employee";
      case 3:
        return "Support Agent";
      case 4:
        return "Manager";
      default:
        return "Unknown";
    }
  };

  const getRoleClass = (role) => {
    switch (role.toLowerCase()) {
      case "administrator":
        return "admin";
      case "manager":
        return "manager";
      case "support agent":
        return "support";
      case "employee":
        return "employee";
      default:
        return "";
    }
  };

  const applyFilters = (role, status) => {
    let filtered = [...allUsers];

    if (role !== "all") {
      filtered = filtered.filter((u) => u.roleId === Number(role));
    }

    if (status !== "all") {
      const active = status === "active";
      filtered = filtered.filter((u) => u.isActive === active);
    }

    setUsers(filtered);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEditUser({
      ...editUser,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleUpdate = async () => {
    try {
      await updateUser(editUser.id, {
        fullName: editUser.fullName,
        email: editUser.email,
        roleId: Number(editUser.roleId),
      });

      setShowEditModal(false);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;

    setNewUser({
      ...newUser,
      [name]: value,
    });
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
            <select
              value={roleFilter}
              onChange={(e) => {
                const value = e.target.value;
                setRoleFilter(value);
                applyFilters(value, statusFilter);
              }}
            >
              <option value="all">All Roles</option>
              <option value="1">Administrator</option>
              <option value="2">Employee</option>
              <option value="3">Support Agent</option>
              <option value="4">Manager</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(value);
                applyFilters(roleFilter, value);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              className="add-user-btn"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus />
              Add User
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-card">
            <p className="loading-text">Loading users...</p>
          </div>
        ) : (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>

                      <td>{user.email}</td>

                      <td>
                        <span
                          className={`role-badge ${getRoleClass(
                            getRoleName(user.roleId),
                          )}`}
                        >
                          {getRoleName(user.roleId)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            user.isActive
                              ? "status user-active"
                              : "status user-inactive"
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>{new Date(user.createdAt).toLocaleString()}</td>

                      <td className="actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => {
                            setEditUser({
                              id: user.id,
                              fullName: user.fullName,
                              email: user.email,
                              roleId: user.roleId,
                              isActive: user.isActive,
                            });

                            setShowEditModal(true);
                          }}
                        >
                          <FaEdit />
                        </button>

                        {user.isActive && (
                          <button
                            className="action-btn deactivate-btn"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeactivateModal(true);
                            }}
                          >
                            <FaBan />
                          </button>
                        )}

                        <button
                          className="action-btn delete-btn"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {showDeactivateModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Deactivate User</h2>

            <p>
              Are you sure you want to deactivate{" "}
              <strong>{selectedUser?.fullName}</strong>?
            </p>

            <p>
              The user will no longer be able to log in, but all tickets and
              history will remain in the system.
            </p>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowDeactivateModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>

              <button className="save-btn" onClick={confirmDeactivate}>
                Deactivate
              </button>
            </div>
          </div>
          <Chatbot />
        </div>
      )}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Delete User</h2>

            <p>
              Are you sure you want to permanently delete{" "}
              <strong>{selectedUser?.fullName}</strong>?
            </p>

            <p className="delete-warning">
              This action cannot be undone. All tickets, comments,
              notifications, and related data created by this user will be
              permanently removed.
            </p>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>

              <button className="delete-confirm-btn" onClick={confirmDelete}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h2>Edit User</h2>

            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={editUser.fullName}
              onChange={handleEditChange}
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={editUser.email}
              onChange={handleEditChange}
            />

            <label>Role</label>
            <select
              name="roleId"
              value={editUser.roleId}
              onChange={handleEditChange}
            >
              <option value={1}>Administrator</option>
              <option value={2}>Employee</option>
              <option value={3}>Support Agent</option>
              <option value={4}>Manager</option>
            </select>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>

              <button className="save-btn" onClick={handleUpdate}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h2>Add User</h2>

            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={newUser.fullName}
              onChange={handleAddChange}
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleAddChange}
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleAddChange}
            />

            <label>Role</label>
            <select
              name="roleId"
              value={newUser.roleId}
              onChange={handleAddChange}
            >
              <option value={1}>Administrator</option>
              <option value={2}>Employee</option>
              <option value={3}>Support Agent</option>
              <option value={4}>Manager</option>
            </select>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>

              <button className="save-btn" onClick={handleCreate}>
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
