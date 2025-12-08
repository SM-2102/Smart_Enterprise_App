import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @returns {Promise<string[]>} List of customer names
 */
async function fetchOutOfWarrantyReceivedBy() {
  const response = await authFetch(
    API_ENDPOINTS.OUT_OF_WARRANTY_LIST_RECEIVED_BY,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) throw new Error("Failed to fetch delivered by names");
  return response.json();
}

export { fetchOutOfWarrantyReceivedBy };
