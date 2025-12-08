import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Calls the CHALLAN_PRINT API and returns a Blob (PDF) for download.
 * Throws error with { message, resolution } if backend returns error.
 * @param {List} rcode
 * @returns {Promise<Blob>} PDF blob
 */
async function printRetail(rcode) {
  const response = await authFetch(API_ENDPOINTS.RETAIL_PRINT, {
    method: "POST",
    headers: {
      Accept: "application/pdf",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rcode: rcode }),
  });
  if (!response.ok) {
    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      // If not JSON, leave data as empty object
    }
    throw {
      message: data.message || "Failed to print challan.",
      resolution: data.resolution || "",
    };
  }
  // Get PDF blob
  const blob = await response.blob();
  return blob;
}

export { printRetail };
