import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = [
  "#16a34a",
  "#dc2626"
];

function ErrorPieChart({ dashboard }) {
  const errorRate = dashboard?.score?.metrics?.error_rate || 0.0;

  const data = [
    {
      name: "Success",
      value: 100 - errorRate
    },
    {
      name: "Errors",
      value: errorRate
    }
  ];

  return (
    <div className="chart-card">
      <h3>🚨 Error Distribution</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
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

export default ErrorPieChart;