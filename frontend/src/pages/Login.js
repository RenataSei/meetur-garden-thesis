// src/pages/Login.js
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import "./Auth.css";
import { useAuthContext } from "../hooks/useAuthContext";
import { API_BASE } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const { user, dispatch } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🟢 NEW: States for 2FA
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");

  // If already logged in, go to home
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🟢 NEW: Include twoFactorToken in the body
        body: JSON.stringify({ email, password, twoFactorToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Unable to login");
        setLoading(false);
        return;
      }

      // 🟢 NEW: Check if the backend is asking for a 2FA code
      if (data.requires2FA) {
        setRequires2FA(true);
        setMsg(null); // Clear any previous errors
        setLoading(false);
        return;
      }

      // data is { email, role, token } from your backend
      localStorage.setItem("user", JSON.stringify(data));
      dispatch({ type: "LOGIN", payload: data });

      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      setMsg("Network error while logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="home auth">
      {/* floating accents same as home */}
      <span className="bubble bubble--green" />
      <span className="bubble bubble--blue" />
      <span className="bubble bubble--purple" />

      <div className="auth__inner">
        {/* header copied from Home */}
        <header className="home__header">
          <div className="brand">
            <div className="brand__dot" />
            <h1 className="brand__name">Meet-Ur Garden</h1>
          </div>

          {/*<nav>
            <Link to="/" className="btn btn--ghost">
              Back to landing
            </Link>
          </nav>*/}
        </header>

        <section className="auth__body">
          <div className="auth-card">
            <h2 className="auth-card__title" style={{ color: "black" }}>
              {requires2FA ? "Two-Factor Auth" : "Welcome back"}
            </h2>
            <p className="auth-card__subtitle">
              {requires2FA
                ? "Enter the 6-digit code from your authenticator app."
                : "Log in to manage your plants, tasks, and garden notes."}
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* 🟢 NEW: Conditionally render inputs based on 2FA requirement */}
              {!requires2FA ? (
                <>
                  <div>
                    <label className="auth-label">Email</label>
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

                  <div>
                    <label className="auth-label">Password</label>
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

                  {/* 🟢 NEW: Forgot Password Link */}
                  <div
                    style={{
                      textAlign: "right",
                      marginTop: "-10px",
                      marginBottom: "15px",
                    }}
                  >
                    <Link
                      to="/forgot-password"
                      style={{
                        color: "#38bdf8",
                        fontSize: "0.85rem",
                        textDecoration: "none",
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </>
              ) : (
                <div>
                  <label className="auth-label">Authenticator Code</label>
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="000000"
                    value={twoFactorToken}
                    onChange={(e) =>
                      setTwoFactorToken(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    style={{
                      fontSize: "20px",
                      letterSpacing: "4px",
                      textAlign: "center",
                      color: "black"
                    }}
                    required
                  />
                </div>
              )}

              {msg && <p className="auth-error">{msg}</p>}

              <div className="auth-actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={
                    loading || (requires2FA && twoFactorToken.length !== 6)
                  }
                  style={{ width: "100%", background: "#22c55e" }}
                >
                  {loading
                    ? "Verifying..."
                    : requires2FA
                      ? "Verify Code"
                      : "Login"}
                </button>
              </div>

              {/* 🟢 NEW: Allow user to go back if they need to change their email/password */}
              {requires2FA && (
                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setRequires2FA(false);
                      setTwoFactorToken("");
                      setMsg(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6b7280",
                      cursor: "pointer",
                      fontSize: "12px",
                      textDecoration: "underline",
                    }}
                  >
                    Go Back
                  </button>
                </div>
              )}
            </form>

            {!requires2FA && (
              <div className="auth-footer">
                Do not have an account yet?{" "}
                <Link to="/register">Create one</Link>
              </div>
            )}
          </div>
        </section>

        <footer className="home__footer">
          <small>© {new Date().getFullYear()} Meet-Ur Garden</small>
        </footer>
      </div>
    </main>
  );
}
