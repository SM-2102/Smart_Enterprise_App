from datetime import date
from email.policy import default

import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class OutOfWarranty(SQLModel, table=True):
    __tablename__ = "out_of_warranty"

    srf_number: str = Field(primary_key=True, index=True)
    srf_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    code: str = Field(
        sa_column=Column(
            pg.VARCHAR(5), ForeignKey("master.code"), nullable=False, index=True
        )
    )
    division: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=False))
    # FANS, PUMP, LIGHT, SDA, IWH, SWH, COOLER, OTHERS
    head: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    service_charge: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    service_charge_waive: str = Field(
        sa_column=Column(pg.CHAR(1), nullable=False, default="N")
    )
    collection_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    waive_details: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    model: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=False))
    serial_number: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=False))
    problem: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    challan_number: str = Field(sa_column=Column(pg.VARCHAR(6), nullable=True))
    # V00001, V0002
    challan_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    challan: str = Field(sa_column=Column(pg.CHAR(1), nullable=False, default="N"))
    received_by: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    estimate_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    vendor_date1: date = Field(sa_column=Column(pg.DATE, nullable=True))
    vendor_date2: date = Field(sa_column=Column(pg.DATE, nullable=True))
    vendor_cost1: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    vendor_cost2: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    vendor_settlement_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    vendor_settled: str = Field(
        sa_column=Column(pg.VARCHAR(1), nullable=False, default="N")
    )
    repair_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    work_done: str = Field(sa_column=Column(pg.VARCHAR(50), nullable=True))
    rewinding_cost: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    other_cost: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
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
    discount: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    total: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    gst: str = Field(sa_column=Column(pg.CHAR(1), nullable=False, default="N"))
    gst_amount: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    final_amount: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    round_off: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    receive_amount: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    delivery_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    pc_number: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    invoice_number: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    vendor_bill_number: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=True))
    final_status: str = Field(
        sa_column=Column(pg.VARCHAR(1), nullable=False, default="N")
    )
    settlement_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    final_settled: str = Field(
        sa_column=Column(pg.VARCHAR(1), nullable=False, default="N")
    )
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(15), ForeignKey("users.username"), nullable=False)
    )
    updated_by: str = Field(
        sa_column=Column(pg.VARCHAR(15), ForeignKey("users.username"), nullable=True)
    )

    def __repr__(self):
        return f"<Out of Warranty {self.srf_number} - {self.srf_date}>"
