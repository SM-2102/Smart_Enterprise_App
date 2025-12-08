import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Search master by code
 * @param {string} code
 * @returns {Promise<object>} Master data
 */
async function searchMasterByCode(code) {
  const response = await authFetch(API_ENDPOINTS.MASTER_SEARCH_CODE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to search master by code",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { searchMasterByCode };
