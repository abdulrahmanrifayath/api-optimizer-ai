import { useEffect, useState } from "react";
import API from "../services/api";
import { getConnectedApiSummary } from "../services/connectedApiService";
import { getAiScoreCard, getAiBusinessInsights } from "../services/aiService";

import "../styles/InfrastructureStatus.css";

import NotificationPanel from "../components/NotificationPanel";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import MetricCard from "../components/MetricCard";
import HealthStatus from "../components/HealthStatus";
import AIInsights from "../components/AIInsights";
import RecentActivity from "../components/RecentActivity";
import InfrastructureStatus from "../components/InfrastructureStatus";
import AIRecommendations from "../components/AIRecommendations";
import EndpointLeaderboard from "../components/EndpointLeaderboard";
import LiveRequestFeed from "../components/LiveRequestFeed";
import TrafficPrediction from "../components/TrafficPrediction";
import AIRiskAnalyzer from "../components/AIRiskAnalyzer";
import HealthTimeline from "../components/HealthTimeline";
import OptimizationAdvisor from "../components/OptimizationAdvisor";
import HistoryDashboard from "../components/HistoryDashboard";
import ActionCenter from "../components/ActionCenter";
import ExportCenter from "../components/ExportCenter";
import ExecutiveDashboard from "../components/ExecutiveDashboard";
import BenchmarkDashboard from "../components/BenchmarkDashboard";
import ExecutiveReport from "../components/ExecutiveReport";

import RequestChart from "../charts/RequestChart";
import EndpointPieChart from "../charts/EndpointPieChart";
import ResponseTimeChart from "../charts/ResponseTimeChart";
import ErrorPieChart from "../charts/ErrorPieChart";

import {
  FaRobot,
  FaServer,
  FaClock,
  FaExclamationTriangle,
  FaLink,
  FaCheckCircle,
  FaTimesCircle,
  FaChartPie,
  FaDollarSign,
  FaShieldAlt,
} from "react-icons/fa";

import "../styles/dashboard.css";

function Dashboard({

    darkMode,

    setDarkMode

}) {
  // =========================
  // State
  // =========================
  const [dashboard, setDashboard] = useState(null);
  const [apiSummary, setApiSummary] = useState(null);
  const [scoreCard, setScoreCard] = useState(null);
  const [businessInsights, setBusinessInsights] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

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

      setLastUpdated(
        new Date().toLocaleTimeString()
      );
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    }
  }

  // =========================
  // Auto Refresh Every 5 Seconds
  // =========================
  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // Loading Screen
  // =========================
  if (!dashboard) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "28px",
          fontWeight: "bold",
        }}
      >
        Loading Dashboard...
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
<div

    className={`dashboard ${darkMode ? "dark" : ""}`}

>
<Navbar

    darkMode={darkMode}

    setDarkMode={setDarkMode}

