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

    if (!report) {
        return (
            <div className="executive-report">
                Loading AI Executive Report...
            </div>
        );
    }

    return (
        <div className="executive-report">

            <h2>🧠 AI Executive Report</h2>

            <div className="report-section">

                <h3>📊 Overall System Health</h3>

                <div className={`health ${report.overall_health.toLowerCase()}`}>
                    {report.overall_health}
                </div>

            </div>

            <div className="report-section">

                <h3>📋 Executive Summary</h3>

                <ul>
                    {report.summary.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>

            </div>

            <div className="report-section">

                <h3>💼 Business Impact</h3>

                <ul>
                    {report.business_impact.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>

            </div>

            <div className="report-section">

                <h3>🤖 AI Recommendations</h3>

                <ul>
                    {report.recommendations.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>

            </div>

        </div>
    );
}

export default ExecutiveReport;