import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @returns {Promise<string[]>} List of customer names
 */
async function fetchReceivedBy() {
  const response = await authFetch(API_ENDPOINTS.VENDOR_LIST_RECEIVED_BY, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch delivered by names");
  return response.json();
}

export { fetchReceivedBy };
