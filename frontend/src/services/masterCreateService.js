import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Create a new master (protected route)
 * @param {object} masterData
 * @returns {Promise<void>} Throws on error
 */
async function createMaster(masterData) {
  const response = await authFetch(API_ENDPOINTS.MASTER_CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(masterData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { createMaster };
