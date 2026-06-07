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
} from "react-icons/fa";
import "../styles/navbar.css";

function NavBar() {
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
          <FaPlusSquare /> Create Ticket
        </NavLink>
      );
    }
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        <h2>IT Help Desk</h2>
        <span>Ticketing System</span>
      </div>

      <nav>
        {/* NavLink automatically handles your active classes based on route */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaHome /> Dashboard
        </NavLink>

        {addCreateTicket()}

        {/* <NavLink
          to="/create-ticket"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaPlusSquare /> Create Ticket
        </NavLink> */}

        <NavLink
          to="/tickets"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaTicketAlt /> My Tickets
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaChartBar /> Reports
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaUsers /> Users
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FaCog /> Settings
        </NavLink>

        <a id="logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </a>
      </nav>
    </aside>
  );
}

export default NavBar;
