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

                    <span className={`priority ${advisor.priority.toLowerCase()}`}>
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

            <div className="recommendation-header">

                <h3>{item.title}</h3>

                <span className={`impact-badge ${item.impact.toLowerCase()}`}>
                    {item.impact}
                </span>

            </div>

            <p>{item.reason}</p>

            <div className="recommendation-details">

                <div>

                    <strong>🎯 Confidence</strong>

                    <p>{item.confidence}%</p>

                </div>

                <div>

                    <strong>📈 Expected Improvement</strong>

                    <p>{item.expected_improvement}</p>

                </div>

            </div>

        </div>

    ))}

</div>

        </div>

    );

}

export default OptimizationAdvisor;