from datetime import date
from email.policy import default
from typing import List, Optional

import sqlalchemy.dialects.postgresql as pg
from pydantic import BaseModel, Field
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class OutOfWarrantyCreate(BaseModel):
    srf_number: str = Field(..., max_length=8)
    name: str = Field(..., max_length=30)
    customer_challan_number: str = Field(..., max_length=6)
    customer_challan_date: date
    division: str = Field(..., max_length=15)
    head: str = Field(..., max_length=15)
    srf_date: date
    model: str = Field(..., max_length=30)
    serial_number: str = Field(..., max_length=15)
    problem: str = Field(None, max_length=30)
    complaint_number: Optional[str] = Field(None, max_length=20)
    remark: Optional[str] = Field(None, max_length=40)
    service_charge: int
    service_charge_waive: str = Field(..., max_length=1)
    collection_date: Optional[date]
    waive_details: Optional[str] = Field(None, max_length=40)


class OutOfWarrantyPending(BaseModel):
    srf_number: str
    name: str


class OutOfWarrantySRFNumber(BaseModel):
    srf_number: str


class OutOfWarrantyUpdateResponse(BaseModel):
    srf_number: str
    name: str
    model: str
    srf_date: str
    serial_number: str
    service_charge: int
    customer_challan_number: str
    customer_challan_date: str
    challan_number: Optional[str]
    received_by: Optional[str]
    challan_date: Optional[date]
    vendor_cost1: Optional[float]
    vendor_date2: Optional[date]
    vendor_cost2: Optional[float]
    estimate_date: Optional[date]
    repair_date: Optional[date]
    rewinding_cost: Optional[float]
    other_cost: Optional[float]
    work_done: Optional[str]
    spare1: Optional[str]
    cost1: Optional[float]
    spare2: Optional[str]
    cost2: Optional[float]
    spare3: Optional[str]
    cost3: Optional[float]
    spare4: Optional[str]
    cost4: Optional[float]
    spare5: Optional[str]
    cost5: Optional[float]
    spare6: Optional[str]
    cost6: Optional[float]
    spare_cost: Optional[float]
    godown_cost: Optional[float]
    discount: Optional[float]
    total: Optional[float]
    gst: str
    gst_amount: Optional[float]
    round_off: Optional[float]
    final_amount: Optional[float]
    receive_amount: Optional[float]
    delivery_date: Optional[date]
    pc_number: Optional[int]
    invoice_number: Optional[int]
    final_status: str


class OutOfWarrantyUpdate(BaseModel):
    vendor_date2: Optional[date]
    vendor_cost1: Optional[float]
    vendor_cost2: Optional[float]
    estimate_date: Optional[date]
    repair_date: Optional[date]
    rewinding_cost: Optional[float]
    other_cost: Optional[float]
    work_done: Optional[str] = Field(None, max_length=50)
    spare1: Optional[str] = Field(None, max_length=20)
    cost1: Optional[float]
    spare2: Optional[str] = Field(None, max_length=20)
    cost2: Optional[float]
    spare3: Optional[str] = Field(None, max_length=20)
    cost3: Optional[float]
    spare4: Optional[str] = Field(None, max_length=20)
    cost4: Optional[float]
    spare5: Optional[str] = Field(None, max_length=20)
    cost5: Optional[float]
    spare6: Optional[str] = Field(None, max_length=20)
    cost6: Optional[float]
    spare_cost: Optional[float]
    godown_cost: Optional[float]
    discount: Optional[float]
    total: Optional[float]
    gst: str = Field(..., max_length=1)
    gst_amount: Optional[float]
    round_off: Optional[float]
    final_amount: Optional[float]
    receive_amount: Optional[float]
    delivery_date: Optional[date]
    pc_number: Optional[int]
    invoice_number: Optional[int]
    final_status: str = Field(..., max_length=1)


class OutOfWarrantySRFSettleRecord(BaseModel):
    srf_number: str
    name: str
    model: str
    delivery_date: Optional[date]
    final_amount: Optional[float]
    received_by: Optional[str]
    pc_number: Optional[int]
    invoice_number: Optional[int]
    service_charge: Optional[float]
    waive_details: Optional[str]


class UpdateSRFUnsettled(BaseModel):
    srf_number: str
    settlement_date: date


class UpdateSRFFinalSettlement(BaseModel):
    srf_number: str
    final_settled: str = Field(..., max_length=1)


class OutOfWarrantyEnquiry(BaseModel):
    srf_number: str
    srf_date: str
    name: str
    model: str
    estimate_date: Optional[str]
    repair_date: Optional[str]
    challan_date: Optional[str]
    delivery_date: Optional[str]
    final_amount: Optional[float]
    contact1: str
    contact2: Optional[str]


class OutOfWarrantyEstimatePrintResponse(BaseModel):
    srf_number: str
    srf_date: str
    model: str
    total: str


class OutOfWarrantySRFNumberList(BaseModel):
    srf_number: List[str]