/>
      <div className="dashboard-body">
        <Sidebar />

        <main className="content">
          <h1>Dashboard</h1>

          <p>Welcome to the AI Powered API Usage Monitor</p>

          <p
            style={{
              color: "#666",
              marginBottom: "25px",
              fontSize: "14px",
            }}
          >
            Last Updated : {lastUpdated}
          </p>

          {/* =========================
              Metric Cards
          ========================== */}

          <div className="cards">
            <MetricCard
              title="AI Score"
              value={dashboard.score.score}
              decimals={0}
              color="#2563eb"
              icon={<FaRobot />}
            />

            <MetricCard
              title="Requests"
              value={dashboard.score.metrics.total_requests}
              color="#16a34a"
              icon={<FaServer />}
            />

            <MetricCard
              title="Avg Response"
              value={dashboard.score.metrics.avg_response_time * 1000}
              suffix=" ms"
              decimals={1}
              color="#ea580c"
              icon={<FaClock />}
            />

            <MetricCard
              title="Errors"
              value={dashboard.score.metrics.error_rate}
              suffix="%"
              color="#dc2626"
              icon={<FaExclamationTriangle />}
            />

            <HealthStatus
              errorRate={dashboard.score.metrics.error_rate}
            />
          </div>

          {/* =========================
              Connected APIs Live Overview
          ========================== */}
          {apiSummary && (
            <div style={{ marginTop: "25px", marginBottom: "25px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#374151" }}>
                Connected APIs Overview
              </h3>
              <div className="cards">
                <MetricCard
                  title="Total Connected APIs"
                  value={apiSummary.total_connected_apis}
                  color="#6366f1"
                  icon={<FaLink />}
                />
                <MetricCard
                  title="Active APIs"
                  value={apiSummary.active_apis}
                  color="#16a34a"
                  icon={<FaCheckCircle />}
                />
                <MetricCard
                  title="Inactive APIs"
                  value={apiSummary.inactive_apis}
                  color="#dc2626"
                  icon={<FaTimesCircle />}
                />
                <MetricCard
                  title="Avg API Response"
                  value={apiSummary.average_response_time}
                  suffix=" ms"
                  decimals={1}
                  color="#0284c7"
                  icon={<FaClock />}
                />
              </div>
            </div>
          {/* =========================
              AI Score Card (Phase 6) & Business Insights (Phase 7)
          ========================== */}
          {scoreCard && (
            <div style={{ marginTop: "25px", marginBottom: "25px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaRobot style={{ color: "#2563eb" }} /> AI Telemetry Score Card (Phase 6)
              </h3>
              <div className="cards">
                <MetricCard title="Overall Score" value={scoreCard.overall_score} suffix="/100" color="#2563eb" icon={<FaRobot />} />
                <MetricCard title="Performance" value={scoreCard.performance_score} suffix="/100" color="#16a34a" icon={<FaClock />} />
                <MetricCard title="Security" value={scoreCard.security_score} suffix="/100" color="#6366f1" icon={<FaShieldAlt />} />
                <MetricCard title="Reliability" value={scoreCard.reliability_score} suffix="/100" color="#d97706" icon={<FaCheckCircle />} />
                <MetricCard title="Availability" value={scoreCard.availability_score} suffix="/100" color="#0284c7" icon={<FaServer />} />
              </div>
            </div>
          )}

          {businessInsights && (
            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaDollarSign style={{ color: "#16a34a" }} /> Business Insights & Capacity Planning (Phase 7)
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", fontSize: "14px" }}>
                <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Peak Usage Hours</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1e293b", marginTop: "4px" }}>{businessInsights.peak_usage_hours}</div>
                </div>
                <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Most Used API</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb", marginTop: "4px" }}>{businessInsights.most_used_api}</div>
                </div>
                <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Est. Monthly Cost Savings</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#16a34a", marginTop: "4px" }}>${businessInsights.potential_cost_savings_usd}/mo</div>
                </div>
                <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Capacity Forecast</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#6366f1", marginTop: "4px" }}>{businessInsights.capacity_growth_forecast}</div>
                </div>
              </div>
            </div>
          )}

          <div className="charts-grid">
            <RequestChart dashboard={dashboard} />

            <EndpointPieChart dashboard={dashboard} />

            <ResponseTimeChart dashboard={dashboard} />

            <ErrorPieChart dashboard={dashboard} />
          </div>

          {/* =========================
              AI Recommendations
          ========================== */}

          <AIRecommendations dashboard={dashboard} />

           {/* =========================
              End Point Leaderboard
          ========================== */}

          <EndpointLeaderboard dashboard={dashboard} />

          {/* =========================
              Live Request Feed
          ========================== */}

          <LiveRequestFeed dashboard={dashboard} />

           {/* =========================
              Traffic Prediction Dashboard
          ========================== */}

          <TrafficPrediction dashboard={dashboard} />

           {/* =========================
              AI Risk Analyzer
          ========================== */}

          <AIRiskAnalyzer dashboard={dashboard} />


           {/* =========================
              AI Insights
          ========================== */}

          <AIInsights dashboard={dashboard} />

          {/* =========================
              Optmization Advisor
          ========================== */}

          <OptimizationAdvisor />

           {/* =========================
              Action Center
          ========================== */}
          <ActionCenter />

           {/* =========================
              Export Center
          ========================== */}

          <ExportCenter />

          {/* =========================
              Executive Dashboard
          ========================== */}

          <ExecutiveDashboard />

           {/* =========================
              Executive Report
          ========================== */}

          <ExecutiveReport />

          {/* =========================
              BenchMark Dashboard
          ========================== */}
          
            <BenchmarkDashboard />

          {/* =========================
              History Dashboard
          ========================== */}

          <HistoryDashboard />

          {/* =========================
              Notification Panel
          ========================== */}

          <NotificationPanel dashboard={dashboard} />

          {/* =========================
              Recent Activity
          ========================== */}

          <RecentActivity dashboard={dashboard} />

          <InfrastructureStatus />

          <HealthTimeline dashboard={dashboard} />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;