from datetime import date

import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Column, Field, SQLModel


class ServiceCharge(SQLModel, table=True):
    __tablename__ = "service_charge"
    id: int = Field(sa_column=Column(pg.INTEGER, primary_key=True, autoincrement=True))
    division: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=False))
    sub_division: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=True))
    service_charge: int = Field(sa_column=Column(pg.INTEGER, nullable=False))

    def __repr__(self):
        return f"<ServiceCharge {self.division} - {self.head}>"
