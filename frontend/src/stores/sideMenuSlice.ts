import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { icons } from "../base-components/Lucide";

export interface Menu {
  icon?: keyof typeof icons;
  id?: any;
  title?: string;
  pathname?: string;
  subMenu?: Menu[];
  ignore?: boolean;
}

export interface SideMenuState {
  menu: Array<Menu | "divider">;
}

const initialState: SideMenuState = {
  menu: [
    {
      icon: "Home",
      title: "Dashboard",
      pathname: "/hub/dashboard",
    },
    {
      icon: "Edit",
      title: "Hub Operations",
      subMenu: [
        {
          id: 146,
          icon: "ScanLine",
          pathname: "/hub/operation/inscan_2_0",
          title: "Inscan 2.0",
        },
        {
          id: 19,
          icon: "ScanLine",
          pathname: "/hub/operation/held_up_request",
          title: "Held up Request"
        },
        {
          id: 146,
          icon: "Scan",
          pathname: "/hub/operation/direct_outscan",
          title: "Direct Outscan",
        },
        {
          id: 146,
          icon: "Box",
          pathname: "/hub/operation/weighing_machine_threshold",
          title: "Weighing Machine",
        },
        {
          id: 147,
          icon: "Ruler",
          pathname: "/hub/operation/weight_dimension",
          title: "Weight Dimension",
        },
        {
          id: 148,
          icon: "Package",
          pathname: "/hub/operation/direct_shipment",
          title: "Direct Shipment",
        },
        {
          id: 16,
          icon: "FileText",
          pathname: "/hub/operation/manifest_inward",
          title: "Manifest Inward",
        },
        {
          id: 17,
          icon: "FileCog",
          pathname: "/hub/operation/manifest_inscan",
          title: "Manifest Inscan",
        },
        {
          id: 18,
          icon: "ShieldCheck",
          pathname: "/hub/operation/shipment_segregation",
          title: "Shipment Segregation",
        },
        {
          id: 21,
          icon: "Truck",
          pathname: "/hub/operation/release_shipment",
          title: "Release Shipment",
        },
        {
          id: 22,
          icon: "ClipboardList",
          pathname: "/hub/operation/create_bag",
          title: "Create Bag",
        },
        {
          id: 23,
          icon: "Laptop",
          pathname: "/hub/operation/create_manifest",
          title: "Create Manifest",
        },
        {
          id: 24,
          icon: "Plane",
          pathname: "/hub/operation/onforward_shipment",
          title: "Onforward Shipment",
        },
        {
          id: 69,
          icon: "FileCheck",
          pathname: "/hub/operation/reverse_shipment",
          title: "Reverse Shipment",
        },

        {
          id: 58,
          icon: "CheckCircle",
          pathname: "/hub/operation/change_weight",
          title: "Change Weight",
        },
        {
          id: 19,
          icon: "User",
          pathname: "/hub/operation/change_vendor",
          title: "Change Vendor",
        },
        {
          id: 150,
          icon: "Home",
          pathname: "/hub/operation/customer_house_master",
          title: "Customer House Master",
        },
        {
          id: 151,
          icon: "Boxes",
          pathname: "/hub/operation/add_courier_stock",
          title: "Add Courier Stock",
        },
        {
          id: 152,
          icon: "Building",
          pathname: "/hub/operation/tag_house",
          title: "Tag House",
        },
        {
          id: 68,
          icon: "Plane",
          pathname: "/hub/operation/manual_awb_tagging",
          title: "Manual Awb Tagging",
        },
        {
          id: 154,
          icon: "FileCog",
          pathname: "/hub/operation/generate_dispatch_label",
          title: "Generate Dispatch",
        },
        {
          id: 103,
          icon: "Pencil",
          pathname: "/hub/operation/edit_booking",
          title: "Edit Booking",
        },
        {
          id: 327,
          icon: "Truck",
          pathname: "/hub/operation/update_shipment",
          title: "Update Shipment",
        },
        {
          id: 330,
          icon: "Box",
          pathname: "/hub/operation/held_up",
          title: "Held Up",
        },
        {
          id: 331,
          icon: "ClipboardList",
          pathname: "/hub/operation/checklist",
          title: "Checklist",
        },
        {
          id: 332,
          icon: "Undo2",
          pathname: "/hub/operation/rto",
          title: "RTO",
        },
        {
          id: 332,
          icon: "Tablet",
          pathname: "/hub/operation/bookings-rto",
          title: "RTO Bookings",
        },
        {
          id: 436,
          icon: "FileText",
          pathname: "/hub/operation/emirates_invoice_upload",
          title: "Emirates Invoice Upload",
        },
        {
          id: 457,
          icon: "PackageCheck",
          pathname: "/hub/operation/bulk_shipment_outscan",
          title: "Bulk Shipment Outscan",
        },
      ],
    },
    {
      icon: "Settings",
      title: "Accounts",
      subMenu: [
        {
          id: 59,
          icon: "CheckSquare",
          pathname: "/hub/accounts/additional_charge",
          title: "Additional Charges",
        },
        {
          id: 149,
          icon: "Wallet",
          pathname: "/hub/accounts/debit_charge",
          title: "Debit Charges",
        },
        {
          id: 155,
          icon: "Pocket",
          pathname: "/hub/operation/authenticate_vendor_list",
          title: "Authenticate Vendor List",
        },
        {
          id: 153,
          icon: "FileText",
          pathname: "/hub/operation/spot_pricing_list",
          title: "Spot Pricing List",
        },
        {
          id: 372,
          icon: "FileText",
          title: "MAWB/HAWB Change Requests",
          pathname: "/hub/operation/change_requests",
        },
        {
          id: 337,
          icon: "Briefcase",
          pathname: "/hub/operation/initiate-job",
          title: "Initiate Job",
        },
      ],
    },
    {
      id: 156,
      icon: "Laptop",
      pathname: "/hub/walkin_customer",
      title: "AWB & KYC",
    },
    {
      icon: "Book",
      title: "Reports",
      subMenu: [
        {
          id: 17,
          icon: "Calendar",
          pathname: "/hub/report/shipment_details",
          title: "Shipment Details",
        },
        {
          id: 66,
          icon: "Calendar",
          pathname: "/hub/report/inscan_outscan",
          title: "Inscanned Vs Outscanned",
        },
        {
          id: 26,
          icon: "Package",
          pathname: "/hub/report/shipment_on_hold",
          title: "Shipment On Hold",
        },
        {
          id: 27,
          icon: "User",
          pathname: "/hub/report/awaiting_shipment",
          title: "Awaiting Shipment",
        },
        {
          id: 28,
          icon: "Monitor",
          pathname: "/hub/report/shipment_not_dispatch",
          title: "Shipment Not Dispatch",
        },
        {
          id: 26,
          icon: "Boxes",
          pathname: "/hub/report/shipment_awb_repository",
          title: "Shipment Awb Repository",
        },
        {
          id: 66,
          icon: "Package",
          pathname: "/hub/report/Daily_shipment_inscan_vs_outscan",
          title: "Daily Shipment Inscan VS Outscan",
        },
        {
          id: 206,
          icon: "Ruler",
          pathname: "/hub/report/Update_weight",
          title: "Update Weights",
        },

        {
          id: 211,
          icon: "ClipboardList",
          pathname: "/hub/report/awb-detail-report",
          title: "AWB Details Report",
        },
        {
          id: 212,
          icon: "Calendar",
          pathname: "/hub/report/booking-summary-report",
          title: "Booking Summary Report",
        },
        {
          id: 451,
          icon: "UserCog",
          pathname: "/hub/report/ocr-kyc-log",
          title: "OCR Kyc Log",
        },
      ],
    },
    {
      id: 220,
      icon: "Scroll",
      pathname: "/hub/msme",
      title: "Msme",
    },
    {
      id: 25,
      icon: "Clipboard",
      pathname: "/hub/tracking",
      title: "Tracking",
    },
    {
      id: 456,
      icon: "Tablet",
      pathname: "/hub/approve_commercial_weight",
      title: "Approve Commercial Weight",
    },
    // {
    //   id: 25,
    //   icon: "Files",
    //   pathname: "/hub/bulkbooking",
    //   title: "Bulk Booking",
    // },
  ],
};

export const sideMenuSlice = createSlice({
  name: "sideMenu",
  initialState,
  reducers: {},
});

export const selectSideMenu = (state: RootState) => state.sideMenu.menu;

export default sideMenuSlice.reducer;
