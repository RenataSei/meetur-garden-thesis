// src/pages/ResetPassword.js
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import "./Home.css";
import "./Auth.css";

export default function ResetPassword() {
  const { token } = useParams(); // Grabs the token from the URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/user/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password. The link might be expired.");
      } else {
        setMsg("Password successfully reset! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="home auth">
      <span className="bubble bubble--green" />
      <span className="bubble bubble--blue" />
      <span className="bubble bubble--purple" />

      <div className="auth__inner">
        <header className="home__header">
          <div className="brand">
            <div className="brand__dot" />
            <h1 className="brand__name">Meet-Ur Garden</h1>
          </div>
        </header>

        <section className="auth__body">
          <div className="auth-card">
            <h2 className="auth-card__title" style={{ color: "black" }}>Create New Password</h2>
            <p className="auth-card__subtitle">Please enter your new password below.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <label className="auth-label">New Password</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ background: "#0f172a" }}
                />
              </div>

              <div style={{ marginTop: "15px" }}>
                <label className="auth-label">Confirm New Password</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ background: "#0f172a" }}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}
              {msg && <p style={{ color: "#22c55e", fontSize: "0.9rem", textAlign: "center", marginTop: "10px", fontWeight: "bold" }}>{msg}</p>}

              <div className="auth-actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={loading}
                  style={{ width: "100%", background: "#22c55e", marginTop: "10px" }}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}