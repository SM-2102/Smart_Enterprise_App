from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from vendor.service import VendorService
from vendor.schemas import (
    UpdateVendorFinalSettlement,
    VendorChallanDetails,
    VendorChallanCreate,
    VendorChallanCode,
    VendorFinalSettlementRecord,
    VendorNotSettledRecord,
    UpdateVendorUnsettled,
)

vendor_router = APIRouter()
vendor_service = VendorService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
Get the next available challan code
"""


@vendor_router.get("/next_vendor_challan_code", status_code=status.HTTP_200_OK)
async def next_vendor_challan_code(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    challan_number = await vendor_service.next_vendor_challan_code(session)
    return JSONResponse(content={"next_vendor_challan_code": challan_number})


"""
Get the last created challan code.
"""


@vendor_router.get("/last_vendor_challan_code", status_code=status.HTTP_200_OK)
async def last_vendor_challan_code(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    last_challan_number = await vendor_service.last_vendor_challan_code(
        session
    )
    return JSONResponse(content={"last_vendor_challan_code": last_challan_number})


"""
List vendor Challan Details
"""


@vendor_router.get(
    "/list_vendor_challan_details",
    response_model=List[VendorChallanDetails],
    status_code=status.HTTP_200_OK,
)
async def list_vendor_challan_details(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    vendor_list = await vendor_service.list_vendor_challan_details(session)
    return vendor_list


"""
Update retail records - List of Records
"""


@vendor_router.patch(
    "/create_vendor_challan", status_code=status.HTTP_202_ACCEPTED
)
async def create_vendor_challan(
    list_vendor: List[VendorChallanCreate],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await vendor_service.create_vendor_challan(list_vendor, session)
    return JSONResponse(content={"message": f"Vendor Challan Records Updated"})


"""
Print vendor challan by challan number.
"""


@vendor_router.post("/vendor_challan_print", status_code=status.HTTP_200_OK)
async def print_vendor_challan(
    data: VendorChallanCode,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    vendor_pdf = await vendor_service.print_vendor_challan(
        data.challan_number, token, session
    )
    return StreamingResponse(
        vendor_pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{data.challan_number}.pdf"'
        },
    )


"""
List distinct received_by names
"""


@vendor_router.get(
    "/list_received_by", response_model=List, status_code=status.HTTP_200_OK
)
async def list_received_by(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    names = await vendor_service.list_received_by(session)
    return names


"""
List all unsettled vendor records.
"""


@vendor_router.get(
    "/vendor_not_settled",
    response_model=List[VendorNotSettledRecord],
    status_code=status.HTTP_200_OK,
)
async def list_vendor_unsettled(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    unsettled = await vendor_service.list_vendor_not_settled(session)
    return unsettled


"""
Update out of warranty vendor records - List of Records
"""


@vendor_router.patch(
    "/update_vendor_unsettled", status_code=status.HTTP_202_ACCEPTED
)
async def update_vendor_unsettled(
    list_vendor: List[UpdateVendorUnsettled],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await vendor_service.update_vendor_unsettled(list_vendor, session)
    return JSONResponse(content={"message": f"Vendor Records Proposed for Settlement"})


"""
List all final vendor settlement records
"""


@vendor_router.get(
    "/list_of_final_vendor_settlement",
    response_model=List[VendorFinalSettlementRecord],
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def list_final_vendor_settlement(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    final_settlement = await vendor_service.list_final_vendor_settlement(
        session
    )
    return final_settlement


"""
Update final vendor settlement records - List of Records
"""


@vendor_router.patch(
    "/update_final_vendor_settlement",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[role_checker],
)
async def update_final_vendor_settlement(
    list_vendor: List[UpdateVendorFinalSettlement],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await vendor_service.update_final_vendor_settlement(list_vendor, session)
    return JSONResponse(content={"message": f"Vendor Records Settled"})

