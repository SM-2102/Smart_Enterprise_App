import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the next challan number from the backend.
 * Returns { next_challan_number: string }
 */
async function fetchNextChallanNumber() {
  const response = await authFetch(API_ENDPOINTS.CHALLAN_NEXT_NUMBER, {
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

export { fetchNextChallanNumber };
