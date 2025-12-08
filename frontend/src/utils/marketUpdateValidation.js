/**
 * @param {object} form
 * @returns {object} errors object
 */

function validateMarketUpdate(form) {
  const errs = [];
  const errs_label = {};
  if (form.delivery_date) {
    const deliveryDate = new Date(form.delivery_date);
    const receiveDate = new Date(form.receive_date);
    if (!isNaN(deliveryDate) && !isNaN(receiveDate)) {
      if (deliveryDate < receiveDate) {
        errs.push("Delivery Date is less than Receive Date");
        errs_label.delivery_date = true;
        errs_label.receive_date = true;
      }
    }
  }
  if (form.final_status === "Y") {
    if (!form.delivery_by) {
      errs.push("Delivered By is required");
      errs_label.delivery_by = true;
    }
    if (!form.delivery_date) {
      errs.push("Delivery Date is required");
      errs_label.delivery_date = true;
    }
  }

  return [errs, errs_label];
}

export { validateMarketUpdate };
