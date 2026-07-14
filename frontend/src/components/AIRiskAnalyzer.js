import "../styles/AIRiskAnalyzer.css";
import {
    FaShieldAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTimesCircle
} from "react-icons/fa";

function AIRiskAnalyzer({ dashboard }) {

    if (!dashboard) return null;

    const metrics = dashboard.score.metrics;

    let riskScore = 0;

    // Error Rate
    riskScore += metrics.error_rate * 5;

    // Response Time
    riskScore += metrics.avg_response_time * 100;

    // Traffic
    if (metrics.total_requests > 1000)
        riskScore += 20;

    riskScore = Math.round(riskScore);

    let level = "LOW";
    let color = "#16a34a";
    let icon = <FaCheckCircle />;

    if (riskScore >= 30) {
        level = "MEDIUM";
        color = "#f59e0b";
        icon = <FaExclamationTriangle />;
    }

    if (riskScore >= 60) {
        level = "HIGH";
        color = "#dc2626";
        icon = <FaTimesCircle />;
    }

    return (

        <div className="risk-card">

            <h2>
                <FaShieldAlt />
                AI Risk Analysis
            </h2>

            <div
                className="risk-score"
                style={{ borderColor: color }}
            >

                <div
                    className="risk-icon"
                    style={{ color }}
                >
                    {icon}
                </div>

                <h1 style={{ color }}>
                    {level} RISK
                </h1>

                <h3>
                    {riskScore} / 100
                </h3>

            </div>

            <div className="risk-details">

                <p>
                    ✔ Error Rate:
                    {metrics.error_rate}%
                </p>

                <p>
                    ✔ Avg Response:
                    {(metrics.avg_response_time * 1000).toFixed(1)} ms
                </p>

                <p>
                    ✔ Requests:
                    {metrics.total_requests}
                </p>

            </div>

            <div className="risk-footer">

                💡 AI Recommendation:

                {level === "LOW" &&
                    " Continue monitoring. No immediate action required."}

                {level === "MEDIUM" &&
                    " Consider enabling caching and horizontal scaling."}

                {level === "HIGH" &&
                    " Immediate optimization required. Scale infrastructure and investigate errors."}

            </div>

        </div>

    );

}

export default AIRiskAnalyzer;