from sqlalchemy import func, select, union_all
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from exceptions import ServiceCenterAlreadyExists, ServiceCenterNotFound

from .models import ServiceCentre


class ServiceCenterService:

    async def check_service_center_name_available(
        self, name: str, session: AsyncSession
    ):
        statement = select(ServiceCentre).where(ServiceCentre.asc_name == name)
        result = await session.execute(statement)
        existing_name = result.scalar()
        if existing_name:
            return existing_name
        raise ServiceCenterNotFound()

    async def list_service_center_names(self, session: AsyncSession):
        statement = select(ServiceCentre.asc_name).order_by(ServiceCentre.asc_name)
        result = await session.execute(statement)
        names = result.scalars().all()
        return names

    async def create_service_center(self, session: AsyncSession, name: str):
        try:
            existing_asc = await self.check_service_center_name_available(name, session)
            if existing_asc:
                raise ServiceCenterAlreadyExists()
        except ServiceCenterNotFound:
            new_service_center = ServiceCentre(asc_name=name)
            session.add(new_service_center)
            await session.commit()
