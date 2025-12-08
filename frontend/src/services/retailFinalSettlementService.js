import { data } from "react-router-dom";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @returns {Promise<Array>} List of users
 */
async function fetchRetailFinalSettlement() {
  const response = await authFetch(
    API_ENDPOINTS.RETAIL_LIST_OF_FINAL_SETTLEMENT,
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
      message: data.message || data.detail || "Failed to fetch retail records.",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { fetchRetailFinalSettlement };
