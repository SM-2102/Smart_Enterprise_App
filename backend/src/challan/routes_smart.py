from typing import List

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer
from db.db import get_session

from .schemas import ChallanNextCodeMaxChallanDate, ChallanNumber, CreateChallan
from .service_smart import ChallanSmartService

challan_smart_router = APIRouter()
challan_smart_service = ChallanSmartService()
access_token_bearer = AccessTokenBearer()


"""
Create new Challan after checking master name

"""


@challan_smart_router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_challan(
    challan: CreateChallan,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    new_challan = await challan_smart_service.create_challan(session, challan, token)
    return JSONResponse(
        content={"message": f"Challan Created : {new_challan.challan_number}"}
    )


"""
Get the next available challan code and max challan date
"""


@challan_smart_router.get(
    "/next_code_with_challan_date",
    response_model=ChallanNextCodeMaxChallanDate,
    status_code=status.HTTP_200_OK,
)
async def next_challan_number(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    next_challan_number = await challan_smart_service.next_challan_number(session)
    max_date = await challan_smart_service.challan_max_date(session)
    return {"challan_number": next_challan_number, "challan_date": max_date}


"""
Get the last created challan code.
"""


@challan_smart_router.get("/last_challan_number", status_code=status.HTTP_200_OK)
async def last_challan_number(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    last_challan_number = await challan_smart_service.last_challan_number(session)
    return JSONResponse(content={"last_challan_number": last_challan_number})


"""
Print challan details by code.
"""


@challan_smart_router.post("/print", status_code=status.HTTP_200_OK)
async def print_challan(
    data: ChallanNumber,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    challan_pdf = await challan_smart_service.print_challan(
        data.challan_number, session
    )
    return StreamingResponse(
        challan_pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{data.challan_number}.pdf"'
        },
    )
