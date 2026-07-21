import API from "./api";

export const getConnectedApis = async () => {
    const response = await API.get("/connected-apis/");
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

export const getConnectedApiSummary = async () => {
    const response = await API.get("/connected-apis/summary");
    return response.data;
};