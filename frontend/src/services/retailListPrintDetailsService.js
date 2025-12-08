import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the retail details for printing based on the customer's name.
 */

async function fetchRetailPrintDetails(name) {
  const url = `${API_ENDPOINTS.RETAIL_SHOW_RECEIPT_NAMES}?name=${encodeURIComponent(name)}`;
  const response = await authFetch(url, {
    method: "GET",
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

export { fetchRetailPrintDetails };
