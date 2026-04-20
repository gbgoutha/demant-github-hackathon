from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..services.export_service import export_orders_excel, export_orders_pdf

router = APIRouter()


@router.post("/", response_model=schemas.OrderResponse, status_code=201)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    products = db.query(models.Product).filter(models.Product.id.in_(order.product_ids)).all()
    if len(products) != len(order.product_ids):
        raise HTTPException(status_code=404, detail="One or more products not found")

    db_order = models.Order(
        order_number=order.order_number,
        purchase_date=order.purchase_date,
        customer_id=order.customer_id,
        products=products,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("/", response_model=list[schemas.OrderResponse])
def get_orders(search: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Order)
    if search:
        query = query.filter(
            models.Order.order_number.ilike(f"%{search}%")
            | models.Order.customer.has(models.Customer.name.ilike(f"%{search}%"))
        )
    return query.all()


@router.get("/export/excel")
def export_orders_to_excel(db: Session = Depends(get_db)):
    orders = db.query(models.Order).all()
    data = [schemas.OrderResponse.model_validate(o).model_dump() for o in orders]
    buf = export_orders_excel(data)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=orders.xlsx"},
    )


@router.get("/export/pdf")
def export_orders_to_pdf(db: Session = Depends(get_db)):
    orders = db.query(models.Order).all()
    data = [schemas.OrderResponse.model_validate(o).model_dump() for o in orders]
    buf = export_orders_pdf(data)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=orders.pdf"},
    )


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}", response_model=schemas.OrderResponse)
def update_order(order_id: int, order: schemas.OrderUpdate, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    products = db.query(models.Product).filter(models.Product.id.in_(order.product_ids)).all()
    if len(products) != len(order.product_ids):
        raise HTTPException(status_code=404, detail="One or more products not found")

    db_order.order_number = order.order_number
    db_order.purchase_date = order.purchase_date
    db_order.customer_id = order.customer_id
    db_order.products = products
    db.commit()
    db.refresh(db_order)
    return db_order


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_order)
    db.commit()
