import random
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.wallet import Transaction, TransactionType, TransactionStatus
from app.schemas.wallet import WalletResponse, TransactionResponse, DepositRequest, DepositResponse
from app.services.wallet_service import WalletService
from app.services.payos_service import PayOSService
from app.routers.deps import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/wallet", tags=["Wallet"])

@router.get("", response_model=WalletResponse)
async def get_wallet_info(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    wallet_service = WalletService(db)
    wallet = await wallet_service.get_wallet(current_user.id)
    return wallet

@router.get("/transactions", response_model=list[TransactionResponse])
async def get_wallet_transactions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    wallet_service = WalletService(db)
    wallet = await wallet_service.get_wallet(current_user.id)
    transactions = await wallet_service.wallet_repo.list_transactions(wallet.id)
    return transactions

@router.post("/deposit", response_model=DepositResponse)
async def request_deposit_link(
    dto: DepositRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Creates a PayOS payment link for customer wallet top-ups.
    Inserts a PENDING DEPOSIT transaction into the DB to track it.
    """
    if dto.amount < 1000:
        raise HTTPException(status_code=400, detail="Minimum deposit is 1,000 VND")

    wallet_service = WalletService(db)
    wallet = await wallet_service.get_wallet(current_user.id)

    # Generate a unique PayOS orderCode
    order_code = random.randint(100000, 999999999)

    # Insert pending deposit transaction
    tx = Transaction(
        wallet_id=wallet.id,
        amount=dto.amount,
        type=TransactionType.DEPOSIT,
        status=TransactionStatus.PENDING,
        reference_id=str(order_code),
        description=f"Wallet top-up request"
    )
    db.add(tx)
    await db.commit()

    # Call PayOS to create payment link
    try:
        payos_response = await PayOSService.create_payment_link(
            order_code=order_code,
            amount=dto.amount,
            description="KenPay Topup"
        )
        return DepositResponse(
            payment_url=payos_response.checkoutUrl,
            order_code=str(order_code)
        )
    except Exception as e:
        logger.error(f"PayOS Deposit Link generation failed: {e}")
        # Mark transaction as failed
        tx.status = TransactionStatus.FAILED
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PayOS service is temporarily unavailable. Try again later."
        )
