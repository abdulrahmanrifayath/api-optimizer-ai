import { useEffect, useState } from "react";
import API from "../services/api";

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


import RequestChart from "../charts/RequestChart";
import EndpointPieChart from "../charts/EndpointPieChart";
import ResponseTimeChart from "../charts/ResponseTimeChart";
import ErrorPieChart from "../charts/ErrorPieChart";

import {
  FaRobot,
  FaServer,
  FaClock,
  FaExclamationTriangle,
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
  const [lastUpdated, setLastUpdated] = useState("");

  // =========================
  // Fetch Dashboard Data
  // =========================
  async function fetchDashboard() {
    try {
      const res = await API.get("/ai/dashboard");

      setDashboard(res.data);

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
              Charts
          ========================== */}

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