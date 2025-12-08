import React, { useEffect, useState, useRef } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";
import Toast from "../components/Toast";
import { createOutOfWarrantyVendorChallan } from "../services/outOfWarrantyVendorChallanCreateService";
import { fetchOutOfWarrantyVendorChallanList } from "../services/outOfWarrantyVendorChallanListService";
import { fetchNextOutOfWarrantyVendorChallanCode } from "../services/outOfWarrantyVendorChallanNextCodeService";
import { fetchOutOfWarrantyReceivedBy } from "../services/outOfWarrantyReceivedByService";

const columns = [
  { key: "srf_number", label: "SRF Number" },
  { key: "division", label: "Division" },
  { key: "model", label: "Model" },
  { key: "serial_number", label: "Serial Number" },
  { key: "challan", label: "Challan" },
];

const initialForm = {
  challan_code: "",
  challan_date: new Date().toLocaleDateString("en-CA"),
  received_by: "",
};

// Suggestions for Received By

const OutOfWarrantyCreateVendorPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const tableRef = useRef();
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [receivedBySuggestions, setReceivedBySuggestions] = useState([]);
  const [showReceivedBySuggestions, setShowReceivedBySuggestions] =
    useState(false);

  // Handler for Create Challan button
  const handleCreateChallan = async () => {
    setUpdating(true);
    // Prepare payload: only rows with challan === "Y"
    const payload = data
      .filter((row) => row.challan === "Y")
      .map((row) => ({
        srf_number: row.srf_number,
        challan_number: form.challan_code,
        vendor_date1: form.challan_date,
        challan: row.challan,
        received_by: form.received_by,
      }));
    if (payload.length === 0) {
      setError({
        message: "No records selected.",
        type: "warning",
        resolution: "Please select at least one record.",
      });
      setShowToast(true);
      setUpdating(false);
      return;
    }
    if (!form.received_by) {
      setError({
        message: "Received By is required.",
        type: "warning",
      });
      setShowToast(true);
      setUpdating(false);
      return;
    }
    try {
      await createOutOfWarrantyVendorChallan(payload);
      setError({
        message: "Challan created successfully!",
        type: "success",
        resolution: "Challan Number: " + form.challan_code,
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err.message || "Challan creation failed",
        type: "error",
        resolution: "Please try again later.",
      });
      setShowToast(true);
    } finally {
      setUpdating(false);
    }
  };
  // Fetch next Challan Code on mount
  useEffect(() => {
    let mounted = true;
    fetchNextOutOfWarrantyVendorChallanCode()
      .then((data) => {
        if (mounted && data) {
          setForm((prev) => ({
            ...prev,
            challan_code: data.next_vendor_challan_code || "",
          }));
        }
      })
      .catch(() => {
        setForm((prev) => ({ ...prev, challan_code: "" }));
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Handler for Received By input change
  const handleReceivedByChange = async (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, received_by: value }));
    if (value.length > 0) {
      try {
        const suggestions = await fetchOutOfWarrantyReceivedBy(value);
        setReceivedBySuggestions(Array.isArray(suggestions) ? suggestions : []);
        setShowReceivedBySuggestions(suggestions.length > 0);
      } catch {
        setReceivedBySuggestions([]);
        setShowReceivedBySuggestions(false);
      }
    } else {
      setShowReceivedBySuggestions(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchOutOfWarrantyVendorChallanList()
      .then((result) => {
        if (mounted) {
          setData(Array.isArray(result) ? result : []);
        }
      })
      .catch((err) => {
        setError({
          message: err.message || "Failed to fetch records.",
          type: "error",
          resolution: "Please try again later.",
        });
        setShowToast(true);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Handler for editing challan
  const handleReceivedChange = (idx, value) => {
    setData((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], challan: value };
      return updated;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f6fa",
        boxSizing: "border-box",
        padding: "20px 0",
      }}
    >
      <Paper
        elevation={5}
        sx={{
          pt: 3,
          pr: 3,
          pl: 3,
          pb: 2,
          borderRadius: 4,
          background: "#f8fafc",
          maxWidth: 900,
          width: "100%",
          boxSizing: "border-box",
          margin: "0 16px",
          overflowX: "auto",
        }}
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Out of Warranty Vendor Challan Creation
        </h2>

        {/* Form Section - reference WarrantyCreatePage styling */}
        <form style={{ marginBottom: 24 }} autoComplete="off">
          {/* Challan Code Row */}
          <div className="flex items-center gap-3 justify-center mb-3">
            <label
              htmlFor="challan_code"
              className="text-md font-medium text-blue-800"
            >
              Challan Code
            </label>
            <input
              id="challan_code"
              name="challan_code"
              type="text"
              value={form.challan_code}
              readOnly
              disabled
              autoComplete="off"
              className="w-35 text-center px-2 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-medium cursor-not-allowed"
              style={{ minWidth: 120 }}
            />
          </div>
          {/* SRF Date and Received By Row */}
          <div
            className="flex items-center justify-center mb-2 mt-3 gap-5"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="received_by"
              className="text-md font-medium text-gray-700 w-25"
            >
              Received By<span className="text-red-500">*</span>
            </label>
            <div
              className="w-35"
              style={{ minWidth: 300, position: "relative" }}
            >
              <input
                id="received_by"
                name="received_by"
                type="text"
                value={form.received_by}
                onChange={handleReceivedByChange}
                required
                maxLength={20}
                className="w-full px-2 py-1 rounded-lg border border-gray-300 text-gray-900 font-small focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoComplete="off"
                style={{ minWidth: 200 }}
                onFocus={() => {
                  if (
                    form.received_by.length > 0 &&
                    receivedBySuggestions.length > 0
                  )
                    setShowReceivedBySuggestions(true);
                }}
                onBlur={() =>
                  setTimeout(() => setShowReceivedBySuggestions(false), 150)
                }
              />
              {showReceivedBySuggestions && (
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
                  {receivedBySuggestions.map((n) => (
                    <li
                      key={n}
                      style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                      onMouseDown={() => {
                        setForm((prev) => ({ ...prev, received_by: n }));
                        setShowReceivedBySuggestions(false);
                      }}
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </form>

        {/* Table Section */}
        <div ref={tableRef}>
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 3, boxShadow: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: "#e3eafc" }}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      sx={{
                        fontWeight: 700,
                        fontSize: 16,
                        textAlign: "center",
                        py: 1,
                        ...(col.label.toLowerCase().includes("date") && {
                          whiteSpace: "nowrap",
                        }),
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      style={{
                        textAlign: "center",
                        color: "#888",
                        fontStyle: "italic",
                        padding: "24px 0",
                      }}
                    >
                      No Pending Records
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        background: idx % 2 === 0 ? "#f4f8ff" : "#fff",
                        height: 32,
                      }}
                    >
                      {columns.map((col) => (
                        <TableCell
                          key={col.key}
                          sx={{
                            fontWeight: 500,
                            textAlign: "center",
                            py: 0.5,
                            ...(col.label.toLowerCase().includes("date") && {
                              whiteSpace: "nowrap",
                            }),
                          }}
                        >
                          {col.key === "challan" ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleReceivedChange(
                                  idx,
                                  row.challan === "Y" ? "N" : "Y",
                                )
                              }
                              style={{
                                width: "60px",
                                padding: "4px 0",
                                borderRadius: "6px",
                                border: "none",
                                background:
                                  row.challan === "Y" ? "#e3fcec" : "#ffe3e3",
                                color:
                                  row.challan === "Y" ? "#388e3c" : "#d32f2f",
                                fontWeight: 700,
                                fontSize: "15px",
                                cursor: "pointer",
                                boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
                                transition: "background 0.2s, color 0.2s",
                              }}
                              aria-label="Toggle Received"
                            >
                              {row.challan === "Y" ? "Yes" : "No"}
                            </button>
                          ) : row[col.key] !== null &&
                            row[col.key] !== undefined ? (
                            row[col.key]
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: "#1976d2",
              fontWeight: 700,
              fontSize: 17,
              background: "#e3eafc",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
              display: "inline-block",
            }}
          >
            <span style={{ letterSpacing: 0.5 }}>Selected Records:</span>{" "}
            <span style={{ color: "#0d47a1", fontWeight: 600 }}>
              {data.filter((row) => row.challan === "Y").length}
            </span>
          </Typography>
          <button
            type="button"
            onClick={handleCreateChallan}
            disabled={updating || data.length === 0}
            style={{
              background: "#1976d2",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              border: "none",
              borderRadius: "6px",
              padding: "8px 24px",
              cursor: updating ? "not-allowed" : "pointer",
              boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
              opacity: updating ? 0.7 : 1,
              transition: "background 0.2s, color 0.2s",
            }}
            aria-label="Creating Challan Record"
          >
            {updating ? "Creating..." : "Create Challan"}
          </button>
        </Box>
        {showToast && (
          <Toast
            message={error.message}
            resolution={error.resolution}
            type={error.type}
            onClose={() => setShowToast(false)}
          />
        )}
      </Paper>
    </div>
  );
};

export default OutOfWarrantyCreateVendorPage;
