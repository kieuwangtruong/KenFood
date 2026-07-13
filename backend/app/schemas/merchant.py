from pydantic import BaseModel, Field

class MerchantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=50)
    address: str | None = Field(None, max_length=500)
    commission_rate: float = Field(0.15, ge=0.0, le=1.0)

class MerchantResponse(BaseModel):
    id: int
    user_id: int
    name: str
    phone: str | None
    address: str | None
    commission_rate: float

    class Config:
        from_attributes = True
