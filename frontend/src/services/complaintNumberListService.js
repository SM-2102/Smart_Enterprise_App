import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @returns {Promise<string[]>} List of customer names
 */
async function fetchComplaintNumbers() {
  const response = await authFetch(API_ENDPOINTS.COMPLAINT_NUMBER_LIST, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch complaint numbers");
  return response.json();
}

export { fetchComplaintNumbers };
