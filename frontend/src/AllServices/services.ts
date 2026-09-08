import axios from "axios";
import {
  LoginCredential,
  ChangePasswordData,
  ManifestNo,
  BagNo,
  ReverseShipmentData,
  CreateBagData,
  CloseBagData,
  ChargableWeightData,
  RemoveShipmentData,
  OnForwardShipmentData,
  ShortShipmentData,
  SegregationScanAirwaybill,
  ShipmentScanAirwaybill,
  GenerateManifestData,
  ReleaseShipmentData,
  HouseMasterData,
  TagAirwaybillData,
  TagHouseData,
  AdditionalChargeData,
  ReverseShipmentInscanData,
  sentAllData,
  sentAllData2,
} from "../DataTypes/dataTypes";

const hostname = window.location.hostname;
const middleURL = "/hub";
const bookURL = "/book";
const adminURL = "/admin";
const bookingURL = "/booking";
const report = "/report";
const masterURL = "/master";
const baseURL1 =
  hostname == "localhost" || hostname.includes("github")
    ? "http://localhost/api/v1/auth"
    : hostname == "devhub.skart-express.com"
      ? "https://devapiv2.skart-express.com/api/v1/auth"
      : "https://apiv2.skart-express.com/api/v1/auth";
export const baseURL =
  hostname == "localhost" || hostname.includes("github")
    ? "http://localhost/api/v1"
    : hostname == "devhub.skart-express.com"
      ? "https://devapiv2.skart-express.com/api/v1"
      : "https://apiv2.skart-express.com/api/v1";

axios.defaults.withCredentials = true;

const redirectToLogin = (status: number) => {
  return window.location.replace("/");
};

// login api
export const Login = async (data: LoginCredential) => {
  try {
    return await axios.post(baseURL1 + "/login/2", data);
  } catch (err: any) {
    return err;
  }
};

