from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr


# --- Customer ---

class CustomerBase(BaseModel):
    name: str
    surname: str
    address: Optional[str] = None
    birth_date: Optional[date] = None
    email: EmailStr


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int

    model_config = {"from_attributes": True}


# --- Product ---

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int

    model_config = {"from_attributes": True}


# --- Order ---

class OrderBase(BaseModel):
    order_number: str
    purchase_date: date
    customer_id: int
    product_ids: list[int] = []


class OrderCreate(OrderBase):
    pass


class OrderUpdate(OrderBase):
    pass


class OrderResponse(BaseModel):
    id: int
    order_number: str
    purchase_date: date
    customer_id: int
    customer: Optional[CustomerResponse] = None
    products: list[ProductResponse] = []

    model_config = {"from_attributes": True}
