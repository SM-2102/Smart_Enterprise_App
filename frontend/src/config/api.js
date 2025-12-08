// API Configuration
const BASE_API_URL = "http://localhost:8000/";

const API_ENDPOINTS = {
  LOGIN: `${BASE_API_URL}auth/login`,
  LOGOUT: `${BASE_API_URL}auth/logout`,
  REFRESH_TOKEN: `${BASE_API_URL}auth/refresh_token`,
  AUTH_ME: `${BASE_API_URL}auth/me`,

  MENU_DASHBOARD: `${BASE_API_URL}menu/dashboard`,

  CREATE_USER: `${BASE_API_URL}user/create_user`,
  DELETE_USER: `${BASE_API_URL}user/delete_user`,
  CHANGE_PASSWORD: `${BASE_API_URL}user/reset_password`,
  GET_ALL_USERS: `${BASE_API_URL}user/users`,
  GET_STANDARD_USERS: `${BASE_API_URL}user/standard_users`,

  MASTER_CREATE: `${BASE_API_URL}master/create`,
  MASTER_NEXT_CODE: `${BASE_API_URL}master/next_code`,
  MASTER_LIST_NAMES: `${BASE_API_URL}master/list_names`,
  MASTER_UPDATE: `${BASE_API_URL}master/update/`, //append code
  MASTER_SEARCH_CODE: `${BASE_API_URL}master/by_code`,
  MASTER_SEARCH_NAME: `${BASE_API_URL}master/by_name`,
  MASTER_SEARCH_ADDRESS: `${BASE_API_URL}master/fetch_address`,

  CHALLAN_CREATE: `${BASE_API_URL}challan/create`,
  CHALLAN_NEXT_NUMBER: `${BASE_API_URL}challan/next_code_with_challan_date`,
  CHALLAN_LAST_NUMBER: `${BASE_API_URL}challan/last_challan_number`,
  CHALLAN_PRINT: `${BASE_API_URL}challan/print`,

  MARKET_NEXT_NUMBER: `${BASE_API_URL}market/next_mcode`,
  MARKET_CREATE: `${BASE_API_URL}market/create`,
  MARKET_UPDATE: `${BASE_API_URL}market/update/`, //append mcode
  MARKET_ENQUIRY: `${BASE_API_URL}market/enquiry`, //append params
  MARKET_PENDING: `${BASE_API_URL}market/list_pending`,
  MARKET_SEARCH_CODE: `${BASE_API_URL}market/by_mcode`,
  MARKET_DELIVERED_BY: `${BASE_API_URL}market/list_delivered_by`,
  MARKET_INVOICE_NUMBER: `${BASE_API_URL}market/list_invoice_number`,

  RETAIL_NEXT_RCODE: `${BASE_API_URL}retail/next_rcode`,
  RETAIL_CREATE: `${BASE_API_URL}retail/create`,
  RETAIL_ENQUIRY: `${BASE_API_URL}retail/enquiry`, //append params
  RETAIL_LIST_OF_NOT_RECEIVED: `${BASE_API_URL}retail/list_of_not_received`,
  RETAIL_UPDATE_RECEIVED: `${BASE_API_URL}retail/update_received`,
  RETAIL_LIST_OF_UNSETTLED: `${BASE_API_URL}retail/list_of_unsettled`,
  RETAIL_UPDATE_UNSETTLED: `${BASE_API_URL}retail/update_unsettled`,
  RETAIL_LIST_OF_FINAL_SETTLEMENT: `${BASE_API_URL}retail/list_of_final_settlement`,
  RETAIL_UPDATE_FINAL_SETTLEMENT: `${BASE_API_URL}retail/update_final_settlement`,
  RETAIL_SHOW_RECEIPT_NAMES: `${BASE_API_URL}retail/show_receipt_names`,
  RETAIL_PRINT: `${BASE_API_URL}retail/print`,

  WARRANTY_NEXT_CODE: `${BASE_API_URL}warranty/next_srf_number`,
  WARRANTY_CREATE: `${BASE_API_URL}warranty/create`,
  WARRANTY_LIST_PENDING: `${BASE_API_URL}warranty/list_pending`,
  WARRANTY_BY_SRF_NUMBER: `${BASE_API_URL}warranty/by_srf_number`,
  WARRANTY_UPDATE: `${BASE_API_URL}warranty/update/`, //append srf_number
  WARRANTY_LIST_DELIVERED_BY: `${BASE_API_URL}warranty/list_delivered_by`,
  WARRANTY_LAST_SRF_NUMBER: `${BASE_API_URL}warranty/last_srf_number`,
  WARRANTY_SRF_PRINT: `${BASE_API_URL}warranty/srf_print`,
  WARRANTY_NEXT_CNF_CHALLAN_CODE: `${BASE_API_URL}warranty/next_cnf_challan_code`,
  WARRANTY_LAST_CNF_CHALLAN_CODE: `${BASE_API_URL}warranty/last_cnf_challan_code`,
  WARRANTY_LIST_CNF_CHALLAN: `${BASE_API_URL}warranty/list_cnf_challan_details`,
  WARRANTY_CREATE_CNF_CHALLAN: `${BASE_API_URL}warranty/create_cnf_challan`,
  WARRANTY_CNF_PRINT: `${BASE_API_URL}warranty/cnf_challan_print`,
  WARRANTY_ENQUIRY: `${BASE_API_URL}warranty/enquiry`, //append params

  SERVICE_CENTER_LIST_NAMES: `${BASE_API_URL}service_center/list_names`,
  SERVICE_CENTER_CREATE: `${BASE_API_URL}service_center/create`,

  SERVICE_CHARGE: `${BASE_API_URL}service_charge/service_charge`,

  OUT_OF_WARRANTY_NEXT_CODE: `${BASE_API_URL}out_of_warranty/next_srf_number`,
  OUT_OF_WARRANTY_CREATE: `${BASE_API_URL}out_of_warranty/create`,
  OUT_OF_WARRANTY_LIST_PENDING: `${BASE_API_URL}out_of_warranty/list_pending`,
  OUT_OF_WARRANTY_BY_SRF_NUMBER: `${BASE_API_URL}out_of_warranty/by_srf_number`,
  OUT_OF_WARRANTY_UPDATE: `${BASE_API_URL}out_of_warranty/update/`, //append srf_number
  OUT_OF_WARRANTY_LAST_SRF_NUMBER: `${BASE_API_URL}out_of_warranty/last_srf_number`,
  OUT_OF_WARRANTY_SRF_PRINT: `${BASE_API_URL}out_of_warranty/srf_print`,
  OUT_OF_WARRANTY_NEXT_VENDOR_CHALLAN_CODE: `${BASE_API_URL}out_of_warranty/next_vendor_challan_code`,
  OUT_OF_WARRANTY_LAST_VENDOR_CHALLAN_CODE: `${BASE_API_URL}out_of_warranty/last_vendor_challan_code`,
  OUT_OF_WARRANTY_LIST_VENDOR_CHALLAN: `${BASE_API_URL}out_of_warranty/list_vendor_challan_details`,
  OUT_OF_WARRANTY_CREATE_VENDOR_CHALLAN: `${BASE_API_URL}out_of_warranty/create_vendor_challan`,
  OUT_OF_WARRANTY_VENDOR_CHALLAN_PRINT: `${BASE_API_URL}out_of_warranty/vendor_challan_print`,
  OUT_OF_WARRANTY_LIST_RECEIVED_BY: `${BASE_API_URL}out_of_warranty/list_received_by`,
  OUT_OF_WARRANTY_VENDOR_NOT_SETTLED: `${BASE_API_URL}out_of_warranty/vendor_not_settled`,
  OUT_OF_WARRANTY_UPDATE_VENDOR_UNSETTLED: `${BASE_API_URL}out_of_warranty/update_vendor_unsettled`,
  OUT_OF_WARRANTY_VENDOR_FINAL_SETTLED: `${BASE_API_URL}out_of_warranty/list_of_final_vendor_settlement`,
  OUT_OF_WARRANTY_UPDATE_FINAL_VENDOR_SETTLED: `${BASE_API_URL}out_of_warranty/update_final_vendor_settlement`,
  OUT_OF_WARRANTY_SRF_NOT_SETTLED: `${BASE_API_URL}out_of_warranty/srf_not_settled`,
  OUT_OF_WARRANTY_UPDATE_SRF_UNSETTLED: `${BASE_API_URL}out_of_warranty/update_srf_unsettled`,
  OUT_OF_WARRANTY_LIST_FINAL_SRF_SETTLEMENT: `${BASE_API_URL}out_of_warranty/list_of_final_srf_settlement`,
  OUT_OF_WARRANTY_UPDATE_FINAL_SRF_SETTLEMENT: `${BASE_API_URL}out_of_warranty/update_final_srf_settlement`,
  OUT_OF_WARRANTY_ENQUIRY: `${BASE_API_URL}out_of_warranty/enquiry`, //append params
  OUT_OF_WARRANTY_ESTIMATE_PRINT_DETAILS: `${BASE_API_URL}out_of_warranty/show_receipt_names`,
  OUT_OF_WARRANTY_ESTIMATE_PRINT: `${BASE_API_URL}out_of_warranty/estimate_print`,
};

export default API_ENDPOINTS;
