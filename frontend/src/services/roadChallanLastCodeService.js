import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the last challan number from the backend.
 * Returns { last_challan_number: string }
 */
async function fetchLastChallanNumber() {
  const response = await authFetch(API_ENDPOINTS.CHALLAN_LAST_NUMBER, {
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

export { fetchLastChallanNumber };
