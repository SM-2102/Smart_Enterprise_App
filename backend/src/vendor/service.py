import io
import os
from datetime import date, datetime, timedelta
from typing import List, Optional

from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from sqlalchemy import case, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from exceptions import ComplaintNumberAlreadyExists, VendorNotFound
from out_of_warranty.models import OutOfWarranty
from utils.date_utils import format_date_ddmmyyyy, parse_date
from utils.file_utils import safe_join, split_text_to_lines
from vendor.schemas import (
    UpdateVendorFinalSettlement,
    UpdateVendorUnsettled,
    VendorChallanCreate,
    VendorChallanDetails,
    VendorFinalSettlementRecord,
    VendorNotSettledRecord,
    VendorUpdateComplaintNumber,
)
from warranty.models import Warranty
from warranty.service import WarrantyService

warranty_service = WarrantyService()
from master.models import Master


class VendorService:

    async def next_vendor_challan_code(self, session: AsyncSession):
        warranty_max_result = await session.execute(
            select(func.max(Warranty.challan_number))
        )
        out_of_warranty_max_result = await session.execute(
            select(func.max(OutOfWarranty.challan_number))
        )
        warranty_max = warranty_max_result.scalar()
        out_of_warranty_max = out_of_warranty_max_result.scalar()

        # Remove prefix if present and convert to int
        def extract_number(val):
            if val and len(val) > 1 and val[1:].isdigit():
                return int(val[1:])
            return 0

        warranty_num = extract_number(warranty_max)
        out_num = extract_number(out_of_warranty_max)
        last_number = max(warranty_num, out_num)
        next_challan_number = last_number + 1
        next_challan_number = "V" + str(next_challan_number).zfill(5)
        return next_challan_number

    async def last_vendor_challan_code(self, session: AsyncSession):
        warranty_max_result = await session.execute(
            select(func.max(Warranty.challan_number))
        )
        out_of_warranty_max_result = await session.execute(
            select(func.max(OutOfWarranty.challan_number))
        )
        warranty_max = warranty_max_result.scalar()
        out_of_warranty_max = out_of_warranty_max_result.scalar()

        # Compare and return the one with the higher number
        def extract_number(val):
            if val and len(val) > 1 and val[1:].isdigit():
                return int(val[1:])
            return 0

        warranty_num = extract_number(warranty_max)
        out_num = extract_number(out_of_warranty_max)
        if warranty_num >= out_num:
            return warranty_max
        else:
            return out_of_warranty_max

    async def list_vendor_challan_details(self, session: AsyncSession):
        # Select matching Warranty records
        warranty_statement = select(
            Warranty.srf_number,
            Warranty.division,
            Warranty.model,
            Warranty.serial_number,
            Warranty.challan,
        ).where((Warranty.repair_date.is_(None)) & (Warranty.challan == "N"))
        # Select matching OutOfWarranty records
        out_of_warranty_statement = select(
            OutOfWarranty.srf_number,
            OutOfWarranty.division,
            OutOfWarranty.model,
            OutOfWarranty.serial_number,
            OutOfWarranty.challan,
        ).where((OutOfWarranty.repair_date.is_(None)) & (OutOfWarranty.challan == "N"))
        # Union both queries
        union_statement = warranty_statement.union_all(
            out_of_warranty_statement
        ).order_by("srf_number")
        result = await session.execute(union_statement)
        rows = result.all()
        return [
            VendorChallanDetails(
                srf_number=row.srf_number,
                division=row.division,
                model=row.model,
                serial_number=row.serial_number,
                challan=row.challan,
            )
            for row in rows
        ]

    async def create_vendor_challan(
        self,
        list_vendor_challan: List[VendorChallanCreate],
        session: AsyncSession,
    ):
        for record in list_vendor_challan:
            if record.srf_number.startswith("R"):
                statement = select(Warranty).where(
                    Warranty.srf_number == record.srf_number
                )
                result = await session.execute(statement)
                existing_warranty = result.scalar_one_or_none()
                if existing_warranty:
                    existing_warranty.challan = record.challan
                    existing_warranty.challan_number = record.challan_number
                    existing_warranty.challan_date = record.challan_date
                    existing_warranty.received_by = record.received_by
                    session.add(existing_warranty)
            if record.srf_number.startswith("S"):
                statement = select(OutOfWarranty).where(
                    OutOfWarranty.srf_number == record.srf_number
                )
                result = await session.execute(statement)
                existing_warranty = result.scalar_one_or_none()
                if existing_warranty:
                    existing_warranty.challan = record.challan
                    existing_warranty.challan_number = record.challan_number
                    existing_warranty.challan_date = record.challan_date
                    existing_warranty.received_by = record.received_by
                    session.add(existing_warranty)
        await session.commit()

    async def print_vendor_challan(
        self, challan_number: str, token: dict, session: AsyncSession
    ) -> io.BytesIO:
        # Query out_of_warranty data for challan_number
        if len(challan_number) != 6:
            challan_number = "V" + challan_number.zfill(5)
        out_of_warranty_statement = select(
            OutOfWarranty.challan_number,
            OutOfWarranty.challan_date,
            OutOfWarranty.received_by,
            OutOfWarranty.srf_number,
            OutOfWarranty.division,
            OutOfWarranty.model,
            OutOfWarranty.serial_number,
            OutOfWarranty.remark,
        ).where(OutOfWarranty.challan_number == challan_number)
        warranty_statement = select(
            Warranty.challan_number,
            Warranty.challan_date,
            Warranty.received_by,
            Warranty.srf_number,
            Warranty.division,
            Warranty.model,
            Warranty.serial_number,
            Warranty.remark,
        ).where(Warranty.challan_number == challan_number)
        union_statement = warranty_statement.union_all(out_of_warranty_statement)
        result = await session.execute(union_statement)
        rows = result.fetchall()

        if not rows:
            raise VendorNotFound()

        challan_date = rows[0][1].strftime("%d-%m-%Y") if rows[0][1] else ""
        received_by = rows[0][2]

        def generate_overlay(rows, challan_no, challan_date, received_by):
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=A4)
            width, height = A4

            def draw_block(start_y_offset):
                # Header
                can.setFont("Helvetica-Bold", 10)
                can.drawString(140, 735 - start_y_offset, challan_no)
                can.drawString(490, 735 - start_y_offset, challan_date)
                can.drawString(220, 700 - start_y_offset, received_by)

                # Table
                y = 661 - start_y_offset
                line_spacing = 8
                min_row_height = 20
                row_padding = 0.2

                columns = [
                    {"x": 21, "width": 21},  # Sl No
                    {"x": 46, "width": 74},  # SRF No
                    {"x": 125, "width": 85},  # Division
                    {"x": 220, "width": 100},  # Model
                    {"x": 330, "width": 100},  # Serial No
                    {"x": 440, "width": 135},  # Remark
                ]

                can.setFont("Helvetica", 8)

                for idx, row in enumerate(rows, 1):
                    srf = row[3] or ""
                    division = row[4] or ""
                    model = row[5] or ""
                    slno = row[6] or ""
                    remark = row[7] or ""

                    row_data = [str(idx), srf, division, model, str(slno), remark]

                    row_lines = []
                    for col, text in zip(columns, row_data):
                        words = str(text).split()
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

            # Draw both blocks
            draw_block(start_y_offset=0)  # First copy
            draw_block(start_y_offset=393)  # Second copy lower

            can.save()
            packet.seek(0)
            return PdfReader(packet)

        overlay = generate_overlay(rows, challan_number, challan_date, received_by)

        # Path to the static PDF template (use absolute path for portability, with path injection protection)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.normpath(os.path.join(base_dir, "..", "static"))
        template_path = safe_join(static_dir, "vendor_challan.pdf")

        # Read the template PDF
        try:
            with open(template_path, "rb") as f:
                template_bytes = f.read()
        except FileNotFoundError:
            raise FileNotFoundError(f"Template PDF not found at {template_path}")
        template_buffer = io.BytesIO(template_bytes)
        template_pdf = PdfReader(template_buffer)

        # Merge overlays
        writer = PdfWriter()
        for i in range(len(template_pdf.pages)):
            page = template_pdf.pages[i]
            overlay_page = overlay.pages[min(i, len(overlay.pages) - 1)]
            page.merge_page(overlay_page)
            writer.add_page(page)

        output_stream = io.BytesIO()
        writer.write(output_stream)
        output_stream.seek(0)
        return output_stream

    async def list_received_by(self, session: AsyncSession):
        out_statement = select(OutOfWarranty.received_by).where(
            OutOfWarranty.received_by.isnot(None)
        )
        warranty_statement = select(Warranty.received_by).where(
            Warranty.received_by.isnot(None)
        )
        union_statement = out_statement.union(warranty_statement)
        result = await session.execute(union_statement)
        names = result.scalars().all()
        return names

    async def list_vendor_not_settled(self, session: AsyncSession):
        out_statement = select(
            OutOfWarranty.srf_number,
            Master.name,
            OutOfWarranty.model,
            OutOfWarranty.complaint_number,
            OutOfWarranty.vendor_cost1,
            OutOfWarranty.vendor_cost2,
            OutOfWarranty.vendor_paint_cost,
            OutOfWarranty.vendor_stator_cost,
            OutOfWarranty.vendor_leg_cost,
            OutOfWarranty.vendor_cost,
            OutOfWarranty.vendor_bill_number,
        ).where(
            (OutOfWarranty.final_status == "Y")
            & (OutOfWarranty.vendor_date2.isnot(None))
            & (OutOfWarranty.vendor_settlement_date.is_(None))
            & (Master.code == OutOfWarranty.code)
        )
        warranty_statement = select(
            Warranty.srf_number,
            Master.name,
            Warranty.model,
            Warranty.complaint_number,
            Warranty.vendor_cost1,
            Warranty.vendor_cost2,
            Warranty.vendor_paint_cost,
            Warranty.vendor_stator_cost,
            Warranty.vendor_leg_cost,
            Warranty.vendor_cost,
            Warranty.vendor_bill_number,
        ).where(
            (Warranty.final_status == "Y")
            & (Warranty.vendor_date2.isnot(None))
            & (Warranty.vendor_settlement_date.is_(None))
            & (Master.code == Warranty.code)
        )
        union_statement = out_statement.union_all(warranty_statement).order_by(
            "srf_number"
        )
        result = await session.execute(union_statement)
        rows = result.all()
        return [
            VendorNotSettledRecord(
                srf_number=row.srf_number,
                name=row.name,
                model=row.model,
                complaint_number=row.complaint_number,
                vendor_cost1=row.vendor_cost1,
                vendor_cost2=row.vendor_cost2,
                vendor_paint_cost=row.vendor_paint_cost,
                vendor_stator_cost=row.vendor_stator_cost,
                vendor_leg_cost=row.vendor_leg_cost,
                vendor_cost=row.vendor_cost,
                vendor_bill_number=row.vendor_bill_number,
            )
            for row in rows
        ]

    async def update_vendor_unsettled(
        self, list_vendor: List[UpdateVendorUnsettled], session: AsyncSession
    ):
        for vendor in list_vendor:
            if vendor.srf_number.startswith("R"):
                statement = select(Warranty).where(
                    Warranty.srf_number == vendor.srf_number
                )
                result = await session.execute(statement)
                existing_vendor = result.scalar_one_or_none()
                if existing_vendor:
                    existing_vendor.vendor_settlement_date = (
                        vendor.vendor_settlement_date
                    )
                    existing_vendor.vendor_bill_number = vendor.vendor_bill_number
            if vendor.srf_number.startswith("S"):
                statement = select(OutOfWarranty).where(
                    OutOfWarranty.srf_number == vendor.srf_number
                )
                result = await session.execute(statement)
                existing_vendor = result.scalar_one_or_none()
                if existing_vendor:
                    existing_vendor.vendor_settlement_date = (
                        vendor.vendor_settlement_date
                    )
                    existing_vendor.vendor_bill_number = vendor.vendor_bill_number
        await session.commit()

    async def list_final_vendor_settlement(self, session: AsyncSession):
        out_statement = select(
            OutOfWarranty.srf_number,
            Master.name,
            OutOfWarranty.model,
            OutOfWarranty.complaint_number,
            OutOfWarranty.vendor_cost1,
            OutOfWarranty.vendor_cost2,
            OutOfWarranty.vendor_paint_cost,
            OutOfWarranty.vendor_stator_cost,
            OutOfWarranty.vendor_leg_cost,
            OutOfWarranty.vendor_cost,
        ).where(
            (OutOfWarranty.vendor_settled == "N")
            & (OutOfWarranty.vendor_settlement_date.isnot(None))
            & (Master.code == OutOfWarranty.code)
        )
        warranty_statement = select(
            Warranty.srf_number,
            Master.name,
            Warranty.model,
            Warranty.complaint_number,
            Warranty.vendor_cost1,
            Warranty.vendor_cost2,
            Warranty.vendor_paint_cost,
            Warranty.vendor_stator_cost,
            Warranty.vendor_leg_cost,
            Warranty.vendor_cost,
        ).where(
            (Warranty.vendor_settled == "N")
            & (Warranty.vendor_settlement_date.isnot(None))
            & (Master.code == Warranty.code)
        )
        union_statement = out_statement.union_all(warranty_statement).order_by(
            "srf_number"
        )
        result = await session.execute(union_statement)
        rows = result.all()
        return [
            VendorFinalSettlementRecord(
                srf_number=row.srf_number,
                name=row.name,
                model=row.model,
                complaint_number=row.complaint_number,
                vendor_cost1=row.vendor_cost1,
                vendor_cost2=row.vendor_cost2,
                vendor_paint_cost=row.vendor_paint_cost,
                vendor_stator_cost=row.vendor_stator_cost,
                vendor_leg_cost=row.vendor_leg_cost,
                vendor_cost=row.vendor_cost,
            )
            for row in rows
        ]

    async def update_final_vendor_settlement(
        self, list_vendor: List[UpdateVendorFinalSettlement], session: AsyncSession
    ):
        for vendor in list_vendor:
            if vendor.srf_number.startswith("R"):
                statement = select(Warranty).where(
                    Warranty.srf_number == vendor.srf_number
                )
                result = await session.execute(statement)
                existing_vendor = result.scalar_one_or_none()
                if existing_vendor:
                    existing_vendor.vendor_settled = vendor.vendor_settled
            if vendor.srf_number.startswith("S"):
                statement = select(OutOfWarranty).where(
                    OutOfWarranty.srf_number == vendor.srf_number
                )
                result = await session.execute(statement)
                existing_vendor = result.scalar_one_or_none()
                if existing_vendor:
                    existing_vendor.vendor_settled = vendor.vendor_settled
        await session.commit()

    async def update_complaint_number(
        self, data: VendorUpdateComplaintNumber, session: AsyncSession
    ):
        if await warranty_service.check_complaint_number_available(
            data.complaint_number, session
        ):
            raise ComplaintNumberAlreadyExists()
        statement = select(Warranty).where(Warranty.srf_number == data.srf_number)
        result = await session.execute(statement)
        existing_record = result.scalar_one_or_none()
        if existing_record:
            existing_record.complaint_number = data.complaint_number
        await session.commit()
