import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/ExecutiveDashboard.css";

function ExecutiveDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();

        const interval = setInterval(() => {
            loadAnalytics();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    async function loadAnalytics() {
        try {
            const res = await API.get("/ai/analytics");
            setAnalytics(res.data);
        } catch (err) {
            console.error("Analytics Error:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading || !analytics) {
        return (
            <div className="executive-dashboard">
                <h2>Loading Executive Dashboard...</h2>
            </div>
        );
    }

    const successRate = Number(analytics.success_rate || 0);

    let health = "Critical";

    if (successRate >= 99) {
        health = "Excellent";
    } else if (successRate >= 95) {
        health = "Healthy";
    } else if (successRate >= 90) {
        health = "Warning";
    }

    return (
        <div className="executive-dashboard">

            <div className="executive-header">
                <h2>📊 Executive Analytics Dashboard</h2>

                <p>
                    Last Updated :{" "}
                    {new Date().toLocaleTimeString()}
                </p>
            </div>

            <div className="executive-grid">

                <div className="executive-card">
                    <h4>Total Requests</h4>
                    <h1>{analytics.total_requests.toLocaleString()}</h1>
                </div>

                <div className="executive-card">
                    <h4>Successful Requests</h4>
                    <h1>{analytics.successful_requests.toLocaleString()}</h1>
                </div>

                <div className="executive-card">
                    <h4>Failed Requests</h4>
                    <h1>{analytics.failed_requests.toLocaleString()}</h1>
                </div>

                <div className="executive-card">
                    <h4>Success Rate</h4>
                    <h1>{successRate.toFixed(2)}%</h1>
                </div>

                <div className="executive-card">
                    <h4>Average Response</h4>
                    <h1>{analytics.average_response_time} ms</h1>
                </div>

                <div className="executive-card">
                    <h4>API Health</h4>
                    <h1>{health}</h1>
                </div>

            </div>

            <div className="executive-summary">

                <div className="summary-card">
                    <h3>🏆 Executive Summary</h3>

                    <p>
                        • Total API Requests:
                        <strong> {analytics.total_requests.toLocaleString()}</strong>
                    </p>

                    <p>
                        • Success Rate:
                        <strong> {successRate.toFixed(2)}%</strong>
                    </p>

                    <p>
                        • Average Response Time:
                        <strong> {analytics.average_response_time} ms</strong>
                    </p>

                    <p>
                        • Failed Requests:
                        <strong> {analytics.failed_requests.toLocaleString()}</strong>
                    </p>
                </div>

                <div className="summary-card">
                    <h3>🎯 Top Endpoint</h3>

                    <h2>
                        {analytics.top_endpoint || "N/A"}
                    </h2>

                    <p>
                        Most frequently accessed endpoint during the monitoring period.
                    </p>
                </div>

                <div className="summary-card">
                    <h3>🤖 AI Recommendation</h3>

                    <p>
                        {analytics.recommendation ||
                            "System is healthy. Continue monitoring API traffic."}
                    </p>
                </div>

            </div>

        </div>
    );
}

export default ExecutiveDashboard;