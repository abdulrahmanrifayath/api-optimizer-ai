import { useEffect, useState } from "react";
import { getAiRecommendationHistory, updateRecommendationStatus } from "../services/aiService";
import {
  FaLightbulb,
  FaCheckCircle,
  FaTimesCircle,
  FaCheckDouble,
} from "react-icons/fa";

function AIRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = async () => {
    try {
      const data = await getAiRecommendationHistory();
      setRecommendations(data || []);
    } catch (err) {
      console.error("Failed to load recommendation history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRecommendationStatus(id, newStatus);
      setRecommendations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Accepted":
        return { backgroundColor: "rgba(99, 102, 241, 0.2)", color: "#818cf8" };
      case "Applied":
        return { backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#34d399" };
      case "Ignored":
        return { backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#f87171" };
      default:
        return { backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#fbbf24" };
    }
  };

  if (loading) return null;

  return (
    <div className="chart-card" style={{ marginBottom: "25px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", color: "var(--text-heading)" }}>
        <FaLightbulb style={{ color: "#f59e0b" }} /> AI Optimization Recommendations & Recommendation Engine
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {recommendations.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "18px",
              borderRadius: "16px",
              border: "1px solid var(--border-card)",
              backgroundColor: "var(--table-row-bg)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", padding: "3px 10px", borderRadius: "20px", backgroundColor: "var(--bg-active)", color: "var(--text-active)" }}>
                  {item.category}
                </span>
                <span style={{ fontSize: "12px", fontWeight: "bold", padding: "3px 10px", borderRadius: "20px", ...getStatusBadgeStyle(item.status) }}>
                  {item.status}
                </span>
              </div>
              <h4 style={{ margin: "10px 0 4px 0", fontSize: "16px", fontWeight: "bold", color: "var(--text-heading)" }}>{item.title}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>{item.impact}</p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {item.status !== "Accepted" && item.status !== "Applied" && (
                <button
                  onClick={() => handleStatusChange(item.id, "Accepted")}
                  style={btnActionStyle("#6366f1")}
                >
                  <FaCheckCircle style={{ marginRight: "4px" }} /> Accept
                </button>
              )}
              {item.status !== "Applied" && (
                <button
                  onClick={() => handleStatusChange(item.id, "Applied")}
                  style={btnActionStyle("#10b981")}
                >
                  <FaCheckDouble style={{ marginRight: "4px" }} /> Apply
                </button>
              )}
              {item.status !== "Ignored" && (
                <button
                  onClick={() => handleStatusChange(item.id, "Ignored")}
                  style={btnActionStyle("#64748b")}
                >
                  <FaTimesCircle style={{ marginRight: "4px" }} /> Ignore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btnActionStyle = (bg) => ({
  padding: "8px 14px",
  backgroundColor: bg,
  color: "#ffffff",
  border: "none",
  borderRadius: "20px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
  display: "inline-flex",
  alignItems: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
});

export default AIRecommendations;