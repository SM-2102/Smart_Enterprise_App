/**
 * @param {object} form
 * @param {object} items
 * @returns {object} errors object
 */

function validateChallan(form, items) {
  const errs = [];
  const errs_label = {};
  if (!form.name || form.name.length < 3) {
    errs.push("Name is required");
    errs_label.name = true;
  }
  if (!form.challan_date) {
    errs.push("Challan date is required");
    errs_label.challan_date = true;
  }
  if (!items[0].desc) {
    errs.push("Description 1 is required");
    errs_label.desc1 = true;
  }
  // Validate each item row
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.desc && (!item.qty || !item.unit)) {
      if (!item.qty) {
        errs.push(`Quantity ${i + 1} is required`);
        errs_label[`qty${i + 1}`] = true;
      }
      if (!item.unit) {
        errs.push(`Unit ${i + 1} is required`);
        errs_label[`unit${i + 1}`] = true;
      }
    }
  }
  if (!form.remark || form.remark.length < 1) {
    errs.push("Remark is required");
    errs_label.remark = true;
  }
  return [errs, errs_label];
}

export { validateChallan };
