import "./../styles/AIRecommendations.css";
import {
  FaLightbulb,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRocket,
  FaDatabase,
} from "react-icons/fa";

function AIRecommendations({ dashboard }) {
  if (!dashboard) return null;

  const metrics = dashboard.score.metrics;

  const recommendations = [];

  // AI Score Recommendation
  if (dashboard.score.score >= 90) {
    recommendations.push({
      icon: <FaCheckCircle />,
      title: "Excellent API Health",
      description:
        "Your API is performing very well. Keep monitoring traffic patterns.",
      type: "success",
    });
  }

  // Error Rate
  if (metrics.error_rate > 5) {
    recommendations.push({
      icon: <FaExclamationTriangle />,
      title: "High Error Rate",
      description:
        "Investigate failing endpoints and improve exception handling.",
      type: "warning",
    });
  }

  // Response Time
  if (metrics.avg_response_time > 0.3) {
    recommendations.push({
      icon: <FaRocket />,
      title: "Optimize Response Time",
      description:
        "Consider caching, indexing your database, or load balancing.",
      type: "warning",
    });
  } else {
    recommendations.push({
      icon: <FaRocket />,
      title: "Response Time Healthy",
      description:
        "Current response time is excellent. No optimization needed.",
      type: "success",
    });
  }

  // Database
  recommendations.push({
    icon: <FaDatabase />,
    title: "Database Optimization",
    description:
      "Monitor slow queries and create indexes for frequently accessed tables.",
    type: "info",
  });

  // General AI Suggestion
  recommendations.push({
    icon: <FaLightbulb />,
    title: "AI Suggestion",
    description:
      "Enable request caching and rate limiting for heavily used endpoints.",
    type: "ai",
  });

  return (
    <div className="recommendation-panel">
      <h2>🤖 AI Optimization Recommendations</h2>

      {recommendations.map((item, index) => (
        <div
          key={index}
          className={`recommendation-card ${item.type}`}
        >
          <div className="recommendation-icon">
            {item.icon}
          </div>

          <div className="recommendation-content">
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AIRecommendations;