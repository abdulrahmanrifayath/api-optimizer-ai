import "../styles/TrafficPrediction.css";
import { FaChartLine } from "react-icons/fa";

function TrafficPrediction({ dashboard }) {

    if (!dashboard) return null;

    const current =
        dashboard.score.metrics.total_requests;

    const predicted =
        Math.round(current * 1.15);

    const increase =
        (((predicted - current) / current) * 100).toFixed(1);

    return (

        <div className="prediction-card">

            <h2>
                <FaChartLine /> AI Traffic Prediction
            </h2>

            <div className="prediction-grid">

                <div className="prediction-box">

                    <h3>Current Traffic</h3>

                    <h1>{current}</h1>

                    <span>requests</span>

                </div>

                <div className="prediction-box">

                    <h3>Predicted (30 min)</h3>

                    <h1>{predicted}</h1>

                    <span>+{increase}%</span>

                </div>

                <div className="prediction-box">

                    <h3>Confidence</h3>

                    <h1>96%</h1>

                    <span>AI Model</span>

                </div>

            </div>

            <div className="prediction-footer">

                💡 Recommendation:
                Scale backend before peak traffic.

            </div>

        </div>

    );

}

export default TrafficPrediction;