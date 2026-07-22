import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const ERROR_COLORS = [
  "#10b981", // Cyber Emerald Success
  "#ef4444"  // Cyber Neon Red Error
];

function ErrorPieChart({ dashboard }) {
  const errorRate = dashboard?.score?.metrics?.error_rate || 0.0;

  const data = [
    {
      name: "Success",
      value: Number((100 - errorRate).toFixed(1))
    },
    {
      name: "Errors",
      value: Number(errorRate.toFixed(1))
    }
  ];

  return (
    <div className="chart-card">
      <h3>🚨 Error Rate vs Success Rate</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={100}
            innerRadius={45}
            paddingAngle={4}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={ERROR_COLORS[index]}
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

export default ErrorPieChart;