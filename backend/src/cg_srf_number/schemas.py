from typing import Optional

from pydantic import BaseModel, Field


class CGSRFNumberSchema(BaseModel):
    cg_srf_number: int
