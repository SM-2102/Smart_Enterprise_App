import React, { useState, useEffect, useRef } from "react";
import Toast from "../components/Toast";
import { searchMasterAddress } from "../services/roadChallanAddressService";
import { validateChallan } from "../utils/roadChallanValidation";
import { fetchNextChallanNumber } from "../services/roadChallanNextCodeService";
import { FiSearch } from "react-icons/fi";
import { createRoadChallan } from "../services/roadChallanCreateService";
import { fetchMasterNames } from "../services/masterNamesService";

const initialForm = {
  challan_number: "",
  name: "",
  address: "",
  challan_date: "",
  order_number: "",
  order_date: "",
  invoice_number: "",
  invoice_date: "",
  remark: "",
};

const initialItems = [{ desc: "", qty: "", unit: "" }];

const unitOptions = ["PCS", "C.BOX", "W.BOX", "KGM", "LTR"];

const RoadChallanCreatePage = () => {
  const [form, setForm] = useState(initialForm);
  const [codeLoading, setCodeLoading] = useState(true);
  const [items, setItems] = useState(initialItems);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [masterNames, setMasterNames] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef(null);
  const [nameInputWidth, setNameInputWidth] = useState("100%");
  const [maxChallanDate, setMaxChallanDate] = useState("");
  useEffect(() => {
    let mounted = true;
    fetchNextChallanNumber()
      .then((data) => {
        if (mounted && data) {
          setForm((prev) => ({
            ...prev,
            challan_number: data.challan_number || "",
            challan_date: data.challan_date || "",
          }));
          setMaxChallanDate(data.challan_date || "");
        }
      })
      .catch(() => {
        setForm((prev) => ({ ...prev, challan_number: "" }));
        setMaxChallanDate("");
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
  const [errs, errs_label] = validateChallan(form, items);

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

  const handleItemChange = (idx, field, value) => {
    setItems((prev) => {
      const updated = prev.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      );
      // If desc is cleared, also clear qty and unit
      if (field === "desc" && value === "") {
        updated[idx].qty = "";
        updated[idx].unit = "";
      }
      return updated;
    });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (items.length < 8 && items[items.length - 1].desc) {
      setItems((prev) => [...prev, { desc: "", qty: "", unit: "" }]);
    }
  };

  const handleSearchAddress = async () => {
    setError("");
    setShowToast(false);
    try {
      const data = await searchMasterAddress(form.name);
      setForm((prev) => ({ ...prev, address: data.full_address ?? "" }));
    } catch (err) {
      setError({
        message: err.message || "Not found",
        resolution: err.resolution,
        type: "error",
      });
      setShowToast(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let i = 1; i < items.length; i++) {
      if (items[i].desc && !items[i - 1].desc) {
        setError({
          message: `Description ${i + 1} cannot be filled before previous rows`,
          type: "warning",
        });
        setShowToast(true);
        return;
      }
    }
    if (errs.length > 0) {
      setError({
        message: errs[0],
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    setSubmitting(true);
    // Map items to desc1-8, qty1-8, unit1-8
    const itemFields = {};
    for (let i = 0; i < 8; i++) {
      itemFields[`desc${i + 1}`] = items[i]?.desc || "";
      itemFields[`qty${i + 1}`] = items[i]?.qty ? Number(items[i].qty) : 0;
      itemFields[`unit${i + 1}`] = items[i]?.unit || "";
    }
    const rawPayload = {
      name: form.name,
      challan_date: form.challan_date,
      ...itemFields,
      order_number: form.order_number,
      order_date: form.order_date,
      invoice_number: form.invoice_number,
      invoice_date: form.invoice_date,
      remark: form.remark,
    };
    // Map empty string values to null
    const payload = Object.fromEntries(
      Object.entries(rawPayload).map(([k, v]) => [
        k,
        v === "" || v === 0 ? null : v,
      ]),
    );
    try {
      await createRoadChallan(payload);
      setError({
        message: "Challan created successfully!",
        resolution: "Customer Name : " + form.name,
        type: "success",
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Failed to create challan.",
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
        className="bg-[#f8fafc] shadow-lg rounded-lg p-6 w-full max-w-180 border border-gray-200"
        noValidate
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Create Road Challan
        </h2>
        <div className="flex flex-col gap-4">
          {/* Challan Number (readonly, small, label beside input) */}
          <div className="flex items-center gap-3 justify-center">
            <label
              htmlFor="challan_number"
              className="text-md font-medium text-blue-800"
            >
              Challan Number
            </label>
            <input
              id="challan_number"
              name="challan_number"
              type="text"
              value={form.challan_number}
              readOnly
              disabled={codeLoading || submitting}
              autoComplete="off"
              className="w-35 text-center px-2 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-medium cursor-not-allowed"
            />
          </div>
          {/* Challan Date (styled similar to Challan Number, below it) */}
          <div className="flex items-center gap-3 mb-2 justify-center">
            <label
              htmlFor="challan_date"
              className="text-md font-medium text-gray-700 w-29"
            >
              Challan Date<span className="text-red-500">*</span>
            </label>
            <input
              id="challan_date"
              name="challan_date"
              type="date"
              value={form.challan_date}
              onChange={handleChange}
              className={`w-35 text-center px-2 py-1 rounded-lg border ${errs_label.challan_date ? "border-red-300" : "border-gray-300"} border-gray-300 text-gray-900 font-small`}
              required
              disabled={submitting}
              min={maxChallanDate}
              max={new Date().toLocaleDateString("en-CA")}
            />
          </div>
          {/* Name (label beside input, autocomplete, search) */}
          <div
            className="flex items-center gap-2 w-full"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="name"
              className="w-33 text-md font-medium text-gray-700"
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
              <button
                type="button"
                title="Search by name"
                className="p-1 rounded-full bg-gradient-to-tr from-blue-200 to-blue-500 text-white shadow-md hover:scale-105 hover:from-blue-600 hover:to-blue-900 focus:outline-none transition-all duration-200 flex items-center justify-center"
                disabled={submitting || !form.name}
                onClick={handleSearchAddress}
                tabIndex={0}
                style={{ width: 32, height: 32 }}
              >
                <FiSearch size={20} />
              </button>
            </div>
          </div>
          {/* Address */}
          <div className="flex items-center gap-2 w-full">
            <label
              htmlFor="address"
              className="w-42.5 text-md font-medium text-gray-700"
            >
              Address<span className="text-red-500"></span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              className="w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900"
              minLength={3}
              maxLength={40}
              disabled={submitting}
              autoComplete="street-address"
            />
          </div>
          {/* Items Table - Elegant Look */}
          <div className="w-full mt-2">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-md">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="py-1.5 text-center font-semibold text-gray-700">
                      Index
                    </th>
                    <th className="px-3 py-1.5 text-center font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="px-3 py-1.5 text-center font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="px-3 py-1.5 text-center font-semibold text-gray-700">
                      Unit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50 transition rounded-sm"
                      style={{ boxShadow: "0 0 0 #e5e7eb" }}
                    >
                      <td className="px-2 py-1 text-center text-gray-700">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1">
                        <input
                          id={`desc-${idx}`}
                          name={`desc-${idx}`}
                          type="text"
                          value={item.desc}
                          onChange={(e) =>
                            handleItemChange(idx, "desc", e.target.value)
                          }
                          className={`w-full px-3 py-1 rounded-lg border ${item.desc && (!item.qty || !item.unit) ? "border-red-300" : "border-gray-200"} bg-gray-50 text-gray-900 shadow-sm`}
                          maxLength={30}
                          disabled={submitting}
                        />
                      </td>
                      <td className="px-2 py-1 w-25">
                        <input
                          id={`qty-${idx}`}
                          name={`qty-${idx}`}
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            handleItemChange(idx, "qty", e.target.value)
                          }
                          className={`w-full px-3 py-1 rounded-lg border ${item.desc && (!item.qty || Number(item.qty) < 1) ? "border-red-300" : "border-gray-200"} bg-gray-50 focus:ring-2 focus:ring-blue-200 text-gray-900 shadow-sm`}
                          min={item.desc ? 1 : 0}
                          disabled={submitting || !item.desc}
                        />
                      </td>
                      <td className="px-2 py-1 w-25">
                        <select
                          id={`unit-${idx}`}
                          name={`unit-${idx}`}
                          value={item.unit}
                          onChange={(e) =>
                            handleItemChange(idx, "unit", e.target.value)
                          }
                          className={`w-full px-3 py-1 rounded-lg border ${item.desc && !item.unit ? "border-red-300" : "border-gray-200"} bg-gray-50 focus:ring-2 focus:ring-blue-200 text-gray-900 shadow-sm`}
                          disabled={submitting || !item.desc}
                        >
                          <option value="" disabled></option>
                          {unitOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-1.5">
              <button
                className="text-blue-600 font-semibold hover:underline focus:outline-none"
                onClick={handleAddItem}
                type="button"
                disabled={
                  submitting ||
                  !items[items.length - 1].desc ||
                  items.length >= 8
                }
              >
                + Add New Item
              </button>
            </div>
          </div>
          {/* Order Number & Order Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-5">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="order_number"
                className="w-65 text-md font-medium text-gray-700"
              >
                Order Number
              </label>
              <input
                id="order_number"
                name="order_number"
                type="text"
                value={form.order_number}
                onChange={handleChange}
                className="w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900"
                maxLength={15}
                disabled={submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="order_date"
                className="w-55 text-md font-medium text-gray-700"
              >
                Order Date
              </label>
              <input
                id="order_date"
                name="order_date"
                type="date"
                value={form.order_date}
                onChange={handleChange}
                className="w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900"
                disabled={submitting}
                max={new Date().toLocaleDateString("en-CA")}
              />
            </div>
          </div>
          {/* Invoice Number & Invoice Date - label beside input, w-1/2 each */}
          <div className="flex items-center w-full gap-5">
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
                value={form.invoice_number}
                onChange={handleChange}
                className="w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900"
                maxLength={15}
                disabled={submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="invoice_date"
                className="w-55 text-md font-medium text-gray-700"
              >
                Invoice Date
              </label>
              <input
                id="invoice_date"
                name="invoice_date"
                type="date"
                value={form.invoice_date}
                onChange={handleChange}
                className="w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900"
                disabled={submitting}
                max={new Date().toLocaleDateString("en-CA")}
              />
            </div>
          </div>
          {/* Remark */}
          <div className="flex items-center gap-2 w-full">
            <label
              htmlFor="remark"
              className="w-42.5 text-md font-medium text-gray-700"
            >
              Remark<span className="text-red-500">*</span>
            </label>
            <input
              id="remark"
              name="remark"
              type="text"
              value={form.remark}
              onChange={handleChange}
              className={`w-full px-3 py-1 rounded-lg border ${errs_label.remark ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              minLength={1}
              maxLength={50}
              required
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
            {submitting ? "Creating..." : "Create Challan"}
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

export default RoadChallanCreatePage;
