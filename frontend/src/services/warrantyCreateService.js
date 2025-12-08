import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @param {object} warrantyData
 * @returns {Promise<void>} Throws on error
 */
async function createWarranty(warrantyData) {
  const response = await authFetch(API_ENDPOINTS.WARRANTY_CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(warrantyData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
  return data;
}

export { createWarranty };
