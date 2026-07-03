import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/resetPassword.css";

function ResetPassword() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password) {
      alert("Enter a temporary password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://helpdesk-api-hassan-byhgdng9emaadxbq.francecentral-01.azurewebsites.net/api/notifications/reset-password/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            newPassword: password,
          }),
        },
      );

      if (response.ok) {
        alert("Password reset successfully");
        navigate("/dashboard");
      } else {
        alert("Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2>Reset User Password</h2>

        <input
          type="password"
          placeholder="Enter temporary password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleReset} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
