from typing import Annotated
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.delivery_batch import DeliveryBatchResponse, MerchantAggregationResponse
from app.services.batch_service import BatchService
from app.services.order_service import OrderService
from app.routers.deps import get_current_user, get_current_driver, get_current_partner
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/batch", tags=["Delivery Batches"])

@router.post("/compile", response_model=list[DeliveryBatchResponse])
async def compile_delivery_batches(
    cutoff: Annotated[str | None, Query(description="Optional custom ISO-8601 cutoff datetime for testing")] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None
):
    """
    Compiles individual customer orders into destination-sharing delivery batches.
    Requires ADMIN credentials.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can trigger batch compilation")

    batch_service = BatchService(db)
    
    cutoff_dt = None
    if cutoff:
        try:
            cutoff_dt = datetime.fromisoformat(cutoff)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid cutoff format. Use ISO-8601.")

    batches = await batch_service.compile_batches(cutoff_dt)
    await db.commit()
        
    # Re-fetch batches with fully populated order objects
    results = []
    for b in batches:
        details = await batch_service.batch_repo.get_batch_details(b.id)
        results.append(details)
        
    return results

@router.get("/active", response_model=list[DeliveryBatchResponse])
async def list_active_delivery_batches(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Lists all active delivery batches (pending, assigned, delivering).
    """
    batch_service = BatchService(db)
    batches = await batch_service.batch_repo.list_active_batches()
    return batches

@router.get("/my-batches", response_model=list[DeliveryBatchResponse])
async def list_driver_batches(
    current_driver: Annotated[User, Depends(get_current_driver)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Lists all batches assigned to the current driver.
    """
    batch_service = BatchService(db)
    batches = await batch_service.batch_repo.list_by_driver(current_driver.id)
    return batches

@router.post("/{batch_id}/accept", response_model=DeliveryBatchResponse)
async def accept_batch(
    batch_id: int,
    current_driver: Annotated[User, Depends(get_current_driver)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Assigns batch to driver and blocks cash values for CASH orders.
    Enforces the Tín Quỹ rule.
    """
    order_service = OrderService(db)
    
    batch = await order_service.accept_batch(batch_id, current_driver.id)
    await db.commit()
        
    return await order_service.batch_repo.get_batch_details(batch.id)

@router.post("/{batch_id}/drop", response_model=DeliveryBatchResponse)
async def drop_batch(
    batch_id: int,
    current_driver: Annotated[User, Depends(get_current_driver)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Drops batch assignment and releases all locked funds.
    """
    order_service = OrderService(db)
    
    batch = await order_service.drop_batch(batch_id, current_driver.id)
    await db.commit()
        
    return await order_service.batch_repo.get_batch_details(batch.id)

@router.post("/{batch_id}/complete", response_model=DeliveryBatchResponse)
async def complete_batch(
    batch_id: int,
    current_driver: Annotated[User, Depends(get_current_driver)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Driver marks batch as completed. Settlement calculations run.
    """
    order_service = OrderService(db)
    
    batch = await order_service.complete_batch(batch_id, current_driver.id)
    await db.commit()
        
    return await order_service.batch_repo.get_batch_details(batch.id)

@router.get("/merchant-aggregation", response_model=MerchantAggregationResponse)
async def get_merchant_order_aggregation(
    target_date: Annotated[str | None, Query(description="Date format YYYY-MM-DD")] = None,
    current_partner: Annotated[User, Depends(get_current_partner)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None
):
    """
    Compiles menu prep list for merchants grouped by product.
    """
    batch_service = BatchService(db)
    merchant = await batch_service.user_repo.get_merchant_by_user_id(current_partner.id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Partner merchant profile not found")

    parsed_date = date.today()
    if target_date:
        try:
            parsed_date = date.fromisoformat(target_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    return await batch_service.get_merchant_aggregation(merchant.id, parsed_date)
