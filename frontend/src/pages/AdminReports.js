import { useState, useEffect } from "react";
import { API_BASE } from "../api";
import { useAuthContext } from "../hooks/useAuthContext";

export default function AdminReports() {
  const { user } = useAuthContext();
  const [usersList, setUsersList] = useState([]);
  const [plantsList, setPlantsList] = useState([]);
  const [activeTab, setActiveTab] = useState("clients");

  useEffect(() => {
    if (!user || !user.token) return;

    // Fetch Users safely
    fetch(`${API_BASE}/user/all`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsersList(data);
      })
      .catch(err => console.error("Error fetching users:", err));

    // Fetch Plants safely
    fetch(`${API_BASE}/plants`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        const plantsArray = Array.isArray(data.plants) ? data.plants : Array.isArray(data) ? data : [];
        
        // Safe Sorting
        const sortedPlants = plantsArray.sort((a, b) => {
          const famA = a.family || "";
          const famB = b.family || "";
          if (famA !== famB) return famA.localeCompare(famB);
          
          const nameA = (a.common_name && a.common_name[0]) ? a.common_name[0] : "";
          const nameB = (b.common_name && b.common_name[0]) ? b.common_name[0] : "";
          if (nameA !== nameB) return nameA.localeCompare(nameB);
          
          const sciA = a.scientific_name || "";
          const sciB = b.scientific_name || "";
          return sciA.localeCompare(sciB);
        });
        
        setPlantsList(sortedPlants);
      })
      .catch(err => console.error("Error fetching plants:", err));
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  // --- DATA CALCULATIONS FOR DASHBOARD COUNTERS ---
  const safeUsersList = Array.isArray(usersList) ? usersList : [];
  const safePlantsList = Array.isArray(plantsList) ? plantsList : [];
  
  const totalUsers = safeUsersList.length;
  const totalPlants = safePlantsList.length;
  
  // Using a Set to automatically filter out duplicate families
  const uniqueFamiliesCount = new Set(
    safePlantsList.map(plant => plant.family).filter(family => family) // filter removes null/undefined
  ).size;
  // ------------------------------------------------

  return (
    <div style={{ padding: "20px", color: "#f3f4f6", maxWidth: "1200px", margin: "0 auto" }}>
      <style>
        {`
          table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #1f2937; border-radius: 8px; overflow: hidden; }
          th, td { padding: 15px; text-align: left; border-bottom: 1px solid #374151; }
          th { background: #111827; color: #8fd081; font-weight: bold; text-transform: uppercase; font-size: 0.85rem; }
          tr:hover { background: #374151; }
          .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          
          /* Dashboard Cards Grid */
          .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .metric-card {
            background: #1f2937;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          @media print {
            .no-print { display: none !important; }
            table { border: 1px solid black; }
            th, td { color: black; border-bottom: 1px solid #ccc; }
            body { background: white; color: black; }
            .dashboard-grid { display: flex; justify-content: space-between; gap: 10px; }
            .metric-card { border: 1px solid black; background: white; color: black; box-shadow: none; width: 30%; }
            .metric-card h4, .metric-card p { color: black !important; }
          }
        `}
      </style>

      <div className="report-header no-print">
        <h2 style={{ color: "#38bdf8", margin: 0 }}>System Reports & Tracking</h2>
        <button onClick={handlePrint} className="btn btn--primary" style={{ background: "#8b5cf6" }}>
          🖨️ Export / Print PDF
        </button>
      </div>

      {/* 🟢 NEW: DASHBOARD SUMMARY CARDS */}
      <div className="dashboard-grid">
        <div className="metric-card" style={{ borderTop: "4px solid #38bdf8" }}>
          <h4 style={{ margin: 0, color: "#9ca3af", textTransform: "uppercase", fontSize: "0.85rem" }}>Registered Users</h4>
          <p style={{ fontSize: "2.5rem", margin: "10px 0 0 0", color: "#f3f4f6", fontWeight: "bold" }}>
            {totalUsers}
          </p>
        </div>

        <div className="metric-card" style={{ borderTop: "4px solid #8fd081" }}>
          <h4 style={{ margin: 0, color: "#9ca3af", textTransform: "uppercase", fontSize: "0.85rem" }}>Total Plants in DB</h4>
          <p style={{ fontSize: "2.5rem", margin: "10px 0 0 0", color: "#f3f4f6", fontWeight: "bold" }}>
            {totalPlants}
          </p>
        </div>

        <div className="metric-card" style={{ borderTop: "4px solid #8b5cf6" }}>
          <h4 style={{ margin: 0, color: "#9ca3af", textTransform: "uppercase", fontSize: "0.85rem" }}>Unique Families</h4>
          <p style={{ fontSize: "2.5rem", margin: "10px 0 0 0", color: "#f3f4f6", fontWeight: "bold" }}>
            {uniqueFamiliesCount}
          </p>
        </div>
      </div>

      <div className="no-print" style={{ display: "flex", gap: "10px", borderBottom: "1px solid #374151", paddingBottom: "15px", marginBottom: "20px" }}>
        <button className="btn" style={{ background: activeTab === "clients" ? "#8fd081" : "transparent", color: activeTab === "clients" ? "black" : "white" }} onClick={() => setActiveTab("clients")}>Client Tracker</button>
        <button className="btn" style={{ background: activeTab === "plants" ? "#8fd081" : "transparent", color: activeTab === "plants" ? "black" : "white" }} onClick={() => setActiveTab("plants")}>Plant Report</button>
        <button className="btn" style={{ background: activeTab === "users" ? "#8fd081" : "transparent", color: activeTab === "users" ? "black" : "white" }} onClick={() => setActiveTab("users")}>Users Report</button>
      </div>

      {activeTab === "clients" && (
        <div>
          <h3 className="no-print">Client Tracker</h3>
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Business Name</th><th>Type</th></tr>
            </thead>
            <tbody>
              {safeUsersList.filter(u => u.accountType === "Client").map(client => (
                <tr key={client._id}>
                  <td>{client.name || "N/A"}</td>
                  <td>{client.email || "N/A"}</td>
                  <td>{client.businessName || "N/A"}</td>
                  <td><span style={{background: "#8fd081", color: "black", padding: "4px 8px", borderRadius: "4px", fontSize: "12px"}}>{client.accountType}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "plants" && (
        <div>
          <h3 className="no-print">Global Plant Database Report</h3>
          <table>
            <thead>
              <tr><th>Family</th><th>Common Name</th><th>Scientific Name</th></tr>
            </thead>
            <tbody>
              {safePlantsList.map(plant => (
                <tr key={plant._id}>
                  <td style={{ color: "#38bdf8" }}>{plant.family || "N/A"}</td>
                  <td>{(plant.common_name && plant.common_name[0]) ? plant.common_name[0] : "N/A"}</td>
                  <td style={{ fontStyle: "italic" }}>{plant.scientific_name || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          <h3 className="no-print">All Users Report</h3>
          <table>
            <thead>
              <tr><th>Business</th><th>Name</th><th>Email</th><th>Role</th></tr>
            </thead>
            <tbody>
              {safeUsersList.map(u => (
                <tr key={u._id}>
                  <td>{u.businessName || "N/A"}</td>
                  <td>{u.name || "N/A"}</td>
                  <td>{u.email || "N/A"}</td>
                  <td style={{ color: u.role === 'admin' ? '#ef4444' : '#9ca3af' }}>{(u.role || "user").toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}