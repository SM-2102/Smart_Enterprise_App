import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the next out of warranty code from the backend.
 * Returns { last_vendor_challan_code : string }
 */
async function fetchLastOutOfWarrantyVendorChallanCode() {
  const response = await authFetch(
    API_ENDPOINTS.OUT_OF_WARRANTY_LAST_VENDOR_CHALLAN_CODE,
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

export { fetchLastOutOfWarrantyVendorChallanCode };
