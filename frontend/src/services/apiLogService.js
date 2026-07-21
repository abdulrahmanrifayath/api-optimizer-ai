import API from "./api";

export const getLogs = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.endpoint) params.append("endpoint", filters.endpoint);
    if (filters.method) params.append("method", filters.method);
    if (filters.status_code) params.append("status_code", filters.status_code);
    if (filters.status_category) params.append("status_category", filters.status_category);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit || 20);

    const response = await API.get(`/api/v1/logs/?${params.toString()}`);
    return response.data;
};

export const getLogStats = async () => {
    const response = await API.get("/api/v1/logs/stats");
    return response.data;
};

export const ingestLog = async (logData) => {
    const response = await API.post("/api/v1/logs/ingest", logData);
    return response.data;
};

export const ingestBatchLogs = async (logsList) => {
    const response = await API.post("/api/v1/logs/ingest/batch", { logs: logsList });
    return response.data;
};

export const clearLogs = async () => {
    const response = await API.delete("/api/v1/logs/clear");
    return response.data;
};
