import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @param {object} complaintNumberData - Data to update
 * @returns {Promise<object>} Response data
 */
async function updateComplaintNumber(complaintNumberData) {
  const url = `${API_ENDPOINTS.VENDOR_UPDATE_COMPLAINT_NUMBER}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(complaintNumberData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to update complaint number",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { updateComplaintNumber };
