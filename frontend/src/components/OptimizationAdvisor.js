import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/OptimizationAdvisor.css";

function OptimizationAdvisor() {

    const [advisor, setAdvisor] = useState(null);

    useEffect(() => {

        loadAdvisor();

        const interval = setInterval(loadAdvisor, 10000);

        return () => clearInterval(interval);

    }, []);

    async function loadAdvisor() {

        try {

            const res = await API.get("/ai/optimization-advisor");

            setAdvisor(res.data);

        } catch (err) {

            console.error(err);

        }

    }

    if (!advisor) {

        return (
            <div className="advisor-card">
                Loading AI Recommendations...
            </div>
        );

    }

    return (

        <div className="advisor-card">

            <h2>🤖 AI Optimization Advisor</h2>

            <div className="advisor-summary">

                <div>

                    <h4>Health Score</h4>

                    <h1>{advisor.health_score}/100</h1>

                </div>

                <div>

                    <h4>Priority</h4>

                    <span
                        className={`priority ${advisor.priority.toLowerCase()}`}
                    >
                        {advisor.priority}
                    </span>

                </div>

            </div>

            <div className="recommendations">

                {advisor.recommendations.map((item, index) => (

                    <div
                        key={index}
                        className="recommendation"
                    >

                        <h3>{item.title}</h3>

                        <p>
                            <strong>Reason</strong>
                            <br />
                            {item.reason}
                        </p>

                        <div className="advisor-grid">

                            <div>

                                <strong>🎯 Confidence</strong>

                                <br />

                                {item.confidence}%

                            </div>

                            <div>

                                <strong>📈 Expected Improvement</strong>

                                <br />

                                {item.expected_improvement}

                            </div>

                        </div>

                        {item.explanation && (

                            <div className="ai-explanation">

                                <h4>🧠 AI Decision Explanation</h4>

                                <div className="explanation-grid">

                                    <div>

                                        <strong>Model</strong>

                                        <p>{item.explanation.model}</p>

                                    </div>

                                    <div>

                                        <strong>Decision Score</strong>

                                        <p>{item.explanation.decision_score}/100</p>

                                    </div>

                                    <div>

                                        <strong>Trigger Metric</strong>

                                        <p>{item.explanation.metric}</p>

                                    </div>

                                    <div>

                                        <strong>Current Value</strong>

                                        <p>{item.explanation.current_value}</p>

                                    </div>

                                    <div>

                                        <strong>Threshold</strong>

                                        <p>{item.explanation.threshold}</p>

                                    </div>

                                </div>

                                <div className="analysis-box">

                                    <strong>Analysis</strong>

                                    <p>{item.explanation.analysis}</p>

                                </div>

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </div>

    );

}

export default OptimizationAdvisor;