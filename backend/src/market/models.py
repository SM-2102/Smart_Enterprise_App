from datetime import date

import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class Market(SQLModel, table=True):
    __tablename__ = "market"
    mcode: str = Field(primary_key=True, index=True)
    code: str = Field(
        sa_column=Column(
            pg.VARCHAR(5), ForeignKey("master.code"), nullable=False, index=True
        )
    )
    receive_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    division: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=False))
    invoice_number: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=False))
    invoice_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    challan_number: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=True))
    challan_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    quantity: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    delivery_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    delivery_by: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    final_status: str = Field(sa_column=Column(pg.CHAR(1), default="N", nullable=False))
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(15), ForeignKey("users.username"), nullable=False)
    )
    updated_by: str = Field(
        sa_column=Column(pg.VARCHAR(15), ForeignKey("users.username"), nullable=True)
    )

    def __repr__(self):
        return f"<Market {self.mcode} - {self.invoice_number}>"
