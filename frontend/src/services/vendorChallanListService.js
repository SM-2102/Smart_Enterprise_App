import { data } from "react-router-dom";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch CNF challan records by division
 * @returns {Promise<Array>} List of CNF challan records
 */
async function fetchVendorChallanList() {
  const response = await authFetch(
    API_ENDPOINTS.VENDOR_LIST_CHALLAN,
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

export { fetchVendorChallanList };
