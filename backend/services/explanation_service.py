class ExplanationService:
    """
    Generates explainable AI responses for optimization recommendations.
    """

    @staticmethod
    def explain(
        title,
        reason,
        confidence,
        improvement,
        metric,
        value,
        threshold,
        model,
    ):

        return {

            "title": title,

            "reason": reason,

            "impact": "High",

            "confidence": confidence,

            "expected_improvement": improvement,

            "explanation": {

                "model": model,

                "metric": metric,

                "current_value": value,

                "threshold": threshold,

                "analysis": (
                    f"The {model} model detected that "
                    f"{metric} reached {value}, "
                    f"which crossed the threshold of {threshold}. "
                    f"Therefore this recommendation was generated."
                ),

                "decision_score": confidence

            }

        }