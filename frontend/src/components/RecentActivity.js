function RecentActivity({ dashboard }) {

    const rows = dashboard.traffic.top_endpoints.map((item, index) => ({
        endpoint: item[0],
        requests: item[1]
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