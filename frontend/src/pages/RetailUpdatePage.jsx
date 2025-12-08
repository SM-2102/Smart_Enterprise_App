import React, { useEffect, useState, useRef } from "react";
import { updateRetailReceived } from "../services/retailUpdateReceivedService";
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
import { fetchRetailNotReceived } from "../services/retailNotReceivedService";
import Toast from "../components/Toast";

const columns = [
  { key: "rcode", label: "Receipt Number" },
  { key: "name", label: "Customer Name" },
  {
    key: "contact1",
    label: "Contact",
    render: (contact1, row) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <div>{contact1}</div>
        {row.contact2 && <div>{row.contact2}</div>}
      </div>
    ),
  },
  { key: "details", label: "Details" },
  { key: "amount", label: "Amount" },
  { key: "received", label: "Received" },
];

const RetailUpdatePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const tableRef = useRef();
  const [updating, setUpdating] = useState(false);
  // Handler for Update button
  const handleUpdate = async () => {
    setUpdating(true);
    // Prepare payload: only rcode, amount, received
    const payload = data.map(({ rcode, received }) => ({ rcode, received }));
    try {
      await updateRetailReceived(payload);
      setError({
        message: "Retail records updated successfully!",
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
    fetchRetailNotReceived()
      .then((res) => setData(res))
      .catch((err) =>
        setError({
          message: err.message || "Failed to fetch data",
          type: "error",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  // Handler for editing received
  const handleReceivedChange = (idx, value) => {
    setData((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], received: value };
      return updated;
    });
  };

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
        Retail Payment Due Records
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
            aria-label="Update Retail Records"
          >
            {updating ? "Updating..." : "Update Records"}
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
                        {col.key === "received" ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleReceivedChange(
                                idx,
                                row.received === "Y" ? "N" : "Y",
                              )
                            }
                            style={{
                              width: "60px",
                              padding: "4px 0",
                              borderRadius: "6px",
                              border: "none",
                              background:
                                row.received === "Y" ? "#e3fcec" : "#ffe3e3",
                              color:
                                row.received === "Y" ? "#388e3c" : "#d32f2f",
                              fontWeight: 700,
                              fontSize: "15px",
                              cursor: "pointer",
                              boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
                              transition: "background 0.2s, color 0.2s",
                            }}
                            aria-label="Toggle Received"
                          >
                            {row.received === "Y" ? "Yes" : "No"}
                          </button>
                        ) : typeof col.render === "function" ? (
                          col.render(row[col.key], row)
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

export default RetailUpdatePage;
