import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getAiSmartAlerts } from "../services/aiService";
import { getErrorSummary } from "../services/connectedApiService";
import { FaBell, FaExclamationTriangle, FaCog } from "react-icons/fa";
import "../styles/dashboard.css";

function AlertsPage({ darkMode, setDarkMode }) {
    const [smartAlerts, setSmartAlerts] = useState([]);
    const [errorLogs, setErrorLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [severityFilter, setSeverityFilter] = useState("All");

    const [thresholds, setThresholds] = useState({
        maxLatencyMs: 500,
        maxErrorRatePct: 5.0,
        enableEmailAlerts: true,
        enableWebhookAlerts: false,
    });

    const loadAlertsData = async () => {
        setLoading(true);
        try {
            const [smartRes, errorsRes] = await Promise.all([
                getAiSmartAlerts().catch(() => []),
                getErrorSummary().catch(() => []),
            ]);

            setSmartAlerts(smartRes);
            setErrorLogs(errorsRes);
        } catch (err) {
            console.error("Failed to load alerts data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlertsData();
    }, []);

    const getSeverityBadgeStyle = (severity) => {
        switch (severity?.toLowerCase()) {
            case "high":
            case "critical":
                return { backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444" };
            case "medium":
            case "warning":
                return { backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#f59e0b" };
            default:
                return { backgroundColor: "rgba(99, 102, 241, 0.2)", color: "#818cf8" };
        }
    };

    return (
        <div className={`dashboard ${darkMode ? "dark" : ""}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="dashboard-body">
                <Sidebar />
                <main className="content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <h1 style={{ color: "var(--text-heading)" }}><FaBell style={{ color: "#ef4444", marginRight: "10px" }} /> Smart Telemetry & Anomaly Alerts</h1>
                            <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                                AI root-cause explainer, real-time error log detection, and alert threshold configuration.
                            </p>
                        </div>
                    </div>

                    {/* Alert Threshold Settings Card */}
                    <div className="chart-card" style={{ marginBottom: "28px" }}>
                        <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "10px" }}>
                            <FaCog style={{ color: "#6366f1" }} /> Alert Threshold Rules & Notification Channels
                        </h3>
                        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
                            <label style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-main)" }}>
                                Max Latency Alert Threshold:
                                <input
                                    type="number"
                                    value={thresholds.maxLatencyMs}
                                    onChange={(e) => setThresholds({ ...thresholds, maxLatencyMs: parseInt(e.target.value) })}
                                    style={{ marginLeft: "10px", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", backgroundColor: "var(--bg-search)", color: "var(--text-main)", width: "110px" }}
                                /> ms
                            </label>
                            <label style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-main)" }}>
                                Max Error Rate Threshold:
                                <input
                                    type="number"
                                    step="0.5"
                                    value={thresholds.maxErrorRatePct}
                                    onChange={(e) => setThresholds({ ...thresholds, maxErrorRatePct: parseFloat(e.target.value) })}
                                    style={{ marginLeft: "10px", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", backgroundColor: "var(--bg-search)", color: "var(--text-main)", width: "90px" }}
                                /> %
                            </label>
                            <label style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)" }}>
                                <input
                                    type="checkbox"
                                    checked={thresholds.enableEmailAlerts}
                                    onChange={(e) => setThresholds({ ...thresholds, enableEmailAlerts: e.target.checked })}
                                /> Email Alerts
                            </label>
                            <label style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)" }}>
                                <input
                                    type="checkbox"
                                    checked={thresholds.enableWebhookAlerts}
                                    onChange={(e) => setThresholds({ ...thresholds, enableWebhookAlerts: e.target.checked })}
                                /> Slack/Webhook Alerts
                            </label>
                        </div>
                    </div>

                    {/* Smart AI Alerts */}
                    <div className="chart-card" style={{ marginBottom: "28px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h3 style={{ margin: 0, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "10px" }}><FaExclamationTriangle style={{ color: "#f59e0b" }} /> AI Explainer & Smart Anomaly Alerts</h3>
                            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", backgroundColor: "var(--bg-search)", color: "var(--text-main)" }}>
                                <option value="All">All Severities</option>
                                <option value="High">High Severity</option>
                                <option value="Medium">Medium Severity</option>
                                <option value="Low">Low Severity</option>
                            </select>
                        </div>

                        {loading ? (
                            <p style={{ color: "var(--text-muted)" }}>Loading smart alerts...</p>
                        ) : smartAlerts.length === 0 ? (
                            <p style={{ color: "#10b981", fontWeight: "bold" }}>✅ No anomaly alerts detected. System is running cleanly.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {smartAlerts
                                    .filter((a) => severityFilter === "All" || a.severity === severityFilter)
                                    .map((alert) => (
                                        <div key={alert.id} style={{ padding: "18px", borderRadius: "14px", backgroundColor: "var(--table-row-bg)", border: "1px solid var(--border-card)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <h4 style={{ margin: 0, color: "var(--text-heading)" }}>{alert.title}</h4>
                                                <span style={{ fontSize: "12px", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px", ...getSeverityBadgeStyle(alert.severity) }}>
                                                    {alert.severity || "Medium"}
                                                </span>
                                            </div>
                                            <p style={{ margin: "10px 0 6px 0", fontSize: "14px", color: "var(--text-main)" }}>
                                                <strong>🧠 AI Root Cause Explanation:</strong> {alert.explanation}
                                            </p>
                                            <p style={{ margin: 0, fontSize: "13px", color: "#10b981", fontWeight: "bold" }}>
                                                💡 <strong>Suggested Fix:</strong> {alert.suggested_fix}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Detected Error Logs History */}
                    <div className="chart-card">
                        <h3 style={{ margin: "0 0 8px 0", color: "var(--text-heading)" }}>Detected Error Log Traces (Module 4)</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
                            Auto-detected HTTP 5xx, 4xx, Timeouts, SSL Errors, and Connection Failures.
                        </p>
                        {errorLogs.length === 0 ? (
                            <p style={{ color: "var(--text-muted)" }}>No error logs detected.</p>
                        ) : (
                            <table className="activity-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th><th>Error Type</th><th>Status Code</th><th>Details & Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {errorLogs.map((err) => (
                                        <tr key={err.id}>
                                            <td>{new Date(err.timestamp).toLocaleString()}</td>
                                            <td><span style={{ padding: "3px 10px", borderRadius: "20px", fontWeight: "bold", backgroundColor: "rgba(239,68,68,0.2)", color: "#ef4444" }}>{err.error_type}</span></td>
                                            <td>{err.status_code || "N/A"}</td>
                                            <td>{err.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AlertsPage;
