import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";

import API from "../services/api";
import "../styles/HistoryDashboard.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

function HistoryDashboard() {
    const [history, setHistory] = useState([]);
    const [analysis, setAnalysis] = useState(null);

    useEffect(() => {
        loadHistory();
        const interval = setInterval(loadHistory, 10000);
        return () => clearInterval(interval);
    }, []);

    async function loadHistory() {
        try {
            const res = await API.get("/ai/history");
            setHistory(res.data.history || []);
            setAnalysis(res.data.ai_analysis || null);
        } catch (err) {
            console.error(err);
        }
    }

    const historyData = Array.isArray(history) && history.length > 0 ? history : [
        { date: "Mon", requests: 120, response_time: 45, error_rate: 0.1 },
        { date: "Tue", requests: 250, response_time: 42, error_rate: 0.0 },
        { date: "Wed", requests: 310, response_time: 48, error_rate: 0.2 },
        { date: "Thu", requests: 400, response_time: 40, error_rate: 0.1 },
        { date: "Fri", requests: 520, response_time: 44, error_rate: 0.0 }
    ];

    const labels = historyData.map(day => day.date);

    return (
        <div className="history-card">
            <h2>📈 API History & Trends</h2>

            {/* Requests */}
            <div className="chart-section">
                <h3>Requests</h3>
                <Line
                    data={{
                        labels,
                        datasets: [
                            {
                                label: "Requests",
                                data: historyData.map(d => d.requests),
                                borderWidth: 3,
                            },
                        ],
                    }}
                />
            </div>

            {/* Response Time */}
            <div className="chart-section">
                <h3>Response Time (ms)</h3>
                <Line
                    data={{
                        labels,
                        datasets: [
                            {
                                label: "Response Time",
                                data: historyData.map(d => d.response_time),
                                borderWidth: 3,
                            },
                        ],
                    }}
                />
            </div>

            {/* Error Rate */}
            <div className="chart-section">
                <h3>Error Rate (%)</h3>
                <Line
                    data={{
                        labels,
                        datasets: [
                            {
                                label: "Error Rate",
                                data: historyData.map(d => d.error_rate),
                                borderWidth: 3,
                            },
                        ],
                    }}
                />
            </div>

            {/* Health Score */}
            <div className="chart-section">
                <h3>API Health Score</h3>
                <Line
                    data={{
                        labels,
                        datasets: [
                            {
                                label: "Health Score",
                                data: historyData.map((d) => {
                                    let score = 100;
                                    score -= (d.error_rate || 0) * 5;
                                    score -= (d.response_time || 0) / 20;
                                    return Math.max(Math.round(score), 0);
                                }),
                                borderWidth: 3,
                            },
                        ],
                    }}
                />
            </div>

            {/* AI Analysis */}
            {analysis && (
                <div className="ai-analysis-card">
                    <h2>🧠 AI Trend Analysis</h2>
                    <div className="analysis-box">
                        <h4>Summary</h4>
                        <p>{analysis.summary}</p>
                    </div>
                    <div className="analysis-box">
                        <h4>AI Conclusion</h4>
                        <p>{analysis.conclusion}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HistoryDashboard;