from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer
from db.db import get_session
from model.schemas import ModelRequest, RewindingCharge, CreateModel, ModelList, CostDetails
from model.service import ModelService

model_router = APIRouter()
model_service = ModelService()
access_token_bearer = AccessTokenBearer()

"""
Get rewinding rate, paint, stator and leg cost details by division and model
"""


@model_router.post("/cost_details", status_code=status.HTTP_200_OK, response_model=CostDetails)
async def cost_details(
    data: ModelRequest,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):

    cost_details = await model_service.get_cost_details(session, data.division, data.model)
    return cost_details

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

"""
Get model list
"""


@model_router.post("/model_list", status_code=status.HTTP_200_OK)
async def model_list(
    data: ModelList,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):

    model_list = await model_service.get_models(session, data.division)
    return JSONResponse(content={"model_list": model_list})

