from pydantic import BaseModel, Field

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    price: int = Field(..., gt=0)
    description: str | None = Field(None, max_length=500)
    image_url: str | None = Field(None, max_length=500)
    is_available: bool = True

class ProductResponse(BaseModel):
    id: int
    merchant_id: int
    name: str
    price: int
    description: str | None
    image_url: str | None
    is_available: bool
    category: str | None
    ward: str | None
    merchant_name: str | None = None

    class Config:
        from_attributes = True
