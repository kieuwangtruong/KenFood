import enum
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String, BigInteger, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.merchant import Merchant
    from app.models.building import Building
    from app.models.delivery_batch import DeliveryBatch
    from app.models.product import Product


class OrderStatus(str, enum.Enum):
    PENDING_PAYMENT = "pending_payment"  # Waiting for PayOS / Wallet pre-auth payment
    PAID = "paid"                        # Prepaid (PayOS or Wallet)
    CONFIRMED = "confirmed"              # Confirmed order (ready for batch compiling)
    BATCHED = "batched"                  # Assigned to a delivery batch
    DELIVERING = "delivering"            # Batch accepted by driver and in-transit
    COMPLETED = "completed"              # Order delivered successfully
    CANCELLED = "cancelled"              # Order cancelled

class PaymentMethod(str, enum.Enum):
    CASH = "cash"                        # COD payment (checks credit limit & blocked_balance)
    WALLET = "wallet"                    # Internal wallet pre-deduction
    PAYOS = "payos"                      # Webhook deposit pre-auth flow

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    merchant_id: Mapped[int] = mapped_column(ForeignKey("merchants.id", ondelete="RESTRICT"), nullable=False, index=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id", ondelete="RESTRICT"), nullable=False, index=True)
    batch_id: Mapped[int] = mapped_column(ForeignKey("delivery_batches.id", ondelete="SET NULL"), nullable=True, index=True)
    
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.PENDING_PAYMENT, nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod), nullable=False)
    
    # PayOS unique reference for transaction lookup
    payos_order_code: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=True)
    
    food_amount: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    delivery_fee: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    total_amount: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), index=True)
    updated_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    customer: Mapped["User"] = relationship("User", foreign_keys=[customer_id])
    merchant: Mapped["Merchant"] = relationship("Merchant", back_populates="orders")
    building: Mapped["Building"] = relationship("Building", back_populates="orders")
    batch: Mapped["DeliveryBatch"] = relationship("DeliveryBatch", back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    @property
    def merchant_name(self) -> str | None:
        return self.merchant.name if self.merchant else None

    @property
    def building_name(self) -> str | None:
        return self.building.name if self.building else None

    @property
    def driver_name(self) -> str | None:
        if self.batch and self.batch.driver:
            return self.batch.driver.full_name
        return None

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(BigInteger, default=1, nullable=False)
    price: Mapped[int] = mapped_column(BigInteger, nullable=False)  # Snapshotted price at order time

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product"] = relationship("Product", back_populates="order_items")

    @property
    def product_name(self) -> str | None:
        return self.product.name if self.product else None
