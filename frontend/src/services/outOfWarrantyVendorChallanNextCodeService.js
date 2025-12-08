import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the next warranty code from the backend.
 * Returns { next_cnf_challan_code : string }
 */
async function fetchNextOutOfWarrantyVendorChallanCode() {
  const response = await authFetch(
    API_ENDPOINTS.OUT_OF_WARRANTY_NEXT_VENDOR_CHALLAN_CODE,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
  return data;
}

export { fetchNextOutOfWarrantyVendorChallanCode };
