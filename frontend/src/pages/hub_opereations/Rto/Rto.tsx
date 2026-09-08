import React, { useEffect, useRef, useState } from "react";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Lucide from "../../../base-components/Lucide";
import Tippy from "../../../base-components/Tippy";
import {
  Check_acl,
  Editbooking_Price_comparison,
  Get_country,
  Get_Currency,
  Get_document_type,
  Get_export_type,
  Get_franchisee_details,
  Get_gst_applicable,
  Get_shipment,
  Get_skynet_service_code_api,
  Get_tax_payment,
  Get_Weight_Unit,
  Rto_booking_api,
} from "../../../AllServices/services";
import { Dialog, Disclosure } from "@headlessui/react";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormSelect,
  InputGroup,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";
import Modal from "../../../components/Modal";
import LoadingGif from "../../../assets/images/loading.gif";
import ErrorGif from "../../../assets/images/error.gif";
import Table from "../../../base-components/Table";
import ShipperInvoiceModal from "./shipperInvoiceModal";
import {
  disableSymbols,
  handlePaste,
  isValidHsn,
  onlyNumbers,
} from "../../../utils";
import { Link } from "react-router-dom";
import { set } from "lodash";
const Rto = ({ awbData, setShowRto, setAwbNo }) => {
  const [dimensionData, setDimensionData] = useState<Array<any>>(
    awbData?.pickup_item
  );
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const { showAlert } = useAlert();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentFaq, setCurrentFaq] = useState(1);
  const [spinner, setSpinner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [skartCounter, setSkartCounter] = useState(0);
  const [franchiseeData, setFranchiseeData] = useState(null);
  const [shipmentResponse, setShipmentResponse] = useState();
  const [countryData, setCountryData] = useState([]);
  const [shipmentTypes, setShipmentTypes] = useState([]);
  const [weightUnit, setWeightUnit] = useState([]);
  const [currencyData, setCurrencyData] = useState([]);
  const [consignerDocTypes, setConsignerDocTypes] = useState([]);
  const [consigneeDocTypes, setConsigneeDocTypes] = useState([]);
  const [gstApplicable, setGstApplicable] = useState([]);
  const [taxPaymentOption, setTaxPaymentOption] = useState([]);
  const [exportTypesData, setExportTypesData] = useState([]);
  const [isVendorLoading, setVendorLoading] = useState(false);
  const [isVendorError, setVendorError] = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isEditDimension, setIsEditDimension] = useState(false);
  const [editIndex, setEditIndex] = useState<any>();
  const [editDimensionData, setEditDimensionData] = useState<any>();
  const [shipperPreview, setShipperPreview] = useState(false);
  const [aclSpinner, setAclSpinner] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [priceDetailsData, setPriceDetailsData] = useState({});
  const [rateSpinner, setRateSpinner] = useState(false);
  const [otpField, setOtpField] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(1);
  const [data, setData] = useState<any>({
    is_rto: 1,
    airwaybilno: awbData?.pickup_data?.airwaybilno,
    franchisee_id: awbData?.pickup_data?.pickup_franchisee_id,
    hub_id: hub_id,
    branch_id: awbData?.pickup_data?.pickup_branch_id,
    is_kawach: awbData?.pickup_data?.is_kawach || 0,
    is_direct_cust: awbData?.pickup_data?.is_direct_cust || 0,
    direct_party: "walk-in",
    booking_type: awbData?.pickup_data?.is_domestic,
    origin_pincode: awbData?.consignee_data[0]?.international_zipcode,
    origin_country_code: "",
    destination_pincode: awbData?.shipper_data[0]?.pincode,
    destination_country: "INDIA",
    destination_country_id: 97,
    destination_country_code: "IN",
    origin_city: awbData?.consignee_data[0]?.city,
    origin_state: awbData?.consignee_data[0]?.state,
    origin_state_code: "",
    city: awbData?.shipper_data[0]?.city_name,
    state: awbData?.shipper_data[0]?.state,
    shipment_type: awbData?.pickup_data?.booking_shipment_type_id,
    unit: {
      weight_unit: awbData?.pickup_data?.weight_unit,
      length_unit: awbData?.pickup_data?.dimention_unit,
      currency: awbData?.get_currency_data[0]?.id,
    },
    consigner_first_name: awbData?.consignee_data[0]?.first_name,
    consigner_company_name: awbData?.consignee_data[0]?.company_name,
    consigner_mobile_number: awbData?.consignee_data[0]?.mobile_no,
    consigner_email_id: awbData?.consignee_data[0]?.email_id,
    consigner_address_1: awbData?.consignee_data[0]?.address1,
    consigner_address_2: awbData?.consignee_data[0]?.address2,
    consigner_city: awbData?.consignee_data[0]?.city,
    consigner_pincode: awbData?.consignee_data[0]?.international_zipcode,
    consigner_state: awbData?.consignee_data[0]?.state,
    consigner_doc_type: awbData?.consignee_data[0]?.doc_type,
    consignee_first_name: awbData?.shipper_data[0]?.shipper_name,
    consignee_company_name: awbData?.shipper_data[0]?.company_name,
    consignee_mobile_number: awbData?.shipper_data[0]?.mobile_no,
    consignee_email_id: awbData?.shipper_data[0]?.email_id,
    consignee_address_1: awbData?.shipper_data[0]?.gst_registered_address,
    consignee_address_2: awbData?.shipper_data[0]?.street_address,
    consignee_city: awbData?.shipper_data[0]?.city_name,
    consignee_pincode: awbData?.shipper_data[0]?.pincode,
    consignee_state: awbData?.shipper_data[0]?.state,
    consignee_country: "INDIA",
    consignee_reference_no: awbData?.pickup_data?.order_referenceno,
    booking_invoice_number: awbData?.pickup_data?.booking_invoice_no,
    booking_invoice_date: awbData?.pickup_data?.invoice_date,
    consigner_gst_number: awbData?.consignee_data[0]?.gstin,
    consignee_gst_number: awbData?.additional_data?.consignee_gst_number || "",
    consignee_doc_type: awbData?.additional_data?.consignee_doc_type || "1",
    delivery_instructions:
      awbData?.additional_data?.delivery_instructions || "",
    consigner_gst_applicable: awbData?.pickup_data?.gst_applicable,
    flag: "booking",
    counter: skartCounter,
    consigner_tax_payment:
      awbData?.additional_data?.consigner_tax_payment || "3",
    kyc_details: awbData?.kyc_details[0],
    pickup_required: "2",
    shipper_type: "",
    otp: "",
    state_name: awbData?.shipper_data[0]?.state || "",
    courier_id: awbData?.pickup_data?.courier_id,
    courier_code: "",
    courier_vendor_code: "",
    is_spot: awbData?.pickup_data?.is_spot_booking || 0,
    live_vendor_details: awbData?.additional_data?.live_vendor_details,
    invoiceData: awbData?.invoiceData,
    ...(awbData?.pickup_data?.booking_shipment_type_id == 2
      ? {
          shipment_dimensions: "[]",
          description: awbData?.pickup_item[0]?.product_description,
          weight: awbData?.pickup_item[0]?.chargeable_weight,
        }
      : { shipment_dimensions: awbData?.pickup_item }),
    ...(awbData?.pickup_data?.is_spot_booking == 1
      ? {
          rate: awbData?.isSpotData[0]?.spot_price,
          buy_rate: awbData?.isSpotData[0]?.buy_price,
          is_per_kg: awbData?.isSpotData[0]?.price_type == "2" ? 1 : 0,
        }
      : {}),
  });
  const [totalInvoiceValue, setTotalInvoiceValue] = useState(0);
  const uploadedFile = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;

        setSenderDetails({
          ...senderDetails,
          document: base64String, // base64 string here
        });
      };

      reader.readAsDataURL(file); // this converts the file to base64
    } else {
      uploadedFile.current.value = null;
      setSenderDetails({
        ...senderDetails,
        document: null,
      });
    }
  };
  const [senderDetails, setSenderDetails] = useState({
    consigner_mobile_number: data?.consigner_mobile_number || "",
    consigner_email_id: data?.consigner_email_id || "",
    consigner_first_name: data?.consigner_first_name || "",
    consigner_company_name: data?.consigner_company_name || "",
    consigner_address_1: data?.consigner_address_1 || "",
    consigner_address_2: data?.consigner_address_2 || "",
    consigner_pincode: data?.consigner_pincode || "",
    consigner_city: data?.consigner_city || "",
    consigner_state: data?.consigner_state || "",
    consigner_doc_type: data?.consigner_doc_type || "1",
    consigner_gst_applicable: data?.consigner_gst_applicable || "",
    consigner_gst_number: data?.consigner_gst_number || "",
    consigner_tax_payment: data?.consigner_tax_payment || "",
    kyc_details: data?.kyc_details || "",

    e_waybillno: data?.e_waybillno || "",
    document: data?.document || "",
  });

  const [senderOpen, setSenderOpen] = useState(false);
  const [senderContactEdit, setSenderContactEdit] = useState(
    senderDetails?.consigner_mobile_number ? true : false
  );

  const handleSenderClick = () => {
    // console.log(senderDetails, "bbbb");
    for (const key in senderDetails) {
      if (key == "otp") {
        continue;
      }

      if (data?.shipment_type == "2" || totalInvoiceValue <= 50000) {
        continue;
      }

      if (key == "shipper_type" && !data?.courier_code.includes("dhl")) {
        continue;
      }

      if (
        data?.booking_type == "2" &&
        (key == "consigner_tax_payment" ||
          key == "consigner_gst_applicable" ||
          key == "consigner_doc_type" ||
          key == "consigner_email_id" ||
          key == "consigner_gst_number" ||
          key == "kyc_details")
      ) {
        continue;
      }

      if (
        data?.shipment_type == "2" &&
        !data?.courier_code.includes("fedex") &&
        key == "kyc_details"
      ) {
        continue;
      }

      if (senderDetails?.tax_paid == 2 && key == "tax_amount") {
        continue;
      }

      if (senderDetails.hasOwnProperty(key) && senderDetails[key] === "") {
        showAlert(`${key.replaceAll("_", " ")} is required`, "error");
        return;
      }
    }

    if (data?.shipment_type == "2" || totalInvoiceValue <= 50000) {
      delete senderDetails?.e_waybillno;
      delete data?.e_waybillno;
      delete senderDetails?.document;
      delete data?.document;
    }

    setData((prev) => ({ ...prev, ...senderDetails }));
    setSenderOpen(false);
  };

  useEffect(() => {
    if (awbData?.pickup_data?.booking_shipment_type_id != 2) {
      const value = Number(
        dimensionData?.reduce(
          (acc: any, curr: any) => Number(acc) + Number(curr?.value || 0),
          0
        )
      );
      setTotalInvoiceValue(value || 0);
    }
  }, [data?.shipment_dimensions]);

  const handleDataReset2 = () => {
    setSenderDetails((prev) => ({
      ...prev,
      consigner_mobile_number: "",
      consigner_email_id: "",
      consigner_first_name: "",
      consigner_company_name: "",
      consigner_address_1: "",
      consigner_address_2: "",
      kyc_details: "",
    }));

    // setData((prev) => ({
    //   ...prev,
    //   consigner_mobile_number: "",
    //   consigner_email_id: "",
    //   consigner_first_name: "",
    //   consigner_company_name: "",
    //   consigner_address_1: "",
    //   consigner_address_2: "",
    //   kyc_details: "",
    // }));

    setSenderContactEdit(false);
  };

  const senderDescription = (
    <>
      <div className="flex justify-between gap-4 mb-2">
        {/*
          <div className="flex  gap-4">
            {senderDetails?.kyc_details?.document_path_1 && (
              <Link
                to={senderDetails?.kyc_details?.document_path_1}
                target="_blank"
              >
                <Button
                  className="text-white bg-mustard p-[2px] md:p-2"
                  size="sm"
                >
                  KYC Document 1
                </Button>
              </Link>
            )}
  
            {senderDetails?.kyc_details?.document_path_2 && (
              <Link
                to={senderDetails?.kyc_details?.document_path_2}
                target="_blank"
              >
                <Button
                  className="text-white bg-mustard p-[2px] md:p-2"
                  size="sm"
                >
                  KYC Document 2
                </Button>
              </Link>
            )}
          </div>
  
           <Button
            className=" p-[2px] md:p-2 text-white bg-mustard border-none"
            size="sm"
            onClick={() => setKycModalOpen(true)}
          >
            <Lucide icon="Edit" className="w-4 h-4 mx-1" /> Update KYC
          </Button> 
  
           {kycModalOpen && (
            <Modal
              size="lg"
              title={"Upload Kyc"}
              open={kycModalOpen}
              setOpen={setKycModalOpen}
              description={kycDescription}
              footer={kycFooter}
            />
          )} */}
      </div>
      <div className="grid grid-cols-12 gap-6 gap-y-3 ">
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-1">
            MOBILE NO <span className="text-red-500">*</span>
          </FormLabel>

          <InputGroup>
            <FormInput
              id="modal-form-1"
              type="text"
              placeholder="Mobile No."
              maxLength={10}
              disabled={senderContactEdit}
              value={senderDetails?.consigner_mobile_number}
              onKeyDown={(e) => onlyNumbers(e)}
              onChange={(e) =>
                setSenderDetails({
                  ...senderDetails,
                  consigner_mobile_number: e.target.value,
                })
              }
            />
            {senderContactEdit ? (
              <InputGroup.Text
                id="input-group-price"
                className="bg-red-500 text-white  cursor-pointer border-red-500 rounded-r-xl"
                onClick={handleDataReset2}
              >
                RESET
              </InputGroup.Text>
            ) : (
              <InputGroup.Text
                id="input-group-price"
                className="bg-blue-500 text-white  cursor-pointer border-blue-500 rounded-r-xl flex "
                onClick={getConsignerData}
              >
                CHECK{" "}
                {resetSpinner2 && (
                  <LoadingIcon
                    icon="puff"
                    color="white"
                    className="w-5 h-5 ml-2 stroke-2.5 text-white"
                  />
                )}
              </InputGroup.Text>
            )}
          </InputGroup>
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-4">
            EMAIL
            {data?.booking_type == "1" && (
              <span className="text-red-500">*</span>
            )}
          </FormLabel>
          <FormInput
            id="modal-form-4"
            type="email"
            placeholder="Email"
            value={senderDetails?.consigner_email_id}
            onChange={(e) =>
              setSenderDetails({
                ...senderDetails,
                consigner_email_id: e.target.value,
              })
            }
          />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-3">
            FULL NAME <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-3"
            type="text"
            placeholder="Full Name"
            value={senderDetails?.consigner_first_name}
            onChange={(e) =>
              setSenderDetails({
                ...senderDetails,
                consigner_first_name: e.target.value,
              })
            }
          />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-2">
            COMPANY NAME <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-2"
            type="text"
            placeholder="Company Name"
            value={senderDetails?.consigner_company_name}
            maxLength={data?.courier_code?.includes("fedex") && 35}
            onPaste={(e) => {
              if (data?.courier_code?.includes("fedex")) {
                const text = handlePaste(
                  senderDetails?.consigner_company_name,
                  e,
                  35
                );
                setSenderDetails((prev) => ({
                  ...prev,
                  consigner_company_name: text,
                }));
                setData((prev) => ({
                  ...prev,
                  consigner_company_name: text,
                }));
              }
            }}
            onChange={(e) =>
              setSenderDetails({
                ...senderDetails,
                consigner_company_name: e.target.value,
              })
            }
          />
        </div>

        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            FLAT/HOUSE NO. <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="text"
            placeholder=""
            value={senderDetails?.consigner_address_1}
            maxLength={data?.courier_code?.includes("dhl") && 45}
            onPaste={(e) => {
              if (data?.courier_code?.includes("dhl")) {
                const text = handlePaste(
                  senderDetails?.consigner_address_1,
                  e,
                  45
                );
                setSenderDetails((prev) => ({
                  ...prev,
                  consigner_address_1: text,
                }));
                setData((prev) => ({
                  ...prev,
                  consigner_address_1: text,
                }));
              }
            }}
            onChange={(e) =>
              setSenderDetails((prev) => ({
                ...prev,
                consigner_address_1: e.target.value,
              }))
            }
          />
        </div>

        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            STREET/LOCALITY <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="text"
            placeholder=""
            value={senderDetails?.consigner_address_2}
            maxLength={data?.courier_code?.includes("dhl") && 45}
            onPaste={(e) => {
              if (data?.courier_code?.includes("dhl")) {
                const text = handlePaste(
                  senderDetails?.consigner_address_2,
                  e,
                  45
                );
                setSenderDetails((prev) => ({
                  ...prev,
                  consigner_address_2: text,
                }));
                setData((prev) => ({
                  ...prev,
                  consigner_address_2: text,
                }));
              }
            }}
            onChange={(e) =>
              setSenderDetails((prev) => ({
                ...prev,
                consigner_address_2: e.target.value,
              }))
            }
          />
        </div>

        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            PINCODE <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="text"
            placeholder="Pincode"
            value={senderDetails?.consigner_pincode}
            disabled
          />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            CITY <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="text"
            placeholder=""
            value={senderDetails?.consigner_city}
            disabled
          />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            STATE <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="text"
            placeholder=""
            value={senderDetails?.consigner_state}
            disabled
          />
        </div>

        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-6">
            DOCUMENT TYPE
            {/* <span className="text-red-500">*</span> */}
          </FormLabel>
          <FormSelect
            id="modal-form-6"
            value={senderDetails?.consigner_doc_type}
            onChange={(e) =>
              setSenderDetails((prev) => ({
                ...prev,
                consigner_doc_type: e.target.value,
              }))
            }
          >
            <option value="0">Select Document Type</option>
            {consignerDocTypes.length > 0 &&
              consignerDocTypes?.map((elem, index) => (
                <option value={elem?.id} key={index}>
                  {elem?.value}
                </option>
              ))}
          </FormSelect>
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            {(consignerDocTypes &&
              consignerDocTypes?.find(
                (elem) => elem.id == senderDetails?.consigner_doc_type
              )?.value) ||
              "Please select a document type"}
            {/* <span className="text-red-500"> *</span> */}
          </FormLabel>

          <FormInput
            type="text"
            placeholder="GST Number"
            value={senderDetails?.consigner_gst_number}
            maxLength={15}
            onChange={(e) =>
              setSenderDetails((prev) => ({
                ...prev,
                consigner_gst_number: e.target.value,
              }))
            }
          />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-6">
            GST APPLICABLE ON INVOICE <span className="text-red-500">*</span>{" "}
          </FormLabel>
          <FormSelect
            id="modal-form-6"
            value={senderDetails?.consigner_gst_applicable}
            onChange={(e) =>
              setSenderDetails((prev) => ({
                ...prev,
                consigner_gst_applicable: e.target.value,
              }))
            }
          >
            <option value="0"> Select</option>
            {gstApplicable.length > 0 &&
              gstApplicable.map((elem, index) => (
                <option value={elem?.id} key={index}>
                  {elem?.value}
                </option>
              ))}
          </FormSelect>
        </div>
        {data?.booking_type == "1" && (
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-6">
              TAX PAYMENT OPTION <span className="text-red-500">*</span>{" "}
            </FormLabel>
            <FormSelect
              id="modal-form-6"
              value={senderDetails?.consigner_tax_payment}
              onChange={(e) =>
                setSenderDetails({
                  ...senderDetails,
                  consigner_tax_payment: e.target.value,
                })
              }
            >
              <option value="0"> Select</option>
              {taxPaymentOption.length > 0 &&
                taxPaymentOption.map((elem, index) => (
                  <option value={elem?.id} key={index}>
                    {elem?.value}
                  </option>
                ))}
            </FormSelect>
          </div>
        )}
        {data?.courier_code.includes("aramex") && (
          <>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-6">
                EXPORT TYPE <span className="text-red-500">*</span>{" "}
              </FormLabel>
              <FormSelect
                id="modal-form-6"
                value={senderDetails?.export_type}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    export_type: e.target.value,
                  })
                }
              >
                <option value="0"> Select</option>
                {exportTypesData.length > 0 &&
                  exportTypesData.map((elem, index) => (
                    <option value={elem?.id} key={index}>
                      {elem?.value}
                    </option>
                  ))}
              </FormSelect>
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-1">
                {" "}
                TAX PAID <span className="text-red-400">*</span>
              </FormLabel>
              <div className="flex flex-row gap-10">
                <FormCheck className="m-2">
                  <FormCheck.Input
                    id="radio-switch-1"
                    type="radio"
                    name="tax_paid_radio_button"
                    checked={senderDetails?.tax_paid == 1}
                    onClick={() =>
                      setSenderDetails((prev) => ({ ...prev, tax_paid: 1 }))
                    }
                  />
                  <FormCheck.Label htmlFor="radio-switch-1">
                    Yes
                  </FormCheck.Label>
                </FormCheck>
                <FormCheck className="mr-2">
                  <FormCheck.Input
                    id="radio-switch-2"
                    type="radio"
                    name="tax_paid_radio_button"
                    checked={senderDetails?.tax_paid == 2}
                    onClick={() =>
                      setSenderDetails((prev) => ({
                        ...prev,
                        tax_paid: 2,
                      }))
                    }
                  />
                  <FormCheck.Label htmlFor="radio-switch-2">No</FormCheck.Label>
                </FormCheck>
              </div>
            </div>
            {senderDetails?.tax_paid == 1 && (
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="modal-form-5">
                  TAX AMOUNT <span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  id="modal-form-5"
                  type="number"
                  value={senderDetails?.tax_amount}
                  onChange={(e) =>
                    setSenderDetails({
                      ...senderDetails,
                      tax_amount: e.target.value,
                    })
                  }
                />
              </div>
            )}
          </>
        )}
        {data?.courier_code.includes("dhl") && (
          <div className="col-span-12 sm:col-span-6">
            <FormLabel>
              {" "}
              SHIPPER TYPE <span className="text-red-400">*</span>
            </FormLabel>
            <div className="flex flex-col sm:flex-row gap-10">
              <FormCheck className="m-2">
                <FormCheck.Input
                  id="radio-switch"
                  type="radio"
                  name="shipper_type_radio_button"
                  checked={senderDetails?.shipper_type == 1}
                  onClick={() =>
                    setSenderDetails((prev) => ({
                      ...prev,
                      shipper_type: 1,
                      otp: "",
                    }))
                  }
                />
                <FormCheck.Label>Individual</FormCheck.Label>
              </FormCheck>
              <FormCheck className="mt-2 mr-2 sm:mt-0">
                <FormCheck.Input
                  id="radio-switch"
                  type="radio"
                  name="shipper_type_radio_button"
                  checked={senderDetails?.shipper_type == 2}
                  onClick={() =>
                    setSenderDetails((prev) => ({
                      ...prev,
                      shipper_type: 2,
                    }))
                  }
                />
                <FormCheck.Label>MSME</FormCheck.Label>
              </FormCheck>
            </div>
          </div>
        )}

        {awbData?.pickup_data?.booking_shipment_type_id != 2 &&
          totalInvoiceValue > 50000 && (
            <>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="modal-form-5">
                  E-WayBill No.<span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  id="modal-form-5"
                  type="text"
                  value={senderDetails?.e_waybillno}
                  onChange={(e) =>
                    setSenderDetails({
                      ...senderDetails,
                      e_waybillno: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="modal-form-5">
                  E-WayBill Document <span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  id="modal-form-5"
                  type="file"
                  onChange={handleFileChange}
                  ref={uploadedFile}
                />
              </div>
            </>
          )}
      </div>
    </>
  );

  const senderFooter = (
    <>
      <Button
        type="button"
        className="w-20 p-1 bg-mustard border-none text-white"
        onClick={handleSenderClick}
      >
        Save
      </Button>
    </>
  );

  const [receiverDetails, setReceiverDetails] = useState({
    consignee_mobile_number: data?.consignee_mobile_number || "",
    consignee_email_id: data?.consignee_email_id || "",
    consignee_first_name: data?.consignee_first_name || "",
    consignee_company_name: data?.consignee_company_name || "",
    consignee_address_1: data?.consignee_address_1 || "",
    consignee_address_2: data?.consignee_address_2 || "",
    consignee_pincode: data?.destination_pincode,
    consignee_city: data?.city,
    consignee_state: data?.state,
    consignee_country: data?.consignee_country || "",
    consignee_reference_no: data?.consignee_reference_no || "",
    booking_invoice_number: data?.booking_invoice_number || "",
    booking_invoice_date: data?.booking_invoice_date,
    consignee_gst_number: data?.consignee_gst_number || "",
    consignee_doc_type: data?.consignee_doc_type || "1",
    delivery_instructions: data?.delivery_instructions || "",
  });
  const [receiverOpen, setReceiverOpen] = useState(false);
  const [receiverContactEdit, setReceiverContactEdit] = useState(
    receiverDetails?.consignee_mobile_number ? true : false
  );

  const handleReceiverClick = () => {
    for (const key in receiverDetails) {
      if (data?.booking_type == "2" && key == "consignee_email_id") {
        continue;
      }
      if (
        receiverDetails.hasOwnProperty(key) &&
        !data?.courier_code.includes("skynet") &&
        key == "delivery_instructions"
      ) {
        continue;
      }
      if (
        receiverDetails.hasOwnProperty(key) &&
        !data?.courier_code?.includes("aramex") &&
        !data?.courier_code?.includes("skynet") &&
        key == "consignee_gst_number"
      ) {
        continue;
      }
      if (
        receiverDetails.hasOwnProperty(key) &&
        !data?.courier_code.includes("skynet") &&
        key == "consignee_doc_type"
      ) {
        continue;
      }
      if (
        receiverDetails.hasOwnProperty(key) &&
        !data?.courier_code.includes("aramex") &&
        key == "booking_invoice_number"
      ) {
        continue;
      }
      if (receiverDetails.hasOwnProperty(key) && receiverDetails[key] === "") {
        showAlert(`${key.replaceAll("_", " ")} is required`, "error");
        return;
      }
    }
    setData((prev) => ({ ...prev, ...receiverDetails }));
    setReceiverOpen(false);
  };

  const handleDataReset = () => {
    setReceiverDetails((prev) => ({
      ...prev,
      consignee_mobile_number: "",
      consignee_email_id: "",
      consignee_first_name: "",
      consignee_company_name: "",
      consignee_address_1: "",
      consignee_address_2: "",
    }));

    // setData((prev) => ({
    //   ...prev,
    //   consignee_mobile_number: "",
    //   consignee_email_id: "",
    //   consignee_first_name: "",
    //   consignee_company_name: "",
    //   consignee_address_1: "",
    //   consignee_address_2: "",
    // }));
    // setUniqueReferenceNo(false);

    setReceiverContactEdit(false);
  };

  const receiverDescription = (
    <>
      <div className="grid grid-cols-12 gap-4 gap-y-3">
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-1">
            MOBILE NO <span className="text-red-500">*</span>
          </FormLabel>

          <InputGroup>
            <FormInput
              id="modal-form-1"
              type="text"
              maxLength={15}
              disabled={receiverContactEdit}
              value={receiverDetails?.consignee_mobile_number}
              onKeyDown={(e) => onlyNumbers(e)}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_mobile_number: e.target.value,
                }))
              }
            />
            {receiverContactEdit ? (
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
                {resetSpinner && (
                  <LoadingIcon
                    icon="puff"
                    color="white"
                    className="w-5 h-5 ml-2 stroke-2.5 text-white "
                  />
                )}
              </InputGroup.Text>
            )}
          </InputGroup>
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-4">
            EMAIL
            <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-4"
            type="email"
            value={receiverDetails?.consignee_email_id}
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
            FULL NAME <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-3"
            type="text"
            value={receiverDetails?.consignee_first_name}
            onChange={(e) =>
              setReceiverDetails((prev) => ({
                ...prev,
                consignee_first_name: e.target.value,
              }))
            }
          />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-2">
            COMPANY NAME <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-2"
            type="text"
            value={receiverDetails?.consignee_company_name}
            maxLength={data?.courier_code.includes("fedex") && 35}
            onPaste={(e) => {
              if (data?.courier_code.includes("fedex")) {
                const text = handlePaste(
                  receiverDetails?.consignee_company_name,
                  e,
                  35
                );
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_company_name: text,
                }));
                setData((prev) => ({
                  ...prev,
                  consignee_company_name: text,
                }));
              }
            }}
            onChange={(e) =>
              setReceiverDetails((prev) => ({
                ...prev,
                consignee_company_name: e.target.value,
              }))
            }
          />
        </div>

        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            FLAT/HOUSE NO. <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="text"
            placeholder=""
            value={receiverDetails?.consignee_address_1}
            disabled
            maxLength={data?.courier_code.includes("dhl") && 45}
            onPaste={(e) => {
              if (data?.courier_code.includes("dhl")) {
                const text = handlePaste(
                  receiverDetails?.consignee_address_1,
                  e,
                  45
                );
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_address_1: text,
                }));
                setData((prev) => ({
                  ...prev,
                  consignee_address_1: text,
                }));
              }
            }}
            onChange={(e) =>
              setReceiverDetails((prev) => ({
                ...prev,
                consignee_address_1: e.target.value,
              }))
            }
          />
        </div>

        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            STREET/LOCALITY <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="text"
            placeholder=""
            value={receiverDetails?.consignee_address_2}
            disabled
            maxLength={data?.courier_code.includes("dhl") && 45}
            onPaste={(e) => {
              if (data?.courier_code.includes("dhl")) {
                const text = handlePaste(
                  receiverDetails?.consignee_address_2,
                  e,
                  45
                );
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_address_2: text,
                }));
                setData((prev) => ({
                  ...prev,
                  consignee_address_2: text,
                }));
              }
            }}
            onChange={(e) =>
              setReceiverDetails((prev) => ({
                ...prev,
                consignee_address_2: e.target.value,
              }))
            }
          />
        </div>

        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            PINCODE <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="text"
            placeholder=""
            value={receiverDetails?.consignee_pincode}
            disabled
          />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            CITY <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="text"
            placeholder=""
            value={receiverDetails?.consignee_city}
            disabled
          />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            STATE <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="text"
            placeholder=""
            value={receiverDetails?.consignee_state}
            disabled
            onChange={(e) =>
              setReceiverDetails((prev) => ({
                ...prev,
                consignee_state: e.target.value,
              }))
            }
          />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            Country <span className="text-red-500">*</span>
          </FormLabel>

          <FormSelect
            id="modal-form-6"
            className={`w-[100%] `}
            value={receiverDetails?.consignee_country}
            disabled
          >
            <option value="0"> Select</option>
            {countryData.length > 0 &&
              countryData?.map((elem, index) => (
                <option key={index} value={elem?.country_name}>
                  {elem?.country_name}
                </option>
              ))}
          </FormSelect>
        </div>

        <div className="col-span-12 sm:col-span-6">
          <FormLabel>
            DELIVERY ADDRESS <span className="text-red-400">*</span>
          </FormLabel>
          <div className="flex flex-row gap-10">
            <FormCheck className="m-2">
              <FormCheck.Input
                id="radio-switch"
                type="radio"
                name="delivery_address_radio_button"
                checked={deliveryAddress == 1}
                onClick={() => {
                  setDeliveryAddress(1);
                  delete receiverDetails?.delivery_address_1;
                  delete receiverDetails?.delivery_address_2;
                  delete receiverDetails?.delivery_pincode;
                  delete receiverDetails?.delivery_city;
                  delete receiverDetails?.delivery_state;
                  delete data?.delivery_address_1;
                  delete data?.delivery_address_2;
                  delete data?.delivery_pincode;
                  delete data?.delivery_city;
                  delete data?.delivery_state;
                }}
              />
              <FormCheck.Label>Franchisee</FormCheck.Label>
            </FormCheck>
            <FormCheck className="mr-2">
              <FormCheck.Input
                id="radio-switch"
                type="radio"
                name="delivery_address_radio_button"
                checked={deliveryAddress == 2}
                onClick={() => {
                  setDeliveryAddress(2);
                  setReceiverDetails((prev) => ({
                    ...prev,
                    delivery_address_1: "",
                    delivery_address_2: "",
                    delivery_pincode: "",
                    delivery_city: "",
                    delivery_state: "",
                  }));
                }}
              />
              <FormCheck.Label>Different</FormCheck.Label>
            </FormCheck>
          </div>
        </div>

        {deliveryAddress == 2 && (
          <>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                FLAT/HOUSE NO. <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                id="modal-form-5"
                type="text"
                placeholder=""
                value={receiverDetails?.delivery_address_1}
                maxLength={data?.courier_code.includes("dhl") && 45}
                onPaste={(e) => {
                  if (data?.courier_code.includes("dhl")) {
                    const text = handlePaste(
                      receiverDetails?.delivery_address_1,
                      e,
                      45
                    );
                    setReceiverDetails((prev) => ({
                      ...prev,
                      delivery_address_1: text,
                    }));
                    setData((prev) => ({
                      ...prev,
                      delivery_address_1: text,
                    }));
                  }
                }}
                onChange={(e) =>
                  setReceiverDetails((prev) => ({
                    ...prev,
                    delivery_address_1: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                STREET/LOCALITY <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                id="modal-form-5"
                type="text"
                placeholder=""
                value={receiverDetails?.delivery_address_2}
                maxLength={data?.courier_code.includes("dhl") && 45}
                onPaste={(e) => {
                  if (data?.courier_code.includes("dhl")) {
                    const text = handlePaste(
                      receiverDetails?.delivery_address_2,
                      e,
                      45
                    );
                    setReceiverDetails((prev) => ({
                      ...prev,
                      delivery_address_2: text,
                    }));
                    setData((prev) => ({
                      ...prev,
                      delivery_address_2: text,
                    }));
                  }
                }}
                onChange={(e) =>
                  setReceiverDetails((prev) => ({
                    ...prev,
                    delivery_address_2: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                DELIVERY PINCODE <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                id="modal-form-5"
                type="text"
                placeholder=""
                value={receiverDetails?.delivery_pincode}
                maxLength={6}
                onChange={(e) =>
                  setReceiverDetails((prev) => ({
                    ...prev,
                    delivery_pincode: e.target.value.replace(/[^0-9.]/g, ""),
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                DELIVERY CITY <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                id="modal-form-5"
                type="text"
                placeholder=""
                value={receiverDetails?.delivery_city}
                onChange={(e) =>
                  setReceiverDetails((prev) => ({
                    ...prev,
                    delivery_city: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                DELIVERY STATE <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                id="modal-form-5"
                type="text"
                placeholder=""
                value={receiverDetails?.delivery_state}
                onChange={(e) =>
                  setReceiverDetails((prev) => ({
                    ...prev,
                    delivery_state: e.target.value,
                  }))
                }
              />
            </div>
          </>
        )}

        {data?.courier_code.includes("skynet") && (
          <>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-6">
                DOCUMENT TYPE <span className="text-red-500">*</span>{" "}
              </FormLabel>
              <FormSelect
                id="modal-form-6"
                value={receiverDetails?.consignee_doc_type}
                onChange={(e) =>
                  setReceiverDetails((prev) => ({
                    ...prev,
                    consignee_doc_type: e.target.value,
                  }))
                }
              >
                <option value="0">Select Document Type</option>
                {consigneeDocTypes &&
                  consigneeDocTypes?.map((elem, index) => (
                    <option value={elem?.id} key={index}>
                      {elem?.value}
                    </option>
                  ))}
              </FormSelect>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                {(consigneeDocTypes &&
                  consigneeDocTypes?.find(
                    (elem) => elem.id == receiverDetails?.consignee_doc_type
                  )?.value) ||
                  "Please select a document type"}
                <span className="text-red-500"> *</span>
              </FormLabel>

              <FormInput
                type="text"
                maxLength={15}
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
              <FormLabel htmlFor="modal-form-5">
                DELIVERY INSTRUCTIONS <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                type="text"
                value={receiverDetails?.delivery_instructions}
                onChange={(e: any) =>
                  setReceiverDetails((prev) => ({
                    ...prev,
                    delivery_instructions: e.target.value,
                  }))
                }
              />
            </div>
          </>
        )}

        {data?.booking_type == "1" && (
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-5">
              REFERENCE NUMBER{" "}
              {data?.courier_code?.includes("aramex") && (
                <span className="text-red-500">*</span>
              )}
            </FormLabel>
            <FormInput
              id="modal-form-5"
              type="text"
              value={receiverDetails?.consignee_reference_no}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_reference_no: e.target.value,
                }))
              }
            />
          </div>
        )}

        {data?.courier_code.includes("aramex") && (
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-5">
              GST Number <span className="text-red-500">*</span>
            </FormLabel>

            <FormInput
              type="text"
              maxLength={15}
              value={receiverDetails?.consignee_gst_number}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_gst_number: e.target.value,
                }))
              }
            />
          </div>
        )}

        {data?.booking_type == "1" && (
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-5">
              INVOICE NUMBER{" "}
              {data?.courier_code.includes("aramex") && (
                <span className="text-red-500">*</span>
              )}
            </FormLabel>
            <FormInput
              id="modal-form-5"
              type="text"
              value={receiverDetails?.booking_invoice_number}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  booking_invoice_number: e.target.value,
                }))
              }
            />
          </div>
        )}
        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-5">
            INVOICE DATE <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="date"
            value={receiverDetails?.booking_invoice_date}
            disabled
          />
        </div>
      </div>
    </>
  );

  const receiverFooter = (
    <>
      <Button
        type="button"
        className="w-20 p-1 bg-mustard border-none text-white"
        onClick={handleReceiverClick}
      >
        Save
      </Button>
    </>
  );

  const handleEdit = () => {
    if (
      editDimensionData?.item_description &&
      editDimensionData?.weight &&
      editDimensionData?.value &&
      editDimensionData?.quantity &&
      editDimensionData?.length &&
      editDimensionData?.breadth &&
      editDimensionData?.height
    ) {
      if (Number(editDimensionData.weight) <= 0) {
        showAlert("Weight should be greater than 0", "warning");
        return;
      }
      if (Number(editDimensionData.value) < 1) {
        showAlert("Value should not be less than 1", "warning");
        return;
      }
      if (Number(editDimensionData.quantity) < 1) {
        showAlert("Quantity should not be less than 1", "warning");
        return;
      }
      if (Number(editDimensionData.length) <= 0) {
        showAlert("Length should be greater than 0", "warning");
        return;
      }
      if (Number(editDimensionData.breadth) <= 0) {
        showAlert("Breadth should be greater than 0", "warning");
        return;
      }
      if (Number(editDimensionData.height) <= 0) {
        showAlert("Height should be greater than 0", "warning");
        return;
      }

      if (
        data?.booking_type == "1" &&
        isValidHsn(editDimensionData?.hsn_code)
      ) {
        const newData = dimensionData;
        newData[editIndex] = { ...editDimensionData };
        setDimensionData(newData);
        setCurrentStep(1);
        setCurrentFaq(1);
        setShipmentResponse("");
        setOpenModal(false);
      } else if (data?.booking_type == "2") {
        const newData = dimensionData;
        newData[editIndex] = { ...editDimensionData };
        setDimensionData(newData);
        setCurrentStep(1);
        setCurrentFaq(1);
        setShipmentResponse("");
        setOpenModal(false);
      } else {
        showAlert("Please Enter Valid HSN Code", "error");
      }
    } else {
      showAlert("Please fill all the fields", "error");
    }
  };

  const handleCreate = () => {
    if (
      editDimensionData?.item_description &&
      editDimensionData?.weight &&
      editDimensionData?.value &&
      editDimensionData?.quantity &&
      editDimensionData?.length &&
      editDimensionData?.breadth &&
      editDimensionData?.height
    ) {
      if (Number(editDimensionData?.weight) <= 0) {
        showAlert("Weight should be greater than 0", "warning");
        return;
      }
      if (Number(editDimensionData?.value) < 1) {
        showAlert("Value should not be less than 1", "warning");
        return;
      }
      if (Number(editDimensionData?.quantity) < 1) {
        showAlert("Quantity should not be less than 1", "warning");
        return;
      }
      if (Number(editDimensionData?.length) <= 0) {
        showAlert("Length should be greater than 0", "warning");
        return;
      }
      if (Number(editDimensionData?.breadth) <= 0) {
        showAlert("Breadth should be greater than 0", "warning");
        return;
      }
      if (Number(editDimensionData?.height) <= 0) {
        showAlert("Height should be greater than 0", "warning");
        return;
      }

      if (
        data?.booking_type == "1" &&
        isValidHsn(editDimensionData?.hsn_code)
      ) {
        setDimensionData((prev) => [...prev, editDimensionData]);
        setCurrentStep(1);
        setCurrentFaq(1);
        setShipmentResponse("");
        setOpenModal(false);
        setEditDimensionData([]);
      } else if (data?.booking_type == "2") {
        setDimensionData((prev) => [...prev, editDimensionData]);
        setCurrentStep(1);
        setCurrentFaq(1);
        setShipmentResponse("");
        setOpenModal(false);
        setEditDimensionData([]);
      } else {
        showAlert("Please Enter Valid HSN Code", "warning");
        return;
      }
    } else {
      showAlert("Please fill all the fields", "error");
    }
  };

  const handleDelete = (e, index) => {
    e.stopPropagation();
    e.isPropagationStopped();
    const newData = [...dimensionData];
    newData.splice(index, 1);

    if (newData.length === 0) {
      setData((prev) => ({
        ...prev,
        shipment_dimensions: "",
      }));
    } else {
      setData((prev) => ({
        ...prev,
        shipment_dimensions: JSON.stringify(newData),
      }));
    }

    setDimensionData(newData);
  };

  const getFranchiseeDetails = async (franchisee_id: string) => {
    try {
      const response = await Get_franchisee_details(franchisee_id);
      if (response?.status == 200) {
        if (response?.data?.data.length > 0) {
          setFranchiseeData(response?.data?.data[0]);
          setData((prev: any) => ({
            ...prev,
            destination_pincode:
              response?.data?.data[0]?.billing_address?.pincode,
            city: response?.data?.data[0]?.billing_address?.city,
            state: response?.data?.data[0]?.billing_address?.state,
            consignee_address_1:
              response?.data?.data[0]?.billing_address?.address_label,
            consignee_address_2:
              response?.data?.data[0]?.billing_address?.address,
            consignee_city: response?.data?.data[0]?.billing_address?.city,
            consignee_state: response?.data?.data[0]?.billing_address?.state,
            consignee_pincode:
              response?.data?.data[0]?.billing_address?.pincode,
          }));
          setReceiverDetails((prev: any) => ({
            ...prev,

            consignee_address_1:
              response?.data?.data[0]?.billing_address?.address_label,
            consignee_address_2:
              response?.data?.data[0]?.billing_address?.address,
            consignee_city: response?.data?.data[0]?.billing_address?.city,
            consignee_state: response?.data?.data[0]?.billing_address?.state,
            consignee_pincode:
              response?.data?.data[0]?.billing_address?.pincode,
          }));
        } else {
          setFranchiseeData(null);
          showAlert("Franchisee Details not available", "warning");
        }
      }
    } catch (error) {
      showAlert("Error while fetching Franchisee Details", "error");
    }
  };

  const getData = async () => {
    try {
      const response = await Get_country();
      if (response?.status == 200) {
        setCountryData(response?.data?.data);
        const country = response?.data?.data?.find(
          (ele: any) =>
            ele?.country_id == awbData?.pickup_data?.delivery_country_id
        );
        localStorage.setItem("rtodcode", country?.country_code);
        // setPincodeAvail(country?.pincode_avail || 0);
        // setCityAvail(country?.city_avail || 0);

        setData((prev: any) => ({
          ...prev,
          consigner_country: country?.country_name,
          origin_country_code: country?.country_code,
          origin_state:
            awbData?.shipper_data[0]?.state || country?.country_code,
        }));

        // setReceiverDetails((prev) => ({
        //   ...prev,
        //   consignee_country: country?.country_name,
        // }));
      } else {
        showAlert("Something went wrong", "error");
      }
    } catch (error) {
      showAlert("Something went wrong", "error");
    }

    Get_shipment().then((res) => {
      setShipmentTypes(res?.data?.data);
    });

    Get_Weight_Unit().then((res) => {
      setWeightUnit(res?.data?.data);
    });

    Get_Currency().then((res) => {
      setCurrencyData(res?.data?.data);
    });

    Get_document_type().then((res) => {
      setConsignerDocTypes(res?.data?.data);
      setConsigneeDocTypes(res?.data?.data);
      // console.log(res?.data?.data);
    });

    Get_gst_applicable().then((res) => {
      setGstApplicable(res?.data?.data);
      // console.log(res?.data?.data);
    });

    Get_tax_payment().then((res) => {
      setTaxPaymentOption(res?.data?.data);
      // console.log(res?.data?.data);
    });

    Get_export_type().then((res) => {
      // console.log(res?.data?.data);
      setExportTypesData(res?.data?.data);
    });
  };

  const getSkynetCode = async () => {
    try {
      const response: any = await Get_skynet_service_code_api(
        data?.shipment_type,
        data?.destination_country
      );
      // console.log(response, "sknyet");
      if (response?.status == 200) {
        setData((prev) => ({
          ...prev,
          service_code: response?.data?.serivce_code,
          package_type: response?.data?.package_type,
        }));
      } else if (response?.message == "Network Error") {
        showAlert(response?.message, "error");
      } else if (response?.response?.status == 500) {
        showAlert("Internal Error is Going on ..", "error");
      } else if (response?.response?.status == 400) {
        showAlert(response?.response?.message, "error");
      } else if (response?.response?.status == 401) {
        showAlert("Unauthorized", "error");
      } else if (response?.response?.status == 404) {
        showAlert("Not Found", "error");
      } else if (response?.response?.status == 502) {
        showAlert("Bad GateWay", "error");
      } else if (response?.response?.status == 406) {
        showAlert("Bad GateWay", "error");
      }
    } catch (err: any) {
      showAlert(err?.message, "error");
    }
  };
  const checkAcl = async (booking_charges: any) => {
    setAclSpinner(true);
    try {
      const response = await Check_acl(
        data?.franchisee_id,
        booking_charges,
        data?.airwaybilno
      );

      if (response?.data?.status == 200) {
        setCurrentStep(3);
        setCurrentFaq(3);
      } else if (response?.data?.status == 400) {
        showAlert(response?.data?.message.replaceAll("_", " "), "error");
      } else if (response?.response?.data?.status == 400) {
        showAlert(response?.response?.data?.message, "warning");
      } else {
        showAlert(
          response?.data?.message ||
            response?.response?.data?.message ||
            response?.message,
          "error"
        );
      }
    } catch (error) {
      showAlert("Something went wrong", "error");
    } finally {
      setAclSpinner(false);
    }
  };

  const handleRto = async () => {
    setSpinner(true);
    setShipmentResponse("");
    setIsError(false);
    setIsLoading(true);

    try {
      const result = await Rto_booking_api({
        ...data,
        counter: skartCounter,
      });
      if (result?.data?.status == 200) {
        setShipmentResponse(result?.data?.data[0]);
        setSkartCounter(0);
        setData((prev: any) => ({ ...prev, counter: 0 }));
        setCurrentStep(4);
        setCurrentFaq(4);
      } else if (result?.data?.status == 201) {
        setOtpField(true);
        showAlert(result?.data?.error_message, "success");
        setIsLoading(false);
        setSpinner(false);
      } else if (result?.response?.data?.status == 203) {
        showAlert(
          result?.data?.message || result?.response?.data?.message,
          "error"
        );
        setSkartCounter((prev) => Number(prev) + 1);
        setIsLoading(false);
        setSpinner(false);
      } else if (result?.response?.data?.status == 400) {
        showAlert(result?.response?.data?.error_message, "error");
        setSkartCounter((prev) => Number(prev) + 1);
        setIsLoading(false);
        setSpinner(false);
      } else if (result?.response?.data?.status == 500) {
        showAlert(result?.response?.data?.message, "error");
        setSkartCounter((prev) => Number(prev) + 1);
        setIsLoading(false);
        setSpinner(false);
      } else {
        showAlert(
          result?.data?.message ||
            result?.response?.data?.message ||
            result?.message,
          "error"
        );
        setSkartCounter((prev) => Number(prev) + 1);
        setIsLoading(false);
        setSpinner(false);
      }
    } catch (error) {
      setSkartCounter((prev) => Number(prev) + 1);
      setIsError(true);
    } finally {
      setSpinner(false);
      setIsLoading(false);
    }
  };
  const handleStepTwo = async () => {
    setCurrentFaq(1);
    const errors = {
      booking_shipment_type: data?.shipment_type || "",
      weight_unit: data?.unit?.weight_unit || "",
      length_unit: data?.unit?.length_unit || "",
      currency: data?.unit?.currency || "",

      ...(data?.shipment_type == 1 || data?.shipment_type == 4
        ? {
            shipment_dimensions: dimensionData || [],
          }
        : {}),
      ...(data?.shipment_type == 4
        ? {
            cargo_type: data?.cargo_type || "",
            clearance_type: data?.clearance_type || "",
            incoterm: data?.incoterm || "",
          }
        : {}),
      ...(data?.shipment_type == 2
        ? {
            description: data?.description || "",
            weight: data?.weight || "",
          }
        : {}),
    };

    for (const key in errors) {
      if (errors.hasOwnProperty(key) && errors[key] === "") {
        showAlert(`${key.replaceAll("_", " ")} is required`, "error");
        return;
      }
    }

    setVendorLoading(true);
    let rateData = {};

    if (data?.shipment_type == 2) {
      rateData = {
        franchisee: data?.franchisee_id,
        is_kawach: data?.is_kawach || 0,
        booking_type: data?.booking_type,
        origin_pincode: data?.origin_pincode,
        destination_pincode: data?.destination_pincode,
        city: data?.city,
        state_name: data?.state_name,
        destination_country: data?.destination_country_id,
        shipment_type: data?.shipment_type,
        unit: data?.unit,
        weight: data?.weight,
        description: data?.description,
        courier_id: data?.courier_id,
        ...(data?.is_spot == 1
          ? {
              is_spot: 1,
              rate: data?.rate,
              buy_rate: data?.buy_rate,
              is_per_kg: data?.is_per_kg,
            }
          : {}),
      };
    } else {
      rateData = {
        franchisee: data?.franchisee_id,
        is_kawach: data?.is_kawach || 0,
        booking_type: data?.booking_type,
        origin_pincode: data?.origin_pincode,
        destination_pincode: data?.destination_pincode,
        city: data?.city,
        state_name: data?.state_name,
        destination_country: data?.destination_country_id,
        shipment_type: data?.shipment_type,
        unit: data?.unit,
        shipment_dimensions: dimensionData,
        courier_id: data?.courier_id,
        ...(data?.is_spot == 1
          ? {
              is_spot: 1,
              rate: data?.rate,
              buy_rate: data?.buy_rate,
              is_per_kg: data?.is_per_kg,
            }
          : {}),
      };

      setData((prev) => ({
        ...prev,
        shipment_dimensions: JSON.stringify(dimensionData),
      }));
    }

    setRateSpinner(true);

    try {
      const res = await Editbooking_Price_comparison(rateData);

      if (res?.data?.status == 200) {
        setVendorData(res?.data?.data);
      } else {
        setVendorData([]);
      }
      setCurrentStep(2);

      setCurrentFaq(2);
    } catch (error) {
      // console.log(error);
      setVendorError(true);
    } finally {
      setVendorLoading(false);
      setRateSpinner(false);
    }
  };

  const description = (
    <>
      <div className="w-full h-auto overflow-y-auto text-left ">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8  p-2 rounded-lg ">
          <div>
            <FormLabel htmlFor="regular-form-1">Description</FormLabel>
            <FormInput
              type="text"
              placeholder="Description"
              id="item_description"
              className="capitalize"
              value={editDimensionData?.item_description}
              onKeyDown={(e) => disableSymbols(e)}
              onChange={(e) =>
                setEditDimensionData((prev: any) => ({
                  ...prev,
                  item_description: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <FormLabel htmlFor="regular-form-1">Weight</FormLabel>
            <FormInput
              type="number"
              placeholder="Weight"
              id="weight"
              value={editDimensionData?.weight}
              onChange={(e) =>
                setEditDimensionData((prev: any) => ({
                  ...prev,
                  weight: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <FormLabel htmlFor="regular-form-1">Value</FormLabel>
            <FormInput
              type="number"
              placeholder="Value"
              id="value"
              value={editDimensionData?.value}
              onChange={(e) =>
                setEditDimensionData((prev: any) => ({
                  ...prev,
                  value: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <FormLabel htmlFor="regular-form-1">Quantity</FormLabel>
            <FormInput
              type="number"
              placeholder="Quantity"
              id="quantity"
              step="1"
              value={editDimensionData?.quantity}
              onKeyDown={(e) => disableSymbols(e)}
              onChange={(e) =>
                setEditDimensionData((prev: any) => ({
                  ...prev,
                  quantity: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <FormLabel htmlFor="regular-form-1">Length</FormLabel>
            <FormInput
              type="number"
              placeholder="Length"
              id="length"
              value={editDimensionData?.length}
              onChange={(e) =>
                setEditDimensionData((prev: any) => ({
                  ...prev,
                  length: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <FormLabel htmlFor="regular-form-1">Breadth</FormLabel>
            <FormInput
              type="number"
              placeholder="Breadth"
              id="breadth"
              value={editDimensionData?.breadth}
              onChange={(e) =>
                setEditDimensionData((prev: any) => ({
                  ...prev,
                  breadth: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <FormLabel htmlFor="regular-form-1">Height</FormLabel>
            <FormInput
              type="number"
              placeholder="Height"
              id="height"
              value={editDimensionData?.height}
              onChange={(e) =>
                setEditDimensionData((prev: any) => ({
                  ...prev,
                  height: e.target.value,
                }))
              }
            />
          </div>
          {data?.booking_type != 2 && (
            <div>
              <FormLabel htmlFor="regular-form-1">HSN Code</FormLabel>
              <FormInput
                type="text"
                placeholder="HSN Code"
                minLength={6}
                maxLength={8}
                id="hsn_code"
                value={editDimensionData?.hsn_code}
                onChange={(e) =>
                  setEditDimensionData((prev: any) => ({
                    ...prev,
                    hsn_code: e.target.value.replaceAll(" ", ""),
                  }))
                }
              />
            </div>
          )}
        </div>
      </div>
    </>
  );

  const footer = (
    <>
      <Button
        type="button"
        className="bg-mustard border-none py-2 px-4 text-white rounded-xl"
        onClick={isEditDimension ? handleEdit : handleCreate}
      >
        {isEditDimension ? "UPDATE" : "SAVE"}
      </Button>
    </>
  );

  const priceDescription = (
    <>
      <Dialog.Description className="grid grid-cols-24 gap-4 gap-y-3">
        <p className="text-red-500"></p>
        <Table bordered hover className="border">
          <Table.Thead className=" text-left">
            <Table.Tr className="border p-1 space-y-1">
              <Table.Th className="border p-1">PARTICULARS</Table.Th>
              <Table.Th className="border p-1">CHARGES</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody className=" text-left">
            {priceDetailsData &&
              priceDetailsData?.selling_charges?.length > 0 &&
              priceDetailsData?.selling_charges?.map(
                (elem, index) =>
                  elem?.charge_amount != 0 && (
                    <Table.Tr className="border cursor-pointer p-1" key={index}>
                      <Table.Td
                        className={`border p-1 uppercase ${
                          elem?.charge_name ? "" : "text-center"
                        }`}
                      >
                        {elem?.charge_name ? elem?.charge_name : "- - - - -"}
                      </Table.Td>
                      <Table.Td className="border p-1">
                        {Number(elem?.charge_amount).toLocaleString("en-IN")}
                      </Table.Td>
                    </Table.Tr>
                  )
              )}

            <Table.Tr className="border p-1">
              <Table.Td className="border p-1 font-semibold">TOTAL</Table.Td>
              <Table.Td className="border p-1 font-semibold">
                {Number(
                  priceDetailsData?.grand_total_without_gst
                ).toLocaleString("en-IN")}
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Dialog.Description>
    </>
  );

  useEffect(() => {
    getData();
    getFranchiseeDetails(awbData?.pickup_data?.pickup_franchisee_id);
  }, []);
  return (
    <>
      <div className="overflow-y-scroll scrollbar-hidden h-[550px] md:h-full md:overflow-y-auto mb-8">
        <div
          className="p-2 my-2 cursor-pointer rounded-full shadow-lg mr-4 w-8 bg-white"
          onClick={() => {
            setAwbNo("");
            setShowRto(false);
          }}
        >
          <Lucide
            icon="ArrowLeft"
            className="w-4 h-4 stroke-2.5 text-mustard"
          />
        </div>
        <div className="w-full mt-2  flex justify-between gap-4">
          <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-0 justify-between w-full">
            <div
              className="box w-full md:w-[63%] px-4 py-2  intro-x font-medium cursor-pointer text-sm flex flex-col md:flex-row justify-between gap-4 rounded-lg bg-white h-auto"
              // onClick={() => setShowChangeVendor(false)}
            >
              <div>
                <div className="flex gap-2">
                  <span className="mt-2 text-sm md:text-lg font-bold">
                    ORIGIN
                  </span>
                  {/* {!shipmentResponse && (
                        <Tippy
                          content="Change Origin "
                          options={{ placement: "top" }}
                        >
                          <Lucide
                            icon="Pencil"
                            className="w-4 h-4 stroke-2.5 mt-2 text-mustard"
                            onClick={() => setOriginModal(true)}
                          />
                        </Tippy>
                      )}
    
                      {originModal && (
                        <Modal
                          size="md"
                          title={"Change Origin"}
                          open={originModal}
                          setOpen={setOriginModal}
                          description={originDescription}
                          footer={originFooter}
                        />
                      )} */}
                </div>

                <div className="flex gap-2 ">
                  <div className="text-center p-1 border-2 mx-auto h-14 w-10 rounded">
                    <img
                      src="https://flagsapi.com/IN/flat/32.png"
                      alt="origin-flag"
                    />
                    <span className="text-sm">
                      ({data?.origin_country_code})
                    </span>
                  </div>
                  <div className="mx-auto p-1 pt-2 h-14 min-w-28 border-2 rounded flex flex-col  justify-center">
                    <h1 className="font-medium text-sm md:text-lg">INDIA</h1>
                    <p className="">({data?.origin_pincode})</p>
                  </div>
                </div>
              </div>

              <div className=" mt-11 hidden sm:flex">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                  className="w-5 h-5 opacity-25 hidden md:block"
                  alt="dot-icon"
                />
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                  className="w-5 h-5 opacity-50 hidden md:block"
                  alt="dot-icon"
                />
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                  className="w-5 h-5 opacity-75 hidden md:block"
                  alt="dot-icon"
                />
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                  className="w-5 h-5 hidden md:block"
                  alt="dot-icon"
                />
                <img
                  src="https://cdn-icons-png.flaticon.com/512/61/61212.png"
                  className="w-5 h-5 "
                  alt="plane-icon"
                />
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                  className="w-5 h-5 hidden md:block"
                  alt="dot-icon"
                />
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                  className="w-5 h-5 opacity-75 hidden md:block"
                  alt="dot-icon"
                />
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                  className="w-5 h-5 opacity-50 hidden md:block"
                  alt="dot-icon"
                />
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                  className="w-5 h-5 opacity-25 hidden md:block"
                  alt="dot-icon"
                />
              </div>

              <div className="flex sm:hidden rotate-90 justify-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/61/61212.png"
                  className="w-6 h-6 "
                  alt="plane-icon"
                />
              </div>

              <div>
                <div className="flex gap-2">
                  <span className="mt-2 text-sm md:text-lg font-bold">
                    DESTINATION
                  </span>
                  {/* {!shipmentResponse && (
                        <Tippy
                          content="Change Destination "
                          options={{ placement: "top" }}
                        >
                          <Lucide
                            icon="Pencil"
                            className="w-4 h-4 stroke-2.5 mt-2 text-mustard"
                            onClick={() => setDestinationModal(true)}
                          />
                        </Tippy>
                      )} */}

                  {/* {destinationModal && (
                        <Modal
                          size="md"
                          title={"Change Destination"}
                          open={destinationModal}
                          setOpen={setDestinationModal}
                          description={destinationDescription}
                          footer={destinationFooter}
                        />
                      )} */}
                </div>

                <div className="flex gap-2 ">
                  <div className="text-center p-1 border-2 mx-auto h-14 w-10 rounded">
                    <img
                      src={
                        data?.booking_type == 2
                          ? `https://flagsapi.com/IN/flat/32.png`
                          : `https://flagsapi.com/${data?.destination_country_code}/flat/32.png`
                      }
                      alt="destination-flag"
                    />
                    <span className="text-sm">
                      ({data?.destination_country_code})
                    </span>
                  </div>
                  <div className="mx-auto p-1 pt-2 min-w-28 h-14 border-2 rounded flex flex-col  justify-center text-wrap">
                    <h1 className="font-medium text-sm md:text-lg">
                      {data?.destination_country}
                    </h1>
                    <p className="">({data?.destination_pincode})</p>
                  </div>
                </div>
              </div>
            </div>
            {franchiseeData && (
              <div className="intro-x rounded-lg w-full md:w-[35%] h-full">
                <div className="flex items-center px-4 py-3 h-full box  w-full">
                  <div className=" mr-auto  w-[70%]">
                    <div className="text-base font-medium whitespace-nowrap overflow-hidden overflow-ellipsis">
                      {franchiseeData?.franchisee_name}
                    </div>
                    <div className="text-slate-500 text-sm mt-0.5">{`AWB No : ${data?.airwaybilno}`}</div>
                  </div>
                  <div className="px-2 py-1 w-[30%] text-sm text-center font-medium text-white rounded-full cursor-pointer bg-green-500 whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {Number(
                      Number(franchiseeData?.available_credit_limit).toFixed(2)
                    ).toLocaleString("en-IN")}{" "}
                    /-
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-col md:flex-row gap-4 md:gap-0  justify-between tbl-overflow-x-auto">
          <div className="w-full md:w-[63%]">
            <Disclosure defaultOpen>
              {({ open }) => (
                <div className="bg-white rounded-lg intro-y">
                  <Disclosure.Button
                    onClick={() => setCurrentStep(1)}
                    className="flex w-full justify-between rounded-lg bg-white px-4 py-2 text-left text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                  >
                    <span>SHIPMENT DETAILS</span>

                    <Lucide
                      icon="ChevronUp"
                      onClick={() => setCurrentStep(1)}
                      className={`${
                        currentStep == 1 ? "" : "rotate-180 transform"
                      } h-5 w-5  text-mustard`}
                    />
                  </Disclosure.Button>
                  {currentStep == 1 && (
                    <Disclosure.Panel
                      static={true}
                      className="px-4 pb-2 pt-4 text-sm text-gray-500 border-t"
                    >
                      <div>
                        <div className="min-w-lg mx-auto ">
                          <div className="grid grid-cols-1  md:grid-cols-2 gap-6">
                            <div>
                              <FormLabel
                                htmlFor="directParty"
                                className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
                              >
                                SHIPMENT TYPE{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>

                              <FormSelect
                                value={data?.shipment_type}
                                onChange={(e) => {
                                  if (e.target.value == 1) {
                                    delete data?.weight;
                                    delete data?.description;
                                  }
                                  setData({
                                    ...data,
                                    shipment_type: e.target.value,
                                    shipment_dimensions: "[]",
                                  });
                                  setDimensionData([]);
                                  skartCounter(0);
                                  setShipmentResponse("");
                                  setCurrentStep(1);
                                  setCurrentFaq(1);
                                }}
                                disabled={shipmentResponse}
                              >
                                <option value="">Select Shipment Type</option>
                                {shipmentTypes
                                  ?.filter(
                                    (item) =>
                                      item?.booking_shipment_type_id !== 4
                                  )
                                  ?.map(
                                    (type) =>
                                      type?.is_active == 1 && (
                                        <option
                                          key={type?.booking_shipment_type_id}
                                          value={type?.booking_shipment_type_id}
                                        >
                                          {type?.shipment_type}
                                        </option>
                                      )
                                  )}
                              </FormSelect>
                            </div>
                            <div className="mb-2">
                              <FormLabel
                                htmlFor="units"
                                className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
                              >
                                UNITS <span className="text-red-500">*</span>
                              </FormLabel>

                              <div className="flex gap-4">
                                <FormSelect
                                  className="uppercase"
                                  value={data?.unit?.weight_unit}
                                  onChange={(e) => {
                                    setData({
                                      ...data,
                                      unit: {
                                        ...data.unit,
                                        weight_unit: e.target.value,
                                      },
                                    });
                                  }}
                                  disabled={shipmentResponse}
                                >
                                  <option value="">Select</option>
                                  {weightUnit &&
                                    weightUnit?.map((data, index) => (
                                      <option
                                        className="uppercase"
                                        key={index}
                                        value={data?.value}
                                      >
                                        {data?.value}
                                      </option>
                                    ))}
                                </FormSelect>

                                <FormSelect
                                  className="uppercase"
                                  value={data?.unit?.currency}
                                  disabled={shipmentResponse}
                                  onChange={(e) => {
                                    setData({
                                      ...data,
                                      unit: {
                                        ...data?.unit,
                                        currency: e.target.value,
                                      },
                                    });
                                  }}
                                >
                                  <option value="">Select</option>
                                  {currencyData &&
                                    currencyData?.map((data, index) => (
                                      <option key={index} value={data?.id}>
                                        {data?.currency}
                                      </option>
                                    ))}
                                </FormSelect>
                                <FormSelect className="uppercase" disabled>
                                  <option value={data?.unit?.length_unit}>
                                    {data?.unit?.length_unit}
                                  </option>
                                </FormSelect>
                              </div>
                            </div>
                          </div>
                        </div>
                        {data?.booking_type == 1 &&
                          data?.shipment_type == 4 && (
                            <div className="grid grid-cols-3 gap-4 px-5 max-w-4xl">
                              <div className="mb-5">
                                <FormLabel
                                  htmlFor="directParty"
                                  className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
                                >
                                  CARGO TYPE{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>

                                <FormSelect
                                  id="default"
                                  value={data?.cargo_type}
                                  disabled
                                >
                                  <option value="">Select Cargo Type</option>
                                </FormSelect>
                              </div>
                              <div>
                                <FormLabel
                                  htmlFor="directParty"
                                  className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
                                >
                                  CLEARANCE TYPE{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>

                                <FormSelect
                                  id="default"
                                  value={data?.clearance_type}
                                  disabled
                                >
                                  <option value="">
                                    Select Clearance Type
                                  </option>
                                </FormSelect>
                              </div>
                              <div>
                                <FormLabel
                                  htmlFor="directParty"
                                  className="block mb-2 text-base font-medium text-gray-900 dark:text-white"
                                >
                                  INCOTERM{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>

                                <FormSelect
                                  id="default"
                                  value={data?.incoterm}
                                  disabled
                                >
                                  <option value="">Select Incoterm</option>
                                </FormSelect>
                              </div>
                            </div>
                          )}

                        {data?.shipment_type == 2 ? (
                          <div className=" my-4 grid grid-cols-2 gap-6">
                            <div>
                              <FormLabel
                                htmlFor="description"
                                className="text-base font-medium text-gray-900"
                              >
                                Description
                              </FormLabel>
                              <FormInput
                                id="regular-form-1"
                                type="text"
                                className="capitalize"
                                value={data?.description}
                                disabled={shipmentResponse}
                                onChange={(e) => {
                                  setCurrentStep(1);
                                  setCurrentFaq(1);
                                  setData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }));
                                }}
                              />
                            </div>
                            <div>
                              <FormLabel
                                htmlFor="weight"
                                className="text-base font-medium text-gray-900"
                              >
                                Weight
                              </FormLabel>
                              <FormInput
                                id="regular-form-1"
                                type="number"
                                value={data?.weight}
                                disabled={shipmentResponse}
                                onChange={(e) => {
                                  setCurrentStep(1);
                                  setCurrentFaq(1);
                                  setData((prev) => ({
                                    ...prev,
                                    weight: e.target.value,
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="my-3">
                            {dimensionData?.length > 0 ? (
                              <div className="mt-2">
                                <FormLabel
                                  htmlFor="regular-form-1"
                                  className="text-base font-medium text-gray-900"
                                >
                                  {" "}
                                  SHIPMENT DIMENSION
                                </FormLabel>

                                <div className="p-2 w-full box cursor-pointer  border border-gray-200 flex justify-between items-end">
                                  <div className=" flex flex-wrap gap-2 ">
                                    {dimensionData?.map(
                                      (elem, index) =>
                                        elem?.item_description && (
                                          <div
                                            key={index}
                                            className=" flex px-2 py-1 gap-4 mr-2 bg-slate-300 items-center justify-between  rounded-lg"
                                          >
                                            <span
                                              className=" text-lg flex capitalize "
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.isPropagationStopped();
                                                setOpenModal(true);
                                                setIsEditDimension(true);
                                                setEditDimensionData(elem);
                                                setEditIndex(index);
                                              }}
                                            >
                                              {" "}
                                              {elem?.item_description}
                                            </span>
                                            <Tippy
                                              content="Delete Dimension"
                                              options={{ placement: "top" }}
                                            >
                                              <Lucide
                                                icon="XCircle"
                                                className="    text-red-500 stroke-2.5 "
                                                onClick={(e) =>
                                                  handleDelete(e, index)
                                                }
                                              />
                                            </Tippy>
                                          </div>
                                        )
                                    )}
                                  </div>
                                  {!shipmentResponse && (
                                    <Tippy
                                      content="Add More Dimesions"
                                      options={{ placement: "top" }}
                                    >
                                      <Lucide
                                        icon="PlusCircle"
                                        className="w-6 h-6 mr-2 mb-1 stroke-2.5 text-mustard"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.isPropagationStopped();
                                          setEditDimensionData({});
                                          setEditIndex("");
                                          setIsEditDimension(false);
                                          setOpenModal(true);
                                        }}
                                      />
                                    </Tippy>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <Button
                                  variant="primary"
                                  className=" p-2 bg-mustard border-none"
                                  onClick={() => {
                                    setOpenModal(true);
                                    setIsEditDimension(false);
                                  }}
                                >
                                  Add Dimension
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        <Modal
                          size="lg"
                          title={"Shipment Dimension"}
                          open={openModal}
                          setOpen={setOpenModal}
                          description={description}
                          footer={footer}
                        />
                      </div>

                      {(data?.weight && data?.description) ||
                      dimensionData.length >= 1 ? (
                        <div className="grid justify-items-end mt-4 mb-2">
                          <Button
                            variant="primary"
                            size="lg"
                            className=" mr-1 bg-mustard border-none"
                            onClick={handleStepTwo}
                            disabled={rateSpinner || shipmentResponse}
                          >
                            Next
                            {rateSpinner && (
                              <LoadingIcon
                                icon="puff"
                                color="white"
                                className="w-5 h-5 ml-2 stroke-2.5 text-white"
                              />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <></>
                      )}
                    </Disclosure.Panel>
                  )}
                </div>
              )}
            </Disclosure>

            {shipperPreview && (
              <ShipperInvoiceModal
                open={shipperPreview}
                onClose={() => {
                  setShipperPreview(false);
                }}
                checkAcl={checkAcl}
                booking={data}
                setBooking={setData}
              />
            )}

            <div className="w-full md:hidden block mt-4">
              {currentFaq >= 2 ? (
                isVendorLoading ? (
                  <div className=" w-full h-72 my-8 flex md:hidden justify-center items-center">
                    <LoadingIcon
                      icon="tail-spin"
                      className="block m-auto w-[35%] "
                    />
                  </div>
                ) : isVendorError ? (
                  <div className="flex md:hidden justify-center">
                    <img src={ErrorGif} alt="error-gif" className="w-48 h-24" />
                  </div>
                ) : vendorData && vendorData?.length > 0 ? (
                  <>
                    <Disclosure as="div" defaultOpen>
                      {({ open }) => (
                        <div className="bg-white rounded-lg intro-x">
                          <Disclosure.Button
                            onClick={() => {
                              setCurrentStep(2);
                              // setCurrentFaq(2);
                            }}
                            className="flex w-full justify-between rounded-lg bg-white px-4 py-2 text-left text-sm font-medium  focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                          >
                            <span>PRICE COMPARISONS</span>
                            <Lucide
                              icon="ChevronUp"
                              onClick={() => {
                                setCurrentStep(2);
                                // setCurrentFaq(2);
                              }}
                              className={`${
                                currentStep == 2 ? "" : "rotate-180 transform"
                              } h-5 w-5 text-mustard`}
                            />
                          </Disclosure.Button>
                          {currentStep == 2 && (
                            <Disclosure.Panel
                              static={true}
                              className=" pb-2 px-2 text-sm text-gray-500 border-t"
                            >
                              <div className="py-3">
                                <p className="text-red-500 text-center  text-sm font-normal">
                                  * The prices shown here are exclusive of GST
                                </p>
                                <p className="text-red-500 text-center text-sm font-normal">
                                  ** Estimated delivery is calculated from the
                                  date of handover to vendor
                                </p>
                              </div>
                              <div className="overflow-x-auto">
                                <Table className="border text-center ">
                                  <Table.Thead>
                                    <Table.Tr className="border p-1 text-sm text-center space-y-1">
                                      <Table.Th className="border p-1 text-sm"></Table.Th>
                                      <Table.Th className="border p-1 text-sm whitespace-nowrap">
                                        PRODUCT
                                      </Table.Th>
                                      <Table.Th className="border p-1 text-sm ">
                                        PRODUCT TYPE
                                      </Table.Th>
                                      <Table.Th className="border p-1 text-sm whitespace-nowrap">
                                        COST
                                      </Table.Th>
                                      <Table.Th className="border p-1 text-sm whitespace-nowrap">
                                        WEIGHT
                                      </Table.Th>
                                      <Table.Th className="border p-1 text-sm">
                                        <p>
                                          ESTIMATED
                                          <span className="text-red-500 ml-1">
                                            **
                                          </span>
                                        </p>
                                        <p> DELIVERY</p>
                                      </Table.Th>
                                    </Table.Tr>
                                  </Table.Thead>
                                  <Table.Tbody className="p-0">
                                    {vendorData.length > 0 &&
                                      vendorData?.map((elem, index) => (
                                        <Table.Tr
                                          className="border p-1 text-sm"
                                          key={index}
                                        >
                                          <Table.Td className="border p-1 text-sm">
                                            <FormCheck.Input
                                              id="radio-switch-1_mmobile"
                                              type="radio"
                                              name="radio_button"
                                              checked={
                                                data?.courier_id ==
                                                elem?.courier_id
                                              }
                                            />
                                          </Table.Td>
                                          <Table.Td className="border p-1 text-sm ">
                                            {elem?.parent_vendor}
                                          </Table.Td>
                                          <Table.Td className="border p-1 text-sm ">
                                            {elem?.product_name}
                                          </Table.Td>
                                          <Table.Td
                                            className="border p-1 text-sm whitespace-nowrap cursor-pointer text-blue-600"
                                            onClick={() => {
                                              setPriceDetailsData(elem);
                                              setIsOpen(true);
                                            }}
                                          >
                                            {Number(
                                              Number(
                                                elem?.grand_total_without_gst
                                              ).toFixed(2)
                                            ).toLocaleString("en-IN")}
                                            /-
                                          </Table.Td>
                                          <Table.Td className="border p-1 text-sm whitespace-nowrap">
                                            {Number(
                                              elem?.actual_weight
                                            ).toFixed(2)}
                                            kgs
                                          </Table.Td>
                                          <Table.Td className="border p-1 text-sm whitespace-nowrap">
                                            {elem?.tat_days} DAYS
                                          </Table.Td>
                                        </Table.Tr>
                                      ))}
                                  </Table.Tbody>
                                </Table>
                              </div>

                              <Modal
                                open={isOpen}
                                title="Price in Detail"
                                size="md"
                                setOpen={setIsOpen}
                                description={priceDescription}
                                footer={null}
                              />

                              <div className="flex justify-end my-3">
                                <Button
                                  elevated
                                  rounded
                                  disabled={shipmentResponse || aclSpinner}
                                  className="p-1 w-20 bg-mustard border-none text-white text-lg font-medium"
                                  onClick={(
                                    e: React.MouseEvent<HTMLButtonElement>
                                  ) => {
                                    if (
                                      (vendorData[0]?.special_code?.toLowerCase() ==
                                        "ups" ||
                                        vendorData[0]?.special_code?.toLowerCase() ==
                                          "fedex") &&
                                      data?.shipment_type == "1"
                                    ) {
                                      setShipperPreview(true);
                                    } else {
                                      delete data?.invoiceData;
                                      checkAcl(
                                        vendorData[0]?.grand_total_with_gst
                                      );
                                    }

                                    setData((prev) => ({
                                      ...prev,
                                      courier_id: vendorData[0]?.courier_id,
                                      courier_code: vendorData[0]?.special_code
                                        ? vendorData[0]?.special_code.toLowerCase()
                                        : vendorData[0]?.special_code,
                                      courier_name: vendorData[0]?.product_name,
                                      courier_vendor_code:
                                        vendorData[0]?.product_code,
                                      shipment_charges: vendorData[0],
                                    }));

                                    if (
                                      vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("aramex")
                                    ) {
                                      setSenderDetails((prev) => ({
                                        ...prev,
                                        tax_paid:
                                          Number(
                                            awbData?.additional_data?.tax_paid
                                          ) || "",
                                        tax_amount:
                                          awbData?.additional_data
                                            ?.tax_amount || "",
                                        export_type:
                                          awbData?.additional_data
                                            ?.export_type || "",
                                      }));

                                      setReceiverDetails((prev) => ({
                                        ...prev,
                                        consignee_gst_number:
                                          awbData?.additional_data
                                            ?.consignee_gst_number || "",
                                      }));

                                      setData((prev) => ({
                                        ...prev,
                                        tax_paid:
                                          Number(
                                            awbData?.additional_data?.tax_paid
                                          ) || "",
                                        tax_amount:
                                          awbData?.additional_data
                                            ?.tax_amount || "",
                                        export_type:
                                          awbData?.additional_data
                                            ?.export_type || "",
                                        consignee_gst_number:
                                          awbData?.additional_data
                                            ?.consignee_gst_number || "",
                                      }));
                                    }

                                    if (
                                      vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("skynet")
                                    ) {
                                      getSkynetCode();
                                    }
                                  }}
                                >
                                  Book{" "}
                                  {aclSpinner && (
                                    <LoadingIcon
                                      icon="puff"
                                      color="white"
                                      className="w-5 h-5 ml-2 stroke-2.5 text-white"
                                    />
                                  )}
                                </Button>
                              </div>
                            </Disclosure.Panel>
                          )}
                        </div>
                      )}
                    </Disclosure>
                  </>
                ) : (
                  <div className="box text-red-500 font-medium text-lg w-full md:w-[35%] h-36 flex md:hidden items-center justify-center">
                    Vendor Not Available for this region !!
                  </div>
                )
              ) : null}
            </div>

            {currentFaq >= 3 && (
              <Disclosure as="div" className="mt-2" defaultOpen>
                {({ open }) => (
                  <div className="bg-white rounded-lg intro-y">
                    <Disclosure.Button
                      onClick={() => setCurrentStep(3)}
                      className="flex w-full justify-between rounded-lg bg-white px-4 py-2 text-left text-sm font-medium  focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                    >
                      <span>ADDRESS DETAILS</span>
                      <Lucide
                        icon="ChevronUp"
                        onClick={() => setCurrentStep(3)}
                        className={`${
                          currentStep == 3 ? "" : "rotate-180 transform"
                        } h-5 w-5 text-mustard`}
                      />
                    </Disclosure.Button>
                    {currentStep == 3 && (
                      <Disclosure.Panel
                        static={true}
                        className="px-4 pb-2 pt-4 text-sm text-gray-500 border-t"
                      >
                        <div className="grid grid-cols-2">
                          <div className="flex gap-4 items-center">
                            {" "}
                            <h1 className="font-bold text-sm md:text-lg whitespace-nowrap">
                              Sender Details
                            </h1>
                            <Tippy
                              content="Sender Details"
                              options={{ placement: "right" }}
                            >
                              <Lucide
                                icon="PlusCircle"
                                className="w-6 h-6 cursor-pointer text-mustard"
                                onClick={() => {
                                  setSenderDetails((prev) => ({
                                    ...prev,
                                    consigner_mobile_number:
                                      data?.consigner_mobile_number || "",
                                    consigner_email_id:
                                      data?.consigner_email_id || "",
                                    consigner_first_name:
                                      data?.consigner_first_name || "",
                                    consigner_company_name:
                                      data?.consigner_company_name || "",
                                    consigner_address_1:
                                      data?.consigner_address_1 || "",
                                    consigner_address_2:
                                      data?.consigner_address_2 || "",
                                    kyc_details: data?.kyc_details || "",
                                  }));

                                  setSenderContactEdit(
                                    data?.consigner_mobile_number ? true : false
                                  );
                                  setSenderOpen(true);
                                }}
                              />
                            </Tippy>
                            <Modal
                              data={data}
                              setData={setData}
                              open={senderOpen}
                              setOpen={setSenderOpen}
                              title="Sender Details"
                              size="lg"
                              overflow={true}
                              description={senderDescription}
                              footer={senderFooter}
                            />
                          </div>
                          <div className="flex gap-4 items-center">
                            {" "}
                            <h1 className="font-bold text-sm md:text-lg whitespace-nowrap">
                              Receiver Details
                            </h1>
                            <Tippy
                              content="Receiver Details"
                              options={{ placement: "right" }}
                            >
                              <Lucide
                                icon="PlusCircle"
                                className="w-6 h-6 cursor-pointer text-mustard"
                                onClick={() => {
                                  setReceiverDetails((prev) => ({
                                    ...prev,
                                    consignee_mobile_number:
                                      data?.consignee_mobile_number || "",
                                    consignee_email_id:
                                      data?.consignee_email_id || "",
                                    consignee_first_name:
                                      data?.consignee_first_name || "",
                                    consignee_company_name:
                                      data?.consignee_company_name || "",
                                    consignee_address_1:
                                      data?.consignee_address_1 || "",
                                    consignee_address_2:
                                      data?.consignee_address_2 || "",
                                  }));
                                  setReceiverContactEdit(
                                    data?.consignee_mobile_number ? true : false
                                  );
                                  setReceiverOpen(true);
                                }}
                              />
                            </Tippy>
                            <Modal
                              data={data}
                              setData={setData}
                              open={receiverOpen}
                              setOpen={setReceiverOpen}
                              title="Receiver Details"
                              size="lg"
                              overflow={true}
                              description={receiverDescription}
                              footer={receiverFooter}
                            />
                          </div>

                          <div>
                            <p className="font-semibold ">
                              {data?.consigner_first_name}
                            </p>
                            <p className="font-semibold ">
                              {data?.consigner_address_1}
                            </p>
                            <p className="font-semibold ">
                              {data?.consigner_city}
                            </p>
                            <p className="font-semibold ">
                              {" "}
                              {data?.consigner_pincode}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold ">
                              {data?.consignee_first_name}
                            </p>
                            <p className="font-semibold ">
                              {data?.consignee_address_1}
                            </p>
                            <p className="font-semibold ">
                              {data?.consignee_city}
                            </p>
                            <p className="font-semibold ">
                              {" "}
                              {data?.consignee_pincode}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-4">
                          {data?.shipper_type == 1 &&
                            otpField == true &&
                            data?.courier_code?.includes("dhl") && (
                              <div className="col-span-12 sm:col-span-6 my-4">
                                <FormInput
                                  id="modal-form-5"
                                  type="text"
                                  placeholder="Enter OTP"
                                  className="w-32"
                                  value={data?.otp}
                                  onChange={(e) =>
                                    setData((prev) => ({
                                      ...prev,
                                      otp: e.target.value?.trim(),
                                    }))
                                  }
                                />
                              </div>
                            )}
                          <Button
                            variant="primary"
                            rounded
                            className="my-4 mr-1 p-2 px-4 bg-mustard border-none font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 hover:bg-opacity-90 hover:border-opacity-90 text-center disabled:opacity-70 disabled:cursor-not-allowed text-white"
                            onClick={handleRto}
                            disabled={
                              !data?.consigner_mobile_number ||
                              !data?.consigner_company_name ||
                              !data?.consigner_first_name ||
                              !data?.consigner_address_1 ||
                              !data?.consigner_address_2 ||
                              !data?.consigner_city ||
                              !data?.consigner_state ||
                              !data?.consigner_pincode ||
                              !data?.consignee_mobile_number ||
                              !data?.consignee_company_name ||
                              !data?.consignee_first_name ||
                              !data?.consignee_address_1 ||
                              !data?.consignee_address_2 ||
                              !data?.consignee_city ||
                              !data?.consignee_state ||
                              !data?.consignee_pincode ||
                              spinner ||
                              shipmentResponse ||
                              (data?.booking_type == "1" &&
                                !data?.consigner_gst_number) ||
                              (data?.booking_type == "1" &&
                                data?.shipment_type != "2" &&
                                !data?.kyc_details) ||
                              (data?.booking_type == "1" &&
                                !data.consignee_email_id) ||
                              (data?.booking_type == "1" &&
                                !data.consigner_email_id) ||
                              (data?.courier_code?.includes("aramex") &&
                                !data?.export_type) ||
                              (data?.courier_code?.includes("aramex") &&
                                !data?.tax_paid) ||
                              (data?.courier_code?.includes("aramex") &&
                                !data?.consignee_reference_no) ||
                              ((data?.courier_code?.includes("aramex") ||
                                data?.courier_code?.includes("skynet")) &&
                                !data?.consignee_gst_number) ||
                              (data?.courier_code?.includes("skynet") &&
                                (!data?.consignee_doc_type ||
                                  data?.consignee_doc_type == "N/A")) ||
                              (data?.courier_code?.includes("skynet") &&
                                (!data?.delivery_instructions ||
                                  data?.delivery_instructions == "N/A")) ||
                              (data?.shipment_type != "4" &&
                                data?.courier_code?.includes("dhl") &&
                                !data?.shipper_type) ||
                              (data?.shipment_type != "2" &&
                                totalInvoiceValue > 50000 &&
                                (!data?.e_waybillno || !data?.document))
                            }
                          >
                            CONFIRM ORDER
                            {spinner && (
                              <LoadingIcon
                                icon="puff"
                                color="white"
                                className="w-5 h-5 ml-2 stroke-2.5 text-white"
                              />
                            )}
                          </Button>
                        </div>
                      </Disclosure.Panel>
                    )}
                  </div>
                )}
              </Disclosure>
            )}

            {isLoading ? (
              <div className="flex justify-center">
                <img src={LoadingGif} alt="loading-gif" />
              </div>
            ) : isError ? (
              <div className="flex justify-center">
                <img src={ErrorGif} alt="error-gif" className="w-48 h-24" />
              </div>
            ) : (
              <></>
            )}

            {shipmentResponse && currentFaq >= 4 ? (
              <Disclosure as="div" className="mt-2" defaultOpen>
                {({ open }) => (
                  <div className="bg-white rounded-lg intro-y">
                    <Disclosure.Button
                      onClick={() => setCurrentStep(4)}
                      className="flex w-full justify-between rounded-lg px-4 py-2 text-left text-sm font-medium  focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                    >
                      <span>AWB DETAILS</span>
                      <Lucide
                        icon="ChevronUp"
                        onClick={() => setCurrentStep(4)}
                        className={`${
                          currentStep == 4 ? "" : "rotate-180 transform"
                        } h-5 w-5 text-mustard`}
                      />
                    </Disclosure.Button>
                    {currentStep == 4 && (
                      <Disclosure.Panel
                        static={true}
                        className="px-4 pb-2 pt-4 text-sm text-gray-500 border-t"
                      >
                        <div className="flex justify-center">
                          <Table className="border text-center max-w-lg">
                            <Table.Thead>
                              <Table.Tr className="border p-1 space-y-1">
                                <Table.Th className="border p-1">
                                  PARTICULAR
                                </Table.Th>
                                <Table.Th className="border p-1">
                                  VALUE
                                </Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody className="p-0">
                              <Table.Tr className="border p-1">
                                <Table.Td className="border p-1">
                                  AWB NO
                                </Table.Td>
                                <Table.Td className="border p-1">
                                  {shipmentResponse?.airwaybilno}
                                </Table.Td>
                              </Table.Tr>
                              <Table.Tr className="border p-1">
                                <Table.Td className="border p-1">
                                  Courier Service
                                </Table.Td>
                                <Table.Td className="border p-1 uppercase">
                                  {data?.courier_name}
                                </Table.Td>
                              </Table.Tr>
                              <Table.Tr className="border p-1">
                                <Table.Td className="border p-1">
                                  Grand Total
                                </Table.Td>
                                <Table.Td className="border p-1">
                                  Rs.{" "}
                                  {Number(
                                    data?.shipment_charges?.grand_total_with_gst
                                  ).toLocaleString("en-IN")}
                                  /-
                                </Table.Td>
                              </Table.Tr>
                            </Table.Tbody>
                          </Table>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-around mt-4 gap-4">
                          <Button
                            elevated
                            rounded
                            className="w-full p-2 px-4 bg-mustard border-none text-white"
                          >
                            <Link
                              to={
                                data?.courier_code.includes("ups")
                                  ? shipmentResponse?.merge_url
                                  : shipmentResponse?.dispatch_url
                              }
                              target="_blank"
                            >
                              DISPATCH LABEL
                            </Link>
                          </Button>
                          <Button
                            elevated
                            rounded
                            disabled={!shipmentResponse?.invoice_url}
                            className="w-full p-2 bg-mustard border-none text-white"
                          >
                            <Link
                              to={shipmentResponse?.invoice_url}
                              target="_blank"
                            >
                              PROFORMA INVOICE
                            </Link>
                          </Button>

                          {shipmentResponse?.proforma_url && (
                            <Button
                              elevated
                              rounded
                              className="w-full p-2 px-4 bg-mustard border-none text-white"
                            >
                              <Link
                                to={shipmentResponse?.proforma_url}
                                target="_blank"
                              >
                                SHIPPER INVOICE
                              </Link>
                            </Button>
                          )}

                          {shipmentResponse?.authority_letter && (
                            <Button
                              elevated
                              rounded
                              className="w-full p-2 px-4 bg-mustard border-none text-white"
                            >
                              <Link
                                to={shipmentResponse?.authority_letter}
                                target="_blank"
                              >
                                AUTHORITY LETTER
                              </Link>
                            </Button>
                          )}
                          {shipmentResponse?.house_url && (
                            <Button
                              elevated
                              rounded
                              className="w-full p-2 px-4 bg-mustard border-none text-white"
                            >
                              <Link
                                to={shipmentResponse?.house_url}
                                target="_blank"
                              >
                                HOUSE TEMPLATE
                              </Link>
                            </Button>
                          )}
                        </div>
                      </Disclosure.Panel>
                    )}
                  </div>
                )}
              </Disclosure>
            ) : (
              <></>
            )}
          </div>

          {currentFaq >= 2 ? (
            isVendorLoading ? (
              <div className="w-full md:w-[35%] h-72 my-8 md:flex   hidden justify-center items-center">
                <LoadingIcon
                  icon="tail-spin"
                  className="block m-auto w-[35%] "
                />
              </div>
            ) : isVendorError ? (
              <div className="md:flex   hidden justify-center w-full md:w-[35%]">
                <img src={ErrorGif} alt="error-gif" className="w-48 h-24" />
              </div>
            ) : vendorData && vendorData?.length > 0 ? (
              <>
                <Disclosure
                  as="div"
                  defaultOpen
                  className="w-full md:w-[35%] hidden md:block"
                >
                  {({ open }) => (
                    <div className="bg-white rounded-lg intro-x w-full">
                      <Disclosure.Button
                        onClick={() => {
                          setCurrentStep(2);
                          // setCurrentFaq(2);
                        }}
                        className="flex w-full justify-between rounded-lg bg-white px-4 py-2 text-left text-sm font-medium  focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                      >
                        <span className="w-full">PRICE COMPARISONS</span>
                        <Lucide
                          icon="ChevronUp"
                          onClick={() => {
                            setCurrentStep(2);
                            // setCurrentFaq(2);
                          }}
                          className={`${
                            currentStep == 2 ? "" : "rotate-180 transform"
                          } h-5 w-5 text-mustard`}
                        />
                      </Disclosure.Button>
                      {currentStep == 2 && (
                        <Disclosure.Panel
                          static={true}
                          className=" pb-2 px-2 text-sm text-gray-500 border-t"
                        >
                          <div className="py-3">
                            <p className="text-red-500 text-center  text-sm font-normal">
                              * The prices shown here are exclusive of GST
                            </p>
                            <p className="text-red-500 text-center text-sm font-normal">
                              ** Estimated delivery is calculated from the date
                              of handover to vendor
                            </p>
                          </div>
                          <div className="overflow-x-auto">
                            <Table className="border text-center ">
                              <Table.Thead>
                                <Table.Tr className="border p-1 text-sm text-center space-y-1">
                                  <Table.Th className="border p-1 text-sm"></Table.Th>
                                  <Table.Th className="border p-1 text-sm whitespace-nowrap">
                                    PRODUCT
                                  </Table.Th>
                                  <Table.Th className="border p-1 text-sm ">
                                    PRODUCT TYPE
                                  </Table.Th>
                                  <Table.Th className="border p-1 text-sm whitespace-nowrap">
                                    COST
                                  </Table.Th>
                                  <Table.Th className="border p-1 text-sm whitespace-nowrap">
                                    WEIGHT
                                  </Table.Th>
                                  <Table.Th className="border p-1 text-sm">
                                    <p>
                                      ESTIMATED
                                      <span className="text-red-500 ml-1">
                                        **
                                      </span>
                                    </p>
                                    <p> DELIVERY</p>
                                  </Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody className="p-0">
                                {vendorData.length > 0 &&
                                  vendorData?.map((elem, index) => (
                                    <Table.Tr
                                      className="border p-1 text-sm"
                                      key={index}
                                    >
                                      <Table.Td className="border p-1 text-sm">
                                        <FormCheck.Input
                                          id="radio-switch-1"
                                          type="radio"
                                          name="radio_button"
                                          checked={
                                            data?.courier_id == elem?.courier_id
                                          }
                                        />
                                      </Table.Td>
                                      <Table.Td className="border p-1 text-sm ">
                                        {elem?.parent_vendor}
                                      </Table.Td>
                                      <Table.Td className="border p-1 text-sm ">
                                        {elem?.product_name}
                                      </Table.Td>
                                      <Table.Td
                                        className="border p-1 text-sm whitespace-nowrap cursor-pointer text-blue-600"
                                        onClick={() => {
                                          setPriceDetailsData(elem);
                                          setIsOpen(true);
                                        }}
                                      >
                                        {Number(
                                          Number(
                                            elem?.grand_total_without_gst
                                          ).toFixed(2)
                                        ).toLocaleString("en-IN")}
                                        /-
                                      </Table.Td>
                                      <Table.Td className="border p-1 text-sm whitespace-nowrap">
                                        {Number(elem?.actual_weight).toFixed(2)}
                                        kgs
                                      </Table.Td>
                                      <Table.Td className="border p-1 text-sm whitespace-nowrap">
                                        {elem?.tat_days} DAYS
                                      </Table.Td>
                                    </Table.Tr>
                                  ))}
                              </Table.Tbody>
                            </Table>
                          </div>

                          <Modal
                            open={isOpen}
                            title="Price in Detail"
                            size="md"
                            setOpen={setIsOpen}
                            description={priceDescription}
                            footer={null}
                          />

                          <div className="flex justify-end my-3">
                            <Button
                              elevated
                              rounded
                              disabled={shipmentResponse || aclSpinner}
                              className="p-1 w-20 bg-mustard border-none text-white text-lg font-medium"
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => {
                                if (
                                  (vendorData[0]?.special_code?.toLowerCase() ==
                                    "ups" ||
                                    vendorData[0]?.special_code?.toLowerCase() ==
                                      "fedex") &&
                                  data?.shipment_type == "1"
                                ) {
                                  setShipperPreview(true);
                                } else {
                                  delete data?.invoiceData;
                                  checkAcl(vendorData[0]?.grand_total_with_gst);
                                }

                                setData((prev) => ({
                                  ...prev,
                                  courier_id: vendorData[0]?.courier_id,
                                  courier_code: vendorData[0]?.special_code
                                    ? vendorData[0]?.special_code.toLowerCase()
                                    : vendorData[0]?.special_code,
                                  courier_name: vendorData[0]?.product_name,
                                  courier_vendor_code:
                                    vendorData[0]?.product_code,
                                  shipment_charges: vendorData[0],
                                }));

                                if (
                                  vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("aramex")
                                ) {
                                  setSenderDetails((prev) => ({
                                    ...prev,
                                    tax_paid:
                                      Number(
                                        awbData?.additional_data?.tax_paid
                                      ) || "",
                                    tax_amount:
                                      awbData?.additional_data?.tax_amount ||
                                      "",
                                    export_type:
                                      awbData?.additional_data?.export_type ||
                                      "",
                                  }));

                                  setReceiverDetails((prev) => ({
                                    ...prev,
                                    consignee_gst_number:
                                      awbData?.additional_data
                                        ?.consignee_gst_number || "",
                                  }));

                                  setData((prev) => ({
                                    ...prev,
                                    tax_paid:
                                      Number(
                                        awbData?.additional_data?.tax_paid
                                      ) || "",
                                    tax_amount:
                                      awbData?.additional_data?.tax_amount ||
                                      "",
                                    export_type:
                                      awbData?.additional_data?.export_type ||
                                      "",
                                    consignee_gst_number:
                                      awbData?.additional_data
                                        ?.consignee_gst_number || "",
                                  }));
                                }

                                if (
                                  vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("skynet")
                                ) {
                                  getSkynetCode();
                                }
                              }}
                            >
                              Book
                              {aclSpinner && (
                                <LoadingIcon
                                  icon="puff"
                                  color="white"
                                  className="w-5 h-5 ml-2 stroke-2.5 text-white"
                                />
                              )}
                            </Button>
                          </div>
                        </Disclosure.Panel>
                      )}
                    </div>
                  )}
                </Disclosure>
              </>
            ) : (
              <div className="box text-red-500 font-medium text-lg w-full md:w-[35%] h-36 md:flex   hidden items-center justify-center">
                Vendor Not Available for this region !!
              </div>
            )
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Rto;
