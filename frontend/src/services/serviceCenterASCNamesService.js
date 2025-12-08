import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch all master customer names for autocomplete
 * @returns {Promise<string[]>} List of customer names
 */
async function fetchASCNames() {
  const response = await authFetch(API_ENDPOINTS.SERVICE_CENTER_LIST_NAMES, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch ASC names");
  return response.json();
}

export { fetchASCNames };
