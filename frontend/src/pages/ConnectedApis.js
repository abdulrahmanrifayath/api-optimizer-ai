import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
    getConnectedApis,
    createConnectedApi,
    updateConnectedApi,
    deleteConnectedApi,
    updateApiStatus,
    testApiConnection,
    getApiMetrics,
    getConnectedApiSummary,
} from "../services/connectedApiService";
import { FaSearch, FaFilter, FaSortAmountDown, FaPlus, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaShieldAlt, FaSync } from "react-icons/fa";
import "../styles/dashboard.css";

function ConnectedApis({ darkMode, setDarkMode }) {
    const [apis, setApis] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    // Search, Filter, Sort & Pagination state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Toast notification state
    const [toastMessage, setToastMessage] = useState(null);

    // Form state
    const [form, setForm] = useState({
        name: "",
        base_url: "",
        description: "",
    });

    const [editingId, setEditingId] = useState(null);
    const [testingId, setTestingId] = useState(null);
    const [testResults, setTestResults] = useState({});
    const [selectedMetricsApi, setSelectedMetricsApi] = useState(null);
    const [metricsList, setMetricsList] = useState([]);
    const [loadingMetrics, setLoadingMetrics] = useState(false);

    const showToast = (message, type = "success") => {
        setToastMessage({ message, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Load APIs & Summary
    const loadData = async () => {
        setLoading(true);
        try {
            const [apisData, summaryData] = await Promise.all([
                getConnectedApis({
                    query: searchQuery,
                    status: statusFilter,
                    sort_by: sortBy,
                    page: page,
                    limit: limit,
                }),
                getConnectedApiSummary(),
            ]);

            setApis(apisData.items || []);
            setTotalPages(apisData.total_pages || 1);
            setTotalItems(apisData.total || 0);
            setSummary(summaryData);
        } catch (err) {
            console.error("Failed to load APIs or summary:", err);
            showToast("Failed to load connected APIs", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page, limit, statusFilter, sortBy]);

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
                showToast("Connected API updated successfully!");
            } else {
                await createConnectedApi(form);
                showToast("New API connected successfully!");
            }
            setForm({ name: "", base_url: "", description: "" });
            setEditingId(null);
            loadData();
        } catch (err) {
            showToast(err.response?.data?.detail || "Operation failed", "error");
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
            const data = await getApiMetrics(api.id);
            setMetricsList(data);
        } catch (err) {
            showToast("Failed to load metrics history", "error");
        } finally {
            setLoadingMetrics(false);
        }
    };

    const getStatusBadge = (statusStr) => {
        switch (statusStr) {
            case "Healthy":
            case "Active":
                return <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", backgroundColor: "#dcfce7", color: "#15803d" }}>🟢 Healthy</span>;
            case "Slow":
                return <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", backgroundColor: "#fef3c7", color: "#b45309" }}>🟡 Slow</span>;
            case "Inactive":
                return <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", backgroundColor: "#e5e7eb", color: "#4b5563" }}>⚪ Inactive</span>;
            default:
                return <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", backgroundColor: "#fee2e2", color: "#b91c1c" }}>🔴 {statusStr || "Offline"}</span>;
        }
    };

    return (
        <div className={`dashboard ${darkMode ? "dark" : ""}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="dashboard-body">
                <Sidebar />
                <main className="content">
                    {/* Toast Notification Message */}
                    {toastMessage && (
                        <div
                            style={{
                                position: "fixed",
                                top: "20px",
                                right: "20px",
                                padding: "12px 20px",
                                borderRadius: "8px",
                                color: "#fff",
                                backgroundColor: toastMessage.type === "error" ? "#dc2626" : "#16a34a",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                zIndex: 2000,
                                fontWeight: "bold",
                                fontSize: "14px",
                            }}
                        >
                            {toastMessage.message}
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div>
                            <h1>Connected API Management</h1>
                            <p style={{ color: "#6b7280", margin: "4px 0 0 0" }}>
                                Connect, monitor latency, test DNS/SSL, and track real-time health telemetry.
                            </p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {summary && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "25px" }}>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}>Total APIs</div>
                                <div style={cardValueStyle}>{summary.total_connected_apis}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaCheckCircle style={{ color: "#16a34a", marginRight: "4px" }} /> Healthy</div>
                                <div style={{ ...cardValueStyle, color: "#16a34a" }}>{summary.healthy_apis}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaExclamationTriangle style={{ color: "#d97706", marginRight: "4px" }} /> Slow</div>
                                <div style={{ ...cardValueStyle, color: "#d97706" }}>{summary.slow_apis}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}><FaTimesCircle style={{ color: "#dc2626", marginRight: "4px" }} /> Offline</div>
                                <div style={{ ...cardValueStyle, color: "#dc2626" }}>{summary.offline_apis}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardTitleStyle}>Avg Response</div>
                                <div style={cardValueStyle}>{summary.average_response_time} ms</div>
                            </div>
                        </div>
                    )}

                    {/* Add / Edit Form */}
                    <form onSubmit={handleSubmit} style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
                        <h3>{editingId ? "Edit Connected API" : "Connect New REST API"}</h3>
                        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "12px" }}>
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
                            <button type="submit" style={btnPrimaryStyle}>
                                {editingId ? "Update API" : "Add API"}
                            </button>
                            {editingId && (
                                <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", base_url: "", description: "" }); }} style={btnSecondaryStyle}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Toolbar: Search, Filter, Sort */}
                    <div style={{ backgroundColor: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
                        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                            <div style={{ position: "relative", flex: "1 1 220px" }}>
                                <input
                                    placeholder="Search API name or URL..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ ...inputStyle, width: "100%", paddingLeft: "32px" }}
                                />
                                <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                            </div>

                            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
                                <option value="All">All Statuses</option>
                                <option value="Healthy">Healthy</option>
                                <option value="Slow">Slow</option>
                                <option value="Offline">Offline</option>
                                <option value="Unauthorized">Unauthorized</option>
                                <option value="Timeout">Timeout</option>
                                <option value="SSL Error">SSL Error</option>
                                <option value="Inactive">Inactive</option>
                            </select>

                            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} style={selectStyle}>
                                <option value="newest">Sort: Newest</option>
                                <option value="oldest">Sort: Oldest</option>
                                <option value="fastest">Sort: Fastest</option>
                                <option value="slowest">Sort: Slowest</option>
                            </select>

                            <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }} style={selectStyle}>
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                            </select>

                            <button type="submit" style={btnPrimaryStyle}>
                                Filter
                            </button>
                        </form>
                    </div>

                    {/* APIs Table */}
                    <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                        {loading ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading connected APIs...</div>
                        ) : apis.length === 0 ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                                No connected APIs found matching your criteria. Add one above!
                            </div>
                        ) : (
                            <table border="0" cellPadding="12" style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left", fontSize: "12px", color: "#6b7280", textTransform: "uppercase" }}>
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
                                        const result = testResults[api.id];
                                        return (
                                            <tr key={api.id} style={{ borderBottom: "1px solid #f3f4f6", fontSize: "14px" }}>
                                                <td>
                                                    <strong>{api.name}</strong>
                                                    <br />
                                                    <a href={api.base_url} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#2563eb" }}>
                                                        {api.base_url}
                                                    </a>
                                                </td>
                                                <td>{getStatusBadge(api.status)}</td>
                                                <td style={{ fontWeight: "bold", color: api.latency < 200 ? "#16a34a" : api.latency < 500 ? "#d97706" : "#dc2626" }}>
                                                    {api.latency ? `${api.latency} ms` : "N/A"}
                                                </td>
                                                <td style={{ fontWeight: "bold", color: api.availability >= 98 ? "#16a34a" : "#dc2626" }}>
                                                    {api.availability}%
                                                </td>
                                                <td>
                                                    <FaShieldAlt style={{ color: api.ssl_verified ? "#16a34a" : "#dc2626", marginRight: "4px" }} />
                                                    <span style={{ fontSize: "12px" }}>{api.ssl_verified ? "Valid" : "Error"}</span>
                                                </td>
                                                <td>
                                                    {testingId === api.id ? (
                                                        <span style={{ color: "#2563eb", fontSize: "12px" }}>Testing...</span>
                                                    ) : result ? (
                                                        result.status === "Healthy" || result.status === "Slow" ? (
                                                            <span style={{ color: "#16a34a", fontSize: "12px" }}>✅ {result.status} ({result.response_time}ms)</span>
                                                        ) : (
                                                            <span style={{ color: "#dc2626", fontSize: "12px" }}>❌ {result.status}</span>
                                                        )
                                                    ) : (
                                                        <span style={{ color: "#9ca3af", fontSize: "12px" }}>Not tested</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button onClick={() => handleTestConnection(api.id)} disabled={testingId === api.id} style={{ ...btnActionStyle, backgroundColor: "#dbeafe", color: "#1e40af" }}>
                                                        <FaSync style={{ marginRight: "4px" }} /> Test
                                                    </button>{" "}
                                                    <button onClick={() => handleToggleStatus(api)} style={{ ...btnActionStyle, backgroundColor: api.status === "Inactive" ? "#dcfce7" : "#fef3c7", color: api.status === "Inactive" ? "#166534" : "#92400e" }}>
                                                        {api.status === "Inactive" ? "Enable" : "Disable"}
                                                    </button>{" "}
                                                    <button onClick={() => handleViewMetrics(api)} style={{ ...btnActionStyle, backgroundColor: "#f3e8ff", color: "#6b21a8" }}>Metrics</button>{" "}
                                                    <button onClick={() => handleEdit(api)} style={{ ...btnActionStyle, backgroundColor: "#e5e7eb", color: "#374151" }}>Edit</button>{" "}
                                                    <button onClick={() => handleDelete(api.id)} style={{ ...btnActionStyle, backgroundColor: "#fee2e2", color: "#991b1b" }}>Delete</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {/* Pagination Footer */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
                            <div style={{ fontSize: "13px", color: "#6b7280" }}>
                                Showing page {page} of {totalPages} ({totalItems} total APIs)
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={btnSecondaryStyle}>Previous</button>
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={btnSecondaryStyle}>Next</button>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Drawer */}
                    {selectedMetricsApi && (
                        <div style={{ marginTop: "25px", padding: "20px", backgroundColor: "#fafafa", borderRadius: "8px", border: "1px solid #d1d5db" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h3>Telemetry Metrics History for {selectedMetricsApi.name}</h3>
                                <button onClick={() => setSelectedMetricsApi(null)} style={btnSecondaryStyle}>Close</button>
                            </div>
                            {loadingMetrics ? <p>Loading metrics...</p> : metricsList.length === 0 ? <p>No metric history recorded yet.</p> : (
                                <table border="0" cellPadding="8" style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#e5e7eb", textAlign: "left" }}>
                                            <th>Timestamp</th><th>Status Code</th><th>Response Time (ms)</th><th>Payload Size</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metricsList.map((m) => (
                                            <tr key={m.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                                <td>{new Date(m.checked_at).toLocaleString()}</td>
                                                <td><span style={{ fontWeight: "bold", color: m.status_code < 400 ? "#16a34a" : "#dc2626" }}>{m.status_code || "Failed"}</span></td>
                                                <td>{m.response_time} ms</td>
                                                <td>{m.response_size ? `${m.response_size} B` : "N/A"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
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
const inputStyle = { padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px", flex: "1 1 200px" };
const selectStyle = { padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px", backgroundColor: "#fff" };
const btnPrimaryStyle = { padding: "8px 16px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" };
const btnSecondaryStyle = { padding: "8px 16px", backgroundColor: "#6b7280", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" };
const btnActionStyle = { padding: "4px 8px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" };

export default ConnectedApis;