import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Update a retail record (PATCH)
 * @param {object} srfData - Data to update
 * @returns {Promise<object>} Response data
 */
async function updateOutOfWarrantySRFFinalSettled(srfData) {
  const url = `${API_ENDPOINTS.OUT_OF_WARRANTY_UPDATE_FINAL_SRF_SETTLEMENT}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(srfData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to update record",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { updateOutOfWarrantySRFFinalSettled };
