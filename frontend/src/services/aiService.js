import API from "./api";

export const getAiDashboard = async () => {
    const response = await API.get("/ai/dashboard");
    return response.data;
};

export const getAiAnomalies = async () => {
    const response = await API.get("/ai/anomalies");
    return response.data;
};

export const getAiPredictions = async () => {
    const response = await API.get("/ai/predictions");
    return response.data;
};

export const getAiRiskAnalysis = async () => {
    const response = await API.get("/ai/risk-analysis");
    return response.data;
};

export const getAiScoreCard = async () => {
    const response = await API.get("/ai/score-card");
    return response.data;
};

export const getAiBusinessInsights = async () => {
    const response = await API.get("/ai/business-insights");
    return response.data;
};

export const getAiRecommendationHistory = async () => {
    const response = await API.get("/ai/recommendations/history");
    return response.data;
};

export const updateRecommendationStatus = async (recId, status) => {
    const response = await API.patch(`/ai/recommendations/${recId}/status`, { status });
    return response.data;
};

export const getAiFeatures = async () => {
    const response = await API.get("/ai/features");
    return response.data;
};

export const getAiTrends = async () => {
    const response = await API.get("/ai/trends");
    return response.data;
};

export const getAiSmartAlerts = async () => {
    const response = await API.get("/ai/smart-alerts");
    return response.data;
};
