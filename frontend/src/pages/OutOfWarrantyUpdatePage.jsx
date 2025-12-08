import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import { validateOutOfWarrantyUpdate } from "../utils/outOfWarrrantySRFUpdateValidation";
import { FiSearch } from "react-icons/fi";
import FinalStatusToggle from "../components/FinalStatus";
import YesNoToggle from "../components/YesNoToggle";
import PendingBar from "../components/PendingBar";
import { fetchOutOfWarrantyPending } from "../services/outOfWarrantyPendingService";
import { searchOutOfWarrantyBySRFNumber } from "../services/outOfWarrantySearchBySRFNumberService";
import { updateOutOfWarranty } from "../services/outOfWarrantyUpdateService";

const initialForm = {
  srf_number: "",
  name: "",
  model: "",
  srf_date: "",
  serial_number: "",
  service_charge: "",
  received_by: "",
  vendor_date1: "",
  vendor_cost1: "",
  vendor_date2: "",
  vendor_cost2: "",
  estimate_date: "",
  repair_date: "",
  rewinding_cost: "",
  other_cost: "",
  work_done: "",
  spare1: "",
  cost1: "",
  spare2: "",
  cost2: "",
  spare3: "",
  cost3: "",
  spare4: "",
  cost4: "",
  spare5: "",
  cost5: "",
  spare6: "",
  cost6: "",
  spare_cost: "",
  godown_cost: "",
  discount: "",
  total: "",
  gst: "N",
  gst_amount: "",
  round_off: "",
  final_amount: "",
  receive_amount: "",
  delivery_date: "",
  pc_number: "",
  invoice_number: "",
  final_status: "N",
};

