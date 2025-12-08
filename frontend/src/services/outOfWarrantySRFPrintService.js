import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Calls the WARRANTY_SRF_PRINT API and returns a Blob (PDF) for download.
 * Throws error with { message, resolution } if backend returns error.
 * @param {string} srfNumber
 * @returns {Promise<Blob>} PDF blob
 */
async function printOutOfWarrantySRF(srfNumber) {
  const response = await authFetch(API_ENDPOINTS.OUT_OF_WARRANTY_SRF_PRINT, {
    method: "POST",
    headers: {
      Accept: "application/pdf",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ srf_number: srfNumber }),
  });
  if (!response.ok) {
    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      // If not JSON, leave data as empty object
    }
    throw {
      message: data.message || "Failed to print SRF.",
      resolution: data.resolution || "",
    };
  }
  // Get PDF blob
  const blob = await response.blob();
  return blob;
}

export { printOutOfWarrantySRF };
