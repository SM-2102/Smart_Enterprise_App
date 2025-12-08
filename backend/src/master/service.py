from sqlalchemy import func, select, union_all
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from exceptions import (
    CannotChangeMasterName,
    IncorrectCodeFormat,
    MasterAlreadyExists,
    MasterNotFound,
)

from .models import Master
from .schemas import CreateMaster, UpdateMaster


class MasterService:

    async def create_master(
        self, session: AsyncSession, master: CreateMaster, token: dict
    ):
        for _ in range(3):  # Retry up to 3 times
            master_data_dict = master.model_dump()
            master_data_dict["code"] = await self.master_next_code(session)
            if await self.check_master_name_available(master.name, session):
                raise MasterAlreadyExists()
            master_data_dict["created_by"] = token["user"]["username"]
            new_master = Master(**master_data_dict)
            session.add(new_master)
            try:
                await session.commit()
                return new_master
            except IntegrityError:
                await session.rollback()
            raise MasterAlreadyExists()

    async def master_next_code(self, session: AsyncSession):
        statement = select(Master.code).order_by(Master.code.desc()).limit(1)
        result = await session.execute(statement)
        last_code = result.scalar()
        last_number = last_code[1:] if last_code else "0"
        next_code = int(last_number) + 1
        next_code = "C" + str(next_code).zfill(4)
        return next_code

    async def check_master_name_available(
        self, name: str, session: AsyncSession
    ) -> bool:
        statement = select(Master).where(Master.name == name)
        result = await session.execute(statement)
        existing_name = result.scalar()
        if existing_name:
            return True
        return False

    async def list_master_names(self, session: AsyncSession):
        statement = select(Master.name).order_by(Master.name)
        result = await session.execute(statement)
        names = result.scalars().all()
        return names

    async def get_master_by_code(self, code: str, session: AsyncSession):
        # format code to C____
        if len(code) != 5:
            code = "C" + code.zfill(4)
        if not code.startswith("C") or not code[1:].isdigit():
            raise IncorrectCodeFormat()
        statement = select(Master).where(Master.code == code)
        result = await session.execute(statement)
        master = result.scalars().first()
        if master:
            return master
        else:
            raise MasterNotFound()

    async def get_master_by_name(self, name: str, session: AsyncSession):
        statement = select(Master).where(Master.name == name)
        result = await session.execute(statement)
        master = result.scalars().first()
        if master:
            return master
        else:
            raise MasterNotFound()

    async def update_master(
        self, code: str, master: UpdateMaster, session: AsyncSession, token: dict
    ):
        existing_master = await self.get_master_by_code(code, session)
        if existing_master.name != master.name:
            raise CannotChangeMasterName()
        for key, value in master.model_dump().items():
            setattr(existing_master, key, value)
        existing_master.updated_by = token["user"]["username"]
        try:
            await session.commit()
        except:
            await session.rollback()
            raise MasterAlreadyExists()
        await session.refresh(existing_master)
        return existing_master

    async def get_address(self, name: str, session: AsyncSession):
        master = await self.get_master_by_name(name, session)
        full_address = master.address + ", " + master.city
        if master.pin:
            full_address += " - " + master.pin
        return full_address

    async def get_master_details(self, code: str, session: AsyncSession):
        master = await self.get_master_by_code(code, session)
        full_address = master.address + ", " + master.city
        if master.pin:
            full_address += " - " + master.pin
        return {
            "name": master.name,
            "full_address": full_address,
            "contact1": master.contact1,
            "gst": master.gst,
        }
