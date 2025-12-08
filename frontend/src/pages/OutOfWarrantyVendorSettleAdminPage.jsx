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
  TextField,
  InputAdornment,
} from "@mui/material";
import Toast from "../components/Toast";
import { updateOutOfWarrantyVendorFinalSettled } from "../services/outOfWarrantyVendorUpdateFinalSettledService";
import { fetchOutOfWarrantyVendorFinalSettled } from "../services/outOfWarrantyVendorFinalSettledService";

const columns = [
  { key: "srf_number", label: "SRF Number" },
  { key: "division", label: "Division" },
  { key: "model", label: "Model" },
  { key: "challan_number", label: "Challan No." },
  { key: "received_by", label: "Received By" },
  { key: "vendor_bill_number", label: "Bill No." },
  { key: "vendor_cost1", label: "Rewinding Cost" },
  { key: "vendor_cost2", label: "Other Cost" },
  { key: "amount", label: "Total Amount" },
];

const OutOfWarrantyVendorSettleAdminPage = () => {
  const [data, setData] = useState([]);
  // Track edited vendor_cost1, vendor_cost2, and amount per row
  const [editedValues, setEditedValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    // Prepare payload: all rows, selected rows get vendor_settled: 'Y', others 'N'
    const payload = data.map((row, idx) => {
      const isSelected = selectedRows.includes(idx);
      const vendor_cost1 =
        editedValues[idx]?.vendor_cost1 !== undefined
          ? Number(editedValues[idx].vendor_cost1)
          : Number(row.vendor_cost1);
      const vendor_cost2 =
        editedValues[idx]?.vendor_cost2 !== undefined
          ? Number(editedValues[idx].vendor_cost2)
          : Number(row.vendor_cost2);
      return {
        ...row,
        vendor_cost1,
        vendor_cost2,
        vendor_settled: isSelected ? "Y" : "N",
      };
    });
    try {
      await updateOutOfWarrantyVendorFinalSettled(payload);
      setError({
        message: "Records settled successfully!",
        type: "success",
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err.message || "Settlement failed",
        type: "error",
        resolution: "Please try again later.",
      });
      setShowToast(true);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOutOfWarrantyVendorFinalSettled()
      .then((res) => setData(res))
      .catch((err) =>
        setError({
          message: err.message || "Failed to fetch data",
          type: "error",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  // Calculate total and selected amounts
  const totalAmount = data.reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0,
  );
  const selectedAmount = selectedRows.reduce((sum, idx) => {
    const amount =
      editedValues[idx]?.amount !== undefined
        ? Number(editedValues[idx].amount)
        : Number(data[idx]?.amount) || 0;
    return sum + amount;
  }, 0);

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
        Out Of Warranty Vendor Final Settlement
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
            aria-label="Settle Retail Records"
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
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(
                          data
                            .map((row, idx) =>
                              row.received !== "N" ? idx : null,
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
                        onChange={(e) => {
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
                    {columns.map((col) => {
                      if (
                        col.key === "vendor_cost1" ||
                        col.key === "vendor_cost2"
                      ) {
                        return (
                          <TableCell
                            key={col.key}
                            sx={{
                              fontWeight: 500,
                              textAlign: "center",
                              py: 0.5,
                            }}
                          >
                            <TextField
                              type="number"
                              size="small"
                              variant="outlined"
                              inputProps={{
                                min: 0,
                                step: 1,
                                style: {
                                  textAlign: "center",
                                  fontWeight: 600,
                                  fontSize: "14px",
                                  width: "80px",
                                  padding: "5px",
                                },
                              }}
                              value={
                                editedValues[idx]?.[col.key] !== undefined
                                  ? editedValues[idx][col.key]
                                  : row[col.key]
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                setEditedValues((prev) => {
                                  const newRow = {
                                    ...prev[idx],
                                    [col.key]: value,
                                  };
                                  // Calculate new amount
                                  const rewinding =
                                    col.key === "vendor_cost1"
                                      ? value
                                      : newRow.vendor_cost1 !== undefined
                                        ? newRow.vendor_cost1
                                        : row.vendor_cost1;
                                  const other =
                                    col.key === "vendor_cost2"
                                      ? value
                                      : newRow.vendor_cost2 !== undefined
                                        ? newRow.vendor_cost2
                                        : row.vendor_cost2;
                                  newRow.amount =
                                    Number(rewinding || 0) + Number(other || 0);
                                  return {
                                    ...prev,
                                    [idx]: newRow,
                                  };
                                });
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),
                              }}
                              aria-label={`Edit ${col.key} for row ${idx + 1}`}
                              disabled={updating}
                              sx={{
                                background: "#ffffffff",
                                borderRadius: "6px",
                                boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#e9e7e7ff",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#1976d2",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#1976d2",
                                  },
                              }}
                            />
                          </TableCell>
                        );
                      } else if (col.key === "amount") {
                        // Show amount as non-editable, calculated from vendor_cost1 + vendor_cost2
                        const amount =
                          editedValues[idx]?.amount !== undefined
                            ? editedValues[idx].amount
                            : Number(row.vendor_cost1 || 0) +
                              Number(row.vendor_cost2 || 0);
                        return (
                          <TableCell
                            key={col.key}
                            sx={{
                              fontWeight: 600,
                              textAlign: "center",
                              py: 0.5,
                            }}
                          >
                            ₹{" "}
                            {Number(amount).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        );
                      } else {
                        return (
                          <TableCell
                            key={col.key}
                            sx={{
                              fontWeight: 500,
                              textAlign: "center",
                              py: 0.5,
                            }}
                          >
                            {row[col.key] !== null && row[col.key] !== undefined
                              ? row[col.key]
                              : "-"}
                          </TableCell>
                        );
                      }
                    })}
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

export default OutOfWarrantyVendorSettleAdminPage;
