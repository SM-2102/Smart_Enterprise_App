import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @returns {Promise<string[]>}
 */
async function fetchMarketDeliveredBy() {
  const response = await authFetch(API_ENDPOINTS.MARKET_DELIVERED_BY, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch delivered by names");
  return response.json();
}

export { fetchMarketDeliveredBy };
