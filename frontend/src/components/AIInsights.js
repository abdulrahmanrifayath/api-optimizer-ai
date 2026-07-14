function AIInsights({ dashboard }) {

    return (
        <div className="ai-panel">

            <h2>🤖 AI Optimization Suggestions</h2>

            <div className="suggestion">

                <h4>Performance</h4>

                <p>
                    Average response time is
                    <strong> {dashboard.score.metrics.avg_response_time}s</strong>.
                    API performance is healthy.
                </p>

            </div>

            <div className="suggestion">

                <h4>Traffic</h4>

                <p>
                    Most requested endpoint:
                    <strong> {dashboard.score.metrics.most_used_endpoint}</strong>
                </p>

            </div>

            <div className="suggestion">

                <h4>Recommendation</h4>

                <p>
                    No optimization required.
                    Continue monitoring API traffic.
                </p>

            </div>

        </div>
    );

}

export default AIInsights;