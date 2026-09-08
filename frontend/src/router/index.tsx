import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import SideMenu from "../layouts/SideMenu";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard/main";
import Thankyou from "../pages/Thankyou";
import MachineThreshold from "../pages/hub_opereations/machine_threshold";
import WeightDimension from "../pages/hub_opereations/weight_dimension/index";
import ReverseShipment from "../pages/hub_opereations/reverse_shipment/index";
import CreateBag from "../pages/hub_opereations/create_bag/index";
import CreateManifest from "../pages/hub_opereations/create_manifest/index";
import ManifestInward from "../pages/hub_opereations/manifest_inward/manifest_inward";
import ManifestInscan from "../pages/hub_opereations/manifest_inscan/index";
import OnForwardShipment from "../pages/hub_opereations/on_forward_shipment/index";
import ShipmentSegregation from "../pages/hub_opereations/shipment_segregation/index";
import DirectShipment from "../pages/hub_opereations/direct_shipment/index";
import ReleaseShipment from "../pages/hub_opereations/release_shipment/index";
import ChangeVendor from "../pages/hub_opereations/change_vendor/index";
import ChangeWeight from "../pages/hub_opereations/change_weight/index";
import CustomerHouseMaster from "../pages/hub_opereations/customer_house_master/index";
import ManualAwbTagging from "../pages/hub_opereations/manual_awb_tagging/index";
import AddCourierStock from "../pages/hub_opereations/add_courier_stock/index";
import TagHouse from "../pages/hub_opereations/tag_house/index";
import AdditionalCharges from "../pages/hub_opereations/additional_charges/index";
import SpotPricing from "../pages/hub_opereations/spot_pricing_list/index";
import AuthenticateVendor from "../pages/hub_opereations/authenticate_vendor/index";
import GenerateDispatchLabel from "../pages/hub_opereations/generate_dispatch/index";
import Tracking from "../pages/hub_opereations/tracking/main";
import EditBooking from "../pages/hub_opereations/edit_booking/index";
import UpdateShipment from "../pages/hub_opereations/update_shipment/index";
import WalkinCustomer from "../pages/hub_opereations/walkin_customer/index";
import DebitCharges from "../pages/hub_opereations/debit_charges/index";
import { useEffect, useState } from "react";
import { useLogin } from "../components/LoginContext";
import { Auth_verify } from "../AllServices/services";
import LoadingIcon from "../base-components/LoadingIcon";
import InscanOutscanReport from "../pages/hub_opereations/inscan_outscan_report";
import ShipmentOnHold from "../pages/hub_opereations/shipment_on_hold";
import AwaitingShipment from "../pages/hub_opereations/awaiting_shipment_report";
import ShipmentNotDispatch from "../pages/hub_opereations/shipment_not_dispatch-report";
import ShipmentAwbRepository from "../pages/hub_opereations/shipment_awb_repository";
import DailyShipment from "../pages/hub_opereations/daily_shipment_inscan_outscan_report";
import UpdateWeights from "../pages/hub_opereations/update_weight_report";
import LoginAdmin from "../pages/hub_opereations/LoginAdmin";
import AWBDetailsReports from "../pages/hub_opereations/awb_details_report";
import BookingSummaryReport from "../pages/hub_opereations/booking_summary-report";
import Msme from "../pages/hub_opereations/Msme/msme";
import BulkBooking from "../pages/hub_opereations/bulk_booking";
import ErrorPages from "../pages/ErrorPages/index";
import CreateJob from "../pages/hub_opereations/spot_pricing_list/create_job_form";
import OpsDashboard from "../pages/hub_opereations/ops_dashboard";
import HeldUp from "../pages/hub_opereations/held_up";
import Checklist from "../pages/hub_opereations/checklist";
import RTO from "../pages/hub_opereations/Rto";
import RtoBookings from "../pages/hub_opereations/Rto_bookings";
import AWBchangeRequests from "../pages/hub_opereations/awbChangeRequests/awbchangeRequests";
import OCRKYCLog from "../pages/hub_opereations/ocr_kyc_log";
import Inscan2_0 from "../pages/hub_opereations/ShipmentScanEvents/Inscan2_0";
import DirectOutscan from "../pages/hub_opereations/ShipmentScanEvents/DirectOutScan";
import OrderSummary from "../pages/hub_opereations/ShipmentScanEvents/OrderSummary";
import ShipmentDetail from "../pages/hub_opereations/ShipmentDetailReport/shipment_details";
import EmiratesInvoiceUpload from "../pages/hub_opereations/emirates_invoice_upload";
import ApproveCommercialWeight from "../pages/hub_opereations/ApproveCommercialWeight";
import BulkShipmentOutscan from "../pages/hub_opereations/bulk_shipment_outscan";
import HeldUpRequest from "../pages/hub_opereations/heldup_request";

