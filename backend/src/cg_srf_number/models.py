import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Column, Field, SQLModel


class CGSRFNumber(SQLModel, table=True):
    __tablename__ = "cg_srf_number"
    cg_srf_number: int = Field(sa_column=Column(pg.INTEGER, primary_key=True))

    def __repr__(self):
        return f"<CGSRF Number {self.cg_srf_number}>"
