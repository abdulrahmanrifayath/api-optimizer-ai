import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
    getLogs,
    getLogStats,
    getLogCharts,
    getEndpointAnalytics,
    exportLogs,
    clearLogs
} from "../services/apiLogService";
import {
    FaList,
    FaCheckCircle,
    FaClock,
    FaSearch,
    FaFileCsv,
    FaFileCode,
    FaFilePdf,
    FaTrash,
    FaServer,
    FaChartLine,
    FaCalendarAlt,
    FaInfoCircle,
    FaArrowLeft,
    FaArrowRight
} from "react-icons/fa";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar
} from "recharts";
import "../styles/dashboard.css";

function LogExplorer({ darkMode, setDarkMode }) {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [charts, setCharts] = useState(null);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("table");

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    const [searchEndpoint, setSearchEndpoint] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [selectedStatusCategory, setSelectedStatusCategory] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Details Modal State
    const [selectedLog, setSelectedLog] = useState(null);

    // Toast alert state
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (msg, type = "success") => {
        setToastMessage({ message: msg, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const fetchLogsData = async () => {
        setLoading(true);
        try {
            const logsData = await getLogs({
                page,
                limit,
                endpoint: searchEndpoint,
                method: selectedMethod,
                status_category: selectedStatusCategory,
                date_from: dateFrom,
                date_to: dateTo,
            });

            setLogs(logsData.items || []);
            setTotalPages(logsData.total_pages || 1);
            setTotalLogs(logsData.total_items || 0);

            const statsData = await getLogStats();
            setStats(statsData);

            const chartsData = await getLogCharts();
            setCharts(chartsData);

            const analyticsData = await getEndpointAnalytics();
            setAnalytics(analyticsData);
        } catch (err) {
            console.error("Failed to fetch API logs:", err);
            showToast("Failed to fetch HTTP telemetry logs", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogsData();
    }, [page, limit, selectedMethod, selectedStatusCategory]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchLogsData();
    };

    const handleExport = async (format) => {
        try {
            await exportLogs(format);
            showToast(`Telemetry logs exported as ${format.toUpperCase()}`);
        } catch (err) {
            showToast(`Failed to export ${format.toUpperCase()}`, "error");
        }
    };

    const handleClearLogs = async () => {
        if (!window.confirm("Are you sure you want to clear all telemetry logs?")) return;
        try {
            await clearLogs();
            showToast("All HTTP telemetry logs cleared");
            fetchLogsData();
        } catch (err) {
            showToast("Failed to clear logs", "error");
        }
    };

    const getStatusColor = (code) => {
        if (code >= 200 && code < 300) return "#10b981";
        if (code >= 300 && code < 400) return "#38bdf8";
        if (code >= 400 && code < 500) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <div className={`dashboard ${darkMode ? "dark" : ""}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            <div className="dashboard-body">
                <Sidebar />

                <main className="content">
                    {/* Toast Notification Alert */}
                    {toastMessage && (
                        <div
                            style={{
                                position: "fixed",
                                top: "80px",
                                right: "20px",
                                padding: "12px 20px",
                                borderRadius: "12px",
                                color: "#ffffff",
                                backgroundColor: toastMessage.type === "error" ? "#ef4444" : "#10b981",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                                zIndex: 2000,
                                fontWeight: "bold",
                                fontSize: "14px",
                            }}
                        >
                            {toastMessage.message}
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <h1 style={{ color: "var(--text-heading)" }}><FaList style={{ color: "#38bdf8", marginRight: "10px" }} /> API Log Explorer & Ingestion Engine</h1>
                            <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                                Live HTTP telemetry streams, endpoint performance leaderboards, and CSV/JSON/PDF exports.
                            </p>
                        </div>

                        {/* Export Action Buttons */}
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <button onClick={() => handleExport("csv")} style={{ ...btnPrimaryStyle, backgroundColor: "#10b981" }} title="Export as CSV">
                                <FaFileCsv style={{ marginRight: "6px" }} /> CSV
                            </button>
                            <button onClick={() => handleExport("json")} style={{ ...btnPrimaryStyle, backgroundColor: "#38bdf8" }} title="Export as JSON">
                                <FaFileCode style={{ marginRight: "6px" }} /> JSON
                            </button>
                            <button onClick={() => handleExport("pdf")} style={{ ...btnPrimaryStyle, backgroundColor: "#ea580c" }} title="Export as PDF Report">
                                <FaFilePdf style={{ marginRight: "6px" }} /> PDF
                            </button>
                            <button onClick={handleClearLogs} style={btnDangerStyle} title="Clear Telemetry Logs">
                                <FaTrash style={{ marginRight: "6px" }} /> Clear
                            </button>
                        </div>
                    </div>

                    {/* Summary Stat Cards */}
                    {stats && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaList style={{ marginRight: "6px" }} /> Total Logs</div>
                                <div style={cardValueStyle}>{stats.total_logs}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaCheckCircle style={{ marginRight: "6px", color: "#10b981" }} /> Success Rate</div>
                                <div style={{ ...cardValueStyle, color: "#10b981" }}>
                                    {stats.total_logs > 0 ? ((stats.success_count / stats.total_logs) * 100).toFixed(1) : 100}%
                                </div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaClock style={{ marginRight: "6px", color: "#38bdf8" }} /> Avg Latency</div>
                                <div style={cardValueStyle}>{stats.avg_response_time} ms</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}>Total Errors</div>
                                <div style={{ ...cardValueStyle, color: stats.error_count > 0 ? "#ef4444" : "var(--text-main)" }}>
                                    {stats.error_count}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "1px solid var(--border-card)", paddingBottom: "12px" }}>
                        <button
                            onClick={() => setActiveTab("table")}
                            style={{ ...tabBtnStyle, borderBottom: activeTab === "table" ? "2px solid #a855f7" : "none", color: activeTab === "table" ? "var(--text-active)" : "var(--text-muted)" }}
                        >
                            <FaList style={{ marginRight: "6px" }} /> Live Telemetry Table
                        </button>
                        <button
                            onClick={() => setActiveTab("analytics")}
                            style={{ ...tabBtnStyle, borderBottom: activeTab === "analytics" ? "2px solid #a855f7" : "none", color: activeTab === "analytics" ? "var(--text-active)" : "var(--text-muted)" }}
                        >
                            <FaServer style={{ marginRight: "6px" }} /> Endpoint Analytics Leaderboard
                        </button>
                        <button
                            onClick={() => setActiveTab("charts")}
                            style={{ ...tabBtnStyle, borderBottom: activeTab === "charts" ? "2px solid #a855f7" : "none", color: activeTab === "charts" ? "var(--text-active)" : "var(--text-muted)" }}
                        >
                            <FaChartLine style={{ marginRight: "6px" }} /> Charts & Trends
                        </button>
                    </div>

                    {/* TAB 1: Live Telemetry Table */}
                    {activeTab === "table" && (
                        <>
                            {/* Filter Toolbar */}
                            <div className="chart-card" style={{ padding: "18px 24px", marginBottom: "24px" }}>
                                <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
                                    <div style={{ position: "relative", flex: "1 1 240px" }}>
                                        <input
                                            placeholder="Search by endpoint path..."
                                            value={searchEndpoint}
                                            onChange={(e) => setSearchEndpoint(e.target.value)}
                                            style={{ ...inputStyle, width: "100%", paddingLeft: "36px" }}
                                        />
                                        <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
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

                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        style={inputStyle}
                                        title="Date From"
                                    />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        style={inputStyle}
                                        title="Date To"
                                    />

                                    <button type="submit" style={btnPrimaryStyle}>Search</button>
                                </form>
                            </div>

                            {/* Telemetry Logs Table */}
                            <div className="chart-card">
                                {loading ? (
                                    <p style={{ color: "var(--text-muted)" }}>Loading HTTP telemetry logs...</p>
                                ) : logs.length === 0 ? (
                                    <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>No telemetry logs matching criteria.</p>
                                ) : (
                                    <table className="activity-table">
                                        <thead>
                                            <tr>
                                                <th>Timestamp</th>
                                                <th>Method</th>
                                                <th>Endpoint</th>
                                                <th>Status</th>
                                                <th>Response Time</th>
                                                <th>Client IP</th>
                                                <th>Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log) => (
                                                <tr key={log.id}>
                                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td>
                                                        <span style={{ fontWeight: "bold", padding: "3px 8px", borderRadius: "14px", fontSize: "11px", backgroundColor: log.method === "GET" ? "rgba(16,185,129,0.2)" : log.method === "POST" ? "rgba(99,102,241,0.2)" : "rgba(245,158,11,0.2)", color: log.method === "GET" ? "#10b981" : log.method === "POST" ? "#818cf8" : "#f59e0b" }}>
                                                            {log.method}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: "bold", color: "var(--text-heading)" }}>{log.endpoint}</td>
                                                    <td>
                                                        <span style={{ fontWeight: "bold", color: getStatusColor(log.status_code) }}>
                                                            {log.status_code}
                                                        </span>
                                                    </td>
                                                    <td>{log.response_time} ms</td>
                                                    <td>{log.client_ip || "127.0.0.1"}</td>
                                                    <td>
                                                        <button onClick={() => setSelectedLog(log)} style={btnActionStyle}>
                                                            <FaInfoCircle /> View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* Pagination Footer */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-card)" }}>
                                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                        Showing page {page} of {totalPages} ({totalLogs} total logs)
                                    </span>

                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ ...btnSecondaryStyle, opacity: page <= 1 ? 0.5 : 1 }}>
                                            <FaArrowLeft style={{ marginRight: "4px" }} /> Previous
                                        </button>
                                        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ ...btnSecondaryStyle, opacity: page >= totalPages ? 0.5 : 1 }}>
                                            Next <FaArrowRight style={{ marginLeft: "4px" }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* TAB 2: Endpoint Analytics Leaderboard */}
                    {activeTab === "analytics" && (
                        <div className="chart-card">
                            <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)" }}>🏆 Per-Endpoint Telemetry Analytics & Leaderboard</h3>
                            <table className="activity-table">
                                <thead>
                                    <tr>
                                        <th>Endpoint</th><th>Avg Latency</th><th>Min Latency</th><th>Max Latency</th><th>Error Rate</th><th>Daily Volume</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: "bold", color: "var(--text-heading)" }}>{item.endpoint}</td>
                                            <td>{item.avg_latency} ms</td>
                                            <td>{item.min_latency} ms</td>
                                            <td>{item.max_latency} ms</td>
                                            <td><span style={{ color: item.error_rate > 5 ? "#ef4444" : "#10b981", fontWeight: "bold" }}>{item.error_rate}%</span></td>
                                            <td>{item.daily_requests} reqs</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Details Modal */}
                    {selectedLog && (
                        <div style={modalOverlayStyle}>
                            <div style={modalContentStyle}>
                                <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)" }}>HTTP Telemetry Trace Details</h3>
                                <p><strong>Endpoint:</strong> {selectedLog.endpoint}</p>
                                <p><strong>Method:</strong> {selectedLog.method}</p>
                                <p><strong>Status Code:</strong> {selectedLog.status_code}</p>
                                <p><strong>Response Time:</strong> {selectedLog.response_time} ms</p>
                                <p><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                                <p><strong>User Agent:</strong> {selectedLog.user_agent || "FastAPI Telemetry Agent"}</p>
                                <div style={{ marginTop: "20px", textAlign: "right" }}>
                                    <button onClick={() => setSelectedLog(null)} style={btnPrimaryStyle}>Close</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

const cardStyle = { backgroundColor: "var(--bg-card)", padding: "18px", borderRadius: "16px", border: "1px solid var(--border-card)", boxShadow: "var(--shadow-card)", backdropFilter: "blur(16px)" };
const cardTitleStyle = { fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold", display: "flex", alignItems: "center" };
const cardValueStyle = { fontSize: "26px", fontWeight: "800", marginTop: "6px", color: "var(--text-main)" };
const inputStyle = { padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", backgroundColor: "var(--bg-search)", color: "var(--text-main)", fontSize: "14px" };
const selectStyle = { padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", fontSize: "14px", backgroundColor: "var(--bg-search)", color: "var(--text-main)" };
const btnPrimaryStyle = { padding: "10px 18px", backgroundColor: "#7c3aed", color: "#fff", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", display: "inline-flex", alignItems: "center", boxShadow: "0 6px 20px rgba(124,58,237,0.3)" };
const btnSecondaryStyle = { padding: "8px 16px", backgroundColor: "var(--text-muted)", color: "#fff", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: "bold", display: "inline-flex", alignItems: "center" };
const btnDangerStyle = { padding: "10px 18px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", display: "inline-flex", alignItems: "center", boxShadow: "0 6px 20px rgba(239,68,68,0.3)" };
const btnActionStyle = { padding: "5px 10px", backgroundColor: "var(--bg-search)", border: "1px solid var(--border-card)", color: "var(--text-main)", borderRadius: "14px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" };
const tabBtnStyle = { padding: "10px 18px", backgroundColor: "transparent", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px", display: "inline-flex", alignItems: "center" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, backdropFilter: "blur(8px)" };
const modalContentStyle = { backgroundColor: "var(--bg-card)", padding: "28px", borderRadius: "20px", width: "450px", maxWidth: "90%", boxShadow: "var(--shadow-hover)", border: "1px solid var(--border-card)", color: "var(--text-main)" };

export default LogExplorer;
