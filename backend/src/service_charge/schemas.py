from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class ServiceCharge(BaseModel):
    division: str
    head: Optional[str] = None
