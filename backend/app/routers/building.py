from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.building import Building
from app.schemas.building import BuildingResponse

router = APIRouter(prefix="/api/buildings", tags=["Buildings"])

@router.get("", response_model=list[BuildingResponse])
async def list_buildings(db: AsyncSession = Depends(get_db)):
    """
    Returns all active buildings.
    If the table is empty, seeds the 4 default locations.
    """
    result = await db.execute(select(Building))
    buildings = result.scalars().all()
    if not buildings:
        # Seed default buildings
        defaults = [
            Building(name="Keangnam Landmark 72", address="Khu đô thị mới Cầu Giấy, Mễ Trì, Nam Từ Liêm, Hà Nội"),
            Building(name="Viettel Complex Tower", address="285 Cách Mạng Tháng Tám, Quận 10, TP. Hồ Chí Minh"),
            Building(name="FPT Tower Cầu Giấy", address="Số 10 Phạm Văn Bạch, Dịch Vọng, Cầu Giấy, Hà Nội"),
            Building(name="Lotte Center Hanoi", address="54 Liễu Giai, Cống Vị, Ba Đình, Hà Nội")
        ]
        db.add_all(defaults)
        await db.commit()
        # Refetch
        result = await db.execute(select(Building))
        buildings = result.scalars().all()
    return buildings
