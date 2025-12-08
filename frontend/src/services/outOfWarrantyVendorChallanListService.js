import { data } from "react-router-dom";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch CNF challan records by division
 * @returns {Promise<Array>} List of CNF challan records
 */
async function fetchOutOfWarrantyVendorChallanList() {
  const response = await authFetch(
    API_ENDPOINTS.OUT_OF_WARRANTY_LIST_VENDOR_CHALLAN,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw {
      message:
        data.message ||
        data.detail ||
        "Failed to fetch Vendor challan records.",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { fetchOutOfWarrantyVendorChallanList };
