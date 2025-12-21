import csv
import io

from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy import case, insert, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from cg_srf_number.models import CGSRFNumber
from cg_srf_number.schemas import CGSRFNumberSchema


class CGSRFNumberService:

    async def upload_cg_srf_number(self, session: AsyncSession, file: UploadFile):
        content = await file.read()
        try:
            text = content.decode("utf-8-sig")
        except Exception:
            text = content.decode("utf-8", errors="ignore")

        reader = csv.DictReader(io.StringIO(text))

        if not reader.fieldnames:
            return {
                "message": "Invalid file",
                "resolution": "CSV file has no headers",
                "type": "warning",
            }

        records = []
        line_no = 1

        for raw_row in reader:
            line_no += 1

            row = {
                (k or "").strip().lower(): (v.strip().upper() if v else None)
                for k, v in raw_row.items()
            }

            cg_srf_number = row.get("cg_srf_number")

            if not cg_srf_number:
                return {
                    "message": f"Validation failed on line {line_no}",
                    "resolution": "Missing cg_srf_number",
                    "type": "warning",
                }

            try:
                validated = CGSRFNumberSchema(
                    cg_srf_number=cg_srf_number,
                )
            except ValidationError as ve:
                return {
                    "message": f"Validation failed for {cg_srf_number}",
                    "resolution": str(ve),
                    "type": "warning",
                }

            records.append(validated)

        if not records:
            return {
                "message": "Uploaded Successfully",
                "resolution": "No valid rows found",
            }

        keys = [r.cg_srf_number for r in records]

        result = await session.execute(
            select(CGSRFNumber).where(CGSRFNumber.cg_srf_number.in_(keys))
        )

        existing_keys = set(
            (
                await session.execute(
                    select(CGSRFNumber.cg_srf_number)
                    .where(CGSRFNumber.cg_srf_number.in_(keys))
                )
            )
            .scalars()
            .all()
        )

        to_insert = [
            {"cg_srf_number": r.cg_srf_number}
            for r in records
            if r.cg_srf_number not in existing_keys
        ]

        inserted = 0
        skipped = len(records) - len(to_insert)

        try:
            if to_insert:
                await session.execute(
                    insert(CGSRFNumber.__table__).values(to_insert)
                )
                inserted = len(to_insert)

            await session.commit()

        except IntegrityError as e:
            await session.rollback()
            return {
                "message": "Database integrity error",
                "resolution": str(e),
                "type": "error",
            }
        except Exception as e:
            await session.rollback()
            import traceback

            traceback.print_exc()
            return {
                "message": "Unexpected server error",
                "resolution": str(e),
                "type": "error",
            }

        return {
            "message": "CGSRF Numbers Uploaded",
            "resolution": f"Inserted: {inserted}, Already exists: {skipped}",
            "type": "success",
        }


    async def check_cg_srf_number_available(
        self, cg_srf_number: str, session: AsyncSession
    ) -> bool:
        statement = select(CGSRFNumber.cg_srf_number).where(
            (CGSRFNumber.cg_srf_number == cg_srf_number)
        )
        result = await session.execute(statement)
        existing_record = result.scalar()
        if existing_record:
            return True
        return False
