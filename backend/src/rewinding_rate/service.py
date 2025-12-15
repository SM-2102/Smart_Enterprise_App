from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from rewinding_rate.models import RewindingRate
from rewinding_rate.schemas import RewindingCharge

class RewindingRateService:
    
    async def get_rewinding_rate(self, session: AsyncSession, data : RewindingCharge):
        if data.division == 'LT MOTOR':
            statement = select(RewindingRate.rewinding_charge).where(
                RewindingRate.division == data.division,
                RewindingRate.frame == data.frame
            )
        elif data.division == 'FHP MOTOR':
            statement = select(RewindingRate.rewinding_charge).where(
                RewindingRate.division == data.division,
                RewindingRate.hp_rating == data.hp_rating,
                RewindingRate.winding_type == data.winding_type,
            )
        result = await session.execute(statement)
        return result.scalars().first()
