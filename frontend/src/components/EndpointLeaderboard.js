import "../styles/EndpointLeaderboard.css";

function EndpointLeaderboard({ dashboard }) {
    const endpoints = dashboard?.traffic?.top_endpoints || [
        ["/api/v1/users", 45],
        ["/api/v1/auth/login", 30],
        ["/connected-apis", 25]
    ];

    return (
        <div className="leaderboard-card">
            <h2>🏆 API Performance Leaderboard</h2>

            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Endpoint</th>
                        <th>Requests</th>
                        <th>Status</th>
                        <th>Performance</th>
                    </tr>
                </thead>

                <tbody>
                    {endpoints.map((item, index) => {
                        const performance = Math.max(100 - index * 5, 75);
                        const endpointName = Array.isArray(item) ? item[0] : item.endpoint || item;
                        const requestCount = Array.isArray(item) ? item[1] : item.requests || 0;

                        return (
                            <tr key={index}>
                                <td>
                                    {index === 0
                                        ? "🥇"
                                        : index === 1
                                        ? "🥈"
                                        : index === 2
                                        ? "🥉"
                                        : index + 1}
                                </td>
                                <td>{endpointName}</td>
                                <td>{requestCount}</td>
                                <td>
                                    <span className="healthy">Healthy</span>
                                </td>
                                <td>
                                    <div className="progress">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${performance}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span>{performance}%</span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default EndpointLeaderboard;