import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the last warranty srf number from the backend.
 * Returns { last_srf_number: string }
 */
async function fetchOutOfWarrantyServiceCharge(payload) {
  const response = await authFetch(API_ENDPOINTS.SERVICE_CHARGE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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

export { fetchOutOfWarrantyServiceCharge };
