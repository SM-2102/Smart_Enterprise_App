import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the next warranty code from the backend.
 * Returns { next_srf_number : string }
 */
async function fetchNextWarrantyCode() {
  const response = await authFetch(API_ENDPOINTS.WARRANTY_NEXT_CODE, {
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

export { fetchNextWarrantyCode };
