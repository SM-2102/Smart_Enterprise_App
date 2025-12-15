from typing import Optional
from pydantic import BaseModel, Field

class ModelRequest(BaseModel):
    division: str
    model: str

class RewindingCharge(BaseModel):
    division: str
    frame: Optional[str]
    hp_rating: Optional[float]
    rewinding_type: Optional[str]

class CreateModel(BaseModel):
    model: str = Field(..., max_length=30)
    division: str = Field(..., max_length=15)
    frame: Optional[str] = Field(..., max_length=10)
    winding_type: Optional[str] = Field(..., max_length=15)
    hp_rating: Optional[float]
    rewinding_charge: int
    
