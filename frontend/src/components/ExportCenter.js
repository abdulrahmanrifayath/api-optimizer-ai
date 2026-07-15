import API from "../services/api";
import "../styles/ExportCenter.css";

function ExportCenter() {

    const downloadFile = async (endpoint, filename) => {

        try {

            const response = await API.get(endpoint, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;
            link.setAttribute("download", filename);

            document.body.appendChild(link);

            link.click();

            link.remove();

        } catch (err) {

            console.error(err);

        }

    };

    return (

        <div className="export-card">

            <h2>📤 Export Dashboard Report</h2>

            <div className="export-buttons">

                <button
                    onClick={() =>
                        downloadFile(
                            "/ai/export/csv",
                            "api_report.csv"
                        )
                    }
                >
                    📄 Export CSV
                </button>

                <button
                    onClick={() =>
                        downloadFile(
                            "/ai/export/json",
                            "api_report.json"
                        )
                    }
                >
                    📋 Export JSON
                </button>

                <button
                onClick={() =>
                downloadFile(
                "/ai/export/pdf",
                "API_Optimizer_Report.pdf"
        )
    }
>
    📕 Export PDF
</button>

            </div>

        </div>

    );

}

export default ExportCenter;