import { useState } from "react";
import { Link } from "react-router-dom";

export default function Tutorials() {
  const [activeTab, setActiveTab] = useState("propagation");

  // --- DATA STRUCTURES ---
  const propagationVideos = [
    { title: "Cutting", embed: "https://youtu.be/b7vBCf6nNU0?si=Ru8dFVTPhn6rS-6B" },
    { title: "Division", embed: "https://youtu.be/PzRZlYtnYFg?si=hW6WvFwys5aNnnPR" },
    { title: "Layering", embed: "https://youtu.be/SkT0EmGk2RI?si=uZASNhwnMJns27_B" },
    { title: "Grafting", embed: "https://youtu.be/QW_kS1ORqQ4?si=P7JVkZH7daD-o4UY" },
    { title: "Budding", embed: "https://youtu.be/e5aww4rtE3o?si=M5xTclVniRm2NNro" },
    
  ];

  const lightTypes = [
    { name: "Full Light", icon: "☀️", desc: "Direct sunlight for at least 6 hours a day. Ideal for most succulents and fruiting plants." },
    { name: "Partial Shade", icon: "⛅", desc: "3-6 hours of sun, preferably in the cooler morning hours. Protect from harsh afternoon sun." },
    { name: "Dappled Light", icon: "🍃", desc: "Sunlight filtered through the leaves of taller trees. Bright, but never direct." },
    { name: "Full Shade", icon: "☁️", desc: "Less than 3 hours of direct sun. Thrives in bright indirect light or ambient room lighting." }
  ];

  return (
    <div style={{ padding: "20px", color: "#f3f4f6", maxWidth: "1000px", margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h2 style={{ fontSize: "2rem", color: "#8fd081", margin: 0 }}>Plant Care Tutorials 📚</h2>
          <p style={{ color: "#9ca3af", marginTop: "5px" }}>Master the art of growing and maintaining your garden.</p>
        </div>
        <Link to="/" className="btn btn--ghost">Back to Garden</Link>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #374151", paddingBottom: "15px", marginBottom: "25px", overflowX: "auto" }}>
        <button 
          onClick={() => setActiveTab("propagation")}
          style={tabStyle(activeTab === "propagation")}
        >
          🌱 Propagation
        </button>
        <button 
          onClick={() => setActiveTab("shade")}
          style={tabStyle(activeTab === "shade")}
        >
          🌤️ Lighting & Shade
        </button>
        <button 
          onClick={() => setActiveTab("watering")}
          style={tabStyle(activeTab === "watering")}
        >
          💧 Watering Guide
        </button>
      </div>

      {/* --- TAB 1: PROPAGATION --- */}
      {activeTab === "propagation" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ marginBottom: "20px", padding: "12px", background: "rgba(143, 208, 129, 0.1)", borderLeft: "4px solid #8fd081", borderRadius: "4px" }}>
            <strong style={{ color: "#8fd081" }}>Reference:</strong> Information and techniques sourced from <em>Plant Cell Technology</em>.
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {propagationVideos.map((video, index) => (
              <div key={index} style={{ background: "#1f2937", borderRadius: "12px", overflow: "hidden", border: "1px solid #374151" }}>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                  <iframe 
                    title={video.title}
                    src={video.embed} 
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    allowFullScreen
                  ></iframe>
                </div>
                <div style={{ padding: "15px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#e5e7eb" }}>{video.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: SHADE DISCUSSION --- */}
      {activeTab === "shade" && (
        <div style={{ animation: "fadeIn 0.3s ease", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          {lightTypes.map((light, index) => (
            <div key={index} style={{ background: "#1f2937", borderRadius: "12px", padding: "20px", border: "1px solid #374151" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>{light.icon}</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#e5e7eb" }}>{light.name}</h3>
              <p style={{ color: "#9ca3af", lineHeight: "1.5", margin: 0 }}>{light.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* --- TAB 3: WATERING --- */}
      {activeTab === "watering" && (
        <div style={{ animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* DISCLAIMER BOX */}
          <div style={{ padding: "15px 20px", background: "rgba(239, 68, 68, 0.1)", borderLeft: "4px solid #ef4444", borderRadius: "4px" }}>
            <h3 style={{ color: "#fca5a5", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              ⚠️ Important Disclaimer
            </h3>
            <p style={{ color: "#fecaca", margin: 0, lineHeight: "1.5" }}>
              The size and material of your pots can drastically vary the water frequency required for the <strong>exact same plant species</strong>. Smaller pots and terracotta materials dry out much faster than large plastic or ceramic containers. Always check the soil moisture manually before watering!
            </p>
          </div>

          <div style={{ background: "#1f2937", borderRadius: "12px", padding: "25px", border: "1px solid #374151" }}>
            <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", color: "#8fd081" }}>Materials</h3>
            <ul style={{ color: "#9ca3af", lineHeight: "1.6", margin: 0, paddingLeft: "20px" }}>
              <li><strong>Watering Can:</strong> Prefer a long-spout can for precise watering at the soil level to keep leaves dry.</li>
              <li><strong>Moisture Meter:</strong> Highly recommended to check moisture levels at the root zone, not just the surface.</li>
              <li><strong>Water Quality:</strong> Use filtered water or let tap water sit out for 24 hours to allow chlorine to evaporate.</li>
            </ul>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <div style={{ background: "#1f2937", borderRadius: "12px", padding: "25px", border: "1px solid #374151" }}>
              <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", color: "#60a5fa" }}>Drainage</h3>
              <p style={{ color: "#9ca3af", lineHeight: "1.6", margin: 0 }}>
                Proper drainage is non-negotiable. Ensure your pots have holes at the bottom. Stagnant water leads directly to root rot, which is the number one cause of houseplant mortality. After watering, never let the plant sit in a saucer of drained water for more than 15 minutes.
              </p>
            </div>

            <div style={{ background: "#1f2937", borderRadius: "12px", padding: "25px", border: "1px solid #374151" }}>
              <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", color: "#a78bfa" }}>Frequency</h3>
              <p style={{ color: "#9ca3af", lineHeight: "1.6", margin: 0 }}>
                Do not water on a strict calendar schedule. Water based on the plant's needs and current environmental conditions (humidity, temperature). As a general rule: water thoroughly until it runs out the bottom, then wait until the top 1-2 inches of soil are dry before watering again.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// Helper function for tab styling
function tabStyle(isActive) {
  return {
    background: isActive ? "rgba(143, 208, 129, 0.2)" : "transparent",
    color: isActive ? "#8fd081" : "#9ca3af",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: isActive ? "bold" : "normal",
    transition: "all 0.2s ease"
  };
}