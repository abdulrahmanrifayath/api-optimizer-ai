import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function ResponseTimeChart({ dashboard }) {

  const avg = dashboard.score.metrics.avg_response_time;

  const data = [
    {
      api: dashboard.score.metrics.most_used_endpoint,
      ms: Number((avg * 1000).toFixed(2))
    }
  ];

  return (
    <div className="chart-card">
      <h3>⚡ Response Time</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="api" />
          <YAxis />
          <Tooltip />

          <Bar
            dataKey="ms"
            fill="#16a34a"
          />

        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}

export default ResponseTimeChart;