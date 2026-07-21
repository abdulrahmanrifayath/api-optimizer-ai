import { useEffect, useState } from "react";
import { getAiRecommendationHistory, updateRecommendationStatus } from "../services/aiService";
import "./../styles/AIRecommendations.css";
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
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "Applied":
        return { backgroundColor: "#dcfce7", color: "#15803d" };
      case "Ignored":
        return { backgroundColor: "#fee2e2", color: "#991b1b" };
      default:
        return { backgroundColor: "#fef3c7", color: "#92400e" };
    }
  };

  if (loading) return null;

  return (
    <div className="recommendation-panel" style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
      <h2><FaLightbulb style={{ color: "#eab308", marginRight: "8px" }} /> AI Optimization Recommendations & Recommendation Engine</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
        {recommendations.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#f8fafc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px", backgroundColor: "#e0e7ff", color: "#3730a3" }}>
                  {item.category}
                </span>
                <span style={{ fontSize: "12px", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px", ...getStatusBadgeStyle(item.status) }}>
                  {item.status}
                </span>
              </div>
              <h4 style={{ margin: "8px 0 4px 0", fontSize: "16px", color: "#1e293b" }}>{item.title}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{item.impact}</p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {item.status !== "Accepted" && item.status !== "Applied" && (
                <button
                  onClick={() => handleStatusChange(item.id, "Accepted")}
                  style={btnActionStyle("#2563eb", "#ffffff")}
                >
                  <FaCheckCircle style={{ marginRight: "4px" }} /> Accept
                </button>
              )}
              {item.status !== "Applied" && (
                <button
                  onClick={() => handleStatusChange(item.id, "Applied")}
                  style={btnActionStyle("#16a34a", "#ffffff")}
                >
                  <FaCheckDouble style={{ marginRight: "4px" }} /> Apply
                </button>
              )}
              {item.status !== "Ignored" && (
                <button
                  onClick={() => handleStatusChange(item.id, "Ignored")}
                  style={btnActionStyle("#9ca3af", "#ffffff")}
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

const btnActionStyle = (bg, color) => ({
  padding: "6px 12px",
  backgroundColor: bg,
  color: color,
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
  display: "inline-flex",
  alignItems: "center",
});

export default AIRecommendations;