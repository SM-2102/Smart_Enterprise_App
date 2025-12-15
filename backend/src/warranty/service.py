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

from exceptions import IncorrectCodeFormat, WarrantyNotFound
from master.models import Master
from master.service import MasterService
from service_center.service import ServiceCenterService
from utils.date_utils import format_date_ddmmyyyy, parse_date
from utils.file_utils import safe_join, split_text_to_lines
from warranty.models import Warranty
from warranty.schemas import (
    WarrantyCreate,
    WarrantyEnquiry,
    WarrantyPending,
    WarrantySrfNumber,
    WarrantyUpdate,
    WarrantyUpdateResponse,
)

master_service = MasterService()
service_center_service = ServiceCenterService()


class WarrantyService:

    async def get_next_base_number(self, session: AsyncSession) -> int:
        statement = select(Warranty.srf_number)
        result = await session.execute(statement)
        srf_numbers = [
            row[0]
            for row in result.fetchall()
            if row[0] and row[0].startswith("R") and "/" in row[0]
        ]
        base_numbers = []
        for srf in srf_numbers:
            base, _ = srf.split("/")
            try:
                base_num = int(base[1:])
                base_numbers.append(base_num)
            except ValueError:
                continue
        if base_numbers:
            return max(base_numbers) + 1
        else:
            return 1

    async def create_warranty(
        self, session: AsyncSession, warranty: WarrantyCreate, token: dict
    ):
        parts = warranty.srf_number.split("/")
        if len(parts) != 2 or not parts[1].isdigit():
            raise IncorrectCodeFormat()
        sub_number = int(parts[1])
        if sub_number < 1 or sub_number > 8:
            raise IncorrectCodeFormat()

        # If frontend requests a new base, generate next base number
        base_part = parts[0]
        if base_part == "NEW":
            for _ in range(3):  # Retry up to 3 times
                next_base = await self.get_next_base_number(session)
                srf_number = f"R{str(next_base).zfill(5)}/1"
                warranty_data_dict = warranty.model_dump()
                warranty_data_dict["srf_number"] = srf_number
                master = await master_service.get_master_by_name(warranty.name, session)
                if warranty.head == "REPLACE":
                    await service_center_service.check_service_center_name_available(
                        warranty.asc_name, session
                    )
                warranty_data_dict["created_by"] = token["user"]["username"]
                warranty_data_dict["code"] = master.code
                for date_field in ["srf_date"]:
                    if date_field in warranty_data_dict:
                        warranty_data_dict[date_field] = parse_date(
                            warranty_data_dict[date_field]
                        )
                warranty_data_dict.pop("name", None)
                new_warranty = Warranty(**warranty_data_dict)
                session.add(new_warranty)
                try:
                    await session.commit()
                    return new_warranty
                except IntegrityError:
                    await session.rollback()
        else:
            # Use the base provided by frontend, just validate sub-number
            warranty_data_dict = warranty.model_dump()
            master = await master_service.get_master_by_name(warranty.name, session)
            if warranty.head == "REPLACE":
                await service_center_service.check_service_center_name_available(
                    warranty.asc_name, session
                )
            warranty_data_dict["created_by"] = token["user"]["username"]
            warranty_data_dict["code"] = master.code
            for date_field in ["srf_date"]:
                if date_field in warranty_data_dict:
                    warranty_data_dict[date_field] = parse_date(
                        warranty_data_dict[date_field]
                    )
            warranty_data_dict.pop("name", None)
            new_warranty = Warranty(**warranty_data_dict)
            session.add(new_warranty)
            await session.commit()
            return new_warranty

    async def warranty_next_code(self, session: AsyncSession):
        next_base_number = await self.get_next_base_number(session)
        next_srf_number = "R" + str(next_base_number).zfill(5)
        return next_srf_number

    async def list_warranty_pending(self, session: AsyncSession):
        statement = (
            select(Warranty, Master)
            .join(Master, Warranty.code == Master.code)
            .where(Warranty.final_status == "N")
            .order_by(Warranty.srf_number)
        )
        result = await session.execute(statement)
        rows = result.all()
        return [
            WarrantyPending(
                srf_number=row.Warranty.srf_number,
                name=row.Master.name,
            )
            for row in rows
        ]

    async def get_warranty_by_srf_number(self, srf_number: str, session: AsyncSession):
        if len(srf_number) != 8:
            if srf_number.__contains__("/"):
                srf_number = "R" + srf_number.zfill(7)
            else:
                base = srf_number.split("/")[0]
                srf_number = "R" + base.zfill(5) + "/1"
        if not srf_number.startswith("R"):
            raise IncorrectCodeFormat()
        statement = (
            select(Warranty, Master.name)
            .join(Master, Warranty.code == Master.code)
            .where(Warranty.srf_number == srf_number)
        )
        result = await session.execute(statement)
        row = result.first()
        if row:
            return WarrantyUpdateResponse(
                srf_number=row.Warranty.srf_number,
                name=row.name,
                srf_date=format_date_ddmmyyyy(row.Warranty.srf_date),
                division=row.Warranty.division,
                model=row.Warranty.model,
                serial_number=row.Warranty.serial_number,
                cg_srf_number=row.Warranty.cg_srf_number,
                challan_number=row.Warranty.challan_number,
                challan_date=format_date_ddmmyyyy(row.Warranty.challan_date),
                received_by=row.Warranty.received_by,
                vendor_date2=row.Warranty.vendor_date2,
                vendor_cost2=row.Warranty.vendor_cost2,
                rewinding_done=row.Warranty.rewinding_done,
                repair_date=row.Warranty.repair_date,
                other_cost=row.Warranty.other_cost,
                vendor_paint=row.Warranty.vendor_paint,
                vendor_stator=row.Warranty.vendor_stator,
                vendor_leg=row.Warranty.vendor_leg,
                vendor_paint_cost=row.Warranty.vendor_paint_cost,
                vendor_stator_cost=row.Warranty.vendor_stator_cost,
                vendor_leg_cost=row.Warranty.vendor_leg_cost,
                vendor_cost=row.Warranty.vendor_cost,
                work_done=row.Warranty.work_done,
                spare1=row.Warranty.spare1,
                cost1=row.Warranty.cost1,
                spare2=row.Warranty.spare2,
                cost2=row.Warranty.cost2,
                spare3=row.Warranty.spare3,
                cost3=row.Warranty.cost3,
                spare4=row.Warranty.spare4,
                cost4=row.Warranty.cost4,
                spare5=row.Warranty.spare5,
                cost5=row.Warranty.cost5,
                spare6=row.Warranty.spare6,
                cost6=row.Warranty.cost6,
                spare_cost=row.Warranty.spare_cost,
                godown_cost=row.Warranty.godown_cost,
                discount=row.Warranty.discount,
                total=row.Warranty.total,
                gst=row.Warranty.gst,
                gst_amount=row.Warranty.gst_amount,
                round_off=row.Warranty.round_off,
                final_amount=row.Warranty.final_amount,
                receive_amount=row.Warranty.receive_amount,
                delivery_date=row.Warranty.delivery_date,
                complaint_number=row.Warranty.complaint_number,
                pc_number=row.Warranty.pc_number,
                invoice_number=row.Warranty.invoice_number,
                dealer_name=row.Warranty.dealer_name,
                rpm=row.Warranty.rpm,
                purchase_number=row.Warranty.purchase_number,
                purchase_date=row.Warranty.purchase_date,
                customer_challan_number=row.Warranty.customer_challan_number,
                customer_challan_date=row.Warranty.customer_challan_date,
            )
        else:
            raise WarrantyNotFound()

    async def update_warranty(
        self,
        srf_number: str,
        warranty: WarrantyUpdate,
        session: AsyncSession,
        token: dict,
    ):
        statement = select(Warranty).where(Warranty.srf_number == srf_number)
        result = await session.execute(statement)
        existing_warranty = result.scalars().first()
        if not existing_warranty:
            raise WarrantyNotFound()
        for var, value in vars(warranty).items():
            setattr(existing_warranty, var, value)
        existing_warranty.updated_by = token["user"]["username"]
        session.add(existing_warranty)
        await session.commit()
        await session.refresh(existing_warranty)
        return existing_warranty

    async def list_delivered_by(self, session: AsyncSession):
        statement = (
            select(Warranty.delivered_by)
            .distinct()
            .where(Warranty.delivered_by.isnot(None))
        )
        result = await session.execute(statement)
        names = result.scalars().all()
        return names

    async def last_srf_number(self, session: AsyncSession):
        statement = (
            select(Warranty.srf_number).order_by(Warranty.srf_number.desc()).limit(1)
        )
        result = await session.execute(statement)
        last_srf_number = result.scalar()
        last_srf_number = last_srf_number.split("/")[0] if last_srf_number else None
        return last_srf_number

    async def print_srf(self, srf_number: str, token: dict, session: AsyncSession) -> io.BytesIO:

        # Normalize input SRF number
        if len(srf_number) > 6:
            raise ValueError()
        if not srf_number.startswith('R'):
            srf_number = "R" + srf_number.zfill(5)

        # Fetch all rows for this SRF
        statement = (
            select(Warranty, Master)
            .join(Master, Warranty.code == Master.code)
            .where(Warranty.srf_number.like(f"{srf_number}/%"))
        )
        result = await session.execute(statement)
        rows = result.fetchall()

        if not rows:
            raise WarrantyNotFound()

        # Extract master and warranty details from the first row
        first_row = rows[0]
        warranty = first_row.Warranty
        master = first_row.Master

        srf_no = warranty.srf_number[:6]
        srf_date = warranty.srf_date.strftime("%d-%m-%Y") if warranty.srf_date else ""
        code = warranty.code
        master_code = master.code
        master_details = await master_service.get_master_details(master_code, session)
        name = master_details["name"]
        address = master_details["full_address"]
        contact1 = master_details["contact1"]
        gst = master_details.get("gst", "") or ""
        received_by = token["user"]["username"]

        # Prepare table rows for pages
        page1_rows = []
        page2_rows = []

        for idx, row in enumerate(rows, 1):
            w = row.Warranty
            # Page 1 columns: index, division, model, serial_number, srf_number, remark
            page1_rows.append([
                str(idx),
                w.division or "",
                w.model or "",
                str(w.serial_number or ""),
                w.srf_number,
                w.remark or "",
            ])
            # Page 2 columns: index, division, model, serial_number, complaint_number, sticker_number
            page2_rows.append([
                str(idx),
                w.division or "",
                w.model or "",
                str(w.serial_number or ""),
                w.complaint_number or "",
                w.sticker_number or "",
            ])

        def generate_overlay(rows, columns):
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=(595.27, 841.89))  # A4 in points
            width, height = 595.27, 841.89

            # Header details
            can.setFont("Helvetica-Bold", 10)
            can.drawString(140, 690, srf_no)
            can.drawString(485, 690, srf_date)
            can.drawString(375, 690, code)
            can.drawString(220, 651, name)
            can.drawString(220, 626, address)
            can.drawString(220, 601, contact1)
            can.drawString(475, 601, gst)
            can.drawString(375, 187, received_by)

            start_y = 541
            y = start_y
            line_spacing = 10
            min_row_height = 20
            row_padding = 6

            # Prepare columns with x positions and widths
            column_defs = [
                {"x": 40, "width": 20},
                {"x": 70, "width": 50},
                {"x": 135, "width": 124},
                {"x": 263, "width": 97},
                {"x": 365, "width": 105},
                {"x": 472, "width": 98},
            ]
            can.setFont("Helvetica", 9)

            for row in rows:
                row_lines = []
                for col_def, text in zip(column_defs, row):
                    words = str(text).split()
                    lines = []
                    line = ""
                    for word in words:
                        test_line = line + (" " if line else "") + word
                        if stringWidth(test_line, "Helvetica", 9) <= col_def["width"]:
                            line = test_line
                        else:
                            lines.append(line)
                            line = word
                    if line:
                        lines.append(line)
                    row_lines.append(lines)

                max_lines = max(len(lines) for lines in row_lines)
                row_height = max(max_lines * line_spacing, min_row_height)

                if y - row_height < 100:  # simple page break
                    can.showPage()
                    can.setFont("Helvetica", 9)
                    y = height - 50

                for col_def, lines in zip(column_defs, row_lines):
                    total_text_height = len(lines) * line_spacing
                    vertical_offset = (row_height - total_text_height) / 2
                    for i, ln in enumerate(lines):
                        text_width = stringWidth(ln, "Helvetica", 9)
                        center_x = col_def["x"] + col_def["width"] / 2 - text_width / 2
                        y_position = y - vertical_offset - (i * line_spacing)
                        can.drawString(center_x, y_position, ln)

                y -= row_height + row_padding

            can.save()
            packet.seek(0)
            return PdfReader(packet)

        overlay_customer = generate_overlay(page1_rows, columns=6)
        overlay_asc = generate_overlay(page2_rows, columns=6)

        # Read the template PDF
        base_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.normpath(os.path.join(base_dir, "..", "static"))
        template_path = safe_join(static_dir, "warranty_srf.pdf")
        try:
            with open(template_path, "rb") as f:
                template_bytes = f.read()
        except FileNotFoundError:
            raise FileNotFoundError(f"Template PDF not found at {template_path}")

        template_pdf = PdfReader(io.BytesIO(template_bytes))
        writer = PdfWriter()

        # Merge overlays
        page1 = template_pdf.pages[0]
        page1.merge_page(overlay_customer.pages[0])
        writer.add_page(page1)

        if len(template_pdf.pages) > 1:
            page2 = template_pdf.pages[1]
            page2.merge_page(overlay_asc.pages[0])
            writer.add_page(page2)

        output_stream = io.BytesIO()
        writer.write(output_stream)
        output_stream.seek(0)
        return output_stream


    async def enquiry_warranty(
        self,
        session: AsyncSession,
        final_status: Optional[str] = None,
        vendor_settled: Optional[str] = None,
        name: Optional[str] = None,
        division: Optional[str] = None,
        from_srf_date: Optional[date] = None,
        to_srf_date: Optional[date] = None,
        delivered_by: Optional[str] = None,
        delivered: Optional[str] = None,
        received: Optional[str] = None,
        repaired: Optional[str] = None,
        head: Optional[str] = None,
    ):

        statement = select(Warranty, Master).join(Master, Warranty.code == Master.code)

        if final_status:
            statement = statement.where(Warranty.final_status == final_status)

        if vendor_settled:
            statement = statement.where(Warranty.vendor_settled == vendor_settled)

        if name:
            statement = statement.where(Master.name.ilike(f"%{name}%"))

        if division:
            statement = statement.where(Warranty.division == division)

        if from_srf_date:
            statement = statement.where(Warranty.srf_date >= from_srf_date)

        if to_srf_date:
            statement = statement.where(Warranty.srf_date <= to_srf_date)
        if delivered_by:
            statement = statement.where(
                Warranty.delivered_by.ilike(f"%{delivered_by}%")
            )
        if delivered:
            if delivered == "Y":
                statement = statement.where(Warranty.delivery_date.isnot(None))
            else:
                statement = statement.where(Warranty.delivery_date.is_(None))
        if received:
            if received == "Y":
                statement = statement.where(
                    Warranty.receive_date.isnot(None) & (Warranty.head == "REPLACE")
                )
            else:
                statement = statement.where(
                    Warranty.receive_date.is_(None) & (Warranty.head == "REPLACE")
                )

        if repaired:
            if repaired == "Y":
                statement = statement.where(
                    Warranty.repair_date.isnot(None) & (Warranty.head == "REPAIR")
                )
            else:
                statement = statement.where(
                    Warranty.repair_date.is_(None) & (Warranty.head == "REPAIR")
                )
        if head:
            statement = statement.where(Warranty.head == head)
        statement = statement.order_by(Warranty.srf_number)

        result = await session.execute(statement)
        rows = result.all()

        return [
            WarrantyEnquiry(
                srf_number=row.Warranty.srf_number,
                srf_date=format_date_ddmmyyyy(row.Warranty.srf_date),
                name=row.Master.name,
                model=row.Warranty.model,
                receive_date=(
                    format_date_ddmmyyyy(row.Warranty.receive_date)
                    if row.Warranty.receive_date
                    else ""
                ),
                repair_date=(
                    format_date_ddmmyyyy(row.Warranty.repair_date)
                    if row.Warranty.repair_date
                    else ""
                ),
                delivery_date=(
                    format_date_ddmmyyyy(row.Warranty.delivery_date)
                    if row.Warranty.delivery_date
                    else ""
                ),
                final_status=row.Warranty.final_status,
                head=row.Warranty.head,
                contact1=row.Master.contact1,
                contact2=row.Master.contact2,
            )
            for row in rows
        ]
