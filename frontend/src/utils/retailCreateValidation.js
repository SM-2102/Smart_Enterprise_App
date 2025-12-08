/**
 * @param {object} form
 * @returns {object} errors object
 */

function validateRetailCreate(form) {
  const errs = [];
  const errs_label = {};
  if (!form.division || form.division.trim() === "") {
    errs.push("Division is required");
    errs_label["division"] = "Division is required";
  }
  if (!form.amount || form.amount <= 0) {
    errs.push("Amount is required");
    errs_label["amount"] = "Amount is required";
  }
  if (!form.name || form.name.trim() === "") {
    errs.push("Name is required");
    errs_label["name"] = "Name is required";
  }
  if (!form.details || form.details.trim() === "") {
    errs.push("Details is required");
    errs_label["details"] = "Details is required";
  }
  if (!form.retail_date) {
    errs.push("Retail Date is required");
    errs_label.retail_date = true;
  }

  return [errs, errs_label];
}

export { validateRetailCreate };
