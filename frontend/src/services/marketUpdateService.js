import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Update a market record (PATCH)
 * @param {string} mcode - Market code (max 5 chars, e.g., C1234)
 * @param {object} marketData - Data to update (delivery_by, delivery_date, final_status, remark)
 * @returns {Promise<object>} Response data
 */
async function updateMarket(mcode, marketData) {
  if (!mcode) throw new Error("Enter market code");
  const url = `${API_ENDPOINTS.MARKET_UPDATE}${mcode}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(marketData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to update market record",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { updateMarket };
