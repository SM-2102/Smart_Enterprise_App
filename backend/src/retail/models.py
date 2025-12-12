from datetime import date

import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class Retail(SQLModel, table=True):
    __tablename__ = "retail"
    rcode: str = Field(primary_key=True, index=True)
    retail_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    division: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=False))
    # 'FANS','PUMP','LIGHT','SDA','IWH','SWH','COOLER','OTHERS'
    code: str = Field(
        sa_column=Column(
            pg.VARCHAR(5), ForeignKey("master.code"), nullable=False, index=True
        )
    )
    details: str = Field(sa_column=Column(pg.VARCHAR(50), nullable=False))
    amount: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    received: str = Field(sa_column=Column(pg.CHAR(1), nullable=False, default="N"))
    settlement_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    final_status: str = Field(sa_column=Column(pg.CHAR(1), nullable=False, default="N"))
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(15), ForeignKey("users.username"), nullable=False)
    )
    updated_by: str = Field(
        sa_column=Column(pg.VARCHAR(15), ForeignKey("users.username"), nullable=True)
    )

    def __repr__(self):
        return f"<Retail {self.rcode} - {self.details}>"
