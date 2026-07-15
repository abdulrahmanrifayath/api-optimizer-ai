class ExplanationService:

    @staticmethod
    def explain(
        title,
        reason,
        confidence,
        improvement,
        metric,
        value,
        threshold,
        model
    ):
        return {
            "title": title,

            "reason": reason,

            "confidence": confidence,

            "expected_improvement": improvement,

            "ai_explanation": (
                f"The {model} model detected that "
                f"{metric} reached {value}, "
                f"which crossed the threshold of {threshold}. "
                f"Therefore this recommendation was generated."
            ),

            "trigger": {
                "metric": metric,
                "current_value": value,
                "threshold": threshold
            },

            "model": model
        }