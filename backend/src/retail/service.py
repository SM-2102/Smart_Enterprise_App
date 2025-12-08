import io
import os
from datetime import date, timedelta
from typing import List, Optional

from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from sqlalchemy import case, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from exceptions import MasterNotFound
from master.models import Master
from master.service import MasterService
from retail.models import Retail
from retail.schemas import (
    RetailCreate,
    RetailEnquiry,
    RetailFinalSettlementResponse,
    RetailNotReceivedResponse,
    RetailPrintResponse,
    RetailRcode,
    RetailUnsettledResponse,
    UpdateRetailFinalSettlement,
    UpdateRetailReceived,
    UpdateRetailUnsettled,
)
from utils.date_utils import format_date_ddmmyyyy, parse_date
from utils.file_utils import safe_join, split_text_to_lines

master_service = MasterService()


class RetailService:

    async def create_retail(
        self, session: AsyncSession, retail: RetailCreate, token: dict
    ):
        for _ in range(3):  # Retry up to 3 times in case of IntegrityError
            master = await master_service.get_master_by_name(retail.name, session)
            retail_data_dict = retail.model_dump()
            retail_data_dict["rcode"] = await self.retail_next_code(session)
            retail_data_dict["created_by"] = token["user"]["username"]
            retail_data_dict["code"] = master.code
            # Convert date fields to date objects
            for date_field in ["retail_date"]:
                if date_field in retail_data_dict:
                    retail_data_dict[date_field] = parse_date(
                        retail_data_dict[date_field]
                    )
            retail_data_dict.pop("name", None)
            new_retail = Retail(**retail_data_dict)
            session.add(new_retail)
            try:
                await session.commit()
                return new_retail
            except IntegrityError as e:
                await session.rollback()

    async def retail_next_code(self, session: AsyncSession):
        statement = select(Retail.rcode).order_by(Retail.rcode.desc()).limit(1)
        result = await session.execute(statement)
        last_rcode = result.scalar()
        last_number = last_rcode[1:] if last_rcode else "0"
        next_rcode = int(last_number) + 1
        next_rcode = "X" + str(next_rcode).zfill(5)
        return next_rcode

    async def list_retail_not_received(self, session: AsyncSession):
        statement = (
            select(Retail, Master)
            .join(Master, Retail.code == Master.code)
            .where(Retail.received == "N")
            .order_by(Retail.rcode)
        )
        result = await session.execute(statement)
        rows = result.all()
        return [
            RetailNotReceivedResponse(
                rcode=row.Retail.rcode,
                name=row.Master.name,
                contact1=row.Master.contact1,
                contact2=row.Master.contact2,
                details=row.Retail.details,
                amount=row.Retail.amount,
                received=row.Retail.received,
            )
            for row in rows
        ]

    async def update_received(
        self,
        list_retail: List[UpdateRetailReceived],
        session: AsyncSession,
        token: dict,
    ):
        for retail in list_retail:
            statement = select(Retail).where(Retail.rcode == retail.rcode)
            result = await session.execute(statement)
            existing_retail = result.scalar_one_or_none()
            if existing_retail:
                existing_retail.received = retail.received
                existing_retail.updated_by = token["user"]["username"]
        await session.commit()

    async def list_retail_unsettled(self, session: AsyncSession):
        statement = (
            select(Retail, Master)
            .join(Master, Retail.code == Master.code)
            .where(Retail.settlement_date == None)
            .order_by(Retail.rcode)
        )
        result = await session.execute(statement)
        rows = result.all()
        return [
            RetailUnsettledResponse(
                rcode=row.Retail.rcode,
                name=row.Master.name,
                details=row.Retail.details,
                amount=row.Retail.amount,
                received=row.Retail.received,
            )
            for row in rows
        ]

    async def update_unsettled(
        self, list_retail: List[UpdateRetailUnsettled], session: AsyncSession
    ):
        for retail in list_retail:
            statement = select(Retail).where(Retail.rcode == retail.rcode)
            result = await session.execute(statement)
            existing_retail = result.scalar_one_or_none()
            if existing_retail:
                existing_retail.received = retail.received
                existing_retail.settlement_date = retail.settlement_date
        await session.commit()

    async def list_retail_final_settlement(self, session: AsyncSession):
        statement = (
            select(Retail, Master)
            .join(Master, Retail.code == Master.code)
            .where((Retail.settlement_date != None) & (Retail.final_status == "N"))
            .order_by(Retail.rcode)
        )
        result = await session.execute(statement)
        rows = result.all()
        return [
            RetailFinalSettlementResponse(
                rcode=row.Retail.rcode,
                name=row.Master.name,
                retail_date=format_date_ddmmyyyy(row.Retail.retail_date),
                details=row.Retail.details,
                amount=row.Retail.amount,
            )
            for row in rows
        ]

    async def update_final_settlement(
        self, list_retail: List[UpdateRetailFinalSettlement], session: AsyncSession
    ):
        for retail in list_retail:
            statement = select(Retail).where(Retail.rcode == retail.rcode)
            result = await session.execute(statement)
            existing_retail = result.scalar_one_or_none()
            if existing_retail:
                existing_retail.amount = retail.amount
                existing_retail.final_status = retail.final_status
        await session.commit()

    async def get_retail_enquiry(
        self,
        session: AsyncSession,
        name: Optional[str] = None,
        division: Optional[str] = None,
        from_retail_date: Optional[date] = None,
        to_retail_date: Optional[date] = None,
        received: Optional[str] = None,
        final_status: Optional[str] = None,
    ) -> List[RetailEnquiry]:
        # Check if master name exists
        statement = select(Retail, Master.name).join(Master, Master.code == Retail.code)

        # Apply filters dynamically
        if final_status:
            statement = statement.where(Retail.final_status == final_status)

        if name:
            statement = statement.where(Master.name.ilike(f"%{name}%"))

        if division:
            statement = statement.where(Retail.division == division)

        if from_retail_date:
            statement = statement.where(Retail.retail_date >= from_retail_date)
        if to_retail_date:
            statement = statement.where(Retail.retail_date <= to_retail_date)

        if received:
            statement = statement.where(Retail.received == received)

        statement = statement.order_by(Retail.rcode)

        result = await session.execute(statement)
        rows = result.all()
        return [
            RetailEnquiry(
                rcode=row.Retail.rcode,
                name=row.name,
                retail_date=format_date_ddmmyyyy(row.Retail.retail_date),
                division=row.Retail.division,
                details=row.Retail.details,
                amount=row.Retail.amount,
                received=row.Retail.received,
                final_status=row.Retail.final_status,
            )
            for row in rows
        ]

    async def get_retail_print_details(
        self,
        session: AsyncSession,
        name: str,
    ) -> List[RetailPrintResponse]:
        master_exists = await master_service.check_master_name_available(name, session)
        if not master_exists:
            raise MasterNotFound()
        one_month_ago = date.today() - timedelta(days=30)
        statement = (
            select(Retail)
            .join(Master, Master.code == Retail.code)
            .where((Master.name == name) & (Retail.final_status != "Y"))
            .order_by(Retail.rcode)
        )

        result = await session.execute(statement)
        rows = result.scalars().all()
        return [
            RetailPrintResponse(
                rcode=row.rcode,
                retail_date=format_date_ddmmyyyy(row.retail_date),
                details=row.details,
                amount=row.amount,
            )
            for row in rows
        ]

    async def print_retail(
        self, codes: RetailRcode, session: AsyncSession
    ) -> io.BytesIO:

        # Query retail and master info for all codes
        statement = (
            select(Retail, Master)
            .join(Master, Retail.code == Master.code)
            .where(Retail.rcode.in_(codes.rcode))
            .order_by(Retail.rcode)
        )
        result = await session.execute(statement)
        rows = result.all()

        # Extract header info from first row
        first_row = rows[0]
        master = first_row.Master
        code = master.code
        master_details = await master_service.get_master_details(code, session)
        name = master_details["name"]
        address = master_details["full_address"]
        contact = master_details["contact1"]

        # Prepare retail rows for table
        retail_rows = []
        grand_total = 0.0
        for row in rows:
            retail = row.Retail
            rcode = retail.rcode or ""
            division = retail.division or ""
            details = retail.details or ""
            amount = float(retail.amount) if retail.amount else 0.0
            retail_date = (
                format_date_ddmmyyyy(retail.retail_date) if retail.retail_date else ""
            )
            retail_rows.append([rcode, retail_date, division, details, f"{amount:.2f}"])
            grand_total += amount
        grand_total_str = f"{grand_total:.2f}"

        def generate_overlay(rows, name, address, contact, code, grand_total):
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=A4)
            width, height = A4
            # Header
            can.setFont("Helvetica-Bold", 10)
            can.drawString(262, 675, name)
            can.drawString(262, 640, address)
            can.drawString(405, 608, contact)
            can.drawString(190, 608, code)

            text = str(grand_total)
            column_width = 55
            x_start = 500
            text_width = stringWidth(text, "Helvetica-Bold", 10)
            x_position = x_start + (column_width - text_width) / 2
            can.drawString(x_position, 397, text)

            # Table
            y = 562
            line_spacing = 8
            min_row_height = 20
            row_padding = 0.2
            columns = [
                {"x": 50, "width": 60},  # Retail Code
                {"x": 120, "width": 55},  # Retail Date
                {"x": 180, "width": 70},  # Division
                {"x": 260, "width": 235},  # Details
                {"x": 500, "width": 55},  # Total Amount
            ]
            can.setFont("Helvetica", 9)
            for idx, row in enumerate(rows, 1):
                row_data = row
                row_lines = []
                for col, text in zip(columns, row_data):
                    words = text.split()
                    lines = []
                    line = ""
                    for word in words:
                        test_line = line + (" " if line else "") + word
                        if stringWidth(test_line, "Helvetica", 9) <= col["width"]:
                            line = test_line
                        else:
                            lines.append(line)
                            line = word
                    if line:
                        lines.append(line)
                    row_lines.append(lines)
                max_lines = max(len(lines) for lines in row_lines)
                row_height = max(max_lines * line_spacing, min_row_height)
                for col, lines in zip(columns, row_lines):
                    total_text_height = len(lines) * line_spacing
                    vertical_offset = (row_height - total_text_height) / 2
                    for i, ln in enumerate(lines):
                        text_width = stringWidth(ln, "Helvetica", 9)
                        center_x = col["x"] + col["width"] / 2 - text_width / 2
                        y_position = y - vertical_offset - (i * line_spacing)
                        can.drawString(center_x, y_position, ln)
                y -= row_height + row_padding
            can.save()
            packet.seek(0)
            return PdfReader(packet)

        # Path to the static PDF template (use absolute path for portability, with path injection protection)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.normpath(os.path.join(base_dir, "..", "static"))
        template_path = safe_join(static_dir, "retail.pdf")
        try:
            with open(template_path, "rb") as f:
                template_bytes = f.read()
        except FileNotFoundError:
            raise FileNotFoundError(f"Template PDF not found at {template_path}")
        template_buffer = io.BytesIO(template_bytes)
        base_pdf = PdfReader(template_buffer)

        overlay = generate_overlay(
            retail_rows, name, address, contact, code, grand_total_str
        )
        output = PdfWriter()
        # Apply overlay on each base page
        for i in range(len(base_pdf.pages)):
            page = base_pdf.pages[i]
            overlay_page = overlay.pages[min(i, len(overlay.pages) - 1)]
            page.merge_page(overlay_page)
            output.add_page(page)
        result = io.BytesIO()
        output.write(result)
        result.seek(0)
        return result
