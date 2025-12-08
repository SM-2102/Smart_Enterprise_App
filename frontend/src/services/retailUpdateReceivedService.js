import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Update a retail record (PATCH)
 * @param {object} retailData - Data to update
 * @returns {Promise<object>} Response data
 */
async function updateRetailReceived(retailData) {
  const url = `${API_ENDPOINTS.RETAIL_UPDATE_RECEIVED}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(retailData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to update retail record",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { updateRetailReceived };
