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

  return (
    <aside className="sidebar">
      <h2 style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px", paddingLeft: "12px" }}>
        Navigation
      </h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        <li>
          <Link to="/dashboard" className={`sidebar-link ${isLinkActive("/dashboard") ? "active" : ""}`}>
            <FaChartBar />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/executive-dashboard" className={`sidebar-link ${isLinkActive("/executive-dashboard") ? "active" : ""}`}>
            <FaBriefcase />
            <span>Executive Board</span>
          </Link>
        </li>
        <li>
          <Link to="/connected-apis" className={`sidebar-link ${isLinkActive("/connected-apis") ? "active" : ""}`}>
            <FaServer />
            <span>Connected APIs</span>
          </Link>
        </li>
        <li>
          <Link to="/logs" className={`sidebar-link ${isLinkActive("/logs") ? "active" : ""}`}>
            <FaList />
            <span>Log Explorer</span>
          </Link>
        </li>
        <li>
          <Link to="/ai-insights" className={`sidebar-link ${isLinkActive("/ai-insights") ? "active" : ""}`}>
            <FaRobot />
            <span>AI Insights</span>
          </Link>
        </li>
        <li>
          <Link to="/alerts" className={`sidebar-link ${isLinkActive("/alerts") ? "active" : ""}`}>
            <FaBell />
            <span>Alerts</span>
          </Link>
        </li>
        <li>
          <Link to="/settings" className={`sidebar-link ${isLinkActive("/settings") ? "active" : ""}`}>
            <FaCog />
            <span>Settings</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;