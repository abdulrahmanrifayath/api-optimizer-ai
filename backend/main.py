from fastapi import FastAPI

app = FastAPI(
    title="API Optimizer AI",
    description="AI-powered API Usage Monitor & Optimization Advisor",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to API Optimizer AI 🚀"
    }

@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }