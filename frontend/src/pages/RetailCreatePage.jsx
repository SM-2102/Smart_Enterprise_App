import React, { useState, useEffect, useRef } from "react";
import Toast from "../components/Toast";
import { fetchMasterNames } from "../services/masterNamesService";
import { fetchNextRetailCode } from "../services/retailNextRcodeService";
import { createRetail } from "../services/retailCreateService";
import { validateRetailCreate } from "../utils/retailCreateValidation";

const initialForm = {
  rcode: "",
  name: "",
  division: "",
  retail_date: new Date().toLocaleDateString("en-CA"),
  details: "",
  amount: "",
  received: "N",
};

const divisionOptions = [
  "FANS",
  "PUMP",
  "LIGHT",
  "SDA",
  "IWH",
  "SWH",
  "COOLER",
  "OTHERS",
];

const RetailCreatePage = () => {
  const [form, setForm] = useState(initialForm);
  // Local toggle state for 'received' field
  const handleToggleReceived = () => {
    setForm((prev) => ({
      ...prev,
      received: prev.received === "Y" ? "N" : "Y",
    }));
  };
  const [codeLoading, setCodeLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [masterNames, setMasterNames] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef(null);
  const [nameInputWidth, setNameInputWidth] = useState("100%");
  useEffect(() => {
    let mounted = true;
    fetchNextRetailCode()
      .then((data) => {
        if (mounted && data) {
          setForm((prev) => ({
            ...prev,
            rcode: data.next_code || "",
          }));
        }
      })
      .catch(() => {
        setForm((prev) => ({ ...prev, rcode: "" }));
      })
      .finally(() => {
        setCodeLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (nameInputRef.current) {
      setNameInputWidth(nameInputRef.current.offsetWidth + "px");
    }
  }, [form.name, showSuggestions]);

  useEffect(() => {
    let mounted = true;

    fetchMasterNames()
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setMasterNames(data);
        }
      })
      .catch(() => setMasterNames([]));

    return () => {
      mounted = false;
    };
  }, []);

  // Validation
  const [errs, errs_label] = validateRetailCreate(form);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "name") {
      if (value.length > 40) return;
      newValue = value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      if (newValue.length > 0) {
        const filtered = masterNames.filter((n) =>
          n.toLowerCase().startsWith(newValue.toLowerCase()),
        );
        setNameSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
    }
    setForm((prev) => ({ ...prev, [name]: newValue }));
    setError((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errs.length > 0) {
      setError({
        message: errs[0],
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    setSubmitting(true);

    const rawPayload = {
      name: form.name,
      division: form.division,
      retail_date: form.retail_date,
      details: form.details,
      amount: form.amount,
      received: form.received,
    };
    // Map empty string values to null
    const payload = Object.fromEntries(
      Object.entries(rawPayload).map(([k, v]) => [k, v === "" ? null : v]),
    );
    try {
      await createRetail(payload);
      setError({
        message: "Retail record created successfully!",
        resolution: "Customer Name : " + form.name,
        type: "success",
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Failed to create retail record.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] mt-6 justify-center items-center">
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="bg-[#f8fafc] shadow-lg rounded-lg p-6 w-full max-w-160 border border-gray-200"
        noValidate
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Create Retail Record
        </h2>
        <div className="flex flex-col gap-4">
          {/* Retail Receipt Number (readonly, small, label beside input) */}
          <div className="flex items-center gap-3 justify-center">
            <label
              htmlFor="rcode"
              className="text-md font-medium text-blue-800"
            >
              Receipt Number
            </label>
            <input
              id="rcode"
              name="rcode"
              type="text"
              value={form.rcode}
              readOnly
              disabled={codeLoading || submitting}
              autoComplete="off"
              className="w-35 text-center px-2 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-medium cursor-not-allowed"
            />
          </div>
          {/* Name (label beside input, autocomplete, search) */}
          <div
            className="flex items-center w-full"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="name"
              className="w-25 text-md font-medium text-gray-700"
            >
              Name<span className="text-red-500">*</span>
            </label>
            <div className="flex-1 flex items-center gap-2">
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.name ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  minLength={3}
                  maxLength={40}
                  required
                  disabled={submitting}
                  autoComplete="name"
                  onFocus={() => {
                    if (form.name.length > 0 && nameSuggestions.length > 0)
                      setShowSuggestions(true);
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 150)
                  }
                  ref={nameInputRef}
                />
                {showSuggestions && (
                  <ul
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      zIndex: 10,
                      background: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      width: nameInputWidth,
                      maxHeight: 180,
                      overflowY: "auto",
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                    }}
                  >
                    {nameSuggestions.map((n) => (
                      <li
                        key={n}
                        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                        onMouseDown={() => {
                          setForm((prev) => ({ ...prev, name: n }));
                          setShowSuggestions(false);
                        }}
                      >
                        {n}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          {/* Invoice Number & Invoice Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="division"
                className="w-39 text-md font-medium text-gray-700"
              >
                Division<span className="text-red-500">*</span>
              </label>

              <select
                id="division"
                name="division"
                required
                value={form.division}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border ${
                  errs_label.division ? "border-red-300" : "border-gray-300"
                } bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={submitting}
              >
                {/* Placeholder */}
                <option value="" disabled></option>

                {/* Actual options */}
                {divisionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="retail_date"
                className={`w-50 text-md font-medium text-gray-700`}
              >
                Retail Date<span className="text-red-500">*</span>
              </label>
              <input
                id="retail_date"
                name="retail_date"
                type="date"
                required
                value={form.retail_date}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.retail_date ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={submitting}
                max={new Date().toLocaleDateString("en-CA")}
                min={new Date().toLocaleDateString("en-CA")}
              />
            </div>
          </div>
          {/* Invoice Number & Invoice Date - label beside input, w-1/2 each */}
          <div
            className="flex items-center w-full"
            style={{ position: "relative" }}
          >
            {" "}
            <label
              htmlFor="details"
              className="w-30.5 text-md font-medium text-gray-700"
            >
              Details<span className="text-red-500">*</span>
            </label>
            <input
              id="details"
              name="details"
              type="text"
              required
              value={form.details}
              onChange={handleChange}
              className={`w-full px-3 py-1 rounded-lg border ${errs_label.details ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={40}
              disabled={submitting}
            />
          </div>
          {/* Amount and Received - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="amount"
                className="w-39 text-md font-medium text-gray-700"
              >
                Amount<span className="text-red-500">*</span>
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.details ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                maxLength={6}
                min={1}
                disabled={submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="received"
                className="w-55 text-md font-medium text-gray-700"
              >
                Payment <span className="text-red-500">*</span>
              </label>

              <div className="flex justify-center w-full">
                <button
                  id="received"
                  name="received"
                  type="button"
                  onClick={handleToggleReceived}
                  disabled={submitting}
                  className={`px-4 py-1 rounded-lg font-bold text-white transition-colors duration-200 w-fit
                    ${form.received === "Y" ? "bg-green-600 hover:bg-green-800" : "bg-red-600 hover:bg-red-800"}
                    disabled:opacity-60`}
                >
                  {form.received === "Y" ? "Received" : "Not Received"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="py-1.5 px-6 rounded-lg bg-blue-600 text-white font-bold text-base shadow hover:bg-blue-900 transition-colors duration-200 w-fit disabled:opacity-60"
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

export default RetailCreatePage;
