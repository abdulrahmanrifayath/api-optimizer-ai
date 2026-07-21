import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
    getExecutiveKpis,
    getExecutiveSummary,
    getBenchmarkComparison,
    getCostOptimization,
    downloadExecutivePdfReport,
} from "../services/reportService";
import {
    FaFilePdf,
    FaRobot,
    FaCheckCircle,
    FaClock,
    FaDollarSign,
    FaTrophy,
    FaChartLine,
    FaServer,
    FaShieldAlt,
    FaLightbulb,
} from "react-icons/fa";
import "../styles/dashboard.css";

function ExecutiveDashboardPage({ darkMode, setDarkMode }) {
    const [kpis, setKpis] = useState(null);
    const [summary, setSummary] = useState(null);
    const [benchmarks, setBenchmarks] = useState([]);
    const [costData, setCostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState("weekly");

    const loadExecutiveData = async () => {
        setLoading(true);
        try {
            const [kpisRes, summaryRes, benchmarkRes, costRes] = await Promise.all([
                getExecutiveKpis().catch(() => null),
                getExecutiveSummary(reportType).catch(() => null),
                getBenchmarkComparison().catch(() => []),
                getCostOptimization().catch(() => null),
            ]);

            if (kpisRes) setKpis(kpisRes);
            if (summaryRes) setSummary(summaryRes);
            if (benchmarkRes) setBenchmarks(benchmarkRes);
            if (costRes) setCostData(costRes);
        } catch (err) {
            console.error("Failed to load Executive Dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExecutiveData();
    }, [reportType]);

    const handleDownloadPdf = async () => {
        try {
            await downloadExecutivePdfReport();
        } catch (err) {
            alert("Failed to download Executive PDF Report.");
        }
    };

    return (
        <div className={`dashboard ${darkMode ? "dark" : ""}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="dashboard-body">
                <Sidebar />
                <main className="content">
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" }}>
                        <div>
                            <h1>Executive Dashboard & Business Intelligence</h1>
                            <p style={{ color: "#6b7280", margin: "4px 0 0 0" }}>
                                Business-friendly insights, SLA compliance, cost optimization, and benchmark comparisons.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px", fontWeight: "bold" }}
                            >
                                <option value="weekly">Weekly Report</option>
                                <option value="monthly">Monthly Report</option>
                            </select>
                            <button onClick={handleDownloadPdf} style={btnPdfStyle}>
                                <FaFilePdf style={{ marginRight: "6px" }} /> Download Executive PDF Report
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ padding: "50px", textAlign: "center", color: "#6b7280" }}>Loading Executive Dashboard...</div>
                    ) : (
                        <>
                            {/* KPI Cards (Module 7 & Module 1) */}
                            {kpis && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px", marginBottom: "25px" }}>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}><FaRobot style={{ color: "#2563eb", marginRight: "6px" }} /> AI Telemetry Score</div>
                                        <div style={{ ...cardValueStyle, color: "#2563eb" }}>{kpis.overall_score} <span style={{ fontSize: "14px", color: "#6b7280" }}>({kpis.ai_rating})</span></div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}><FaCheckCircle style={{ color: "#16a34a", marginRight: "6px" }} /> System Availability</div>
                                        <div style={{ ...cardValueStyle, color: "#16a34a" }}>{kpis.availability_pct}%</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}><FaClock style={{ color: "#d97706", marginRight: "6px" }} /> Avg Latency</div>
                                        <div style={cardValueStyle}>{kpis.average_latency_ms} ms</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}><FaServer style={{ color: "#6366f1", marginRight: "6px" }} /> Total Monthly Volume</div>
                                        <div style={cardValueStyle}>{(kpis.monthly_requests / 1000000).toFixed(2)}M reqs</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}><FaDollarSign style={{ color: "#16a34a", marginRight: "6px" }} /> Est. Cost Savings</div>
                                        <div style={{ ...cardValueStyle, color: "#16a34a" }}>${kpis.monthly_cost_savings_usd}/mo</div>
                                    </div>
                                </div>
                            )}

                            {/* Plain English Business Summary (Module 2 & 3) */}
                            {summary && (
                                <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
                                    <h3 style={{ margin: "0 0 12px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <FaChartLine style={{ color: "#2563eb" }} /> Executive Summary ({summary.period})
                                    </h3>
                                    <p style={{ fontSize: "15px", color: "#334155", lineHeight: "1.6", marginBottom: "16px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "6px", borderLeft: "4px solid #2563eb" }}>
                                        {summary.plain_english_insights}
                                    </p>
                                    <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#475569" }}>Period Highlights:</h4>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                                        {summary.highlights.map((h, i) => (
                                            <div key={i} style={{ backgroundColor: "#f1f5f9", padding: "12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                                                ✅ {h}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Benchmark Comparison Leaderboard (Module 6) */}
                            <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
                                <h3 style={{ margin: "0 0 12px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <FaTrophy style={{ color: "#eab308" }} /> Industry API Benchmark Comparison & Leaderboard
                                </h3>
                                <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "16px" }}>
                                    Ranking your connected APIs against top global industry standards (GitHub, Stripe, OpenAI, Weather).
                                </p>
                                <table border="0" cellPadding="12" style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#f8fafc", textAlign: "left", fontSize: "12px", color: "#6b7280", textTransform: "uppercase" }}>
                                            <th>Rank</th><th>API Name</th><th>Base URL</th><th>Avg Latency</th><th>Error Rate</th><th>Availability</th><th>AI Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {benchmarks.map((b) => (
                                            <tr key={b.rank} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                                                <td><span style={rankBadgeStyle(b.rank)}>Rank #{b.rank}</span></td>
                                                <td><strong>{b.name}</strong></td>
                                                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "#2563eb" }}>{b.base_url}</td>
                                                <td style={{ fontWeight: "bold", color: b.latency < 100 ? "#16a34a" : "#d97706" }}>{b.latency} ms</td>
                                                <td>{b.error_rate}%</td>
                                                <td style={{ fontWeight: "bold", color: "#16a34a" }}>{b.availability}%</td>
                                                <td><span style={{ fontWeight: "bold", color: "#2563eb", padding: "2px 8px", backgroundColor: "#dbeafe", borderRadius: "10px" }}>{b.ai_score}/100</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cost Optimization Dashboard (Module 8) */}
                            {costData && (
                                <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "25px" }}>
                                    <h3 style={{ margin: "0 0 12px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <FaDollarSign style={{ color: "#16a34a" }} /> Cost Optimization & Infrastructure Savings
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                                        <div style={costCardStyle}>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>Current Monthly Cost</div>
                                            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#dc2626" }}>${costData.current_monthly_cost_usd}/mo</div>
                                        </div>
                                        <div style={costCardStyle}>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>After Optimization</div>
                                            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#16a34a" }}>${costData.after_optimization_cost_usd}/mo</div>
                                        </div>
                                        <div style={costCardStyle}>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>Monthly Savings</div>
                                            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#2563eb" }}>${costData.monthly_savings_usd}/mo ({costData.savings_percentage}%)</div>
                                        </div>
                                    </div>
                                    <h4 style={{ fontSize: "14px", color: "#475569", marginBottom: "10px" }}>Cost Breakdown & Optimization Drivers:</h4>
                                    <table border="0" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ backgroundColor: "#f8fafc", textAlign: "left", fontSize: "12px", color: "#6b7280" }}>
                                                <th>Cost Component</th><th>Current Cost</th><th>Post-Optimization Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {costData.cost_breakdown.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13px" }}>
                                                    <td><strong>{item.item}</strong></td>
                                                    <td style={{ color: "#dc2626" }}>{item.current}</td>
                                                    <td style={{ color: "#16a34a", fontWeight: "bold" }}>{item.optimized}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

const cardStyle = { backgroundColor: "#ffffff", padding: "18px", borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" };
const cardTitleStyle = { fontSize: "12px", color: "#6b7280", textTransform: "uppercase", fontWeight: "bold", display: "flex", alignItems: "center" };
const cardValueStyle = { fontSize: "24px", fontWeight: "bold", marginTop: "6px" };
const costCardStyle = { backgroundColor: "#f8fafc", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" };
const btnPdfStyle = { padding: "10px 18px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", display: "inline-flex", alignItems: "center" };
const rankBadgeStyle = (rank) => ({
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: rank === 1 ? "#fef3c7" : rank === 2 ? "#e2e8f0" : "#f1f5f9",
    color: rank === 1 ? "#b45309" : "#334155",
});

export default ExecutiveDashboardPage;
