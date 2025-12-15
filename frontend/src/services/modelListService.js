import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @returns {Promise<string[]>} List of models
 */
async function fetchModels(data) {
  const response = await authFetch(API_ENDPOINTS.MODEL_LIST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to fetch models");
  return response.json();
}

export { fetchModels };
