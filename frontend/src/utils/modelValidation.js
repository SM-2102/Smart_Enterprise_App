/**
 * @param {object} form
 * @returns {object} errors object
 */
function validateModel(form) {
  const errors = [];
  const errors_label = {};
  if (!form.division) {
    errors.push("Division is required");
    errors_label.division = true;
  }
  if (!form.model) {
    errors.push("Model is required");
    errors_label.model = true;
  }
  if (!form.rewinding_charge) {
    errors.push("Rewinding Rate is required");
    errors_label.rewinding_charge = true;
  }
  if (form.division == "LT MOTOR") {
    if (!form.frame) {
      errors.push("Frame is required");
      errors_label.frame = true;
    }
  }
  if (form.division == "FHP MOTOR") {
    if (!form.hp_rating) {
      errors.push("HP Rating is required");
      errors_label.hp_rating = true;
    }
    if (!form.rewinding_type) {
      errors.push("Rewinding type is required");
      errors_label.rewinding_type = true;
    }
  }
  return [errors, errors_label];
}

export { validateModel };
