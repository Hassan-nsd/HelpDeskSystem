import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaPlusSquare,
  FaTicketAlt,
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
    if (
      localStorage.roleId == 1 ||
      localStorage.roleId == 2 ||
      localStorage.roleId == 4
    ) {
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

  function addReports() {
    if (localStorage.roleId == 1) {
      return (
        <NavLink
          to="/reports"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaChartBar />
          <span>Reports</span>
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

        {addReports()}

        {localStorage.roleId == 1 && (
          <NavLink
            to="/users"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaUsers />
            <span>Users</span>
          </NavLink>
        )}

        <a id="logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span> Logout </span>
        </a>
      </nav>
    </aside>
  );
}

export default NavBar;
