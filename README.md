
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

### Master Module
- [x] **MasterCreatePage** - Create Master record
- [x] **MasterUpdatePage** - Update Master record
- [x] **ServiceCenterCreatePage** - Add Service Center [ADMIN]
- [ ] **ModelCreatePage** - Add Model record

### Road Challan Module
- [x] **RoadChallanSmartCreatePage** - Create Road Challan record for Smart
- [x] **RoadChallanSmartPrintPage** - Print Road Challan record for Smart
- [x] **RoadChallanUniqueCreatePage** - Create Road Challan record for Unique
- [x] **RoadChallanUniquePrintPage** - Print Road Challan record for Unique

### Retail Module
- [x] **RetailCreatePage** - Create Retail record
- [x] **RetailUpdatePage** - Update Retail record
- [x] **RetailEnquiryPage** - Retail Enquiry
- [x] **RetailPrintPage** - Retail Print Receipt
- [x] **RetailSettleUserPage** - Proposed For Settlement
- [x] **RetailSettleAdminPage** - Settled Retail Record [ADMIN]

### Warranty Module
- [ ] **WarrantyCreatePage** - Create Warranty record
- [ ] **WarrantyUpdatePage** - Update Warranty record
- [ ] **WarrantySRFPrintPage** - Warranty SRF Print
- [ ] **WarrantyChallanPage** - Warranty Challan
- [ ] **WarrantyChallanPrintPage** - Warranty Challan Print
- [ ] **WarrantyEnquiryPage** - Warranty Enquiry Page

### OutOfWarranty Module
- [ ] **OutOFWarrantyCreatePage** - Create Out Of Warranty record
- [ ] **OutOFWarrantyUpdatePage** - Update Out Of Warranty record
- [ ] **OutOFWarrantySRFPrintPage** - Out Of Warranty SRF Print
- [ ] **OutOFWarrantySRFSettleUserPage** - Out Of Warranty SRF Propose to Settle
- [ ] **OutOFWarrantySRFSettleAdminPage** - Out Of Warranty SRF Settlement [ADMIN]
- [ ] **OutOFWarrantyEnquiryPage** - Out Of Warranty Enquiry Page

### Vendor Module
- [x] **OutOFWarrantyCreateVendorPage** - Out Of Warranty Vendor Challan
- [x] **OutOFWarrantyChallanPrintPage** - Out Of Warranty Vendor Challan Print
- [x] **OutOFWarrantyChallanSettleUserPage** - Out Of Warranty Challan Propose to Settle
- [x] **OutOFWarrantyChallanSettleAdminPage** - Out Of Warranty Challan Settlement [ADMIN]


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

### Menu Module
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
- [x] **/challan_smart/next_code**
- [x] **/challan_smart/create**
- [x] **/challan_smart/last_challan_code**
- [x] **/challan_smart/print**
- [x] **/challan_unique/next_code**
- [x] **/challan_unique/create**
- [x] **/challan_unique/last_challan_code**
- [x] **/challan_unique/print**

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

### Service Center Module
- [x] **/service_center/list_names**
- [x] **/service_center/create** - [ADMIN]

### Model Module
- [x] **/model/get_rewinding_rate**

### Warranty Module
- [x] **warranty/next_srf_number**
- [x] **warranty/create**
- [x] **warranty/list_pending**
- [x] **warranty/by_srf_number**
- [x] **warranty/update/{srf_number}**
- [x] **warranty/list_delivered_by**
- [x] **warranty/last_srf_number**
- [ ] **warranty/srf_print**
- [ ] **warranty/next_cnf_challan_code**
- [ ] **warranty/last_cnf_challan_code**
- [ ] **warranty/list_cnf_challan**
- [ ] **warranty/create_cnf_challan**
- [ ] **warranty/cnf_challan_print**
- [ ] **warranty/enquiry{params}**

### OutOfWarranty Module
- [x] **out_of_warranty/next_srf_number**
- [ ] **out_of_warranty/create**
- [ ] **out_of_warranty/list_pending**
- [ ] **out_of_warranty/by_srf_number**
- [ ] **out_of_warranty/update/{srf_number}**
- [x] **out_of_warranty/last_srf_number**
- [ ] **out_of_warranty/srf_print**
- [ ] **out_of_warranty/enquiry{params}**
- [ ] **out_of_warranty/srf_not_settled**
- [ ] **out_of_warranty/update_srf_unsettled**
- [ ] **out_of_warranty/list_of_final_srf_settlement**
- [ ] **out_of_warranty/update_final_srf_settlement**

### Vendor Module
- [x] **vendor/next_vendor_challan_code**
- [x] **vendor/last_vendor_challan_code**
- [x] **vendor/list_vendor_challan**
- [x] **vendor/create_vendor_challan**
- [x] **vendor/vendor_challan_print**
- [x] **vendor/vendor_not_settled**
- [x] **vendor/update_vendor_unsettled**
- [x] **vendor/list_of_final_vendor_settlement**
- [x] **vendor/update_final_vendor_settlement**
- [x] **vendor/list_received_by**


### ServiceCharge Module
- [x] **service_charge/service_charge**


---

## Application Development

- [x] **Authorization**
- [ ] **Database Schema**
- [x] **Initial Deployment**
- [x] **Backup**
- [x] **Login & Menu**
- [x] **User**
- [x] **Master**
- [x] **Retail**
- [x] **Challan**
- [x] **Vendor**
- [ ] **Warranty**
- [ ] **Out of Warranty**
- [ ] **Final Deployment**

---




