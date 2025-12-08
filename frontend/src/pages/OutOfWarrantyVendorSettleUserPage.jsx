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
import { fetchOutOfWarrantyVendorNotSettled } from "../services/outOfWarrantyVendorNotSettledService";
import { updateOutOfWarrantyVendorSettled } from "../services/outOfWarrantyVendorUpdateSettledService";

const columns = [
  { key: "srf_number", label: "SRF Number" },
  { key: "division", label: "Division" },
  { key: "model", label: "Model" },
  { key: "challan_number", label: "Challan Number" },
  { key: "amount", label: "Amount" },
  { key: "received_by", label: "Received By" },
  { key: "vendor_bill_number", label: "Vendor Bill Number" },
];

const OutOfWarrantySettleVendorUserPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const tableRef = useRef();
  const [updating, setUpdating] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const headerCheckboxRef = useRef(null);
  // Set indeterminate property for header checkbox
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        selectedRows.length > 0 && selectedRows.length < data.length;
    }
  }, [selectedRows, data]);
  // Handler for Update button

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setShowToast(false);
    setUpdating(true);
    // Prepare payload: only selected rows, with settlement_date as today
    const today = new Date().toLocaleDateString("en-CA").slice(0, 10);
    const today_ddmmyyyy = (() => {
      const dateObj = new Date();
      return `${String(dateObj.getDate()).padStart(2, "0")}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${dateObj.getFullYear()}`;
    })();
    const payload = data
      .filter((row, idx) => selectedRows.includes(idx))
      .map(({ srf_number, vendor_bill_number }) => ({
        srf_number,
        vendor_bill_number,
        vendor_settlement_date: today,
      }));
    if (payload.length === 0) {
      setError({
        message: "No rows selected.",
        type: "warning",
      });
      setShowToast(true);
      setUpdating(false);
      return;
    }
    try {
      await updateOutOfWarrantyVendorSettled(payload);
      setError({
        message: "Records proposed for Settlement!",
        resolution: `Vendor Settlement Date : ${today_ddmmyyyy}`,
        type: "success",
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err.message || "Update failed",
        type: "error",
        resolution: "Please try again later.",
      });
      setShowToast(true);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOutOfWarrantyVendorNotSettled()
      .then((res) => setData(res))
      .catch((err) =>
        setError({
          message: err.message || "Failed to fetch data",
          type: "error",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  // Handler for editing vendor_bill_number
  const handleVendorBillNumberChange = (idx, value) => {
    setData((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], vendor_bill_number: value };
      return updated;
    });
  };

  // Calculate total and selected amounts
  const totalAmount = data.reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0,
  );
  const selectedAmount = selectedRows.reduce(
    (sum, idx) => sum + (Number(data[idx]?.amount) || 0),
    0,
  );

  return (
    <Paper
      elevation={5}
      sx={{
        p: 3,
        margin: 2,

        borderRadius: 4,
        background: "#f8fafc",
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        mb={2}
        align="center"
        color="primary.dark"
        sx={{ mb: 1 }}
      >
        Out of Warranty Propose For Vendor Settlement
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center">
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
            <span style={{ letterSpacing: 0.5 }}>Total Records:</span>{" "}
            <span style={{ color: "#0d47a1", fontWeight: 600 }}>
              {data.length}
            </span>
          </Typography>
        </Box>
        <Box>
          <button
            type="button"
            onClick={handleUpdate}
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
            aria-label="Settle Vendor Records"
          >
            {updating ? "Settling..." : "Settle Records"}
          </button>
        </Box>
      </Box>
      <div ref={tableRef}>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: "#e3eafc" }}>
                <TableCell
                  padding="checkbox"
                  sx={{ textAlign: "center", fontWeight: 700 }}
                >
                  <input
                    type="checkbox"
                    ref={headerCheckboxRef}
                    checked={
                      selectedRows.length ===
                        data.filter((row) => row.vendor_bill_number).length &&
                      data.filter((row) => row.vendor_bill_number).length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(
                          data
                            .map((row, idx) =>
                              row.vendor_bill_number ? idx : null,
                            )
                            .filter((idx) => idx !== null),
                        );
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    aria-label="Select all rows"
                  />
                </TableCell>
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
                    colSpan={columns.length + 1}
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
                    <TableCell padding="checkbox" sx={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(idx)}
                        disabled={!row.vendor_bill_number}
                        onChange={(e) => {
                          if (!row.vendor_bill_number) return;
                          if (e.target.checked) {
                            setSelectedRows((prev) => [...prev, idx]);
                          } else {
                            setSelectedRows((prev) =>
                              prev.filter((i) => i !== idx),
                            );
                          }
                        }}
                        aria-label={`Select row ${idx + 1}`}
                      />
                    </TableCell>
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
                        {col.key === "vendor_bill_number" ? (
                          <input
                            type="text"
                            value={row.vendor_bill_number || ""}
                            onChange={(e) =>
                              handleVendorBillNumberChange(idx, e.target.value)
                            }
                            style={{
                              textAlign: "center",
                              width: "120px",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              border: "1px solid #e4e4e4ff",
                              fontWeight: 500,
                              fontSize: "15px",
                              background: "#fff",
                            }}
                            aria-label="Edit Vendor Bill Number"
                          />
                        ) : col.key === "amount" ? (
                          row[col.key] !== null &&
                          row[col.key] !== undefined &&
                          row[col.key] !== "" ? (
                            `₹ ${(Number(row[col.key]) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          ) : (
                            "-"
                          )
                        ) : row[col.key] !== null &&
                          row[col.key] !== undefined &&
                          row[col.key] !== "" ? (
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
      {/* Amount summary below table */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
      >
        <Box display="flex" alignItems="center">
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
            <span style={{ letterSpacing: 0.5 }}>Total Amount:</span>{" "}
            <span style={{ color: "#0d47a1", fontWeight: 600 }}>
              ₹{" "}
              {totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
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
            <span style={{ letterSpacing: 0.5 }}>Selected Amount:</span>{" "}
            <span style={{ color: "#0d47a1", fontWeight: 600 }}>
              ₹{" "}
              {selectedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </Typography>
        </Box>
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
  );
};

export default OutOfWarrantySettleVendorUserPage;
