import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  function handleSearchSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = (formData.get("query") || "").toString().trim();
    const field = (formData.get("field") || "none").toString();
    const sort = (formData.get("sort") || "none").toString();

    const params = new URLSearchParams();

    if (query) {
      params.set("search", query);
    }
    if (field && field !== "none") {
      params.set("field", field);
    }
    if (sort && sort !== "none") {
      params.set("sort", sort);
    }

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

        <nav>
          <Link to="/plants" className="btn btn--ghost">
            Plants
          </Link>
        </nav>
      </header>

      <section className="hero">
        <h2 className="hero__title">Grow. Track. Thrive.</h2>
        <p className="hero__text">
          Manage your garden with simple create, read, update, and delete tools. 
          Keep every plant healthy and every task on time.
        </p>
        <div className="hero__cta">
          <Link to="/plants" className="btn btn--primary">
            Manage Garden
          </Link>
          <Link to="/plants/new" className="btn btn--secondary">
            Add New Plant
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

      <footer className="home__footer">
        <small>© {new Date().getFullYear()} Meet-Ur Garden</small>
      </footer>
    </main>
  );
}
