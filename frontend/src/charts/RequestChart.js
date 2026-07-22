import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function RequestChart({ dashboard }) {
  const total = dashboard?.score?.metrics?.total_requests || 100;

  const data = [
    { day: "Mon", requests: Math.round(total * 0.20) },
    { day: "Tue", requests: Math.round(total * 0.35) },
    { day: "Wed", requests: Math.round(total * 0.45) },
    { day: "Thu", requests: Math.round(total * 0.60) },
    { day: "Fri", requests: Math.round(total * 0.75) },
    { day: "Sat", requests: Math.round(total * 0.90) },
    { day: "Today", requests: total }
  ];

  return (
    <div className="chart-card">
      <h3>📈 Request Trend Telemetry</h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cyberVioletGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(192, 132, 252, 0.15)" />
          <XAxis dataKey="day" stroke="var(--text-muted)" />
          <YAxis stroke="var(--text-muted)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(18, 13, 36, 0.95)",
              borderColor: "rgba(192, 132, 252, 0.4)",
              borderRadius: "12px",
              color: "#f8fafc"
            }}
          />
          <Area
            type="monotone"
            dataKey="requests"
            stroke="#c084fc"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#cyberVioletGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RequestChart;