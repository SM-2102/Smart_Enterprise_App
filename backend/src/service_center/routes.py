from typing import List

from fastapi import APIRouter, Body, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from service_center.schemas import ServiceCenterCreate
from service_center.service import ServiceCenterService

service_center_router = APIRouter()
service_center_service = ServiceCenterService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
List all service_center names.
"""


@service_center_router.get(
    "/list_names", response_model=List, status_code=status.HTTP_200_OK
)
async def list_service_center_names(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    asc_names = await service_center_service.list_service_center_names(session)
    return asc_names


"""
Create a new service_center.
"""


@service_center_router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
    dependencies=[role_checker],
)
async def create_service_center(
    data: ServiceCenterCreate,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await service_center_service.create_service_center(session, data.asc_name)
    return JSONResponse(
        content={
            "message": f"Service center created",
        }
    )
