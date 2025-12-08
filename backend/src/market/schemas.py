from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class CreateMarket(BaseModel):
    name: str = Field(..., min_length=3, max_length=40)
    division: str = Field(..., max_length=15)
    receive_date: date
    invoice_number: str = Field(..., max_length=10)
    invoice_date: date
    challan_number: Optional[str] = Field(None, max_length=10)
    challan_date: Optional[date] = None
    quantity: int = Field(..., ge=1)


class MarketUpdate(BaseModel):
    delivery_date: Optional[date] = None
    delivery_by: Optional[str] = Field(None, max_length=20)
    remark: Optional[str] = Field(None, max_length=40)
    final_status: Optional[str] = Field(None, max_length=1)


class MarketResponse(BaseModel):
    mcode: str
    name: str
    division: str
    receive_date: date
    invoice_number: str
    invoice_date: date
    quantity: int
    delivery_date: Optional[date] = None
    delivery_by: Optional[str] = None
    remark: Optional[str] = None
    final_status: Optional[str] = None


class MarketPending(BaseModel):
    id: str
    name: str


class MarketCode(BaseModel):
    mcode: str


class MarketEnquiry(BaseModel):
    mcode: str
    name: str
    contact1: str
    contact2: Optional[str] = None
    division: str
    invoice_number: str
    invoice_date: str
    quantity: int
    delivery_date: Optional[str] = None
    delivery_by: Optional[str] = None
