import { useEffect, useState } from "react";
import "../styles/HealthTimeline.css";

function HealthTimeline({ dashboard }) {

    const [history, setHistory] = useState([]);

    useEffect(() => {

        if (!dashboard) return;

        const interval = setInterval(() => {

            const levels = [
                "Healthy",
                "Healthy",
                "Healthy",
                "Warning",
                "Critical"
            ];

            const status =
                levels[Math.floor(Math.random() * levels.length)];

            const item = {

                time: new Date().toLocaleTimeString(),

                status

            };

            setHistory(prev => {

                const updated = [item, ...prev];

                return updated.slice(0, 8);

            });

        }, 4000);

        return () => clearInterval(interval);

    }, [dashboard]);

    return (

        <div className="timeline-card">

            <h2>🕒 API Health Timeline</h2>

            <div className="timeline">

                {history.map((item, index) => (

                    <div
                        key={index}
                        className="timeline-item"
                    >

                        <div
                            className={`timeline-dot ${item.status.toLowerCase()}`}
                        ></div>

                        <div className="timeline-content">

                            <h4>{item.time}</h4>

                            <p>{item.status}</p>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default HealthTimeline;