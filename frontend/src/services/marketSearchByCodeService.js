import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Search market by mcode
 * @param {string} mcode
 * @returns {Promise<object>} Market data
 */
async function searchMarketByCode(mcode) {
  const response = await authFetch(API_ENDPOINTS.MARKET_SEARCH_CODE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mcode }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message:
        data.message || data.detail || "Failed to search market by mcode",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { searchMarketByCode };
