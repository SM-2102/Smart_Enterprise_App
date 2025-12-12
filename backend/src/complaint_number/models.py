import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Column, Field, SQLModel


class ComplaintNumber(SQLModel, table=True):
    __tablename__ = "complaint_number"
    complaint_number: str = Field(sa_column=Column(pg.VARCHAR(15), primary_key=True))
    status: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=True))
    remark: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))

    def __repr__(self):
        return f"<Complaint Number {self.complaint_number}>"
