from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from model.models import Model
from model.schemas import RewindingCharge, CreateModel
from exceptions import ModelAlreadyExists

class ModelService:

    # async def get_rewinding_rate(self, session: AsyncSession, division: str, model: str):
    #     statement = select(Model.rewinding_charge).where(
    #         Model.division == division,
    #         Model.model == model
    #     )
    #     result = await session.execute(statement)
    #     return result.scalars().first()
    
    async def check_model_name_available(
        self, model: str, session: AsyncSession
    ) -> bool:
        statement = select(Model).where(Model.model == model)
        result = await session.execute(statement)
        existing_model = result.scalar()
        if existing_model:
            return True
        return False
    
    async def create_model(
        self, session: AsyncSession, model: CreateModel, token: dict
    ):
        model_data_dict = model.model_dump()
        if await self.check_model_name_available(model.model, session):
            raise ModelAlreadyExists()
        model_data_dict["created_by"] = token["user"]["username"]
        new_model = Model(**model_data_dict)
        session.add(new_model)
        await session.commit()
        return new_model
    
    async def get_models(self, session: AsyncSession, division: str):
        statement = select(Model.model).where(
            Model.division == division,
        )
        result = await session.execute(statement)
        return result.scalars().all()