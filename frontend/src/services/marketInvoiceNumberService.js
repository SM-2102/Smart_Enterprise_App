import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * @returns {Promise<string[]>} List of invoice numbers
 */
async function fetchMarketInvoiceNumber() {
  const response = await authFetch(API_ENDPOINTS.MARKET_INVOICE_NUMBER, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch delivered by names");
  return response.json();
}

export { fetchMarketInvoiceNumber };
