from typing import List

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer
from db.db import get_session
from service_charge.schemas import ServiceCharge
from service_charge.service import ServiceChargeService

service_charge_router = APIRouter()
service_charge_service = ServiceChargeService()
access_token_bearer = AccessTokenBearer()


"""
Get Service Charge 
"""


@service_charge_router.post("/service_charge", status_code=status.HTTP_200_OK)
async def service_charge(
    data: ServiceCharge,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    service_charge = await service_charge_service.get_service_charge(data, session)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"service_charge": service_charge},
    )
