from datetime import date

import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class ChallanUnique(SQLModel, table=True):
    __tablename__ = "challan_unique"
    challan_number: str = Field(primary_key=True, index=True)
    code: str = Field(
        sa_column=Column(
            pg.VARCHAR(5), ForeignKey("master.code"), nullable=False, index=True
        )
    )
    challan_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    desc1: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=False))
    qty1: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    unit1: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=False))
    desc2: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty2: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    unit2: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=True))
    desc3: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty3: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    unit3: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=True))
    desc4: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty4: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    unit4: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=True))
    desc5: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty5: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    unit5: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=True))
    desc6: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty6: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    unit6: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=True))
    desc7: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty7: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    unit7: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=True))
    desc8: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty8: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    unit8: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=True))
    order_number: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=True))
    order_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    invoice_number: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=True))
    invoice_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    remark: str = Field(sa_column=Column(pg.VARCHAR(50), nullable=False))
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(15), ForeignKey("users.username"), nullable=False)
    )

    def __repr__(self):
        return f"<Challan {self.challan_number} - {self.challan_date}>"
