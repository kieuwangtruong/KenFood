from pydantic import BaseModel
from datetime import datetime
from app.models.delivery_batch import DeliveryBatchStatus
from app.schemas.order import OrderResponse

class DeliveryBatchResponse(BaseModel):
    id: int
    driver_id: int | None
    building_id: int
    status: DeliveryBatchStatus
    created_at: datetime
    updated_at: datetime
    orders: list[OrderResponse] = []

    class Config:
        from_attributes = True

class MerchantProductAggregation(BaseModel):
    product_id: int
    product_name: str
    price: int
    total_quantity: int
    total_revenue: int

class MerchantAggregationResponse(BaseModel):
    merchant_id: int
    date: str
    aggregated_items: list[MerchantProductAggregation]
