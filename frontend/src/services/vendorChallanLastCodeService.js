import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the next out of warranty code from the backend.
 * Returns { last_vendor_challan_code : string }
 */
async function fetchLastVendorChallanCode() {
  const response = await authFetch(API_ENDPOINTS.VENDOR_LAST_CHALLAN_CODE, {
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

export { fetchLastVendorChallanCode };
