import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import ForeignKey, Identity
from sqlmodel import Column, Field, SQLModel


class RewindingRate(SQLModel, table=True):
    __tablename__ = "rewinding_rate"
    id: int = Field(
        sa_column=Column(
            pg.INTEGER,
            Identity(always=False),  # this makes id auto-increment in PostgreSQL
            primary_key=True,
        )
    )
    division: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=False))
    frame: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=True))
    winding_type: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=True))
    hp_rating: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    rewinding_charge: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    paint_charge: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    leg_charge: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    stator_charge: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("users.username"), nullable=False)
    )

    def __repr__(self):
        return f"<Rewinding Rate {self.division}>"
