import API from "./api";

export const getExecutiveKpis = async () => {
    const response = await API.get("/reports/executive-kpis");
    return response.data;
};

export const getExecutiveSummary = async (reportType = "weekly") => {
    const response = await API.get(`/reports/executive-summary?report_type=${reportType}`);
    return response.data;
};

export const getBenchmarkComparison = async () => {
    const response = await API.get("/reports/benchmark");
    return response.data;
};

export const getCostOptimization = async () => {
    const response = await API.get("/reports/cost-optimization");
    return response.data;
};

export const downloadExecutivePdfReport = async () => {
    const response = await API.get("/reports/executive-pdf", {
        responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Executive_API_Optimizer_Report.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
};
