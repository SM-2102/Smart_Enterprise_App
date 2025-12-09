
## Unique Services App - Developer Guide

## Frontend Pages

### Auth Module
- [x] **LoginPage** – User authentication

### User Module
- [x] **CreateUserPage** – Create User [ADMIN]
- [x] **DeleteUserPage** – Delete User [ADMIN]
- [x] **ShowAllUsersPage** – View All Users [ADMIN]
- [x] **ShowStandardUsersPage** - View Standard Users
- [x] **ChangePasswordPage** – Change password

### Dashboard Module
- [ ] **MenuDashboardPage** – Main dashboard for menu navigation
- [x] **PageNotFound** – 404 error page
- [x] **PageNotAvailable** – Maintenance/feature unavailable page

<!-- ### Master Module
- [x] **MasterCreatePage** - Create Master record
- [x] **MasterUpdatePage** - Update Master record
- [x] **ServiceCenterCreatePage** - Add Service Center

### Road Challan Module
- [x] **RoadChallanCreatePage** - Create Road Challan record
- [x] **RoadChallanPrintPage** - Print Road Challan record


### Retail Module
- [x] **RetailCreatePage** - Create Retail record
- [x] **RetailUpdatePage** - Update Retail record
- [x] **RetailEnquiryPage** - Retail Enquiry
- [x] **RetailPrintPage** - Retail Print Receipt
- [x] **RetailSettleUserPage** - Proposed For Settlement
- [x] **RetailSettleAdminPage** - Settled Retail Record [ADMIN]

### Warranty Module
- [x] **WarrantyCreatePage** - Create Warranty record
- [x] **WarrantyUpdatePage** - Update Warranty record
- [x] **WarrantySRFPrintPage** - Warranty SRF Print
- [x] **WarrantyChallanPage** - Warranty Challan
- [x] **WarrantyChallanPrintPage** - Warranty Challan Print
- [x] **WarrantyEnquiryPage** - Warranty Enquiry Page

### OutOfWarranty Module
- [x] **OutOFWarrantyCreatePage** - Create Out Of Warranty record
- [x] **OutOFWarrantyUpdatePage** - Update Out Of Warranty record
- [x] **OutOFWarrantySRFPrintPage** - Out Of Warranty SRF Print
- [x] **OutOFWarrantySRFSettleUserPage** - Out Of Warranty SRF Propose to Settle
- [x] **OutOFWarrantySRFSettleAdminPage** - Out Of Warranty SRF Settlement [ADMIN]
- [x] **OutOfWarrantyEstimatePrintPage** - Out Of Warranty Estimate Print
- [x] **OutOFWarrantyCreateVendorPage** - Out Of Warranty Vendor Challan
- [x] **OutOFWarrantyChallanPrintPage** - Out Of Warranty Vendor Challan Print
- [x] **OutOFWarrantyChallanSettleUserPage** - Out Of Warranty Challan Propose to Settle
- [x] **OutOFWarrantyChallanSettleAdminPage** - Out Of Warranty Challan Settlement [ADMIN]
- [x] **OutOFWarrantyEnquiryPage** - Out Of Warranty Enquiry Page -->

---


## Backend Routes

### Auth Module
- [x] **/auth/login**
- [x] **/auth/logout**
- [x] **/auth/me**

### User Module
- [x] **/user/all_users** - [ADMIN]
- [x] **/user/standard_users** 
- [x] **/user/create_user** - [ADMIN]
- [x] **/user/delete_user** - [ADMIN]
- [x] **/user/reset_password**

<!-- ### Menu Module
- [x] **/menu/dashboard**

### Master Module
- [x] **/master/create**
- [x] **/master/next_code**
- [x] **/master/list_names** 
- [x] **/master/by_code** 
- [x] **/master/by_name**
- [x] **/master/update{code}**
- [x] **/master/fetch_address**

### Challan Module
- [x] **/road_challan/next_code**
- [x] **/road_challan/create**
- [x] **/road_challan/last_challan_code**
- [x] **/road_challan/print**

### Retail Module
- [x] **/retail/next_code**
- [x] **/retail/create**
- [x] **/retail/list_of_not_received**
- [x] **/retail/update_received**
- [x] **/retail/list_of_unsettled**
- [x] **/retail/update_unsettled**
- [x] **/retail/list_of_final_settlement** - [ADMIN]
- [x] **/retail/update_final_settlement** - [ADMIN]
- [x] **/retail/show_receipt_names**
- [x] **/reetail/print**
- [x] **/retail/enquiry{params}**

### Warranty Module
- [x] **warranty/next_srf_number**
- [x] **warranty/create**
- [x] **warranty/list_pending**
- [x] **warranty/by_srf_number**
- [x] **warranty/update/{srf_number}**
- [x] **warranty/list_delivered_by**
- [x] **warranty/last_srf_number**
- [x] **warranty/srf_print**
- [x] **warranty/next_cnf_challan_code**
- [x] **warranty/last_cnf_challan_code**
- [x] **warranty/list_cnf_challan**
- [x] **warranty/create_cnf_challan**
- [x] **warranty/cnf_challan_print**
- [x] **warranty/enquiry{params}**

### Service Center Module
- [x] **/service_center/list_names**
- [x] **/service_center/create**

### OutOfWarranty Module - [ADMIN]
- [x] **out_of_warranty/next_srf_number**
- [x] **out_of_warranty/create**
- [x] **out_of_warranty/list_pending**
- [x] **out_of_warranty/by_srf_number**
- [x] **out_of_warranty/update/{srf_number}**
- [x] **out_of_warranty/last_srf_number**
- [x] **out_of_warranty/srf_print**
- [x] **out_of_warranty/next_vendor_challan_code**
- [x] **out_of_warranty/last_vendor_challan_code**
- [x] **out_of_warranty/list_vendor_challan**
- [x] **out_of_warranty/create_vendor_challan**
- [x] **out_of_warranty/vendor_challan_print**
- [x] **out_of_warranty/enquiry{params}**
- [x] **out_of_warranty/list_received_by**
- [x] **out_of_warranty/vendor_not_settled**
- [x] **out_of_warranty/update_vendor_unsettled**
- [x] **out_of_warranty/list_of_final_vendor_settlement**
- [x] **out_of_warranty/update_final_vendor_settlement**
- [x] **out_of_warranty/srf_not_settled**
- [x] **out_of_warranty/update_srf_unsettled**
- [x] **out_of_warranty/list_of_final_srf_settlement**
- [x] **out_of_warranty/update_final_srf_settlement**
- [x] **out_of_warranty/show_receipt_names**
- [x] **out_of_warranty/estimate_print**

### ServiceCharge Module
- [x] **service_charge/service_charge** -->


---

## Application Development

- [x] **Authorization**
- [ ] **Database Schema**
- [x] **Initial Deployment**
- [x] **Backup**
- [ ] **Login & Menu**
- [x] **User**
<!-- - [ ] **Master**
- [ ] **Retail**
- [ ] **Challan**
- [ ] **Warranty**
- [ ] **Out of Warranty** -->
- [ ] **Final Deployment**

---




