import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Account() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div style={{ textAlign: "center", marginTop: "50px", color: "#f3f4f6" }}>Loading account details...</div>;
  }

  return (
    <div style={{ padding: "20px", color: "#f3f4f6", maxWidth: "600px", margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "2rem", color: "#8fd081", margin: 0 }}>My Account 👤</h2>
        <Link to="/" className="btn btn--ghost">Back to Garden</Link>
      </div>

      <p style={{ color: "#9ca3af", marginBottom: "30px" }}>
        Manage your personal details and security settings.
      </p>

      {/* SECTION: PROFILE DETAILS */}
      <div style={{ background: "#1f2937", borderRadius: "12px", padding: "20px", border: "1px solid #374151", marginBottom: "20px" }}>
        <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", fontSize: "1.2rem" }}>
          Profile Information
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#9ca3af" }}>Email Address</span>
            <strong style={{ color: "#e5e7eb" }}>{user.email}</strong>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#9ca3af" }}>Account Privileges</span>
            <span style={{ 
              background: user.role === 'admin' ? "rgba(139, 92, 246, 0.2)" : "rgba(59, 130, 246, 0.2)", 
              color: user.role === 'admin' ? "#c4b5fd" : "#93c5fd",
              padding: "4px 12px", 
              borderRadius: "12px", 
              fontSize: "0.85rem",
              fontWeight: "bold",
              textTransform: "uppercase"
            }}>
              {user.role || 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION: SECURITY & AUTHENTICATION */}
      <div style={{ background: "#1f2937", borderRadius: "12px", padding: "20px", border: "1px solid #374151", marginBottom: "30px" }}>
        <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", fontSize: "1.2rem" }}>
          Security
        </h3>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <div>
            <strong style={{ display: "block" }}>Password</strong>
            <small style={{ color: "#9ca3af" }}>Last changed: Unknown</small>
          </div>
          <button className="btn btn--small btn--ghost" style={{ width: "fit-content", padding: "8px 16px" }}>
            Change Password
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ display: "block" }}>Two-Factor Authentication</strong>
            <small style={{ color: "#9ca3af" }}>Add an extra layer of security</small>
          </div>
          <button className="btn btn--small btn--ghost" style={{ width: "fit-content", padding: "8px 16px" }}>
            Set Up 2FA
          </button>
        </div>
      </div>

    </div>
  );
}