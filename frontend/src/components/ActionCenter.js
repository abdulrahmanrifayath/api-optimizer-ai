import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/ActionCenter.css";

function ActionCenter() {

    const [actions, setActions] = useState([]);
    const [simulation, setSimulation] = useState(null);

    useEffect(() => {

        loadActions();

        const interval = setInterval(loadActions, 10000);

        return () => clearInterval(interval);

    }, []);

    async function loadActions() {

        try {

            const res = await API.get("/ai/actions");

            setActions(res.data.actions);

        } catch (err) {

            console.error(err);

        }

    }

    async function simulateAction(actionId) {

        try {

            const res = await API.post(`/ai/simulate-action/${actionId}`);

            setSimulation(res.data);

        } catch (err) {

            console.error(err);

        }

    }

    if (actions.length === 0) {

        return (

            <div className="action-center">

                Loading AI Actions...

            </div>

        );

    }

    return (

        <div className="action-center">

            <h2>🤖 AI Action Center</h2>

            {actions.map((action) => (

                <div
                    className="action-card"
                    key={action.id}
                >

                    <div className="action-header">

                        <h3>{action.title}</h3>

                        <span
                            className={`priority ${action.priority.toLowerCase()}`}
                        >
                            {action.priority}
                        </span>

                    </div>

                    <p>{action.description}</p>

                    <div className="action-details">

                        <div>

                            <strong>🎯 Confidence</strong>

                            <p>{action.confidence}%</p>

                        </div>

                        <div>

                            <strong>⚠ Risk</strong>

                            <p>{action.risk}</p>

                        </div>

                        <div>

                            <strong>⏱ Effort</strong>

                            <p>{action.effort}</p>

                        </div>

                    </div>

                    <div className="improvement">

                        📈 {action.expected_improvement}

                    </div>

                    <button
                        className="apply-btn"
                        onClick={() => simulateAction(action.id)}
                    >
                        🚀 Apply Simulation
                    </button>

                </div>

            ))}

            {simulation && (

                <div className="simulation-card">

                    <h2>🧪 AI Optimization Simulation</h2>

                    <h3>{simulation.action}</h3>

                    <div className="simulation-grid">

                        <div>

                            <strong>Response Time</strong>

                            <p>

                                {simulation.response_time_before} ms

                                {" → "}

                                {simulation.response_time_after} ms

                            </p>

                        </div>

                        <div>

                            <strong>Health Score</strong>

                            <p>

                                {simulation.health_before}

                                {" → "}

                                {simulation.health_after}

                            </p>

                        </div>

                        <div>

                            <strong>Error Rate</strong>

                            <p>

                                {simulation.error_before}%

                                {" → "}

                                {simulation.error_after}%

                            </p>

                        </div>

                        <div>

                            <strong>Requests</strong>

                            <p>

                                {simulation.requests_before}

                                {" → "}

                                {simulation.requests_after}

                            </p>

                        </div>

                    </div>

                    <div className="simulation-result">

                        📈 {simulation.improvement}

                    </div>

                </div>

            )}

        </div>

    );

}

export default ActionCenter;