import React, { useState, useEffect, useRef } from "react";
import Toast from "../components/Toast";
import { fetchASCNames } from "../services/serviceCenterASCNamesService";
import { createASCName } from "../services/serviceCenterCreateService";

const initialForm = {
  asc_name: "",
};

const ServiceCenterCreatePage = () => {
  const [form, setForm] = useState(initialForm);

  const [codeLoading, setCodeLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [ascNames, setascNames] = useState([]);
  const [ascNameSuggestions, setAscNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef(null);
  const [nameInputWidth, setNameInputWidth] = useState("100%");

  // Handle input change and update suggestions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update suggestions for ASC Name
    if (name === "asc_name") {
      const suggestions = ascNames.filter(
        (n) =>
          n.toLowerCase().includes(value.toLowerCase()) && value.length > 0,
      );
      setAscNameSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    }
  };

  useEffect(() => {
    if (nameInputRef.current) {
      setNameInputWidth(nameInputRef.current.offsetWidth + "px");
    }
  }, [form.asc_name, showSuggestions]);

  useEffect(() => {
    let mounted = true;

    fetchASCNames()
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setascNames(data);
        }
      })
      .catch(() => setascNames([]));

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.asc_name || form.asc_name.trim() === "") {
      setError({
        message: "ASC Name is required.",
        resolution: "Please enter a valid ASC Name.",
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    setSubmitting(true);

    const rawPayload = {
      asc_name: form.asc_name,
    };
    // Map empty string values to null
    const payload = Object.fromEntries(
      Object.entries(rawPayload).map(([k, v]) => [k, v === "" ? null : v]),
    );
    try {
      await createASCName(payload);
      setError({
        message: "ASC record created successfully!",
        resolution: "ASC Name : " + form.asc_name,
        type: "success",
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Failed to create ASC record.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] justify-center items-center">
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="bg-[#f8fafc] shadow-lg rounded-lg p-6 w-full max-w-140 border border-gray-200"
        noValidate
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-8 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Add ASC Name Record
        </h2>
        <div className="flex flex-col gap-4">
          {/* Name (label beside input, autocomplete, search) */}
          <div
            className="flex items-center w-full"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="asc_name"
              className="w-25 text-md font-medium text-gray-700"
            >
              ASC Name<span className="text-red-500">*</span>
            </label>
            <div className="flex-1 flex items-center gap-2">
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="asc_name"
                  name="asc_name"
                  type="text"
                  value={form.asc_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  minLength={3}
                  maxLength={30}
                  required
                  disabled={submitting}
                  autoComplete="asc_name"
                  onFocus={() => {
                    if (form.asc_name.length > 0 && nameSuggestions.length > 0)
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
                    {ascNameSuggestions.map((n) => (
                      <li
                        key={n}
                        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                        onMouseDown={() => {
                          setForm((prev) => ({ ...prev, asc_name: n }));
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

export default ServiceCenterCreatePage;
