import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";
/**
 * Update a warranty record (PATCH)
 * @param {object} outOfWarrantyData - Data to update
 * @returns {Promise<object>} Response data
 */
async function createOutOfWarrantyVendorChallan(outOfWarrantyData) {
  const url = `${API_ENDPOINTS.OUT_OF_WARRANTY_CREATE_VENDOR_CHALLAN}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(outOfWarrantyData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message:
        data.message ||
        data.detail ||
        "Failed to update out of warranty vendor record",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { createOutOfWarrantyVendorChallan };