// logout api
export const Logout = async () => {
  try {
    return await axios.get(baseURL1 + "/logout");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Change password
export const ChangePassword = async (data: ChangePasswordData) => {
  try {
    return await axios.post(baseURL1 + "/change_password", data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get hub info
export const Get_hub_info = async (id: any) => {
  try {
    return await axios.get(baseURL + `/admin/hub/${id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get threshold limit
export const Get_threshold_limit = async (data: any) => {
  try {
    return await axios.get(baseURL + `/admin/hub/${data}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Post threshold limit
export const Put_threshold_limit = async (data: any) => {
  try {
    return await axios.put(baseURL + adminURL + "/hub-threshold", data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Weight Update Tolerance (0-10g)

export const post_weight_diff = async (data: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + "/weight_dimension/weight/diff",
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// GET Weight Update Tolerance (0-10g)

export const get_weight_diff = async () => {
  try {
    return await axios.get(
      baseURL + middleURL + "/weight_dimension/weight/diff",
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get weight dimension list
export const Weight_dimension_list = async (
  data: any,
  airway: any,
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/weight_dimension/${data}?limit=${limit}&offset=${page}&awb=${airway}`,
    );
  } catch (err: any) {
    console.log("error", err);
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// list export
export const Weight_dimension_export = async (data: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/report/booking-vs-scanned-report`,
      data,
    );
  } catch (err: any) {
    console.log("error", err);
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get weight dimension airwaybill list
export const Weight_dimension_airwaybill_no = async (data: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/weight_dimension/compare_dimension/${data}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Approve Single type weight dimension airwaybill list
export const Approve_weight_dimension = async (id: number) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/weight_dimension/approve_dimension/${id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Reject weight dimension airwaybill list
export const Reject_weight_dimension = async (id: number) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/weight_dimension/reject_dimension/${id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Approve single
export const Approve_single_multi = async (
  airwaybill_no: any,
  accept_reject: any,
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/weight_dimension/weight_dimension_accept_reject`,
      { airwaybill_no, accept_reject },
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Reject case
export const Reject_single_multi = async (data: any) => {
  if (data?.type == 1) {
    try {
      return await axios.get(
        baseURL + middleURL + `/weight_dimension/reject_dimension/${data?.id}`,
      );
    } catch (err: any) {
      if (err.response.status === 401) {
        redirectToLogin(err.response.status);
      }
      return err;
    }
  } else if (data?.type == 2) {
    try {
      return await axios.get(
        baseURL +
          middleURL +
          `/weight_dimension/reject_dimension/0/${data?.airwaybill_no}`,
      );
    } catch (err: any) {
      if (err.response.status === 401) {
        redirectToLogin(err.response.status);
      }
      return err;
    }
  }
};

export const Process_single_multi = async (data: any) => {
  // let approve_url = `${process.env.BASE_URL}hub/weight_dimension/threshold_approve2/${encoded}?is_ops=true`

  try {
    let encoded = btoa("awb=" + data);
    return await axios.get(
      baseURL +
        middleURL +
        `/weight_dimension/threshold_approve2/${encoded}?is_ops=true`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Delete weight dimension airwaybill No
export const Delete_Weight_airwaybill_no = async (id: any) => {
  try {
    return await axios.delete(baseURL + middleURL + `/weight_dimension/${id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Delete weight dimension
export const delete_single_multi = async (data: any) => {
  try {
    return await axios.delete(
      baseURL + middleURL + `/weight_dimension/void_scan_dimension/${data?.id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get inward manifest
export const Inward_manifest = async (
  hub_id: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/manifest_inward/${hub_id}?limit=${limit}&offset=${page}&value=${search}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get download inward manifest
export const Download_inward_manifest = async (manifest_id: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/manifest_inward/download/${manifest_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get incomplete manifest
export const Incomplete_manifest = async (
  hub_id: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/manifest_inscan/${hub_id}?limit=${limit}&offset=${page}&value=${search}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Inscan manifest
export const Inscan_manifest = async (ids: any, data: ManifestNo) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/manifest_inscan/${ids.emp_id}/${ids.hub_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//get  manifest no.
export const Get_manifest_no = async () => {
  try {
    return await axios.get(
      baseURL + middleURL + `/direct_shipment/manifest_no`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//manifest details download
export const Download_manifest_details = async (manifest_id: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/direct_shipment/manifest_details/${manifest_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//manifest_remaining_airwaybill_download
export const Download_rest_manifest_no = async (data: any) => {
  try {
    return await axios.post(
      baseURL +
        middleURL +
        `/direct_shipment/manifest_remaining_airwaybill_download`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Inscan bag
export const Inscan_bag = async (ids: any, data: BagNo) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/bag_inscan/${ids.emp_id}/${ids.hub_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get status code list
export const Status_code_list = async () => {
  try {
    return await axios.get(baseURL + "/track_shipment/");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Direct shipment inscan
export const Direct_inscan_airwaybill = async (
  ids: any,
  data: ShipmentScanAirwaybill,
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/direct_shipment/${ids.hub_id}/${ids.emp_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Inscan Shipment new
export const Inscan_shipment = async (data: sentAllData) => {
  try {
    return await axios.post(baseURL + middleURL + `/direct_shipment`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Delete Inscan
export const Delete_Inscan = async (
  airwaybill_no?: string,
  dispatch_status_code?: string,
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/direct_shipment/revert_inscan_shipment/${airwaybill_no}/${dispatch_status_code}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Outscan Shipment new
export const Outscan_shipment = async (data: sentAllData2) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/direct_shipment/outscan`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Segregation Inscan Bag
export const Segregation_inscan_bag = async (data: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/segregation/${data.hub_id}/${data.bag_no}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Incomplete segregation list
export const Incomplete_segregation = async (
  hub_id: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/segregation/${hub_id}?limit=${limit}&offset=${page}&value=${search}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//short shipment in segregation
export const Short_shipment = async (ids: any, data: ShortShipmentData) => {
  try {
    return await axios.post(
      baseURL +
        middleURL +
        `/segregation/short_shipment/${ids.hub_id}/${ids.emp_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//inscan airwaybill in segregation
export const Segregation_inscan_airwaybill = async (
  ids: any,
  data: SegregationScanAirwaybill,
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/segregation/${ids.hub_id}/${ids.emp_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//reverse the shipment
export const Reverse_shipment = async (ids: any, data: ReverseShipmentData) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/reverse_shipment/${ids.hub_id}/${ids.emp_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//reverse shipment inscan
export const Reverse_shipment_inscan = async (
  ids: any,
  data: ReverseShipmentInscanData,
) => {
  try {
    return await axios.post(
      baseURL +
        middleURL +
        `/reverse_shipment/inscan/hold/${ids.emp_id}/${ids.hub_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get reversed shipments list
export const Reversed_shipment_list = async (
  hub_id: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/reverse_shipment/${hub_id}?limit=${limit}&offset=${page}&value=${search}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get release held up shipment list
export const Release_held_up_shipment_list = async () => {
  try {
    return await axios.get(
      baseURL + `/track_shipment/release_hub_held_up/list`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get held up shipment list
export const Held_up_shipment_list = async (
  hub_id: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/release_shipment/${hub_id}?limit=${limit}&offset=${page}&value=${search}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// release shipment
export const Release_shipments = async (
  ids: any,
  data: ReleaseShipmentData,
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/release_shipment/${ids.hub_id}/${ids.emp_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// create held up request
export const Create_held_up_request = async (data: any) => {
  try {
    return await axios.post(baseURL + middleURL + `/held_up_request`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get held up request shipment list
export const Held_up_request_list = async (
  search: string = "",
  limit: number = 10,
  page: number = 0,
  from_date: string = "",
  to_date: string = "",
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/held_up_request/shipment/list?limit=${limit}&page=${page}&value=${search}&from_date=${from_date}&to_date=${to_date}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Create bag number and type list
export const Bag_no_and_type = async (hub_id: any, seal: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/create_bag/number/${hub_id}/${seal}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get created bag list
export const Created_bag_list = async (hub_id: any) => {
  try {
    return await axios.get(baseURL + middleURL + `/created_bag_list/${hub_id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get incomplete created bag list
export const Incomplete_bag_shipment_list = async (hub_id: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/create_bag/incomplete_shipment/${hub_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get pending bag list
export const Create_bag_pending_list = async (hub_id: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/create_bag/pending/${hub_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get data list acc. to type
export const Type_value_list = async (type: any) => {
  try {
    return await axios.get(
      baseURL +
        "/admin/" +
        `${
          type == 4
            ? "regional-hub"
            : type == 2
              ? "hub-pud"
              : type == 3
                ? "hub"
                : "courier-product"
        }`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Create bag
export const Create_bag = async (ids: any, data: CreateBagData) => {
  try {
    return await axios.post(
      baseURL +
        middleURL +
        `/create_bag/${ids.hub_id}/${ids.emp_id}/${ids.seal}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get airwaybill courier
export const Check_airwaybill_courier = async (airwaybill_no: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/create_bag/check_courier/${airwaybill_no}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get route matrix
export const Route_matrix = async (data: any) => {
  try {
    return await axios.post(baseURL + adminURL + `/get-route`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get shipment bag inscan list
export const Shipment_inscan_list = async (bag_no: any, hub_id: any) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/create_bag/bag_shipment_inscan/${hub_id}/${bag_no}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get bag Chargable weight list
export const Chargable_weight_list = async (data: ChargableWeightData) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/create_bag/chargable_weight`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Generate create bag pdf
export const Generate_create_bag_pdf = async (data: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/create_bag/generate/${data}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Close bag
export const Close_bag = async (ids: any, data: CloseBagData) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/close_bag/${ids.hub_id}/${ids.emp_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Remove shipment from bag
export const Remove_bag_shipment = async (
  hub_id: any,
  data: RemoveShipmentData,
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/bag_remove_shipment/${hub_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get created manifest list
export const Created_manifest_list = async (
  hub_id: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/manifest_list/${hub_id}?limit=${limit}&offset=${page}&value=${search}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// create manifest
export const Create_manifest = async (hub_id: any) => {
  try {
    return await axios.get(baseURL + middleURL + `/create_manifest/${hub_id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
//widect bag
export const Create_widect_bag = async (data: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/widect/create_manifest`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Generate manifest
export const Generate_manifest = async (
  ids: any,
  data: GenerateManifestData,
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/create_manifest/${ids.hub_id}/${ids.emp_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// download created manifest
export const Download_create_manifest_pdf = async (manifest_id: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/create_manifest/download/pdf/${manifest_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// onforward pending list
export const Pending_onforward_Shipment = async (
  hub_id: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/on_forward/${hub_id}?limit=${limit}&offset=${page}&value=${search}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// onforward customer detail
export const Get_contact_detail = async (mobile_no: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/on_forward/customer_detail/${mobile_no}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// onforward shipment
export const On_forward_shipment = async (
  ids: any,
  data: OnForwardShipmentData,
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/on_forward/${ids.hub_id}/${ids.emp_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// change vendor get shipment details

export const Shipment_details = async (
  airwaybill_no: string,
  route: number,
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/change_vendor/shipment_details/${route}`,
      { airwaybill_no },
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// change vendor get document type
export const Get_document_type = async () => {
  try {
    return await axios.get(baseURL + bookURL + `/document_type`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// change vendor get gst applicable
export const Get_gst_applicable = async () => {
  try {
    return await axios.get(baseURL + bookURL + `/gst_applicable`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// change vendor get tax payment
export const Get_tax_payment = async () => {
  try {
    return await axios.get(baseURL + bookURL + `/tax_payment`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// change vendor get export type
export const Get_export_type = async () => {
  try {
    return await axios.get(baseURL + bookingURL + `/get_export_type`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// change vendor get flm data
export const Get_skynet_service_code_api = async (
  shipment_type: string,
  consignee_country: string,
) => {
  try {
    return await axios.post(baseURL + bookURL + `/get_service_code`, {
      shipment_type,
      consignee_country,
    });
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// change vendor get flm data
// export const Get_flm_data = async (origin_pincode: string) => {
//   try {
//     return await axios.get(
//       baseURL + adminURL + `/pud-address?pincode=${origin_pincode}`
//     );
//   } catch (err: any) {
//     if (err.response.status === 401) {
//       redirectToLogin(err.response.status);
//     }
//     return err;
//   }
// };

// change vendor get pickup time
// export const Get_pickup_time = async () => {
//   try {
//     return await axios.get(baseURL + bookURL + `/get_time`);
//   } catch (err: any) {
//     if (err.response.status === 401) {
//       redirectToLogin(err.response.status);
//     }
//     return err;
//   }
// };

// check change vendor Available credit Limit
export const Check_available_credit_limit = async (
  franchisee_id: any,
  shipment_rates: number,
  airwaybill_no: number,
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/change_vendor/check_available_credit_limit`,
      { franchisee_id, shipment_rates, airwaybill_no },
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// change vendor API
export const Change_vendor_api = async (data: any) => {
  try {
    return await axios.post(baseURL + middleURL + `/change_vendor`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// change vendor price comparison
export const Price_comparison = async (data: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/change_vendor/price_comparison/`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Change Weight API
export const Change_weight = async (hubId: string, data: any, emp_id: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/change_weight/${hubId}?user_id=${emp_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Change weight get Vendor Name
export const Get_vendor_name = async (courier_id: string) => {
  try {
    return await axios.get(
      baseURL + adminURL + `/courier-product/0/${courier_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// customer house master list
export const Customer_house_master_list = async (hub_id: any) => {
  try {
    return await axios.get(baseURL + middleURL + `/house_master/${hub_id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get state list
export const Get_state = async () => {
  try {
    return await axios.get(baseURL + `/master/state/99`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//get city list
export const Get_city = async (id: any) => {
  try {
    return await axios.get(baseURL + `/master/city/99/${id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Post customer house master
export const Customer_house_master = async (
  hub_id: any,
  data: HouseMasterData,
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/house_master/${hub_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Manual awb tagging check airwaybill number
export const Manual_awb_tagging_check_airwaybill = async (
  airwaybill_no: any,
) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/airwaybill_tagging/${airwaybill_no}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const AwbDatafranchiseename = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/franchisee-settings`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const AwbDataSalesname = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/sales-person`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const Countrydestination = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/country`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const branchId = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/hub-pud`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
// Manual awb tagging post
export const Manual_awb_tagging = async (data: any) => {
  try {
    return await axios.post(baseURL + middleURL + `/tag_airwaybill`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get Courier stock list
export const Courier_stock_list = async (
  id: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/add_courier_stock/${id}?limit=${limit}&offset=${page}&value=${search}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Add Courier stock
export const Add_courier_stock = async (id: any, formData: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/add_courier_stock/${id}`,
      formData,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//tagged house list
export const Tagged_house_list = async (
  id: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/tagged_house_list/${id}?limit=${limit}&offset=${page}&value=${search}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// tag house for csv
export const Tagged_house_csv = async (id: any) => {
  try {
    return await axios.get(baseURL + middleURL + `/tagged_house_list/${id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get tag house dropdown
export const Tag_house_dropdown = async (id: any, search?: any) => {
  console.log("are", id);
  try {
    return await axios.get(
      baseURL +
        middleURL +
        `/tag_house/${id}${search ? `?value=${search}` : ""}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Tag house
export const Tag_house = async (id: any, data: TagHouseData) => {
  try {
    return await axios.post(baseURL + middleURL + `/insert_tag/${id}`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Untag house
export const Untag_house = async (id: any) => {
  try {
    return await axios.get(baseURL + middleURL + `/untag_house/${id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Edit house detail
export const Edit_house_detail = async (id: any) => {
  const data: any = { pickup_id: id };
  try {
    return await axios.post(
      baseURL + bookURL + `/getBookingCommercialData`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// post house detail
export const Post_house_detail = async (data: any) => {
  try {
    return await axios.post(
      baseURL + bookURL + `/updateBookingCommercialData`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get additional charge drop down
export const Charge_head_drop_down = async (is_cargo: any = "") => {
  try {
    return await axios.get(
      baseURL + adminURL + `/charges?type=E&is_cargo=${is_cargo}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// add additional charge
export const Additional_charges = async (data: AdditionalChargeData) => {
  try {
    return await axios.post(baseURL + `/book/add_charges`, data);
  } catch (err: any) {
    if (err.response) {
      if (err.response.status === 401) {
        redirectToLogin(err.response.status);
      }
      return err.response;
    } else {
      return err;
    }
  }
};

// get additional charge list
export const Get_Additional_list = async () => {
  try {
    return await axios.get(baseURL + `/booking/get_additional_charges_list`);
  } catch (err: any) {
    if (err.response) {
      if (err.response.status === 401) {
        redirectToLogin(err.response.status);
      }
      return err.response;
    } else {
      return err;
    }
  }
};

// get debit charge list
export const Get_Debit_list = async () => {
  try {
    return await axios.get(baseURL + `/booking/get_debit_charges_list`);
  } catch (err: any) {
    if (err.response) {
      if (err.response.status === 401) {
        redirectToLogin(err.response.status);
      }
      return err.response;
    } else {
      return err;
    }
  }
};

// Forgot Password Send Otp
export const Forgot_pass_send_otp = async (username: string) => {
  try {
    return await axios.get(baseURL + `/auth/otp/${username}/2`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Forgot Password Verify Otp
export const Forgot_pass_verify_otp = async (username: string, otp: any) => {
  try {
    return await axios.post(baseURL + `/auth/otp/${username}`, { otp });
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get spot enquiry
export const Get_spot_list = async (
  id: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
  f_id: any = 0,
  from_date: number = 0,
  to_date: number = 0,
  status: string = "",
) => {
  try {
    return await axios.get(
      baseURL +
        `/booking/get_spot_enquiry_hub/${id}?key=${search}&limit=${limit}&page=${page}&franchisee_id=${f_id}&from_date=${from_date}&to_date=${to_date}&status=${status}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get vendor for spot enquiry
export const Get_vendor = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/courier-product`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//get franchisee for spot pricing
export const Get_franchise = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/franchisee-settings`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
//get dispatch status
export const Get_dispatch_status = async () => {
  try {
    return await axios.get(baseURL + `/track_shipment/0`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
//get awb dimension reports
export const Get_search_awb_detail_report = async (
  endpoint: string,
  data: any,
) => {
  try {
    return await axios.post(baseURL + `/book/${endpoint}`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
export const Get_doctype = async () => {
  try {
    return await axios.get(baseURL + bookURL + `/document_type`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//get shipment for spot pricing
export const Get_shipment = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/booking-shipment-type`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get country for spot  pricing
export const Get_country = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/country`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get approval type spot pricing
export const Get_approval = async () => {
  try {
    return await axios.get(
      baseURL + middleURL + `/spot_pricing/approval_type_list`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get franchisee details
export const Get_franchisee_details = async (franchisee_id: any) => {
  try {
    return await axios.get(
      baseURL + adminURL + `/franchisee-settings/${franchisee_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Post spot  enquiry
export const Spot_form_submit = async (data: any) => {
  try {
    return await axios.post(baseURL + middleURL + `/spot_pricing`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get authenticate vendor list
export const Get_vendor_list = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/courier-product/0`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//get checkbox data authenticate vendor  list
export const Get_enable_vendor_btn = async (id: any) => {
  try {
    return await axios.get(baseURL + adminURL + `/hub/${id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// put checkbox data authenticate  vendor list
export const Put_authenticate_vendor = async (data: any) => {
  try {
    return await axios.put(baseURL + adminURL + `/hub-couriers`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// generate dispatch
export const Generate_dispatch = async (data: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/create_bag/generate/${data}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Tracking
export const Get_tracking = async (awbno: string) => {
  try {
    return await axios.get(
      baseURL + `/track_shipment/track-shipment/${awbno?.trim()}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
export const Courierget = async (data: string) => {
  try {
    return await axios.get(baseURL + adminURL + `/courier-product/0/${data}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
// walk in customer
export const Get_walkin_customer = async (
  id: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.get(
      baseURL +
        bookingURL +
        `/booking_summary_hub_wise_data/${id}?key=${search}&limit=${limit}&page=${page}`,
    );
  } catch (err: any) {
    return err;
  }
};

// walk in customer  for kyc
export const Get_kyc_document = async () => {
  try {
    return await axios.get(baseURL + bookURL + `/get_orgnization_document`);
  } catch (err: any) {
    return err;
  }
};
// walk in customer  for kyc
export const Get_kyc_organization = async () => {
  try {
    return await axios.get(baseURL + bookURL + `/get_orgnization`);
  } catch (err: any) {
    return err;
  }
};

// walk in customer search
export const WalkIn_customer_search = async (data: any) => {
  try {
    const result = await axios.post(
      baseURL + bookingURL + `/booking_summary_other`,
      data,
    );
    return result;
  } catch (err: any) {
    return err;
  }
};

// Edit Booking get shipment details
export const Editbooking_details = async (
  airwaybill_no: string,
  is_emirates: any = "",
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/edit_booking/shipment_details/`,
      { airwaybill_no, is_emirates },
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// edit booking price comparison
export const Editbooking_Price_comparison = async (data: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/edit_booking/price_comparison/`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// check edit booking Available credit Limit
export const Check_acl = async (
  franchisee_id: any,
  shipment_rates: number,
  airwaybill_no: number,
) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/edit_booking/check_available_credit_limit`,
      { franchisee_id, shipment_rates, airwaybill_no },
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Weight Unit
export const Get_Weight_Unit = async () => {
  try {
    return await axios.get(baseURL + bookURL + "/weight_unit");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Length Unit
export const Get_Length_Unit = async () => {
  try {
    return await axios.get(baseURL + bookURL + "/length_unit");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Currency Data
export const Get_Currency = async () => {
  try {
    return await axios.get(baseURL + "/booking/currency");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const Get_Currency_exchange = async () => {
  try {
    return await axios.get(baseURL + adminURL + "/currency-exchange");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
// Bag Data for widect
export const Get_bag_data = async (key: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/widect/bag_for_manifest?value=${key}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const Get_invoice = async () => {
  try {
    return await axios.get(baseURL + adminURL + "/invoice-term");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
// shipment onhold report
export const Shipment_on_hold = async (
  id: any,
  data: any,
  search: any,
  page: any,
) => {
  try {
    const result = await axios.post(
      baseURL +
        middleURL +
        `/report/shipment_on_hold/${id}?limit=10&offset=${page || ""}&value=${
          search || ""
        }`,
      data,
    );
    return result;
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// awaiting shipment report
export const Awaiting_shipment_report = async (id: any) => {
  try {
    return await axios.get(
      baseURL + bookingURL + `/booking_branch_details/${id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Edit Booking API
export const Edit_booking_api = async (data: any) => {
  try {
    return await axios.post(baseURL + middleURL + `/edit_booking`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Branch List
export const Awaiting_pud_branch = async () => {
  try {
    return await axios.get(baseURL + adminURL + "/hub-pud");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Shipment_not_dispatch_report
export const Shipment_not_dispatch_report = async (id: any) => {
  try {
    return await axios.get(
      baseURL + middleURL + `/report/shipment_not_dispatch/${id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Inscan outscan report
export const Inscan_outscan_report = async (
  data: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.post(
      baseURL +
        middleURL +
        `/report/inscan_outscan?limit=${limit}&offset=${page}&value=${search}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// inscan outscan csv report
export const Inscan_outscan_csv = async (data: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/report/inscan_outscan`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// inscan outscan search report
export const Inscan_outscan_search = async (
  data: any,
  search: string = "",
  limit: number = 20,
  page: number = 0,
) => {
  try {
    return await axios.post(
      baseURL +
        middleURL +
        `/report/inscan_outscan?limit=${limit}&offset=${page}&value=${search}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// inscan outscan search full
export const Inscan_outscan_search_full = async (data: any = "") => {
  try {
    return await axios.post(
      baseURL +
        middleURL +
        `/report/inscan_outscan?limit=20&offset=0&value=${data?.search}`,
      // baseURL + bookURL + `/inscannedVsOutscanned_search`, search
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
// Inscan outscan date
export const Inscan_outscan_date = async (data: any) => {
  try {
    return await axios.post(
      baseURL + `/track_shipment/reportInscanOutscan`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
// Inscan outscan report update
export const Inscan_outscan_report_approval = async (data: any) => {
  try {
    return await axios.post(
      baseURL + bookURL + `/inscannedVsOutscanned_update`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Inscan outscan report delete doc
export const Inscan_outscan_report_delete_doc = async (data: any) => {
  try {
    return await axios.post(
      baseURL + bookURL + `/inscannedVsOutscanned_delete`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// shipment awb report
export const Shipment_awb_report = async (data: any, id: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/report/shipment_for_awb_repository/${id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// daily shipment inscan and outscan dropdown
export const Get_daily_inscan_option = async () => {
  try {
    return await axios.get(
      baseURL + middleURL + `/report/daily_shipment_inscan_outscan/dropdown`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Upload kyc Data
export const UpdateKycApi = async (kycData: any) => {
  try {
    return await axios.post(baseURL + bookURL + `/upload_kyc`, kycData);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// daily shipment inscan outscan
export const DailyShipmentInscanOutscan = async (data: any, hub_id: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/report/daily_shipment_inscan_outscan/${hub_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// inscan vs outscan  doc update
export const UploadKycApi = async (data: any) => {
  try {
    return await axios.post(
      baseURL + bookURL + `/inscannedVsOutscanned_dcoUpdate`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// upload shipper invoice
export const UploadShipperInvoice = async (data: any) => {
  try {
    return await axios.post(
      baseURL + bookURL + `/inscannedVsOutscanned_invoice`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Auth verify
export const Auth_verify = async (endpoint?: any) => {
  try {
    return await axios.get(baseURL + `/${endpoint}`);
  } catch (err: any) {
    return err;
  }
};

// india pincodes
export const getLocalPincodeApi = async (pincode: any) => {
  try {
    return await axios.get(baseURL + adminURL + `/domestic-pincode/${pincode}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// international zipcodes
export const getPincodeApi = async (countryCode: string, zipCode = "") => {
  try {
    return await axios.get(
      baseURL +
        adminURL +
        `/international-pincode?country_code=${countryCode}&zipcode=${zipCode}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// international zipcodes, city & state
export const getCityStatesApi = async (
  countryCode: string,
  zipcode = "",
  city = "",
) => {
  try {
    return await axios.get(
      baseURL +
        adminURL +
        `/international-pincode?country_code=${countryCode}&zipcode=${zipcode}&city=${city}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const getConsignerDetailsApi = async (
  mobileNo: string,
  import_booking: any = 1,
) => {
  try {
    return await axios.post(baseURL + bookURL + `/get_consigner_data`, {
      consigner_mobile_number: mobileNo,
      import_booking,
    });
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const getConsigneeDetailsApi = async (
  mobileNo: string,
  import_booking: any = 1,
) => {
  try {
    return await axios.post(baseURL + bookURL + `/get_consignee_data`, {
      consignee_mobile_number: mobileNo,
      import_booking,
    });
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// update weights
export const UpdateWeights = async (data: any, hub_id: Number) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/report/updated_weights?hub_id=${hub_id}`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// booking summary report
export const Booking_summary_report = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/franchisee-settings`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// booking summary country
export const Booking_summary_country_report = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/country`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// booking summary courier product
export const Booking_summary_courier_report = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/courier-product`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// booking summary hub pud
export const Booking_summary_hubpud_report = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/hub-pud`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// booking summary sales person
export const Booking_summary_salesperson_report = async () => {
  try {
    return await axios.get(baseURL + adminURL + `/hub-pud`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// booking summary direct party
export const BookingDirectParty = async (data: any) => {
  try {
    return await axios.post(
      baseURL + bookingURL + `/direct_party_booking_summary_v1`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// booking summary tracking shipment
export const BookingTracking = async (data: any) => {
  try {
    return await axios.post(
      baseURL + `/track_shipment/report/status-report`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// booking summary party summary
export const BookingPartySummary = async (data: any) => {
  try {
    return await axios.post(
      baseURL + bookingURL + `/direct_party_booking_summary`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
// tag house print list
export const Print_house_list = async (data: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/change_vendor/get_house_data`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
// user name password for super admin
export const userNamePassword = async () => {
  try {
    return await axios.get(baseURL1 + `/user_name_password`);
  } catch (err: any) {
    if (err.response.status === 401) {
      window.location.replace("/users/credential");
    }
    return err;
  }
};

export const common_post = async (endpoint?: any, data?: any) => {
  try {
    return await axios.post(baseURL + endpoint, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
export const common_put = async (endpoint?: any, data?: any) => {
  try {
    return await axios.put(baseURL + endpoint, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
export const common_get = async (endpoint?: any, params?: any) => {
  try {
    return await axios.get(baseURL + endpoint, params);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Get tax slab
export const Get_tax_slab = async () => {
  try {
    return await axios.get(baseURL + masterURL + `/tax`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Bulk Booking

// CSV Data Listing
export const Get_book_csv_list = async (
  franchise_id: any,
  limit: any = 10,
  page: any = 0,
  status: any = "",
) => {
  try {
    return await axios.get(
      baseURL +
        bookingURL +
        `/book-csv?limit=${limit}&page=${page}&franchise_id=${franchise_id}&status=${status}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// CSV Booking Dashboard
export const Get_book_dashboard = async (franchisee_id: any = "") => {
  try {
    return await axios.get(
      baseURL +
        bookingURL +
        `/book-csv-dashboard?franchisee_id=${franchisee_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//GET job listing
export const Get_Job_list = async (
  data: any,
  search: any = "",
  franchisee_id: any = "",
  destination_country: any = "",
  weight: any = "",
) => {
  try {
    return await axios.get(
      baseURL +
        `/booking/job-list?key=${search}&franchisee_id=${franchisee_id}&destination_country=${destination_country}&weight=${weight}`,
      {
        params: data,
      },
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//GET spot enquiry listing
export const Get_Enquiry_list = async (
  params: any,
  body: any,
  search: any = "",
  weight: any = "",
  dest_country_id: any = "",
) => {
  try {
    return await axios.post(
      baseURL +
        `/booking/get_spot_enquiry?key=${search}&weight=${weight}&dest_country_id=${dest_country_id}`,
      body,
      { params: params },
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Request For Credit Limit
export const requestForCreditLimit = async (Data: any) => {
  try {
    return await axios.post(baseURL + bookingURL + `/update_spot_data`, Data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Request For Release Shipment
export const requestForReleaseShipment = async (Data: any) => {
  try {
    return await axios.put(baseURL + bookingURL + `/release-hub`, Data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// checklist

// Upload Checklist Docs
export const UploadChecklist_Api = async (data: any) => {
  try {
    return await axios.put(
      baseURL + bookingURL + `/upload-checklist-docs`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Mail Checklist Docs
export const MailChecklist_Api = async (data: any) => {
  try {
    return await axios.put(baseURL + bookingURL + `/checklist-mail`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Approve Checklist Api
export const ApproveChecklist_Api = async (data: any) => {
  try {
    return await axios.put(baseURL + bookingURL + `/checklist-done`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Shipping Bill Api
export const ShippingBill_Api = async (data: any) => {
  try {
    return await axios.put(baseURL + bookingURL + `/shipping-bill`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// heldUp
export const HeldUp_Api = async (enquiry_id: any = "", remark: any = "") => {
  try {
    return await axios.put(baseURL + bookingURL + `/held-up-hub`, {
      enquiry_id,
      remark,
    });
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// DELETE JOB

export const Delete_job = async (job_id: any) => {
  try {
    return await axios.delete(baseURL + bookingURL + `/delete-job/${job_id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//GET job count for dashboard
export const Get_Job_Count = async () => {
  try {
    return await axios.get(baseURL + `/booking/job-count`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
//GET spot enquiry count for dashboard
export const Get_Spot_Count = async () => {
  try {
    return await axios.get(baseURL + `/booking/get-spot-enquiry-count`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Tag House / Master

export const Tag_house_master = async (data: any) => {
  try {
    return await axios.post(baseURL + bookingURL + `/execute-enquiry`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Tag House / Master

export const Add_scan_events = async (data: any) => {
  try {
    return await axios.post(baseURL + bookingURL + `/add-scan-event`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Generate Booking
export const Generate_booking = async (job_id: any, counter: any, extraData: any = {}) => {
  try {
    return await axios.post(
      baseURL + bookingURL + `/generate-booking/${job_id}`,
      { counter: counter || 0, ...extraData },
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const Raise_spot_enquiry = async (payload: any) => {
  try {
    return await axios.post(baseURL + bookingURL + "/raise_spot_enquiry", payload);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// generate proforma invoice
export const Get_proforma_invoice = async (job_id: any) => {
  try {
    return await axios.get(
      baseURL + bookingURL + `/proforma-invoice/${job_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// generate house draft
export const Get_house_draft = async (job_id: any) => {
  try {
    return await axios.get(
      baseURL + bookingURL + `/generate-house-draft/${job_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// generate house
export const Get_house = async (job_id: any) => {
  try {
    return await axios.get(baseURL + bookingURL + `/print-house/${job_id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Update HAWB API
export const UpdateHawbApi = async (data: any) => {
  try {
    return await axios.put(baseURL + bookingURL + `/update-consignee`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Cargo Events
export const Get_Cargo_Events = async () => {
  try {
    return await axios.get(baseURL + "/track_shipment/cargo-events");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get Billed Outstanding
export const Billed_Outstanding = async (franchisee_id: any) => {
  try {
    return await axios.post(baseURL + bookURL + `/getUnbilledAmount`, {
      franchisee_id: franchisee_id,
    });
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get Unbilled Outstanding
export const Unbilled_Outstanding = async (franchise_id: any) => {
  try {
    return await axios.post(baseURL + `/invoice/billed-outstanding`, {
      franchise_id: franchise_id,
    });
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Send HAWB Email
export const sendHawbEmail = async (job_id: any) => {
  try {
    return await axios.get(
      baseURL + bookingURL + `/send-signed-house/${job_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Request For Upload Signed House
export const requestForUploadSignedHouse = async (Data: any) => {
  try {
    return await axios.put(baseURL + bookingURL + `/upload-signed-house`, Data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get Job Data
export const GetJobApi = async (job_id: any) => {
  try {
    return await axios.get(baseURL + bookingURL + `/get-job-details/${job_id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Cargo Type
export const Get_Cargo_Type = async () => {
  try {
    return await axios.get(baseURL + bookURL + "/cargo_type");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Clearance Type
export const Get_Clearance_Type = async () => {
  try {
    return await axios.get(baseURL + bookURL + "/clearence_type");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Incoterm
export const Get_Incoterm = async () => {
  try {
    return await axios.get(baseURL + bookURL + "/incoterm");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Commodity Type
export const Get_Commodity_Type = async () => {
  try {
    return await axios.get(baseURL + adminURL + "/commodity-type");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Service Type
export const Get_Service_Type = async () => {
  try {
    return await axios.get(baseURL + bookingURL + "/service_type_list");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Update Job Data
export const UpdateJobApi = async (Data: any) => {
  try {
    return await axios.post(baseURL + bookingURL + `/update-job`, Data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get Charges Data
export const GetChargesApi = async (id: any) => {
  try {
    return await axios.get(
      baseURL + bookingURL + `/get-enquiry-buy-sell/${id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//get master customer type data
export const Get_customer_type = async () => {
  try {
    return await axios.get(baseURL + masterURL + `/customer-type-data_ac/2`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Commercial shipment inscan
export const Commercial_inscan_airwaybill = async (job_id: any) => {
  try {
    return await axios.get(baseURL + bookingURL + `/inscan-job/${job_id}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//POST job create
export const Create_Job = async (data: any) => {
  try {
    return await axios.post(baseURL + `/booking/create-job-hub`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// RTO get shipment details
export const Rto_booking_details = async (airwaybill_no: string) => {
  try {
    return await axios.post(baseURL + middleURL + `/rto/shipment_details/`, {
      airwaybill_no,
    });
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// get job type for initiate job
export const Get_Job_Type = async () => {
  try {
    return await axios.get(baseURL + bookingURL + `/job-type`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// RTO Booking API
export const Rto_booking_api = async (data: any) => {
  try {
    return await axios.post(baseURL + middleURL + `/rto/on_hold`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// RTO Booking API
export const Rto_listing_api = async (data: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/rto/rto_on_hold_list`,
      data,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get Charegeable Weight
export const Get_Chargeable_Weight = async (courier_id: any = "") => {
  try {
    return await axios.get(
      baseURL + adminURL + `/product-settings/${courier_id}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Purpose of Shipment Dropdown API
export const purposeOfShipmentApi = async () => {
  try {
    return await axios.get(baseURL + bookURL + "/get_shipment_purpose");
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Fair Master Data Api
export const Get_Fair_Master = async (
  fair_id: any = "",
  fair_name: any = "",
) => {
  try {
    return await axios.get(
      baseURL +
        adminURL +
        `/fair_exhibition/fair_list?fair_id=${fair_id}&fair_name=${fair_name}`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//check prohibited hsncode
export const check_prohibited_hsncode = async (data: any) => {
  try {
    return await axios.post(baseURL + bookURL + `/get_prohibited_code`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Pga hsncode Api
export const Pga_hsncode_Api = async (data: any) => {
  try {
    return await axios.post(baseURL + bookURL + `/get_pga_htscodes`, data);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
//get franchisee for overseas
export const Get_franchise_overseas = async () => {
  try {
    return await axios.get(
      baseURL + masterURL + `/entity?cpy_id=1&type_data=72`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Upload Emirates Invoice
export const Upload_Emirates_Invoice = async (formData: any) => {
  try {
    return await axios.post(
      baseURL + bookURL + `/emirates_invoice_data`,
      formData,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const get_booking_status_list = async () => {
  try {
    return await axios.get(baseURL + bookingURL + `/enquiry_status`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const common_delete = async (endpoint?: any, params?: any) => {
  try {
    return await axios.delete(baseURL + endpoint, params);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};
// OCR KYC LOG

export const OcrKycLogApi = async (
  page: any = 0,
  from_date: any = "",
  to_date: any = "",
  airwaybill_no: any = "",
) => {
  try {
    return await axios.post(
      baseURL + bookingURL + `/get_ocr_data?page=${page}&limit=20`,
      {
        from_date,
        to_date,
        airwaybill_no,
      },
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// approve or reject integrator change weight request list
export const postIntegratorChange_weight = async (params: {
  from?: string;
  to?: string;
  limit?: number;
  page?: number;
  f_id?: string;
  key?: string;
}) => {
  try {
    return await axios.post(
      baseURL + bookingURL + `/list-waiting-integrator-change_weight`,
      null,
      { params },
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const Delhi_shipment_count = async () => {
  try {
    return await axios.get(
      baseURL + middleURL + `/report/hub_del/inscan_outscan`,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get all user list
export const GetAllUserList = async () => {
  try {
    return await axios.get(baseURL + `/auth/user`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// approve or reject integrator change weight request approve or reject integrator change weight
export const postIntegratorAcceptReject = async (
  row_id: number,
  action: 1 | 2,
) => {
  try {
    return await axios.get(
      baseURL + bookingURL + `/integrator-accept-reject/${row_id}/${action}`,
      { params: { is_mail_check: 1 } },
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

export const Get_Aramex_Product = async () => {
  try {
    return await axios.get(baseURL + bookingURL + `/get_aramex_product`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// bulk shipment outscanned
export const Bulk_shipment_outscan = async (formData: any) => {
  try {
    return await axios.post(
      baseURL + middleURL + `/on_forward/bulk_shipment`,
      formData,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// edit enquiry booking export
export const Edit_enquiry_booking_export = async (airwaybill_no: any) => {
  try {
    return await axios.get(baseURL + `/booking/edit_booking/${airwaybill_no}`);
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

//Upload Shipper Invoice API
export const uploadShipperInvoiceApi = async (formData: any) => {
  try {
    return await axios.post(
      baseURL + bookURL + `/upload_shipper_invoice`,
      formData,
    );
  } catch (err: any) {
    if (err.response.status === 401) {
      redirectToLogin(err.response.status);
    }
    return err;
  }
};

// Get Shipnstock Countries
export const getShipnstockCountriesApi = async () => {
  try {
    return await axios.get(baseURL + bookingURL + `/shipnstock-countries`);
  } catch (err: any) {
    return err;
  }
};

// Get Shipnstock States
export const getShipnstockStatesApi = async (countryId: any) => {
  try {
    return await axios.get(
      baseURL + bookingURL + `/shipnstock-states/${countryId}`,
    );
  } catch (err: any) {
    return err;
  }
};