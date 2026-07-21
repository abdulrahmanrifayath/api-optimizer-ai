import API from "./api";

export const getConnectedApis = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.query) params.append("query", filters.query);
    if (filters.status && filters.status !== "All") params.append("status", filters.status);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await API.get(`/connected-apis/?${params.toString()}`);
    return response.data;
};

export const createConnectedApi = async (apiData) => {
    const response = await API.post("/connected-apis/", apiData);
    return response.data;
};

export const updateConnectedApi = async (id, apiData) => {
    const response = await API.put(`/connected-apis/${id}`, apiData);
    return response.data;
};

export const deleteConnectedApi = async (id) => {
    const response = await API.delete(`/connected-apis/${id}`);
    return response.data;
};

export const updateApiStatus = async (id, status) => {
    const response = await API.patch(`/connected-apis/${id}/status`, { status });
    return response.data;
};

export const testApiConnection = async (id) => {
    const response = await API.post(`/connected-apis/${id}/test`);
    return response.data;
};

export const getApiMetrics = async (id) => {
    const response = await API.get(`/connected-apis/${id}/metrics`);
    return response.data;
};

export const getHistoricalMetrics = async (apiId = null, timeWindow = "24h") => {
    const params = new URLSearchParams();
    if (apiId) params.append("api_id", apiId);
    params.append("time_window", timeWindow);

    const response = await API.get(`/connected-apis/metrics/historical?${params.toString()}`);
    return response.data;
};

export const getErrorSummary = async () => {
    const response = await API.get("/connected-apis/errors/summary");
    return response.data;
};

export const toggleApiMonitoring = async (id, isMonitored) => {
    const response = await API.patch(`/connected-apis/${id}/monitoring?is_monitored=${isMonitored}`);
    return response.data;
};

export const getConnectedApiSummary = async () => {
    const response = await API.get("/connected-apis/summary");
    return response.data;
};