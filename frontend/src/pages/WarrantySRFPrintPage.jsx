import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  InputBase,
  IconButton,
  Modal,
  Box,
} from "@mui/material";
import { AiOutlinePrinter } from "react-icons/ai";
import Toast from "../components/Toast";
import { fetchWarrantyLastSrfNumber } from "../services/warrantyLastSRFNumberService";
import { printWarrantySRF } from "../services/warrantySRFPrintService";

const WarrantySRFPrintPage = () => {
  const [srfNumber, setSrfNumber] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    async function loadLastSrfNumber() {
      try {
        const data = await fetchWarrantyLastSrfNumber();
        setSrfNumber(data.last_srf_number || "");
      } catch (err) {
        setError({
          message: err.message,
          resolution: err.resolution,
          type: "error",
        });
        setShowToast(true);
      }
    }
    loadLastSrfNumber();
  }, []);

  return (
    <Container maxWidth="xs" sx={{ mt: 20 }}>
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
          maxWidth: 380,
          mx: "auto",
          minHeight: 125,
        }}
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Print Warranty SRF
        </h2>
        <form noValidate className="w-full flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="srfNumber"
              className="text-gray-700 text-base font-medium w-36 text-left"
            >
              SRF Number
            </label>
            <InputBase
              id="srfNumber"
              name="srfNumber"
              value={srfNumber}
              onChange={(e) => {
                const value = e.target.value.slice(0, 6);
                setSrfNumber(value);
              }}
              inputProps={{ maxLength: 6 }}
              placeholder="Enter number"
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
            />
            <IconButton
              color="primary"
              aria-label="print"
              sx={{ ml: 1 }}
              onClick={async (e) => {
                e.preventDefault();
                setShowToast(false);
                setError("");
                if (!srfNumber) {
                  setError({
                    message: "SRF number is required",
                    resolution: "Enter a SRF Number",
                    type: "warning",
                  });
                  setShowToast(true);
                  return;
                }
                try {
                  const blob = await printWarrantySRF(srfNumber);
                  const url = window.URL.createObjectURL(blob);
                  setPdfUrl(url);
                  // Open in new tab for viewing with download button
                  const newTab = window.open();
                  if (newTab) {
                    newTab.document.write(
                      `<html><head><title>Warranty SRF Preview</title></head><body style='margin:0'>` +
                        `<iframe id='warranty-srf-pdf-frame' src='${url}' width='100%' height='100%' style='border:none;min-height:100vh;'></iframe>` +
                        `<div style='position:fixed;top:10px;right:10px;z-index:1000;display:flex;gap:10px;'>` +
                        `<a href='${url}' download='${srfNumber}.pdf' style='padding:10px 18px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;'>Download PDF</a>` +
                        `<button onclick="(function(){
                        var frame = document.getElementById('warranty-srf-pdf-frame');
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
                  // Revoke URL after a longer delay to allow download (e.g., 60s)
                  setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    setPdfUrl(null);
                  }, 2000);
                } catch (err) {
                  setError({
                    message: err.message || "Failed to print warranty SRF.",
                    resolution: err.resolution || "",
                    type: "error",
                  });
                  setShowToast(true);
                }
              }}
              disabled={!!pdfUrl}
            >
              <AiOutlinePrinter size={24} />
            </IconButton>
          </div>
        </form>
      </Paper>
    </Container>
  );
};

export default WarrantySRFPrintPage;
