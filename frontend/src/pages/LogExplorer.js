import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getLogs, getLogStats, getLogCharts, getEndpointAnalytics, exportLogs, ingestLog, clearLogs } from "../services/apiLogService";
import { FaSearch, FaFilter, FaRedo, FaTrash, FaPlus, FaList, FaCheckCircle, FaClock, FaDownload, FaChartLine, FaServer } from "react-icons/fa";
import "../styles/dashboard.css";

function LogExplorer({ darkMode, setDarkMode }) {
    const [activeTab, setActiveTab] = useState("table"); // "table", "analytics", "charts"
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [chartsData, setChartsData] = useState(null);
    const [endpointAnalytics, setEndpointAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLogId, setExpandedLogId] = useState(null);

    // Filter states
    const [searchEndpoint, setSearchEndpoint] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [selectedStatusCategory, setSelectedStatusCategory] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal state for manual test ingestion
    const [showIngestModal, setShowIngestModal] = useState(false);
    const [ingestForm, setIngestForm] = useState({
        endpoint: "/api/v1/users",
        method: "GET",
        status_code: 200,
        response_time: 45.5,
        response_size: 1200,
    });

    const fetchLogsData = async () => {
        setLoading(true);
        try {
            const [logsRes, statsRes, chartsRes, analyticsRes] = await Promise.all([
                getLogs({
                    endpoint: searchEndpoint,
                    method: selectedMethod,
                    status_category: selectedStatusCategory,
                    page: page,
                    limit: 15,
                }),
                getLogStats(),
                getLogCharts(24).catch(() => null),
                getEndpointAnalytics().catch(() => []),
            ]);

            setLogs(logsRes.items || []);
            setTotalPages(logsRes.total_pages || 1);
            setTotalItems(logsRes.total || 0);
            setStats(statsRes);
            if (chartsRes) setChartsData(chartsRes);
            if (analyticsRes) setEndpointAnalytics(analyticsRes);
        } catch (err) {
            console.error("Failed to load telemetry logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogsData();
    }, [page, selectedMethod, selectedStatusCategory]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchLogsData();
    };

    const handleResetFilters = () => {
        setSearchEndpoint("");
        setSelectedMethod("");
        setSelectedStatusCategory("");
        setPage(1);
    };

    const handleExport = (format) => {
        try {
            exportLogs(format);
        } catch (err) {
            alert(`Failed to export logs as ${format.toUpperCase()}`);
        }
    };

    const handleIngestSubmit = async (e) => {
        e.preventDefault();
        try {
            await ingestLog(ingestForm);
            setShowIngestModal(false);
            fetchLogsData();
        } catch (err) {
            alert("Log ingestion failed");
            console.error(err);
        }
    };

    const handleClearLogs = async () => {
        if (!window.confirm("Are you sure you want to purge all telemetry logs?")) return;
        try {
            await clearLogs();
            fetchLogsData();
        } catch (err) {
            console.error(err);
        }
    };

    const getMethodBadgeStyle = (method) => {
        switch (method.toUpperCase()) {
            case "GET":
                return { backgroundColor: "#dbeafe", color: "#1e40af" };
            case "POST":
                return { backgroundColor: "#dcfce7", color: "#166534" };
            case "PUT":
                return { backgroundColor: "#fef3c7", color: "#92400e" };
            case "DELETE":
                return { backgroundColor: "#fee2e2", color: "#991b1b" };
            default:
                return { backgroundColor: "#e5e7eb", color: "#374151" };
        }
    };

    const getStatusBadgeStyle = (code) => {
        if (code >= 200 && code < 300) {
            return { backgroundColor: "#dcfce7", color: "#15803d" };
        } else if (code >= 300 && code < 400) {
            return { backgroundColor: "#fef3c7", color: "#b45309" };
        } else {
            return { backgroundColor: "#fee2e2", color: "#b91c1c" };
        }
    };

    const getLatencyColor = (ms) => {
        if (ms < 100) return "#16a34a";
        if (ms < 500) return "#ea580c";
        return "#dc2626";
    };

    return (
        <div className={`dashboard ${darkMode ? "dark" : ""}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="dashboard-body">
                <Sidebar />
                <main className="content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <h1>API Log Collection & Telemetry Explorer</h1>
                            <p style={{ color: "#6b7280", margin: "4px 0 0 0" }}>
                                Real-time traffic ingestion, HTTP telemetry logs, and response latency analysis.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button onClick={() => handleExport("csv")} style={btnSecondaryStyle}>
                                <FaDownload style={{ marginRight: "4px" }} /> CSV
                            </button>
                            <button onClick={() => handleExport("json")} style={btnSecondaryStyle}>
                                <FaDownload style={{ marginRight: "4px" }} /> JSON
                            </button>
                            <button onClick={() => handleExport("pdf")} style={btnSecondaryStyle}>
                                <FaDownload style={{ marginRight: "4px" }} /> PDF
                            </button>
                            <button onClick={() => setShowIngestModal(true)} style={btnPrimaryStyle}>
                                <FaPlus style={{ marginRight: "4px" }} /> Ingest Log
                            </button>
                            <button onClick={handleClearLogs} style={btnDangerStyle}>
                                <FaTrash style={{ marginRight: "4px" }} /> Clear
                            </button>
                        </div>
                    </div>

                    {/* Summary Stat Cards */}
                    {stats && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaList style={{ marginRight: "6px" }} /> Total Logs</div>
                                <div style={cardValueStyle}>{stats.total_logs}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaCheckCircle style={{ marginRight: "6px", color: "#16a34a" }} /> Success Rate</div>
                                <div style={{ ...cardValueStyle, color: "#16a34a" }}>
                                    {stats.total_logs > 0 ? ((stats.success_count / stats.total_logs) * 100).toFixed(1) : 100}%
                                </div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaClock style={{ marginRight: "6px", color: "#0284c7" }} /> Avg Latency</div>
                                <div style={cardValueStyle}>{stats.avg_response_time} ms</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}>Total Errors</div>
                                <div style={{ ...cardValueStyle, color: stats.error_count > 0 ? "#dc2626" : "#374151" }}>
                                    {stats.error_count}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px" }}>
                        <button
                            onClick={() => setActiveTab("table")}
                            style={{ ...tabBtnStyle, borderBottom: activeTab === "table" ? "2px solid #2563eb" : "none", color: activeTab === "table" ? "#2563eb" : "#4b5563" }}
                        >
                            <FaList style={{ marginRight: "6px" }} /> Live Telemetry Table
                        </button>
                        <button
                            onClick={() => setActiveTab("analytics")}
                            style={{ ...tabBtnStyle, borderBottom: activeTab === "analytics" ? "2px solid #2563eb" : "none", color: activeTab === "analytics" ? "#2563eb" : "#4b5563" }}
                        >
                            <FaServer style={{ marginRight: "6px" }} /> Endpoint Analytics Leaderboard
                        </button>
                        <button
                            onClick={() => setActiveTab("charts")}
                            style={{ ...tabBtnStyle, borderBottom: activeTab === "charts" ? "2px solid #2563eb" : "none", color: activeTab === "charts" ? "#2563eb" : "#4b5563" }}
                        >
                            <FaChartLine style={{ marginRight: "6px" }} /> Charts & Trends
                        </button>
                    </div>

                    {/* TAB 1: Live Telemetry Table */}
                    {activeTab === "table" && (
                        <>
                            {/* Filter Toolbar */}
                            <div style={{ backgroundColor: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
                                <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                                    <div style={{ position: "relative", flex: "1 1 240px" }}>
                                        <input
                                            placeholder="Search by endpoint path..."
                                            value={searchEndpoint}
                                            onChange={(e) => setSearchEndpoint(e.target.value)}
                                            style={{ ...inputStyle, width: "100%", paddingLeft: "32px" }}
                                        />
                                        <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                                    </div>

                                    <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} style={selectStyle}>
                                        <option value="">All HTTP Methods</option>
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>

                                    <select value={selectedStatusCategory} onChange={(e) => setSelectedStatusCategory(e.target.value)} style={selectStyle}>
                                        <option value="">All Status Codes</option>
                                        <option value="2xx">2xx OK</option>
                                        <option value="3xx">3xx Redirect</option>
                                        <option value="4xx">4xx Client Error</option>
                                        <option value="5xx">5xx Server Error</option>
                                    </select>

                                    <button type="submit" style={btnPrimaryStyle}>
                                        <FaFilter style={{ marginRight: "6px" }} /> Filter
                                    </button>

                                    <button type="button" onClick={handleResetFilters} style={btnSecondaryStyle}>
                                        <FaRedo style={{ marginRight: "6px" }} /> Reset
                                    </button>
                                </form>
                            </div>

                            {/* Logs Table */}
                            <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                                {loading ? (
                                    <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading API telemetry logs...</div>
                                ) : logs.length === 0 ? (
                                    <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>No API telemetry logs found matching your filters.</div>
                                ) : (
                                    <table border="0" cellPadding="12" style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left", fontSize: "12px", color: "#6b7280", textTransform: "uppercase" }}>
                                                <th>Timestamp</th><th>Method</th><th>Endpoint</th><th>Status Code</th><th>Response Time</th><th>Size</th><th>Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log) => (
                                                <>
                                                    <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6", fontSize: "14px" }}>
                                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                                        <td>
                                                            <span style={{ padding: "3px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", ...getMethodBadgeStyle(log.method) }}>
                                                                {log.method}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontFamily: "monospace", color: "#2563eb", fontWeight: "600" }}>{log.endpoint}</td>
                                                        <td>
                                                            <span style={{ padding: "3px 8px", borderRadius: "12px", fontWeight: "bold", fontSize: "11px", ...getStatusBadgeStyle(log.status_code) }}>
                                                                {log.status_code}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontWeight: "bold", color: getLatencyColor(log.response_time) }}>{log.response_time} ms</td>
                                                        <td>{log.response_size ? `${log.response_size} B` : "N/A"}</td>
                                                        <td>
                                                            <button onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)} style={btnActionStyle}>
                                                                {expandedLogId === log.id ? "Hide" : "Inspect"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedLogId === log.id && (
                                                        <tr style={{ backgroundColor: "#f8fafc" }}>
                                                            <td colSpan="7" style={{ padding: "16px", borderBottom: "1px solid #e2e8f0" }}>
                                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", fontSize: "13px" }}>
                                                                    <div><strong>Log ID:</strong> #{log.id}</div>
                                                                    <div><strong>IP Address:</strong> {log.ip_address || "127.0.0.1 (Localhost)"}</div>
                                                                    <div><strong>User ID:</strong> {log.user_id ? `#${log.user_id}` : "Anonymous"}</div>
                                                                    <div><strong>User Agent:</strong> {log.user_agent || "FastAPI Telemetry Client"}</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* Pagination */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
                                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                                        Showing page {page} of {totalPages} ({totalItems} total logs)
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={btnSecondaryStyle}>Previous</button>
                                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={btnSecondaryStyle}>Next</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* TAB 2: Endpoint Analytics Leaderboard */}
                    {activeTab === "analytics" && (
                        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", padding: "20px" }}>
                            <h3>Endpoint Telemetry Analytics Leaderboard</h3>
                            <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "15px" }}>
                                Comprehensive per-endpoint performance metrics, latency ranges, error rates, and throughput usage %.
                            </p>

                            <table border="0" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f9fafb", textAlign: "left", fontSize: "12px", color: "#6b7280", textTransform: "uppercase" }}>
                                        <th>Endpoint Path</th><th>Total Requests</th><th>Avg Latency</th><th>Min Latency</th><th>Max Latency</th><th>Error %</th><th>Usage %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {endpointAnalytics.length === 0 ? (
                                        <tr><td colSpan="7" style={{ textAlign: "center" }}>No endpoint telemetry analytics available.</td></tr>
                                    ) : (
                                        endpointAnalytics.map((ep, idx) => (
                                            <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                <td style={{ fontFamily: "monospace", fontWeight: "bold", color: "#2563eb" }}>{ep.endpoint}</td>
                                                <td>{ep.total_requests}</td>
                                                <td style={{ fontWeight: "bold", color: getLatencyColor(ep.avg_latency) }}>{ep.avg_latency} ms</td>
                                                <td>{ep.min_latency} ms</td>
                                                <td>{ep.max_latency} ms</td>
                                                <td style={{ fontWeight: "bold", color: ep.error_percentage > 5 ? "#dc2626" : "#16a34a" }}>{ep.error_percentage}%</td>
                                                <td>{ep.usage_percentage}%</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB 3: Charts & Trends */}
                    {activeTab === "charts" && (
                        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", padding: "20px" }}>
                            <h3>Hourly Requests & Latency Trends</h3>
                            <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>
                                Time-series distribution of incoming request throughput and server response latency.
                            </p>

                            {chartsData && chartsData.timeline.length > 0 ? (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                                    {chartsData.timeline.map((item, idx) => (
                                        <div key={idx} style={{ border: "1px solid #e5e7eb", padding: "12px", borderRadius: "6px" }}>
                                            <div style={{ fontWeight: "bold", color: "#374151" }}>{item.hour}</div>
                                            <div style={{ fontSize: "14px", marginTop: "4px" }}>Requests: <strong>{item.requests}</strong></div>
                                            <div style={{ fontSize: "14px", color: getLatencyColor(item.avg_latency) }}>Avg Latency: <strong>{item.avg_latency} ms</strong></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: "#6b7280" }}>No chart telemetry data available yet for the selected time window.</p>
                            )}
                        </div>
                    )}

                    {/* Ingest Test Log Modal */}
                    {showIngestModal && (
                        <div style={modalOverlayStyle}>
                            <div style={modalContentStyle}>
                                <h3>Ingest Custom Telemetry Log</h3>
                                <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "15px" }}>
                                    Simulate API telemetry payload received from an external gateway.
                                </p>
                                <form onSubmit={handleIngestSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <input placeholder="Endpoint" value={ingestForm.endpoint} required onChange={(e) => setIngestForm({ ...ingestForm, endpoint: e.target.value })} style={inputStyle} />
                                    <select value={ingestForm.method} onChange={(e) => setIngestForm({ ...ingestForm, method: e.target.value })} style={selectStyle}>
                                        <option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="DELETE">DELETE</option>
                                    </select>
                                    <input type="number" placeholder="Status Code" value={ingestForm.status_code} required onChange={(e) => setIngestForm({ ...ingestForm, status_code: parseInt(e.target.value) })} style={inputStyle} />
                                    <input type="number" step="0.1" placeholder="Response Time (ms)" value={ingestForm.response_time} required onChange={(e) => setIngestForm({ ...ingestForm, response_time: parseFloat(e.target.value) })} style={inputStyle} />
                                    <input type="number" placeholder="Payload Size (bytes)" value={ingestForm.response_size} onChange={(e) => setIngestForm({ ...ingestForm, response_size: parseInt(e.target.value) })} style={inputStyle} />
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                                        <button type="button" onClick={() => setShowIngestModal(false)} style={btnSecondaryStyle}>Cancel</button>
                                        <button type="submit" style={btnPrimaryStyle}>Ingest Log</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

const cardStyle = { backgroundColor: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" };
const cardTitleStyle = { fontSize: "12px", color: "#6b7280", textTransform: "uppercase", fontWeight: "bold", display: "flex", alignItems: "center" };
const cardValueStyle = { fontSize: "24px", fontWeight: "bold", marginTop: "6px" };
const inputStyle = { padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" };
const selectStyle = { padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px", backgroundColor: "#fff" };
const btnPrimaryStyle = { padding: "8px 14px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", display: "inline-flex", alignItems: "center" };
const btnSecondaryStyle = { padding: "8px 14px", backgroundColor: "#6b7280", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", display: "inline-flex", alignItems: "center" };
const btnDangerStyle = { padding: "8px 14px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", display: "inline-flex", alignItems: "center" };
const btnActionStyle = { padding: "4px 8px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };
const tabBtnStyle = { padding: "8px 16px", backgroundColor: "transparent", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px", display: "inline-flex", alignItems: "center" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContentStyle = { backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px", width: "420px", maxWidth: "90%", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };

export default LogExplorer;
