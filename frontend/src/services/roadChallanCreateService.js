import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @param {object} roadChallanData
 * @returns {Promise<void>} Throws on error
 */
async function createRoadChallan(roadChallanData) {
  const response = await authFetch(API_ENDPOINTS.CHALLAN_CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roadChallanData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { createRoadChallan };
