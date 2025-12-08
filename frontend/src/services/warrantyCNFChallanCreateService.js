import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";
/**
 * Update a warranty record (PATCH)
 * @param {object} warrantyData - Data to update
 * @returns {Promise<object>} Response data
 */
async function createWarrantyCNFChallan(warrantyData) {
  const url = `${API_ENDPOINTS.WARRANTY_CREATE_CNF_CHALLAN}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(warrantyData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message:
        data.message || data.detail || "Failed to update warranty record",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { createWarrantyCNFChallan };
