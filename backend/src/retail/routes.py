from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from retail.schemas import (
    RetailCreate,
    RetailEnquiry,
    RetailFinalSettlementResponse,
    RetailNotReceivedResponse,
    RetailPrintResponse,
    RetailRcode,
    RetailUnsettledResponse,
    UpdateRetailFinalSettlement,
    UpdateRetailReceived,
    UpdateRetailUnsettled,
)
from retail.service import RetailService

retail_router = APIRouter()
retail_service = RetailService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
Create new retail record, after checking master name
"""


@retail_router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_retail(
    retail: RetailCreate,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    new_retail = await retail_service.create_retail(session, retail, token)
    return JSONResponse(content={"message": f"Retail Created : {new_retail.rcode}"})


"""
Get the next available retail code.
"""


@retail_router.get("/next_rcode", status_code=status.HTTP_200_OK)
async def retail_next_code(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    next_code = await retail_service.retail_next_code(session)
    return JSONResponse(content={"next_code": next_code})


"""
List all not received retail records.
"""


@retail_router.get(
    "/list_of_not_received",
    response_model=List[RetailNotReceivedResponse],
    status_code=status.HTTP_200_OK,
)
async def list_retail_not_received(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    not_received = await retail_service.list_retail_not_received(session)
    return not_received


"""
Update retail records - List of Records
"""


@retail_router.patch("/update_received", status_code=status.HTTP_202_ACCEPTED)
async def update_received(
    list_retail: List[UpdateRetailReceived],
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    await retail_service.update_received(list_retail, session, token)
    return JSONResponse(content={"message": f"Retail Records Updated"})


"""
List all unsettled retail records.
"""


@retail_router.get(
    "/list_of_unsettled",
    response_model=List[RetailUnsettledResponse],
    status_code=status.HTTP_200_OK,
)
async def list_retail_unsettled(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    unsettled = await retail_service.list_retail_unsettled(session)
    return unsettled


"""
Update retail records - List of Records
"""


@retail_router.patch("/update_unsettled", status_code=status.HTTP_202_ACCEPTED)
async def update_unsettled(
    list_retail: List[UpdateRetailUnsettled],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await retail_service.update_unsettled(list_retail, session)
    return JSONResponse(content={"message": f"Retail Records Proposed for Settlement"})


"""
List all final settlement records
"""


@retail_router.get(
    "/list_of_final_settlement",
    response_model=List[RetailFinalSettlementResponse],
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def list_retail_final_settlement(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    final_settlement = await retail_service.list_retail_final_settlement(session)
    return final_settlement


"""
Update final settlement records - List of Records
"""


@retail_router.patch(
    "/update_final_settlement",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[role_checker],
)
async def update_final_settlement(
    list_retail: List[UpdateRetailFinalSettlement],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await retail_service.update_final_settlement(list_retail, session)
    return JSONResponse(content={"message": f"Retail Records Settled"})


"""
Filter retail enquiry records
"""


@retail_router.get("/enquiry", response_model=List[RetailEnquiry])
async def retail_enquiry(
    name: Optional[str] = None,
    division: Optional[str] = None,
    from_retail_date: Optional[date] = None,
    to_retail_date: Optional[date] = None,
    received: Optional[str] = None,
    final_status: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    try:
        enquiry_list = await retail_service.get_retail_enquiry(
            session,
            name,
            division,
            from_retail_date,
            to_retail_date,
            received,
            final_status,
        )
        return enquiry_list
    except:
        return []


"""
Get retail print details by name (check if customer exists)
"""


@retail_router.get("/show_receipt_names", response_model=List[RetailPrintResponse])
async def retail_print(
    name: str,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):

    print_details = await retail_service.get_retail_print_details(session, name)
    return print_details


"""
Print retail receipt by rcode.
"""


@retail_router.post("/print", status_code=status.HTTP_200_OK)
async def print_retail(
    data: RetailRcode,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    retail_pdf = await retail_service.print_retail(data, session)
    return StreamingResponse(
        retail_pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="retail.pdf"'},
    )
