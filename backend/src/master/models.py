import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class Master(SQLModel, table=True):
    __tablename__ = "master"
    code: str = Field(primary_key=True, index=True)
    name: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False, unique=True))
    address: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False))
    city: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=False))
    pin: str = Field(sa_column=Column(pg.VARCHAR(6), nullable=True))
    contact1: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=True))
    contact2: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=True))
    gst: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=True))
    remark: str = Field(sa_column=Column(pg.VARCHAR(50), nullable=True))
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(20), ForeignKey("users.username"), nullable=False)
    )
    updated_by: str = Field(
        sa_column=Column(pg.VARCHAR(20), ForeignKey("users.username"), nullable=True)
    )

    def __repr__(self):
        return f"<Master {self.code} - {self.name}>"
