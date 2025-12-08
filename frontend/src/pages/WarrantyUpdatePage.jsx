import React, { useState, useEffect, useRef } from "react";
import Toast from "../components/Toast";
import { validateWarrantyUpdate } from "../utils/warrantySRFUpdateValidation";
import { updateWarranty } from "../services/warrantyUpdateService";
import { FiSearch } from "react-icons/fi";
import FinalStatusToggle from "../components/FinalStatus";
import PendingBar from "../components/PendingBar";
import { fetchWarrantyPending } from "../services/warrantyPendingService";
import { fetchWarrantyDeliveredBy } from "../services/warrantyDeliveredByService";
import { searchWarrantyBySRFNumber } from "../services/warrantySearchBySRFNumberService";

const initialForm = {
  srf_number: "",
  name: "",
  division: "",
  model: "",
  head: "",
  srf_date: "",
  challan_number: "",
  challan_date: "",
  repair_date: "",
  receive_date: "",
  invoice_number: "",
  invoice_date: "",
  delivered_by: "",
  delivery_date: "",
  complaint_number: "",
  final_remark: "",
  courier: "",
  final_status: "Pending",
};

const WarrantyUpdatePage = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);
  const [deliveredByList, setDeliveredByList] = useState([]);
  const [deliveredBySuggestions, setDeliveredBySuggestions] = useState([]);
  const [showDeliveredBySuggestions, setShowDeliveredBySuggestions] =
    useState(false);

  // Field disabling logic based on head value
  const isRepairDateDisabled = form.head === "REPLACE";
  const isRepair = form.head === "REPAIR";
  const isReceiveDateDisabled = isRepair;
  const isInvoiceNumberDisabled = isRepair;
  const isInvoiceDateDisabled = isRepair;
  const isCourierNumberDisabled = isRepair;

  const handleSearch = async (searchCode) => {
    // If this was called as an event handler (e.g. onClick={handleSearch}),
    // React will pass a SyntheticEvent as the first arg. Detect and ignore it.
    if (
      searchCode &&
      typeof searchCode === "object" &&
      (searchCode.nativeEvent ||
        typeof searchCode.preventDefault === "function" ||
        searchCode.currentTarget)
    ) {
      searchCode = undefined;
    }

    const codeToSearch = searchCode ?? form.srf_number;
    if (!codeToSearch) {
      setError({ message: "Please provide SRF Number", type: "warning" });
      setShowToast(true);
      return;
    }

    try {
      const data = await searchWarrantyBySRFNumber(codeToSearch);

      setForm({
        srf_number: data.srf_number ?? "",
        name: data.name ?? "",
        division: data.division ?? "",
        model: data.model ?? "",
        head: data.head ?? "",
        srf_date: data.srf_date ?? "",
        challan_number: data.challan_number ?? "",
        challan_date: data.challan_date ?? "",
        repair_date: data.repair_date ?? "",
        receive_date: data.receive_date ?? "",
        invoice_number: data.invoice_number ?? "",
        invoice_date: data.invoice_date ?? "",
        delivered_by: data.delivered_by ?? "",
        delivery_date: data.delivery_date ?? "",
        complaint_number: data.complaint_number ?? "",
        final_remark: data.final_remark ?? "",
        courier: data.courier ?? "",
        final_status: data.final_status ?? "Pending",
      });

      // Handle locked state
      if (data.final_status === "Y") {
        setError({
          message: "Already completed",
          resolution: "This record is not editable",
          type: "info",
        });
        setShowToast(true);
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    } catch (err) {
      setError({
        message: err.message || "Not found",
        resolution: err.resolution,
        type: "error",
      });
      setShowToast(true);
    }
  };

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await fetchWarrantyPending();
        // Map srf_number to id for PendingBar compatibility
        const mapped = Array.isArray(response)
          ? response.map((item) => ({ ...item, id: item.srf_number }))
          : [];
        setPendingItems(mapped);
      } catch (error) {
        console.error("Error fetching pending:", error);
      }
    };

    const fetchDeliveredBy = async () => {
      try {
        const data = await fetchWarrantyDeliveredBy();
        if (Array.isArray(data)) setDeliveredByList(data);
      } catch (error) {
        setDeliveredByList([]);
      }
    };

    fetchPending();
    fetchDeliveredBy();
  }, []);

  // Validation
  const [errs, errs_label] = validateWarrantyUpdate(form);

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
      delivery_date: form.delivery_date,
      delivered_by: form.delivered_by,
      final_status: form.final_status,
      final_remark: form.final_remark,
      repair_date: form.repair_date,
      receive_date: form.receive_date,
      invoice_number: form.invoice_number,
      invoice_date: form.invoice_date,
      complaint_number: form.complaint_number,
      courier: form.courier,
    };
    // Map empty string values to null
    const payload = Object.fromEntries(
      Object.entries(rawPayload).map(([k, v]) => [k, v === "" ? null : v]),
    );
    try {
      await updateWarranty(form.srf_number, payload);
      setError({
        message: "Warranty record updated successfully!",
        resolution: "Customer Name : " + form.name,
        type: "success",
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Failed to update warranty record.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "delivered_by") {
      // Autocomplete: filter suggestions as user types
      if (newValue.length > 0) {
        const filtered = deliveredByList.filter((n) =>
          n.toLowerCase().startsWith(newValue.toLowerCase()),
        );
        setDeliveredBySuggestions(filtered);
        setShowDeliveredBySuggestions(filtered.length > 0);
      } else {
        setShowDeliveredBySuggestions(false);
      }
    }
    setForm((prev) => ({ ...prev, [name]: newValue }));
    setError((prev) => ({ ...prev, [name]: undefined }));
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
        className="bg-[#f8fafc] shadow-lg rounded-lg p-6 w-full max-w-180 border border-gray-200"
        noValidate
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Update Warranty Record
        </h2>
        <div className="flex flex-col gap-4">
          {/* srf_number (readonly, small, label beside input) */}
          <div className="flex items-center gap-3 justify-center">
            <label
              htmlFor="srf_number"
              className="text-md font-medium text-gray-700"
            >
              SRF Number
            </label>
            <input
              id="srf_number"
              name="srf_number"
              type="text"
              value={form.srf_number}
              onChange={handleChange}
              disabled={submitting}
              required
              autoComplete="off"
              className="w-30 text-center px-2 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 font-medium"
              maxLength={8}
              style={{ minWidth: 0 }}
            />
            <button
              type="button"
              title="Search by code"
              className="p-0 rounded-full bg-gradient-to-tr from-blue-200 to-blue-500 text-white shadow-md hover:scale-105 hover:from-blue-600 hover:to-blue-900 focus:outline-none transition-all duration-200 flex items-center justify-center"
              disabled={submitting || !form.srf_number}
              onClick={() => handleSearch()}
              tabIndex={0}
              style={{ width: 32, height: 32 }}
            >
              <FiSearch size={20} />
            </button>
          </div>
          {/* Name (label beside input, autocomplete, search) */}
          <div
            className="flex items-center gap-2 w-full"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="name"
              className="w-33.5 text-md font-medium text-gray-700"
            >
              Name
            </label>
            <div className="flex-1 flex items-center gap-2">
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.name ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                  readOnly
                  disabled={isLocked || submitting || isRepairDateDisabled}
                  autoComplete="name"
                ></input>
              </div>
            </div>
          </div>
          {/* Division and Receive Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="division"
                className="w-65 text-md font-medium text-gray-700"
              >
                Division
              </label>

              <input
                id="division"
                name="division"
                type="text"
                value={form.division}
                readOnly
                disabled={isLocked || submitting || isReceiveDateDisabled}
                className={`w-full px-3 py-1 rounded-lg border ${
                  errs_label.division ? "border-red-300" : "border-gray-300"
                } bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
              ></input>
            </div>

            <div className="flex items-center w-1/2 gap-1">
              <label
                htmlFor="srf_date"
                className={`w-55 text-md font-medium text-gray-700 gap-1`}
              >
                SRF Date
              </label>
              <input
                id="srf_date"
                name="srf_date"
                type="text"
                required
                value={form.srf_date}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.srf_date ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                readOnly
                disabled={isLocked || submitting}
              />
            </div>
          </div>
          {/* Model & Repair Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="model"
                className="w-65 text-md font-medium text-gray-700"
              >
                Model
              </label>
              <input
                id="model"
                name="model"
                type="text"
                value={form.model}
                readOnly
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.model ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="repair_date"
                className="w-55 text-md font-medium text-gray-700 ml-3"
              >
                Repair Date
              </label>
              <input
                id="repair_date"
                name="repair_date"
                type="date"
                value={form.repair_date}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.repair_date ? "border-red-300" : "border-gray-300"} ${isRepairDateDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                onChange={handleChange}
                max={new Date().toLocaleDateString("en-CA")}
                disabled={isLocked || submitting || isRepairDateDisabled}
                placeholder={isRepairDateDisabled ? "Disabled for REPLACE" : ""}
                title={
                  isRepairDateDisabled
                    ? "Repair Date is disabled for REPLACE"
                    : ""
                }
              />
            </div>
          </div>
          {/* Head & Receive Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="head"
                className="w-65 text-md font-medium text-gray-700"
              >
                Head
              </label>
              <input
                id="head"
                name="head"
                type="text"
                value={form.head}
                readOnly
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.head ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="receive_date"
                className="w-55 text-md font-medium text-gray-700 ml-3 "
              >
                Receive Date
              </label>
              <input
                id="receive_date"
                name="receive_date"
                type="date"
                value={form.receive_date}
                onChange={handleChange}
                max={new Date().toLocaleDateString("en-CA")}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.receive_date ? "border-red-300" : "border-gray-300"} ${isReceiveDateDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting || isReceiveDateDisabled}
                placeholder={isReceiveDateDisabled ? "Disabled for Repair" : ""}
                title={
                  isReceiveDateDisabled
                    ? "Receive Date is disabled for Repair"
                    : ""
                }
              />
            </div>
          </div>
          {/* Challan Number & Challan Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="challan_number"
                className="w-65 text-md font-medium text-gray-700"
              >
                Challan Number
              </label>
              <input
                id="challan_number"
                name="challan_number"
                type="text"
                readOnly
                value={form.challan_number}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.challan_number ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-1">
              <label
                htmlFor="challan_date"
                className="w-55 text-md font-medium text-gray-700 "
              >
                Challan Date
              </label>
              <input
                id="challan_date"
                name="challan_date"
                type="text"
                readOnly
                value={form.challan_date}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.challan_date ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>
          </div>
          {/* Invoice Number & Invoice Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="invoice_number"
                className="w-65 text-md font-medium text-gray-700"
              >
                Invoice Number
              </label>
              <input
                id="invoice_number"
                name="invoice_number"
                type="text"
                onChange={handleChange}
                value={form.invoice_number}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.invoice_number ? "border-red-300" : "border-gray-300"} ${isInvoiceNumberDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting || isInvoiceNumberDisabled}
                placeholder={
                  isInvoiceNumberDisabled ? "Disabled for Repair" : ""
                }
                title={
                  isInvoiceNumberDisabled
                    ? "Invoice Number is disabled for Repair"
                    : ""
                }
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="invoice_date"
                className="w-55 text-md font-medium text-gray-700 ml-3 "
              >
                Invoice Date
              </label>
              <input
                id="invoice_date"
                name="invoice_date"
                type="date"
                value={form.invoice_date}
                onChange={handleChange}
                max={new Date().toLocaleDateString("en-CA")}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.invoice_date ? "border-red-300" : "border-gray-300"} ${isInvoiceDateDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting || isInvoiceDateDisabled}
                placeholder={isInvoiceDateDisabled ? "Disabled for Repair" : ""}
                title={
                  isInvoiceDateDisabled
                    ? "Invoice Date is disabled for Repair"
                    : ""
                }
              />
            </div>
          </div>
          {/* Complaint Number & Delivery Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="complaint_number"
                className="w-65 text-md font-medium text-gray-700"
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
                disabled={isLocked || submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="delivery_date"
                className="w-55 text-md font-medium text-gray-700 ml-3 "
              >
                Delivery Date
              </label>
              <input
                id="delivery_date"
                name="delivery_date"
                type="date"
                value={form.delivery_date}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.delivery_date ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting}
                max={new Date().toLocaleDateString("en-CA")}
              />
            </div>
          </div>

          {/* Delivered By - moved to new line */}
          <div className="flex items-center w-full gap-3">
            <label
              htmlFor="delivered_by"
              className="w-41.5 text-md font-medium text-gray-700"
            >
              Delivered By
            </label>
            <div className="w-full relative">
              <input
                id="delivered_by"
                name="delivered_by"
                type="text"
                value={form.delivered_by}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg ${errs_label.delivered_by ? "border-red-300" : "border-gray-300"} border border-gray-300 bg-gray-50 text-gray-900`}
                maxLength={20}
                disabled={isLocked || submitting}
                autoComplete="off"
                onFocus={() => {
                  if (
                    form.delivered_by.length > 0 &&
                    deliveredBySuggestions.length > 0
                  )
                    setShowDeliveredBySuggestions(true);
                }}
                onBlur={() =>
                  setTimeout(() => setShowDeliveredBySuggestions(false), 150)
                }
              />
              {showDeliveredBySuggestions && (
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
                    width: "100%",
                    maxHeight: 180,
                    overflowY: "auto",
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {deliveredBySuggestions.map((n) => (
                    <li
                      key={n}
                      style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                      onMouseDown={() => {
                        setForm((prev) => ({ ...prev, delivered_by: n }));
                        setShowDeliveredBySuggestions(false);
                      }}
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Remark - mapped to status*/}
          <div
            className="flex items-center gap-2 w-full"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="final_remark"
              className="w-33.5 text-md font-medium text-gray-700"
            >
              Remark
            </label>
            <div className="flex-1 flex items-center gap-2">
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="final_remark"
                  name="final_remark"
                  type="text"
                  value={form.final_remark}
                  onChange={handleChange}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.final_remark ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  disabled={isLocked || submitting}
                  autoComplete="final_remark"
                ></input>
              </div>
            </div>
          </div>
          {/* Courier Number and Final Status - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="courier"
                className="w-65 text-md font-medium text-gray-700"
              >
                Courier Number
              </label>
              <input
                id="courier"
                name="courier"
                type="text"
                value={form.courier}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.courier ? "border-red-300" : "border-gray-300"} ${isCourierNumberDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting || isCourierNumberDisabled}
                placeholder={
                  isCourierNumberDisabled ? "Disabled for Repair" : ""
                }
                title={
                  isCourierNumberDisabled
                    ? "Courier Number is disabled for Repair"
                    : ""
                }
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="final_status"
                className="w-55 text-md font-medium text-gray-700 ml-3"
              >
                Final Status
              </label>

              <div className="flex justify-center w-full">
                <FinalStatusToggle
                  form={form}
                  setForm={setForm}
                  disabled={isLocked || submitting}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="py-1.5 px-6 rounded-lg bg-blue-600 text-white font-bold text-base shadow hover:bg-blue-900 transition-colors duration-200 w-fit disabled:opacity-60"
            disabled={isLocked || submitting}
          >
            {submitting ? "Updating..." : "Update Record"}
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
      <PendingBar
        pendingData={pendingItems}
        onSelect={(srf_number) => {
          setForm((prev) => ({ ...prev, srf_number })); // fill MCODE
          handleSearch(srf_number); // auto-trigger search with passed code
        }}
      />
    </div>
  );
};

export default WarrantyUpdatePage;
