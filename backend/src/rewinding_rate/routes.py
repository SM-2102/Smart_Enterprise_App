from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer
from db.db import get_session
from rewinding_rate.schemas import RewindingCharge
from rewinding_rate.service import RewindingRateService

rewinding_rate_router = APIRouter()
rewinding_rate_service = RewindingRateService()
access_token_bearer = AccessTokenBearer()


"""
Get rewinding rate details for rewinding_rate creation
"""


@rewinding_rate_router.post("/rewinding_rate", status_code=status.HTTP_200_OK)
async def rewinding_rate_for_model(
    data: RewindingCharge,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):

    rewinding_cost = await rewinding_rate_service.get_rewinding_rate(session, data)
    return JSONResponse(content={"rewinding_cost": rewinding_cost})
