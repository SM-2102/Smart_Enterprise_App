import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @param {object} retailData
 * @returns {Promise<void>} Throws on error
 */
async function createRetail(retailData) {
  const response = await authFetch(API_ENDPOINTS.RETAIL_CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(retailData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { createRetail };