function Router() {
  const [loading, setLoading] = useState<boolean>(true);
  const [verify, setVerify] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, userdata, permissionid } = useLogin();
  const checkAuth = async () => {
    try {
      const check = await Auth_verify("auth/verify/2");
      if (
        check?.status !== 200 &&
        location.pathname != "/users/credential" &&
        location.pathname != "/confirmation"
      ) {
        navigate("/");
      } else {
        setVerify(true);
        login(check?.data?.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const createRoute = (path: any, element: any, requiredPermission?: any) => {
    // If no requiredPermission, always include the route
    if (!requiredPermission || permissionid?.includes(requiredPermission)) {
      return { path, element };
    }
    return null; // Exclude route if permission is not met
  };
  useEffect(() => {
    checkAuth();
  }, [location.pathname]);
  const findparticulardata = (id?: any) => {
    if (location.pathname !== "/") {
      const newdata = userdata?.role_permission.find(
        (item: any) => item?.p_id == id,
      );
      return newdata;
    }
  };
  const routes = (verify: boolean) => [
    {
      path: "/hub",
      element: <SideMenu />,
      children: [
        createRoute(
          "/hub/dashboard",
          permissionid?.includes(337) ? <OpsDashboard /> : <Dashboard />,
        ),

        createRoute("/hub/operation/inscan_2_0", <Inscan2_0 />, 146),
        createRoute("/hub/operation/direct_outscan", <DirectOutscan />, 146),

        createRoute("/hub/operation/order_summary", <OrderSummary />, 146),
        createRoute(
          "/hub/operation/weighing_machine_threshold",
          <MachineThreshold />,
          146,
        ),
        createRoute("/hub/operation/manifest_inward", <ManifestInward />, 16),
        createRoute("/hub/operation/direct_shipment", <DirectShipment />, 148),
        createRoute("/hub/operation/manifest_inscan", <ManifestInscan />, 17),
        createRoute("/hub/report/shipment_details", <ShipmentDetail />, 17),

        createRoute(
          "/hub/operation/weight_dimension",
          <WeightDimension />,
          147,
        ),
        createRoute("/hub/operation/reverse_shipment", <ReverseShipment />, 69),
        createRoute("/hub/operation/create_bag", <CreateBag />, 22),
        createRoute(
          "/hub/operation/onforward_shipment",
          <OnForwardShipment />,
          24,
        ),
        createRoute(
          "/hub/operation/shipment_segregation",
          <ShipmentSegregation />,
          18,
        ),
        createRoute("/hub/operation/create_manifest", <CreateManifest />, 23),
        createRoute("/hub/operation/release_shipment", <ReleaseShipment />, 21),
        createRoute("/hub/operation/change_vendor", <ChangeVendor />, 19),
        createRoute("/hub/operation/change_weight", <ChangeWeight />, 58),
        createRoute(
          "/hub/operation/customer_house_master",
          <CustomerHouseMaster />,
          150,
        ),
        createRoute(
          "/hub/operation/manual_awb_tagging",
          <ManualAwbTagging />,
          68,
        ),
        createRoute(
          "/hub/operation/add_courier_stock",
          <AddCourierStock />,
          151,
        ),
        createRoute("/hub/operation/tag_house", <TagHouse />, 152),
        createRoute(
          "/hub/accounts/additional_charge",
          <AdditionalCharges />,
          59,
        ),
        createRoute("/hub/accounts/debit_charge", <DebitCharges />, 149),
        createRoute(
          "/hub/operation/spot_pricing_list",
          <SpotPricing pdata={findparticulardata(371)} />,
          153,
        ),

        createRoute(
          "/hub/operation/change_requests",
          <AWBchangeRequests pdata={findparticulardata(372)} />,
          372,
        ),
        createRoute(
          "/hub/operation/authenticate_vendor_list",
          <AuthenticateVendor />,
          155,
        ),
        createRoute(
          "/hub/operation/generate_dispatch_label",
          <GenerateDispatchLabel />,
          154,
        ),
        createRoute("/hub/tracking", <Tracking />, 25),
        createRoute("/hub/operation/edit_booking", <EditBooking />, 103),
        createRoute("/hub/operation/update_shipment", <UpdateShipment />, 327),
        createRoute("/hub/walkin_customer", <WalkinCustomer />, 60),
        createRoute("/hub/report/inscan_outscan", <InscanOutscanReport />, 66),
        createRoute("/hub/report/shipment_on_hold", <ShipmentOnHold />, 26),
        createRoute("/hub/report/awaiting_shipment", <AwaitingShipment />, 27),
        createRoute("/hub/report/shipment_details", <ShipmentDetail />, 17),
        createRoute(
          "/hub/report/shipment_not_dispatch",
          <ShipmentNotDispatch />,
          28,
        ),
        createRoute(
          "/hub/report/shipment_awb_repository",
          <ShipmentAwbRepository />,
          67,
        ),
        createRoute(
          "/hub/report/Daily_shipment_inscan_vs_outscan",
          <DailyShipment />,
        ),
        createRoute("/hub/report/Update_weight", <UpdateWeights />),
        createRoute("/hub/operation/initiate-job", <CreateJob />),
        createRoute("/hub/report/awb-detail-report", <AWBDetailsReports />),
        createRoute(
          "/hub/report/booking-summary-report",
          <BookingSummaryReport />,
          212,
        ),
        createRoute("/hub/report/ocr-kyc-log", <OCRKYCLog />, 451),
        createRoute("/hub/msme", <Msme pdata={findparticulardata(220)} />, 220),
        createRoute("/hub/bulkbooking", <BulkBooking />),
        createRoute("/hub/operation/held_up_request", <HeldUpRequest />, 19),
        createRoute("/hub/operation/held_up", <HeldUp />, 330),
        createRoute("/hub/operation/checklist", <Checklist />, 331),
        createRoute("/hub/operation/rto", <RTO />, 332),
        createRoute("/hub/operation/bookings-rto", <RtoBookings />, 332),
        createRoute(
          "/hub/operation/emirates_invoice_upload",
          <EmiratesInvoiceUpload />,
          436,
        ),
        createRoute(
          "/hub/approve_commercial_weight",
          <ApproveCommercialWeight />,
          456,
        ),
        createRoute(
          "/hub/operation/bulk_shipment_outscan",
          <BulkShipmentOutscan />,
          457,
        ),
      ]?.filter(Boolean),
    },
    { path: "/", element: <Login /> },
    { path: "/confirmation", element: <Thankyou /> },
    {
      path: "/users/credential",
      element: <LoginAdmin />,
    },
    { path: "/confirmation", element: <Thankyou /> },
    { path: "*", element: <ErrorPages /> },
  ];
  return loading ? (
    <div className="flex items-center justify-center h-[100vh]">
      <LoadingIcon icon="grid" className="block w-[6%] " />
    </div>
  ) : (
    useRoutes(routes(verify))
  );
  // return useRoutes(routes());
}

export default Router;