const OutOfWarrantyUpdatePage = () => {
  // ...existing code...
  // Place this after all useState declarations
  const [form, setForm] = useState(initialForm);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  // Spares table state (max 6)
  // Only show one row by default, unless editing existing record with spares
  const initialSpares = (() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      const spare = initialForm[`spare${i + 1}`] || "";
      const cost = initialForm[`cost${i + 1}`] || "";
      if (spare || cost) arr.push({ spare, cost });
    }
    return arr.length ? arr : [{ spare: "", cost: "" }];
  })();
  const [spares, setSpares] = useState(initialSpares);
  // Add new spare row (max 6)
  const handleAddSpare = (e) => {
    e.preventDefault();
    if (spares.length < 6 && spares[spares.length - 1].spare) {
      setSpares((prev) => [...prev, { spare: "", cost: "" }]);
    }
  };
  // Sync spares state to form
  useEffect(() => {
    // Only show filled spares, or one empty row if none
    const filled = [];
    for (let i = 0; i < 6; i++) {
      const spare = form[`spare${i + 1}`] || "";
      const cost = form[`cost${i + 1}`] || "";
      if (spare || cost) filled.push({ spare, cost });
    }
    setSpares(filled.length ? filled : [{ spare: "", cost: "" }]);
  }, [
    form.spare1,
    form.spare2,
    form.spare3,
    form.spare4,
    form.spare5,
    form.spare6,
    form.cost1,
    form.cost2,
    form.cost3,
    form.cost4,
    form.cost5,
    form.cost6,
  ]);

  // Update form when spares table changes
  const handleSpareChange = (idx, field, value) => {
    setSpares((prev) => {
      const updated = prev.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      );
      // Always update all six spareN/costN fields in form
      setForm((f) => {
        const newForm = { ...f };
        let spareCostSum = 0;
        for (let i = 0; i < 6; i++) {
          newForm[`spare${i + 1}`] = updated[i]?.spare || "";
          newForm[`cost${i + 1}`] = updated[i]?.cost || "";
          const costVal = parseFloat(updated[i]?.cost);
          if (!isNaN(costVal)) spareCostSum += costVal;
        }
        newForm.spare_cost = spareCostSum;
        // Calculate total
        const rewinding_cost = parseFloat(newForm.rewinding_cost) || 0;
        const other_cost = parseFloat(newForm.other_cost) || 0;
        const godown_cost = parseFloat(newForm.godown_cost) || 0;
        const service_charge = parseFloat(newForm.service_charge) || 0;
        const discount = parseFloat(newForm.discount) || 0;
        newForm.total =
          rewinding_cost +
          other_cost +
          spareCostSum +
          godown_cost +
          service_charge -
          discount;
        return newForm;
      });
      return updated;
    });
  };
  const [showVendorActivity, setShowVendorActivity] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);

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
      const data = await searchOutOfWarrantyBySRFNumber(codeToSearch);

      setForm({
        srf_number: data.srf_number ?? "",
        name: data.name ?? "",
        model: data.model ?? "",
        srf_date: data.srf_date ?? "",
        serial_number: data.serial_number ?? "",
        service_charge: data.service_charge ?? "",
        received_by: data.received_by ?? "",
        vendor_date1: data.vendor_date1 ?? "",
        vendor_cost1: data.vendor_cost1 ?? "",
        vendor_date2: data.vendor_date2 ?? "",
        vendor_cost2: data.vendor_cost2 ?? "",
        estimate_date: data.estimate_date ?? "",
        repair_date: data.repair_date ?? "",
        rewinding_cost: data.rewinding_cost ?? "",
        other_cost: data.other_cost ?? "",
        work_done: data.work_done ?? "",
        spare1: data.spare1 ?? "",
        cost1: data.cost1 ?? "",
        spare2: data.spare2 ?? "",
        cost2: data.cost2 ?? "",
        spare3: data.spare3 ?? "",
        cost3: data.cost3 ?? "",
        spare4: data.spare4 ?? "",
        cost4: data.cost4 ?? "",
        spare5: data.spare5 ?? "",
        cost5: data.cost5 ?? "",
        spare6: data.spare6 ?? "",
        cost6: data.cost6 ?? "",
        spare_cost: data.spare_cost ?? "",
        godown_cost: data.godown_cost ?? "",
        discount: data.discount ?? "",
        total: data.total ?? "",
        gst: data.gst ?? "",
        gst_amount: data.gst_amount ?? "",
        round_off: data.round_off ?? "",
        final_amount: data.final_amount ?? "",
        receive_amount: data.receive_amount ?? "",
        delivery_date: data.delivery_date ?? "",
        pc_number: data.pc_number ?? "",
        invoice_number: data.invoice_number ?? "",
        final_status: data.final_status ?? "",
      });

      // Handle locked state
      if (data.final_status === "Y") {
        setError({
          message: "Already Completed",
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
        const response = await fetchOutOfWarrantyPending();
        // Map srf_number to id for PendingBar compatibility
        const mapped = Array.isArray(response)
          ? response.map((item) => ({ ...item, id: item.srf_number }))
          : [];
        setPendingItems(mapped);
      } catch (error) {
        console.error("Error fetching pending:", error);
      }
    };

    fetchPending();
  }, []);

  // Validation
  const [errs, errs_label] = validateOutOfWarrantyUpdate(form);

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
      vendor_date2: form.vendor_date2,
      vendor_cost1: form.vendor_cost1,
      vendor_cost2: form.vendor_cost2,
      estimate_date: form.estimate_date,
      repair_date: form.repair_date,
      rewinding_cost: form.rewinding_cost,
      other_cost: form.other_cost,
      work_done: form.work_done,
      spare1: form.spare1,
      cost1: form.cost1,
      spare2: form.spare2,
      cost2: form.cost2,
      spare3: form.spare3,
      cost3: form.cost3,
      spare4: form.spare4,
      cost4: form.cost4,
      spare5: form.spare5,
      cost5: form.cost5,
      spare6: form.spare6,
      cost6: form.cost6,
      spare_cost: form.spare_cost,
      godown_cost: form.godown_cost,
      discount: form.discount,
      total: form.total,
      gst: form.gst === "Y" ? "Y" : "N",
      gst_amount: form.gst_amount,
      round_off: form.round_off,
      final_amount: form.final_amount,
      receive_amount: form.receive_amount,
      delivery_date: form.delivery_date,
      pc_number: form.pc_number,
      invoice_number: form.invoice_number,
      final_status: form.final_status === "Y" ? "Y" : "N",
    };

    // Map empty string values to null
    const payload = Object.fromEntries(
      Object.entries(rawPayload).map(([k, v]) => [k, v === "" ? null : v]),
    );
    try {
      await updateOutOfWarranty(form.srf_number, payload);
      setError({
        message: "Out Of Warranty record updated!",
        resolution: "Customer Name : " + form.name,
        type: "success",
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Failed to update out of warranty record.",
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
    setForm((prev) => {
      const updated = { ...prev, [name]: newValue };
      // Recalculate total immediately if relevant field changes
      if (
        [
          "rewinding_cost",
          "other_cost",
          "spare_cost",
          "godown_cost",
          "service_charge",
          "discount",
        ].includes(name)
      ) {
        const rewinding_cost =
          name === "rewinding_cost"
            ? parseFloat(newValue) || 0
            : parseFloat(updated.rewinding_cost) || 0;
        const other_cost =
          name === "other_cost"
            ? parseFloat(newValue) || 0
            : parseFloat(updated.other_cost) || 0;
        const spare_cost =
          name === "spare_cost"
            ? parseFloat(newValue) || 0
            : parseFloat(updated.spare_cost) || 0;
        const godown_cost =
          name === "godown_cost"
            ? parseFloat(newValue) || 0
            : parseFloat(updated.godown_cost) || 0;
        const service_charge =
          name === "service_charge"
            ? parseFloat(newValue) || 0
            : parseFloat(updated.service_charge) || 0;
        const discount =
          name === "discount"
            ? parseFloat(newValue) || 0
            : parseFloat(updated.discount) || 0;
        updated.total =
          rewinding_cost +
          other_cost +
          spare_cost +
          godown_cost +
          service_charge -
          discount;
      }
      return updated;
    });
    setError((prev) => ({ ...prev, [name]: undefined }));
  };

  // Recalculate gst_amount, final_amount, and round_off whenever total or gst changes
  useEffect(() => {
    let gst_amount = "";
    if (form.gst === "Y") {
      gst_amount = Math.round((parseFloat(form.total) || 0) * 0.18 * 100) / 100;
    }
    const totalVal = parseFloat(form.total) || 0;
    const gstVal = parseFloat(gst_amount) || 0;
    const rawFinal = totalVal + gstVal;
    const roundedFinal = Math.round(rawFinal);
    const round_off = Math.round((roundedFinal - rawFinal) * 100) / 100;

    // Clear invoice_number when GST is "N" and pc_number when GST is "Y"
    let newForm = {
      gst_amount,
      final_amount: roundedFinal,
      round_off,
    };

    if (form.gst === "N") {
      newForm.invoice_number = "";
    } else if (form.gst === "Y") {
      newForm.pc_number = "";
    }

    if (
      form.gst_amount !== gst_amount ||
      form.final_amount !== roundedFinal ||
      form.round_off !== round_off ||
      (form.gst === "N" && form.invoice_number !== "") ||
      (form.gst === "Y" && form.pc_number !== "")
    ) {
      setForm((prev) => ({
        ...prev,
        ...newForm,
      }));
    }
  }, [form.total, form.gst]);

  // Calculate total when form loads or when component values change (for initial load or null total from backend)
  useEffect(() => {
    const rewinding_cost = parseFloat(form.rewinding_cost) || 0;
    const other_cost = parseFloat(form.other_cost) || 0;
    const spare_cost = parseFloat(form.spare_cost) || 0;
    const godown_cost = parseFloat(form.godown_cost) || 0;
    const service_charge = parseFloat(form.service_charge) || 0;
    const discount = parseFloat(form.discount) || 0;

    const calculatedTotal =
      rewinding_cost +
      other_cost +
      spare_cost +
      godown_cost +
      service_charge -
      discount;

    // Only update if total is null/empty or if there's an actual difference
    if (
      form.total === "" ||
      form.total === null ||
      parseFloat(form.total) !== calculatedTotal
    ) {
      setForm((prev) => ({
        ...prev,
        total: calculatedTotal,
      }));
    }
  }, [
    form.rewinding_cost,
    form.other_cost,
    form.spare_cost,
    form.godown_cost,
    form.service_charge,
    form.discount,
  ]); // Trigger when any cost component changes

  return (
    <div className="flex min-h-[80vh] mt-6 justify-center items-center">
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="bg-[#f8fafc] shadow-lg rounded-lg p-6 w-full max-w-200 border border-gray-200"
        noValidate
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Update Out Of Warranty Record
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
              className="w-34 text-md font-medium text-gray-700"
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
                  disabled={isLocked || submitting}
                  autoComplete="name"
                ></input>
              </div>
            </div>
          </div>
          {/* Division and Receive Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-3/5 gap-2">
              <label
                htmlFor="model"
                className="w-52 text-md font-medium text-gray-700"
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

            <div className="flex items-center w-2/5 gap-2">
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
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-3/5 gap-2">
              <label
                htmlFor="serial_number"
                className="w-52 text-md font-medium text-gray-700"
              >
                Serial Number
              </label>
              <input
                id="serial_number"
                name="serial_number"
                type="text"
                value={form.serial_number}
                readOnly
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.serial_number ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>
            <div className="flex items-center w-2/5 gap-2">
              <label
                htmlFor="service_charge"
                className={`w-55 text-md font-medium text-gray-700 gap-1`}
              >
                Service Charge
              </label>
              <input
                id="service_charge"
                name="service_charge"
                type="number"
                value={form.service_charge}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.service_charge ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                readOnly
                disabled={isLocked || submitting}
              />
            </div>
          </div>
          {/* Elegant divider above Vendor Activity button for clarity */}
          <div className="w-full flex items-center">
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
            <span
              className="mx-3 text-blue-400 font-semibold text-xs tracking-widest select-none"
              style={{ letterSpacing: 2 }}
            >
              VENDOR SECTION
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
          {/* Vendor Activity Toggle Button */}
          <div className="flex items-center w-full justify-center">
            <button
              type="button"
              className={`transition-all duration-300 px-4 py-1.5 rounded-lg font-semibold shadow text-white ${showVendorActivity ? "bg-gradient-to-r from-blue-700 to-blue-400" : "bg-gradient-to-r from-blue-400 to-blue-700"}`}
              onClick={() => setShowVendorActivity((prev) => !prev)}
              style={{ minWidth: 180 }}
            >
              {showVendorActivity
                ? "Hide Vendor Activity"
                : "Show Vendor Activity"}
            </button>
          </div>
          {/* Vendor Activity Fields - animated dropdown */}
          <div
            style={{
              maxHeight: showVendorActivity ? 1000 : 0,
              overflow: "hidden",
              transition:
                "max-height 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.8s cubic-bezier(0.4,0,0.2,1)",
              willChange: "max-height",
            }}
          >
            {/* Handover To (received_by) */}
            <div className="flex items-center w-full gap-3 mt-1">
              <label
                htmlFor="received_by"
                className="w-40.5 text-md font-medium text-gray-700"
              >
                Handover To
              </label>
              <div className="w-full relative">
                <input
                  id="received_by"
                  name="received_by"
                  type="text"
                  value={form.received_by}
                  readOnly
                  className={`w-full px-3 py-1 rounded-lg ${errs_label.received_by ? "border-red-300" : "border-gray-300"} border border-gray-300 bg-gray-50 text-gray-900 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  disabled={isLocked || submitting}
                  autoComplete="off"
                ></input>
              </div>
            </div>
            {/* Vendor Cost and Dates */}
            <div className="flex items-center w-full gap-3.5 mt-4">
              <div className="flex items-center w-3/5 gap-2">
                <label
                  htmlFor="vendor_cost1"
                  className="w-60 text-md font-medium text-gray-700"
                >
                  Rewinding Cost to Vendor
                </label>
                <input
                  id="vendor_cost1"
                  name="vendor_cost1"
                  type="number"
                  value={form.vendor_cost1}
                  onChange={handleChange}
                  className={`flex-1 min-w-0 w-full px-3 py-1 rounded-lg border ${errs_label.vendor_cost1 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  disabled={isLocked || submitting}
                />
              </div>

              <div className="flex items-center w-2/5 gap-2">
                <label
                  htmlFor="vendor_date1"
                  className={`w-57 text-md font-medium text-gray-700 gap-1 ml-2`}
                >
                  Handover Date
                </label>
                <input
                  id="vendor_date1"
                  name="vendor_date1"
                  type="date"
                  value={form.vendor_date1}
                  readOnly
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.vendor_date1 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                  disabled={isLocked || submitting}
                />
              </div>
            </div>
            <div className="flex items-center w-full gap-3.5 mt-4">
              <div className="flex items-center w-3/5 gap-2">
                <label
                  htmlFor="vendor_cost2"
                  className="w-60 text-md font-medium text-gray-700"
                >
                  Other Cost to Vendor
                </label>
                <input
                  id="vendor_cost2"
                  name="vendor_cost2"
                  type="number"
                  value={form.vendor_cost2}
                  onChange={handleChange}
                  className={`flex-1 min-w-0 w-full px-3 py-1 rounded-lg border ${errs_label.vendor_cost2 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  disabled={isLocked || submitting}
                />
              </div>

              <div className="flex items-center w-2/5 gap-2">
                <label
                  htmlFor="vendor_date2"
                  className={`w-57 text-md font-medium text-gray-700 gap-1 ml-2`}
                >
                  Return Date
                </label>
                <input
                  id="vendor_date2"
                  name="vendor_date2"
                  type="date"
                  value={form.vendor_date2}
                  onChange={handleChange}
                  max={new Date().toLocaleDateString("en-CA")}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.vendor_date2 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  disabled={isLocked || submitting}
                />
              </div>
            </div>
          </div>
          {/* Elegant divider above Vendor Activity button for clarity */}
          <div className="w-full flex items-center">
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
            <span
              className="mx-3 text-blue-400 font-semibold text-xs tracking-widest select-none"
              style={{ letterSpacing: 2 }}
            >
              CUSTOMER SECTION
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
          {/* Vendor Cost and Dates */}
          <div className="flex items-center w-full gap-3.5">
            <div className="flex items-center w-3/5 gap-2">
              <label
                htmlFor="rewinding_cost"
                className="w-60 text-md font-medium text-gray-700"
              >
                Rewinding Cost to Customer
              </label>
              <input
                id="rewinding_cost"
                name="rewinding_cost"
                type="number"
                value={form.rewinding_cost}
                onChange={handleChange}
                className={`flex-1 min-w-0 w-full px-3 py-1 rounded-lg border ${errs_label.rewinding_cost ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting}
              />
            </div>

            <div className="flex items-center w-2/5 gap-2">
              <label
                htmlFor="estimate_date"
                className={`w-57 text-md font-medium text-gray-700 gap-1 ml-2`}
              >
                Estimate Date
              </label>
              <input
                id="estimate_date"
                name="estimate_date"
                type="date"
                value={form.estimate_date}
                onChange={handleChange}
                max={new Date().toLocaleDateString("en-CA")}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.estimate_date ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting}
              />
            </div>
          </div>
          <div className="flex items-center w-full gap-3.5">
            <div className="flex items-center w-3/5 gap-2">
              <label
                htmlFor="other_cost"
                className="w-60 text-md font-medium text-gray-700"
              >
                Other Cost to Customer
              </label>
              <input
                id="other_cost"
                name="other_cost"
                type="number"
                value={form.other_cost}
                onChange={handleChange}
                className={`flex-1 min-w-0 w-full px-3 py-1 rounded-lg border ${errs_label.other_cost ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting}
              />
            </div>

            <div className="flex items-center w-2/5 gap-2">
              <label
                htmlFor="repair_date"
                className={`w-57 text-md font-medium text-gray-700 gap-1 ml-2`}
              >
                Repair Date
              </label>
              <input
                id="repair_date"
                name="repair_date"
                type="date"
                value={form.repair_date}
                onChange={handleChange}
                max={new Date().toLocaleDateString("en-CA")}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.repair_date ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting}
              />
            </div>
          </div>

          <div
            className="flex items-center gap-2 w-full"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="work_done"
              className="w-34 text-md font-medium text-gray-700"
            >
              Work Done
            </label>
            <div className="flex-1 flex items-center gap-2">
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="work_done"
                  name="work_done"
                  type="text"
                  value={form.work_done}
                  onChange={handleChange}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.work_done ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  disabled={isLocked || submitting}
                  autoComplete="work_done"
                ></input>
              </div>
            </div>
          </div>
          {/* Elegant divider above Vendor Activity button for clarity */}
          <div className="w-full flex items-center">
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
            <span
              className="mx-3 text-blue-400 font-semibold text-xs tracking-widest select-none"
              style={{ letterSpacing: 2 }}
            >
              SPARES SECTION
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
          {/* Spares Table */}
          <div className="w-full mt-2">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-md">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="py-1.5 text-center font-semibold text-gray-700">
                      Index
                    </th>
                    <th className="px-3 py-1.5 text-center font-semibold text-gray-700">
                      Spare
                    </th>
                    <th className="px-3 py-1.5 text-center font-semibold text-gray-700">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {spares.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50 transition rounded-sm"
                    >
                      <td className="px-2 py-1 text-center text-gray-700">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1">
                        <input
                          id={`spare${idx + 1}`}
                          name={`spare${idx + 1}`}
                          type="text"
                          value={item.spare}
                          onChange={(e) =>
                            handleSpareChange(idx, "spare", e.target.value)
                          }
                          className={`w-full px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 shadow-sm`}
                          maxLength={30}
                          disabled={isLocked || submitting}
                        />
                      </td>
                      <td className="px-2 py-1 w-25">
                        <input
                          id={`cost${idx + 1}`}
                          name={`cost${idx + 1}`}
                          type="number"
                          value={item.cost}
                          onChange={(e) =>
                            handleSpareChange(idx, "cost", e.target.value)
                          }
                          className={`w-full px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 shadow-sm`}
                          min={0}
                          disabled={isLocked || submitting || !item.spare}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-1.5">
              <button
                className="text-blue-600 font-semibold hover:underline focus:outline-none"
                onClick={handleAddSpare}
                type="button"
                disabled={
                  submitting ||
                  !spares[spares.length - 1].spare ||
                  spares.length >= 6
                }
              >
                + Add New Item
              </button>
            </div>
          </div>
          {/* Existing spare_cost/godown_cost fields below table */}
          <div className="flex items-center w-full gap-6 mt-2">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="spare_cost"
                className="w-44 text-md font-medium text-gray-700"
              >
                Total Spare Cost
              </label>
              <input
                id="spare_cost"
                name="spare_cost"
                type="number"
                value={form.spare_cost}
                readOnly
                className={`flex-1 min-w-0 w-full px-3 py-1 rounded-lg border ${errs_label.spare_cost ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="godown_cost"
                className={`w-50 text-md font-medium text-gray-700 gap-1`}
              >
                Godown Cost
              </label>
              <input
                id="godown_cost"
                name="godown_cost"
                type="number"
                onChange={handleChange}
                value={form.godown_cost}
                className={`flex-1 min-w-0 px-3 py-1 rounded-lg border ${errs_label.godown_cost ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting}
              />
            </div>
          </div>
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="discount"
                className="w-44 text-md font-medium text-gray-700"
              >
                Discount
              </label>
              <input
                id="discount"
                name="discount"
                type="number"
                value={form.discount}
                onChange={handleChange}
                className={`flex-1 min-w-0 w-full px-3 py-1 rounded-lg border ${errs_label.discount ? "border-red-300" : "border-gray-300"} ${!isAdmin ? "bg-gray-200 text-gray-600 cursor-not-allowed" : "bg-gray-50 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting || !isAdmin}
                placeholder={!isAdmin ? "Disabled" : form.discount}
              />
            </div>

            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="total"
                className={`w-50 text-md font-medium text-gray-700 gap-1`}
              >
                Total Amount
              </label>
              <input
                id="total"
                name="total"
                type="number"
                value={form.total}
                readOnly
                className={`flex-1 min-w-0 px-3 py-1 rounded-lg border ${errs_label.total ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>
          </div>

          {/* Elegant divider above Vendor Activity button for clarity */}
          <div className="w-full flex items-center">
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
            <span
              className="mx-3 text-blue-400 font-semibold text-xs tracking-widest select-none"
              style={{ letterSpacing: 2 }}
            >
              FINAL CALCULATION SECTION
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
          {/* Vendor Cost and Dates */}

          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="gst"
                className="w-55 text-md font-medium text-gray-700"
              >
                GST
              </label>

              <div className="flex justify-center w-full">
                {/* Hidden input for accessibility and autofill */}
                <input
                  id="gst"
                  name="gst"
                  type="text"
                  value={form.gst}
                  style={{ display: "none" }}
                  readOnly
                  tabIndex={-1}
                />
                <YesNoToggle
                  form={form}
                  setForm={setForm}
                  disabled={isLocked || submitting}
                />
              </div>
            </div>

            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="gst_amount"
                className={`w-50 text-md font-medium text-gray-700 gap-1`}
              >
                GST Amount
              </label>
              <input
                id="gst_amount"
                name="gst_amount"
                type="number"
                readOnly
                value={form.gst_amount}
                onChange={handleChange}
                className={`flex-1 min-w-0 px-3 py-1 rounded-lg border ${errs_label.gst_amount ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>
          </div>
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="round_off"
                className="w-44 text-md font-medium text-gray-700"
              >
                Round Off Amount
              </label>
              <input
                id="round_off"
                name="round_off"
                type="number"
                value={form.round_off}
                readOnly
                className={`flex-1 min-w-0 w-full px-3 py-1 rounded-lg border ${errs_label.round_off ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>

            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="final_amount"
                className={`w-50 text-md font-medium text-gray-700 gap-1`}
              >
                Final Amount
              </label>
              <input
                id="final_amount"
                name="final_amount"
                type="number"
                value={form.final_amount}
                readOnly
                className={`flex-1 min-w-0 px-3 py-1 rounded-lg border ${errs_label.final_amount ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>
          </div>
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="pc_number"
                className="w-34 text-md font-medium text-gray-700"
              >
                PC Number
              </label>
              <input
                id="pc_number"
                name="pc_number"
                type="number"
                value={form.pc_number}
                onChange={handleChange}
                className={`flex-1 min-w-0 w-full px-3 py-1 rounded-lg border ${errs_label.pc_number ? "border-red-300" : "border-gray-300"} ${form.gst === "Y" ? "bg-gray-200 text-gray-600 cursor-not-allowed" : "bg-gray-50 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting || form.gst === "Y"}
                placeholder={form.gst === "Y" ? "Disabled" : undefined}
              />
            </div>

            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="receive_amount"
                className={`w-50 text-md font-medium text-gray-700 gap-1`}
              >
                Amount Received
              </label>
              <input
                id="receive_amount"
                name="receive_amount"
                type="number"
                value={form.receive_amount}
                onChange={handleChange}
                className={`flex-1 min-w-0 px-3 py-1 rounded-lg border ${errs_label.receive_amount ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting}
              />
            </div>
          </div>
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="invoice_number"
                className="w-34 text-md font-medium text-gray-700"
              >
                Invoice Number
              </label>
              <input
                id="invoice_number"
                name="invoice_number"
                type="number"
                value={form.invoice_number}
                onChange={handleChange}
                className={`flex-1 min-w-0 w-full px-3 py-1 rounded-lg border ${errs_label.invoice_number ? "border-red-300" : "border-gray-300"} ${form.gst === "N" ? "bg-gray-200 text-gray-600 cursor-not-allowed" : "bg-gray-50 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting || form.gst === "N"}
                placeholder={form.gst === "N" ? "Disabled" : undefined}
              />
            </div>

            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="delivery_date"
                className={`w-123 text-md font-medium text-gray-700 gap-1`}
              >
                Delivery Date
              </label>
              <input
                id="delivery_date"
                name="delivery_date"
                type="date"
                value={form.delivery_date}
                onChange={handleChange}
                max={new Date().toLocaleDateString("en-CA")}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.delivery_date ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                disabled={isLocked || submitting}
              />
            </div>
          </div>

          {/* Courier Number and Final Status - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-6">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="final_status"
                className="w-38 text-md font-medium text-gray-700"
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

export default OutOfWarrantyUpdatePage;
