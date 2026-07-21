import { useEffect, useState } from "react";
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

function ConnectedApis() {
    const [apis, setApis] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

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

    // ----------------------------
    // Load APIs & Summary
    // ----------------------------
    const loadData = async () => {
        try {
            const [apisData, summaryData] = await Promise.all([
                getConnectedApis(),
                getConnectedApiSummary(),
            ]);
            setApis(apisData);
            setSummary(summaryData);
        } catch (err) {
            console.error("Failed to load APIs or summary:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ----------------------------
    // Add / Update API
    // ----------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await updateConnectedApi(editingId, form);
            } else {
                await createConnectedApi(form);
            }

            setForm({
                name: "",
                base_url: "",
                description: "",
            });

            setEditingId(null);
            loadData();
        } catch (err) {
            alert("Operation failed");
            console.error(err);
        }
    };

    // ----------------------------
    // Delete API
    // ----------------------------
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this API?")) return;

        try {
            await deleteConnectedApi(id);
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    // ----------------------------
    // Edit API
    // ----------------------------
    const handleEdit = (api) => {
        setEditingId(api.id);
        setForm({
            name: api.name,
            base_url: api.base_url,
            description: api.description || "",
        });
    };

    // ----------------------------
    // STEP 1: Toggle Status (Activate / Deactivate)
    // ----------------------------
    const handleToggleStatus = async (api) => {
        const newStatus = api.status === "Active" ? "Inactive" : "Active";
        try {
            await updateApiStatus(api.id, newStatus);
            // Update UI immediately
            setApis((prevApis) =>
                prevApis.map((item) =>
                    item.id === api.id ? { ...item, status: newStatus } : item
                )
            );
            loadData();
        } catch (err) {
            alert("Failed to update status");
            console.error(err);
        }
    };

    // ----------------------------
    // STEP 2 & 3: Test API Connection
    // ----------------------------
    const handleTestConnection = async (apiId) => {
        setTestingId(apiId);
        try {
            const res = await testApiConnection(apiId);
            setTestResults((prev) => ({
                ...prev,
                [apiId]: res,
            }));
            loadData();
        } catch (err) {
            console.error("Test connection failed:", err);
            setTestResults((prev) => ({
                ...prev,
                [apiId]: { status: "Failed", error: "Connection error" },
            }));
        } finally {
            setTestingId(null);
        }
    };

    // ----------------------------
    // View Metrics History
    // ----------------------------
    const handleViewMetrics = async (api) => {
        setSelectedMetricsApi(api);
        setLoadingMetrics(true);
        try {
            const data = await getApiMetrics(api.id);
            setMetricsList(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMetrics(false);
        }
    };

    if (loading) {
        return <h2 style={{ padding: "30px" }}>Loading Connected APIs...</h2>;
    }

    return (
        <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
            <h1>Connected APIs</h1>
            <p style={{ color: "#666" }}>Manage, test, and monitor your connected APIs in real-time.</p>

            <hr />
            <br />

            {/* =========================
                STEP 4: Live Summary Cards
            ========================== */}
            {summary && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "15px",
                        marginBottom: "30px",
                    }}
                >
                    <div style={cardStyle}>
                        <div style={cardTitleStyle}>Total Connected APIs</div>
                        <div style={cardValueStyle}>{summary.total_connected_apis}</div>
                    </div>
                    <div style={cardStyle}>
                        <div style={cardTitleStyle}>Active APIs</div>
                        <div style={{ ...cardValueStyle, color: "#16a34a" }}>
                            {summary.active_apis}
                        </div>
                    </div>
                    <div style={cardStyle}>
                        <div style={cardTitleStyle}>Inactive APIs</div>
                        <div style={{ ...cardValueStyle, color: "#dc2626" }}>
                            {summary.inactive_apis}
                        </div>
                    </div>
                    <div style={cardStyle}>
                        <div style={cardTitleStyle}>Avg Response Time</div>
                        <div style={cardValueStyle}>{summary.average_response_time} ms</div>
                    </div>
                    <div style={cardStyle}>
                        <div style={cardTitleStyle}>Last Connection Check</div>
                        <div style={{ fontSize: "14px", fontWeight: "600", marginTop: "10px" }}>
                            {summary.last_connection_check
                                ? new Date(summary.last_connection_check).toLocaleString()
                                : "N/A"}
                        </div>
                    </div>
                </div>
            )}

            {/* =========================
                Add / Edit Form
            ========================== */}
            <form
                onSubmit={handleSubmit}
                style={{
                    backgroundColor: "#f9fafb",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    marginBottom: "30px",
                }}
            >
                <h3>{editingId ? "Edit Connected API" : "Add New API"}</h3>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                    <input
                        placeholder="API Name"
                        value={form.name}
                        required
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        style={inputStyle}
                    />

                    <input
                        placeholder="Base URL (e.g. https://api.example.com)"
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
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                setForm({ name: "", base_url: "", description: "" });
                            }}
                            style={btnSecondaryStyle}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* =========================
                Connected APIs Table
            ========================== */}
            <table
                border="0"
                cellPadding="12"
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}
            >
                <thead>
                    <tr style={{ backgroundColor: "#f3f4f6", textAlign: "left" }}>
                        <th>Name</th>
                        <th>Base URL</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Test Result</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {apis.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                No connected APIs found. Add one above!
                            </td>
                        </tr>
                    ) : (
                        apis.map((api) => {
                            const result = testResults[api.id];
                            return (
                                <tr key={api.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td><strong>{api.name}</strong></td>
                                    <td>
                                        <a href={api.base_url} target="_blank" rel="noreferrer">
                                            {api.base_url}
                                        </a>
                                    </td>
                                    <td>{api.description || "N/A"}</td>
                                    {/* STEP 1: Colored status badges */}
                                    <td>
                                        <span
                                            style={{
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                                backgroundColor:
                                                    api.status === "Active" ? "#dcfce7" : "#fee2e2",
                                                color:
                                                    api.status === "Active" ? "#15803d" : "#b91c1c",
                                            }}
                                        >
                                            {api.status}
                                        </span>
                                    </td>
                                    {/* STEP 2: Test Result Badge */}
                                    <td>
                                        {testingId === api.id ? (
                                            <span style={{ color: "#2563eb", fontSize: "13px" }}>Testing...</span>
                                        ) : result ? (
                                            result.status === "Connected" ? (
                                                <span style={{ color: "#16a34a", fontSize: "13px" }}>
                                                    ✅ Connected ({result.response_time} ms, HTTP {result.status_code})
                                                </span>
                                            ) : (
                                                <span style={{ color: "#dc2626", fontSize: "13px" }}>
                                                    ❌ Failed ({result.error || "Error"})
                                                </span>
                                            )
                                        ) : (
                                            <span style={{ color: "#9ca3af", fontSize: "13px" }}>Not tested</span>
                                        )}
                                    </td>
                                    {/* Actions */}
                                    <td>
                                        {/* STEP 1: Activate / Deactivate Action */}
                                        <button
                                            onClick={() => handleToggleStatus(api)}
                                            style={{
                                                ...btnActionStyle,
                                                backgroundColor:
                                                    api.status === "Active" ? "#fef3c7" : "#dcfce7",
                                                color:
                                                    api.status === "Active" ? "#92400e" : "#166534",
                                            }}
                                        >
                                            {api.status === "Active" ? "Deactivate" : "Activate"}
                                        </button>

                                        {" "}

                                        {/* STEP 2: Test Connection */}
                                        <button
                                            onClick={() => handleTestConnection(api.id)}
                                            disabled={testingId === api.id}
                                            style={{
                                                ...btnActionStyle,
                                                backgroundColor: "#dbeafe",
                                                color: "#1e40af",
                                            }}
                                        >
                                            Test Connection
                                        </button>

                                        {" "}

                                        {/* View Metrics */}
                                        <button
                                            onClick={() => handleViewMetrics(api)}
                                            style={{
                                                ...btnActionStyle,
                                                backgroundColor: "#f3e8ff",
                                                color: "#6b21a8",
                                            }}
                                        >
                                            Metrics
                                        </button>

                                        {" "}

                                        <button
                                            onClick={() => handleEdit(api)}
                                            style={{
                                                ...btnActionStyle,
                                                backgroundColor: "#e5e7eb",
                                                color: "#374151",
                                            }}
                                        >
                                            Edit
                                        </button>

                                        {" "}

                                        <button
                                            onClick={() => handleDelete(api.id)}
                                            style={{
                                                ...btnActionStyle,
                                                backgroundColor: "#fee2e2",
                                                color: "#991b1b",
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* =========================
                Metrics Modal / Details Section
            ========================== */}
            {selectedMetricsApi && (
                <div
                    style={{
                        marginTop: "30px",
                        padding: "20px",
                        backgroundColor: "#fafafa",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3>Metrics History for {selectedMetricsApi.name}</h3>
                        <button
                            onClick={() => setSelectedMetricsApi(null)}
                            style={btnSecondaryStyle}
                        >
                            Close History
                        </button>
                    </div>

                    {loadingMetrics ? (
                        <p>Loading metrics history...</p>
                    ) : metricsList.length === 0 ? (
                        <p>No metric history recorded yet for this API. Click "Test Connection" to record metrics!</p>
                    ) : (
                        <table border="0" cellPadding="8" style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#e5e7eb", textAlign: "left" }}>
                                    <th>Checked At</th>
                                    <th>Status Code</th>
                                    <th>Response Time (ms)</th>
                                    <th>Response Size (bytes)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metricsList.map((m) => (
                                    <tr key={m.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                        <td>{new Date(m.checked_at).toLocaleString()}</td>
                                        <td>
                                            <span style={{ fontWeight: "bold", color: m.status_code === 200 ? "#16a34a" : "#dc2626" }}>
                                                {m.status_code || "Failed"}
                                            </span>
                                        </td>
                                        <td>{m.response_time} ms</td>
                                        <td>{m.response_size ?? "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

// Styling Constants
const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
};

const cardTitleStyle = {
    fontSize: "12px",
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "bold",
};

const cardValueStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    marginTop: "8px",
};

const inputStyle = {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    flex: "1 1 200px",
};

const btnPrimaryStyle = {
    padding: "8px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
};

const btnSecondaryStyle = {
    padding: "8px 16px",
    backgroundColor: "#9ca3af",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
};

const btnActionStyle = {
    padding: "4px 8px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
};

export default ConnectedApis;