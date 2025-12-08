import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the next retail code from the backend.
 * Returns { next_rcode : string }
 */
async function fetchNextRetailCode() {
  const response = await authFetch(API_ENDPOINTS.RETAIL_NEXT_RCODE, {
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

export { fetchNextRetailCode };
