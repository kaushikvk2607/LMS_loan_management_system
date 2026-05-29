from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


output_dir = Path("demo-files")
output_dir.mkdir(exist_ok=True)
output_path = output_dir / "vikas-demo-salary-slip.pdf"

c = canvas.Canvas(str(output_path), pagesize=A4)
width, height = A4

c.setFillColor(colors.HexColor("#0f766e"))
c.rect(0, height - 34 * mm, width, 34 * mm, fill=True, stroke=False)
c.setFillColor(colors.white)
c.setFont("Helvetica-Bold", 20)
c.drawString(22 * mm, height - 19 * mm, "Demo Salary Slip")
c.setFont("Helvetica", 10)
c.drawString(22 * mm, height - 26 * mm, "FOR LMS TESTING ONLY - NOT A REAL EMPLOYMENT DOCUMENT")

c.setFillColor(colors.HexColor("#dc5f4b"))
c.setFont("Helvetica-Bold", 32)
c.saveState()
c.translate(width / 2, height / 2)
c.rotate(34)
c.drawCentredString(0, 0, "DEMO")
c.restoreState()

c.setFillColor(colors.HexColor("#111827"))
c.setFont("Helvetica-Bold", 13)
c.drawString(22 * mm, height - 50 * mm, "Employee Details")

details = [
    ("Employee Name", "Vikas Kumar"),
    ("Employee ID", "LMS-DEMO-1024"),
    ("Designation", "Software Associate"),
    ("Department", "Technology"),
    ("Salary Month", "May 2026"),
    ("PAN", "ABCDE1234F"),
]

y = height - 61 * mm
for label, value in details:
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#6b7280"))
    c.drawString(24 * mm, y, label)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(74 * mm, y, value)
    y -= 8 * mm

table_x = 22 * mm
table_y = height - 125 * mm
row_h = 10 * mm
col_w = [88 * mm, 42 * mm, 42 * mm]

c.setFillColor(colors.HexColor("#f2d48f"))
c.rect(table_x, table_y, sum(col_w), row_h, fill=True, stroke=False)
c.setFillColor(colors.HexColor("#111827"))
c.setFont("Helvetica-Bold", 10)
c.drawString(table_x + 4 * mm, table_y + 3.2 * mm, "Component")
c.drawRightString(table_x + col_w[0] + col_w[1] - 4 * mm, table_y + 3.2 * mm, "Earnings")
c.drawRightString(table_x + sum(col_w) - 4 * mm, table_y + 3.2 * mm, "Deductions")

rows = [
    ("Basic Salary", 32000, 0),
    ("House Rent Allowance", 12000, 0),
    ("Special Allowance", 9000, 0),
    ("Provident Fund", 0, 1800),
    ("Professional Tax", 0, 200),
]

y = table_y - row_h
for index, (component, earning, deduction) in enumerate(rows):
    c.setFillColor(colors.white if index % 2 == 0 else colors.HexColor("#f7f7f2"))
    c.rect(table_x, y, sum(col_w), row_h, fill=True, stroke=False)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica", 10)
    c.drawString(table_x + 4 * mm, y + 3.2 * mm, component)
    c.drawRightString(table_x + col_w[0] + col_w[1] - 4 * mm, y + 3.2 * mm, f"INR {earning:,.0f}")
    c.drawRightString(table_x + sum(col_w) - 4 * mm, y + 3.2 * mm, f"INR {deduction:,.0f}")
    y -= row_h

gross = 53000
deductions = 2000
net = gross - deductions

c.setFillColor(colors.HexColor("#111827"))
c.rect(table_x, y, sum(col_w), row_h, fill=True, stroke=False)
c.setFillColor(colors.white)
c.setFont("Helvetica-Bold", 10)
c.drawString(table_x + 4 * mm, y + 3.2 * mm, "Total")
c.drawRightString(table_x + col_w[0] + col_w[1] - 4 * mm, y + 3.2 * mm, f"INR {gross:,.0f}")
c.drawRightString(table_x + sum(col_w) - 4 * mm, y + 3.2 * mm, f"INR {deductions:,.0f}")

summary_y = y - 22 * mm
c.setFillColor(colors.HexColor("#0f766e"))
c.roundRect(table_x, summary_y, sum(col_w), 18 * mm, 3 * mm, fill=True, stroke=False)
c.setFillColor(colors.white)
c.setFont("Helvetica-Bold", 13)
c.drawString(table_x + 5 * mm, summary_y + 10.5 * mm, "Net Salary Paid")
c.setFont("Helvetica-Bold", 15)
c.drawRightString(table_x + sum(col_w) - 5 * mm, summary_y + 10 * mm, f"INR {net:,.0f}")

c.setFillColor(colors.HexColor("#6b7280"))
c.setFont("Helvetica", 9)
c.drawString(22 * mm, 26 * mm, "This sample salary slip is generated only for testing the LMS upload feature.")
c.drawString(22 * mm, 20 * mm, "It should not be used as proof of income, employment, or identity.")

c.showPage()
c.save()

print(output_path.resolve())
