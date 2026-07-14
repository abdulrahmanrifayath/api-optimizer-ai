import { useEffect, useState } from "react";

function MetricCard({
    title,
    value,
    icon,
    color,
    suffix = "",
    decimals = 0
}) {

    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {

        let start = 0;

        const end = Number(value);

        if (isNaN(end)) {
            setDisplayValue(value);
            return;
        }

        const duration = 800;

        const increment = end / (duration / 20);

        const timer = setInterval(() => {

            start += increment;

            if (start >= end) {

                clearInterval(timer);

                setDisplayValue(end);

            } else {

                setDisplayValue(start);

            }

        },20);

        return () => clearInterval(timer);

    }, [value]);

    return (

        <div
            className="metric-card"
            style={{
                borderTop:`5px solid ${color}`
            }}
        >

            <div className="metric-icon">

                {icon}

            </div>

            <div>

                <h4>{title}</h4>

                <h2>

                    {typeof displayValue === "number"

                        ? displayValue.toFixed(decimals)

                        : displayValue}

                    {suffix}

                </h2>

            </div>

        </div>

    );

}

export default MetricCard;