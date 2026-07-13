import enum
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.building import Building
    from app.models.user import User
    from app.models.order import Order


class DeliveryBatchStatus(str, enum.Enum):
    PENDING = "pending"         # Newly created at 10:01 AM, waiting for driver acceptance
    ASSIGNED = "assigned"       # Accepted by a driver (blocked funds locked)
    DELIVERING = "delivering"   # Driver is on the way to pick up / deliver
    COMPLETED = "completed"     # All orders in the batch are delivered
    CANCELLED = "cancelled"     # Batch was aborted

class DeliveryBatch(Base):
    __tablename__ = "delivery_batches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    driver_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id", ondelete="RESTRICT"), nullable=False, index=True)
    status: Mapped[DeliveryBatchStatus] = mapped_column(Enum(DeliveryBatchStatus), default=DeliveryBatchStatus.PENDING, nullable=False)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    building: Mapped["Building"] = relationship("Building", back_populates="delivery_batches")
    driver: Mapped["User"] = relationship("User")
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="batch")
