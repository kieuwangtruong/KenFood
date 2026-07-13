from fastapi import APIRouter, Depends
from app.routers.deps import get_current_admin
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["Admin Logistics"])

@router.get("/zone-analytics")
async def get_zone_analytics(current_user: User = Depends(get_current_admin)):
    """
    Returns active driver density heatmap analytics by zone.
    Restricted to Admin accounts.
    """
    return {
        "heatmap_data": [
            { "zone": "Cầu Giấy", "density": 88, "status": "high" },
            { "zone": "Đống Đa", "density": 65, "status": "medium" },
            { "zone": "Hai Bà Trưng", "density": 42, "status": "medium" },
            { "zone": "Hoàn Kiếm", "density": 15, "status": "low" },
            { "zone": "Thanh Xuân", "density": 72, "status": "high" }
        ]
    }
