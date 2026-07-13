from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.schemas.payos import PayOSWebhookPayload
from app.services.payos_service import PayOSService
from app.services.wallet_service import WalletService
from app.models.order import Order, OrderStatus
from app.models.wallet import Wallet, Transaction, TransactionType, TransactionStatus
from app.repositories.order import OrderRepository
from app.repositories.wallet import WalletRepository
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/payos", tags=["PayOS Webhook"])

@router.post("/webhook")
async def payos_webhook(
    request: Request,
    payload: PayOSWebhookPayload,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Receives and processes the PayOS payment webhook securely.
    Verifies payload signature and updates virtual wallet or order status atomically.
    """
    # 1. Verify webhook signature cryptographically
    raw_body = await request.body()
    # Parse raw json to get the exact string payload sent
    import json
    try:
        body_json = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    signature = body_json.get("signature")
    data_dict = body_json.get("data")
    
    if not signature or not data_dict:
        raise HTTPException(status_code=400, detail="Missing data or signature")

    is_valid = PayOSService.verify_webhook_signature(data_dict, signature)
    if not is_valid:
        logger.warning(f"PayOS Webhook signature mismatch: {signature}")
        raise HTTPException(status_code=400, detail="Invalid signature checksum")

    # 2. Extract transaction parameters
    order_code_str = str(payload.data.orderCode)
    amount = payload.data.amount
    is_success_code = payload.data.code == "00"

    order_repo = OrderRepository(db)
    wallet_service = WalletService(db)
    wallet_repo = WalletRepository(db)

    # Begin transactional mutations
    try:
        # Check Case A: Prepayment for an Order
        order = await order_repo.get_by_payos_order_code_for_update(order_code_str)
        if order:
            logger.info(f"Processing webhook for Order #{order.id} (status: {order.status})")
            
            # Webhook state machine guard: if order is already paid/confirmed, ignore further updates
            if order.status in [OrderStatus.PAID, OrderStatus.CONFIRMED, OrderStatus.BATCHED, OrderStatus.DELIVERING, OrderStatus.COMPLETED]:
                logger.info(f"Order #{order.id} is already processed in final state '{order.status}'. Webhook skipped.")
                return {"success": True, "message": "Already processed"}
                
            if is_success_code:
                # Update status
                order.status = OrderStatus.CONFIRMED
                
                # Double-entry ledger booking: Deposit + Deduct to represent card purchase
                wallet = await wallet_service.get_wallet_for_update(order.customer_id)
                
                # Record successful Deposit
                tx_dep = Transaction(
                    wallet_id=wallet.id,
                    amount=amount,
                    type=TransactionType.DEPOSIT,
                    status=TransactionStatus.SUCCESS,
                    reference_id=order_code_str,
                    description=f"PayOS Prepayment for Order #{order.id}"
                )
                # Record successful Deduction
                tx_ded = Transaction(
                    wallet_id=wallet.id,
                    amount=-amount,
                    type=TransactionType.DEDUCT,
                    status=TransactionStatus.SUCCESS,
                    reference_id=order_code_str,
                    description=f"Payment deduction for Order #{order.id}"
                )
                db.add(tx_dep)
                db.add(tx_ded)
            else:
                # Payment failed/cancelled
                order.status = OrderStatus.CANCELLED
                
            await db.commit()
            return {"success": True, "message": "Order updated"}

        # Check Case B: Wallet Top-Up
        from sqlalchemy.orm import selectinload
        # Find the pending deposit transaction
        query = select(Transaction).where(
            Transaction.reference_id == order_code_str,
            Transaction.type == TransactionType.DEPOSIT
        ).options(selectinload(Transaction.wallet)).with_for_update()
        res = await db.execute(query)
        tx = res.scalars().first()


        if tx:
            logger.info(f"Processing webhook for Wallet Top-Up Transaction #{tx.id} (status: {tx.status})")
            
            # Webhook state machine guard
            if tx.status == TransactionStatus.SUCCESS:
                logger.info(f"Topup Transaction #{tx.id} is already SUCCESS. Webhook skipped.")
                return {"success": True, "message": "Already processed"}
                
            wallet = await wallet_service.get_wallet_for_update(tx.wallet.user_id)
            
            if is_success_code:
                tx.status = TransactionStatus.SUCCESS
                wallet.balance += amount
            else:
                tx.status = TransactionStatus.FAILED
                
            await db.commit()
            return {"success": True, "message": "Wallet top-up processed"}

        # Case C: Order code not registered
        logger.error(f"Unrecognized PayOS order code webhook received: {order_code_str}")
        raise HTTPException(status_code=404, detail="Order code reference not found")
        
    except Exception:
        await db.rollback()
        raise

@router.post("/simulate-success")
async def simulate_payos_success(
    order_code: str,
    amount: int,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Developer-only helper to simulate a successful PayOS webhook call.
    Bypasses signature verification to credit wallet or confirm order.
    """
    order_code_str = str(order_code)
    order_repo = OrderRepository(db)
    wallet_service = WalletService(db)
    
    # Check Case A: Prepayment for an Order
    order = await order_repo.get_by_payos_order_code_for_update(order_code_str)
    if order:
        if order.status not in [OrderStatus.PAID, OrderStatus.CONFIRMED, OrderStatus.BATCHED, OrderStatus.DELIVERING, OrderStatus.COMPLETED]:
            order.status = OrderStatus.CONFIRMED
            wallet = await wallet_service.get_wallet_for_update(order.customer_id)
            tx_dep = Transaction(
                wallet_id=wallet.id,
                amount=amount,
                type=TransactionType.DEPOSIT,
                status=TransactionStatus.SUCCESS,
                reference_id=order_code_str,
                description=f"Simulated Prepayment for Order #{order.id}"
            )
            tx_ded = Transaction(
                wallet_id=wallet.id,
                amount=-amount,
                type=TransactionType.DEDUCT,
                status=TransactionStatus.SUCCESS,
                reference_id=order_code_str,
                description=f"Payment deduction for Order #{order.id}"
            )
            db.add(tx_dep)
            db.add(tx_ded)
            await db.commit()
            return {"success": True, "message": "Order simulation success"}
            
    # Check Case B: Wallet Top-Up
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    query = select(Transaction).where(
        Transaction.reference_id == order_code_str,
        Transaction.type == TransactionType.DEPOSIT
    ).options(selectinload(Transaction.wallet)).with_for_update()
    res = await db.execute(query)
    tx = res.scalars().first()
    
    if tx:
        if tx.status != TransactionStatus.SUCCESS:
            wallet = await wallet_service.get_wallet_for_update(tx.wallet.user_id)
            tx.status = TransactionStatus.SUCCESS
            wallet.balance += amount
            await db.commit()
            return {"success": True, "message": "Wallet top-up simulation success"}
            
    raise HTTPException(status_code=404, detail="Order reference code not found")
