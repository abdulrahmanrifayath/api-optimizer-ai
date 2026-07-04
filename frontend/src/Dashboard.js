import React, { useEffect, useState } from "react";
import API from "./api";

function Dashboard() {
  const [data, setData] = useState(null);
  const [useRealtime, setUseRealtime] = useState(true);

  // =========================
  // INITIAL LOAD (REST API fallback)
  // =========================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get("/ai/dashboard");
      setData(res.data);
    } catch (err) {
      console.log("API fallback error:", err);
    }
  };

  // =========================
  // REAL-TIME WEBSOCKET MODE
  // =========================
  useEffect(() => {
    if (!useRealtime) return;

    const ws = new WebSocket("ws://127.0.0.1:8000/ws/dashboard");

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch (err) {
        console.log("WebSocket parse error:", err);
      }
    };

    ws.onerror = () => {
      console.log("WebSocket error, switching to REST mode");
      setUseRealtime(false);
    };

    return () => ws.close();
  }, [useRealtime]);

  // =========================
  // LOADING STATE
  // =========================
  if (!data) return <h2>Loading AI Dashboard...</h2>;

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🚀 API Dashboard</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>Score: {data.score?.score}</h2>
        <h3>Grade: {data.score?.grade}</h3>
      </div>

      {/* Optional: metrics */}
      {data.score?.metrics && (
        <div>
          <h4>📊 Metrics</h4>
          <p>Total Requests: {data.score.metrics.total_requests}</p>
          <p>Error Rate: {data.score.metrics.error_rate}%</p>
          <p>Avg Response Time: {data.score.metrics.avg_response_time}s</p>
          <p>Top Endpoint: {data.score.metrics.most_used_endpoint}</p>
        </div>
      )}

      {/* Alerts */}
      {data.alerts && (
        <div>
          <h4>⚠️ Alerts</h4>
          <pre>{JSON.stringify(data.alerts, null, 2)}</pre>
        </div>
      )}

      {/* Traffic */}
      {data.traffic && (
        <div>
          <h4>📡 Traffic Insights</h4>
          <pre>{JSON.stringify(data.traffic, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Dashboard;