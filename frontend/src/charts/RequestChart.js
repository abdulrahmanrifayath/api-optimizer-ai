import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function RequestChart({ dashboard }) {

  const total = dashboard.score.metrics.total_requests;

  const data = [
    { day: "Mon", requests: total * 0.20 },
    { day: "Tue", requests: total * 0.35 },
    { day: "Wed", requests: total * 0.45 },
    { day: "Thu", requests: total * 0.60 },
    { day: "Fri", requests: total * 0.75 },
    { day: "Sat", requests: total * 0.90 },
    { day: "Today", requests: total }
  ];

  return (
    <div className="chart-card">
      <h3>📈 Request Trend</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="day"/>
          <YAxis/>
          <Tooltip/>
          <Line
            type="monotone"
            dataKey="requests"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RequestChart;