import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the out of warranty estimate print details based on the customer's name.
 */

async function fetchOutOfWarrantyEstimatePrintDetails(name) {
  const url = `${API_ENDPOINTS.OUT_OF_WARRANTY_ESTIMATE_PRINT_DETAILS}?name=${encodeURIComponent(name)}`;
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

export { fetchOutOfWarrantyEstimatePrintDetails };
