import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/ExecutiveDashboard.css";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

function ExecutiveDashboard() {

    const [analytics, setAnalytics] = useState(null);
    const [summary, setSummary] = useState(null);
    const [benchmark, setBenchmark] = useState(null);
    const [report, setReport] =useState(null);
    const [trendData, setTrendData] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState("");

    useEffect(() => {

        loadAnalytics();

        const interval = setInterval(() => {
            loadAnalytics();
        }, 10000);

        return () => clearInterval(interval);

    }, []);

    async function loadAnalytics() {

        try {

            const [
                analyticsRes,
                summaryRes,
                benchmarkRes,
                reportRes,
                trendRes,
                insightsRes
            ] = await Promise.all([

                API.get("/ai/analytics"),
                API.get("/ai/executive-summary"),
                API.get("/ai/benchmark"),
                API.get("/ai/executive-report"),
                API.get("/ai/trend-data"),
                API.get("/ai/executive-insights")

            ]);

            setAnalytics(analyticsRes.data);
            setSummary(summaryRes.data);
            setBenchmark(benchmarkRes.data);
            setReport(reportRes.data);
            setTrendData(trendRes.data || []);
            setInsights(insightsRes.data?.insights || []);
            setLastUpdated(new Date().toLocaleTimeString());

        } catch (err) {

            console.error("Executive Dashboard Error:", err);

        } finally {

            setLoading(false);

        }
    }

    if (
        loading ||
        !analytics ||
        !summary ||
        !benchmark ||
        !report
    ) {

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
                    Last Updated : {lastUpdated}
                </p>

            </div>

            <div className="executive-grid">

                <div className="executive-card">
                    <h4>Total Requests</h4>
                    <h1>{(analytics.total_requests || 0).toLocaleString()}</h1>
                </div>

                <div className="executive-card">
                    <h4>Successful Requests</h4>
                    <h1>{(analytics.successful_requests || 0).toLocaleString()}</h1>
                </div>

                <div className="executive-card">
                    <h4>Failed Requests</h4>
                    <h1>{(analytics.failed_requests || 0).toLocaleString()}</h1>
                </div>

                <div className="executive-card">
                    <h4>Success Rate</h4>
                    <h1>{successRate.toFixed(2)}%</h1>
                </div>

                <div className="executive-card">
                    <h4>Average Response</h4>
                    <h1>{analytics.average_response_time || 0} ms</h1>
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
                        • Total API Requests :
                        <strong> {(analytics.total_requests || 0).toLocaleString()}</strong>
                    </p>

                    <p>
                        • Success Rate :
                        <strong> {successRate.toFixed(2)}%</strong>
                    </p>

                    <p>
                        • Average Response Time :
                        <strong> {analytics.average_response_time || 0} ms</strong>
                    </p>

                    <p>
                        • Failed Requests :
                        <strong> {(analytics.failed_requests || 0).toLocaleString()}</strong>
                    </p>

                </div>

                <div className="summary-card">

                    <h3>🎯 Top Endpoint</h3>

                    <h2>{analytics.top_endpoint || "N/A"}</h2>

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

            <div className="executive-intelligence">

                <div className="summary-card">

                    <h3>📋 Executive Summary</h3>

                    <p>{summary.summary}</p>

                </div>

                <div className="summary-card">

                    <h3>🏆 Benchmark</h3>

                    <h2>{benchmark.rank}</h2>

                    <p>{benchmark.message}</p>

                </div>

                <div className="summary-card">

                    <h3>🤖 AI Business Report</h3>

                    <p>{report.report}</p>

                </div>

            </div>

            <div className="trend-section">

                <h2>📈 API Performance Trends</h2>

                {trendData.length > 0 ? (

                    <ResponsiveContainer width="100%" height={430}>

                        <AreaChart data={trendData}>

                            <defs>

                                <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0} />
                                </linearGradient>

                                <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
                                </linearGradient>

                            </defs>

                            <CartesianGrid strokeDasharray="4 4" />

                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />

                            <Area
                                type="monotone"
                                dataKey="requests"
                                stroke="#1976d2"
                                fill="url(#colorReq)"
                                strokeWidth={3}
                            />

                            <Line
                                type="monotone"
                                dataKey="success_rate"
                                stroke="#4CAF50"
                                strokeWidth={3}
                                dot={false}
                            />

                            <Area
                                type="monotone"
                                dataKey="response_time"
                                stroke="#FF9800"
                                fill="url(#colorResp)"
                                strokeWidth={3}
                            />

                        </AreaChart>

                    </ResponsiveContainer>

                ) : (

                    <p>No trend data available.</p>

                )}

            </div>

            <div className="executive-insights">

                <h2>🧠 AI Executive Insights</h2>

                <div className="insight-grid">

                    {insights.length > 0 ? (

                        insights.map((item, index) => (

                            <div className="insight-card" key={index}>

                                <h3>{item.title}</h3>

                                <span className={`status ${item.status.toLowerCase()}`}>
                                    {item.status}
                                </span>

                                <p>{item.message}</p>

                            </div>

                        ))

                    ) : (

                        <p>No AI insights available.</p>

                    )}

                </div>

            </div>

        </div>

    );
}

export default ExecutiveDashboard;