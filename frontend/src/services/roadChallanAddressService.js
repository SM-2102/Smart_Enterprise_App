import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Search master by name
 * @param {string} name
 * @returns {Promise<object>} Master address data
 */
async function searchMasterAddress(name) {
  const response = await authFetch(API_ENDPOINTS.MASTER_SEARCH_ADDRESS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to search master by name",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { searchMasterAddress };
