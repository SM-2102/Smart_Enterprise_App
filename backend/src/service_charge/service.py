from sqlalchemy import func, select, union_all
from sqlalchemy.ext.asyncio.session import AsyncSession

from .models import ServiceCharge
from .schemas import ServiceCharge


class ServiceChargeService:

    async def get_service_charge(self, data: ServiceCharge, session: AsyncSession):
        statement = select(ServiceCharge).where(ServiceCharge.division == data.division)
        if data.head:
            statement = statement.where(ServiceCharge.head == data.head)
        result = await session.execute(statement)
        service_charge = result.scalars().first()
        if service_charge:
            return service_charge.service_charge
