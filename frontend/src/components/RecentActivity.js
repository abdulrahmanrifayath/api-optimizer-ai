function RecentActivity({ dashboard }) {
    const topEndpoints = dashboard?.traffic?.top_endpoints || [
        ["/api/v1/users", 45],
        ["/api/v1/auth/login", 30],
        ["/connected-apis", 25]
    ];

    const rows = topEndpoints.map((item, index) => ({
        endpoint: Array.isArray(item) ? item[0] : item.endpoint || "Endpoint",
        requests: Array.isArray(item) ? item[1] : item.requests || 0
    }));

    return (
        <div className="activity-panel">
            <h2>📋 Recent API Activity</h2>

            <table className="activity-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Endpoint</th>
                        <th>Requests</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{row.endpoint}</td>
                            <td>{row.requests}</td>
                            <td>
                                <span className="status success">
                                    Healthy
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RecentActivity;