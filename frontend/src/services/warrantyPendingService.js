import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the next warranty number from the backend.
 * Returns [{ srf_number : string , name : string }]
 */
async function fetchWarrantyPending() {
  const response = await authFetch(API_ENDPOINTS.WARRANTY_LIST_PENDING, {
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

export { fetchWarrantyPending };
