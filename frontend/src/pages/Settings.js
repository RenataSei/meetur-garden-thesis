import { useState } from "react";
import { Link } from "react-router-dom";

export default function Settings() {
  // Local state just for the UI toggles (can be wired to backend later)
  const [tempUnit, setTempUnit] = useState("Celsius");
  const [alerts, setAlerts] = useState(true);
  const [haptics, setHaptics] = useState(true);

  return (
    <div style={{ padding: "20px", color: "#f3f4f6", maxWidth: "600px", margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "2rem", color: "#8fd081", margin: 0 }}>Settings ⚙️</h2>
        <Link to="/" className="btn btn--ghost">Back to Garden</Link>
      </div>
      
      <p style={{ color: "#9ca3af", marginBottom: "30px" }}>
        Manage your environment, hardware integrations, and alert preferences.
      </p>

      {/* SECTION: ENVIRONMENT */}
      <div style={{ background: "#1f2937", borderRadius: "12px", padding: "20px", border: "1px solid #374151", marginBottom: "20px" }}>
        <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", fontSize: "1.2rem" }}>
          🌍 Environment & Weather
        </h3>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <div>
            <strong style={{ display: "block" }}>Temperature Unit</strong>
            <small style={{ color: "#9ca3af" }}>Display preference for dashboard</small>
          </div>
          <select 
            value={tempUnit} 
            onChange={(e) => setTempUnit(e.target.value)}
            style={{ background: "#374151", color: "white", border: "1px solid #4b5563", padding: "8px 12px", borderRadius: "6px", outline: "none" }}
          >
            <option value="Celsius">Celsius (°C)</option>
            <option value="Fahrenheit">Fahrenheit (°F)</option>
          </select>
        </div>
      </div>

      {/* SECTION: NOTIFICATIONS */}
      <div style={{ background: "#1f2937", borderRadius: "12px", padding: "20px", border: "1px solid #374151", marginBottom: "20px" }}>
        <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", fontSize: "1.2rem" }}>
          🔔 Smart Alerts
        </h3>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <div>
            <strong style={{ display: "block" }}>Context-Aware Warnings</strong>
            <small style={{ color: "#9ca3af" }}>Get warned about extreme heat or sudden rain</small>
          </div>
          <button 
            onClick={() => setAlerts(!alerts)}
            className={`btn btn--small ${alerts ? "btn--blue" : "btn--ghost"}`}
            style={{ width: "80px" }}
          >
            {alerts ? "Enabled" : "Off"}
          </button>
        </div>
      </div>

      {/* SECTION: HARDWARE */}
      <div style={{ background: "#1f2937", borderRadius: "12px", padding: "20px", border: "1px solid #374151" }}>
        <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", fontSize: "1.2rem" }}>
          📡 Hardware Integration
        </h3>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <div>
            <strong style={{ display: "block" }}>NFC Scan Haptics</strong>
            <small style={{ color: "#9ca3af" }}>Vibrate device on successful tag read</small>
          </div>
          <button 
            onClick={() => setHaptics(!haptics)}
            className={`btn btn--small ${haptics ? "btn--primary" : "btn--ghost"}`}
            style={haptics ? { background: "#8b5cf6", borderColor: "#8b5cf6", width: "80px" } : { width: "80px" }}
          >
            {haptics ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button className="btn btn--danger btn--ghost">Delete Account Data</button>
      </div>

    </div>
  );
}