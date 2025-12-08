import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Calls the WARRANTY_SRF_PRINT API and returns a Blob (PDF) for download.
 * Throws error with { message, resolution } if backend returns error.
 * @param {string} challan_number
 * @returns {Promise<Blob>} PDF blob
 */
async function printWarrantyCNF(challan_number) {
  const response = await authFetch(API_ENDPOINTS.WARRANTY_CNF_PRINT, {
    method: "POST",
    headers: {
      Accept: "application/pdf",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ challan_number }),
  });
  if (!response.ok) {
    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      // If not JSON, leave data as empty object
    }
    throw {
      message: data.message || "Failed to print CNF Challan.",
      resolution: data.resolution || "",
    };
  }
  // Get PDF blob
  const blob = await response.blob();
  return blob;
}

export { printWarrantyCNF };
