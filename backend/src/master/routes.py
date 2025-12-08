from typing import List

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer
from db.db import get_session
from exceptions import MasterNotFound
from master.schemas import (
    CreateMaster,
    MasterAddress,
    MasterCode,
    MasterName,
    MasterResponse,
    UpdateMaster,
)
from master.service import MasterService

master_router = APIRouter()
master_service = MasterService()
access_token_bearer = AccessTokenBearer()

"""
Create new Master if master name is not taken.
"""


@master_router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_master(
    master: CreateMaster,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    new_master = await master_service.create_master(session, master, token)
    return JSONResponse(content={"message": f"Master Created : {new_master.name}"})


"""
Get the next available master code.
"""


@master_router.get("/next_code", status_code=status.HTTP_200_OK)
async def master_next_code(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    next_code = await master_service.master_next_code(session)
    return JSONResponse(content={"next_code": next_code})


"""
List all master names.
"""


@master_router.get("/list_names", response_model=List, status_code=status.HTTP_200_OK)
async def list_master_names(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    names = await master_service.list_master_names(session)
    return names


"""
Get master details by code.
"""


@master_router.post(
    "/by_code", response_model=MasterResponse, status_code=status.HTTP_200_OK
)
async def get_master_by_code(
    data: MasterCode,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    master = await master_service.get_master_by_code(data.code, session)
    return master


"""
Get master details by name.
"""


@master_router.post(
    "/by_name", response_model=MasterResponse, status_code=status.HTTP_200_OK
)
async def get_master_by_name(
    data: MasterName,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    master = await master_service.get_master_by_name(data.name, session)
    return master


"""
Update master details by code if master available.
"""


@master_router.patch("/update/{code}", status_code=status.HTTP_202_ACCEPTED)
async def update_master(
    code: str,
    master: UpdateMaster,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    existing_master = await master_service.get_master_by_code(code, session)
    if not existing_master:
        raise MasterNotFound()
    new_master = await master_service.update_master(code, master, session, token)
    return JSONResponse(content={"message": f"Master Updated : {new_master.name}"})


"""
Get master address, city, pin by name
"""


@master_router.post(
    "/fetch_address", response_model=MasterAddress, status_code=status.HTTP_200_OK
)
async def get_master_address_by_name(
    data: MasterName,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    address = await master_service.get_address(data.name, session)
    return {"full_address": address}
