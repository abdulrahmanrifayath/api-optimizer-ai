from io import BytesIO

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate
from reportlab.platypus import Paragraph
from reportlab.platypus import Spacer

from backend.services.optimization_service import OptimizationService
from backend.services.prediction_service import PredictionService
from backend.services.anomaly_service import AnomalyService


class PDFExportService:

    @staticmethod
    def generate():

        buffer = BytesIO()

        doc = SimpleDocTemplate(buffer)

        styles = getSampleStyleSheet()

        story = []

        story.append(
            Paragraph(
                "<b>API OPTIMIZER AI</b>",
                styles["Title"]
            )
        )

        story.append(
            Paragraph(
                "Executive Performance Report",
                styles["Heading2"]
            )
        )

        story.append(Spacer(1, 20))

        optimization = OptimizationService().get_recommendations()
        prediction = PredictionService().get_prediction()
        anomaly = AnomalyService().detect()

        story.append(
            Paragraph(
                f"<b>Health Score:</b> {optimization['health_score']}/100",
                styles["BodyText"]
            )
        )

        story.append(
            Paragraph(
                f"<b>Priority:</b> {optimization['priority']}",
                styles["BodyText"]
            )
        )

        story.append(Spacer(1, 15))

        story.append(
            Paragraph(
                "<b>Traffic Prediction</b>",
                styles["Heading3"]
            )
        )

        story.append(
            Paragraph(
                f"Current Requests : {prediction['current_requests']}",
                styles["BodyText"]
            )
        )

        story.append(
            Paragraph(
                f"Predicted Requests : {prediction['predicted_requests']}",
                styles["BodyText"]
            )
        )

        story.append(
            Paragraph(
                f"Trend : {prediction['trend']}",
                styles["BodyText"]
            )
        )

        story.append(Spacer(1, 15))

        story.append(
            Paragraph(
                "<b>Anomaly Detection</b>",
                styles["Heading3"]
            )
        )

        story.append(
            Paragraph(
                f"Anomaly : {anomaly['anomaly']}",
                styles["BodyText"]
            )
        )

        story.append(
            Paragraph(
                f"Score : {anomaly['score']}",
                styles["BodyText"]
            )
        )

        story.append(Spacer(1, 15))

        story.append(
            Paragraph(
                "<b>AI Recommendations</b>",
                styles["Heading3"]
            )
        )

        for rec in optimization["recommendations"]:

            story.append(
                Paragraph(
                    f"• <b>{rec['title']}</b>",
                    styles["BodyText"]
                )
            )

            story.append(
                Paragraph(
                    rec["reason"],
                    styles["BodyText"]
                )
            )

            story.append(
                Spacer(1, 8)
            )

        doc.build(story)

        pdf = buffer.getvalue()

        buffer.close()

        return pdf