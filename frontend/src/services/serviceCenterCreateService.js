import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Create a new user (protected route)
 * @param ascName
 * @returns {Promise<void>} Throws on error
 */
async function createASCName(payload) {
  const response = await authFetch(API_ENDPOINTS.SERVICE_CENTER_CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { createASCName };
