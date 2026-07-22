import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../auth/AuthContext";
import { FaCog, FaUser, FaKey, FaClock, FaDatabase, FaSave } from "react-icons/fa";
import "../styles/dashboard.css";

function SettingsPage({ darkMode, setDarkMode }) {
    const { user, logout } = useAuth();

    // Profile form
    const [profile, setProfile] = useState({
        name: user?.name || "Senior Architect",
        email: user?.email || "architect@optimizer.ai",
        currentPassword: "",
        newPassword: "",
    });

    // Telemetry Config
    const [config, setConfig] = useState({
        pollIntervalMinutes: 1,
        logRetentionDays: 30,
        enableAutoMigration: true,
        corsOrigins: "http://localhost:3000, http://127.0.0.1:8000",
    });

    const [savedNotice, setSavedNotice] = useState(false);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
    };

    return (
        <div className={`dashboard ${darkMode ? "dark" : ""}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="dashboard-body">
                <Sidebar />
                <main className="content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div>
                            <h1><FaCog style={{ color: "#4b5563", marginRight: "8px" }} /> System Settings & Telemetry Config</h1>
                            <p style={{ color: "#6b7280", margin: "4px 0 0 0" }}>
                                User account profile, JWT tokens, background scheduler interval, and database retention rules.
                            </p>
                        </div>
                    </div>

                    {savedNotice && (
                        <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "12px 20px", borderRadius: "6px", fontWeight: "bold", marginBottom: "20px" }}>
                            ✅ Settings updated successfully!
                        </div>
                    )}

                    <form onSubmit={handleSaveSettings}>
                        {/* Account Profile Settings */}
                        <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
                            <h3 style={{ margin: "0 0 15px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                <FaUser style={{ color: "#2563eb" }} /> Account & Authentication Settings
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "15px" }}>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Full Name</label>
                                    <input
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Email Address</label>
                                    <input
                                        value={profile.email}
                                        disabled
                                        style={{ ...inputStyle, backgroundColor: "#f3f4f6", color: "#6b7280" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>New Password</label>
                                    <input
                                        type="password"
                                        placeholder="Leave blank to keep current"
                                        value={profile.newPassword}
                                        onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Telemetry & Background Polling Settings */}
                        <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
                            <h3 style={{ margin: "0 0 15px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                <FaClock style={{ color: "#d97706" }} /> Telemetry Engine & Background Polling Config
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "15px" }}>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>APScheduler Polling Interval</label>
                                    <select
                                        value={config.pollIntervalMinutes}
                                        onChange={(e) => setConfig({ ...config, pollIntervalMinutes: parseInt(e.target.value) })}
                                        style={inputStyle}
                                    >
                                        <option value={1}>Every 1 Minute (Default)</option>
                                        <option value={5}>Every 5 Minutes</option>
                                        <option value={15}>Every 15 Minutes</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Telemetry Log Retention Period</label>
                                    <select
                                        value={config.logRetentionDays}
                                        onChange={(e) => setConfig({ ...config, logRetentionDays: parseInt(e.target.value) })}
                                        style={inputStyle}
                                    >
                                        <option value={7}>7 Days</option>
                                        <option value={30}>30 Days (Default)</option>
                                        <option value={90}>90 Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>CORS Allowed Origins</label>
                                    <input
                                        value={config.corsOrigins}
                                        onChange={(e) => setConfig({ ...config, corsOrigins: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save & Logout */}
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", display: "inline-flex", alignItems: "center" }}>
                                <FaSave style={{ marginRight: "6px" }} /> Save System Settings
                            </button>
                            <button type="button" onClick={logout} style={{ padding: "10px 20px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
                                Sign Out
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}

const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" };

export default SettingsPage;
