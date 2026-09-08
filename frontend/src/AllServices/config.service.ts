import axios from "axios";
import { createledgerdatatype } from "../DataTypes/dataTypes";
import {
  EditProducttypesingle,
  GET,
  GETCOUNTRIES,
  GETCharges,
  GETGroupName,
  GETSubGroup,
  GETledgers,
  POSTLedger,
  POSTPrdouct,
  POSTShipment,
  PUT,
  ProductTypeChangeaction,
  ShipmentTypeChangeaction,
} from "./services";
const baseURL = "http://localhost/api/v1/hub";

export const getBookingProductTypeApi = async () => {
  return GET("/booking-product-type");
};

export const getBookingShipmentTypeApi = async () => {
  return GET("/booking-shipment-type");
};

interface queryType {
  offset: number;
  limit: number;
}
export const getCountryApi = async (obj: queryType) => {
  return GETCOUNTRIES("/country");
};

interface objtype {
  shipment_type?: string;
  booking_shipment_type_id?: number;
  is_active?: number;
}

// edit shipment type
export const EditShipmentTypeApi = async (obj: objtype) => {
  return PUT("/booking-shipment-type", obj);
};

// post shipment type
interface datatype {
  shipment_type: string;
}
export const PostTypeAPI = async (obj: datatype) => {
  return POSTShipment("/booking-shipment-type", obj);
};

interface productdatatype {
  product_type: string;
}

export const POSTPrdouctAPI = async (obj: productdatatype) => {
  return POSTPrdouct("/booking-product-type", obj);
};

interface signleproductdatatype {
  product_type: string;
  product_service_id: number;
}
export const EditSingleProducttypeapi = async (obj: signleproductdatatype) => {
  return EditProducttypesingle("/booking-product-type", obj);
};
interface productactiontype {
  product_service_id: number;
  is_active: number;
  product_type?: string;
}
export const ProductTypeChangeactionapi = async (obj: productactiontype) => {
  // console.log(obj,"config")
  return ProductTypeChangeaction("/booking-product-type", obj);
};

// action change for shipment type

interface shipmentactiontype {
  booking_shipment_type_id: number;
  is_active: number;
  shipment_type: string;
}
export const ShipmentTypeChangeactionapi = async (obj: shipmentactiontype) => {
  //   console.log(obj,"configshpment")
  return ShipmentTypeChangeaction("/booking-shipment-type", obj);
};

// GET ledgers data......
export const GETledgersapi = async () => {
  return GETledgers("/ledger");
};

// GET subgroup data....

export const GETSubGroupAPI = async () => {
  return GETSubGroup("/sub-group");
};
// GET group name and type
export const GETGroupNameapi = async (id: number) => {
  return GETGroupName(`/primary-group/${id}`);
};

// create ledger ..........
export const POSTLedgerApi = async (data: createledgerdatatype) => {
  // console.log(data,"newdata")
  return POSTLedger("/ledger", data);
};

// GETcharges api
export const GetChargesMasterapi = async () => {
  return GETCharges("/charges");
};

// GET Country Profile
export const GetCountryProfileapi = async () => {
  try {
    const response = await axios.get(baseURL + "/company-profile");
    return response;
  } catch (err: any) {
    return err;
  }
};



