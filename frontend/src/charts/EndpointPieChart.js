import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#06b6d4",
  "#ec4899"
];

function EndpointPieChart({ dashboard }) {
  const topEndpoints = dashboard?.traffic?.top_endpoints || [
    ["/api/v1/users", 45],
    ["/api/v1/auth/login", 30],
    ["/connected-apis", 25]
  ];

  const data = topEndpoints.map((item) => ({
    name: Array.isArray(item) ? item[0] : item.name || "Endpoint",
    value: Array.isArray(item) ? item[1] : item.value || 1
  }));

  return (
    <div className="chart-card">
      <h3>🥧 Endpoint Usage</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EndpointPieChart;