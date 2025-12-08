import React, { useState, useEffect } from "react";
import { Container, Paper, InputBase, IconButton, Box } from "@mui/material";
import { BiSearch } from "react-icons/bi";
import Toast from "../components/Toast";
import { fetchMasterNames } from "../services/masterNamesService";
import { printOutOfWarrantyEstimate } from "../services/outOfWarrantyEstimatePrintService";
import { fetchOutOfWarrantyEstimatePrintDetails } from "../services/outOfWarrantyEstimatePrintDetailsService";

const OutOfWarrantyEstimatePrintPage = () => {
  const [customerName, setCustomerName] = useState("");
  const [masterNames, setMasterNames] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [printDetails, setPrintDetails] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const handleCheckboxChange = (srf_number) => {
    setSelectedRows((prev) => {
      if (prev.includes(srf_number)) {
        return prev.filter((r) => r !== srf_number);
      } else {
        if (prev.length >= 8) {
          setError({
            message: "You can select up to 8 records only.",
            resolution: "Deselect a record to select another.",
            type: "warning",
          });
          setShowToast(true);
          return prev;
        }
        return [...prev, srf_number];
      }
    });
  };

  const handlePrint = async () => {
    if (selectedRows.length === 0) {
      setError({
        message: "Select at least one row to print.",
        resolution: "Check a row and try again.",
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    try {
      // Pass selectedRows array directly
      const blob = await printOutOfWarrantyEstimate(selectedRows);
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      // Open in new tab for viewing with download and print buttons
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(
          `<html><head><title>Out Of Warranty Estimate Preview</title></head><body style='margin:0'>` +
            `<iframe id='estimate-pdf-frame' src='${url}' width='100%' height='100%' style='border:none;min-height:100vh;'></iframe>` +
            `<div style='position:fixed;top:10px;right:10px;z-index:1000;display:flex;gap:10px;'>` +
            `<a href='${url}' download='out_of_warranty_estimate.pdf' style='padding:10px 18px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;'>Download PDF</a>` +
            `<button onclick="(function(){
              var frame = document.getElementById('estimate-pdf-frame');
              if(frame && frame.contentWindow){
                frame.contentWindow.focus();
                frame.contentWindow.print();
              }
            })()" style='padding:10px 18px;background:#059669;color:#fff;border-radius:6px;border:none;cursor:pointer;font-weight:600;font-size:16px;'>Print</button>` +
            `</div></body></html>`,
        );
      } else {
        setError({
          message: "Popup blocked",
          resolution: "Enable popups and try again",
          type: "warning",
        });
        setShowToast(true);
      }
      // Revoke URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        setPdfUrl(null);
      }, 2000);
      setError("");
      setShowToast(false);
    } catch (err) {
      setError({
        message: err?.message || "Print failed.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    }
  };

  useEffect(() => {
    fetchMasterNames()
      .then((data) => {
        if (Array.isArray(data)) setMasterNames(data);
      })
      .catch(() => {
        setMasterNames([]);
      });
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    // Capitalize first letter of each word
    const newValue = value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    setCustomerName(newValue);
    if (newValue.length > 0) {
      const filtered = masterNames.filter((n) =>
        n.toLowerCase().startsWith(newValue.toLowerCase()),
      );
      setNameSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      {showToast && (
        <Toast
          message={error.message}
          resolution={error.resolution}
          type={error.type}
          onClose={() => setShowToast(false)}
        />
      )}
      <Paper
        elevation={4}
        sx={{
          p: 2.5,
          borderRadius: 3,
          background: "#f8fafc",
          maxWidth: 800,
          mx: "auto",
          minHeight: 125,
        }}
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Out Of Warranty Estimate Records
        </h2>
        <form noValidate className="w-full flex flex-col gap-3">
          <div
            className="flex items-center gap-2"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="customerName"
              className="text-gray-700 text-base font-medium w-36 text-left"
            >
              Customer Name
            </label>
            <div className="flex-1 relative">
              <InputBase
                id="customerName"
                name="customerName"
                value={customerName}
                onChange={handleNameChange}
                placeholder="Enter customer name"
                className="flex-1 w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small"
                sx={{
                  flex: 1,
                  background: "#f1f5f9",
                  borderRadius: 2,
                  px: 1.5,
                  border: "1px solid #d1d5db",
                }}
                autoComplete="off"
                disabled={!!pdfUrl}
                onFocus={() => {
                  if (customerName.length > 0 && nameSuggestions.length > 0)
                    setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
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
                    width: "100%",
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
                        setCustomerName(n);
                        setShowSuggestions(false);
                      }}
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <IconButton
              color="primary"
              aria-label="search"
              sx={{ ml: 1 }}
              onClick={async (e) => {
                e.preventDefault();
                setShowToast(false);
                setError("");
                if (!customerName) {
                  setError({
                    message: "Customer name is required",
                    resolution: "Enter a Customer Name",
                    type: "warning",
                  });
                  setShowToast(true);
                  return;
                }
                try {
                  const data =
                    await fetchOutOfWarrantyEstimatePrintDetails(customerName);
                  setPrintDetails(Array.isArray(data) ? data : []);
                  setSelectedRows([]);
                  if (!data || data.length === 0) {
                    setError({
                      message: "No records found.",
                      resolution: "Try another customer name.",
                      type: "info",
                    });
                    setShowToast(true);
                  }
                } catch (err) {
                  setError({
                    message: err?.message || "Failed to fetch details.",
                    resolution: err?.resolution || "",
                    type: "error",
                  });
                  setShowToast(true);
                  setPrintDetails([]);
                  setSelectedRows([]);
                }
              }}
              disabled={!!pdfUrl}
            >
              <BiSearch size={24} />
            </IconButton>
          </div>
        </form>
        {/* Elegant Table for Print Details */}
        {printDetails.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Paper
              elevation={2}
              sx={{ p: 2, borderRadius: 2, background: "#fff" }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "1rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th
                      style={{
                        padding: "0.5rem",
                        borderBottom: "2px solid #e5e7eb",
                        textAlign: "center",
                      }}
                    ></th>
                    <th
                      style={{
                        padding: "0.5rem",
                        borderBottom: "2px solid #e5e7eb",
                        textAlign: "center",
                        color: "#374151",
                      }}
                    >
                      SRF Number
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        borderBottom: "2px solid #e5e7eb",
                        textAlign: "center",
                        color: "#374151",
                      }}
                    >
                      SRF Date
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        borderBottom: "2px solid #e5e7eb",
                        textAlign: "center",
                        color: "#374151",
                      }}
                    >
                      Model
                    </th>
                    <th
                      style={{
                        padding: "0.5rem  ",
                        borderBottom: "2px solid #e5e7eb",
                        textAlign: "right",
                        color: "#374151",
                      }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {printDetails.map((row) => (
                    <tr
                      key={row.setPdfUrl}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        background: selectedRows.includes(row.srf_number)
                          ? "#e0e7ff"
                          : "#fff",
                      }}
                    >
                      <td style={{ textAlign: "center", padding: "0.5rem" }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.srf_number)}
                          onChange={() => handleCheckboxChange(row.srf_number)}
                          disabled={!!pdfUrl}
                          style={{
                            accentColor: "#2563eb",
                            width: 18,
                            height: 18,
                          }}
                        />
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          fontWeight: 500,
                          textAlign: "center",
                        }}
                      >
                        {row.srf_number}
                      </td>
                      <td style={{ padding: "0.5rem", textAlign: "center" }}>
                        {row.srf_date}
                      </td>
                      <td style={{ padding: "0.5rem", textAlign: "center" }}>
                        {row.model}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          textAlign: "right",
                          color: "#2563eb",
                          fontWeight: 600,
                        }}
                      >
                        ₹{row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={!!pdfUrl || selectedRows.length === 0}
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor:
                      !!pdfUrl || selectedRows.length === 0
                        ? "not-allowed"
                        : "pointer",
                    boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
                    transition: "background 0.2s",
                  }}
                >
                  Print Selected
                </button>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default OutOfWarrantyEstimatePrintPage;
