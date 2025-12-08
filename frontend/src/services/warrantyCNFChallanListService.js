import { data } from "react-router-dom";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch CNF challan records by division
 * @param {Object} params - Request body, e.g. { division: "string" }
 * @returns {Promise<Array>} List of CNF challan records
 */
async function fetchWarrantyCNFChallanList(params) {
  const response = await authFetch(API_ENDPOINTS.WARRANTY_LIST_CNF_CHALLAN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw {
      message:
        data.message || data.detail || "Failed to fetch CNF challan records.",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { fetchWarrantyCNFChallanList };
