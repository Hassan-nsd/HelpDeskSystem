import "../styles/Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaHeadset, FaRegUser, FaLock } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5213/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // read raw text first (safe for non-JSON responses)
      const text = await response.text();
      console.log("API raw response:", text);

      // try to parse JSON if possible
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        console.warn("Response is not JSON:", parseErr);
        data = { message: text };
      }

      if (response.ok) {
        localStorage.setItem("token", data?.token);
        localStorage.setItem("roleId", data?.user?.roleId);
        localStorage.setItem("fullName", data?.user?.fullName);

        const roleId = data?.user?.roleId;

        navigate("/Dashboard");
      } else {
        // show server message or raw text
        alert(data?.message ?? data ?? "Login failed");
      }
    } catch (error) {
      console.error("Network or client error:", error);
      alert("Server error");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* LEFT SIDE */}
        <div className="left-panel">
          <div className="brand">
            <FaHeadset className="brand-icon" />
            <div>
              <h3>IT Help Desk</h3>
              <span>Ticketing System</span>
            </div>
          </div>

          <div className="welcome-icon">
            <FaHeadset />
          </div>

          <h1>Welcome Back!</h1>
          <p>Sign in to continue</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-panel">
          <form onSubmit={handleSubmit} className="login-box">
            <h2>Sign In</h2>

            <label>Email</label>
            <div className="input-box">
              <FaRegUser />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label>Password</label>
            <div className="input-box">
              <FaLock />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="options">
              <label className="remember">
                <input type="checkbox" />
                Remember me
              </label>

              <a href="/">Forgot password?</a>
            </div>

            <button className="login-btn" type="submit">Sign In</button>

            <div className="footer-text">
              Don’t have an account?
              <span> Contact Admin</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
