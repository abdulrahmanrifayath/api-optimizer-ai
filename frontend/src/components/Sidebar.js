import { Link, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaServer,
  FaList,
  FaRobot,
  FaBriefcase,
  FaBell,
  FaCog
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();

  const isLinkActive = (path) => location.pathname === path;

  const itemStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "6px",
    color: isLinkActive(path) ? "#2563eb" : "#374151",
    backgroundColor: isLinkActive(path) ? "#eff6ff" : "transparent",
    fontWeight: isLinkActive(path) ? "bold" : "normal",
    textDecoration: "none",
    fontSize: "14px",
  });

  return (
    <aside className="sidebar" style={{ width: "220px", padding: "20px", borderRight: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
      <h2 style={{ fontSize: "14px", color: "#9ca3af", textTransform: "uppercase", marginBottom: "15px" }}>Navigation</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        <li>
          <Link to="/dashboard" style={itemStyle("/dashboard")}>
            <FaChartBar />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/executive-dashboard" style={itemStyle("/executive-dashboard")}>
            <FaBriefcase />
            <span>Executive Board</span>
          </Link>
        </li>
        <li>
          <Link to="/connected-apis" style={itemStyle("/connected-apis")}>
            <FaServer />
            <span>Connected APIs</span>
          </Link>
        </li>
        <li>
          <Link to="/logs" style={itemStyle("/logs")}>
            <FaList />
            <span>Log Explorer</span>
          </Link>
        </li>
        <li>
          <Link to="/dashboard" style={itemStyle("/ai-insights")}>
            <FaRobot />
            <span>AI Insights</span>
          </Link>
        </li>
        <li>
          <Link to="/dashboard" style={itemStyle("/alerts")}>
            <FaBell />
            <span>Alerts</span>
          </Link>
        </li>
        <li>
          <Link to="/dashboard" style={itemStyle("/settings")}>
            <FaCog />
            <span>Settings</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;