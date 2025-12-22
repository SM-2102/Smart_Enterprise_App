from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class RetailCreate(BaseModel):
    retail_date: date
    name: str = Field(..., min_length=3, max_length=40)
    division: str = Field(..., max_length=20)
    details: str = Field(..., max_length=50)
    amount: int = Field(..., ge=1)
    received: str = Field(..., max_length=1)


class RetailNotReceivedResponse(BaseModel):
    rcode: str
    name: str
    contact1: str
    contact2: Optional[str] = None
    details: str
    amount: int
    received: str


class UpdateRetailReceived(BaseModel):
    rcode: str
    received: str = Field(..., max_length=1)


class RetailUnsettledResponse(BaseModel):
    rcode: str
    name: str
    details: str
    amount: int
    received: str


class UpdateRetailUnsettled(BaseModel):
    rcode: str
    received: str = Field(..., max_length=1)
    settlement_date: date


class RetailFinalSettlementResponse(BaseModel):
    rcode: str
    name: str
    retail_date: str
    details: str
    amount: int
    received_by: str


class UpdateRetailFinalSettlement(BaseModel):
    rcode: str
    amount: int
    final_status: str = Field(..., max_length=1)


class RetailEnquiry(BaseModel):
    rcode: str
    name: str
    retail_date: str
    division: str
    details: str
    amount: int
    received: str
    final_status: str


class RetailPrintResponse(BaseModel):
    rcode: str
    retail_date: str
    details: str
    amount: int


class RetailRcode(BaseModel):
    rcode: List[str]
