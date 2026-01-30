import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { PlantsAPI, GardenAPI } from "../api";
import { AuthContext } from "../contexts/AuthContext";
import PlantCard from "../components/PlantCard";
import "./PlantsList.css";

export default function PlantsList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const { user } = useContext(AuthContext);

  // Frontend only pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PLANTS_PER_PAGE = 6; // change if you want more or fewer per page

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("none"); // "none" = Any field
  const [maintenanceFilter, setMaintenanceFilter] = useState("all"); // all, low, medium, high

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


  // --- NEW: Add to Garden Handler ---
  async function handleAddToGarden(plant) {
    if (!user) {
      alert("Please log in to add plants to your garden.");
      return;
    }

    // Default nickname is the first common name
    const defaultName = Array.isArray(plant.common_name) 
      ? plant.common_name[0] 
      : plant.common_name;

    const nickname = window.prompt(`Give your ${defaultName} a nickname:`, defaultName);
    
    if (nickname === null) return; // User cancelled

    try {
      await GardenAPI.add(plant._id, nickname);
      alert(`🌱 Successfully added ${nickname} to your garden!`);
    } catch (e) {
      alert(e.message || "Failed to add to garden");
    }
  }


  // --- EXISTING HANDLERS ---
  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }

  function handleFieldChange(event) {
    const value = event.target.value;
    setSearchField(value);
    setCurrentPage(1);

    // when leaving maintenance, reset the level filter
    if (value !== "maintenance") {
      setMaintenanceFilter("all");
    }
  }

  function handleMaintenanceFilterChange(event) {
    setMaintenanceFilter(event.target.value);
    setCurrentPage(1);
  }

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

  // ----- HELPER: lowercase safely -----
  function lower(value) {
    if (value == null) return "";
    return String(value).toLowerCase();
  }

  // ----- FILTERING (includes maintenance level dropdown) -----
  const query = searchTerm.trim().toLowerCase();

  const filteredPlants = plants.filter((plant) => {
    const commonArray = Array.isArray(plant.common_name)
      ? plant.common_name
      : [plant.common_name || ""];
    const common = lower(commonArray.join(" "));
    const scientific = lower(plant.scientific_name || "");
    const family = lower(plant.family || "");
    const maintenance = lower(plant.maintenance_level || "");

    // Genus from scientific name (first word)
    const genusFromScientific = scientific.split(/\s+/)[0] || "";

    // Fallback: entire object string, for "Any field"
    let full = "";
    try {
      full = lower(JSON.stringify(plant));
    } catch {
      full = "";
    }

    // 1) Maintenance level filter (low / medium / high) only applies when field = maintenance
    if (searchField === "maintenance" && maintenanceFilter !== "all") {
      const level = maintenanceFilter; // "low" | "medium" | "high"
      if (!maintenance.includes(level)) {
        return false;
      }
    }

    // 2) If there is NO search text, and we passed the maintenance filter (if any),
    //    keep the plant (we'll handle sorting separately).
    if (query === "") {
      return true;
    }

    // 3) If there IS search text, apply field-specific matching
    if (searchField === "family") {
      return family.includes(query);
    }

    if (searchField === "genus") {
      return genusFromScientific.includes(query);
    }

    if (searchField === "maintenance") {
      return maintenance.includes(query);
    }

    // "none" = Any field
    return (
      common.includes(query) ||
      scientific.includes(query) ||
      family.includes(query) ||
      maintenance.includes(query) ||
      genusFromScientific.includes(query) ||
      full.includes(query)
    );
  });

  // ----- SORTING when query is empty and a field is selected -----
  let sortedPlants = filteredPlants;

  if (query === "" && searchField === "family") {
    sortedPlants = [...filteredPlants].sort((a, b) => {
      const fa = lower(a.family || "");
      const fb = lower(b.family || "");
      return fa.localeCompare(fb);
    });
  } else if (query === "" && searchField === "genus") {
    sortedPlants = [...filteredPlants].sort((a, b) => {
      // handle common_name being string OR array
      const ca = Array.isArray(a.common_name)
        ? a.common_name.join(" ")
        : a.common_name || "";

      const cb = Array.isArray(b.common_name)
        ? b.common_name.join(" ")
        : b.common_name || "";

      // FIRST WORD of common_name
      const ga = lower(ca).split(/\s+/)[0] || "";
      const gb = lower(cb).split(/\s+/)[0] || "";

      return ga.localeCompare(gb);
    });
  } else if (query === "" && searchField === "maintenance") {
    sortedPlants = [...filteredPlants].sort((a, b) => {
      const ma = lower(a.maintenance_level || "");
      const mb = lower(b.maintenance_level || "");
      return ma.localeCompare(mb);
    });
  }

  // ----- PAGINATION -----
  const totalPages = Math.max(1, Math.ceil(sortedPlants.length / PLANTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PLANTS_PER_PAGE;
  const currentPlants = sortedPlants.slice(
    startIndex,
    startIndex + PLANTS_PER_PAGE
  );

  // build array [1, 2, ..., totalPages] for clickable page numbers
  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <main className="list">
      {/* floating accents */}
      <span className="bubble bubble--green" />
      <span className="bubble bubble--blue" />
      <span className="bubble bubble--purple" />

      <header className="list__header">
        <h2 className="list__title">All Plants</h2>
        {user && user.role === "admin" && (
          <Link to="/plants/new" className="list__add-btn">
            + Add Plant
          </Link>
        )}
      </header>

      {/* Search bar with dropdowns and button */}
      <section className="list__search">
        <label className="list__search-label" htmlFor="plant-search">
          Search plants
        </label>
        <div className="list__search-row">
          <input
            id="plant-search"
            type="text"
            className="list__search-input"
            placeholder="Type here (e.g. Monstera)..."
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <select
            className="list__search-select"
            value={searchField}
            onChange={handleFieldChange}
          >
            <option value="none">Any field</option>
            <option value="family">Family</option>
            <option value="genus">Genus name</option>
            <option value="maintenance">Maintenance level</option>
          </select>

          {searchField === "maintenance" && (
            <select
              className="list__search-select"
              value={maintenanceFilter}
              onChange={handleMaintenanceFilterChange}
            >
              <option value="all">All levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          )}

          <button
            type="button"
            className="list__search-btn"
            onClick={() => {
              // Just trims and sends you back to page 1
              setSearchTerm((prev) => prev.trim());
              setCurrentPage(1);
            }}
          >
            Search
          </button>
        </div>
      </section>

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

        {!loading && !err && plants.length > 0 && sortedPlants.length === 0 && (
          <div className="empty">
            <p>No plants match your search.</p>
          </div>
        )}

        {!loading && !err && sortedPlants.length > 0 && (
          <>
            <div className="grid">
              {currentPlants.map((p) => (
                <PlantCard 
                key={p._id} 
                plant={p} 
                
                userRole={user?.role}
                onAddToGarden={() => handleAddToGarden(p)}
                onDelete={handleDelete}
                
                
                />
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
