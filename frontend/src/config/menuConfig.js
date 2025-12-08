// Centralized menu and card actions config for NavBar and MenuDashboardPage
import {
  FaUser,
  FaTools,
  FaShoppingBag,
  FaStore,
  FaReceipt,
} from "react-icons/fa";
import { MdOutlineBuild } from "react-icons/md";

export const menuConfig = [
  {
    key: "customer",
    title: "Customer Entry",
    icon: FaUser,
    bgColor: "#ffe4ec",
    actions: [
      { label: "Add Record", path: "/CreateCustomerRecord" },
      { label: "Update Record", path: "/UpdateCustomerRecord" },
      { label: "Add ASC Name", path: "/CreateASCName" },
    ],
  },
  {
    key: "warranty",
    title: "Warranty Replacement / Repair",
    icon: FaTools,
    bgColor: "#fff7e6",
    actions: [
      { label: "Create SRF Record", path: "/CreateWarrantySRF" },
      { label: "Create CNF Challan", path: "/CreateWarrantyCNFChallan" },
      { label: "Update SRF Record", path: "/UpdateWarrantySRF" },
      { label: "Print CNF Challan", path: "/PrintWarrantyCNFChallan" },
      { label: "Print SRF Record", path: "/PrintWarrantySRF" },
      { label: "Enquiry", path: "/WarrantyEnquiry", showInDashboard: false },
    ],
  },
  {
    key: "out_of_warranty",
    title: "Out of Warranty Repair",
    icon: MdOutlineBuild,
    bgColor: "#e6fff7",
    actions: [
      { label: "Create SRF Record", path: "/CreateOutOfWarrantySRF" },
      {
        label: "Create Vendor Challan",
        path: "/CreateOutOfWarrantyVendorChallan",
      },
      { label: "Update SRF Record", path: "/UpdateOutOfWarrantySRF" },
      {
        label: "Print Vendor Challan",
        path: "/PrintOutOfWarrantyVendorChallan",
      },
      { label: "Print SRF Record", path: "/PrintOutOfWarrantySRF" },
      { label: "Print Estimate Receipt", path: "/PrintOutOfWarrantyEstimate" },
      { label: "Settle SRF Record", path: "/ProposeToSettleOutOfWarrantySRF" },
      {
        label: "Settle Vendor Record",
        path: "/ProposeToSettleOutOfWarrantyVendor",
      },
      { label: "Settle Final SRF", path: "/FinalSettlementOutOfWarrantySRF" },
      {
        label: "Settle Final Vendor",
        path: "/FinalSettlementOutOfWarrantyVendor",
      },
      {
        label: "Enquiry",
        path: "/OutOfWarrantyEnquiry",
        showInDashboard: false,
      },
    ],
  },
  {
    key: "market",
    title: "Direct Market Replacement",
    icon: FaShoppingBag,
    bgColor: "#f0f4f8",
    actions: [
      { label: "Add Record", path: "/CreateMarketRecord" },
      { label: "Update Record", path: "/UpdateMarketRecord" },
      {
        label: "Enquiry",
        path: "/MarketRecordEnquiry",
        showInDashboard: false,
      },
    ],
  },
  {
    key: "challan",
    title: "Road Challan",
    icon: FaReceipt,
    bgColor: "#faf6c0ff",
    actions: [
      { label: "Create Challan", path: "/CreateRoadChallan" },
      { label: "Print Challan", path: "/PrintRoadChallan" },
    ],
  },
  {
    key: "retail",
    title: "Retail Sales / Services",
    icon: FaStore,
    bgColor: "#e7d7f8ff",
    actions: [
      { label: "Add Record", path: "/CreateRetailRecord" },
      { label: "Update Record", path: "/UpdateRetailRecord" },
      { label: "Print Receipt", path: "/PrintRetailReceipt" },
      { label: "Settle Record", path: "/ProposeToSettleRetailRecord" },
      { label: "Final Settlement", path: "/FinalSettlementRetailRecord" },
      {
        label: "Enquiry",
        path: "/RetailRecordEnquiry",
        showInDashboard: false,
      },
    ],
  },
];
