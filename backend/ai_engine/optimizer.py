from backend.ai_engine.analyzer import run_analysis


def optimize_api(log):
    suggestions = run_analysis(log)

    return {
        "endpoint": log["endpoint"],
        "analysis": suggestions
    }