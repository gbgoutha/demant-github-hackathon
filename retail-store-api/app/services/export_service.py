import io
from datetime import date

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet


# ---------------------------------------------------------------------------
# Customers
# ---------------------------------------------------------------------------

def export_customers_excel(customers: list[dict]) -> io.BytesIO:
    df = pd.DataFrame(customers)
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Customers")
    buf.seek(0)
    return buf


def export_customers_pdf(customers: list[dict]) -> io.BytesIO:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4))
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Customer Report", styles["Title"]))
    elements.append(Spacer(1, 0.25 * inch))

    headers = ["ID", "Name", "Surname", "Email", "Address", "Birth Date"]
    data = [headers]
    for c in customers:
        data.append([
            str(c.get("id", "")),
            c.get("name", ""),
            c.get("surname", ""),
            c.get("email", ""),
            c.get("address", "") or "",
            str(c.get("birth_date", "") or ""),
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4472C4")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
    ]))
    elements.append(table)
    doc.build(elements)
    buf.seek(0)
    return buf


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

def export_products_excel(products: list[dict]) -> io.BytesIO:
    df = pd.DataFrame(products)
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Products")
    buf.seek(0)
    return buf


def export_products_pdf(products: list[dict]) -> io.BytesIO:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Product Report", styles["Title"]))
    elements.append(Spacer(1, 0.25 * inch))

    headers = ["ID", "Name", "Description", "Price"]
    data = [headers]
    for p in products:
        data.append([
            str(p.get("id", "")),
            p.get("name", ""),
            p.get("description", "") or "",
            f"{p.get('price', 0):.2f}",
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4472C4")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
    ]))
    elements.append(table)
    doc.build(elements)
    buf.seek(0)
    return buf


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

def export_orders_excel(orders: list[dict]) -> io.BytesIO:
    rows = []
    for o in orders:
        customer_name = ""
        if o.get("customer"):
            c = o["customer"]
            customer_name = f"{c.get('name', '')} {c.get('surname', '')}"
        product_names = ", ".join(p.get("name", "") for p in o.get("products", []))
        rows.append({
            "ID": o.get("id"),
            "Order Number": o.get("order_number"),
            "Purchase Date": o.get("purchase_date"),
            "Customer": customer_name,
            "Products": product_names,
        })
    df = pd.DataFrame(rows)
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Orders")
    buf.seek(0)
    return buf


def export_orders_pdf(orders: list[dict]) -> io.BytesIO:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4))
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Order Report", styles["Title"]))
    elements.append(Spacer(1, 0.25 * inch))

    headers = ["ID", "Order Number", "Purchase Date", "Customer", "Products"]
    data = [headers]
    for o in orders:
        customer_name = ""
        if o.get("customer"):
            c = o["customer"]
            customer_name = f"{c.get('name', '')} {c.get('surname', '')}"
        product_names = ", ".join(p.get("name", "") for p in o.get("products", []))
        data.append([
            str(o.get("id", "")),
            o.get("order_number", ""),
            str(o.get("purchase_date", "")),
            customer_name,
            product_names,
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4472C4")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
    ]))
    elements.append(table)
    doc.build(elements)
    buf.seek(0)
    return buf
