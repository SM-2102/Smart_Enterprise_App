from typing import Optional
from pydantic import BaseModel, Field

class RewindingCharge(BaseModel):
    division: str
    frame: Optional[str]
    hp_rating: Optional[float]
    winding_type: Optional[str]