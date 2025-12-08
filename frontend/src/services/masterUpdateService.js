import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Update a master record (PATCH)
 * @param {string} code - Master code (max 5 chars, e.g., C1234)
 * @param {object} masterData - Data to update (address, city, pin, contact1, contact2, gst, remark)
 * @returns {Promise<object>} Response data
 */
async function updateMaster(code, masterData) {
  if (!code) throw new Error("Enter customer code");
  const url = `${API_ENDPOINTS.MASTER_UPDATE}${code}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(masterData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to update master",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { updateMaster };
