import { data } from "react-router-dom";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch all users (for ShowUsers component)
 * @returns {Promise<Array>} List of users
 */
async function fetchOutOfWarrantySRFFinalSettled() {
  const response = await authFetch(
    API_ENDPOINTS.OUT_OF_WARRANTY_LIST_FINAL_SRF_SETTLEMENT,
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
      message: data.message || data.detail || "Failed to fetch records.",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { fetchOutOfWarrantySRFFinalSettled };
