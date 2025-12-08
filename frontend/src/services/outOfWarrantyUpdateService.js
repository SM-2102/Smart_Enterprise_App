import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Update a market record (PATCH)
 * @param {string} srf_number - Market code (max 5 chars, e.g., C1234)
 * @param {object} outOfWarrantyData - Data to update (delivery_by, delivery_date, final_status, remark)
 * @returns {Promise<object>} Response data
 */
async function updateOutOfWarranty(srf_number, outOfWarrantyData) {
  if (!srf_number) throw new Error("Enter out of warranty srf_number");
  const url = `${API_ENDPOINTS.OUT_OF_WARRANTY_UPDATE}${srf_number}`;
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
        "Failed to update out of warranty record",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { updateOutOfWarranty };
