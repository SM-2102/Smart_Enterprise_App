from pydantic import BaseModel, Field


class ModelRequest(BaseModel):
    division: str
    model: str
