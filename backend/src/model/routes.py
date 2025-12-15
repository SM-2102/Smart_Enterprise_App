from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer
from db.db import get_session
from model.schemas import ModelRequest, RewindingCharge, CreateModel
from model.service import ModelService

model_router = APIRouter()
model_service = ModelService()
access_token_bearer = AccessTokenBearer()

"""
Get rewinding rate details by division and model
"""


# @model_router.post("/rewinding-rate-for-update", status_code=status.HTTP_200_OK)
# async def get_rewinding_rate_for_updation(
#     data: ModelRequest,
#     session: AsyncSession = Depends(get_session),
#     _=Depends(access_token_bearer),
# ):

#     rewinding_cost = await model_service.get_rewinding_rate(session, data.division, data.model)
#     return JSONResponse(content={"rewinding_cost": rewinding_cost})

"""
Create new Model if model not present.
"""


@model_router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_model(
    model: CreateModel,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    new_model = await model_service.create_model(session, model, token)
    return JSONResponse(content={"message": f"Model Created : {new_model.model}"})