from datetime import date
from typing import List, Optional

from sqlalchemy import case, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from exceptions import IncorrectCodeFormat, MarketNotFound, MasterNotFound
from market.models import Market
from market.schemas import (
    CreateMarket,
    MarketEnquiry,
    MarketPending,
    MarketResponse,
    MarketUpdate,
)
from master.models import Master
from master.service import MasterService
from utils.date_utils import format_date_ddmmyyyy, parse_date

master_service = MasterService()


class MarketService:

    async def create_market(
        self, session: AsyncSession, market: CreateMarket, token: dict
    ):
        for _ in range(3):  # Retry up to 3 times in case of IntegrityError
            master = await master_service.get_master_by_name(market.name, session)
            market_data_dict = market.model_dump()
            market_data_dict["mcode"] = await self.market_next_mcode(session)
            market_data_dict["created_by"] = token["user"]["username"]
            market_data_dict["code"] = master.code
            # Convert date fields to date objects
            for date_field in ["receive_date", "invoice_date", "challan_date"]:
                if date_field in market_data_dict:
                    market_data_dict[date_field] = parse_date(
                        market_data_dict[date_field]
                    )
            market_data_dict.pop("name", None)
            new_market = Market(**market_data_dict)
            session.add(new_market)
            try:
                await session.commit()
                return new_market
            except IntegrityError as e:
                await session.rollback()

    async def market_next_mcode(self, session: AsyncSession):
        statement = select(Market.mcode).order_by(Market.mcode.desc()).limit(1)
        result = await session.execute(statement)
        last_mcode = result.scalar()
        last_number = last_mcode[1:] if last_mcode else "0"
        next_mcode = int(last_number) + 1
        next_mcode = "M" + str(next_mcode).zfill(5)
        return next_mcode

    async def list_market_pending(self, session: AsyncSession):
        statement = (
            select(Market.mcode, Master.name)
            .join(Master, Market.code == Master.code)
            .where(Market.final_status == "N")
        )
        result = await session.execute(statement)
        rows = result.all()
        return [MarketPending(id=mcode, name=name) for mcode, name in rows]

    async def get_market_by_mcode(self, mcode: str, session: AsyncSession):
        if len(mcode) != 6:
            mcode = "M" + mcode.zfill(5)
        if not mcode.startswith("M") or not mcode[1:].isdigit():
            raise IncorrectCodeFormat()
        statement = (
            select(Market, Master.name)
            .join(Master, Market.code == Master.code)
            .where(Market.mcode == mcode)
        )
        result = await session.execute(statement)
        row = result.first()
        if row:
            return MarketResponse(
                mcode=row.Market.mcode,
                name=row.name,
                division=row.Market.division,
                receive_date=row.Market.receive_date,
                invoice_number=row.Market.invoice_number,
                invoice_date=row.Market.invoice_date,
                quantity=row.Market.quantity,
                delivery_date=row.Market.delivery_date,
                delivery_by=row.Market.delivery_by,
                remark=row.Market.remark,
                final_status=row.Market.final_status,
            )
        else:
            raise MarketNotFound()

    async def update_market(
        self, mcode: str, market: MarketUpdate, session: AsyncSession, token: dict
    ):
        statement = select(Market).where(Market.mcode == mcode)
        result = await session.execute(statement)
        existing_market = result.scalars().first()
        if not existing_market:
            raise MarketNotFound()
        for var, value in vars(market).items():
            setattr(existing_market, var, value)
        existing_market.updated_by = token["user"]["username"]
        session.add(existing_market)
        await session.commit()
        await session.refresh(existing_market)
        return existing_market

    async def get_market_enquiry(
        self,
        session: AsyncSession,
        final_status: Optional[str] = None,
        name: Optional[str] = None,
        division: Optional[str] = None,
        from_delivery_date: Optional[date] = None,
        to_delivery_date: Optional[date] = None,
        delivered_by: Optional[str] = None,
        invoice_number: Optional[str] = None,
    ) -> List[MarketEnquiry]:
        # Check if master name exists
        statement = select(Market, Master).join(Master, Master.code == Market.code)
        # Apply filters dynamically
        if final_status:
            statement = statement.where(Market.final_status == final_status)

        if name:
            statement = statement.where(Master.name.ilike(f"%{name}%"))

        if division:
            statement = statement.where(Market.division == division)

        if from_delivery_date:
            statement = statement.where(Market.delivery_date >= from_delivery_date)
        if to_delivery_date:
            statement = statement.where(Market.delivery_date <= to_delivery_date)

        if delivered_by:
            statement = statement.where(Market.delivery_by.ilike(f"%{delivered_by}%"))

        if invoice_number:
            statement = statement.where(
                Market.invoice_number.ilike(f"%{invoice_number}%")
            )

        statement = statement.order_by(Market.mcode)

        result = await session.execute(statement)
        rows = result.all()
        return [
            MarketEnquiry(
                mcode=row.Market.mcode,
                name=row.Master.name,
                contact1=row.Master.contact1,
                contact2=row.Master.contact2,
                division=row.Market.division,
                invoice_number=row.Market.invoice_number,
                invoice_date=format_date_ddmmyyyy(row.Market.invoice_date),
                quantity=row.Market.quantity,
                delivery_date=(
                    format_date_ddmmyyyy(row.Market.delivery_date)
                    if row.Market.delivery_date
                    else None
                ),
                delivery_by=row.Market.delivery_by,
            )
            for row in rows
        ]

    async def list_delivered_by(self, session: AsyncSession):
        statement = (
            select(Market.delivery_by).distinct().where(Market.delivery_by.isnot(None))
        )
        result = await session.execute(statement)
        names = result.scalars().all()
        return names

    async def list_invoice_number(self, session: AsyncSession):
        statement = (
            select(Market.invoice_number)
            .distinct()
            .where(Market.invoice_number.isnot(None))
        )
        result = await session.execute(statement)
        numbers = result.scalars().all()
        return numbers
