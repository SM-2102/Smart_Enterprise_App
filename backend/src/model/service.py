from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from exceptions import ModelAlreadyExists
from model.models import Model
from model.schemas import CostDetails, CreateModel, RewindingCharge
from rewinding_rate.models import RewindingRate


class ModelService:

    async def get_cost_details(self, session: AsyncSession, division: str, model: str):
        # STEP 1: Fetch frame, hp_rating, rewinding_charge from model table
        model_statement = select(
            Model.frame, Model.hp_rating, Model.rewinding_charge
        ).where(Model.division == division, Model.model == model)

        model_result = await session.execute(model_statement)
        model_row = model_result.first()

        frame = model_row.frame
        hp_rating = model_row.hp_rating
        rewinding_charge = model_row.rewinding_charge

        # STEP 2: Fetch vendor charges from rewinding_rate table
        if division == "LT MOTOR":
            rate_statement = select(
                RewindingRate.paint_charge,
                RewindingRate.stator_charge,
                RewindingRate.leg_charge,
            ).where(RewindingRate.division == division, RewindingRate.frame == frame)

        elif division == "FHP MOTOR":
            rate_statement = select(
                RewindingRate.paint_charge,
                RewindingRate.stator_charge,
                RewindingRate.leg_charge,
            ).where(
                RewindingRate.division == division, RewindingRate.hp_rating == hp_rating
            )

        else:
            rate_statement = None

        paint_charge = 0
        stator_charge = 0
        leg_charge = 0

        if rate_statement is not None:
            rate_result = await session.execute(rate_statement)
            rate_row = rate_result.first()

            if rate_row:
                paint_charge = rate_row.paint_charge or 0
                stator_charge = rate_row.stator_charge or 0
                leg_charge = rate_row.leg_charge or 0

        return CostDetails(
            rewinding_charge=rewinding_charge,
            paint_charge=paint_charge,
            stator_charge=stator_charge,
            leg_charge=leg_charge,
        )

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
