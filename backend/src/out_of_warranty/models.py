from datetime import date
from email.policy import default

import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class OutOfWarranty(SQLModel, table=True):
    _tablename_ = "out_of_warranty"
    srf_number: str = Field(primary_key=True, index=True)
    code: str = Field(
        sa_column=Column(
            pg.VARCHAR(5), ForeignKey("master.code"), nullable=False, index=True
        )
    )
    srf_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    head: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=False))
    division: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=False))
    model: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=False))
    serial_number: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=False))
    problem: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=False))
    remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    complaint_number: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    challan_number: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=False))
    challan_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    challan: str = Field(sa_column=Column(pg.VARCHAR(1), nullable=False, default="N"))
    service_charge: float = Field(sa_column=Column(pg.FLOAT, nullable=False, default=0))
    receive_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    customer_invoice_number: str = Field(sa_column=Column(pg.VARCHAR(16), nullable=True))
    rewinding_done: str = Field(sa_column=Column(pg.CHAR(1), nullable=False, default="N"))
    rewinding_cost: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    vendor_date2: date = Field(sa_column=Column(pg.DATE, nullable=True))
    received_by: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    vendor_cost1: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    vendor_cost2: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    vendor_bill_number: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=True))
    settlement_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    vendor_settlement_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    invoice_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    repair_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    vendor_paint: str = Field(
        sa_column=Column(pg.VARCHAR(1), nullable=False, default="N")
    )
    vendor_stator: str = Field(
        sa_column=Column(pg.VARCHAR(1), nullable=False, default="N")
    )
    vendor_leg: str = Field(
        sa_column=Column(pg.VARCHAR(1), nullable=False, default="N")
    )
    vendor_paint_cost: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    vendor_stator_cost: int = Field(sa_column=Column(pg.INTEGER, nullable=True)) 
    vendor_leg_cost: int = Field(sa_column=Column(pg.INTEGER, nullable=True)) 
    vendor_cost: float = Field(sa_column=Column(pg.FLOAT, nullable=True))    
    paint_cost: int = Field(sa_column=Column(pg.INTEGER, nullable=True))  
    stator_cost: int = Field(sa_column=Column(pg.INTEGER, nullable=True))  
    leg_cost: int = Field(sa_column=Column(pg.INTEGER, nullable=True))  
    spare1: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    cost1: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    spare2: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    cost2: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    spare3: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    cost3: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    spare4: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    cost4: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    spare5: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    cost5: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    spare6: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    cost6: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    spare_cost: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    godown_cost: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    other_cost: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    discount: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    total: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    gst: str = Field(sa_column=Column(pg.CHAR(1), nullable=False, default="N"))
    gst_amount: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    final_amount: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    round_off: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    dealer_name: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    rpm: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    purchase_number: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=True))
    purchase_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    customer_challan_number: str = Field(sa_column=Column(pg.VARCHAR(6), nullable=True))
    customer_challan_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    receive_amount: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    delivery_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    delivered_by: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    collection_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    work_done: str = Field(sa_column=Column(pg.VARCHAR(50), nullable=True))
    final_status: str = Field(sa_column=Column(pg.CHAR(1), nullable=False, default="N"))
    pc_number: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    invoice_number: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("users.username"), nullable=False)
    )
    updated_by: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("users.username"), nullable=True)
    )
    service_charge_waive: str = Field(
        sa_column=Column(pg.VARCHAR(1), nullable=False, default="N")
    )
    waive_details: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    vendor_settled: str = Field(
        sa_column=Column(pg.VARCHAR(1), nullable=False, default="N")
    )
    estimate_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    user_settlement_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    final_settled: str = Field(
        sa_column=Column(pg.VARCHAR(1), nullable=False, default="N")
    )

    def _repr_(self):
        return f"<Out Of Warranty {self.srf_number} - {self.srf_date}>"