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
import { updateVendorFinalSettled } from "../services/VendorUpdateFinalSettledService";
import { fetchVendorFinalSettled } from "../services/VendorFinalSettledService";
import { fetchComplaintNumbers } from "../services/complaintNumberListService";
import Tooltip from "@mui/material/Tooltip";
import { updateComplaintNumber } from "../services/vendorComplaintNumberUpdateService";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const columns = [
  { key: "srf_number", label: "SRF Number" },
  { key: "name", label: "Name" },
  { key: "model", label: "Model" },
  { key: "complaint_number", label: "Complaint No." },
  { key: "vendor_cost1", label: "R. Cost" },
  { key: "vendor_cost2", label: "O. Cost" },
  { key: "vendor_paint_cost", label: "Paint" },
  { key: "vendor_stator_cost", label: "Stator" },
  { key: "vendor_leg_cost", label: "Leg" },
  { key: "vendor_cost", label: "Total" },
];

const VendorSettleAdminPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const tableRef = useRef();
  const [updating, setUpdating] = useState(false);
  const [editComplaintRow, setEditComplaintRow] = useState(null);
  const [newComplaintNumber, setNewComplaintNumber] = useState("");
  const [updatingComplaint, setUpdatingComplaint] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const headerCheckboxRef = useRef(null);
  const [complaintStatusMap, setComplaintStatusMap] = useState({});
  const isComplaintLengthValid =
    newComplaintNumber.length >= 13 && newComplaintNumber.length <= 15;
  const isInvalidComplaintRow = (row) => {
    if (row.srf_number?.startsWith("S")) return false;
    if (!row.complaint_number) return false;
    const statusInfo = complaintStatusMap[row.complaint_number];
    return statusInfo?.status !== "OK";
  };

  // Set indeterminate property for header checkbox
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        selectedRows.length > 0 && selectedRows.length < data.length;
    }
  }, [selectedRows, data]);
  // Handler for Update button

  useEffect(() => {
    fetchComplaintNumbers()
      .then((res) => {
        const map = {};
        res.forEach((item) => {
          map[item.complaint_number] = {
            status: item.status,
            remark: item.remark,
          };
        });
        setComplaintStatusMap(map);
      })
      .catch(() => {});
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setShowToast(false);
    setUpdating(true);
    const payload = data
      .filter((row, idx) => selectedRows.includes(idx))
      .map(({ srf_number }) => ({
        srf_number,
        vendor_settled: "Y",
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
      await updateVendorFinalSettled(payload);
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
    fetchVendorFinalSettled()
      .then((res) => setData(res))
      .catch((err) =>
        setError({
          message: err.message || "Failed to fetch data",
          type: "error",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  // Calculate total and selected vendor_costs
  const totalAmount = data.reduce(
    (sum, row) => sum + (Number(row.vendor_cost) || 0),
    0,
  );
  const selectedAmount = selectedRows.reduce(
    (sum, idx) => sum + (Number(data[idx]?.vendor_cost) || 0),
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
        Vendor Final Settlement
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
                      selectedRows.length === data.length && data.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const selectableIndexes = data
                          .map((row, idx) =>
                            isInvalidComplaintRow(row) ? null : idx,
                          )
                          .filter((idx) => idx !== null);

                        setSelectedRows(selectableIndexes);
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
                        disabled={isInvalidComplaintRow(row)}
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
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        sx={{
                          fontWeight: 500,
                          textAlign: "center",
                          py: 1.2,
                          ...(col.label.toLowerCase().includes("date") && {
                            whiteSpace: "nowrap",
                          }),
                        }}
                      >
                        {col.key === "complaint_number"
                          ? (() => {
                              const complaint = row.complaint_number;
                              const statusInfo = complaintStatusMap[complaint];
                              const isValid = statusInfo?.status === "OK";

                              if (!complaint || row.srf_number?.startsWith("S"))
                                return "-";

                              const tooltipText =
                                statusInfo?.remark ||
                                (isValid
                                  ? "Complaint number is valid"
                                  : "COMPLAINT NUMBER NOT PRESENT");

                              return (
                                <Tooltip
                                  title={
                                    <span
                                      style={{
                                        fontSize: "12px",
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {tooltipText}
                                    </span>
                                  }
                                  arrow
                                  placement="top"
                                  slotProps={{
                                    tooltip: {
                                      sx: {
                                        bgcolor: "#093275ff",
                                        color: "#fff",
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: "8px",
                                        boxShadow:
                                          "0 3px 12px rgba(0,0,0,0.25)",
                                        maxWidth: 420,
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                        lineHeight: 1.4,
                                      },
                                    },
                                    arrow: {
                                      sx: {
                                        color: "#1e293b",
                                      },
                                    },
                                  }}
                                >
                                  <span
                                    onClick={() => {
                                      if (!isValid) {
                                        setEditComplaintRow(row);
                                        setNewComplaintNumber("");
                                      }
                                    }}
                                    style={{
                                      color: isValid ? "#1f2937" : "#d32f2f",
                                      fontWeight: isValid ? 500 : 700,
                                      cursor: isValid ? "default" : "pointer",
                                      borderBottom: isValid
                                        ? "none"
                                        : "2px dotted #d32f2f",
                                      paddingBottom: "1px",
                                    }}
                                  >
                                    {complaint}
                                  </span>
                                </Tooltip>
                              );
                            })()
                          : col.key === "final_amount"
                            ? row[col.key] !== null &&
                              row[col.key] !== undefined &&
                              row[col.key] !== ""
                              ? `₹ ${(Number(row[col.key]) || 0).toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}`
                              : "-"
                            : row[col.key] !== null &&
                                row[col.key] !== undefined &&
                                row[col.key] !== ""
                              ? row[col.key]
                              : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {/* vendor_cost summary below table */}
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
      {editComplaintRow && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#fff",
            boxShadow: 6,
            borderRadius: 2,
            p: 2.5,
            zIndex: 1300,
            minWidth: 320,
          }}
        >
          <Typography fontWeight={700} mb={2} color="#0d47a1">
            Update Complaint Number
          </Typography>

          <TextField
            size="small"
            fullWidth
            value={newComplaintNumber}
            onChange={
              (e) => setNewComplaintNumber(e.target.value.slice(0, 15)) // hard limit
            }
            autoFocus
            error={!isComplaintLengthValid} // ✅ immediate validation
            sx={{
              "& .MuiOutlinedInput-root.Mui-error fieldset": {
                borderColor: "#fca5a5", // red-300
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <button
                    disabled={!isComplaintLengthValid || updatingComplaint}
                    onClick={async () => {
                      if (!isComplaintLengthValid) return;

                      try {
                        setUpdatingComplaint(true);

                        await updateComplaintNumber({
                          srf_number: editComplaintRow.srf_number,
                          complaint_number: newComplaintNumber,
                        });

                        setShowToast(true);
                        setError({
                          message: "Complaint number updated",
                          resolution:
                            "SRF Number: " + editComplaintRow.srf_number,
                          type: "success",
                        });

                        setEditComplaintRow(null);
                        setTimeout(() => window.location.reload(), 800);
                      } catch (err) {
                        setShowToast(true);
                        setError({
                          message: err.message || "Update failed",
                          resolution: err.resolution || "",
                          type: "error",
                        });
                      } finally {
                        setUpdatingComplaint(false);
                      }
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor:
                        !isComplaintLengthValid || updatingComplaint
                          ? "not-allowed"
                          : "pointer",
                      padding: 0,
                    }}
                  >
                    <CloudUploadIcon
                      sx={{
                        fontSize: 22,
                        color:
                          !isComplaintLengthValid || updatingComplaint
                            ? "#9ca3af" // disabled gray
                            : "#1976d2", // active blue
                      }}
                    />
                  </button>
                </InputAdornment>
              ),
            }}
          />

          <Box textAlign="right" mt={1}>
            <button
              onClick={() => setEditComplaintRow(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#666",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
          </Box>
        </Box>
      )}

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

export default VendorSettleAdminPage;
