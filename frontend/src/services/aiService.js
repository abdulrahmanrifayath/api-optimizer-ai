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

export const getAiRecommendations = async () => {
    const response = await API.get("/ai/recommendations");
    return response.data;
};
