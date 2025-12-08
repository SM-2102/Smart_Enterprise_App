from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer
from db.db import get_session
from exceptions import MarketNotFound
from market.schemas import (
    CreateMarket,
    MarketCode,
    MarketEnquiry,
    MarketPending,
    MarketResponse,
    MarketUpdate,
)
from market.service import MarketService

market_router = APIRouter()
market_service = MarketService()
access_token_bearer = AccessTokenBearer()

"""
Create new market record, after checking master name
"""


@market_router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_market(
    market: CreateMarket,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    new_market = await market_service.create_market(session, market, token)
    return JSONResponse(content={"message": f"Market Created : {new_market.mcode}"})


"""
Get the next available market code.
"""


@market_router.get("/next_mcode", status_code=status.HTTP_200_OK)
async def market_next_code(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    next_mcode = await market_service.market_next_mcode(session)
    return JSONResponse(content={"next_mcode": next_mcode})


"""
List all pending market records.
"""


@market_router.get(
    "/list_pending", response_model=List[MarketPending], status_code=status.HTTP_200_OK
)
async def list_market_pending(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    names = await market_service.list_market_pending(session)
    return names


"""
Get market details by mcode.
"""


@market_router.post(
    "/by_mcode", response_model=MarketResponse, status_code=status.HTTP_200_OK
)
async def get_market_by_mcode(
    data: MarketCode,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    market = await market_service.get_market_by_mcode(data.mcode, session)
    return market


"""
Update market details by mcode
"""


@market_router.patch("/update/{mcode}", status_code=status.HTTP_202_ACCEPTED)
async def update_market(
    mcode: str,
    market: MarketUpdate,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    existing_market = await market_service.get_market_by_mcode(mcode, session)
    if not existing_market:
        raise MarketNotFound()
    new_market = await market_service.update_market(mcode, market, session, token)
    return JSONResponse(content={"message": f"Market Updated : {new_market.mcode}"})


"""
Filter market enquiry records
"""


@market_router.get("/enquiry", response_model=List[MarketEnquiry])
async def master_enquiry(
    final_status: Optional[str] = None,
    name: Optional[str] = None,
    division: Optional[str] = None,
    from_delivery_date: Optional[date] = None,
    to_delivery_date: Optional[date] = None,
    delivered_by: Optional[str] = None,
    invoice_number: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    try:
        enquiry_list = await market_service.get_market_enquiry(
            session,
            final_status,
            name,
            division,
            from_delivery_date,
            to_delivery_date,
            delivered_by,
            invoice_number,
        )
        return enquiry_list
    except:
        return []


"""
List distinct delivered_by names
"""


@market_router.get(
    "/list_delivered_by", response_model=List, status_code=status.HTTP_200_OK
)
async def list_delivered_by(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    names = await market_service.list_delivered_by(session)
    return names


"""
List distinct invoice numbers
"""


@market_router.get(
    "/list_invoice_number", response_model=List, status_code=status.HTTP_200_OK
)
async def list_invoice_number(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    numbers = await market_service.list_invoice_number(session)
    return numbers
