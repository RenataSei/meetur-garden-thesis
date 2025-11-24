// src/pages/Register.js
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import "./Auth.css";
import { useAuthContext } from "../hooks/useAuthContext";
import { API_BASE } from "../api";


export default function Register() {
  const navigate = useNavigate();
  const { user, dispatch } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("user");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, go to home
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (password !== confirm) {
      setMsg("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Unable to register");
        setLoading(false);
        return;
      }

      // Store and log in directly
      localStorage.setItem("user", JSON.stringify(data));
      dispatch({ type: "LOGIN", payload: data });

      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      setMsg("Network error while registering");
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

          <nav>
            <Link to="/login" className="btn btn--ghost">
              Already have an account
            </Link>
          </nav>
        </header>

        <section className="auth__body">
          <div className="auth-card">
            <h2 className="auth-card__title">Create account</h2>
            <p className="auth-card__subtitle">
              Sign up to track every plant and garden task in one place.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <label className="auth-label">Email</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="auth-label">Password</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="auth-label">Confirm password</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="auth-label">Role</label>
                <select
                  className="auth-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {msg && <p className="auth-error">{msg}</p>}

              <div className="auth-actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>
              </div>
            </form>

            <div className="auth-footer">
              Already registered{" "}
              <Link to="/login">Go to login</Link>
            </div>
          </div>
        </section>

        <footer className="home__footer">
          <small>© {new Date().getFullYear()} Meet-Ur Garden</small>
        </footer>
      </div>
    </main>
  );
}
