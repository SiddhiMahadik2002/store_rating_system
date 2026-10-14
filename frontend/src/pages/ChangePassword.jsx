
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError(false);

    if (
      newPassword.length < 8 ||
      newPassword.length > 16 ||
      !/[A-Z]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      setError(true);
      setMessage(
        "Password must be 8-16 characters with an uppercase letter and special character."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ oldPassword, newPassword })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(true);
        setMessage(data.message || "Password change failed");
        return;
      }

      setMessage("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch {
      setError(true);
      setMessage("Cannot connect to backend");
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Change Password</h2>

        <input
          type="password"
          placeholder="Current Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          maxLength={16}
          required
        />

        <button type="submit">Update Password</button>

        {message && (
          <p style={{ color: error ? "red" : "green" }}>
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
