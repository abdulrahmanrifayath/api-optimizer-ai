import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaRobot,
} from "react-icons/fa";

import "../styles/NotificationPanel.css";

function NotificationPanel({ dashboard }) {
  const notifications = [];
  const alerts = dashboard?.alerts || [];
  const scoreVal = dashboard?.score?.score || 95;
  const gradeVal = dashboard?.score?.grade || "A";
  const errorRateVal = dashboard?.score?.metrics?.error_rate || 0;
  const mostUsedEp = dashboard?.score?.metrics?.most_used_endpoint || "/api/v1/users";

  // No alerts
  if (!alerts || alerts.length === 0) {
    notifications.push({
      type: "success",
      icon: <FaCheckCircle />,
      title: "API Health Excellent",
      message: "No active alerts detected.",
    });
  } else {
    alerts.forEach(a => {
      notifications.push({
        type: a.severity === "High" ? "warning" : "info",
        icon: <FaExclamationTriangle />,
        title: a.title || "Telemetry Alert",
        message: a.explanation || a.message || "Anomaly detected."
      });
    });
  }

  // AI Score
  notifications.push({
    type: "ai",
    icon: <FaRobot />,
    title: "AI Score",
    message: `Current AI score is ${scoreVal}/100 (${gradeVal})`,
  });

  // Error Rate
  if (errorRateVal > 5) {
    notifications.push({
      type: "warning",
      icon: <FaExclamationTriangle />,
      title: "High Error Rate",
      message: `Error rate is ${errorRateVal}%`,
    });
  }

  // Endpoint Info
  notifications.push({
    type: "info",
    icon: <FaInfoCircle />,
    title: "Most Used Endpoint",
    message: mostUsedEp,
  });

  return (
    <div className="notification-panel">
      <h2>🔔 Smart Notifications</h2>

      {notifications.map((item, index) => (
        <div key={index} className={`notification ${item.type}`}>
          <div className="notification-icon">{item.icon}</div>

          <div className="notification-content">
            <h4>{item.title}</h4>
            <p>{item.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationPanel;