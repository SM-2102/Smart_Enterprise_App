from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from exceptions import OutOfWarrantyNotFound
from out_of_warranty.schemas import (
    OutOfWarrantyCreate,
    OutOfWarrantyEnquiry,
    OutOfWarrantyPending,
    OutOfWarrantySRFNumber,
    OutOfWarrantySRFNumberList,
    OutOfWarrantySRFSettleRecord,
    OutOfWarrantyUpdate,
    OutOfWarrantyUpdateResponse,
    UpdateSRFFinalSettlement,
    UpdateSRFUnsettled,
)
from out_of_warranty.service import OutOfWarrantyService

out_of_warranty_router = APIRouter()
out_of_warranty_service = OutOfWarrantyService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


# """
# Create new Out Of Warranty record, after checking master name
# """


# @out_of_warranty_router.post("/create", status_code=status.HTTP_201_CREATED)
# async def create_out_of_warranty(
#     out_of_warranty: OutOfWarrantyCreate,
#     session: AsyncSession = Depends(get_session),
#     token=Depends(access_token_bearer),
# ):
#     new_out_of_warranty = await out_of_warranty_service.create_out_of_warranty(
#         session, out_of_warranty, token
#     )
#     return JSONResponse(
#         content={
#             "srf_number": new_out_of_warranty.srf_number,
#             "message": f"SRF Number : {new_out_of_warranty.srf_number}",
#         }
#     )


"""
Get the next available OutOfWarranty code.
"""


@out_of_warranty_router.get("/next_srf_number", status_code=status.HTTP_200_OK)
async def out_of_warranty_next_code(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    out_of_warranty_base = await out_of_warranty_service.warranty_next_code(session)
    return JSONResponse(content={"next_srf_number": out_of_warranty_base})


"""
List all prending out of Out Of Warranty records.
"""


@out_of_warranty_router.get(
    "/list_pending",
    response_model=List[OutOfWarrantyPending],
    status_code=status.HTTP_200_OK,
)
async def list_out_of_warranty_pending(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    pending = await out_of_warranty_service.list_out_of_warranty_pending(session)
    return pending


# """
# Get Out Of Warranty details by srf_number.
# """


# @out_of_warranty_router.post(
#     "/by_srf_number",
#     response_model=OutOfWarrantyUpdateResponse,
#     status_code=status.HTTP_200_OK,
# )
# async def get_out_of_warranty_by_srf_number(
#     data: OutOfWarrantySRFNumber,
#     session: AsyncSession = Depends(get_session),
#     _=Depends(access_token_bearer),
# ):
#     out_of_warranty = await out_of_warranty_service.get_out_of_warranty_by_srf_number(
#         data.srf_number, session
#     )
#     return out_of_warranty


# """
# Update Out Of Warranty details by srf_number.
# """


# @out_of_warranty_router.patch(
#     "/update/{srf_number:path}", status_code=status.HTTP_202_ACCEPTED
# )
# async def update_out_of_warranty(
#     srf_number: str,
#     out_of_warranty: OutOfWarrantyUpdate,
#     session: AsyncSession = Depends(get_session),
#     token=Depends(access_token_bearer),
# ):
#     existing_out_of_warranty = (
#         await out_of_warranty_service.get_out_of_warranty_by_srf_number(
#             srf_number, session
#         )
#     )
#     if not existing_out_of_warranty:
#         raise OutOfWarrantyNotFound()
#     new_out_of_warranty = await out_of_warranty_service.update_out_of_warranty(
#         srf_number, out_of_warranty, session, token
#     )
#     return JSONResponse(
#         content={
#             "message": f"Out Of Warranty Updated : {new_out_of_warranty.srf_number}"
#         }
#     )


"""
Get the last created srf number
"""


@out_of_warranty_router.get("/last_srf_number", status_code=status.HTTP_200_OK)
async def last_srf_number(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    last_srf_number = await out_of_warranty_service.last_srf_number(session)
    return JSONResponse(content={"last_srf_number": last_srf_number})


"""
Print srf by srf number.
"""


@out_of_warranty_router.post("/srf_print", status_code=status.HTTP_200_OK)
async def print_srf(
    data: OutOfWarrantySRFNumber,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    srf_pdf = await out_of_warranty_service.print_srf(data.srf_number, token, session)
    return StreamingResponse(
        srf_pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{data.srf_number}.pdf"'
        },
    )



"""
OutOfWarranty enquiry using query parameters.

 """


@out_of_warranty_router.get(
    "/enquiry",
    response_model=List[OutOfWarrantyEnquiry],
    status_code=status.HTTP_200_OK,
)
async def enquiry_out_of_warranty(
    final_status: Optional[str] = None,
    final_settled: Optional[str] = None,
    vendor_settled: Optional[str] = None,
    name: Optional[str] = None,
    division: Optional[str] = None,
    from_srf_date: Optional[date] = None,
    to_srf_date: Optional[date] = None,
    estimated: Optional[str] = None,
    repaired: Optional[str] = None,
    challaned: Optional[str] = None,
    delivered: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    try:
        result = await out_of_warranty_service.enquiry_out_of_warranty(
            session,
            final_status,
            name,
            division,
            from_srf_date,
            to_srf_date,
            estimated,
            final_settled,
            vendor_settled,
            challaned,
            delivered,
            repaired,
        )
        return result
    except:
        return []


# """
# List distinct received_by names
# """


# @out_of_warranty_router.get(
#     "/list_received_by", response_model=List, status_code=status.HTTP_200_OK
# )
# async def list_received_by(
#     session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
# ):
#     names = await out_of_warranty_service.list_received_by(session)
#     return names



"""
List all unsettled srf records.
"""


@out_of_warranty_router.get(
    "/srf_not_settled",
    response_model=List[OutOfWarrantySRFSettleRecord],
    status_code=status.HTTP_200_OK,
)
async def list_srf_unsettled(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    unsettled = await out_of_warranty_service.list_srf_not_settled(session)
    return unsettled


"""
Update out of warranty srf records - List of Records
"""


@out_of_warranty_router.patch(
    "/update_srf_unsettled", status_code=status.HTTP_202_ACCEPTED
)
async def update_srf_unsettled(
    list_srf: List[UpdateSRFUnsettled],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await out_of_warranty_service.update_srf_unsettled(list_srf, session)
    return JSONResponse(content={"message": f"SRF Records Proposed for Settlement"})


"""
List all final srf settlement records
"""


@out_of_warranty_router.get(
    "/list_of_final_srf_settlement",
    response_model=List[OutOfWarrantySRFSettleRecord],
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def list_final_srf_settlement(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    final_settlement = await out_of_warranty_service.list_final_srf_settlement(session)
    return final_settlement


"""
Update final srf settlement records - List of Records
"""


@out_of_warranty_router.patch(
    "/update_final_srf_settlement",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[role_checker],
)
async def update_final_srf_settlement(
    list_srf: List[UpdateSRFFinalSettlement],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await out_of_warranty_service.update_final_srf_settlement(list_srf, session)
    return JSONResponse(content={"message": f"Vendor Records Settled"})
