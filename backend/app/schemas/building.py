from pydantic import BaseModel, Field

class BuildingCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    address: str | None = Field(None, max_length=500)

class BuildingResponse(BaseModel):
    id: int
    name: str
    address: str | None

    class Config:
        from_attributes = True
