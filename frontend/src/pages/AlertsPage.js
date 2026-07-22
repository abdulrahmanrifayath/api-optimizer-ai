import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getAiSmartAlerts } from "../services/aiService";
import { getErrorSummary } from "../services/connectedApiService";
import { FaBell, FaExclamationTriangle, FaCheckCircle, FaFilter, FaInfoCircle, FaCog } from "react-icons/fa";
import "../styles/dashboard.css";

function AlertsPage({ darkMode, setDarkMode }) {
    const [smartAlerts, setSmartAlerts] = useState([]);
    const [errorLogs, setErrorLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [severityFilter, setSeverityFilter] = useState("All");

    // Threshold config state
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
                return { backgroundColor: "#fee2e2", color: "#dc2626" };
            case "medium":
            case "warning":
                return { backgroundColor: "#fef3c7", color: "#b45309" };
            default:
                return { backgroundColor: "#dbeafe", color: "#1e40af" };
        }
    };

    return (
        <div className={`dashboard ${darkMode ? "dark" : ""}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="dashboard-body">
                <Sidebar />
                <main className="content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <h1><FaBell style={{ color: "#dc2626", marginRight: "8px" }} /> Smart Telemetry & Anomaly Alerts</h1>
                            <p style={{ color: "#6b7280", margin: "4px 0 0 0" }}>
                                AI root-cause explainer, real-time error log detection, and alert threshold configuration.
                            </p>
                        </div>
                    </div>

                    {/* Alert Threshold Settings Card */}
                    <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
                        <h3 style={{ margin: "0 0 12px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FaCog style={{ color: "#2563eb" }} /> Alert Threshold Rules & Notification Channels
                        </h3>
                        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
                            <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                                Max Latency Alert Threshold:
                                <input
                                    type="number"
                                    value={thresholds.maxLatencyMs}
                                    onChange={(e) => setThresholds({ ...thresholds, maxLatencyMs: parseInt(e.target.value) })}
                                    style={{ marginLeft: "8px", padding: "6px 10px", borderRadius: "4px", border: "1px solid #d1d5db", width: "100px" }}
                                /> ms
                            </label>
                            <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                                Max Error Rate Threshold:
                                <input
                                    type="number"
                                    step="0.5"
                                    value={thresholds.maxErrorRatePct}
                                    onChange={(e) => setThresholds({ ...thresholds, maxErrorRatePct: parseFloat(e.target.value) })}
                                    style={{ marginLeft: "8px", padding: "6px 10px", borderRadius: "4px", border: "1px solid #d1d5db", width: "80px" }}
                                /> %
                            </label>
                            <label style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <input
                                    type="checkbox"
                                    checked={thresholds.enableEmailAlerts}
                                    onChange={(e) => setThresholds({ ...thresholds, enableEmailAlerts: e.target.checked })}
                                /> Email Alerts
                            </label>
                            <label style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <input
                                    type="checkbox"
                                    checked={thresholds.enableWebhookAlerts}
                                    onChange={(e) => setThresholds({ ...thresholds, enableWebhookAlerts: e.target.checked })}
                                /> Slack/Webhook Alerts
                            </label>
                        </div>
                    </div>

                    {/* Smart AI Alerts */}
                    <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                            <h3><FaExclamationTriangle style={{ color: "#d97706", marginRight: "8px" }} /> AI Explainer & Smart Anomaly Alerts</h3>
                            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}>
                                <option value="All">All Severities</option>
                                <option value="High">High Severity</option>
                                <option value="Medium">Medium Severity</option>
                                <option value="Low">Low Severity</option>
                            </select>
                        </div>

                        {loading ? (
                            <p style={{ color: "#6b7280" }}>Loading smart alerts...</p>
                        ) : smartAlerts.length === 0 ? (
                            <p style={{ color: "#16a34a", fontWeight: "bold" }}>✅ No anomaly alerts detected. System is running cleanly.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                {smartAlerts
                                    .filter((a) => severityFilter === "All" || a.severity === severityFilter)
                                    .map((alert) => (
                                        <div key={alert.id} style={{ padding: "16px", borderRadius: "6px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <h4 style={{ margin: 0, color: "#1e293b" }}>{alert.title}</h4>
                                                <span style={{ fontSize: "12px", fontWeight: "bold", padding: "3px 8px", borderRadius: "4px", ...getSeverityBadgeStyle(alert.severity) }}>
                                                    {alert.severity || "Medium"}
                                                </span>
                                            </div>
                                            <p style={{ margin: "8px 0 4px 0", fontSize: "14px", color: "#334155" }}>
                                                <strong>🧠 AI Root Cause Explanation:</strong> {alert.explanation}
                                            </p>
                                            <p style={{ margin: 0, fontSize: "13px", color: "#16a34a", fontWeight: "bold" }}>
                                                💡 <strong>Suggested Fix:</strong> {alert.suggested_fix}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Detected Error Logs History */}
                    <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                        <h3>Detected Error Log Traces (Module 4)</h3>
                        <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "15px" }}>
                            Auto-detected HTTP 5xx, 4xx, Timeouts, SSL Errors, and Connection Failures.
                        </p>
                        {errorLogs.length === 0 ? (
                            <p style={{ color: "#6b7280" }}>No error logs detected.</p>
                        ) : (
                            <table border="0" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f8fafc", textAlign: "left", fontSize: "12px", color: "#6b7280" }}>
                                        <th>Timestamp</th><th>Error Type</th><th>Status Code</th><th>Details & Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {errorLogs.map((err) => (
                                        <tr key={err.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13px" }}>
                                            <td>{new Date(err.timestamp).toLocaleString()}</td>
                                            <td><span style={{ padding: "2px 6px", borderRadius: "4px", fontWeight: "bold", backgroundColor: "#fee2e2", color: "#b91c1c" }}>{err.error_type}</span></td>
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
