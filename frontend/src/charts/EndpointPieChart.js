import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const CYBER_NEON_COLORS = [
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#818cf8",
  "#f472b6"
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
      <h3>🥧 Endpoint Traffic Distribution</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            innerRadius={45}
            paddingAngle={5}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CYBER_NEON_COLORS[index % CYBER_NEON_COLORS.length]}
                stroke="rgba(192, 132, 252, 0.3)"
                strokeWidth={2}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(18, 13, 36, 0.95)",
              borderColor: "rgba(192, 132, 252, 0.4)",
              borderRadius: "12px",
              color: "#f8fafc"
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EndpointPieChart;