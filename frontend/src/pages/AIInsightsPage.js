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
import { FaRobot, FaBrain, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaShieldAlt } from "react-icons/fa";
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div>
                            <h1><FaBrain style={{ color: "#2563eb", marginRight: "8px" }} /> AI Analytics & Optimization Intelligence</h1>
                            <p style={{ color: "#6b7280", margin: "4px 0 0 0" }}>
                                Feature engineering metrics, multi-horizon ML demand predictions, trend detection, and confidence scoring.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Analyzing API telemetry...</div>
                    ) : (
                        <>
                            {/* Feature Engineering Cards */}
                            {features && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "25px" }}>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}>Avg Latency</div>
                                        <div style={cardValueStyle}>{features.avg_latency} ms</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}>Peak Latency</div>
                                        <div style={{ ...cardValueStyle, color: "#d97706" }}>{features.peak_latency} ms</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}>Request Frequency</div>
                                        <div style={cardValueStyle}>{features.request_frequency}</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}>Success Rate</div>
                                        <div style={{ ...cardValueStyle, color: "#16a34a" }}>{features.success_percentage}%</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}>Traffic Growth</div>
                                        <div style={{ ...cardValueStyle, color: "#2563eb" }}>{features.traffic_growth}</div>
                                    </div>
                                </div>
                            )}

                            {/* Multi-Horizon Predictions */}
                            {predictions && (
                                <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
                                    <h3 style={{ margin: "0 0 15px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <FaChartLine style={{ color: "#2563eb" }} /> Multi-Horizon Traffic & Demand Forecast
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px" }}>
                                        <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                            <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Next Hour Forecast</div>
                                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2563eb", marginTop: "4px" }}>{predictions.next_hour_predicted} reqs</div>
                                        </div>
                                        <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                            <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Next 24 Hours</div>
                                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#16a34a", marginTop: "4px" }}>{predictions.next_day_predicted} reqs</div>
                                        </div>
                                        <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                            <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Next 7 Days</div>
                                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#6366f1", marginTop: "4px" }}>{predictions.next_week_predicted} reqs</div>
                                        </div>
                                        <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                            <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Model Accuracy / Confidence</div>
                                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0284c7", marginTop: "4px" }}>{predictions.confidence_score}%</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Trend Detection */}
                            {trends && (
                                <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
                                    <h3 style={{ margin: "0 0 15px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <FaRobot style={{ color: "#16a34a" }} /> Automated Trend Detection
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px" }}>
                                        <div style={{ padding: "14px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                                            <div style={{ fontSize: "12px", color: "#6b7280" }}>Traffic Trend</div>
                                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2563eb", marginTop: "4px" }}>{trends.traffic_trend} ({trends.traffic_change_pct}%)</div>
                                        </div>
                                        <div style={{ padding: "14px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                                            <div style={{ fontSize: "12px", color: "#6b7280" }}>Latency Trend</div>
                                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#d97706", marginTop: "4px" }}>{trends.latency_trend} ({trends.latency_change_ms} ms)</div>
                                        </div>
                                        <div style={{ padding: "14px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                                            <div style={{ fontSize: "12px", color: "#6b7280" }}>Error Trend</div>
                                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#16a34a", marginTop: "4px" }}>{trends.error_trend}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recommendation Engine with Confidence Scores */}
                            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                                <h3 style={{ margin: "0 0 15px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <FaLightbulb style={{ color: "#eab308" }} /> AI Recommendation Engine & Action History
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {recommendations.map((rec) => (
                                        <div key={rec.id} style={{ padding: "16px", borderRadius: "6px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                                            <div>
                                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                    <span style={{ fontSize: "12px", fontWeight: "bold", padding: "2px 8px", backgroundColor: "#e0e7ff", color: "#3730a3", borderRadius: "4px" }}>{rec.category}</span>
                                                    <span style={{ fontSize: "12px", fontWeight: "bold", padding: "2px 8px", backgroundColor: rec.status === "Applied" ? "#dcfce7" : "#fef3c7", color: rec.status === "Applied" ? "#15803d" : "#92400e", borderRadius: "4px" }}>{rec.status}</span>
                                                </div>
                                                <h4 style={{ margin: "6px 0 4px 0", color: "#1e293b" }}>{rec.title}</h4>
                                                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{rec.impact}</p>
                                            </div>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                {rec.status !== "Applied" && (
                                                    <button onClick={() => handleStatusUpdate(rec.id, "Applied")} style={{ padding: "6px 12px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
                                                        Apply
                                                    </button>
                                                )}
                                                {rec.status !== "Ignored" && (
                                                    <button onClick={() => handleStatusUpdate(rec.id, "Ignored")} style={{ padding: "6px 12px", backgroundColor: "#6b7280", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
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

const cardStyle = { backgroundColor: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" };
const cardTitleStyle = { fontSize: "12px", color: "#6b7280", textTransform: "uppercase", fontWeight: "bold" };
const cardValueStyle = { fontSize: "22px", fontWeight: "bold", marginTop: "6px" };

export default AIInsightsPage;
