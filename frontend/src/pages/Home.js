import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { GardenAPI } from "../api";
import "./Home.css";

// --- SUB-COMPONENT: The Guest Landing View (Your Original Design) ---
function LandingView({ handleSearchSubmit }) {
  return (
    <>
      <section className="hero">
        <h2 className="hero__title">Grow. Track. Thrive.</h2>
        <p className="hero__text">
          Manage your garden with simple create, read, update, and delete tools. 
          Keep every plant healthy and every task on time.
        </p>
        <div className="hero__cta">
          <Link to="/login" className="btn btn--primary">
            Login to Start
          </Link>
          <Link to="/register" className="btn btn--secondary">
            Register
          </Link>
        </div>

        {/* Pixel-style search bar inside hero box */}
        <form className="hero__search" onSubmit={handleSearchSubmit}>
          <div className="hero__search-row">
            <input
              type="text"
              name="query"
              className="hero__search-input"
              placeholder="SEARCH PLANTS..."
            />
            <select
              name="field"
              className="hero__search-select"
              defaultValue="none"
            >
              <option value="none">ANY FIELD</option>
              <option value="family">FAMILY</option>
              <option value="genus">GENUS NAME</option>
              <option value="maintenance">MAINTENANCE LEVEL</option>
            </select>
            <select
              name="sort"
              className="hero__search-select"
              defaultValue="none"
            >
              <option value="none">SORT</option>
              <option value="az">A-Z</option>
            </select>
            <button
              type="submit"
              className="btn btn--primary hero__search-btn"
            >
              SEARCH
            </button>
          </div>
        </form>
      </section>

      <section className="features">
        <article className="card">
          <div className="card__icon card__icon--green" />
          <h3 className="card__title">Quick Entries</h3>
          <p className="card__text">
            Add plants and notes in seconds. Save time while keeping records complete.
          </p>
        </article>

        <article className="card">
          <div className="card__icon card__icon--blue" />
          <h3 className="card__title">Smart Views</h3>
          <p className="card__text">
            See what needs watering or pruning today with clean filters and lists.
          </p>
        </article>

        <article className="card">
          <div className="card__icon card__icon--purple" />
          <h3 className="card__title">Safe Changes</h3>
          <p className="card__text">
            Edit or remove items with confidence. Your data stays consistent across pages.
          </p>
        </article>
      </section>
    </>
  );
}

// --- SUB-COMPONENT: The User's "My Garden" Dashboard ---
function GardenDashboard({ user }) {
  const [garden, setGarden] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the garden data
  async function loadGarden() {
    try {
      const data = await GardenAPI.list();
      setGarden(data);
    } catch (err) {
      setError("Could not load your garden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGarden();
  }, []);

  // Handle Remove Plant
  async function handleRemove(id, name) {
    if (!window.confirm(`Remove ${name} from your garden?`)) return;
    try {
      await GardenAPI.remove(id);
      setGarden((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert("Failed to remove plant");
    }
  }

  // Handle Watering Action
  async function handleWater(id) {
    try {
      await GardenAPI.logAction(id, "water");
      loadGarden(); 
    } catch (err) {
      alert("Failed to log watering");
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="hero__title" style={{ fontSize: '2rem', marginBottom: '10px' }}>
          My Garden 🌿
        </h2>
        <p className="hero__text" style={{ maxWidth: '600px', margin: '0 auto 30px' }}>
          Welcome back, {user.email.split('@')[0]}! Here are the plants you are currently tracking.
        </p>
        <Link to="/plants" className="btn btn--primary">
            + Add New Plant
        </Link>
      </div>

      {loading && <p className="loading">Loading your garden...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && garden.length === 0 && (
        <div className="empty-state">
          <p>Your garden is currently empty.</p>
        </div>
      )}

      {!loading && !error && garden.length > 0 && (
        <div className="garden-grid">
          {garden.map((item) => {
            const plantInfo = item.plant_id || {}; 
            const commonName = plantInfo.common_name 
              ? (Array.isArray(plantInfo.common_name) ? plantInfo.common_name[0] : plantInfo.common_name) 
              : "Unknown Plant";

            return (
              <div key={item._id} className="garden-card">
                <div className="garden-card__header">
                  <h3>{item.nickname}</h3>
                  <span className="species">{commonName}</span>
                </div>
                
                <div className="garden-card__stats">
                  <div className="stat">
                    <small>Last Watered:</small>
                    <strong>
                      {item.last_watered 
                        ? new Date(item.last_watered).toLocaleDateString() 
                        : "Never"}
                    </strong>
                  </div>
                </div>

                <div className="garden-card__actions">
                  <button 
                    onClick={() => handleWater(item._id)} 
                    className="btn btn--small btn--blue"
                  >
                    Water 💧
                  </button>
                  <button 
                    onClick={() => handleRemove(item._id, item.nickname)} 
                    className="btn btn--small btn--danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get user status

  function handleSearchSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = (formData.get("query") || "").toString().trim();
    const field = (formData.get("field") || "none").toString();
    const sort = (formData.get("sort") || "none").toString();

    const params = new URLSearchParams();

    if (query) params.set("search", query);
    if (field && field !== "none") params.set("field", field);
    if (sort && sort !== "none") params.set("sort", sort);

    const searchString = params.toString();
    if (searchString) {
      navigate(`/plants?${searchString}`);
    } else {
      navigate("/plants");
    }
  }

  return (
    <main className="home">
      {/* floating accents */}
      <span className="bubble bubble--green" />
      <span className="bubble bubble--blue" />
      <span className="bubble bubble--purple" />

      <header className="home__header">
        <div className="brand">
          <div className="brand__dot" />
          <h1 className="brand__name">Meet-Ur Garden</h1>
        </div>

        <nav style={{ display: 'flex', gap: '10px' }}>
          <Link to="/plants" className="btn btn--ghost">
            All Plants
          </Link>
          {/* If user is logged in, show logout, else nothing (handled by hero CTA) */}
          {user && (
            <Link to="/logout" className="btn btn--ghost">
              Logout
            </Link>
          )}
        </nav>
      </header>

      {/* CONDITIONAL RENDER: Dashboard for User, Landing for Guest */}
      {user ? (
        <GardenDashboard user={user} />
      ) : (
        <LandingView handleSearchSubmit={handleSearchSubmit} />
      )}

      <footer className="home__footer">
        <small>© {new Date().getFullYear()} Meet-Ur Garden</small>
      </footer>
    </main>
  );
}