from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from model.models import Model
from model.schemas import RewindingCharge

class ModelService:

    async def get_rewinding_rate(self, session: AsyncSession, division: str, model: str):
        statement = select(Model.rewinding_charge).where(
            Model.division == division,
            Model.model == model
        )
        result = await session.execute(statement)
        return result.scalars().first()
    
    async def get_rewinding_rate_for_model(self, session: AsyncSession, data : RewindingCharge):
        if data.division == 'LT MOTOR':
            statement = select(Model.rewinding_charge).where(
                Model.division == data.division,
                Model.frame == data.frame
            )
        elif data.division == 'FHP MOTOR':
            statement = select(Model.rewinding_charge).where(
                Model.division == data.division,
                Model.rating == data.hp_rating,
                Model.winding_type == data.winding_type,
            )
        result = await session.execute(statement)
        return result.scalars().first()