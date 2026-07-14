function HealthStatus({ errorRate }) {

    let status = "Healthy";
    let color = "#16a34a";
    let emoji = "🟢";

    if (errorRate > 5) {
        status = "Critical";
        color = "#dc2626";
        emoji = "🔴";
    }
    else if (errorRate > 0) {
        status = "Warning";
        color = "#f59e0b";
        emoji = "🟡";
    }

    return (

        <div
            className="metric-card"
            style={{
                borderTop: `5px solid ${color}`
            }}
        >

            <div className="metric-icon">

                {emoji}

            </div>

            <div>

                <h4>API Health</h4>

                <h2 style={{ color }}>

                    {status}

                </h2>

            </div>

        </div>

    );

}

export default HealthStatus;