from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..services.export_service import export_customers_excel, export_customers_pdf

router = APIRouter()


@router.post("/", response_model=schemas.CustomerResponse, status_code=201)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


@router.get("/", response_model=list[schemas.CustomerResponse])
def get_customers(search: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Customer)
    if search:
        query = query.filter(
            models.Customer.name.ilike(f"%{search}%")
            | models.Customer.surname.ilike(f"%{search}%")
            | models.Customer.email.ilike(f"%{search}%")
        )
    return query.all()


@router.get("/export/excel")
def export_customers_to_excel(db: Session = Depends(get_db)):
    customers = db.query(models.Customer).all()
    data = [schemas.CustomerResponse.model_validate(c).model_dump() for c in customers]
    buf = export_customers_excel(data)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=customers.xlsx"},
    )


@router.get("/export/pdf")
def export_customers_to_pdf(db: Session = Depends(get_db)):
    customers = db.query(models.Customer).all()
    data = [schemas.CustomerResponse.model_validate(c).model_dump() for c in customers]
    buf = export_customers_pdf(data)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=customers.pdf"},
    )


@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=schemas.CustomerResponse)
def update_customer(customer_id: int, customer: schemas.CustomerUpdate, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in customer.model_dump().items():
        setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
