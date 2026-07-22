import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
    getAiFeatures,
    getAiPredictions,
    getAiTrends,
    getAiRecommendationHistory,
    updateRecommendationStatus
} from "../services/aiService";
import { FaRobot, FaBrain, FaChartLine, FaLightbulb } from "react-icons/fa";
import "../styles/dashboard.css";

function AIInsightsPage({ darkMode, setDarkMode }) {
    const [features, setFeatures] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [trends, setTrends] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAiData = async () => {
        setLoading(true);
        try {
            const [featuresRes, predictionsRes, trendsRes, recsRes] = await Promise.all([
                getAiFeatures().catch(() => null),
                getAiPredictions().catch(() => null),
                getAiTrends().catch(() => null),
                getAiRecommendationHistory().catch(() => []),
            ]);

            if (featuresRes) setFeatures(featuresRes);
            if (predictionsRes) setPredictions(predictionsRes);
            if (trendsRes) setTrends(trendsRes);
            if (recsRes) setRecommendations(recsRes);
        } catch (err) {
            console.error("Failed to load AI Insights:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAiData();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateRecommendationStatus(id, status);
            setRecommendations((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status } : r))
            );
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    return (
        <div className={`dashboard ${darkMode ? "dark" : ""}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="dashboard-body">
                <Sidebar />
                <main className="content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <div>
                            <h1 style={{ color: "var(--text-heading)" }}>
                                <FaBrain style={{ color: "#818cf8", marginRight: "10px" }} /> AI Analytics & Optimization Intelligence
                            </h1>
                            <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                                Feature engineering metrics, multi-horizon ML demand predictions, trend detection, and confidence scoring.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Analyzing API telemetry...</div>
                    ) : (
                        <>
                            {/* Feature Engineering Cards */}
                            {features && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                                    <div className="canva-action-card">
                                        <div>
                                            <div style={cardTitleStyle}>Avg Latency</div>
                                            <div style={cardValueStyle}>{features.avg_latency} ms</div>
                                        </div>
                                    </div>
                                    <div className="canva-action-card">
                                        <div>
                                            <div style={cardTitleStyle}>Peak Latency</div>
                                            <div style={{ ...cardValueStyle, color: "#f59e0b" }}>{features.peak_latency} ms</div>
                                        </div>
                                    </div>
                                    <div className="canva-action-card">
                                        <div>
                                            <div style={cardTitleStyle}>Request Frequency</div>
                                            <div style={cardValueStyle}>{features.request_frequency}</div>
                                        </div>
                                    </div>
                                    <div className="canva-action-card">
                                        <div>
                                            <div style={cardTitleStyle}>Success Rate</div>
                                            <div style={{ ...cardValueStyle, color: "#10b981" }}>{features.success_percentage}%</div>
                                        </div>
                                    </div>
                                    <div className="canva-action-card">
                                        <div>
                                            <div style={cardTitleStyle}>Traffic Growth</div>
                                            <div style={{ ...cardValueStyle, color: "#6366f1" }}>{features.traffic_growth}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Multi-Horizon Predictions */}
                            {predictions && (
                                <div className="chart-card" style={{ marginBottom: "28px" }}>
                                    <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "10px" }}>
                                        <FaChartLine style={{ color: "#6366f1" }} /> Multi-Horizon Traffic & Demand Forecast
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                                        <div style={{ backgroundColor: "var(--table-row-bg)", padding: "18px", borderRadius: "14px", border: "1px solid var(--border-card)" }}>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Next Hour Forecast</div>
                                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#6366f1", marginTop: "4px" }}>{predictions.next_hour_predicted} reqs</div>
                                        </div>
                                        <div style={{ backgroundColor: "var(--table-row-bg)", padding: "18px", borderRadius: "14px", border: "1px solid var(--border-card)" }}>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Next 24 Hours</div>
                                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981", marginTop: "4px" }}>{predictions.next_day_predicted} reqs</div>
                                        </div>
                                        <div style={{ backgroundColor: "var(--table-row-bg)", padding: "18px", borderRadius: "14px", border: "1px solid var(--border-card)" }}>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Next 7 Days</div>
                                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#a855f7", marginTop: "4px" }}>{predictions.next_week_predicted} reqs</div>
                                        </div>
                                        <div style={{ backgroundColor: "var(--table-row-bg)", padding: "18px", borderRadius: "14px", border: "1px solid var(--border-card)" }}>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Model Accuracy / Confidence</div>
                                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#38bdf8", marginTop: "4px" }}>{predictions.confidence_score}%</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Trend Detection */}
                            {trends && (
                                <div className="chart-card" style={{ marginBottom: "28px" }}>
                                    <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "10px" }}>
                                        <FaRobot style={{ color: "#10b981" }} /> Automated Trend Detection
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                                        <div style={{ padding: "16px", borderRadius: "14px", border: "1px solid var(--border-card)", backgroundColor: "var(--table-row-bg)" }}>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Traffic Trend</div>
                                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#6366f1", marginTop: "4px" }}>{trends.traffic_trend} ({trends.traffic_change_pct}%)</div>
                                        </div>
                                        <div style={{ padding: "16px", borderRadius: "14px", border: "1px solid var(--border-card)", backgroundColor: "var(--table-row-bg)" }}>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Latency Trend</div>
                                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#f59e0b", marginTop: "4px" }}>{trends.latency_trend} ({trends.latency_change_ms} ms)</div>
                                        </div>
                                        <div style={{ padding: "16px", borderRadius: "14px", border: "1px solid var(--border-card)", backgroundColor: "var(--table-row-bg)" }}>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Error Trend</div>
                                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#10b981", marginTop: "4px" }}>{trends.error_trend}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recommendation Engine */}
                            <div className="chart-card">
                                <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <FaLightbulb style={{ color: "#f59e0b" }} /> AI Recommendation Engine & Action History
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                    {recommendations.map((rec) => (
                                        <div key={rec.id} style={{ padding: "18px", borderRadius: "14px", backgroundColor: "var(--table-row-bg)", border: "1px solid var(--border-card)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                                            <div>
                                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                    <span style={{ fontSize: "12px", fontWeight: "bold", padding: "3px 10px", backgroundColor: "var(--bg-active)", color: "var(--text-active)", borderRadius: "20px" }}>{rec.category}</span>
                                                    <span style={{ fontSize: "12px", fontWeight: "bold", padding: "3px 10px", backgroundColor: rec.status === "Applied" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: rec.status === "Applied" ? "#10b981" : "#f59e0b", borderRadius: "20px" }}>{rec.status}</span>
                                                </div>
                                                <h4 style={{ margin: "8px 0 4px 0", color: "var(--text-heading)" }}>{rec.title}</h4>
                                                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>{rec.impact}</p>
                                            </div>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                {rec.status !== "Applied" && (
                                                    <button onClick={() => handleStatusUpdate(rec.id, "Applied")} style={{ padding: "8px 16px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
                                                        Apply
                                                    </button>
                                                )}
                                                {rec.status !== "Ignored" && (
                                                    <button onClick={() => handleStatusUpdate(rec.id, "Ignored")} style={{ padding: "8px 16px", backgroundColor: "var(--text-muted)", color: "#fff", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "13px" }}>
                                                        Ignore
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

const cardTitleStyle = { fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" };
const cardValueStyle = { fontSize: "22px", fontWeight: "800", marginTop: "6px", color: "var(--text-main)" };

export default AIInsightsPage;
