import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/BenchmarkDashboard.css";

function BenchmarkDashboard() {
    const [benchmark, setBenchmark] = useState(null);

    useEffect(() => {
        loadBenchmark();

        const interval = setInterval(loadBenchmark, 10000);

        return () => clearInterval(interval);
    }, []);

    async function loadBenchmark() {
        try {
            const res = await API.get("/ai/benchmark");
            setBenchmark(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    if (!benchmark) {
        return (
            <div className="benchmark-dashboard">
                Loading Benchmark Dashboard...
            </div>
        );
    }

    return (
        <div className="benchmark-dashboard">

            <h2>📊 Performance Benchmark</h2>

            <div className="benchmark-grid">

                <div className="benchmark-card">
                    <h3>Today's Requests</h3>
                    <h1>{benchmark.today.requests}</h1>
                    <p>{benchmark.comparison.requests_change}</p>
                </div>

                <div className="benchmark-card">
                    <h3>Response Time</h3>
                    <h1>{benchmark.today.response_time} ms</h1>
                    <p>{benchmark.comparison.response_time_change}</p>
                </div>

                <div className="benchmark-card">
                    <h3>Success Rate</h3>
                    <h1>{benchmark.today.success_rate}%</h1>
                    <p>{benchmark.comparison.success_rate_change}</p>
                </div>

            </div>

            <div className="benchmark-comparison">

                <div className="comparison-column">

                    <h3>📅 Today</h3>

                    <p><strong>Requests:</strong> {benchmark.today.requests}</p>

                    <p><strong>Response:</strong> {benchmark.today.response_time} ms</p>

                    <p><strong>Success:</strong> {benchmark.today.success_rate}%</p>

                </div>

                <div className="comparison-column">

                    <h3>📅 Yesterday</h3>

                    <p><strong>Requests:</strong> {benchmark.yesterday.requests}</p>

                    <p><strong>Response:</strong> {benchmark.yesterday.response_time} ms</p>

                    <p><strong>Success:</strong> {benchmark.yesterday.success_rate}%</p>

                </div>

            </div>

        </div>
    );
}

export default BenchmarkDashboard;