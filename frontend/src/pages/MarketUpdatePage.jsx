import React, { useState, useEffect, useRef } from "react";
import Toast from "../components/Toast";
import { validateMarketUpdate } from "../utils/marketUpdateValidation";
import { updateMarket } from "../services/marketUpdateService";
import { FiSearch } from "react-icons/fi";
import { searchMarketByCode } from "../services/marketSearchByCodeService";
import FinalStatusToggle from "../components/FinalStatus";
import PendingBar from "../components/PendingBar";
import { fetchMarketPending } from "../services/marketPendingService";
import { fetchMarketDeliveredBy } from "../services/marketDeliveredByService";

const initialForm = {
  mcode: "",
  name: "",
  division: "",
  receive_date: "",
  invoice_number: "",
  invoice_date: "",
  delivery_by: "",
  delivery_date: "",
  quantity: "",
  remark: "",
  final_status: "Pending",
};

const MarketUpdatePage = () => {
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

    const codeToSearch = searchCode ?? form.mcode;
    if (!codeToSearch) {
      setError({ message: "Please provide Receipt Number", type: "warning" });
      setShowToast(true);
      return;
    }

    try {
      const data = await searchMarketByCode(codeToSearch);

      setForm({
        mcode: data.mcode ?? "",
        name: data.name ?? "",
        division: data.division ?? "",
        receive_date: data.receive_date ?? "",
        invoice_number: data.invoice_number ?? "",
        invoice_date: data.invoice_date ?? "",
        delivery_by: data.delivery_by ?? "",
        delivery_date: data.delivery_date ?? "",
        quantity: data.quantity ?? "",
        remark: data.remark ?? "",
        final_status: data.final_status ?? "Pending",
      });

      // Handle locked state
      if (data.final_status === "Y") {
        setError({
          message: "Already settled",
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
        const response = await fetchMarketPending();
        setPendingItems(response || []);
      } catch (error) {
        console.error("Error fetching pending:", error);
      }
    };

    const fetchDeliveredBy = async () => {
      try {
        const data = await fetchMarketDeliveredBy();
        if (Array.isArray(data)) setDeliveredByList(data);
      } catch (error) {
        setDeliveredByList([]);
      }
    };

    fetchPending();
    fetchDeliveredBy();
  }, []);

  // Validation
  const [errs, errs_label] = validateMarketUpdate(form);

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
      delivery_by: form.delivery_by,
      final_status: form.final_status,
      remark: form.remark,
    };
    // Map empty string values to null
    const payload = Object.fromEntries(
      Object.entries(rawPayload).map(([k, v]) => [k, v === "" ? null : v]),
    );
    try {
      await updateMarket(form.mcode, payload);
      setError({
        message: "Market record updated successfully!",
        resolution: "Customer Name : " + form.name,
        type: "success",
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Failed to update market record.",
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
    if (name === "delivery_by") {
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
          Update Market Record
        </h2>
        <div className="flex flex-col gap-4">
          {/* mcode (readonly, small, label beside input) */}
          <div className="flex items-center gap-3 justify-center">
            <label
              htmlFor="mcode"
              className="text-md font-medium text-gray-700"
            >
              Receipt Number
            </label>
            <input
              id="mcode"
              name="mcode"
              type="text"
              value={form.mcode}
              onChange={handleChange}
              disabled={submitting}
              required
              autoComplete="off"
              className="w-25 text-center px-2 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 font-medium"
              maxLength={6}
              style={{ minWidth: 0 }}
            />
            <button
              type="button"
              title="Search by code"
              className="p-0 rounded-full bg-gradient-to-tr from-blue-200 to-blue-500 text-white shadow-md hover:scale-105 hover:from-blue-600 hover:to-blue-900 focus:outline-none transition-all duration-200 flex items-center justify-center"
              disabled={submitting || !form.mcode}
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
                  disabled={isLocked || submitting}
                  autoComplete="name"
                ></input>
              </div>
            </div>
          </div>
          {/* Division and Receive Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-3">
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
                className={`w-full px-3 py-1 rounded-lg border ${
                  errs_label.division ? "border-red-300" : "border-gray-300"
                } bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              ></input>
            </div>

            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="receive_date"
                className={`w-55 text-md font-medium text-gray-700 ml-3 mr-1`}
              >
                Receive Date
              </label>
              <input
                id="receive_date"
                name="receive_date"
                type="date"
                required
                value={form.receive_date}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.receive_date ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                readOnly
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
                readOnly
                value={form.invoice_number}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.invoice_number ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="invoice_date"
                className="w-55 text-md font-medium text-gray-700 ml-3 mr-1"
              >
                Invoice Date
              </label>
              <input
                id="invoice_date"
                name="invoice_date"
                type="date"
                readOnly
                value={form.invoice_date}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.invoice_date ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
              />
            </div>
          </div>
          {/* Challan Number & Challan Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center w-1/2">
              <label
                htmlFor="delivery_by"
                className="w-64 text-md font-medium text-gray-700"
              >
                Delivered By
              </label>
              <div className="w-full relative">
                <input
                  id="delivery_by"
                  name="delivery_by"
                  type="text"
                  value={form.delivery_by}
                  onChange={handleChange}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.delivery_by ? "border-red-300" : "border-gray-300"} border-gray-300 bg-gray-50 text-gray-900`}
                  maxLength={20}
                  disabled={isLocked || submitting}
                  autoComplete="off"
                  onFocus={() => {
                    if (
                      form.delivery_by.length > 0 &&
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
                          setForm((prev) => ({ ...prev, delivery_by: n }));
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
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="delivery_date"
                className="w-55 text-md font-medium text-gray-700 ml-3 mr-1"
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
          {/* Remark */}
          <div
            className="flex items-center gap-2 w-full"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="remark"
              className="w-33.5 text-md font-medium text-gray-700"
            >
              Remark
            </label>
            <div className="flex-1 flex items-center gap-2">
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="remark"
                  name="remark"
                  type="text"
                  value={form.remark}
                  onChange={handleChange}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.remark ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  disabled={isLocked || submitting}
                  autoComplete="remark"
                ></input>
              </div>
            </div>
          </div>
          {/* Quantity and Final Status - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="quantity"
                className="w-65 text-md font-medium text-gray-700"
              >
                Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="text"
                readOnly
                value={form.quantity}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.quantity ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                disabled={isLocked || submitting}
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
        onSelect={(mcode) => {
          setForm((prev) => ({ ...prev, mcode })); // fill MCODE
          handleSearch(mcode); // auto-trigger search with passed code
        }}
      />
    </div>
  );
};

export default MarketUpdatePage;
