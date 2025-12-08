/**
 * @param {object} form
 * @returns {object} errors object
 */

function parseDDMMYYYY(dateStr) {
  if (!dateStr) return NaN;
  const [dd, mm, yyyy] = dateStr.split("-");
  return new Date(`${yyyy}-${mm}-${dd}`);
}

function validateOutOfWarrantyUpdate(form) {
  const errs = [];
  const errs_label = {};
  // Validate each spare row (max 6)
  for (let i = 1; i <= 6; i++) {
    const desc = form[`spare${i}`];
    const qty = form[`cost${i}`];
    // Only validate if description is present
    if (desc && !qty) {
      errs.push(`Cost for Spare ${i} is required`);
      errs_label[`cost${i}`] = true;
    }
  }
  if (!form.vendor_date1 && form.vendor_date2) {
    errs.push("Create Challan First");
    errs_label["vendor_date1"] = true;
  }
  if (form.vendor_date1 && !form.vendor_date2 && form.repair_date) {
    errs.push("Return Date Required");
    errs_label["repair_date"] = true;
  }
  if (form.repair_date && !form.estimate_date) {
    errs.push("Estimate Date Required");
    errs_label["estimate_date"] = true;
  }
  if (form.estimate_date && form.vendor_date1 && !form.vendor_date2) {
    errs.push("Return Date Required");
    errs_label["vendor_date2"] = true;
  }
  if (!form.repair_date && form.delivery_date) {
    errs.push("Repair Date Required");
    errs_label["repair_date"] = true;
  }
  if (form.vendor_cost1 > 0 && !form.vendor_date1) {
    errs.push("Vendor Dates Required");
    errs_label["vendor_date2"] = true;
  }
  if (form.vendor_date1 && form.vendor_date2) {
    const vendorDate1 = new Date(form.vendor_date1);
    const vendorDate2 = new Date(form.vendor_date2);
    if (!isNaN(vendorDate1) && !isNaN(vendorDate2)) {
      if (vendorDate1 > vendorDate2) {
        errs.push("Invalid Return Date");
        errs_label["vendor_date2"] = true;
      }
    }
  }

  if (form.estimate_date) {
    const estimateDate = new Date(form.estimate_date);
    const srfDate = parseDDMMYYYY(form.srf_date);
    if (!isNaN(estimateDate) && !isNaN(srfDate)) {
      if (srfDate > estimateDate) {
        errs.push("Invalid Estimate Date");
        errs_label["estimate_date"] = true;
      }
    }
  }

  if (form.estimate_date && form.repair_date) {
    const estimateDate = new Date(form.estimate_date);
    const repairDate = new Date(form.repair_date);
    if (!isNaN(estimateDate) && !isNaN(repairDate)) {
      if (estimateDate > repairDate) {
        errs.push("Invalid Repair Date");
        errs_label["repair_date"] = true;
      }
    }
  }

  if (form.vendor_date2 && form.repair_date) {
    const vendorDate2 = new Date(form.vendor_date2);
    const repairDate = new Date(form.repair_date);
    if (!isNaN(vendorDate2) && !isNaN(repairDate)) {
      if (vendorDate2 > repairDate) {
        errs.push("Invalid Repair Date");
        errs_label["repair_date"] = true;
      }
    }
  }
  if (form.repair_date && form.delivery_date) {
    const repairDate = new Date(form.repair_date);
    const deliveryDate = new Date(form.delivery_date);
    if (!isNaN(repairDate) && !isNaN(deliveryDate)) {
      if (repairDate > deliveryDate) {
        errs.push("Invalid Delivery Date");
        errs_label["delivery_date"] = true;
      }
    }
  }
  const minVendorRewinding = form.rewinding_cost * 0.8;
  const minVendorOther = form.other_cost * 0.8;

  if (form.rewinding_cost) {
    if (form.vendor_cost1 > minVendorRewinding) {
      errs.push("Vendor Rewinding Cost Too High");
      errs_label["vendor_cost1"] = true;
    }
  }

  if (form.other_cost) {
    if (form.vendor_cost2 > minVendorOther) {
      errs.push("Vendor Other Cost Too High");
      errs_label["vendor_cost2"] = true;
    }
  }

  if (form.delivery_date && !form.work_done) {
    errs.push("Work Done is required");
    errs_label["work_done"] = true;
  }

  if (form.delivery_date && form.receive_amount < form.final_amount) {
    errs.push("Full Payment Not Received");
    errs_label["receive_amount"] = true;
  }
  if (form.delivery_date && form.receive_amount > form.final_amount) {
    errs.push("Excess Payment Received");
    errs_label["receive_amount"] = true;
  }

  if (form.final_status === "Y") {
    if (!form.delivery_date) {
      errs.push("Delivery Date is required");
      errs_label["delivery_date"] = true;
    }
    if (!form.pc_number && form.gst === "N") {
      errs.push("PC Number is required");
      errs_label["pc_number"] = true;
    }
    if (!form.invoice_number && form.gst === "Y") {
      errs.push("Invoice Number is required");
      errs_label["invoice_number"] = true;
    }
    if (form.vendor_cost1 && !form.rewinding_cost) {
      errs.push("Rewinding Cost is required");
      errs_label["rewinding_cost"] = true;
    }
    if (form.vendor_cost2 && !form.other_cost) {
      errs.push("Other Cost is required");
      errs_label["other_cost"] = true;
    }
  }

  return [errs, errs_label];
}

export { validateOutOfWarrantyUpdate };
