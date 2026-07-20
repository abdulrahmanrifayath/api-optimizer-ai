import API from "./api";

export const getConnectedApis = async () => {
    const response = await API.get("/connected-apis/");
    return response.data;
};


export const createConnectedApi = async (apiData) => {
    const response = await API.post(
        "/connected-apis/",
        apiData
    );

    return response.data;
};


export const updateConnectedApi = async (id, apiData) => {
    const response = await API.put(
        `/connected-apis/${id}`,
        apiData
    );

    return response.data;
};


export const deleteConnectedApi = async (id) => {
    const response = await API.delete(
        `/connected-apis/${id}`
    );

    return response.data;
};