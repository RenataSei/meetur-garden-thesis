import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { API_BASE } from "../api";

export default function Profile() {
  const { user, dispatch } = useContext(AuthContext);

  // --- Profile State ---
  const [nickname, setNickname] = useState("");
  const [birthday, setBirthday] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // --- Password State ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  // Load existing profile data on mount
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || "");
      if (user.birthday) {
        // Convert ISO date string to YYYY-MM-DD format for the HTML date input
        setBirthday(new Date(user.birthday).toISOString().split('T')[0]);
      }
    }
  }, [user]);

  // 1. Save Profile Function
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileMessage("");

    try {
      const response = await fetch(`${API_BASE}/user/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          // We must send the existing settings back so they don't get overwritten!
          alertsEnabled: user.settings?.alertsEnabled ?? true,
          hapticsEnabled: user.settings?.hapticsEnabled ?? true,
          customLocation: user.settings?.customLocation ?? "",
          // And the new profile data
          nickname,
          birthday: birthday || null
        })
      });

      const json = await response.json();
      if (!response.ok) throw new Error("Failed to save profile");

      // Update Local Storage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      storedUser.nickname = json.nickname;
      storedUser.birthday = json.birthday;
      localStorage.setItem("user", JSON.stringify(storedUser));

      // Update React Memory
      dispatch({ 
        type: "UPDATE_USER", 
        payload: { nickname: json.nickname, birthday: json.birthday } 
      });

      setProfileMessage("✅ Profile updated successfully!");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (error) {
      setProfileMessage("❌ Error saving profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 2. Change Password Function
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMessage("❌ Please fill out both password fields.");
      return;
    }

    setIsSavingPassword(true);
    setPasswordMessage("");

    try {
      const response = await fetch(`${API_BASE}/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setPasswordMessage("✅ Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordMessage(""), 4000);
    } catch (error) {
      setPasswordMessage(`❌ ${error.message}`);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div style={{ padding: "20px", color: "#f3f4f6", maxWidth: "600px", margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
      
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "2rem", color: "#8fd081", margin: 0 }}>My Profile 👤</h2>
        <p style={{ color: "#9ca3af", marginTop: "8px" }}>
          Manage your identity, birthday, and security settings.
        </p>
      </div>

      {/* 🟢 SECTION: PUBLIC PROFILE */}
      <div style={{ background: "#1f2937", borderRadius: "12px", padding: "20px", border: "1px solid #374151", marginBottom: "30px" }}>
        <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", fontSize: "1.2rem" }}>Identity</h3>
        
        {profileMessage && (
          <p style={{ color: profileMessage.includes("✅") ? "#8fd081" : "#ef4444", fontSize: "14px", marginBottom: "15px" }}>
            {profileMessage}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <strong style={{ display: "block" }}>Community Nickname</strong>
            <small style={{ color: "#9ca3af" }}>How you appear on the community board</small>
          </div>
          <input 
            type="text" 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)} 
            placeholder="e.g. PlantLover99"
            style={{ background: "#374151", color: "white", border: "1px solid #4b5563", padding: "8px 12px", borderRadius: "6px", outline: "none", width: "160px" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", borderTop: "1px dashed #4b5563", marginBottom: "20px" }}>
          <div>
            <strong style={{ display: "block" }}>Date of Birth</strong>
            <small style={{ color: "#9ca3af" }}>Must be 18+ to access the Community</small>
          </div>
          <input 
            type="date" 
            value={birthday} 
            onChange={(e) => setBirthday(e.target.value)}
            style={{ background: "#374151", color: "white", border: "1px solid #4b5563", padding: "8px 12px", borderRadius: "6px", outline: "none", width: "160px", colorScheme: "dark" }}
          />
        </div>

        <div style={{ display: "flex", justifyItems: "flex-end", justifyContent: "flex-end" }}>
            <button onClick={handleSaveProfile} disabled={isSavingProfile} className="btn btn--primary" style={{ padding: "8px 24px" }}>
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </button>
        </div>
      </div>

      {/* 🟢 SECTION: SECURITY (Change Password) */}
      <div style={{ background: "#1f2937", borderRadius: "12px", padding: "20px", border: "1px solid #374151", marginBottom: "30px" }}>
        <h3 style={{ borderBottom: "1px solid #374151", paddingBottom: "10px", marginBottom: "15px", fontSize: "1.2rem", color: "#ef4444" }}>🔒 Security</h3>
        
        {passwordMessage && (
          <p style={{ color: passwordMessage.includes("✅") ? "#8fd081" : "#ef4444", fontSize: "14px", marginBottom: "15px" }}>
            {passwordMessage}
          </p>
        )}
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>CURRENT PASSWORD</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ width: "100%", background: "#374151", color: "white", border: "1px solid #4b5563", padding: "10px 12px", borderRadius: "6px", outline: "none" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>NEW PASSWORD</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", background: "#374151", color: "white", border: "1px solid #4b5563", padding: "10px 12px", borderRadius: "6px", outline: "none" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyItems: "flex-end", justifyContent: "flex-end" }}>
          <button 
            disabled={isSavingPassword}
            className="btn" 
            style={{ padding: "8px 24px", background: "#ef4444", color: "white", border: "none", opacity: isSavingPassword ? 0.7 : 1 }}
            onClick={handleChangePassword}
          >
            {isSavingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

    </div>
  );
}