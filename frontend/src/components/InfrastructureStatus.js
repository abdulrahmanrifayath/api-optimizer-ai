

function StatusItem({ name, status, color }) {
    return (
        <div className="status-item">
            <div className="status-left">
                <span
                    className="status-dot"
                    style={{ background: color }}
                ></span>

                <span>{name}</span>
            </div>

            <span
                className="status-badge"
                style={{ color }}
            >
                {status}
            </span>
        </div>
    );
}

function InfrastructureStatus() {
    return (
        <div className="infra-card">

            <h2>Infrastructure Status</h2>

            <StatusItem
                name="Backend API"
                status="ONLINE"
                color="#22c55e"
            />

            <StatusItem
                name="MySQL Database"
                status="CONNECTED"
                color="#22c55e"
            />

            <StatusItem
                name="AI Engine"
                status="RUNNING"
                color="#22c55e"
            />

            <StatusItem
                name="WebSocket"
                status="CONNECTED"
                color="#22c55e"
            />

        </div>
    );
}

export default InfrastructureStatus;