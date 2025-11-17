import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
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
