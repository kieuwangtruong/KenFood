from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=list[ProductResponse])
async def list_products(db: AsyncSession = Depends(get_db)):
    """
    Returns all active products with their merchant names.
    """
    result = await db.execute(
        select(Product).options(selectinload(Product.merchant)).where(Product.is_available == True)
    )
    products = result.scalars().all()
    
    response = []
    for p in products:
        response.append(
            ProductResponse(
                id=p.id,
                merchant_id=p.merchant_id,
                name=p.name,
                price=p.price,
                description=p.description,
                image_url=p.image_url,
                is_available=p.is_available,
                category=p.category,
                ward=p.ward,
                merchant_name=p.merchant.name if p.merchant else None
            )
        )
    return response
