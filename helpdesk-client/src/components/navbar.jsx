import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaPlusSquare,
  FaTicketAlt,
  FaBook,
  FaChartBar,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import "../styles/navbar.css";

function NavBar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  function addCreateTicket() {
    if (localStorage.roleId == 1 || localStorage.roleId == 2) {
      return (
        <NavLink
          to="/createTicket"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaPlusSquare />
          <span>Create Ticket</span>
        </NavLink>
      );
    }
  }

  return (
    <aside className={`sidebar ${isOpen ? "openSidebar" : ""}`}>
      <div className="logo">
        <h2>IT Help Desk</h2>
        <span>Ticketing System</span>
        <FaBars className="menu-btn" onClick={toggleSidebar} />
      </div>

      <nav>
        {/* NavLink automatically handles your active classes based on route */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaHome />
          <span>Dashboard</span>
        </NavLink>

        {addCreateTicket()}

        <NavLink
          to="/tickets"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaTicketAlt />
          <span>My Tickets</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaChartBar />
          <span>Reports</span>
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaUsers />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaCog />
          <span>Settings</span>
        </NavLink>

        <a id="logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span> Logout </span>
        </a>
      </nav>
    </aside>
  );
}

export default NavBar;
