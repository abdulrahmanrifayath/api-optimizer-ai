import { useEffect, useState } from "react";
import "../styles/LiveRequestFeed.css";

function LiveRequestFeed({ dashboard }) {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const endpoint = dashboard?.score?.metrics?.most_used_endpoint || "/api/v1/users";

        const interval = setInterval(() => {
            const methods = ["GET", "POST", "PUT", "DELETE"];
            const statuses = [200, 200, 200, 201, 400, 404, 500];

            const newLog = {
                time: new Date().toLocaleTimeString(),
                endpoint,
                method: methods[Math.floor(Math.random() * methods.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)]
            };

            setLogs(prev => {
                const updated = [newLog, ...prev];
                return updated.slice(0, 10);
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [dashboard]);

    return (
        <div className="live-feed">
            <h2>📡 Live API Request Feed</h2>

            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Method</th>
                        <th>Endpoint</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {logs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.time}</td>
                            <td>{log.method}</td>
                            <td>{log.endpoint}</td>
                            <td>
                                <span className={log.status >= 400 ? "status-error" : "status-success"}>
                                    {log.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LiveRequestFeed;