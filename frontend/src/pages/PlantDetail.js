import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PlantsAPI } from "../api";
import "./PlantDetail.css";

export default function PlantDetail() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    PlantsAPI.get(id)
      .then((data) => {
        setPlant(data);
        setErr("");
      })
      .catch((e) => {
        setPlant(null);
        setErr(e.message || "Plant not found");
      });
  }, [id]);

  // --- NEW: Add to Garden Handler ---
  async function handleAddToGarden() {
    if (!user) {
      alert("Please log in to add plants to your garden.");
      return;
    }

    const defaultName = primaryName;
    const nickname = window.prompt(
      `Give your ${defaultName} a nickname:`,
      defaultName,
    );

    if (nickname === null) return;

    try {
      await GardenAPI.add(plant._id, nickname);
      alert(`🌱 Successfully added ${nickname} to your garden!`);
    } catch (e) {
      alert(e.message || "Failed to add to garden");
    }
  }

  const loading = !plant && !err;

  // Safe helpers so we do not crash if nested objects are missing
  const flower =
    plant &&
    plant.flower_descriptors &&
    typeof plant.flower_descriptors === "object"
      ? plant.flower_descriptors
      : {};

  const ecology =
    plant &&
    plant.ecological_descriptors &&
    typeof plant.ecological_descriptors === "object"
      ? plant.ecological_descriptors
      : {};

  const notes =
    plant && plant.other_notes && typeof plant.other_notes === "object"
      ? plant.other_notes
      : {};

  const commonNames =
    plant && Array.isArray(plant.common_name) ? plant.common_name : [];

  const primaryName = commonNames[0] || "Unnamed plant";
  const altNames = commonNames.slice(1);

  return (
    <main className="detail">
      <div className="detail__header">
        {plant ? (
          <>
            <h1 className="detail__title">{primaryName}</h1>
            <p className="detail__subtitle">
              <span className="detail__label">Species:</span>{" "}
              {plant.scientific_name || "Unknown species"}
            </p>

            {altNames.length > 0 && (
              <p className="detail__alt-names">
                Also known as: {altNames.join(", ")}
              </p>
            )}

            {plant.description && (
              <p className="detail__lead">{plant.description}</p>
            )}
          </>
        ) : (
          <h1 className="detail__title">Plant details</h1>
        )}
      </div>

      <section className="detail__content">
        {loading && <p className="detail__loading">Loading plant details...</p>}

        {err && !loading && <p className="detail__error">{err}</p>}

        {plant && !err && (
          <>
            {/* BASIC INFO */}
            <section className="detail__section">
              <h2 className="detail__section-title">Basic information</h2>
              <dl className="detail__list">
                <div className="detail__row">
                  <dt>Family</dt>
                  <dd>{plant.family || "Not specified"}</dd>
                </div>

                <div className="detail__row">
                  <dt>Genus name</dt>
                  <dd>{plant.genus_name || "Not specified"}</dd>
                </div>

                <div className="detail__row">
                  <dt>Height</dt>
                  <dd>
                    {plant.height != null ? plant.height : "Not specified"}
                  </dd>
                </div>

                <div className="detail__row">
                  <dt>Maintenance level</dt>
                  <dd>{plant.maintenance_level || "Not specified"}</dd>
                </div>

                <div className="detail__row">
                  <dt>Life cycle</dt>
                  <dd>{plant.life_cycle || "Not specified"}</dd>
                </div>
              </dl>
            </section>

            {/* FLOWER DESCRIPTORS */}
            <section className="detail__section">
              <h2 className="detail__section-title">Flower descriptors</h2>
              <ul className="detail__bullets">
                {flower.color && (
                  <li>
                    <span className="detail__bullet-label">Color:</span>{" "}
                    <span>{flower.color}</span>
                  </li>
                )}
                {flower.flower_inflorescence && (
                  <li>
                    <span className="detail__bullet-label">Inflorescence:</span>{" "}
                    <span>{flower.flower_inflorescence}</span>
                  </li>
                )}
                {flower.value && (
                  <li>
                    <span className="detail__bullet-label">Value:</span>{" "}
                    <span>{flower.value}</span>
                  </li>
                )}
                {flower.bloom_time && (
                  <li>
                    <span className="detail__bullet-label">Bloom time:</span>{" "}
                    <span>{flower.bloom_time}</span>
                  </li>
                )}

                {!flower.color &&
                  !flower.flower_inflorescence &&
                  !flower.value &&
                  !flower.bloom_time && (
                    <li className="detail__empty">
                      No flower descriptors saved.
                    </li>
                  )}
              </ul>
            </section>

            {/* ECOLOGICAL DESCRIPTORS */}
            <section className="detail__section">
              <h2 className="detail__section-title">Ecological descriptors</h2>
              <ul className="detail__bullets">
                {ecology.luminance_level && (
                  <li>
                    <span className="detail__bullet-label">
                      Luminance level:
                    </span>{" "}
                    <span>{ecology.luminance_level}</span>
                  </li>
                )}
                {ecology.pH_level && (
                  <li>
                    <span className="detail__bullet-label">pH level:</span>{" "}
                    <span>{ecology.pH_level}</span>
                  </li>
                )}
                {ecology.humidity_level && (
                  <li>
                    <span className="detail__bullet-label">
                      Humidity level:
                    </span>{" "}
                    <span>{ecology.humidity_level}</span>
                  </li>
                )}
                {ecology.water_frequency && (
                  <li>
                    <span className="detail__bullet-label">
                      Water frequency:
                    </span>{" "}
                    <span>{ecology.water_frequency}</span>
                  </li>
                )}
                {ecology.temperature_range && (
                  <li>
                    <span className="detail__bullet-label">
                      Temperature range:
                    </span>{" "}
                    <span>{ecology.temperature_range}</span>
                  </li>
                )}

                {!ecology.luminance_level &&
                  !ecology.pH_level &&
                  !ecology.humidity_level &&
                  !ecology.water_frequency &&
                  !ecology.temperature_range && (
                    <li className="detail__empty">
                      No ecological descriptors saved.
                    </li>
                  )}
              </ul>
            </section>

            {/* OTHER NOTES */}
            {(notes.pests_diseases_notes ||
              notes.propagation_notes ||
              notes.invasive_species_notes ||
              notes.conservation_status_notes ||
              notes.local_permits_notes) && (
              <section className="detail__section">
                <h2 className="detail__section-title">Other notes</h2>
                <ul className="detail__bullets">
                  {notes.pests_diseases_notes && (
                    <li>
                      <span className="detail__bullet-label">
                        Pests and diseases:
                      </span>{" "}
                      <span>{notes.pests_diseases_notes}</span>
                    </li>
                  )}
                  {notes.propagation_notes && (
                    <li>
                      <span className="detail__bullet-label">Propagation:</span>{" "}
                      <span>{notes.propagation_notes}</span>
                    </li>
                  )}
                  {notes.invasive_species_notes && (
                    <li>
                      <span className="detail__bullet-label">
                        Invasive species:
                      </span>{" "}
                      <span>{notes.invasive_species_notes}</span>
                    </li>
                  )}
                  {notes.conservation_status_notes && (
                    <li>
                      <span className="detail__bullet-label">
                        Conservation status:
                      </span>{" "}
                      <span>{notes.conservation_status_notes}</span>
                    </li>
                  )}
                  {notes.local_permits_notes && (
                    <li>
                      <span className="detail__bullet-label">
                        Local permits:
                      </span>{" "}
                      <span>{notes.local_permits_notes}</span>
                    </li>
                  )}
                </ul>
              </section>
            )}

            <div className="detail__actions">
              <Link
                className="btn btn--primary"
                to={`/plants/${plant._id}/edit`}
              >
                Edit Plant
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
