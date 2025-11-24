// src/pages/Login.js
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import "./Auth.css";
import { useAuthContext } from "../hooks/useAuthContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "/api";

export default function Login() {
  const navigate = useNavigate();
  const { user, dispatch } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Unable to login");
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

          <nav>
            <Link to="/" className="btn btn--ghost">
              Back to landing
            </Link>
          </nav>
        </header>

        <section className="auth__body">
          <div className="auth-card">
            <h2 className="auth-card__title">Welcome back</h2>
            <p className="auth-card__subtitle">
              Log in to manage your plants, tasks, and garden notes.
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {msg && <p className="auth-error">{msg}</p>}

              <div className="auth-actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </div>
            </form>

            <div className="auth-footer">
              Do not have an account yet?{" "}
              <Link to="/register">Create one</Link>
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
