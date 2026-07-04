import React, { useEffect, useState } from "react";
import API from "./api";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get("/ai/dashboard");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!data) return <h2>Loading AI Dashboard...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>API Dashboard</h1>
      <h2>Score: {data.score.score}</h2>
      <h3>Grade: {data.score.grade}</h3>
    </div>
  );
}

export default Dashboard;