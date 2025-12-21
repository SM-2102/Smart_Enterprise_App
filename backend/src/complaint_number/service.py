import csv
import io

from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy import case, insert, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from complaint_number.models import ComplaintNumber
from complaint_number.schemas import ComplaintNumberSchema


class ComplaintNumberService:

    async def upload_complaint_number(self, session: AsyncSession, file: UploadFile):
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

            complaint_number = row.get("complaint_number")
            status = row.get("status")
            remark = row.get("remark")

            if not complaint_number:
                return {
                    "message": f"Validation failed on line {line_no}",
                    "resolution": "Missing complaint_number",
                    "type": "warning",
                }

            if len(complaint_number) < 13 or len(complaint_number) > 15:
                return {
                    "message": f"Validation failed for {complaint_number}",
                    "resolution": "Invalid complaint number",
                    "type": "warning",
                }

            if status and status not in ("OK", "FALSE"):
                return {
                    "message": f"Validation failed for {complaint_number}",
                    "resolution": "Status must be OK or FALSE",
                    "type": "warning",
                }

            try:
                validated = ComplaintNumberSchema(
                    complaint_number=complaint_number,
                    status=status,
                    remark=remark,
                )
            except ValidationError as ve:
                return {
                    "message": f"Validation failed for {complaint_number}",
                    "resolution": str(ve),
                    "type": "warning",
                }

            records.append(validated)

        if not records:
            return {
                "message": "Uploaded Successfully",
                "resolution": "No valid rows found",
            }

        keys = [r.complaint_number for r in records]

        result = await session.execute(
            select(ComplaintNumber).where(ComplaintNumber.complaint_number.in_(keys))
        )

        existing = {r.complaint_number: r for r in result.scalars().all()}

        to_insert = []
        to_update = {}

        for r in records:
            if r.complaint_number in existing:
                to_update[r.complaint_number] = r
            else:
                to_insert.append(
                    {
                        "complaint_number": r.complaint_number,
                        "status": r.status,
                        "remark": r.remark,
                    }
                )

        inserted = 0
        updated = 0

        table = ComplaintNumber.__table__

        try:
            if to_insert:
                await session.execute(insert(table).values(to_insert))
                inserted = len(to_insert)

            if to_update:
                status_case = case(
                    *[
                        (table.c.complaint_number == k, v.status)
                        for k, v in to_update.items()
                    ],
                    else_=table.c.status,
                )

                remark_case = case(
                    *[
                        (table.c.complaint_number == k, v.remark)
                        for k, v in to_update.items()
                    ],
                    else_=table.c.remark,
                )

                await session.execute(
                    update(table)
                    .where(table.c.complaint_number.in_(to_update.keys()))
                    .values(
                        status=status_case,
                        remark=remark_case,
                    )
                )

                updated = len(to_update)

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
            "message": "Complaint Numbers Uploaded",
            "resolution": f"Inserted : {inserted}, Updated : {updated}",
            "type": "success",
        }

    async def list_complaints(self, session: AsyncSession):
        statement = select(ComplaintNumber)
        result = await session.execute(statement)
        complaints = result.scalars().all()
        return complaints
    
    async def check_complaint_number_available(
        self, complaint_number: str, session: AsyncSession
    ) -> bool:
        statement = select(ComplaintNumber.complaint_number).where(
            (ComplaintNumber.complaint_number == complaint_number)
        )
        result = await session.execute(statement)
        existing_record = result.scalar()
        if existing_record:
            return True
        return False
