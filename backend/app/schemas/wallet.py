from pydantic import BaseModel
from datetime import datetime
from app.models.wallet import TransactionType, TransactionStatus

class TransactionResponse(BaseModel):
    id: int
    wallet_id: int
    amount: int
    type: TransactionType
    status: TransactionStatus
    reference_id: str | None
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True

class WalletResponse(BaseModel):
    id: int
    user_id: int
    balance: int
    deposit_amount: int
    blocked_balance: int
    available_balance: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DepositRequest(BaseModel):
    amount: int

class DepositResponse(BaseModel):
    payment_url: str
    order_code: str
