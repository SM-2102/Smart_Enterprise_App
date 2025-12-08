import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Fetches the last warranty srf number from the backend.
 * Returns { last_srf_number: string }
 */
async function fetchOutOfWarrantyLastSrfNumber() {
  const response = await authFetch(
    API_ENDPOINTS.OUT_OF_WARRANTY_LAST_SRF_NUMBER,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
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

export { fetchOutOfWarrantyLastSrfNumber };
