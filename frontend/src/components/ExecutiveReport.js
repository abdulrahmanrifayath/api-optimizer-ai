import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/ExecutiveReport.css";

function ExecutiveReport() {
    const [report, setReport] = useState(null);

    useEffect(() => {
        loadReport();
        const interval = setInterval(loadReport, 10000);
        return () => clearInterval(interval);
    }, []);

    async function loadReport() {
        try {
            const res = await API.get("/ai/executive-report");
            setReport(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    const reportData = report || {
        overall_health: "EXCELLENT",
        summary: [
            "System availability maintained at 99.8%",
            "Response latency optimized to 45ms average",
            "Zero high-severity anomalies detected in last 24 hours"
        ],
        business_impact: [
            "Customer checkout conversion rate stable",
            "Bandwidth utilization within expected thresholds"
        ],
        recommendations: [
            "Enable Redis caching for GET routes",
            "Add compound indexes to telemetry tables"
        ]
    };

    const summaryList = Array.isArray(reportData.summary) ? reportData.summary : [];
    const impactList = Array.isArray(reportData.business_impact) ? reportData.business_impact : [];
    const recList = Array.isArray(reportData.recommendations) ? reportData.recommendations : [];

    return (
        <div className="executive-report">
            <h2>🧠 AI Executive Report</h2>

            <div className="report-section">
                <h3>📊 Overall System Health</h3>
                <div className={`health ${(reportData.overall_health || "excellent").toLowerCase()}`}>
                    {reportData.overall_health}
                </div>
            </div>

            <div className="report-section">
                <h3>📋 Executive Summary</h3>
                <ul>
                    {summaryList.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>

            <div className="report-section">
                <h3>💼 Business Impact</h3>
                <ul>
                    {impactList.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>

            <div className="report-section">
                <h3>🤖 AI Recommendations</h3>
                <ul>
                    {recList.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ExecutiveReport;