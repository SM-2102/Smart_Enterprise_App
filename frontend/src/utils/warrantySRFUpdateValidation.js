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
  if (!form.challan_date && form.vendor_date2) {
    errs.push("Create Challan First");
    errs_label["challan_date"] = true;
  }
  if (form.challan_date && !form.vendor_date2 && form.repair_date) {
    errs.push("Return Date Required");
    errs_label["repair_date"] = true;
  }
  if (form.challan_date && !form.vendor_date2) {
    errs.push("Return Date Required");
    errs_label["vendor_date2"] = true;
  }
  if (!form.repair_date && form.delivery_date) {
    errs.push("Repair Date Required");
    errs_label["repair_date"] = true;
  }
  if (form.vendor_cost1 > 0 && !form.challan_date) {
    errs.push("Vendor Dates Required");
    errs_label["vendor_date2"] = true;
  }
  if (form.challan_date && form.vendor_date2) {
    const vendorDate1 = new Date(form.challan_date);
    const vendorDate2 = new Date(form.vendor_date2);
    if (!isNaN(vendorDate1) && !isNaN(vendorDate2)) {
      if (vendorDate1 > vendorDate2) {
        errs.push("Invalid Return Date");
        errs_label["vendor_date2"] = true;
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
  const minVendorOther = form.other_cost * 0.8;

  if (form.other_cost) {
    if (form.vendor_cost2 > minVendorOther) {
      errs.push("Vendor Other Cost Too High");
      errs_label["other_cost"] = true;
    }
  }

  if (form.rewinding_done === "Y" && form.rewinding_cost) {
    const minCustomerCost = Number(form.rewinding_base_cost || 0);

    if (form.rewinding_cost < minCustomerCost) {
      errs.push("Rewinding Cost too Low");
      errs_label["rewinding_cost"] = true;
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
  if(form.chargeable === 'N' && form.final_amount > 0)
  {
   errs.push("Make the record chargeable");
      errs_label["final_amount"] = true; 
  }

  return [errs, errs_label];
}

export { validateWarrantyUpdate };
