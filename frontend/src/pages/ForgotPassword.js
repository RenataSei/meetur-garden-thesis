// src/pages/ForgotPassword.js
import { useState } from "react";
import { Link } from "react-router-dom";
import { UserAPI } from "../api";
import "./Home.css";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);

    try {
      // CLEAN API CALL
      await UserAPI.forgotPassword(email);
      
      setMsg("If an account with that email exists, a reset link has been sent.");
      setEmail(""); // Clear the input
    } catch (err) {
      console.error(err);
      setError(err.message || "Network error. Please try again later.");
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
            <h2 className="auth-card__title" style={{ color: "black" }}>Reset Password</h2>
            <p className="auth-card__subtitle">
              Enter the email associated with your account, and we'll send you a link to reset your password.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <label className="auth-label">Email Address</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ background: "#0f172a" }}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}
              {msg && <p style={{ color: "#22c55e", fontSize: "0.9rem", textAlign: "center", marginTop: "10px" }}>{msg}</p>}

              <div className="auth-actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={loading}
                  style={{ width: "100%", background: "#38bdf8" }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>

            <div className="auth-footer">
              Remember your password? <Link to="/login">Back to Login</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}