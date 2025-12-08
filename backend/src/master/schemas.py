from typing import Optional

from pydantic import BaseModel, Field


class CreateMaster(BaseModel):
    name: str = Field(..., min_length=3, max_length=40)
    address: str = Field(..., max_length=40)
    city: str = Field(..., max_length=20)
    pin: Optional[str] = Field(None, pattern=r"^\d{6}$")
    contact1: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")
    contact2: Optional[str] = Field(None, pattern=r"^\d{10}$")
    gst: Optional[str] = Field(None, pattern=r"^[A-Z0-9]{15}$")
    remark: Optional[str] = Field(None, max_length=50)


class MasterResponse(BaseModel):
    code: str
    name: str
    address: str
    city: str
    pin: Optional[str]
    contact1: str
    contact2: Optional[str]
    gst: Optional[str]
    remark: Optional[str]


class UpdateMaster(CreateMaster):
    pass


class MasterCode(BaseModel):
    code: str


class MasterName(BaseModel):
    name: str


class MasterAddress(BaseModel):
    full_address: str
