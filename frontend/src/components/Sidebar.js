import {
  FaChartBar,
  FaServer,
  FaRobot,
  FaBell,
  FaCog
} from "react-icons/fa";

function Sidebar() {
  return (
    <aside className="sidebar">

      <h2>Navigation</h2>

      <ul>

        <li>
          <FaChartBar />
          Dashboard
        </li>

        <li>
          <FaServer />
          API Metrics
        </li>

        <li>
          <FaRobot />
          AI Insights
        </li>

        <li>
          <FaBell />
          Alerts
        </li>

        <li>
          <FaCog />
          Settings
        </li>

      </ul>

    </aside>
  );
}

export default Sidebar;