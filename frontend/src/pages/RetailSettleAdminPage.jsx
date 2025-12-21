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
import { fetchRetailFinalSettlement } from "../services/retailFinalSettlementService";
import { updateRetailFinalSettlement } from "../services/retailUpdateFinalSettlementService";

const columns = [
  { key: "rcode", label: "Receipt Number" },
  { key: "name", label: "Customer Name" },
  { key: "retail_date", label: "Retail Date" },
  { key: "details", label: "Details" },
  { key: "amount", label: "Amount" },
  { key: "received_by", label: "Received By" },
];

const RetailSettleAdminPage = () => {
  const [data, setData] = useState([]);
  const [editedAmounts, setEditedAmounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const tableRef = useRef();
  const [updating, setUpdating] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const headerCheckboxRef = useRef(null);
  const [receivedByFilter, setReceivedByFilter] = useState("ALL");

  // Set indeterminate property for header checkbox
  

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setShowToast(false);
    setUpdating(true);
    // Prepare payload: all rows, with rcode, amount, and final_status
    const payload = filteredData.map((row, idx) => ({
      rcode: row.rcode,
      amount:
        editedAmounts[idx] !== undefined
          ? Number(editedAmounts[idx])
          : Number(row.amount),
      final_status: selectedRows.includes(idx) ? "Y" : "N",
    }));
    try {
      await updateRetailFinalSettlement(payload);
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
    fetchRetailFinalSettlement()
      .then((res) => setData(res))
      .catch((err) =>
        setError({
          message: err.message || "Failed to fetch data",
          type: "error",
        }),
      )
      .finally(() => setLoading(false));
  }, []);
  const receivedByOptions = React.useMemo(() => {
  const names = data
    .map((row) => row.received_by)
    .filter((v) => v && v.trim() !== "");
  return ["ALL", ...Array.from(new Set(names))];
}, [data]);
const filteredData = React.useMemo(() => {
  if (receivedByFilter === "ALL") return data;
  return data.filter(
    (row) => row.received_by === receivedByFilter,
  );
}, [data, receivedByFilter]);
useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        selectedRows.length > 0 && selectedRows.length < filteredData.length;
    }
  }, [selectedRows, filteredData]);
  // Handler for Update button  

  // Calculate total and selected amounts
  const totalAmount = filteredData.reduce(
  (sum, row) => sum + (Number(row.amount) || 0),
  0,
);

  const selectedAmount = selectedRows.reduce((sum, idx) => {
  const row = filteredData[idx];
  if (!row) return sum;
  return (
    sum +
    (editedAmounts[idx] !== undefined
      ? Number(editedAmounts[idx])
      : Number(row.amount) || 0)
  );
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
        Retail Final Settlement
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
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
    }}
  >
    Total Records: {filteredData.length}
  </Typography>

</Box>

        <Box>
           <TextField
    select
    size="small"
    label="Received By"
    value={receivedByFilter}
    onChange={(e) => {
  setReceivedByFilter(e.target.value);
  setSelectedRows([]);     // reset selection
  setEditedAmounts({});   // optional but recommended
}}

    SelectProps={{ native: true }}
    sx={{ minWidth: 180 }}
  >
    {receivedByOptions.map((name) => (
      <option key={name} value={name}>
        {name === "ALL" ? "All" : name}
      </option>
    ))}
  </TextField>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={updating || filteredData.length === 0}
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
              marginLeft: "16px",
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
    setSelectedRows(filteredData.map((_, idx) => idx));
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
              {filteredData.length === 0 ? (
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
                filteredData.map((row, idx) => (
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
                        {col.key === "amount" ? (
                          <TextField
                            type="number"
                            size="small"
                            variant="outlined"
                            inputProps={{
                              min: 0,
                              step: 0.01,
                              style: {
                                textAlign: "center",
                                fontWeight: 600,
                                fontSize: "14px",
                                borderRadius: "4px",
                                width: "80px",
                                padding: "5px",
                              },
                            }}
                            value={
                              editedAmounts[idx] !== undefined
                                ? editedAmounts[idx]
                                : row.amount
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditedAmounts((prev) => ({
                                ...prev,
                                [idx]: value,
                              }));
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            aria-label={`Edit amount for row ${idx + 1}`}
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

export default RetailSettleAdminPage;
