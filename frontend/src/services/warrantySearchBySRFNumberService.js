import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Search market by srf_number
 * @param {string} srf_number
 * @returns {Promise<object>} Market data
 */
async function searchWarrantyBySRFNumber(srf_number) {
  const response = await authFetch(API_ENDPOINTS.WARRANTY_BY_SRF_NUMBER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ srf_number }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message:
        data.message ||
        data.detail ||
        "Failed to search warranty by srf_number",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { searchWarrantyBySRFNumber };
