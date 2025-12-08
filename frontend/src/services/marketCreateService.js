import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @param {object} marketData
 * @returns {Promise<void>} Throws on error
 */
async function createMarket(marketData) {
  const response = await authFetch(API_ENDPOINTS.MARKET_CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(marketData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { createMarket };
