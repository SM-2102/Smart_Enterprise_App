from datetime import date
from email.policy import default

import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class Warranty(SQLModel, table=True):
    __tablename__ = "warranty"
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
    sticker_number: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=True))
    asc_name: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    challan_number: str = Field(sa_column=Column(pg.VARCHAR(6), nullable=True))
    challan_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    challan: str = Field(sa_column=Column(pg.CHAR(1), nullable=False, default="N"))
    courier: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=True))
    receive_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    invoice_number: str = Field(sa_column=Column(pg.VARCHAR(16), nullable=True))
    invoice_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    repair_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    delivery_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    delivered_by: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    final_remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    final_status: str = Field(sa_column=Column(pg.CHAR(1), nullable=False, default="N"))
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(15), ForeignKey("users.username"), nullable=False)
    )
    updated_by: str = Field(
        sa_column=Column(pg.VARCHAR(15), ForeignKey("users.username"), nullable=True)
    )

    def __repr__(self):
        return f"<Warranty {self.srf_number} - {self.srf_date}>"
