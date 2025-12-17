from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from exceptions import WarrantyNotFound
from warranty.schemas import (
    WarrantyCreate,
    WarrantyEnquiry,
    WarrantyPending,
    WarrantySrfNumber,
    WarrantyUpdate,
    WarrantyUpdateResponse,
    WarrantySRFSettleRecord,
    UpdateSRFUnsettled,
    UpdateSRFFinalSettlement,
)
from warranty.service import WarrantyService

warranty_router = APIRouter()
warranty_service = WarrantyService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
Create new warranty record, after checking master name and ASC name
"""


@warranty_router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_warranty(
    warranty: WarrantyCreate,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    new_warranty = await warranty_service.create_warranty(session, warranty, token)
    return JSONResponse(
        content={
            "srf_number": new_warranty.srf_number,
            "message": f"SRF Number : {new_warranty.srf_number}",
        }
    )


"""
Get the next available warranty code.
"""


@warranty_router.get("/next_srf_number", status_code=status.HTTP_200_OK)
async def warranty_next_code(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    warranty_base = await warranty_service.warranty_next_code(session)
    return JSONResponse(content={"next_srf_number": warranty_base})


"""
List all not received warranty records.
"""


@warranty_router.get(
    "/list_pending",
    response_model=List[WarrantyPending],
    status_code=status.HTTP_200_OK,
)
async def list_warranty_pending(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    pending = await warranty_service.list_warranty_pending(session)
    return pending


"""
Get warranty details by srf_number.
"""


@warranty_router.post(
    "/by_srf_number",
    response_model=WarrantyUpdateResponse,
    status_code=status.HTTP_200_OK,
)
async def get_warranty_by_srf_number(
    data: WarrantySrfNumber,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    warranty = await warranty_service.get_warranty_by_srf_number(
        data.srf_number, session
    )
    return warranty


"""
Update warranty details by srf_number.
"""


@warranty_router.patch(
    "/update/{srf_number:path}", status_code=status.HTTP_202_ACCEPTED
)
async def update_warranty(
    srf_number: str,
    warranty: WarrantyUpdate,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    existing_warranty = await warranty_service.get_warranty_by_srf_number(
        srf_number, session
    )
    if not existing_warranty:
        raise WarrantyNotFound()
    new_warranty = await warranty_service.update_warranty(
        srf_number, warranty, session, token
    )
    return JSONResponse(
        content={"message": f"Warranty Updated : {new_warranty.srf_number}"}
    )


"""
List distinct delivered_by names
"""


@warranty_router.get(
    "/list_delivered_by", response_model=List, status_code=status.HTTP_200_OK
)
async def list_delivered_by(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    names = await warranty_service.list_delivered_by(session)
    return names


"""
Get the last created srf number
"""


@warranty_router.get("/last_srf_number", status_code=status.HTTP_200_OK)
async def last_srf_number(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    last_srf_number = await warranty_service.last_srf_number(session)
    return JSONResponse(content={"last_srf_number": last_srf_number})


"""
Print srf by srf number.
"""


@warranty_router.post("/srf_print", status_code=status.HTTP_200_OK)
async def print_srf(
    data: WarrantySrfNumber,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    srf_pdf = await warranty_service.print_srf(data.srf_number, token, session)
    return StreamingResponse(
        srf_pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{data.srf_number}.pdf"'
        },
    )


"""
Warranty enquiry using query parameters.

 """


@warranty_router.get(
    "/enquiry", response_model=List[WarrantyEnquiry], status_code=status.HTTP_200_OK
)
async def enquiry_warranty(
    final_status: Optional[str] = None,
    vendor_settled: Optional[str] = None,
    name: Optional[str] = None,
    division: Optional[str] = None,
    from_srf_date: Optional[date] = None,
    to_srf_date: Optional[date] = None,
    serial_number: Optional[str] = None,
    delivered: Optional[str] = None,
    received: Optional[str] = None,
    repaired: Optional[str] = None,
    head: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    try:
        result = await warranty_service.enquiry_warranty(
            session,
            final_status,
            vendor_settled,
            name,
            division,
            from_srf_date,
            to_srf_date,
            serial_number,
            delivered,
            received,
            repaired,
            head,
        )
        return result
    except:
        return []

"""
List all unsettled srf records.
"""


@warranty_router.get(
    "/srf_not_settled",
    response_model=List[WarrantySRFSettleRecord],
    status_code=status.HTTP_200_OK,
)
async def list_srf_unsettled(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    unsettled = await warranty_service.list_srf_not_settled(session)
    return unsettled


"""
Update out of warranty srf records - List of Records
"""


@warranty_router.patch(
    "/update_srf_unsettled", status_code=status.HTTP_202_ACCEPTED
)
async def update_srf_unsettled(
    list_srf: List[UpdateSRFUnsettled],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await warranty_service.update_srf_unsettled(list_srf, session)
    return JSONResponse(content={"message": f"SRF Records Proposed for Settlement"})


"""
List all final srf settlement records
"""


@warranty_router.get(
    "/list_of_final_srf_settlement",
    response_model=List[WarrantySRFSettleRecord],
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def list_final_srf_settlement(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    final_settlement = await warranty_service.list_final_srf_settlement(session)
    return final_settlement


"""
Update final srf settlement records - List of Records
"""


@warranty_router.patch(
    "/update_final_srf_settlement",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[role_checker],
)
async def update_final_srf_settlement(
    list_srf: List[UpdateSRFFinalSettlement],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await warranty_service.update_final_srf_settlement(list_srf, session)
    return JSONResponse(content={"message": f"Vendor Records Settled"})
