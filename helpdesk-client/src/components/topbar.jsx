import { FaBars, FaBell, FaUserCircle } from "react-icons/fa";
import "../styles/topbar.css";

function TopBar({ toggleSidebar }) {
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
  );
}

export default TopBar;
