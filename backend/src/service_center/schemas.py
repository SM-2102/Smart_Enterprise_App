from pydantic import BaseModel


class ServiceCenterCreate(BaseModel):
    asc_name: str
