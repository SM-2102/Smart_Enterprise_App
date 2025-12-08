/**
 * @param {object} form
 * @returns {object} errors object
 */

function parseDDMMYYYY(dateStr) {
  if (!dateStr) return NaN;
  const [dd, mm, yyyy] = dateStr.split("-");
  return new Date(`${yyyy}-${mm}-${dd}`);
}

function validateWarrantyUpdate(form) {
  const errs = [];
  const errs_label = {};
  if (form.head == "REPLACE") {
    if (form.receive_date && !form.challan_date) {
      errs.push("Challan Creation is required");
      errs_label.challan_date = true;
    }
    if (form.receive_date && !form.invoice_date) {
      errs.push("Invoice Date is required");
      errs_label.invoice_date = true;
    }
    if (form.receive_date && !form.invoice_number) {
      errs.push("Invoice Number is required");
      errs_label.invoice_number = true;
    }
    if (form.delivery_date && !form.receive_date) {
      errs.push("Receive Date is required");
      errs_label.receive_date = true;
    }
    if (form.delivery_date && !form.invoice_date) {
      errs_label.invoice_date = true;
      errs.push("Invoice Date is required");
    }
    if (form.delivery_date && !form.invoice_number) {
      errs.push("Invoice Number is required");
      errs_label.invoice_number = true;
    }
  }
  if (form.head == "REPAIR") {
    if (form.delivery_date && !form.complaint_number) {
      errs.push("Complaint Number is required");
      errs_label.complaint_number = true;
    }
    if (form.delivery_date && !form.repair_date) {
      errs.push("Repair Date is required");
      errs_label.repair_date = true;
    }
  }

  if (form.challan_date) {
    const challanDate = new Date(form.challan_date);
    const receiveDate = new Date(form.receive_date);
    const repairDate = new Date(form.repair_date);
    const invoiceDate = new Date(form.invoice_date);
    if (!isNaN(challanDate) && !isNaN(receiveDate)) {
      if (challanDate > receiveDate) {
        errs.push("Challan Date is greater than Receive Date");
        errs_label.challan_date = true;
        errs_label.receive_date = true;
      }
    }
    if (!isNaN(challanDate) && !isNaN(repairDate)) {
      if (challanDate > repairDate) {
        errs.push("Challan Date is greater than Repair Date");
        errs_label.challan_date = true;
        errs_label.repair_date = true;
      }
    }
    if (!isNaN(challanDate) && !isNaN(invoiceDate)) {
      if (challanDate > invoiceDate) {
        errs.push("Challan Date is greater than Invoice Date");
        errs_label.challan_date = true;
        errs_label.invoice_date = true;
      }
    }
  }
  if (form.repair_date) {
    const repairDate = new Date(form.repair_date);
    const srfDate = parseDDMMYYYY(form.srf_date);
    if (!isNaN(repairDate) && !isNaN(srfDate)) {
      if (repairDate < srfDate) {
        errs.push("Repair Date is less than SRF Date");
        errs_label.repair_date = true;
        errs_label.srf_date = true;
      }
    }
  }
  if (form.receive_date) {
    const receiveDate = new Date(form.receive_date);
    const srfDate = parseDDMMYYYY(form.srf_date);
    const invoiceDate = new Date(form.invoice_date);
    if (!isNaN(receiveDate) && !isNaN(srfDate)) {
      if (receiveDate < srfDate) {
        errs.push("Receive Date is less than SRF Date");
        errs_label.receive_date = true;
        errs_label.srf_date = true;
      }
    }
    if (!isNaN(receiveDate) && !isNaN(invoiceDate)) {
      if (receiveDate < invoiceDate) {
        errs.push("Receive Date is less than Invoice Date");
        errs_label.receive_date = true;
        errs_label.invoice_date = true;
      }
    }
  }
  if (form.delivery_date) {
    const deliveryDate = new Date(form.delivery_date);
    const receiveDate = new Date(form.receive_date);
    const repairDate = new Date(form.repair_date);
    if (!isNaN(deliveryDate) && !isNaN(receiveDate)) {
      if (deliveryDate < receiveDate) {
        errs.push("Delivery Date is less than Receive Date");
        errs_label.delivery_date = true;
        errs_label.receive_date = true;
      }
    }
    if (!isNaN(deliveryDate) && !isNaN(repairDate)) {
      if (deliveryDate < repairDate) {
        errs.push("Delivery Date is less than Repair Date");
        errs_label.delivery_date = true;
        errs_label.repair_date = true;
      }
    }
  }
  if (form.final_status === "Y") {
    if (!form.delivered_by) {
      errs.push("Delivered By is required");
      errs_label.delivered_by = true;
    }
    if (!form.delivery_date) {
      errs.push("Delivery Date is required");
      errs_label.delivery_date = true;
    }
  }

  return [errs, errs_label];
}

export { validateWarrantyUpdate };
