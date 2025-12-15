import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class Model(SQLModel, table=True):
    __tablename__ = "model"
    model: str = Field(
        sa_column=Column("model", pg.VARCHAR(30), primary_key=True, index=True)
    )
    division: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=False))
    frame: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=True))
    winding_type: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=True))
    hp_rating: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    rewinding_charge: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("users.username"), nullable=False)
    )

    def __repr__(self):
        return f"<Model {self.division} - {self.model}>"
