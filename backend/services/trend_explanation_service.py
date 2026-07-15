class TrendExplanationService:

    @staticmethod
    def generate(history):

        if len(history) < 2:
            return {
                "summary": "Not enough historical data available.",
                "status": "Collecting Data"
            }

        latest = history[-1]
        previous = history[-2]

        messages = []

        # -----------------------------
        # Requests Trend
        # -----------------------------
        if latest["requests"] > previous["requests"]:
            messages.append(
                "📈 API traffic has increased compared to the previous day."
            )

        elif latest["requests"] < previous["requests"]:
            messages.append(
                "📉 API traffic has decreased compared to the previous day."
            )

        else:
            messages.append(
                "➡ API traffic is stable."
            )

        # -----------------------------
        # Response Time
        # -----------------------------
        if latest["response_time"] < previous["response_time"]:
            messages.append(
                "⚡ Response time has improved."
            )

        elif latest["response_time"] > previous["response_time"]:
            messages.append(
                "⚠ Response time has increased."
            )

        # -----------------------------
        # Error Rate
        # -----------------------------
        if latest["error_rate"] > previous["error_rate"]:
            messages.append(
                "🚨 Error rate is increasing."
            )

        elif latest["error_rate"] < previous["error_rate"]:
            messages.append(
                "✅ Error rate has decreased."
            )

        # -----------------------------
        # AI Conclusion
        # -----------------------------
        if (
            latest["requests"] >= previous["requests"]
            and latest["response_time"] <= previous["response_time"]
        ):

            conclusion = (
                "Infrastructure is scaling efficiently under increasing traffic."
            )

        elif latest["response_time"] > previous["response_time"]:

            conclusion = (
                "Possible database or backend bottleneck detected."
            )

        else:

            conclusion = (
                "System performance remains stable."
            )

        return {

            "summary": " ".join(messages),

            "conclusion": conclusion

        }