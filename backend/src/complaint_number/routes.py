from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from complaint_number.schemas import ComplaintNumberSchema
from complaint_number.service import ComplaintNumberService
from db.db import get_session

complaint_number_router = APIRouter()
complaint_number_service = ComplaintNumberService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
Upload complaint numbers
"""


@complaint_number_router.post(
    "/upload",
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def upload_complaint_number(
    session: AsyncSession = Depends(get_session),
    file: UploadFile = File(...),
    _=Depends(access_token_bearer),
):
    try:
        result = await complaint_number_service.upload_complaint_number(session, file)
    except Exception as exc:
        return JSONResponse(
            content={
                "message": "Processing failed",
                "resolution": str(exc),
                "type": "error",
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if result.get("type") in ("warning", "error"):
        return JSONResponse(
            content=result,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # Success
    return JSONResponse(
        content=result,
        status_code=status.HTTP_200_OK,
    )


"""
List all complaint numbers.
"""


@complaint_number_router.get(
    "/list_complaints",
    response_model=List[ComplaintNumberSchema],
    status_code=status.HTTP_200_OK,
)
async def list_complaint_numbers(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    complaints = await complaint_number_service.list_complaints(session)
    return complaints
