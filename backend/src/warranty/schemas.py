from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class WarrantyCreate(BaseModel):
    srf_number: str = Field(..., max_length=8)
    name: str = Field(..., max_length=40)
    srf_date: date
    head: str = Field(..., max_length=15)
    division: str = Field(..., max_length=15)
    model: str = Field(..., max_length=30)
    serial_number: str = Field(..., max_length=20)
    problem: str = Field(..., max_length=30)
    remark: Optional[str] = Field(None, max_length=40)
    sticker_number: Optional[str] = Field(None, max_length=15)
    asc_name: Optional[str] = Field(None, max_length=30)
    complaint_number: Optional[str] = Field(None, max_length=20)


class WarrantyEnquiry(BaseModel):
    srf_number: str
    srf_date: str
    name: str
    model: str
    head: str
    receive_date: Optional[str]
    repair_date: Optional[str]
    delivery_date: Optional[str]
    contact1: str
    contact2: Optional[str]


class WarrantyPending(BaseModel):
    srf_number: str
    name: str


class WarrantySrfNumber(BaseModel):
    srf_number: str


class WarrantyUpdateResponse(BaseModel):
    srf_number: str
    name: str
    division: str
    model: str
    challan_number: Optional[str]
    challan_date: Optional[str]
    head: str
    repair_date: Optional[date]
    receive_date: Optional[date]
    invoice_number: Optional[str]
    invoice_date: Optional[date]
    delivery_date: Optional[date]
    delivered_by: Optional[str]
    final_remark: Optional[str]
    final_status: str
    srf_date: str
    courier: Optional[str]
    complaint_number: Optional[str]


class WarrantyUpdate(BaseModel):
    repair_date: Optional[date]
    receive_date: Optional[date]
    invoice_number: Optional[str] = Field(None, max_length=16)
    invoice_date: Optional[date]
    delivery_date: Optional[date]
    delivered_by: Optional[str] = Field(None, max_length=20)
    final_remark: Optional[str] = Field(None, max_length=40)
    courier: Optional[str] = Field(None, max_length=15)
    complaint_number: Optional[str] = Field(None, max_length=20)
    final_status: Optional[str] = Field(None, max_length=1)


class WarrantyCNFChallanDetails(BaseModel):
    srf_number: str
    name: str
    model: str
    serial_number: str
    challan: str


class WarrantyCNFRequest(BaseModel):
    division: str


class WarrantyCNFCreate(BaseModel):
    srf_number: str
    challan_number: str = Field(..., max_length=6)
    challan_date: date
    challan: str = Field(..., max_length=1)


class WarrantyCNFChallanCode(BaseModel):
    challan_number: str
