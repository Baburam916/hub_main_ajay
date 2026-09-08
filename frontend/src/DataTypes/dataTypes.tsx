//login data types
export interface LoginCredential {
  user_name?: string;
  password?: string;
}

//Change password data types
export interface ChangePasswordData {
  current_password?: string;
  new_password?: string;
}

//Manifest inscan manifest no. data types
export interface ManifestNo {
  manifest_no?: string;
}

//Manifest inscan bag no. data types
export interface BagNo {
  manifest_no?: string;
  bag_no?: string;
}

//Reverse shipment data types
export interface ReverseShipmentData {
  airwaybill_no?: string;
  remark?: string;
  rto?: number;
}

//Reverse shipment inscan data types
export interface ReverseShipmentInscanData {
  airwaybill_no?: string;
  held_up_reason?: any;
  other_reason?: any;
}

//Create bag data types
export interface CreateBagData {
  bag_no?: string;
  airwaybill_no?: string;
  courier_type_id?: any;
  branch_type_id?: any;
  hub_type_id?: any;
  reg_hub_type_id?: any;
  bag_vendor?: any;
}

//close bag data types
export interface CloseBagData {
  bag_no?: string;
}

//route matrix data type
export interface RouteMatrixData {
  from_pincode?: any;
  to_pincode?: any;
}

//chargable weight data types
export interface ChargableWeightData {
  list?: any;
}

//generate manifest data type
export interface GenerateManifestData {
  list?: any;
}

//remove bag shipment data types
export interface RemoveShipmentData {
  id?: any;
}

//segregation short shipment data types
export interface ShortShipmentData {
  pickup_ids?: any;
}

//segregation inscan shipment data types
export interface SegregationScanAirwaybill {
  airwaybill_no?: any;
  held_up_reason?: any;
}

//Create onForward shipment data Type
export interface OnForwardShipmentData {
  type: string;
  mobile_no: any;
  driver_name: string;
  vehicle_no: string;
  manifest_no: any;
  extra_details: any;
}

// ON hold
export interface CreateHoldData {
  holdPaper: any;
}

// direct shipment hold
export interface ShipmentScanAirwaybill {
  airwaybill_no?: any;
  held_up_reason?: any;
}

// Inscan shipment new
export interface sentAllData {
  airwaybill_no?: any;
  held_up_reason?: any;
  manifest_code?: string;
}

// Inscan shipment new
export interface sentAllData2 {
  airwaybill_no?: any;
  manifest_no?: any;
  bag_no?: any;
}

// release shipment
export interface ReleaseShipmentData {
  airwaybill_no?: any;
  held_up_reason?: any;
}

// customer house master data
export interface HouseMasterData {
  id?: any;
  name?: any;
  address?: any;
  state?: any;
  city?: any;
  pincode?: any;
  phone?: any;
  pan_no?: any;
  tan_no?: any;
  email_id?: any;
  contact_person?: any;
  gst_status?: any;
  gst_no?: any;
  courier_stock_id?: any;
}

// tag airwaybill data
export interface TagAirwaybillData {
  refrence_no?: any;
  new_airwaybill_no?: any;
  airwaybill_no?: any;
  courier_id?: any;
}

// tag house data
export interface TagHouseData {
  id?: any;
  house_list?: any;
}

// additional charges data
export interface AdditionalChargeData {
  airwaybill_no?: any;
  flag: any;
  shipment_charges: any;
  invoice_no: any;
  invoice_date: any;
  remarks?: any;
  is_kawach?: any;
}

// shipment on hold report
export interface ShipmentOnHoldReport {
  to_date?: any;
  from_date?: any;
}

// inscan outscan report
export interface InscanOutscanReport {
  from_date?: any;
  to_date?: any;
  approve_status?: any;
  shipment_type?: any;
}
// inscan outscan airway bill no check report
export interface CheckAirway {
  from_date?: any;
  to_date?: any;
}
// shipment awb report
export interface ShipmentAwbReport {
  from_date?: any;
  to_date?: any;
}
// hub inscan vs outscan
export interface Daily_shipment_select {
  id?: any;
}
export interface WeightDimenstionExport {
  to_date?: any;
  from_date?: any;
  shipment_status?:any
}