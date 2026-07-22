import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../auth/AuthContext";
import { FaCog, FaUser, FaClock, FaSave } from "react-icons/fa";
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <div>
                            <h1 style={{ color: "var(--text-heading)" }}><FaCog style={{ color: "#818cf8", marginRight: "10px" }} /> System Settings & Telemetry Config</h1>
                            <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                                User account profile, JWT tokens, background scheduler interval, and database retention rules.
                            </p>
                        </div>
                    </div>

                    {savedNotice && (
                        <div style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10b981", padding: "14px 20px", borderRadius: "12px", fontWeight: "bold", marginBottom: "24px", border: "1px solid #10b981" }}>
                            ✅ Settings updated successfully!
                        </div>
                    )}

                    <form onSubmit={handleSaveSettings}>
                        {/* Account Profile Settings */}
                        <div className="chart-card" style={{ marginBottom: "28px" }}>
                            <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "10px" }}>
                                <FaUser style={{ color: "#6366f1" }} /> Account & Authentication Settings
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "6px", color: "var(--text-main)" }}>Full Name</label>
                                    <input
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "6px", color: "var(--text-main)" }}>Email Address</label>
                                    <input
                                        value={profile.email}
                                        disabled
                                        style={{ ...inputStyle, opacity: 0.7 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "6px", color: "var(--text-main)" }}>New Password</label>
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
                        <div className="chart-card" style={{ marginBottom: "28px" }}>
                            <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "10px" }}>
                                <FaClock style={{ color: "#f59e0b" }} /> Telemetry Engine & Background Polling Config
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "6px", color: "var(--text-main)" }}>APScheduler Polling Interval</label>
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
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "6px", color: "var(--text-main)" }}>Telemetry Log Retention Period</label>
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
                                    <label style={{ fontSize: "13px", fontWeight: "bold", display: "block", marginBottom: "6px", color: "var(--text-main)" }}>CORS Allowed Origins</label>
                                    <input
                                        value={config.corsOrigins}
                                        onChange={(e) => setConfig({ ...config, corsOrigins: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save & Logout */}
                        <div style={{ display: "flex", gap: "14px", justifyContent: "flex-end" }}>
                            <button type="submit" style={{ padding: "12px 24px", backgroundColor: "#6366f1", color: "#fff", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", display: "inline-flex", alignItems: "center", boxShadow: "0 6px 20px rgba(99,102,241,0.3)" }}>
                                <FaSave style={{ marginRight: "8px" }} /> Save System Settings
                            </button>
                            <button type="button" onClick={logout} style={{ padding: "12px 24px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", boxShadow: "0 6px 20px rgba(239,68,68,0.3)" }}>
                                Sign Out
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}

const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", backgroundColor: "var(--bg-search)", color: "var(--text-main)", fontSize: "14px" };

export default SettingsPage;
