from pydantic import BaseModel, Field
from datetime import datetime
from app.models.order import OrderStatus, PaymentMethod

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    merchant_id: int
    building_id: int
    payment_method: PaymentMethod
    items: list[OrderItemCreate] = Field(..., min_length=1)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: int
    product_name: str | None = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    merchant_id: int
    building_id: int
    batch_id: int | None
    status: OrderStatus
    payment_method: PaymentMethod
    payos_order_code: str | None
    food_amount: int
    delivery_fee: int
    total_amount: int
    items: list[OrderItemResponse]
    created_at: datetime
    updated_at: datetime
    merchant_name: str | None = None
    building_name: str | None = None
    driver_name: str | None = None

    class Config:
        from_attributes = True
