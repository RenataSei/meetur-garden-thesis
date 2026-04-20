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
        // Only set if it's actually an array to prevent .filter crashes
        if (Array.isArray(data)) {
          setUsersList(data);
        }
      })
      .catch(err => console.error("Error fetching users:", err));

    // Fetch Plants safely
    fetch(`${API_BASE}/plants`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        const plantsArray = Array.isArray(data.plants) ? data.plants : Array.isArray(data) ? data : [];
        
        // Safe Sorting (prevents crashes if a plant is missing a family or name)
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

  // Extra safety checks for rendering
  const safeUsersList = Array.isArray(usersList) ? usersList : [];
  const safePlantsList = Array.isArray(plantsList) ? plantsList : [];

  return (
    <div style={{ padding: "20px", color: "#f3f4f6", maxWidth: "1200px", margin: "0 auto" }}>
      <style>
        {`
          table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #1f2937; border-radius: 8px; overflow: hidden; }
          th, td { padding: 15px; text-align: left; border-bottom: 1px solid #374151; }
          th { background: #111827; color: #8fd081; font-weight: bold; text-transform: uppercase; font-size: 0.85rem; }
          tr:hover { background: #374151; }
          .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          
          @media print {
            .no-print { display: none !important; }
            table { border: 1px solid black; }
            th, td { color: black; border-bottom: 1px solid #ccc; }
            body { background: white; color: black; }
          }
        `}
      </style>

      <div className="report-header no-print">
        <h2 style={{ color: "#38bdf8", margin: 0 }}>System Reports & Tracking</h2>
        <button onClick={handlePrint} className="btn btn--primary" style={{ background: "#8b5cf6" }}>
          🖨️ Export / Print PDF
        </button>
      </div>

      <div className="no-print" style={{ display: "flex", gap: "10px", borderBottom: "1px solid #374151", paddingBottom: "15px", marginBottom: "20px" }}>
        <button className="btn" style={{ background: activeTab === "clients" ? "#8fd081" : "transparent", color: activeTab === "clients" ? "black" : "white" }} onClick={() => setActiveTab("clients")}>Client Tracker</button>
        <button className="btn" style={{ background: activeTab === "plants" ? "#8fd081" : "transparent", color: activeTab === "plants" ? "black" : "white" }} onClick={() => setActiveTab("plants")}>Plant Report</button>
        <button className="btn" style={{ background: activeTab === "users" ? "#8fd081" : "transparent", color: activeTab === "users" ? "black" : "white" }} onClick={() => setActiveTab("users")}>Users Report</button>
      </div>

      {activeTab === "clients" && (
        <div>
          <h3>Client Tracker</h3>
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
          <h3>Global Plant Database Report</h3>
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
          <h3>All Users Report</h3>
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