/**
 * @param {object} form
 * @returns {object} errors object
 */

function validateWarrantySRFCreate(form) {
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
  if (!form.model) {
    errs.push("Model is required");
    errs_label.model = true;
  }
  if (!form.head) {
    errs.push("Head is required");
    errs_label.head = true;
  }
  if (!form.problem) {
    errs.push("Problem is required");
    errs_label.problem = true;
  }
  if (!form.serial_number) {
    errs.push("Serial Number is required");
    errs_label.serial_number = true;
  }
  if (form.head === "REPLACE" && !form.sticker_number) {
    errs.push("Sticker Number is required");
    errs_label.sticker_number = true;
  }
  if (form.head === "REPLACE" && !form.asc_name) {
    errs.push("ASC Name is required");
    errs_label.asc_name = true;
  }
  if (form.head === "REPLACE" && !form.complaint_number) {
    errs.push("Complaint Number is required");
    errs_label.complaint_number = true;
  }
  return [errs, errs_label];
}

export { validateWarrantySRFCreate };
