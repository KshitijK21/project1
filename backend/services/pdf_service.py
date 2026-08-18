from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import os

REPORTS_DIR = "reports"
os.makedirs(REPORTS_DIR, exist_ok=True)


def generate_pdf_report(dataset_name: str, summary: str, kpis: list, recommendations: list) -> str:
    filename = os.path.join(REPORTS_DIR, f"report_{dataset_name}.pdf")
    doc = SimpleDocTemplate(filename, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(f"Business Intelligence Report — {dataset_name}", styles["Title"]))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("Executive Summary", styles["Heading2"]))
    elements.append(Paragraph(summary, styles["Normal"]))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("Key Performance Indicators", styles["Heading2"]))
    table_data = [["Measure", "Total", "Average", "Min", "Max"]]
    for k in kpis:
        table_data.append([k["measure"], k["total"], k["average"], k["minimum"], k["maximum"]])
    table = Table(table_data)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4472C4")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("Recommendations", styles["Heading2"]))
    for rec in recommendations:
        elements.append(Paragraph(f"• {rec}", styles["Normal"]))

    doc.build(elements)
    return filename