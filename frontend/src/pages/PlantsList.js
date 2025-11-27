import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlantsAPI } from "../api";
import PlantCard from "../components/PlantCard";
import "./PlantsList.css";

export default function PlantsList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Frontend only pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PLANTS_PER_PAGE = 6; // change if you want more or fewer per page

  async function load() {
    try {
      const data = await PlantsAPI.list();
      setPlants(data);
      setCurrentPage(1); // reset to first page when data reloads
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this plant?")) return;

    try {
      await PlantsAPI.delete(id);
      setPlants((list) => {
        const updated = list.filter((p) => p._id !== id);

        // adjust page if we deleted the last item on the last page
        const maxPage = Math.max(1, Math.ceil(updated.length / PLANTS_PER_PAGE));
        if (currentPage > maxPage) {
          setCurrentPage(maxPage);
        }

        return updated;
      });
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  // pagination math
  const totalPages = Math.max(1, Math.ceil(plants.length / PLANTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PLANTS_PER_PAGE;
  const currentPlants = plants.slice(startIndex, startIndex + PLANTS_PER_PAGE);

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  // build array [1, 2, ..., totalPages] for clickable page numbers
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <main className="list">
      {/* floating accents */}
      <span className="bubble bubble--green" />
      <span className="bubble bubble--blue" />
      <span className="bubble bubble--purple" />

      <header className="list__header">
        <h2 className="list__title">Your Garden</h2>
        <Link className="btn btn--primary" to="/plants/new">
          + Add Plant
        </Link>
      </header>

      <section className="list__content">
        {loading && <p className="loading">Loading...</p>}
        {err && <p className="error">{err}</p>}

        {!loading && !err && plants.length === 0 && (
          <div className="empty">
            <p>
              No plants yet. Click <b>Add Plant</b> to create one.
            </p>
          </div>
        )}

        {!loading && !err && plants.length > 0 && (
          <>
            <div className="grid">
              {currentPlants.map((p) => (
                <PlantCard key={p._id} plant={p} onDelete={handleDelete} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="list__pagination">
                <button
                  className="list__page-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className="list__page-numbers">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      className={
                        "list__page-number" +
                        (page === currentPage
                          ? " list__page-number--active"
                          : "")
                      }
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <span className="list__page-info">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="list__page-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
