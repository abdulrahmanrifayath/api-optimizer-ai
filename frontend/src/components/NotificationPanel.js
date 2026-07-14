import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaRobot,
} from "react-icons/fa";

import "../styles/NotificationPanel.css";

function NotificationPanel({ dashboard }) {
  const notifications = [];

  // No alerts
  if (!dashboard.alerts || dashboard.alerts.length === 0) {
    notifications.push({
      type: "success",
      icon: <FaCheckCircle />,
      title: "API Health Excellent",
      message: "No active alerts detected.",
    });
  }

  // AI Score
  notifications.push({
    type: "ai",
    icon: <FaRobot />,
    title: "AI Score",
    message: `Current AI score is ${dashboard.score.score}/100 (${dashboard.score.grade})`,
  });

  // Error Rate
  if (dashboard.score.metrics.error_rate > 5) {
    notifications.push({
      type: "warning",
      icon: <FaExclamationTriangle />,
      title: "High Error Rate",
      message: `Error rate is ${dashboard.score.metrics.error_rate}%`,
    });
  }

  // Endpoint Info
  notifications.push({
    type: "info",
    icon: <FaInfoCircle />,
    title: "Most Used Endpoint",
    message: dashboard.score.metrics.most_used_endpoint,
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