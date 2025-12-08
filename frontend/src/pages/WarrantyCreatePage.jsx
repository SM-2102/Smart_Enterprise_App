import React, { useState, useEffect, useRef } from "react";
import Toast from "../components/Toast";
import { fetchMasterNames } from "../services/masterNamesService";
import { fetchNextWarrantyCode } from "../services/warrantyNextSrfNumberService";
import { validateWarrantySRFCreate } from "../utils/warrantySRFCreateValidation";
import { createWarranty } from "../services/warrantyCreateService";
import { fetchASCNames } from "../services/serviceCenterASCNamesService";

const initialForm = {
  srf_number: "",
  name: "",
  srf_date: new Date().toLocaleDateString("en-CA"),
  head: "",
  division: "",
  model: "",
  serial_number: "",
  problem: "",
  remark: "",
  sticker_number: "",
  asc_name: "",
  complaint_number: "",
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

const headOptions = ["REPAIR", "REPLACE"];

const WarrantyCreatePage = () => {
  const [form, setForm] = useState(initialForm);
  const [initialName, setInitialName] = useState("");
  // SRF number management
  const [baseNumber, setBaseNumber] = useState(""); // e.g. R00001
  const [subNumber, setSubNumber] = useState(1);
  // Track if asc_name and sticker_number should be disabled
  const isRepair = form.head === "REPAIR";
  const [codeLoading, setCodeLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [masterNames, setMasterNames] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef(null);
  const [nameInputWidth, setNameInputWidth] = useState("100%");
  // ASC Name autocomplete
  const [ascNames, setAscNames] = useState([]);
  const [ascSuggestions, setAscSuggestions] = useState([]);
  const [showAscSuggestions, setShowAscSuggestions] = useState(false);
  const ascInputRef = useRef(null);
  const [ascInputWidth, setAscInputWidth] = useState("100%");
  // Popup for add another item
  const [showAddAnother, setShowAddAnother] = useState(false);

  // For new SRF, always send 'NEW/1' and let backend assign base
  const setNewSrfNumber = () => {
    // Fetch next available SRF number from backend and show to user
    setBaseNumber("");
    setSubNumber(1);
    setForm((prev) => ({ ...initialForm, srf_number: "" }));
    setCodeLoading(true);
    fetchNextWarrantyCode()
      .then((res) => {
        if (res && res.next_srf_number) {
          setBaseNumber(res.next_srf_number);
          setForm((prev) => ({
            ...prev,
            srf_number: `${res.next_srf_number}/1`,
          }));
        }
      })
      .finally(() => setCodeLoading(false));
  };

  useEffect(() => {
    setNewSrfNumber();
    let mounted = true;
    fetchMasterNames()
      .then((data) => {
        if (mounted && Array.isArray(data)) setMasterNames(data);
      })
      .catch(() => setMasterNames([]));
    fetchASCNames()
      .then((data) => {
        if (mounted && Array.isArray(data)) setAscNames(data);
      })
      .catch(() => setAscNames([]));
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
    if (ascInputRef.current) {
      setAscInputWidth(ascInputRef.current.offsetWidth + "px");
    }
  }, [form.asc_name, showAscSuggestions]);

  // Validation
  const [errs, errs_label] = validateWarrantySRFCreate(form);

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
    if (name === "asc_name") {
      if (value.length > 30) return;
      newValue = value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      if (newValue.length > 0) {
        const filtered = ascNames.filter((n) =>
          n.toLowerCase().startsWith(newValue.toLowerCase()),
        );
        setAscSuggestions(filtered);
        setShowAscSuggestions(filtered.length > 0);
      } else {
        setShowAscSuggestions(false);
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
    // Always send 'NEW/1' if srf_number is empty (new), else send the real value
    // Always send 'NEW/1' if srf_number matches the next available base from backend
    let srfToSend = form.srf_number;
    if (form.srf_number === `${baseNumber}/1`) {
      srfToSend = "NEW/1";
    }
    const rawPayload = {
      ...form,
      srf_number: srfToSend,
    };
    // Map empty string values to null
    const payload = Object.fromEntries(
      Object.entries(rawPayload).map(([k, v]) => [k, v === "" ? null : v]),
    );
    try {
      const response = await createWarranty(payload);
      let createdSrf = response.srf_number;
      if (!createdSrf && response?.message) {
        const match = response.message.match(/R\d{5}\/\d/);
        if (match) createdSrf = match[0];
      }
      if (createdSrf) {
        setBaseNumber(createdSrf.split("/")[0]);
        setSubNumber(Number(createdSrf.split("/")[1]));
        setForm((prev) => ({ ...prev, srf_number: createdSrf }));
        // Store initial name for /1
        if (createdSrf.endsWith("/1")) {
          setInitialName(form.name);
        }
      }
      setError({
        message: "Warranty record created successfully!",
        resolution: `SRF Number : ${createdSrf || "(unknown)"}`,
        type: "success",
      });
      setShowToast(true);
      setShowAddAnother(true);
    } catch (err) {
      setError({
        message: err?.message || "Failed to create warranty record.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Another Item popup
  const handleAddAnother = async (addAnother) => {
    setShowAddAnother(false);
    if (addAnother) {
      // Continue with same base, increment subNumber
      const nextSub = subNumber + 1;
      setSubNumber(nextSub);
      setForm((prev) => ({
        ...initialForm,
        srf_number: `${baseNumber}/${nextSub}`,
        name: initialName,
      }));
    } else {
      // For new SRF, always send 'NEW/1' and let backend assign base
      setNewSrfNumber();
    }
  };

  return (
    <div className="flex min-h-[80vh] mt-6 justify-center items-center relative">
      {/* Toast should be above everything else, including Add Another popup */}
      {showToast && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Toast
            message={error.message}
            resolution={error.resolution}
            type={error.type}
            onClose={() => setShowToast(false)}
          />
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="bg-[#f8fafc] shadow-lg rounded-lg p-6 w-full max-w-180 border border-gray-200"
        noValidate
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Create Warranty Record
        </h2>
        <div className="flex flex-col gap-4">
          {/* SRF Number (readonly, small, label beside input) */}
          <div className="flex items-center gap-3 justify-center">
            <label
              htmlFor="srf_number"
              className="text-md font-medium text-blue-800"
            >
              SRF Number
            </label>
            <input
              id="srf_number"
              name="srf_number"
              type="text"
              value={form.srf_number || (codeLoading || submitting ? "" : "")}
              readOnly
              disabled={codeLoading || submitting}
              autoComplete="off"
              className="w-35 text-center px-2 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-medium cursor-not-allowed"
            />
          </div>
          {/* Challan Date (styled similar to Challan Number, below it) */}
          <div className="flex items-center gap-3 mb-2 justify-center">
            <label
              htmlFor="srf_date"
              className="text-md font-medium text-gray-700 w-22.5"
            >
              SRF Date<span className="text-red-500">*</span>
            </label>
            <input
              id="srf_date"
              name="srf_date"
              type="date"
              onChange={handleChange}
              value={form.srf_date}
              className={`w-35 text-center px-2 py-1 rounded-lg border ${errs_label.srf_date ? "border-red-300" : "border-gray-300"} border-gray-300 text-gray-900 font-small justify-center focus:outline-none focus:ring-2 focus:ring-blue-400`}
              required
              disabled={submitting}
              max={new Date().toLocaleDateString("en-CA")}
              min={new Date().toLocaleDateString("en-CA")}
            />
          </div>
          {/* Name (label beside input, autocomplete, search) */}
          <div
            className="flex items-center gap-2 w-full"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="name"
              className="w-30.5 text-md font-medium text-gray-700"
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
                  disabled={submitting || subNumber > 1}
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
          {/* Division & SRF Date - same line */}
          <div className="flex items-center w-full gap-8">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="division"
                className="w-55 text-md font-medium text-gray-700"
              >
                Division<span className="text-red-500">*</span>
              </label>
              <select
                id="division"
                name="division"
                required
                value={form.division}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.division ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={submitting}
              >
                <option value="" disabled></option>
                {divisionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="head"
                className="w-55 text-md font-medium text-gray-700"
              >
                Head<span className="text-red-500">*</span>
              </label>
              <select
                id="head"
                name="head"
                required
                value={form.head}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.head ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={submitting}
              >
                <option value="" disabled></option>
                {headOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Model & Serial Number - same line */}
          <div className="flex items-center w-full gap-8">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="model"
                className="w-55 text-md font-medium text-gray-700"
              >
                Model<span className="text-red-500">*</span>
              </label>
              <input
                id="model"
                name="model"
                type="text"
                required
                value={form.model}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.model ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                maxLength={30}
                disabled={submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="serial_number"
                className="w-55 text-md font-medium text-gray-700"
              >
                Serial No.<span className="text-red-500">*</span>
              </label>
              <input
                id="serial_number"
                name="serial_number"
                type="text"
                required
                value={form.serial_number}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.serial_number ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                maxLength={20}
                disabled={submitting}
              />
            </div>
          </div>
          {/* Head & Complaint Number - same line */}
          <div className="flex items-center w-full gap-8">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="sticker_number"
                className="w-55 text-md font-medium text-gray-700"
              >
                Sticker No.
              </label>
              <input
                id="sticker_number"
                name="sticker_number"
                type="text"
                value={form.sticker_number}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border border-gray-300 ${isRepair ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-900"} ${errs_label.sticker_number ? "border-red-300" : "border-gray-300"}`}
                maxLength={15}
                disabled={submitting || isRepair}
                placeholder={isRepair ? "Disabled for Repair" : ""}
                title={isRepair ? "Sticker Number is disabled for Repair" : ""}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="complaint_number"
                className="w-55 text-md font-medium text-gray-700"
              >
                Complaint No.
              </label>
              <input
                id="complaint_number"
                name="complaint_number"
                type="text"
                value={form.complaint_number}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.complaint_number ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                maxLength={20}
                disabled={submitting}
              />
            </div>
          </div>

          <div
            className="flex items-center w-full gap-2"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="asc_name"
              className="w-38 text-md font-medium text-gray-700"
            >
              ASC Name
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                id="asc_name"
                name="asc_name"
                type="text"
                value={form.asc_name}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border border-gray-300 ${isRepair ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-900"} ${errs_label.asc_name ? "border-red-300" : "border-gray-300"}`}
                maxLength={30}
                disabled={submitting || isRepair}
                autoComplete="off"
                ref={ascInputRef}
                placeholder={isRepair ? "Disabled for Repair" : ""}
                title={isRepair ? "ASC Name is disabled for Repair" : ""}
                onFocus={() => {
                  if (form.asc_name.length > 0 && ascSuggestions.length > 0)
                    setShowAscSuggestions(true);
                }}
                onBlur={() =>
                  setTimeout(() => setShowAscSuggestions(false), 150)
                }
              />
              {showAscSuggestions && (
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
                    width: ascInputWidth,
                    maxHeight: 180,
                    overflowY: "auto",
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {ascSuggestions.map((n) => (
                    <li
                      key={n}
                      style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                      onMouseDown={() => {
                        setForm((prev) => ({ ...prev, asc_name: n }));
                        setShowAscSuggestions(false);
                      }}
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Problem - one line */}
          <div className="flex items-center w-full gap-2">
            <label
              htmlFor="problem"
              className="w-38.5 text-md font-medium text-gray-700"
            >
              Problem<span className="text-red-500">*</span>
            </label>
            <input
              id="problem"
              name="problem"
              type="text"
              required
              value={form.problem}
              onChange={handleChange}
              className={`w-full px-3 py-1 rounded-lg border ${errs_label.problem ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={30}
              disabled={submitting}
            />
          </div>
          {/* Remark - one line */}
          <div className="flex items-center w-full gap-2">
            <label
              htmlFor="remark"
              className="w-38.5 text-md font-medium text-gray-700"
            >
              Remark
            </label>
            <input
              id="remark"
              name="remark"
              type="text"
              value={form.remark}
              onChange={handleChange}
              className="w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900"
              maxLength={40}
              disabled={submitting}
            />
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
      {/* Add Another Item Popup */}
      {showAddAnother && !showToast && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] flex flex-col items-center">
            <div className="text-lg font-semibold mb-4">Add another item?</div>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800"
                onClick={() => handleAddAnother(true)}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => handleAddAnother(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarrantyCreatePage;
