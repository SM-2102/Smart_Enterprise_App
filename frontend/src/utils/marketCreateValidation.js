/**
 * @param {object} form
 * @returns {object} errors object
 */

function validateMarketCreate(form) {
  const errs = [];
  const errs_label = {};
  if (!form.name || form.name.length < 3) {
    errs.push("Name is required");
    errs_label.name = true;
  }
  if (!form.division) {
    errs.push("Division is required");
    errs_label.division = true;
  }
  if (!form.receive_date) {
    errs.push("Receive Date is required");
    errs_label.receive_date = true;
  }
  if (!form.invoice_number) {
    errs.push("Invoice Number is required");
    errs_label.invoice_number = true;
  }
  if (!form.invoice_date) {
    errs.push("Invoice Date is required");
    errs_label.invoice_date = true;
  }
  if (!form.quantity || form.quantity < 1) {
    errs.push("Quantity is required");
    errs_label.quantity = true;
  }
  if (form.invoice_date && form.receive_date) {
    const invoiceDate = new Date(form.invoice_date);
    const receiveDate = new Date(form.receive_date);
    if (invoiceDate > receiveDate) {
      errs.push("Invoice Date is more than Receive Date");
      errs_label.invoice_date = true;
      errs_label.receive_date = true;
    }
  }
  if (form.challan_date) {
    const challanDate = new Date(form.challan_date);
    const invoiceDate = new Date(form.invoice_date);
    if (!isNaN(challanDate) && !isNaN(invoiceDate)) {
      if (challanDate > invoiceDate) {
        errs.push("Challan Date is more than Invoice Date");
        errs_label.challan_date = true;
        errs_label.invoice_date = true;
      }
    }
  }
  return [errs, errs_label];
}

export { validateMarketCreate };
