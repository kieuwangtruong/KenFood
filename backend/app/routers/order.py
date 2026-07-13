from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User, UserRole
from app.models.order import OrderStatus
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import OrderService
from app.routers.deps import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/order", tags=["Orders"])

@router.post("/checkout", status_code=status.HTTP_201_CREATED)
async def checkout(
    dto: OrderCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Creates a new customer order and returns order details.
    If payment method is PAYOS, returns a PayOS payment link.
    """
    order_service = OrderService(db)
    
    # Run creation inside a transaction
    order, payos_url = await order_service.create_order(current_user.id, dto)
    await db.commit()
        
    return {
        "order": OrderResponse.model_validate(order),
        "payos_checkout_url": payos_url
    }

@router.get("", response_model=list[OrderResponse])
async def list_orders(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Lists orders for the current customer or partner.
    """
    order_service = OrderService(db)
    
    if current_user.role == UserRole.CUSTOMER:
        return await order_service.order_repo.list_by_customer(current_user.id)
    elif current_user.role == UserRole.PARTNER:
        merchant = await order_service.user_repo.get_merchant_by_user_id(current_user.id)
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant profile not found")
        return await order_service.order_repo.list_by_merchant(merchant.id)
    elif current_user.role == UserRole.ADMIN:
        return await order_service.order_repo.list()
    else:
        raise HTTPException(status_code=403, detail="Not authorized to list orders")

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Retrieves details of a specific order.
    """
    order_service = OrderService(db)
    order = await order_service.order_repo.get_order_details(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Authorize access
    if current_user.role == UserRole.CUSTOMER and order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    elif current_user.role == UserRole.PARTNER:
        merchant = await order_service.user_repo.get_merchant_by_user_id(current_user.id)
        if not merchant or order.merchant_id != merchant.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this order")
        
    return order

@router.post("/{order_id}/complete")
async def complete_order_manually(
    order_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Enables a driver (if assigned to the batch) or admin to complete an individual order manually.
    Triggers financial disbursements.
    """
    order_service = OrderService(db)
    
    order = await order_service.order_repo.get_order_details(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Check permissions
    if current_user.role == UserRole.ADMIN:
        driver_id = order.batch.driver_id if order.batch else current_user.id # fallback to admin id for payout
    elif current_user.role == UserRole.DRIVER:
        if not order.batch or order.batch.driver_id != current_user.id:
            raise HTTPException(status_code=403, detail="You are not the driver assigned to this order's batch")
        driver_id = current_user.id
    else:
        raise HTTPException(status_code=403, detail="Not authorized to complete orders")

    await order_service.complete_order_internal(order, driver_id)
    await db.commit()
        
    return {"message": f"Order #{order_id} completed and funds distributed successfully."}
