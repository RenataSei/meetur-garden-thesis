import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import TwoFactorSetup from '../components/TwoFactorSetup';
import { API_BASE } from "../api";




export default function Settings() {
  const { user, dispatch } = useContext(AuthContext); // Get the logged-in user's token

  // UI State
  // Removed tempUnit since we're standardizing on Celsius
  const [alerts, setAlerts] = useState(true);
  const [haptics, setHaptics] = useState(true);
  
  // Status State
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  

  // 🟢 NEW: Load existing settings when the component mounts
  useEffect(() => {
    if (user && user.settings) {
      // Removed tempUnit since we're standardizing on Celsius
      setAlerts(user.settings.alertsEnabled ?? true);
      setHaptics(user.settings.hapticsEnabled ?? true);
      setCustomLocation(user.settings.customLocation || "");
    }
  }, [user]);

  // 🟢 FIXED: Use API_BASE to ensure it always hits your Render server
  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/user/settings`, {
        method: "PUT", // Make sure this matches your backend router.patch! (You had PUT before)
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}` 
        },
        body: JSON.stringify({
          // Removed tempUnit since we're standardizing on Celsius
          alertsEnabled: alerts,
          hapticsEnabled: haptics,
          customLocation
        })
      });

      // 1. Actually grab the JSON response from your backend!
      const json = await response.json(); 

      if (!response.ok) throw new Error("Failed to save settings");
      
      // 2. Update Local Storage so it survives a hard refresh
      const storedUser = JSON.parse(localStorage.getItem("user"));
      storedUser.settings = json.settings;
      localStorage.setItem("user", JSON.stringify(storedUser));

      // 3. 🟢 THE SMOOTH UPDATE: Push new settings into React memory instantly
      dispatch({ type: "UPDATE_USER", payload: { settings: json.settings } });

      setMessage("✅ Preferences successfully saved!");

      // (Optional but recommended): Force a quick reload to ensure the Context updates everywhere 
      // If your AuthContext exports a 'dispatch' function, you can use that instead of a reload!
      window.location.reload();
      
      setMessage("✅ Preferences successfully saved!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Error saving preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: "20px", color: "#f3f4f6", maxWidth: "600px", margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "2rem", color: "#8fd081", margin: 0 }}>Settings ⚙️</h2>
        <Link to="/" className="btn btn--ghost">Back to Garden</Link>
      </div>
      
      <p style={{ color: "#9ca3af", marginBottom: "20px" }}>
        Manage your environment, hardware integrations, and alert preferences.
      </p>

      {/* SUCCESS/ERROR MESSAGE POPUP */}
      {message && (
        <div style={{ padding: "10px", marginBottom: "20px", borderRadius: "6px", background: message.includes("✅") ? "rgba(143, 208, 129, 0.2)" : "rgba(239, 68, 68, 0.2)", color: message.includes("✅") ? "#8fd081" : "#ef4444", border: `1px solid ${message.includes("✅") ? "#8fd081" : "#ef4444"}` }}>
          {message}
        </div>
      )}


      {/* SECTION: LOCATION */}
      <div style={{ background: "#1f2937", borderRadius: "12px", padding: "20px", border: "1px solid #374151", marginBottom: "20px" }}>
        <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", fontSize: "1.2rem" }}>📍 Location</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ display: "block" }}>Garden Location Override</strong>
            <small style={{ color: "#9ca3af" }}>Leave blank to use phone's GPS</small>
          </div>
          <input 
            type="text" 
            value={customLocation} 
            onChange={(e) => setCustomLocation(e.target.value)}
            placeholder="e.g., Tokyo, Manila"
            style={{ background: "#374151", color: "white", border: "1px solid #4b5563", padding: "8px 12px", borderRadius: "6px", outline: "none", width: "150px" }}
          />
        </div>
      </div>

      {/* SECTION: NOTIFICATIONS */}
      <div style={{ background: "#1f2937", borderRadius: "12px", padding: "20px", border: "1px solid #374151", marginBottom: "20px" }}>
        <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", fontSize: "1.2rem" }}>🔔 Smart Alerts</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ display: "block" }}>Context-Aware Warnings</strong>
            <small style={{ color: "#9ca3af" }}>Get warned about extreme heat or sudden rain</small>
          </div>
          <button 
            onClick={() => setAlerts(!alerts)}
            className={`btn btn--small ${alerts ? "btn--blue" : "btn--ghost"}`}
            style={{ width: "fit-content", minWidth: "100px", padding: "8px 16px" }}
          >
            {alerts ? "Enabled" : "Off"}
          </button>
        </div>
      </div>

      {/* SECTION: HARDWARE */}
      <div style={{ background: "#1f2937", borderRadius: "12px", padding: "20px", border: "1px solid #374151", marginBottom: "30px" }}>
        <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", fontSize: "1.2rem" }}>📡 Hardware Integration</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ display: "block" }}>NFC Scan Haptics</strong>
            <small style={{ color: "#9ca3af" }}>Vibrate device on successful tag read</small>
          </div>
          <button 
            onClick={() => setHaptics(!haptics)}
            className={`btn btn--small ${haptics ? "btn--primary" : "btn--ghost"}`}
            style={{ 
              width: "fit-content", minWidth: "100px", padding: "8px 16px",
              ...(haptics ? { background: "#8b5cf6", borderColor: "#8b5cf6" } : {})
            }}
          >
            {haptics ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* 🟢 NEW SECTION: SECURITY & 2FA */}
      <div style={{ marginBottom: "30px" }}>
        <TwoFactorSetup />
      </div>

      {/* SAVE BUTTON */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #374151", paddingTop: "20px", paddingBottom: "40px" }}>
        <button className="btn btn--danger btn--ghost" style={{ padding: "8px 16px" }}>Delete Data</button>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn btn--primary" 
          style={{ padding: "12px 24px", minWidth: "150px" }}
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>

    </div>
  );
}