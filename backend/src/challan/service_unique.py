import io
import os

from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from challan.schemas import ChallanNumber, CreateChallan
from exceptions import IncorrectCodeFormat, RoadChallanNotFound
from master.service import MasterService
from utils.date_utils import parse_date
from utils.file_utils import safe_join, split_text_to_lines

from .models_unique import ChallanUnique

master_service = MasterService()


class ChallanUniqueService:

    async def create_challan(
        self, session: AsyncSession, challan: CreateChallan, token: dict
    ):
        for _ in range(3):  # Retry up to 3 times in case of IntegrityError
            master = await master_service.get_master_by_name(challan.name, session)
            challan_data_dict = challan.model_dump()
            challan_data_dict["challan_number"] = await self.next_challan_number(
                session
            )
            challan_data_dict["created_by"] = token["user"]["username"]
            challan_data_dict["code"] = master.code
            # Convert date fields to date objects
            for date_field in ["challan_date", "order_date", "invoice_date"]:
                if date_field in challan_data_dict:
                    challan_data_dict[date_field] = parse_date(
                        challan_data_dict[date_field]
                    )
            challan_data_dict.pop("name", None)
            new_challan = ChallanUnique(**challan_data_dict)
            session.add(new_challan)
            try:
                await session.commit()
                return new_challan
            except IntegrityError:
                await session.rollback()

    async def next_challan_number(self, session: AsyncSession):
        statement = (
            select(ChallanUnique.challan_number)
            .order_by(ChallanUnique.challan_number.desc())
            .limit(1)
        )
        result = await session.execute(statement)
        last_challan_number = result.scalar()
        last_number = last_challan_number[1:] if last_challan_number else "0"
        next_challan_number = int(last_number) + 1
        next_challan_number = "U" + str(next_challan_number).zfill(5)
        return next_challan_number

    async def challan_max_date(self, session: AsyncSession):
        statement = select(func.max(ChallanUnique.challan_date))
        result = await session.execute(statement)
        max_date = result.scalar()
        return max_date if max_date else "2025-01-01"

    async def last_challan_number(self, session: AsyncSession):
        statement = (
            select(ChallanUnique.challan_number)
            .order_by(ChallanUnique.challan_number.desc())
            .limit(1)
        )
        result = await session.execute(statement)
        last_challan_number = result.scalar()
        return last_challan_number

    async def challan_by_challan_number(
        self, challan_number: ChallanNumber, session: AsyncSession
    ):
        if len(challan_number) != 6:
            challan_number = "U" + challan_number.zfill(5)
        if not challan_number.startswith("U") or not challan_number[1:].isdigit():
            raise IncorrectCodeFormat()
        statement = select(ChallanUnique).where(ChallanUnique.challan_number == challan_number)
        result = await session.execute(statement)
        challan = result.scalar()
        if challan:
            return challan
        raise RoadChallanNotFound()

    async def print_challan(
        self, challan_number: ChallanNumber, session: AsyncSession
    ) -> io.BytesIO:
        """
        Generates a PDF for the given challan number.
        """
        challan_data = await self.challan_by_challan_number(challan_number, session)
        challan_number = challan_data.challan_number
        challan_date = challan_data.challan_date.strftime("%d-%m-%Y")
        order_number = challan_data.order_number or ""
        order_date = (
            challan_data.order_date.strftime("%d-%m-%Y")
            if challan_data.order_date
            else ""
        )
        invoice_number = challan_data.invoice_number or ""
        invoice_date = (
            challan_data.invoice_date.strftime("%d-%m-%Y")
            if challan_data.invoice_date
            else ""
        )
        code = challan_data.code
        remark = challan_data.remark
        master_details = await master_service.get_master_details(code, session)
        name = master_details["name"]
        full_address = master_details["full_address"]
        contact = master_details["contact1"]

        # Extract rows
        rows = []
        for i in range(1, 9):
            desc = getattr(challan_data, f"desc{i}", None)
            qty = getattr(challan_data, f"qty{i}", None)
            unit = getattr(challan_data, f"unit{i}", None)
            if desc:
                rows.append({"spare": desc, "quantity": qty, "unit": unit})
        total = sum(row["quantity"] for row in rows if row["quantity"])

        # Path to the static PDF template (use absolute path for portability, with path injection protection)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.normpath(os.path.join(base_dir, "..", "static"))
        template_path = safe_join(static_dir, "unique_challan.pdf")

        # Read the template PDF
        try:
            with open(template_path, "rb") as f:
                template_bytes = f.read()
        except FileNotFoundError:
            raise FileNotFoundError(f"Template PDF not found at {template_path}")
        template_buffer = io.BytesIO(template_bytes)
        template_pdf = PdfReader(template_buffer)

        # Create overlay
        overlay = self._generate_challan_overlay(
            rows,
            challan_number,
            challan_date,
            name,
            full_address,
            code,
            contact,
            order_number,
            order_date,
            invoice_number,
            invoice_date,
            total,
            remark,
        )

        writer = PdfWriter()
        page1 = template_pdf.pages[0]
        page1.merge_page(overlay.pages[0])
        writer.add_page(page1)

        if len(template_pdf.pages) > 1:
            page2 = template_pdf.pages[1]
            page2.merge_page(overlay.pages[0])
            writer.add_page(page2)

        output_stream = io.BytesIO()
        writer.write(output_stream)
        output_stream.seek(0)
        return output_stream

    def _generate_challan_overlay(
        self,
        rows,
        challan_number,
        challan_date,
        name,
        full_address,
        code,
        contact,
        order_number,
        order_date,
        invoice_number,
        invoice_date,
        total,
        remark,
    ):
        """
        Generates a PDF overlay for the challan details and rows.
        """
        packet = io.BytesIO()
        can = canvas.Canvas(packet, pagesize=A4)
        width, height = A4

        # PDF layout constants (integrated)
        font = "Helvetica"
        font_bold = "Helvetica-Bold"
        font_size = 13
        font_size_bold = 10
        line_spacing = 10
        min_row_height = 30
        row_padding = 1
        columns = [
            {"x": 28, "width": 22},  # Sl No
            {"x": 60, "width": 360},  # Spare
            {"x": 440, "width": 40},  # Quantity
            {"x": 490, "width": 80},  # Unit
        ]

        # Header fields
        can.setFont(font_bold, font_size_bold)
        can.drawString(178, 696, challan_number)
        can.drawString(368, 696, challan_date)
        can.drawString(240, 658, name)
        can.drawString(240, 634, full_address)
        can.drawString(170, 608, code)
        can.drawString(500, 608, contact)
        can.drawString(170, 589, order_number)
        can.drawString(500, 589, order_date)
        can.drawString(170, 570, invoice_number)
        can.drawString(500, 570, invoice_date)
        can.drawString(170, 551, remark)

        can.setFont(font_bold, font_size)
        can.drawString(450, 251, str(total))

        # Table rows
        start_y = 507
        y = start_y
        for idx, row in enumerate(rows, 1):
            row_data = [
                str(idx),
                str(row["spare"]) if row["spare"] is not None else "",
                str(row["quantity"]) if row["quantity"] is not None else "",
                str(row["unit"]) if row["unit"] is not None else "",
            ]
            row_lines = [
                split_text_to_lines(text, font, font_size, col["width"], stringWidth)
                for col, text in zip(columns, row_data)
            ]
            max_lines = max(len(lines) for lines in row_lines)
            row_height = max(max_lines * line_spacing, min_row_height)

            if y - row_height < 100:
                can.showPage()
                can.setFont(font, font_size)
                y = height - 50

            for col, lines in zip(columns, row_lines):
                total_text_height = len(lines) * line_spacing
                vertical_offset = (row_height - total_text_height) / 2
                for i, ln in enumerate(lines):
                    safe_ln = ln or ""
                    text_width = stringWidth(safe_ln or "", font, font_size)
                    center_x = col["x"] + col["width"] / 2 - text_width / 2
                    y_position = y - vertical_offset - (i * line_spacing)
                    can.drawString(center_x, y_position, safe_ln)
            y -= row_height + row_padding

        can.save()
        packet.seek(0)
        return PdfReader(packet)
