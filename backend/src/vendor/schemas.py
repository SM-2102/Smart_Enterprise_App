from datetime import date
from email.policy import default
from typing import List, Optional

import sqlalchemy.dialects.postgresql as pg
from pydantic import BaseModel, Field
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class VendorChallanDetails(BaseModel):
    srf_number: str
    division: str
    model: str
    serial_number: str
    challan: str


class VendorChallanCreate(BaseModel):
    srf_number: str
    challan_number: str = Field(..., max_length=6)
    challan_date: date
    challan: str = Field(..., max_length=1)
    received_by: str = Field(..., max_length=20)


class VendorChallanCode(BaseModel):
    challan_number: str


class VendorNotSettledRecord(BaseModel):
    srf_number: str
    name: str
    model: str
    complaint_number: Optional[str]
    vendor_cost1: Optional[float]
    vendor_cost2: Optional[float]
    vendor_paint_cost: Optional[float]
    vendor_stator_cost: Optional[float]
    vendor_leg_cost: Optional[float]
    vendor_cost: float
    vendor_bill_number: Optional[str]


class UpdateVendorUnsettled(BaseModel):
    srf_number: str
    vendor_bill_number: str = Field(..., max_length=8)
    vendor_settlement_date: date


class VendorFinalSettlementRecord(BaseModel):
    srf_number: str
    name: str
    model: str
    complaint_number: Optional[str]
    vendor_cost1: Optional[float]
    vendor_cost2: Optional[float]
    vendor_paint_cost: Optional[float]
    vendor_stator_cost: Optional[float]
    vendor_leg_cost: Optional[float]
    vendor_cost: float

class UpdateVendorFinalSettlement(BaseModel):
    srf_number: str
    vendor_settled: str = Field(..., max_length=1)
