import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
    getExecutiveKpis,
    getExecutiveSummary,
    getBenchmarkComparison,
    getCostOptimization,
    downloadExecutivePdfReport
} from "../services/reportService";
import {
    FaFilePdf,
    FaTrophy,
    FaDollarSign,
    FaCheckCircle,
    FaClock,
    FaServer,
    FaBriefcase,
    FaChartLine
} from "react-icons/fa";
import "../styles/ExecutiveDashboard.css";
import "../styles/dashboard.css";

function ExecutiveDashboardPage({ darkMode, setDarkMode }) {
    const [kpis, setKpis] = useState(null);
    const [summary, setSummary] = useState(null);
    const [benchmark, setBenchmark] = useState([]);
    const [costData, setCostData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadExecutiveData = async () => {
        setLoading(true);
        try {
            const [kpiRes, summaryRes, benchmarkRes, costRes] = await Promise.all([
                getExecutiveKpis().catch(() => null),
                getExecutiveSummary().catch(() => null),
                getBenchmarkComparison().catch(() => []),
                getCostOptimization().catch(() => null),
            ]);

            if (kpiRes) setKpis(kpiRes);
            if (summaryRes) setSummary(summaryRes);
            if (benchmarkRes) setBenchmark(benchmarkRes);
            if (costRes) setCostData(costRes);
        } catch (err) {
            console.error("Failed to load executive board data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExecutiveData();
    }, []);

    const handleDownloadPdf = async () => {
        try {
            await downloadExecutivePdfReport();
        } catch (err) {
            alert("Failed to generate PDF report.");
        }
    };

    return (
        <div className={`dashboard ${darkMode ? "dark" : ""}`}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            <div className="dashboard-body">
                <Sidebar />

                <main className="content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <h1 style={{ color: "var(--text-heading)" }}><FaBriefcase style={{ color: "#a855f7", marginRight: "10px" }} /> Executive Dashboard & Business Intelligence</h1>
                            <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                                Business-friendly insights, SLA compliance, cost optimization, and benchmark comparisons.
                            </p>
                        </div>

                        <button onClick={handleDownloadPdf} style={btnPdfStyle}>
                            <FaFilePdf style={{ marginRight: "8px" }} /> Download Executive PDF Report
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading Executive Board...</div>
                    ) : (
                        <>
                            {/* KPI Stat Cards */}
                            {kpis && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}>AI Telemetry Score</div>
                                        <div style={{ ...cardValueStyle, color: "#a855f7" }}>{kpis.ai_score} ({kpis.ai_grade})</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}><FaCheckCircle style={{ color: "#10b981", marginRight: "4px" }} /> System Availability</div>
                                        <div style={{ ...cardValueStyle, color: "#10b981" }}>{kpis.system_availability_percentage}%</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}><FaClock style={{ color: "#38bdf8", marginRight: "4px" }} /> Avg Latency</div>
                                        <div style={cardValueStyle}>{kpis.avg_response_time_ms} ms</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}><FaServer style={{ color: "#6366f1", marginRight: "4px" }} /> Total Monthly Volume</div>
                                        <div style={cardValueStyle}>{(kpis.total_requests_monthly / 1000000).toFixed(2)}M reqs</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={cardTitleStyle}><FaDollarSign style={{ color: "#10b981", marginRight: "4px" }} /> Est. Cost Savings</div>
                                        <div style={{ ...cardValueStyle, color: "#10b981" }}>${kpis.estimated_monthly_savings_usd}/mo</div>
                                    </div>
                                </div>
                            )}

                            {/* Executive Summary Card */}
                            {summary && (
                                <div className="chart-card" style={{ marginBottom: "28px" }}>
                                    <h3 style={{ margin: "0 0 12px 0", color: "var(--text-heading)" }}>Executive Summary (Last 7 Days)</h3>
                                    <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-main)", marginBottom: "16px" }}>
                                        {summary.summary_text}
                                    </p>
                                    <h4 style={{ fontSize: "14px", color: "var(--text-heading)", marginBottom: "10px" }}>Period Highlights:</h4>
                                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {summary.highlights.map((h, i) => (
                                            <li key={i} style={{ fontSize: "13px", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ color: "#10b981" }}>✅</span> {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Industry Benchmark Leaderboard Table */}
                            <div className="chart-card" style={{ marginBottom: "28px" }}>
                                <h3 style={{ margin: "0 0 8px 0", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <FaTrophy style={{ color: "#f59e0b" }} /> Industry API Benchmark Comparison & Leaderboard
                                </h3>
                                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
                                    Ranking your connected APIs against top global industry standards (GitHub, Stripe, OpenAI, Weather).
                                </p>
                                <table className="activity-table">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>API Name</th>
                                            <th>Base URL</th>
                                            <th>Avg Latency</th>
                                            <th>Error Rate</th>
                                            <th>Availability</th>
                                            <th>AI Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {benchmark.map((item) => (
                                            <tr key={item.rank}>
                                                <td>
                                                    <span style={rankBadgeStyle(item.rank)}>
                                                        Rank #{item.rank}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: "bold", color: "var(--text-heading)" }}>{item.name}</td>
                                                <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.base_url}</td>
                                                <td>{item.avg_latency_ms} ms</td>
                                                <td><span style={{ color: item.error_rate_pct > 2 ? "#ef4444" : "#10b981", fontWeight: "bold" }}>{item.error_rate_pct}%</span></td>
                                                <td>{item.availability_pct}%</td>
                                                <td>
                                                    <span style={{ fontWeight: "bold", color: "#a855f7" }}>{item.ai_score}/100</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cost Optimization Calculator */}
                            {costData && (
                                <div className="chart-card">
                                    <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "10px" }}>
                                        <FaDollarSign style={{ color: "#10b981" }} /> Cost Optimization & Infrastructure Savings
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                                        <div style={costCardStyle}>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Current Monthly Cost</div>
                                            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#ef4444" }}>${costData.current_monthly_cost_usd}/mo</div>
                                        </div>
                                        <div style={costCardStyle}>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>After Optimization</div>
                                            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#10b981" }}>${costData.after_optimization_cost_usd}/mo</div>
                                        </div>
                                        <div style={costCardStyle}>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Monthly Savings</div>
                                            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#a855f7" }}>${costData.monthly_savings_usd}/mo ({costData.savings_percentage}%)</div>
                                        </div>
                                    </div>
                                    <h4 style={{ fontSize: "14px", color: "var(--text-heading)", marginBottom: "10px" }}>Cost Breakdown & Optimization Drivers:</h4>
                                    <table className="activity-table">
                                        <thead>
                                            <tr>
                                                <th>Cost Component</th><th>Current Cost</th><th>Post-Optimization Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {costData.cost_breakdown.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td><strong style={{ color: "var(--text-heading)" }}>{item.item}</strong></td>
                                                    <td style={{ color: "#ef4444" }}>{item.current}</td>
                                                    <td style={{ color: "#10b981", fontWeight: "bold" }}>{item.optimized}</td>
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

const cardStyle = { backgroundColor: "var(--bg-card)", padding: "18px", borderRadius: "16px", border: "1px solid var(--border-card)", boxShadow: "var(--shadow-card)", backdropFilter: "blur(16px)" };
const cardTitleStyle = { fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold", display: "flex", alignItems: "center" };
const cardValueStyle = { fontSize: "24px", fontWeight: "800", marginTop: "6px", color: "var(--text-main)" };
const costCardStyle = { backgroundColor: "var(--table-row-bg)", padding: "16px", borderRadius: "14px", border: "1px solid var(--border-card)" };
const btnPdfStyle = { padding: "10px 20px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", display: "inline-flex", alignItems: "center", boxShadow: "0 6px 20px rgba(239,68,68,0.3)" };
const rankBadgeStyle = (rank) => ({
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: rank === 1 ? "rgba(245,158,11,0.2)" : rank === 2 ? "rgba(168,85,247,0.2)" : "rgba(99,102,241,0.2)",
    color: rank === 1 ? "#f59e0b" : rank === 2 ? "#c084fc" : "#818cf8",
});

export default ExecutiveDashboardPage;
