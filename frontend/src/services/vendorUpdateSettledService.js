import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Update a retail record (PATCH)
 * @param {object} vendorData - Data to update
 * @returns {Promise<object>} Response data
 */
async function updateVendorSettled(vendorData) {
  const url = `${API_ENDPOINTS.VENDOR_UPDATE_UNSETTLED}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vendorData),
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

export { updateVendorSettled };
