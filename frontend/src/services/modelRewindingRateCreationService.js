import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Create a new master (protected route)
 * @param {object} modelData
 * @returns {Promise<void>} Throws on error
 */
async function getRewindingCharge(modelData) {
  const response = await authFetch(
    API_ENDPOINTS.MODEL_GET_REWINDING_FOR_CREATION,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(modelData),
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
  return data;
}

export { getRewindingCharge };
