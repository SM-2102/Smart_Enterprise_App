import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch model-based cost details
 * @returns {Promise<object>}
 */
async function fetchCostDetails(payload) {
  const response = await authFetch(API_ENDPOINTS.MODEL_COST_DETAILS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload), // ✅ NO extra wrapper
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw {
      message:
        responseData.message ||
        responseData.detail ||
        "Failed to fetch model cost details",
      resolution: responseData.resolution || "",
    };
  }

  return responseData;
}

export { fetchCostDetails };
