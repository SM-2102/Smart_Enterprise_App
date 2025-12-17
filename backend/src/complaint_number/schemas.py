from typing import Optional

from pydantic import BaseModel, Field


class ComplaintNumberSchema(BaseModel):
    complaint_number: str = Field(..., min_length=13, max_length=15)
    status: Optional[str] = Field(..., max_length=10)
    remark: Optional[str] = Field(..., max_length=50)
