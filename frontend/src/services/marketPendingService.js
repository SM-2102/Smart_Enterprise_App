import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the next market number from the backend.
 * Returns [{ mcode : string , name : string }]
 */
async function fetchMarketPending() {
  const response = await authFetch(API_ENDPOINTS.MARKET_PENDING, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
  return data;
}

export { fetchMarketPending };
