import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @param {object} outOfWarrantyData
 * @returns {Promise<void>} Throws on error
 */
async function createOutOfWarranty(outOfWarrantyData) {
  const response = await authFetch(API_ENDPOINTS.OUT_OF_WARRANTY_CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(outOfWarrantyData),
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

export { createOutOfWarranty };
