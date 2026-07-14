import "../styles/EndpointLeaderboard.css";

function EndpointLeaderboard({ dashboard }) {

    if (!dashboard) return null;

    const endpoints = dashboard.traffic.top_endpoints;

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

                                <td>{item[0]}</td>

                                <td>{item[1]}</td>

                                <td>

                                    <span className="healthy">
                                        Healthy
                                    </span>

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