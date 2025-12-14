import DeleteUserPage from "./pages/UserDeletePage.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MenuDashboardPage from "./pages/MenuDashboardPage.jsx";
import PageNotFound from "./pages/PageNotFound";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DashboardDataProvider } from "./context/DashboardDataContext.jsx";
import MasterCreatePage from "./pages/MasterCreatePage.jsx";
import MasterUpdatePage from "./pages/MasterUpdatePage.jsx";
import RetailSettleAdminPage from "./pages/RetailSettleAdminPage.jsx";
import RetailCreatePage from "./pages/RetailCreatePage.jsx";
import RetailEnquiryPage from "./pages/RetailEnquiryPage.jsx";
import RetailUpdatePage from "./pages/RetailUpdatePage.jsx";
import RetailSettleUserPage from "./pages/RetailSettleUserPage.jsx";
import RetailPrintPage from "./pages/RetailPrintPage.jsx";
import WarrantyCreatePage from "./pages/WarrantyCreatePage.jsx";
import WarrantySRFPrintPage from "./pages/WarrantySRFPrintPage.jsx";
import WarrantyCreateCNFPage from "./pages/WarrantyCNFCreatePage.jsx";
import WarrantyCNFPrintPage from "./pages/WarrantyCNFPrintPage.jsx";
import WarrantyUpdatePage from "./pages/WarrantyUpdatePage.jsx";
import WarrantyEnquiryPage from "./pages/WarrantyEnquiryPage.jsx";
import OutOfWarrantySRFPrintPage from "./pages/OutOfWarrantySRFPrintPage.jsx";
import OutOfWarrantySettleSRFUserPage from "./pages/OutOfWarrantySRFSettleUserPage.jsx";
import OutOfWarrantySettleSRFAdminPage from "./pages/OutOfWarrantySRFSettleAdminPage.jsx";
import OutOfWarrantyEnquiryPage from "./pages/OutOfWarrantyEnquiryPage.jsx";
import OutOfWarrantyCreatePage from "./pages/OutOfWarrantyCreatePage.jsx";
import ServiceCenterCreatePage from "./pages/ServiceCenterCreatePage.jsx";
import OutOfWarrantyUpdatePage from "./pages/OutOfWarrantyUpdatePage.jsx";
import ChangePasswordPage from "./pages/UserChangePasswordPage.jsx";
import CreateUserPage from "./pages/UserCreatePage.jsx";
import ShowStandardUsersPage from "./pages/UserShowStandardPage.jsx";
import ShowAllUsersPage from "./pages/UserShowAllPage.jsx";
import RoadChallanSmartCreatePage from "./pages/RoadChallanSmartCreatePage.jsx";
import RoadChallanSmartPrintPage from "./pages/RoadChallanSmartPrintPage.jsx";
import RoadChallanUniqueCreatePage from "./pages/RoadChallanUniqueCreatePage.jsx";
import RoadChallanUniquePrintPage from "./pages/RoadChallanUniquePrintPage.jsx";
import CreateVendorPage from "./pages/VendorCreatePage.jsx";
import VendorPrintPage from "./pages/VendorPrintPage.jsx";
import SettleVendorUserPage from "./pages/VendorSettleUserPage.jsx";
import VendorSettleAdminPage from "./pages/VendorSettleAdminPage.jsx";

function AppRoutesWithNav() {
  return (
    <>
    <Header />
      <div className="pt-[5.5rem] pb-[1.5rem] min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <PageNotFound />
              </PrivateRoute>
            }
          />
          <Route
            path="/MenuDashboard"
            element={
              <PrivateRoute>
                <MenuDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/CreateUser"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <CreateUserPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/DeleteUser"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <DeleteUserPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ChangePassword"
            element={
              <PrivateRoute>
                <ChangePasswordPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ShowAllUsers"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ShowAllUsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ShowStandardUsers"
            element={
              <PrivateRoute>
                <ShowStandardUsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/CreateCustomerRecord"
            element={
              <PrivateRoute>
                <MasterCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/UpdateCustomerRecord"
            element={
              <PrivateRoute>
                <MasterUpdatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/CreateASCName"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ServiceCenterCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/CreateSmartEnterpriseRoadChallan"
            element={
              <PrivateRoute>
                <RoadChallanSmartCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/PrintSmartEnterpriseRoadChallan"
            element={
              <PrivateRoute>
                <RoadChallanSmartPrintPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/CreateUniqueServicesRoadChallan"
            element={
              <PrivateRoute>
                <RoadChallanUniqueCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/PrintUniqueServicesRoadChallan"
            element={
              <PrivateRoute>
                <RoadChallanUniquePrintPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/CreateRetailRecord"
            element={
              <PrivateRoute>
                <RetailCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/UpdateRetailRecord"
            element={
              <PrivateRoute>
                <RetailUpdatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/PrintRetailReceipt"
            element={
              <PrivateRoute>
                <RetailPrintPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ProposeToSettleRetailRecord"
            element={
              <PrivateRoute>
                <RetailSettleUserPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/FinalSettlementRetailRecord"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <RetailSettleAdminPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/RetailRecordEnquiry"
            element={
              <PrivateRoute>
                <RetailEnquiryPage />
              </PrivateRoute>
            }
          />
          {/* <Route
            path="/CreateWarrantySRF"
            element={
              <PrivateRoute>
                <WarrantyCreatePage />
              </PrivateRoute>
            }
          />*/}
          <Route
            path="/CreateWarrantyCNFChallan"
            element={
              <PrivateRoute>
                <WarrantyCreateCNFPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/PrintWarrantySRF"
            element={
              <PrivateRoute>
                <WarrantySRFPrintPage />
              </PrivateRoute>
            }
          />
          {/*
          <Route
            path="/PrintWarrantyCNFChallan"
            element={
              <PrivateRoute>
                <WarrantyCNFPrintPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/UpdateWarrantySRF"
            element={
              <PrivateRoute>
                <WarrantyUpdatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/WarrantyEnquiry"
            element={
              <PrivateRoute>
                <WarrantyEnquiryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/CreateOutOfWarrantySRF"
            element={
              <PrivateRoute>
                <OutOfWarrantyCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/PrintOutOfWarrantySRF"
            element={
              <PrivateRoute>
                <OutOfWarrantySRFPrintPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/UpdateOutOfWarrantySRF"
            element={
              <PrivateRoute>
                <OutOfWarrantyUpdatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ProposeToSettleOutOfWarrantySRF"
            element={
              <PrivateRoute>
                <OutOfWarrantySettleSRFUserPage />
              </PrivateRoute>
            }
          />*/}
          <Route
            path="/CreateVendorChallan"
            element={
              <PrivateRoute>
                <CreateVendorPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/PrintVendorChallan"
            element={
              <PrivateRoute>
                <VendorPrintPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/FinalSettlementVendor"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <VendorSettleAdminPage />
              </PrivateRoute>
            }
          />
          {/* 
          <Route
            path="/OutOfWarrantyEnquiry"
            element={
              <PrivateRoute>
                <OutOfWarrantyEnquiryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/FinalSettlementOutOfWarrantySRF"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <OutOfWarrantySettleSRFAdminPage />
              </PrivateRoute>
            }
          />*/}
          <Route
            path="/ProposeToSettleVendor"
            element={
              <PrivateRoute>
                <SettleVendorUserPage />
              </PrivateRoute>
            }
          /> 
        </Routes>
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DashboardDataProvider>
        <AuthProvider>
          <AppRoutesWithNav />
        </AuthProvider>
      </DashboardDataProvider>
    </BrowserRouter>
  );
}

export default App;
