/**
 * @param {object} form
 * @returns {object} errors object
 */

function validateOutOfWarrantySRFCreate(form) {
  const errs = [];
  const errs_label = {};
  if (!form.name || form.name.length < 3) {
    errs.push("Name is required");
    errs_label.name = true;
  }
  if (!form.srf_date) {
    errs.push("SRF Date is required");
    errs_label.srf_date = true;
  }
  if (!form.division) {
    errs.push("Division is required");
    errs_label.division = true;
  }
  if (form.division == "PUMP") {
    if (!form.head) {
      errs.push("Head is required");
      errs_label.head = true;
    }
  }
  if (!form.service_charge) {
    errs.push("Service Charge is required");
    errs_label.service_charge = true;
  }
  if (form.service_charge_waive == "Y") {
    if (!form.collection_date) {
      errs.push("Collection Date is required");
      errs_label.collection_date = true;
    }
    if (!form.waive_details) {
      errs.push("Waive Details is required");
      errs_label.waive_details = true;
    }
  }
  if (!form.model) {
    errs.push("Model is required");
    errs_label.model = true;
  }
  if (!form.problem) {
    errs.push("Problem is required");
    errs_label.problem = true;
  }

  if (!form.serial_number) {
    errs.push("Serial Number is required");
    errs_label.serial_number = true;
  }

  return [errs, errs_label];
}

export { validateOutOfWarrantySRFCreate };
