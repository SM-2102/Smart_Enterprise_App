from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class ServiceChargeRequest(BaseModel):
    division: str
    sub_division: Optional[str] = None
