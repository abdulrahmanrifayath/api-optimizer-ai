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
  FaBriefcase,
  FaList,
  FaBrain,
  FaMagic,
  FaRocket,
  FaFilePdf
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

  // Fetch Dashboard Data
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
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          fontWeight: "bold",
          color: "var(--text-main)",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className={`dashboard ${darkMode ? "dark" : ""}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="dashboard-body">
        <Sidebar />

        <main className="content">
          {/* Hero Banner */}
          <div className="hero-banner">
            <div>
              <h1 style={{ color: "#ffffff" }}>Monitor & Optimize APIs Like Magic ✨</h1>
              <p style={{ color: "#e9d5ff" }}>Real-time HTTP log ingestion, predictive ML traffic forecasting, and executive business reports.</p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", zIndex: 1 }}>
              <button
                onClick={() => navigate("/connected-apis")}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#ffffff",
                  color: "#4c1d95",
                  border: "none",
                  borderRadius: "30px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
                }}
              >
                <FaRocket style={{ color: "#7c3aed" }} /> Connect API
              </button>
              <button
                onClick={() => navigate("/executive-dashboard")}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "rgba(255,255,255,0.18)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "30px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backdropFilter: "blur(12px)"
                }}
              >
                <FaBriefcase /> Executive Board
              </button>
            </div>
          </div>

          {/* Canva Quick Action Row */}
          <div className="canva-action-grid">
            <div className="canva-action-card" onClick={() => navigate("/connected-apis")}>
              <div className="canva-action-icon" style={{ background: "linear-gradient(135deg, #7c3aed, #c084fc)" }}>
                <FaServer />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "var(--text-heading)" }}>Connect REST API</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>Add & test API endpoints</p>
              </div>
            </div>

            <div className="canva-action-card" onClick={() => navigate("/logs")}>
              <div className="canva-action-icon" style={{ background: "linear-gradient(135deg, #0284c7, #38bdf8)" }}>
                <FaList />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "var(--text-heading)" }}>Log Explorer</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>Live telemetry & exports</p>
              </div>
            </div>

            <div className="canva-action-card" onClick={() => navigate("/ai-insights")}>
              <div className="canva-action-icon" style={{ background: "linear-gradient(135deg, #db2777, #f472b6)" }}>
                <FaMagic />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "var(--text-heading)" }}>AI Insights</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>ML predictions & forecast</p>
              </div>
            </div>

            <div className="canva-action-card" onClick={() => navigate("/executive-dashboard")}>
              <div className="canva-action-icon" style={{ background: "linear-gradient(135deg, #ea580c, #fb923c)" }}>
                <FaFilePdf />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "var(--text-heading)" }}>Executive Report</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>Generate PDF reports</p>
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="cards">
            <MetricCard
              title="AI Telemetry Score"
              value={dashboard.score?.score || 95}
              decimals={0}
              color="#a855f7"
              icon={<FaRobot />}
            />
            <MetricCard
              title="Total HTTP Requests"
              value={dashboard.score?.metrics?.total_requests || 0}
              color="#10b981"
              icon={<FaServer />}
            />
            <MetricCard
              title="Avg Latency (ms)"
              value={(dashboard.score?.metrics?.avg_response_time || 0) * 1000}
              decimals={1}
              color="#f59e0b"
              icon={<FaClock />}
            />
            <MetricCard
              title="Error Rate (%)"
              value={dashboard.score?.metrics?.error_rate || 0}
              decimals={2}
              color="#ef4444"
              icon={<FaExclamationTriangle />}
            />
          </div>

          {/* Business Insights Banner */}
          {businessInsights && (
            <div
              style={{
                backgroundColor: "var(--bg-card)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--border-card)",
                borderRadius: "20px",
                padding: "20px 24px",
                marginBottom: "32px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "var(--shadow-card)"
              }}
            >
              <FaBrain style={{ fontSize: "28px", color: "#a855f7", flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: "0 0 4px 0", color: "var(--text-heading)", fontSize: "15px", fontWeight: "bold" }}>
                  AI Business Insight ({businessInsights.summary_title || "System Health"})
                </h4>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
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
          <div style={{ marginTop: "32px" }}>
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