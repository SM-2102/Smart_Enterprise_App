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
    complaint_number: Optional[str] = Field(None, max_length=15)
    dealer_name: Optional[str] = Field(None, max_length=30)
    rpm: Optional[int]
    purchase_number: Optional[str] = Field(None, max_length=15)
    purchase_date: Optional[date]
    customer_challan_number: str = Field(..., max_length=15)
    customer_challan_date: date


class WarrantyEnquiry(BaseModel):
    srf_number: str
    srf_date: str
    name: str
    model: str
    serial_number: Optional[str]
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
    srf_date: str
    serial_number: str
    cg_srf_number: Optional[int]
    challan_number: Optional[str]
    challan_date: Optional[str]
    received_by: Optional[str]
    vendor_date2: Optional[date]
    vendor_cost2: Optional[float]
    rewinding_done: str
    repair_date: Optional[date]
    other_cost: Optional[float]
    vendor_paint: str
    vendor_stator: str
    vendor_leg: str
    vendor_paint_cost: Optional[int]
    vendor_stator_cost: Optional[int]
    vendor_leg_cost: Optional[int]
    vendor_cost: Optional[float]
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
    gst: Optional[str]
    gst_amount: Optional[float]
    round_off: Optional[float]
    final_amount: Optional[float]
    receive_amount: Optional[float]
    delivery_date: Optional[date]
    complaint_number: Optional[str]
    pc_number: Optional[int]
    invoice_number: Optional[int]
    dealer_name: Optional[str]
    rpm: Optional[int]
    purchase_number: Optional[str]
    purchase_date: Optional[date]
    customer_challan_number: Optional[str]
    customer_challan_date: Optional[str]
    chargeable: str
    final_status: str


class WarrantyUpdate(BaseModel):
    vendor_date2: Optional[date]
    vendor_cost1: Optional[float]
    vendor_cost2: Optional[float]
    repair_date: Optional[date]
    rewinding_done: str = Field(..., max_length=1)
    rewinding_cost: Optional[float]
    other_cost: Optional[float]
    work_done: Optional[str] = Field(None, max_length=50)
    vendor_paint: str = Field(..., max_length=1)
    vendor_stator: str = Field(..., max_length=1)
    vendor_leg: str = Field(..., max_length=1)
    vendor_paint_cost: Optional[int]
    vendor_stator_cost: Optional[int]
    vendor_leg_cost: Optional[int]
    vendor_cost: Optional[float]
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
    complaint_number: Optional[str] = Field(None, max_length=15)
    cg_srf_number: Optional[int]
    final_status: str = Field(..., max_length=1)
    chargeable: str = Field(..., max_length=1)


class WarrantySRFSettleRecord(BaseModel):
    srf_number: str
    name: str
    model: str
    delivery_date: Optional[date]
    final_amount: Optional[float]
    received_by: Optional[str]
    pc_number: Optional[int]
    invoice_number: Optional[int]


class UpdateSRFUnsettled(BaseModel):
    srf_number: str
    settlement_date: date


class UpdateSRFFinalSettlement(BaseModel):
    srf_number: str
    final_settled: str = Field(..., max_length=1)
