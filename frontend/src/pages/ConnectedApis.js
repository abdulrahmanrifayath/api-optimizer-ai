import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
    getConnectedApis,
    createConnectedApi,
    updateConnectedApi,
    deleteConnectedApi,
    updateApiStatus,
    getConnectedApiSummary,
    testApiConnection,
    getHistoricalMetrics,
    getErrorSummary
} from "../services/connectedApiService";
import {
    FaServer,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTimesCircle,
    FaTrash,
    FaEdit,
    FaSearch,
    FaPlay,
    FaChartLine,
    FaLock,
    FaHistory
} from "react-icons/fa";
import "../styles/dashboard.css";

function ConnectedApis({ darkMode, setDarkMode }) {
    const [apis, setApis] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApis, setTotalApis] = useState(0);

    // Toolbar filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [limit, setLimit] = useState(10);

    // Add / Edit Form State
    const [form, setForm] = useState({ name: "", base_url: "", description: "", api_key: "", auth_header: "Authorization" });
    const [editingId, setEditingId] = useState(null);

    // Testing & Telemetry modal state
    const [testingId, setTestingId] = useState(null);
    const [testResults, setTestResults] = useState({});
    const [selectedMetricsApi, setSelectedMetricsApi] = useState(null);
    const [historicalMetrics, setHistoricalMetrics] = useState([]);
    const [timeframe, setTimeframe] = useState("24h");
    const [loadingMetrics, setLoadingMetrics] = useState(false);

    // Toast Alert State
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (msg, type = "success") => {
        setToastMessage({ message: msg, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getConnectedApis({
                query: searchQuery,
                status: statusFilter,
                sort_by: sortBy,
                page,
                limit,
            });
            setApis(data.items || []);
            setTotalPages(data.total_pages || 1);
            setTotalApis(data.total_items || 0);

            const sumData = await getConnectedApiSummary();
            setSummary(sumData);
        } catch (err) {
            console.error("Failed to load connected APIs:", err);
            showToast("Failed to fetch connected APIs data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page, statusFilter, sortBy, limit]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        loadData();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateConnectedApi(editingId, form);
                showToast("API connection updated successfully!");
            } else {
                await createConnectedApi(form);
                showToast("API connection added successfully!");
            }
            setForm({ name: "", base_url: "", description: "", api_key: "", auth_header: "Authorization" });
            setEditingId(null);
            loadData();
        } catch (err) {
            showToast(err.response?.data?.detail || "Failed to save API connection", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this connected API?")) return;
        try {
            await deleteConnectedApi(id);
            showToast("Connected API deleted successfully");
            loadData();
        } catch (err) {
            showToast("Failed to delete API", "error");
        }
    };

    const handleEdit = (api) => {
        setEditingId(api.id);
        setForm({
            name: api.name,
            base_url: api.base_url,
            description: api.description || "",
        });
    };

    const handleToggleStatus = async (api) => {
        const newStatus = api.status === "Inactive" ? "Healthy" : "Inactive";
        try {
            await updateApiStatus(api.id, newStatus);
            showToast(`API status updated to ${newStatus}`);
            loadData();
        } catch (err) {
            showToast("Failed to update status", "error");
        }
    };

    const handleTestConnection = async (apiId) => {
        setTestingId(apiId);
        try {
            const res = await testApiConnection(apiId);
            setTestResults((prev) => ({ ...prev, [apiId]: res }));
            if (res.status === "Healthy" || res.status === "Slow") {
                showToast(`API Connection Test Passed (${res.status}, ${res.response_time}ms)`);
            } else {
                showToast(`API Connection Test Failed: ${res.status}`, "error");
            }
            loadData();
        } catch (err) {
            showToast("Connection test execution failed", "error");
        } finally {
            setTestingId(null);
        }
    };

    const handleViewMetrics = async (api) => {
        setSelectedMetricsApi(api);
        setLoadingMetrics(true);
        try {
            const data = await getHistoricalMetrics(api.id, timeframe);
            setHistoricalMetrics(data || []);
        } catch (err) {
            showToast("Failed to fetch historical metrics", "error");
        } finally {
            setLoadingMetrics(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Healthy":
                return <span className="status success">🟢 Healthy</span>;
            case "Slow":
                return <span style={{ padding: "4px 12px", borderRadius: "30px", fontSize: "12px", fontWeight: "bold", backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#f59e0b" }}>🟡 Slow</span>;
            case "Offline":
                return <span style={{ padding: "4px 12px", borderRadius: "30px", fontSize: "12px", fontWeight: "bold", backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>🔴 Offline</span>;
            case "Unauthorized":
                return <span style={{ padding: "4px 12px", borderRadius: "30px", fontSize: "12px", fontWeight: "bold", backgroundColor: "rgba(168, 85, 247, 0.2)", color: "#c084fc" }}>🔒 Unauthorized</span>;
            default:
                return <span style={{ padding: "4px 12px", borderRadius: "30px", fontSize: "12px", fontWeight: "bold", backgroundColor: "rgba(100, 116, 139, 0.2)", color: "var(--text-muted)" }}>⚪ {status || "Unknown"}</span>;
        }
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

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <div>
                            <h1 style={{ color: "var(--text-heading)" }}><FaServer style={{ color: "#a855f7", marginRight: "10px" }} /> Connected API Management</h1>
                            <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                                Connect, monitor latency, test DNS/SSL, and track real-time health telemetry.
                            </p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {summary && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}>Total APIs</div>
                                <div style={cardValueStyle}>{summary.total_connected_apis}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaCheckCircle style={{ color: "#10b981", marginRight: "4px" }} /> Healthy</div>
                                <div style={{ ...cardValueStyle, color: "#10b981" }}>{summary.healthy_apis}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaExclamationTriangle style={{ color: "#f59e0b", marginRight: "4px" }} /> Slow</div>
                                <div style={{ ...cardValueStyle, color: "#f59e0b" }}>{summary.slow_apis}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaTimesCircle style={{ color: "#ef4444", marginRight: "4px" }} /> Offline</div>
                                <div style={{ ...cardValueStyle, color: "#ef4444" }}>{summary.offline_apis}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}>Avg Response</div>
                                <div style={cardValueStyle}>{summary.average_response_time} ms</div>
                            </div>
                        </div>
                    )}

                    {/* Add / Edit Form */}
                    <form onSubmit={handleSubmit} className="chart-card" style={{ marginBottom: "28px" }}>
                        <h3 style={{ margin: 0, color: "var(--text-heading)" }}>{editingId ? "Edit Connected API" : "Connect New REST API"}</h3>
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "16px" }}>
                            <input
                                placeholder="API Name (e.g. Stripe Payment API)"
                                value={form.name}
                                required
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                style={inputStyle}
                            />
                            <input
                                placeholder="Base URL (e.g. https://api.stripe.com/v1)"
                                value={form.base_url}
                                type="url"
                                required
                                onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                                style={inputStyle}
                            />
                            <input
                                placeholder="Description (optional)"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                style={inputStyle}
                            />
                            <input
                                placeholder="API Key / Secret Token (optional)"
                                type="password"
                                value={form.api_key || ""}
                                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                                style={inputStyle}
                            />
                            <button type="submit" style={btnPrimaryStyle}>
                                {editingId ? "Update API" : "Add API"}
                            </button>
                            {editingId && (
                                <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", base_url: "", description: "", api_key: "", auth_header: "Authorization" }); }} style={btnSecondaryStyle}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Toolbar: Search, Filter, Sort */}
                    <div className="chart-card" style={{ padding: "18px 24px", marginBottom: "24px" }}>
                        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
                            <div style={{ position: "relative", flex: "1 1 220px" }}>
                                <input
                                    placeholder="Search API name or URL..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ ...inputStyle, width: "100%", paddingLeft: "36px" }}
                                />
                                <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            </div>

                            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
                                <option value="All">All Statuses</option>
                                <option value="Healthy">Healthy</option>
                                <option value="Slow">Slow</option>
                                <option value="Offline">Offline</option>
                                <option value="Unauthorized">Unauthorized</option>
                            </select>

                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
                                <option value="newest">Sort: Newest</option>
                                <option value="oldest">Sort: Oldest</option>
                                <option value="fastest">Sort: Fastest Latency</option>
                                <option value="slowest">Sort: Slowest Latency</option>
                            </select>

                            <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }} style={selectStyle}>
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                            </select>

                            <button type="submit" style={btnPrimaryStyle}>Filter</button>
                        </form>
                    </div>

                    {/* APIs Table */}
                    <div className="chart-card">
                        {loading ? (
                            <p style={{ color: "var(--text-muted)" }}>Loading connected APIs...</p>
                        ) : apis.length === 0 ? (
                            <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>No connected APIs found.</p>
                        ) : (
                            <table className="activity-table">
                                <thead>
                                    <tr>
                                        <th>Name & Base URL</th>
                                        <th>Health Status</th>
                                        <th>Latency</th>
                                        <th>Availability</th>
                                        <th>SSL</th>
                                        <th>Test Result</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apis.map((api) => {
                                        const testRes = testResults[api.id];
                                        return (
                                            <tr key={api.id}>
                                                <td>
                                                    <div style={{ fontWeight: "bold", color: "var(--text-heading)" }}>{api.name}</div>
                                                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{api.base_url}</div>
                                                </td>
                                                <td>{getStatusBadge(api.status)}</td>
                                                <td>{api.latency ? `${api.latency} ms` : "N/A"}</td>
                                                <td>{api.availability ? `${api.availability}%` : "100%"}</td>
                                                <td>
                                                    {api.ssl_verified ? (
                                                        <span style={{ color: "#10b981", fontSize: "12px", fontWeight: "bold" }}>Valid</span>
                                                    ) : (
                                                        <span style={{ color: "#ef4444", fontSize: "12px", fontWeight: "bold" }}>Invalid / Disabled</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {testingId === api.id ? (
                                                        <span style={{ color: "#a855f7", fontWeight: "bold" }}>Testing...</span>
                                                    ) : testRes ? (
                                                        <span style={{ fontSize: "12px", color: testRes.status === "Healthy" ? "#10b981" : "#ef4444" }}>
                                                            {testRes.status} ({testRes.response_time}ms)
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Not tested</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "6px" }}>
                                                        <button onClick={() => handleTestConnection(api.id)} style={{ ...btnActionStyle, backgroundColor: "#6366f1", color: "#fff" }} title="Test Connection">
                                                            <FaPlay style={{ fontSize: "10px" }} /> Test
                                                        </button>
                                                        <button onClick={() => handleToggleStatus(api)} style={{ ...btnActionStyle, backgroundColor: "var(--text-muted)", color: "#fff" }} title="Toggle Monitoring">
                                                            {api.status === "Inactive" ? "Enable" : "Disable"}
                                                        </button>
                                                        <button onClick={() => handleViewMetrics(api)} style={{ ...btnActionStyle, backgroundColor: "#38bdf8", color: "#fff" }} title="View Metrics">
                                                            <FaHistory /> Metrics
                                                        </button>
                                                        <button onClick={() => handleEdit(api)} style={{ ...btnActionStyle, backgroundColor: "#f59e0b", color: "#fff" }} title="Edit API">
                                                            <FaEdit />
                                                        </button>
                                                        <button onClick={() => handleDelete(api.id)} style={{ ...btnActionStyle, backgroundColor: "#ef4444", color: "#fff" }} title="Delete API">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {/* Pagination Footer */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-card)" }}>
                            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                Showing page {page} of {totalPages} ({totalApis} total APIs)
                            </span>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ ...btnSecondaryStyle, opacity: page <= 1 ? 0.5 : 1 }}>
                                    Previous
                                </button>
                                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ ...btnSecondaryStyle, opacity: page >= totalPages ? 0.5 : 1 }}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

const cardStyle = { backgroundColor: "var(--bg-card)", padding: "18px", borderRadius: "16px", border: "1px solid var(--border-card)", boxShadow: "var(--shadow-card)", backdropFilter: "blur(16px)" };
const cardTitleStyle = { fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold", display: "flex", alignItems: "center" };
const cardValueStyle = { fontSize: "26px", fontWeight: "800", marginTop: "6px", color: "var(--text-main)" };
const inputStyle = { padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", backgroundColor: "var(--bg-search)", color: "var(--text-main)", fontSize: "14px", flex: "1 1 200px" };
const selectStyle = { padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", fontSize: "14px", backgroundColor: "var(--bg-search)", color: "var(--text-main)" };
const btnPrimaryStyle = { padding: "10px 20px", backgroundColor: "#7c3aed", color: "#fff", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", boxShadow: "0 6px 20px rgba(124,58,237,0.3)" };
const btnSecondaryStyle = { padding: "8px 16px", backgroundColor: "var(--text-muted)", color: "#fff", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" };
const btnActionStyle = { padding: "5px 10px", border: "none", borderRadius: "14px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" };

export default ConnectedApis;