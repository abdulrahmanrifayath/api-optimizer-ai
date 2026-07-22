import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import MetricCard from "../components/MetricCard";
import RequestChart from "../charts/RequestChart";
import ResponseTimeChart from "../charts/ResponseTimeChart";
import ErrorPieChart from "../charts/ErrorPieChart";
import EndpointPieChart from "../charts/EndpointPieChart";

import RecentActivity from "../components/RecentActivity";
import AIInsights from "../components/AIInsights";
import NotificationPanel from "../components/NotificationPanel";

import LiveRequestFeed from "../components/LiveRequestFeed";
import EndpointLeaderboard from "../components/EndpointLeaderboard";
import TrafficPrediction from "../components/TrafficPrediction";

import HealthTimeline from "../components/HealthTimeline";
import AIRiskAnalyzer from "../components/AIRiskAnalyzer";
import AIRecommendations from "../components/AIRecommendations";

import { getConnectedApiSummary } from "../services/connectedApiService";
import { getAiScoreCard, getAiBusinessInsights } from "../services/aiService";

import API from "../services/api";

import {
  FaRobot,
  FaServer,
  FaClock,
  FaExclamationTriangle,
  FaPlay,
  FaBriefcase,
  FaFileDownload,
  FaChartLine,
  FaBrain
} from "react-icons/fa";

import "../styles/dashboard.css";

function Dashboard({ darkMode, setDarkMode }) {
  const [dashboard, setDashboard] = useState(null);
  const [apiSummary, setApiSummary] = useState(null);
  const [scoreCard, setScoreCard] = useState(null);
  const [businessInsights, setBusinessInsights] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // =========================
  // Fetch Dashboard Data
  // =========================
  async function fetchDashboard() {
    try {
      const [res, summaryRes, scoreCardRes, businessRes] = await Promise.all([
        API.get("/ai/dashboard"),
        getConnectedApiSummary().catch(() => null),
        getAiScoreCard().catch(() => null),
        getAiBusinessInsights().catch(() => null),
      ]);

      setDashboard(res.data);
      if (summaryRes) setApiSummary(summaryRes);
      if (scoreCardRes) setScoreCard(scoreCardRes);
      if (businessRes) setBusinessInsights(businessRes);
      setError(null);

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }
      setError("Failed to load live telemetry dashboard. Please ensure backend is running.");
      // Fallback default structure
      setDashboard({
        score: {
          score: 95,
          status: "Excellent",
          metrics: { total_requests: 1250, avg_response_time: 0.045, error_rate: 0.0, most_used_endpoint: "/api/v1/users" }
        },
        alerts: [],
        traffic: { total_logs: 1250, status: "Healthy", predicted_next_hour: 1400, top_endpoints: [["/api/v1/users", 540], ["/api/v1/auth/login", 320], ["/connected-apis", 180]] }
      });
    }
  }

  // Auto Refresh Every 5 Seconds
  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  // Loading Screen
  if (!dashboard) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#2563eb",
          gap: "15px"
        }}
      >
        <div>Loading AI Optimizer Control Center...</div>
        <div style={{ fontSize: "14px", color: "#6b7280" }}>Fetching live API telemetry & AI models...</div>
      </div>
    );
  }

  return (
    <div className={`dashboard ${darkMode ? "dark" : ""}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="dashboard-body">
        <Sidebar />

        <main className="content">
          {/* Hero Welcome & Control Banner */}
          <div className="hero-banner">
            <div>
              <div className="live-indicator" style={{ marginBottom: "10px" }}>
                <span className="pulse-dot"></span>
                LIVE TELEMETRY ENGINE • AUTO-REFRESH 5s
              </div>
              <h1>Welcome to AI Optimizer Control Center 👋</h1>
              <p>Real-time HTTP log ingestion, predictive ML traffic forecasting, and automated anomaly detection.</p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", zIndex: 1 }}>
              <button
                onClick={() => navigate("/connected-apis")}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#ffffff",
                  color: "#1e40af",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                <FaPlay style={{ fontSize: "11px" }} /> Connect APIs
              </button>
              <button
                onClick={() => navigate("/executive-dashboard")}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backdropFilter: "blur(8px)"
                }}
              >
                <FaBriefcase /> Executive Board
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="cards">
            <MetricCard
              title="AI Score"
              value={dashboard.score?.score || 95}
              decimals={0}
              color="#2563eb"
              icon={<FaRobot />}
            />
            <MetricCard
              title="Total Requests"
              value={dashboard.score?.metrics?.total_requests || 0}
              color="#16a34a"
              icon={<FaServer />}
            />
            <MetricCard
              title="Avg Latency"
              value={(dashboard.score?.metrics?.avg_response_time || 0) * 1000}
              decimals={1}
              color="#f59e0b"
              icon={<FaClock />}
            />
            <MetricCard
              title="Error Rate (%)"
              value={dashboard.score?.metrics?.error_rate || 0}
              decimals={2}
              color="#dc2626"
              icon={<FaExclamationTriangle />}
            />
          </div>

          {/* Business Insights Banner */}
          {businessInsights && (
            <div
              style={{
                backgroundColor: darkMode ? "#1e293b" : "#eff6ff",
                border: "1px solid",
                borderColor: darkMode ? "#334155" : "#bfdbfe",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <FaBrain style={{ fontSize: "24px", color: "#2563eb", flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: "0 0 4px 0", color: darkMode ? "#f8fafc" : "#1e3a8a", fontSize: "14px", fontWeight: "bold" }}>
                  AI Business Insight ({businessInsights.summary_title || "Optimization Notice"})
                </h4>
                <p style={{ margin: 0, fontSize: "13px", color: darkMode ? "#cbd5e1" : "#1e40af" }}>
                  {businessInsights.plain_english_summary || "System operating efficiently with low latency and optimal throughput."}
                </p>
              </div>
            </div>
          )}

          {/* Charts Grid Row 1 */}
          <div className="charts-grid">
            <RequestChart dashboard={dashboard} />
            <ResponseTimeChart dashboard={dashboard} />
          </div>

          {/* Charts Grid Row 2 */}
          <div className="charts-grid">
            <ErrorPieChart dashboard={dashboard} />
            <EndpointPieChart dashboard={dashboard} />
          </div>

          {/* Live Request Feed & Prediction Section */}
          <div className="charts-grid">
            <LiveRequestFeed dashboard={dashboard} />
            <TrafficPrediction dashboard={dashboard} />
          </div>

          {/* Health & Risk Analyzer */}
          <div className="charts-grid">
            <AIRiskAnalyzer dashboard={dashboard} />
            <HealthTimeline dashboard={dashboard} />
          </div>

          {/* AI Recommendations Module */}
          <div style={{ marginTop: "30px" }}>
            <AIRecommendations />
          </div>

          {/* Leaderboard & Recent Activity */}
          <EndpointLeaderboard dashboard={dashboard} />
          <RecentActivity dashboard={dashboard} />

          {/* Smart Notifications & Insights */}
          <div className="charts-grid">
            <NotificationPanel dashboard={dashboard} />
            <AIInsights dashboard={dashboard} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;