import enum
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, BigInteger, String, Enum, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class TransactionType(str, enum.Enum):
    DEPOSIT = "deposit"       # Deposit money into wallet (e.g. from PayOS)
    WITHDRAW = "withdraw"     # Withdraw money from wallet
    BLOCK = "block"           # Block funds (blocked_balance increases, available decreases)
    RELEASE = "release"       # Release blocked funds (blocked_balance decreases)
    DEDUCT = "deduct"         # Deduct money (balance decreases, blocked decreases if completing)
    PAYOUT = "payout"         # Payout money to driver or partner (balance increases)

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"

class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    balance: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)                  # Tổng số dư (VND)
    deposit_amount: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)           # Tiền ký quỹ (Ký quỹ lái xe)
    blocked_balance: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)          # Tiền bị phong tỏa (Treo tiền COD)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="wallet")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="wallet", cascade="all, delete-orphan")

    @property
    def available_balance(self) -> int:
        return self.balance - self.blocked_balance

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    wallet_id: Mapped[int] = mapped_column(ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)                              # Số tiền giao dịch (VND)
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType), nullable=False)
    status: Mapped[TransactionStatus] = mapped_column(Enum(TransactionStatus), nullable=False, default=TransactionStatus.PENDING)
    reference_id: Mapped[str] = mapped_column(String(255), nullable=True, index=True)            # PayOS orderCode, Order ID, etc.
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    # Relationships
    wallet: Mapped["Wallet"] = relationship("Wallet", back_populates="transactions")

    __table_args__ = (
        UniqueConstraint("reference_id", "type", "status", name="uq_reference_id_type_status"),
    )
