import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";

import { validateModel } from "../utils/modelValidation";
import { createModel } from "../services/modelCreateService";
import { getRewindingCharge } from "../services/modelRewindingRateCreationService";

const initialForm = {
  division: "",
  model: "",
  frame: "",
  hp_rating: "",
  rewinding_type: "",
  rewinding_charge: "",
};

const divisionOptions = [
  "FANS",
  "PUMP",
  "SDA",
  "LIGHT",
  "IWH",
  "SWH",
  "COOLER",
  "FHP MOTOR",
  "LT MOTOR",
  "HT MOTOR",
  "ALTERNATOR",
  "OTHERS",
];

const ModelCreatePage = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rewindingLoading, setRewindingLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Special handling when division changes: clear dependent fields and set defaults
    if (name === "division") {
      const newDivision = value;
      const isLt = newDivision === "LT MOTOR";
      // Clear dependent fields on any division change. For LT, set rewinding_type to Copper.
      setForm((prev) => ({
        ...prev,
        division: newDivision,
        frame: "",
        hp_rating: "",
        rewinding_type: isLt ? "Copper" : "",
        rewinding_charge: "",
      }));
      setError((prev) => ({ ...prev, division: undefined }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const [errs, errs_label] = validateModel(form);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowToast(false);
    if (errs.length > 0) {
      setError({
        message: errs[0],
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    setSubmitting(true);
    try {
      const { code, ...rest } = form;
      const payload = Object.fromEntries(
        Object.entries(rest).map(([k, v]) => [k, v === "" ? null : v]),
      );
      await createModel(payload);
      setError({
        message: "Model record created successfully!",
        resolution: "Model Name : " + form.model,
        type: "success",
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Failed to create model.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch rewinding charge when division is LT MOTOR or FHP MOTOR
  useEffect(() => {
    const shouldFetch = form.division === "LT MOTOR" || form.division === "FHP MOTOR";
    if (!shouldFetch) return;

    let mounted = true;
    const fetchCharge = async () => {
      setRewindingLoading(true);
      try {
        const hp = form.hp_rating === "" ? null : parseFloat(form.hp_rating);
        const payload = {
          division: form.division,
          frame: form.frame === "" ? null : form.frame,
          hp_rating: hp === null || isNaN(hp) ? null : hp,
          winding_type: form.rewinding_type === "" ? null : form.rewinding_type,
        };
        const data = await getRewindingCharge(payload);
        if (!mounted) return;
        setForm((prev) => ({ ...prev, rewinding_charge: data?.rewinding_cost ?? "" }));
      } catch (err) {
        setError({
          message: err?.message || "Failed to fetch rewinding charge.",
          resolution: err?.resolution || "",
          type: "error",
        });
        setShowToast(true);
      } finally {
        if (mounted) setRewindingLoading(false);
      }
    };

    fetchCharge();

    return () => {
      mounted = false;
    };
  }, [form.division, form.frame, form.hp_rating, form.rewinding_type]);

  const isFhp = form.division === "FHP MOTOR";
  const isLt = form.division === "LT MOTOR";
  const isRewindingLocked = isLt || isFhp;
  return (
    <div className="flex min-h-[80vh] mt-4 justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[#f8fafc] shadow-lg rounded-lg p-6 w-full max-w-100 border border-gray-200"
        noValidate
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 flex justify-center">
          Create Division Record
        </h2>

        <div className="flex flex-col gap-4">

          {/* Division */}
          <div className="flex items-center gap-3 w-full">
            <label className="w-30 text-md font-medium text-gray-700">
              Division<span className="text-red-500">*</span>
            </label>
            <select
              name="division"
              value={form.division}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.division ? "border-red-300" : "border-gray-300"} border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-400`}
              disabled={submitting}
              required
            >
              <option value="" disabled></option>
                {divisionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>

          {/* Model */}
          <div className="flex items-center gap-3 w-full">
            <label className="w-30 text-md font-medium text-gray-700">
              Model<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="model"
              value={form.model}
              max={30}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.model ? "border-red-300" : "border-gray-300"} border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-400`}
              disabled={submitting}
            />
          </div>

          {/* Frame */}
          <div className="flex items-center gap-3 w-full">
            <label className="w-30 text-md font-medium text-gray-700">
              Frame
            </label>
            <input
              type="text"
              name="frame"
              value={form.frame}
              max={10}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.frame ? "border-red-300" : "border-gray-300"} border-gray-300 focus:ring-2 focus:ring-blue-400 ${!(form.division === "LT MOTOR") ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-50"}`}
              disabled={submitting || form.division !== "LT MOTOR"}
              placeholder={form.division !== "LT MOTOR" ? "Disabled for selected division" : ""}
              title={form.division !== "LT MOTOR" ? "Frame is disabled for this division" : ""}
            />
          </div>

          {/* HP Rating */}
          <div className="flex items-center gap-3 w-full">
            <label className="w-30 text-md font-medium text-gray-700">
              HP Rating
            </label>
            <input
              type="text"
              name="hp_rating"
              value={form.hp_rating}
              onChange={handleChange}
              max={5}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.hp_rating ? "border-red-300" : "border-gray-300"} border-gray-300 focus:ring-2 focus:ring-blue-400 ${!(form.division === "FHP MOTOR") ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-50"}`}
              disabled={submitting || form.division !== "FHP MOTOR"}
              placeholder={form.division !== "FHP MOTOR" ? "Disabled for selected division" : ""}
              title={form.division !== "FHP MOTOR" ? "HP Rating is disabled for this division" : ""}
            />
          </div>

          {/* Rewinding Type */}
          <div className="flex items-center gap-3 w-full">
            <label className="w-30 text-md font-medium text-gray-700">
              Rewinding Type
            </label>
            <select
              name="rewinding_type"
              value={form.rewinding_type}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.rewinding_type ? "border-red-300" : "border-gray-300"} focus:ring-2 focus:ring-blue-400 ${!(form.division === "FHP MOTOR") ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-50"}`}
              disabled={submitting || form.division !== "FHP MOTOR"}
              title={form.division !== "FHP MOTOR" ? "Rewinding Type is disabled for this division" : ""}
            >
              <option value=""></option>
              <option value="Copper">Copper</option>
              <option value="Aluminium">Aluminium</option>
            </select>
          </div>

          {/* Rewinding Charge */}
          <div className="flex items-center gap-3 w-full">
            <label className="w-90 text-md font-medium text-gray-700">
              Rewinding Charge<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="rewinding_charge"
              value={form.rewinding_charge}
              onChange={handleChange}
              readOnly={isRewindingLocked}
              className={`w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 ${errs_label.rewinding_charge ? "border-red-300" : "border-gray-300"} focus:ring-blue-400 ${isRewindingLocked ? "cursor-not-allowed" : ""}`}
              disabled={submitting}
            />
          </div>

        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="py-1.5 px-6 rounded-lg bg-blue-600 text-white font-bold shadow hover:bg-blue-900 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Record"}
          </button>
        </div>
      </form>

      {showToast && (
        <Toast
          message={error.message}
          resolution={error.resolution}
          type={error.type}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ModelCreatePage;
