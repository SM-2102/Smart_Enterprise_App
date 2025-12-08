import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Column, Field, SQLModel


class ServiceCentre(SQLModel, table=True):
    __tablename__ = "service_centre"
    asc_name: str = Field(sa_column=Column(pg.VARCHAR(30), primary_key=True))

    def __repr__(self):
        return f"<ServiceCentre {self.asc_name}>"
