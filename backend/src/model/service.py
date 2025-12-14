from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from model.models import Model

class ModelService:

    async def get_rewinding_rate(self, session: AsyncSession, division: str, model: str):
        statement = select(Model.rewinding_charge).where(
            Model.division == division,
            Model.model == model
        )
        result = await session.execute(statement)
        return result.scalars().first()
      