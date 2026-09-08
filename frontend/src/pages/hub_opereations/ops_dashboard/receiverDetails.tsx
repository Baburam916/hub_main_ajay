import { Dialog } from "../../../base-components/Headless";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import { useEffect, useRef, useState } from "react";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";
import {
  common_get,
  Get_Fair_Master,
  getConsigneeDetailsApi,
} from "../../../AllServices/services";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormSelect,
  InputGroup,
} from "../../../base-components/Form";
import TomSelect from "../../../base-components/TomSelect";
import { downloadAttachment, getCurrentDate, onlyNumbers } from "../../../utils";
import CommonSearchableAll from "../../../components/commonSearchableAll";
import KycModal from "./KycModal";

interface ReceiverDetailsProps {
  open: boolean;
  onClose: () => void;
  countryData: any;
  isEdit?: boolean;
  booking?: any;
  setJobData?: () => void;
  dimensionData?: any;
  vendorData?: any[];
}
const intselecteddata = {
  code: "",
  name: "",
};

const intselecteddata2 = {
  id: "",
  fair_name: "",
};

const getByFirstCarrierFromCourier = (courierName?: string) => {
  const name = courierName?.toLowerCase?.() || "";
  if (name.includes("fedex")) return "FX";
  if (name.includes("ups")) return "UPS";
  if (name.includes("dhl")) return "DHL";
  if (name.includes("aramex")) return "Aramex";
  if (name.includes("emirate")) return "Emirates";
  return "SELF";
};
const ReceiverDetails: React.FC<ReceiverDetailsProps> = ({
  open,
  onClose,
  countryData,
  isEdit = false,
  booking,
  setJobData,
  dimensionData,
  vendorData,
}) => {
  const { showAlert } = useAlert();
  const [contactEdit, setContactEdit] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [kycModalPreview, setKycModalPreview] = useState<boolean>(false);

  const isAramexTaxSection =
    (booking?.shipment_type == 4 || booking?.shipment_type == 5) &&
    vendorData
      ?.find((item: any) => item?.product_id == booking?.courier_id)
      ?.product_name?.toLowerCase()
      .includes("aramex");

  const [receiverDetails, setReceiverDetails] = useState({
    consignee_mobile_number:
      booking?.consignee_details?.consignee_mobile_number || "",
    consignee_email_id: booking?.consignee_details?.consignee_email_id || "",
    consignee_first_name:
      booking?.consignee_details?.consignee_first_name || "",
    consignee_company_name:
      booking?.consignee_details?.consignee_company_name || "",
    consignee_address_1: booking?.consignee_details?.consignee_address_1 || "",
    consignee_address_2: booking?.consignee_details?.consignee_address_2 || "",
    consignee_pincode: booking?.consignee_details?.consignee_pincode || booking?.dest_zip || "",
    consignee_city: booking?.consignee_details?.consignee_city || booking?.dest_city || "",
    consignee_state: booking?.consignee_details?.consignee_state || booking?.dest_state_code || "",
    consignee_country:
      countryData?.find(
        (ele: any) => ele?.country_id == booking?.dest_country_id
      )?.country_name || "",
    consignee_reference_no:
      booking?.consignee_details?.consignee_reference_no || "",
    consignee_gst_number: booking?.consignee_details?.consignee_gst_number || "N.A.",
    booking_invoice_number:
      booking?.consignee_details?.booking_invoice_number || "",
    booking_invoice_date:
      booking?.consignee_details?.booking_invoice_date ||
      getCurrentDate() ||
      "",
    ...(booking?.shipment_type == 8
      ? {
        fair_id: "",
        fair_hall: "",
        fair_booth: "",
        fair_venue: "",
        mode: "",
        mode_value: "",
      }
      : {}),
    ...(booking?.import_booking == 2 ? { kyc_details: booking?.consignee_details?.kyc_details || "", } : {}),
    ...(booking?.import_booking == "2" && booking?.import_booking_type == "2"
      ? {
        broker_address_1: booking?.consignee_details?.broker_address_1 || "",
        broker_address_2: booking?.consignee_details?.broker_address_2 || "",
        broker_city: booking?.consignee_details?.broker_city || "",
        broker_state: booking?.consignee_details?.broker_state || "",
        broker_pincode: booking?.consignee_details?.broker_pincode || "",
        broker_country_code:
          booking?.consignee_details?.broker_country_code || "IN",
        broker_name: booking?.consignee_details?.broker_name || "",
        broker_email: booking?.consignee_details?.broker_email || "",
        broker_phone_extension:
          booking?.consignee_details?.broker_phone_extension || "+91",
        broker_phone: booking?.consignee_details?.broker_phone || "",
        broker_company_name:
          booking?.consignee_details?.broker_company_name || "",
      }
      : {}),
  });

  const [commercialData, setCommercialData] = useState({
    to_airport_code:
      booking?.consignee_details?.commercialData?.to_airport_code || "",
    by_first_carrier:
      booking?.consignee_details?.commercialData?.by_first_carrier ||
      getByFirstCarrierFromCourier(booking?.courier_name),
    airport_destination:
      booking?.consignee_details?.commercialData?.airport_destination || "",
    handling_information:
      booking?.consignee_details?.commercialData?.handling_information || "",
    quantity_of_goods:
      booking?.consignee_details?.commercialData?.quantity_of_goods || "",
    iec_no: booking?.consignee_details?.commercialData?.iec_no || "",
    hsn_code:
      dimensionData?.map((item: any) => item?.hsn_code)?.join(",") || "",
    execution_date:
      booking?.consignee_details?.commercialData?.execution_date || "",
    accounting_information:
      booking?.consignee_details?.commercialData?.accounting_information || "",
    remark: booking?.consignee_details?.commercialData?.remark || "",
    to1: booking?.consignee_details?.commercialData?.to1 || "",
    by1: booking?.consignee_details?.commercialData?.by1 || "",
    to2: booking?.consignee_details?.commercialData?.to2 || "",
    by2: booking?.consignee_details?.commercialData?.by2 || "",
    flight_no: booking?.consignee_details?.commercialData?.flight_no || "",
    flight_date: booking?.consignee_details?.commercialData?.flight_date || "",
    signature: booking?.consignee_details?.commercialData?.signature || "3",
    remove_qty: booking?.consignee_details?.commercialData?.remove_qty || 0,
    remove_iec:
      booking?.consignee_details?.commercialData?.remove_iec || 0,
  });
  const [selecteddata2, setSelecteddata2] = useState<any>(intselecteddata2);
  const [selecteddata, setSelecteddata] = useState<any>(intselecteddata);
  const contactEditRef = useRef(false);
  contactEditRef.current = contactEdit;

  const shipment_value = dimensionData?.reduce(
    (sum: number, item: any) => sum + (Number(item?.value) || 0),
    0
  );

  const handleDataReset = () => {
    setReceiverDetails({
      consignee_mobile_number: "",
      consignee_email_id: "",
      consignee_first_name: "",
      consignee_company_name: "",
      consignee_address_1: "",
      consignee_address_2: "",
      consignee_pincode: booking?.dest_zip || "",
      consignee_city: booking?.consignee_details?.consignee_city || booking?.dest_city || "",
      consignee_state: booking?.dest_state_code || "",
      consignee_country:
        countryData?.find(
          (ele: any) => ele?.country_id == booking?.dest_country_id
        )?.country_name || "",
      consignee_reference_no: "",
      booking_invoice_number: "",
      booking_invoice_date: getCurrentDate() || "",
      ...(booking?.import_booking == 2 ? { kyc_details: "", } : {}),
    });
    setContactEdit(false);
  };

  const getConsigneeData = async () => {
    if (spinner) {
      return;
    }

    if (!receiverDetails?.consignee_mobile_number) {
      showAlert("Please enter mobile number", "error");
      return;
    }
    const mobile = receiverDetails.consignee_mobile_number;
    const isSequential = mobile.split("").every((d, i, arr) => i === 0 || (parseInt(arr[i - 1]) + 1) % 10 === parseInt(d));
    if (isSequential) {
      showAlert("Please enter a valid mobile number", "warning");
      return;
    }
    setSpinner(true);
    try {
      const response: any = await getConsigneeDetailsApi(
        receiverDetails?.consignee_mobile_number,
        booking?.import_booking
      );
      if (response?.data?.status == 200) {
        if (response?.data?.data?.kyc_details?.length == 0) {
          setContactEdit(true);
          setReceiverDetails((prev: any) => ({
            ...prev,
            ...response?.data?.data,
            kyc_details: null,
          }));
        } else if (response?.data?.data?.kyc_details == undefined) {
          if (booking?.import_booking == 2) {
            setContactEdit(true);
            setReceiverDetails((prev: any) => ({
              ...prev,
              ...response?.data?.data,
              kyc_details: null,
            }));
          } else {
            setContactEdit(true);
            setReceiverDetails((prev: any) => ({
              ...prev,
              ...response?.data?.data,
            }));
          }
        } else {
          setContactEdit(true);
          setReceiverDetails((prev: any) => ({
            ...prev,
            ...response?.data?.data,
          }));
        }
        showAlert("Receiver Details Found");
      } else if (response?.data?.status == 400) {
        showAlert(response?.data?.data[0]?.message, "error");
      } else {
        showAlert("Something Went Wrong", "error");
      }
    } catch (err: any) {
      showAlert("Something Went Wrong", "error");
    } finally {
      setSpinner(false);
    }
  };

  // const handleCheckReference = async (reference_no) => {};

  const handleClick = () => {
    const mobile = receiverDetails.consignee_mobile_number;
    if (!mobile) {
      showAlert("Please enter mobile number", "error");
      return;
    }
    const isSequential = mobile.split("").every((d, i, arr) => i === 0 || (parseInt(arr[i - 1]) + 1) % 10 === parseInt(d));
    if (isSequential) {
      showAlert("Please enter a valid mobile number", "warning");
      return;
    }
    if (booking?.shipment_type == 8) {
      const requiredKeysForType8 = [
        "consignee_mobile_number",
        "consignee_email_id",
        "consignee_company_name",
        "consignee_first_name",
      ];

      for (const key of requiredKeysForType8) {
        if (!receiverDetails[key] || receiverDetails[key].trim() === "") {
          showAlert(`${key.replaceAll("_", " ")} is required`, "warning");
          return;
        }
      }
    }

    if (
      isAramexTaxSection &&
      (!receiverDetails?.consignee_gst_number ||
        receiverDetails.consignee_gst_number.trim() === "")
    ) {
      showAlert("consignee document number / gst number is required", "warning");
      return;
    }

    for (const key in receiverDetails) {
      if (booking?.import_booking == "1" && key?.includes("broker")) {
        continue;
      }

      if (booking?.import_booking == "2" && booking?.import_booking_type != "2" && key?.includes("broker")) {
        continue;
      }

      if (
        key == "kyc_details" ||
        key == "consignee_mobile_number" ||
        key == "consignee_email_id" ||
        key == "consignee_company_name" ||
        key == "consignee_first_name" ||
        key == "consignee_address_1" ||
        key == "consignee_address_2" ||
        key == "consignee_pincode" ||
        key == "consignee_city" ||
        key == "consignee_state" ||
        key == "consignee_reference_no" ||
        key == "booking_invoice_number" ||
        key == "booking_invoice_date" ||
        key == "consignee_gst_number"
      ) {
        continue;
      }
      if (receiverDetails.hasOwnProperty(key) && receiverDetails[key] === "") {
        if (key == "fair_id") {
          showAlert(`fair name is required`, "warning");
          return;
        }
        if (key == "mode_value") {
          continue;
        }
        showAlert(`${key.replaceAll("_", " ")} is required`, "warning");
        return;
      }
    }

    for (const key in commercialData) {
      if (
        key == "by_first_carrier" ||
        key == "handling_information" ||
        key == "quantity_of_goods" ||
        key == "iec_no" ||
        key == "hsn_code" ||
        key == "execution_date" ||
        key == "remark" ||
        key == "to1" ||
        key == "by1" ||
        key == "to2" ||
        key == "by2" ||
        key == "flight_no" ||
        key == "flight_date" ||
        key == "accounting_information" ||
        key == "signature" ||
        key == "remove_qty" ||
        key == "remove_iec"
      ) {
        continue;
      }

      if (commercialData.hasOwnProperty(key) && commercialData[key] == "") {
        showAlert(`${key.replaceAll("_", " ")} is required`, "warning");
        return;
      }
    }
    setJobData((prev) => ({
      ...prev,
      consignee_details: {
        ...receiverDetails,
        commercialData: commercialData,
      },
    }));
    onClose();
  };
  useEffect(() => {
    if (contactEditRef.current) return;
    setReceiverDetails({
      consignee_mobile_number:
        booking?.consignee_details?.consignee_mobile_number || "",
      consignee_email_id: booking?.consignee_details?.consignee_email_id || "",
      consignee_first_name:
        booking?.consignee_details?.consignee_first_name || "",
      consignee_company_name:
        booking?.consignee_details?.consignee_company_name || "",
      consignee_address_1:
        booking?.consignee_details?.consignee_address_1 || "",
      consignee_address_2:
        booking?.consignee_details?.consignee_address_2 || "",
      consignee_pincode: isEdit
        ? booking?.consignee_details?.consignee_pincode || booking?.dest_zip || ""
        : booking?.consignee_details?.consignee_pincode || "",
      consignee_city: isEdit
        ? booking?.consignee_details?.consignee_city || booking?.dest_city || ""
        : booking?.consignee_details?.consignee_city || "",
      consignee_state: isEdit
        ? booking?.consignee_details?.consignee_state || booking?.dest_state_code || ""
        : booking?.consignee_details?.consignee_state || "",
      consignee_country: isEdit
        ? countryData?.find(
          (ele: any) => ele?.country_id == booking?.dest_country_id
        )?.country_name
        : booking?.consignee_details?.consignee_country || "",
      consignee_reference_no:
        booking?.consignee_details?.consignee_reference_no || "",
      consignee_gst_number: booking?.consignee_details?.consignee_gst_number || "N.A.",
      booking_invoice_number:
        booking?.consignee_details?.booking_invoice_number || "",
      booking_invoice_date:
        booking?.consignee_details?.booking_invoice_date ||
        getCurrentDate() ||
        "",
      ...(booking?.shipment_type == 8 || booking?.consignee_details?.fair_venue
        ? {
          fair_id: booking?.consignee_details?.fair_hall
            ? booking?.consignee_details?.fair_id
            : booking?.fair_data?.fair_id || "",
          fair_hall: booking?.consignee_details?.fair_hall
            ? booking?.consignee_details?.fair_hall
            : "",
          fair_booth: booking?.consignee_details?.fair_booth
            ? booking?.consignee_details?.fair_booth
            : "",
          fair_venue: booking?.consignee_details?.fair_hall
            ? booking?.consignee_details?.fair_venue
            : booking?.fair_data?.fair_venue || "",
          mode: booking?.fair_data?.mode || "",
          mode_value: booking?.fair_data?.mode_value || "",
        }
        : {}),
      ...(booking?.import_booking == "2" && booking?.import_booking_type == "2"
        ? {
          broker_address_1: booking?.consignee_details?.broker_address_1 || "",
          broker_address_2: booking?.consignee_details?.broker_address_2 || "",
          broker_city: booking?.consignee_details?.broker_city || "",
          broker_state: booking?.consignee_details?.broker_state || "",
          broker_pincode: booking?.consignee_details?.broker_pincode || "",
          broker_country_code:
            booking?.consignee_details?.broker_country_code || "IN",
          broker_name: booking?.consignee_details?.broker_name || "",
          broker_email: booking?.consignee_details?.broker_email || "",
          broker_phone_extension:
            booking?.consignee_details?.broker_phone_extension || "+91",
          broker_phone: booking?.consignee_details?.broker_phone || "",
          broker_company_name:
            booking?.consignee_details?.broker_company_name || "",
        }
        : {}),
    });

    setCommercialData((prev) => ({
      ...prev,
      to_airport_code:
        prev?.to_airport_code ||
        booking?.consignee_details?.commercialData?.to_airport_code ||
        "",
      by_first_carrier:
        booking?.consignee_details?.commercialData?.by_first_carrier ||
        getByFirstCarrierFromCourier(booking?.courier_name),
      airport_destination:
        prev?.airport_destination ||
        booking?.consignee_details?.commercialData?.airport_destination ||
        "",
      handling_information:
        booking?.consignee_details?.commercialData?.handling_information || "",
      quantity_of_goods:
        booking?.consignee_details?.commercialData?.quantity_of_goods || "",
      iec_no: booking?.consignee_details?.commercialData?.iec_no || "",
      hsn_code:
        dimensionData?.map((item: any) => item?.hsn_code)?.join(",") || "",
      execution_date:
        booking?.consignee_details?.commercialData?.execution_date || "",
      accounting_information:
        booking?.consignee_details?.commercialData?.accounting_information ||
        "",
      remark: booking?.consignee_details?.commercialData?.remark || "",
      to1: booking?.consignee_details?.commercialData?.to1 || "",
      by1: booking?.consignee_details?.commercialData?.by1 || "",
      to2: booking?.consignee_details?.commercialData?.to2 || "",
      by2: booking?.consignee_details?.commercialData?.by2 || "",
      flight_no: booking?.consignee_details?.commercialData?.flight_no || "",
      flight_date:
        booking?.consignee_details?.commercialData?.flight_date || "",
      signature: booking?.consignee_details?.commercialData?.signature || "3",
      remove_qty: booking?.consignee_details?.commercialData?.remove_qty || 0,
      remove_iec: booking?.consignee_details?.commercialData?.remove_iec || 0,
    }));

  }, [booking]);

  useEffect(() => {
    // if( booking?.consignee_details?.commercialData?.to_airport_code){
    const existingAirportCode =
      commercialData?.to_airport_code ||
      booking?.consignee_details?.commercialData?.to_airport_code;
    if (existingAirportCode) {
      getparticulardata(existingAirportCode);
    } else if (booking?.dest_city) {
      getAirportByCity(booking?.dest_city);
    }

    Get_Fair_Master().then((res: any) => {
      const updatedFormat =
        res?.data?.data?.filter((item: any) => item?.is_active == 1) || [];
      setSelecteddata2(() => ({
        id: booking?.consignee_details?.fair_hall
          ? booking?.consignee_details?.fair_id
          : booking?.fair_data?.fair_id || "",
        fair_name:
          updatedFormat?.find(
            (fair: any) =>
              fair?.id ==
              (booking?.consignee_details?.fair_hall
                ? booking?.consignee_details?.fair_id
                : booking?.fair_data?.fair_id)
          )?.fair_name || "",
      }));
    });
  }, [])

  const getparticulardata = async (code: any) => {
    try {
      const res = await common_get(`/admin/airports?code=${code}`);
      if (res?.status == 200) {
        const data = res?.data?.data[0];
        setSelecteddata({ code: data?.code || "", name: data?.name || "" });
        setCommercialData((prev) => ({
          ...prev,
          airport_destination: data?.city_name || prev?.airport_destination,
        }));
      } else {
        setSelecteddata(intselecteddata);
      }
    } catch (err: any) {
      console.log(err?.message);
    }
  };

  const getAirportByCity = async (city: any) => {
    try {
      const res = await common_get(`/admin/airports?key=${city}`);
      if (res?.status == 200 && res?.data?.data?.length > 0) {
        const data = res?.data?.data[0];
        setSelecteddata({ code: data?.code || "", name: data?.name || "" });
        setCommercialData((prev) => ({
          ...prev,
          to_airport_code: data?.code || "",
          airport_destination: data?.city_name || prev?.airport_destination,
        }));
      }
    } catch (err: any) {
      console.log(err?.message);
    }
  };
  const fun1 = (a: any) => {
    setCommercialData((prev) => ({
      ...prev,
      to_airport_code: a?.code || "",
      airport_destination: a?.city_name || prev?.airport_destination,
    }));
  };
  const funtoempty = () => {
    setCommercialData((prev) => ({
      ...prev,
      to_airport_code: "",
    }));
    setSelecteddata(intselecteddata);
    setJobData((prev) => ({
      ...prev,
      consignee_details: {
        ...receiverDetails,
        commercialData: { ...commercialData, to_airport_code: "" },
      },
    }));
  };
  const funonChange = () => {
    setCommercialData((pre: any) => ({ ...pre, to_airport_code: "" }));
  };

  const fun2 = (a: any) => {
    setReceiverDetails((prev) => ({
      ...prev,
      fair_id: a?.id || "",
    }));
    setSelecteddata2({ id: a?.id || "", fair_name: a?.fair_name || "" });
  };
  const funtoempty2 = (a: any) => {
    setReceiverDetails((prev) => ({
      ...prev,
      fair_id: "",
    }));
    setSelecteddata2({ id: "", fair_name: "" });
  };
  return (
    <Dialog staticBackdrop open={open} size={"lg"} onClose={onClose}>
      <Dialog.Panel className={"mt-16"}>
        <Dialog.Title className="flex justify-between">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <h2 className="mr-auto text-base font-medium whitespace-nowrap">
              Receiver Details
            </h2>

            {booking?.import_booking == 2 &&
              (receiverDetails?.kyc_details?.document_id_1 &&
                receiverDetails?.kyc_details?.document_id_2 ? (
                <>
                  {receiverDetails?.kyc_details?.document_path_1 && (
                    <Button
                      className="text-white bg-mustard p-[2px] md:p-2"
                      size="sm"
                      onClick={() =>
                        downloadAttachment(
                          receiverDetails?.kyc_details?.document_path_1,
                          "document_1"
                        )
                      }
                    >
                      KYC Document 1
                    </Button>
                  )}

                  {receiverDetails?.kyc_details?.document_path_2 && (
                    <Button
                      className="text-white bg-mustard p-[2px] md:p-2"
                      size="sm"
                      onClick={() =>
                        downloadAttachment(
                          receiverDetails?.kyc_details?.document_path_2,
                          "document_2"
                        )
                      }
                    >
                      KYC Document 2
                    </Button>
                  )}

                  <Button
                    className="text-white bg-blue-500 p-[2px] md:p-2"
                    size="sm"
                    onClick={() => {
                      setKycModalPreview(true);
                    }}
                  >
                    <Lucide icon="Edit" className="w-4 h-4 mx-1 stroke-2.5" />
                    Edit KYC
                  </Button>
                </>
              ) : (
                <Button
                  className="text-white bg-blue-500 "
                  size="sm"
                  onClick={() => {
                    setKycModalPreview(true);
                  }}
                >
                  <Lucide icon="Upload" className="w-4 h-4 mr-2 stroke-2.5" />
                  UPLOAD KYC
                </Button>
              ))}

            {kycModalPreview && (
              <KycModal
                open={kycModalPreview}
                setSenderDetails={setReceiverDetails}
                onClose={() => setKycModalPreview(false)}
                booking={booking}
              />
            )}
          </div>
          <Lucide
            icon="XCircle"
            className="w-5 h-5 cursor-pointer"
            onClick={onClose}
          />
        </Dialog.Title>
        <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3 overflow-y-auto h-[65vh]">
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-1">
              MOBILE NO <span className="text-red-500">*</span>
            </FormLabel>
            <InputGroup>
              <FormInput
                id="modal-form-1"
                type="text"
                maxLength={15}
                disabled={contactEdit || !isEdit}
                value={receiverDetails?.consignee_mobile_number}
                onChange={(e) =>
                  setReceiverDetails((prev) => ({
                    ...prev,
                    consignee_mobile_number: e.target.value.replace(
                      /[^0-9.]/g,
                      ""
                    ),
                  }))
                }
              />
              {isEdit &&
                (contactEdit ? (
                  <InputGroup.Text
                    id="input-group-price"
                    className="bg-red-500 text-white  cursor-pointer border-red-500 rounded-r-xl"
                    onClick={handleDataReset}
                  >
                    RESET
                  </InputGroup.Text>
                ) : (
                  <InputGroup.Text
                    id="input-group-price"
                    className="bg-blue-500 text-white  cursor-pointer border-blue-500 rounded-r-xl flex "
                    onClick={getConsigneeData}
                  >
                    CHECK
                    {spinner && (
                      <LoadingIcon
                        icon="puff"
                        color="white"
                        className="w-5 h-5 ml-2 stroke-2.5 text-white "
                      />
                    )}
                  </InputGroup.Text>
                ))}
            </InputGroup>
          </div>
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-2">
              EMAIL{" "}
              {booking?.shipment_type == "8" ? (
                <span className="text-red-500">*</span>
              ) : null}
            </FormLabel>
            <FormInput
              id="modal-form-2"
              type="email"
              value={receiverDetails?.consignee_email_id}
              disabled={!isEdit}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_email_id: e.target.value,
                }))
              }
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-3">
              FULL NAME{" "}
              {booking?.shipment_type == "8" ? (
                <span className="text-red-500">*</span>
              ) : null}
            </FormLabel>
            <FormInput
              id="modal-form-3"
              type="text"
              value={receiverDetails?.consignee_first_name}
              disabled={!isEdit}
              maxLength={50}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_first_name: e.target.value,
                }))
              }
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-4">
              COMPANY NAME{" "}
              {booking?.shipment_type == "8" ? (
                <span className="text-red-500">*</span>
              ) : null}
            </FormLabel>
            <FormInput
              id="modal-form-4"
              type="text"
              value={receiverDetails?.consignee_company_name}
              disabled={!isEdit}
              maxLength={50}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_company_name: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-5">FLAT/HOUSE NO.</FormLabel>
            <FormInput
              id="modal-form-5"
              type="text"
              placeholder=""
              value={receiverDetails?.consignee_address_1}
              disabled={!isEdit}
              maxLength={50}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_address_1: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-6">STREET/LOCALITY</FormLabel>
            <FormInput
              id="modal-form-6"
              type="text"
              placeholder=""
              value={receiverDetails?.consignee_address_2}
              disabled={!isEdit}
              maxLength={50}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_address_2: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-7">PINCODE</FormLabel>
            <FormInput
              id="modal-form-7"
              type="text"
              value={receiverDetails?.consignee_pincode}
              disabled={!isEdit}
              onChange={(e: any) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_pincode: e.target.value,
                }))
              }
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-8">CITY</FormLabel>
            <FormInput
              id="modal-form-8"
              type="text"
              value={receiverDetails?.consignee_city}
              disabled={!isEdit}
              onChange={(e: any) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_city: e.target.value,
                }))
              }
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-9">STATE CODE</FormLabel>
            <FormInput
              id="modal-form-9"
              type="text"
              value={receiverDetails?.consignee_state}
              disabled={!isEdit}
              onChange={(e: any) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_state: e.target.value,
                }))
              }
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-10">
              COUNTRY <span className="text-red-500">*</span>
            </FormLabel>

            <TomSelect
              id="modal-form-10"
              className={`w-[100%] `}
              disabled
              value={receiverDetails?.consignee_country}
              options={{
                placeholder: "Select Country Name",
              }}
            >
              {countryData?.length &&
                countryData?.map(
                  (data: any, index: any) =>
                    data?.is_active == 1 && (
                      <option value={data?.country_name} key={index}>
                        {data?.country_name}
                      </option>
                    )
                )}
            </TomSelect>
          </div>

          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-11">REFERENCE NUMBER</FormLabel>

            <InputGroup>
              <FormInput
                id="modal-form-11"
                type="text"
                value={receiverDetails?.consignee_reference_no}
                disabled={!isEdit}
                onChange={(e) =>
                  setReceiverDetails((prev) => ({
                    ...prev,
                    consignee_reference_no: e.target.value,
                  }))
                }
              />
              {/* <InputGroup.Text
                id="input-group-price"
                className="py-2 px-3 w-14"
              >
                {receiverDetails?.consignee_reference_no &&
                  uniqueReferenceNo == true && (
                    <Lucide
                      icon="Check"
                      className="text-green-500 stroke-2.5  h-5"
                    />
                  )}
                {receiverDetails?.consignee_reference_no &&
                  uniqueReferenceNo == false && (
                    <Lucide icon="X" className="text-red-500 stroke-2.5  h-5" />
                  )}
              </InputGroup.Text> */}
            </InputGroup>
          </div>

          {booking?.shipment_type == "8" ||
            (!isEdit && booking?.consignee_details?.fair_venue) ? (
            <>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="fair_name">
                  FAIR NAME <span className="text-red-500">*</span>
                </FormLabel>
                <CommonSearchableAll
                  apiEndpoint="/admin/fair_exhibition/fair_list"
                  zIndex="20"
                  selecteddata={selecteddata2}
                  setSelecteddata={setSelecteddata2}
                  fun1={fun2}
                  funtoempty={funtoempty2}
                  key1={"fair_name"}
                  comingselectedname={"fair_name"}
                  comingselectedid={"id"}
                  id={receiverDetails?.fair_id}
                  isdisabled={!isEdit}
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="modal-form-24">
                  FAIR HALL NO <span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  id="modal-form-24"
                  type="text"
                  placeholder=""
                  disabled={!isEdit}
                  value={receiverDetails?.fair_hall}
                  onChange={(e) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      fair_hall: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="modal-form-25">
                  FAIR BOOTH NO <span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  id="modal-form-25"
                  type="text"
                  placeholder=""
                  disabled={!isEdit}
                  value={receiverDetails?.fair_booth}
                  onChange={(e) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      fair_booth: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="modal-form-26">
                  FAIR VENUE <span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  id="modal-form-26"
                  type="text"
                  placeholder=""
                  disabled={!isEdit}
                  value={receiverDetails?.fair_venue}
                  onChange={(e) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      fair_venue: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          ) : null}

          <>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-12">
                TO (3 DIGIT AIRPORT CODE){" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              {commercialData?.to_airport_code ? (
                <InputGroup>
                  <FormInput
                    type="text"
                    placeholder={"Airport Code"}
                    autoComplete="off"
                    disabled
                    value={commercialData?.to_airport_code}
                  />

                  {isEdit ? (
                    <InputGroup.Text
                      id="input-group-price"
                      className="py-2 px-3 w-14 cursor-pointer"
                    >
                      <div
                        onClick={() => {
                          setCommercialData((pre: any) => ({
                            ...pre,
                            to_airport_code: "",
                          }));

                          setSelecteddata(intselecteddata);
                        }}
                      >
                        <Lucide
                          icon="Pencil"
                          className="text-green-500 stroke-2.5  h-5"
                        />
                      </div>
                    </InputGroup.Text>
                  ) : (
                    ""
                  )}
                </InputGroup>
              ) : (
                <CommonSearchableAll
                  apiEndpoint="/admin/airports"
                  zIndex="20"
                  selecteddata={selecteddata}
                  setSelecteddata={setSelecteddata}
                  fun1={fun1}
                  funtoempty={funtoempty}
                  key1={"key"}
                  //  border={`${interrors?.country_id ? "border border-red-400" : ""}`}
                  comingselectedname={"name"}
                  comingselectedid={"code"}
                  id={commercialData?.to_airport_code}
                  funonchange={funonChange}
                  addcomingname2={"code"}
                />
              )}
              {/* <CommonSearchableAll
                apiEndpoint="/admin/airports"
                zIndex="20"
                selecteddata={selecteddata}
                setSelecteddata={setSelecteddata}
                fun1={fun1}
                funtoempty={funtoempty}
                key1={"key"}
                isdisabled={!isEdit}
                //  border={`${interrors?.country_id ? "border border-red-400" : ""}`}
                comingselectedname={"name"}
                comingselectedid={"code"}
                id={commercialData?.to_airport_code}
                funonchange={funonChange}
              /> */}
              {/* <FormInput
                id="modal-form-12"
                type="text"
                value={commercialData?.to_airport_code}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    to_airport_code: e.target.value,
                  }))
                }
              /> */}
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-13">BY FIRST CARRIER</FormLabel>
              <FormInput
                id="modal-form-13"
                type="text"
                value={commercialData?.by_first_carrier}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    by_first_carrier: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-14">
                AIRPORT DESTINATION <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                id="modal-form-14"
                type="text"
                value={commercialData?.airport_destination}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    airport_destination: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-15">
                HANDLING INFORMATION
              </FormLabel>
              <FormInput
                id="modal-form-15"
                type="text"
                value={commercialData?.handling_information}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    handling_information: e.target.value,
                  }))
                }
              />
            </div>
            {/* <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-16">QUANTITY OF GOODS</FormLabel>
              <FormInput
                id="modal-form-16"
                type="text"
                value={commercialData?.quantity_of_goods}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    quantity_of_goods: e.target.value,
                  }))
                }
              />
            </div> */}
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-17">IEC NO.</FormLabel>
              <FormInput
                id="modal-form-17"
                type="text"
                value={commercialData?.iec_no}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    iec_no: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-18">HSN CODE</FormLabel>
              <FormInput
                id="modal-form-18"
                type="text"
                value={commercialData?.hsn_code}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    hsn_code: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-19">EXECUTION DATE</FormLabel>
              <FormInput
                id="modal-form-19"
                type="date"
                value={commercialData?.execution_date}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    execution_date: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="accounting_information">
                ACCOUNTING INFORMATION
              </FormLabel>
              <FormInput
                id="accounting_information"
                type="text"
                value={commercialData?.accounting_information}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    accounting_information: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-20">REMARK</FormLabel>
              <FormInput
                id="modal-form-20"
                value={commercialData?.remark}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    remark: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="to1">TO</FormLabel>
              <FormInput
                id="to1"
                type="text"
                value={commercialData?.to1}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    to1: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="by1">BY</FormLabel>
              <FormInput
                id="by1"
                type="text"
                value={commercialData?.by1}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    by1: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="to2">TO</FormLabel>
              <FormInput
                id="to2"
                type="text"
                value={commercialData?.to2}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    to2: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="by2">BY</FormLabel>
              <FormInput
                id="by2"
                type="text"
                value={commercialData?.by2}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    by2: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="flight_no">FLIGHT NO</FormLabel>
              <FormInput
                id="flight_no"
                type="text"
                value={commercialData?.flight_no}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    flight_no: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="flight_date">FLIGHT DATE</FormLabel>
              <FormInput
                id="flight_date"
                type="date"
                value={commercialData?.flight_date}
                disabled={!isEdit}
                onChange={(e) =>
                  setCommercialData((prev) => ({
                    ...prev,
                    flight_date: e.target.value,
                  }))
                }
              />
            </div>
          </>

          {shipment_value > 2500 && booking?.import_booking == "2" && booking?.courier_name?.toLowerCase?.().includes("fedex") && Number(booking?.currency_id) == 48 ? (
            <>
              {booking?.dest_country_id == "225" ?
                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="ei_number">EI NUMBER{" "}
                  </FormLabel>
                  <FormInput
                    id="ei_number"
                    type="text"
                    placeholder="Enter EI NUMBER"
                    value={receiverDetails?.ei_number}
                    onChange={(e) =>
                      setReceiverDetails((prev) => ({
                        ...prev,
                        ei_number: e.target.value,
                      }))
                    }
                  />
                </div> : null}
              {booking?.dest_country_id == "36" ?
                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="cad_number">CAD NUMBER{" "}
                  </FormLabel>
                  <FormInput
                    id="cad_number"
                    type="text"
                    placeholder="Enter CAD NUMBER"
                    value={receiverDetails?.cad_number}
                    onChange={(e) =>
                      setReceiverDetails((prev) => ({
                        ...prev,
                        cad_number: e.target.value,
                      }))
                    }
                  />
                </div> : null}
            </>
          ) : null}

          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="consignee_gst_number">
              G.S.T NUMBER{" "}
              {isAramexTaxSection ? (
                <span className="text-red-500">*</span>
              ) : null}
            </FormLabel>
            <FormInput
              id="consignee_gst_number"
              type="text"
              placeholder=""
              disabled={!isEdit}
              value={receiverDetails?.consignee_gst_number}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_gst_number: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-21">INVOICE NUMBER</FormLabel>
            <FormInput
              id="modal-form-21"
              type="text"
              placeholder=""
              disabled={!isEdit}
              value={receiverDetails?.booking_invoice_number}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  booking_invoice_number: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-22">INVOICE DATE</FormLabel>
            <FormInput
              id="modal-form-22"
              type="date"
              placeholder=""
              disabled={!isEdit}
              value={receiverDetails?.booking_invoice_date}
              //   max={getCurrentDate()}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  booking_invoice_date: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <label className="whitespace-nowrap">SIGNATURE TYPE</label>
            <div className="flex flex-col mt-2 sm:flex-row">
              <FormCheck className="mr-2">
                <FormCheck.Input
                  type="radio"
                  name="signature_type"
                  value="1"
                  checked={commercialData?.signature == 1}
                  onChange={(e) =>
                    setCommercialData((prev) => ({
                      ...prev,
                      signature: 1,
                    }))
                  }
                />
                <FormCheck.Label htmlFor="radio-switch-4">
                  Shipper
                </FormCheck.Label>
              </FormCheck>
              <FormCheck className="mt-2 mr-2 sm:mt-0">
                <FormCheck.Input
                  type="radio"
                  name="signature_type"
                  value="2"
                  checked={commercialData?.signature == 2}
                  onChange={(e) =>
                    setCommercialData((prev) => ({
                      ...prev,
                      signature: 2,
                    }))
                  }
                />
                <FormCheck.Label htmlFor="radio-switch-5">
                  Subagent
                </FormCheck.Label>
              </FormCheck>
              <FormCheck className="mt-2 mr-2 sm:mt-0">
                <FormCheck.Input
                  type="radio"
                  name="signature_type"
                  value="3"
                  defaultChecked
                  checked={commercialData?.signature == 3}
                  onChange={(e) =>
                    setCommercialData((prev) => ({
                      ...prev,
                      signature: 3,
                    }))
                  }
                />
                <FormCheck.Label htmlFor="radio-switch-5">
                  Default
                </FormCheck.Label>
              </FormCheck>
            </div>
          </div>

          <div className="col-span-12 sm:col-span-6">
            <label>REMOVE FROM HOUSE</label>
            <div className="flex flex-col mt-2 sm:flex-row">
              <FormCheck className="mr-2">
                <FormCheck.Input
                  type="checkbox"
                  value={commercialData?.remove_iec}
                  checked={commercialData?.remove_iec == 1}
                  onChange={(e) =>
                    setCommercialData((prev) => ({
                      ...prev,
                      remove_iec: e.target.checked ? 1 : 0,
                    }))
                  }
                />
                <FormCheck.Label htmlFor="checkbox-switch-4">
                  IEC
                </FormCheck.Label>
              </FormCheck>
              <FormCheck className="mt-2 mr-2 sm:mt-0">
                <FormCheck.Input
                  type="checkbox"
                  value={commercialData?.remove_qty}
                  checked={commercialData?.remove_qty == 1}
                  onChange={(e) =>
                    setCommercialData((prev) => ({
                      ...prev,
                      remove_qty: e.target.checked ? 1 : 0,
                    }))
                  }
                />
                <FormCheck.Label htmlFor="checkbox-switch-5">
                  QTY
                </FormCheck.Label>
              </FormCheck>
            </div>
          </div>

          {booking?.import_booking == "2" &&
            booking?.import_booking_type == "2" ? (
            <>
              <div className="col-span-12 font-bold text-mustard underline underline-offset-2">
                BROKER DETAILS
              </div>

              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="broker_address_1">
                  BROKER ADDRESS 1<span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  type="text"
                  id="broker_address_1"
                  value={receiverDetails?.broker_address_1}
                  disabled={!isEdit}
                  onChange={(e: any) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      broker_address_1: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="broker_address_2">
                  BROKER ADDRESS 2<span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  type="text"
                  id="broker_address_2"
                  value={receiverDetails?.broker_address_2}
                  disabled={!isEdit}
                  onChange={(e: any) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      broker_address_2: e.target.value,
                    }))
                  }
                />
              </div>
              {/* BROKER CITY */}
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="broker_city">
                  BROKER CITY<span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  type="text"
                  id="broker_city"
                  value={receiverDetails?.broker_city}
                  disabled={!isEdit}
                  onChange={(e: any) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      broker_city: e.target.value,
                    }))
                  }
                />
              </div>

              {/* BROKER STATE */}
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="broker_state">
                  BROKER STATE<span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  type="text"
                  id="broker_state"
                  value={receiverDetails?.broker_state}
                  disabled={!isEdit}
                  onChange={(e: any) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      broker_state: e.target.value,
                    }))
                  }
                />
              </div>

              {/* BROKER PINCODE */}
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="broker_pincode">
                  BROKER PINCODE<span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  type="text"
                  id="broker_pincode"
                  value={receiverDetails?.broker_pincode}
                  disabled={!isEdit}
                  onChange={(e: any) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      broker_pincode: e.target.value,
                    }))
                  }
                />
              </div>

              {/* BROKER COUNTRY CODE */}
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="broker_country_code">
                  BROKER COUNTRY CODE<span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  type="text"
                  id="broker_country_code"
                  value={receiverDetails?.broker_country_code}
                  disabled={!isEdit}
                  onChange={(e: any) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      broker_country_code: e.target.value,
                    }))
                  }
                />
              </div>

              {/* BROKER NAME */}
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="broker_name">
                  BROKER NAME<span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  type="text"
                  id="broker_name"
                  value={receiverDetails?.broker_name}
                  disabled={!isEdit}
                  onChange={(e: any) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      broker_name: e.target.value,
                    }))
                  }
                />
              </div>

              {/* BROKER EMAIL */}
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="broker_email">
                  BROKER EMAIL<span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  type="email"
                  id="broker_email"
                  value={receiverDetails?.broker_email}
                  disabled={!isEdit}
                  onChange={(e: any) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      broker_email: e.target.value,
                    }))
                  }
                />
              </div>

              {/* BROKER PHONE WITH EXTENSION */}
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="broker_phone">
                  BROKER PHONE
                  <span className="text-red-500">*</span>
                </FormLabel>

                <InputGroup>
                  {/* EXTENSION DROPDOWN */}
                  <FormSelect
                    id="broker_phone_extension"
                    value={receiverDetails?.broker_phone_extension}
                    disabled={!isEdit}
                    onChange={(e: any) =>
                      setReceiverDetails((prev) => ({
                        ...prev,
                        broker_phone_extension: e.target.value,
                      }))
                    }
                    className="w-1/3 rounded-none rounded-l"
                  >
                    <option value="">Select</option>
                    {countryData?.length &&
                      countryData?.map(
                        (data, index) =>
                          data?.is_active == 1 && (
                            <option value={`+${data?.isd_code}`} key={index}>
                              +{data?.isd_code}
                            </option>
                          )
                      )}
                  </FormSelect>

                  {/* PHONE NUMBER INPUT */}
                  <FormInput
                    type="text"
                    placeholder="Phone Number"
                    id="broker_phone"
                    maxLength={15}
                    onKeyDown={(e) => onlyNumbers(e)}
                    disabled={!isEdit}
                    aria-label="Phone Number"
                    value={receiverDetails?.broker_phone}
                    onChange={(e: any) =>
                      setReceiverDetails((prev) => ({
                        ...prev,
                        broker_phone: e.target.value,
                      }))
                    }
                    className="w-2/3"
                  />
                </InputGroup>
              </div>

              {/* BROKER COMPANY NAME */}
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="broker_company_name">
                  BROKER COMPANY NAME<span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  type="text"
                  id="broker_company_name"
                  value={receiverDetails?.broker_company_name}
                  disabled={!isEdit}
                  onChange={(e: any) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      broker_company_name: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          ) : null}
        </Dialog.Description>
        <Dialog.Footer>
          {isEdit && (
            <Button
              type="button"
              className="text-white bg-mustard border-none"
              size="sm"
              onClick={handleClick}
            >
              SAVE
            </Button>
          )}
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default ReceiverDetails;