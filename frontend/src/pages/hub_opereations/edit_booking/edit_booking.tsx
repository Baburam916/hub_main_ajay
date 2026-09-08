import React, { useEffect, useRef, useState } from "react";
import {
  Check_acl,
  Get_country,
  Get_document_type,
  Get_export_type,
  Get_franchisee_details,
  Get_gst_applicable,
  Get_skynet_service_code_api,
  Get_tax_payment,
  Editbooking_Price_comparison,
  Edit_booking_api,
  Get_shipment,
  Get_Weight_Unit,
  Get_Currency,
  getLocalPincodeApi,
  Get_kyc_organization,
  Get_kyc_document,
  getConsigneeDetailsApi,
  getConsignerDetailsApi,
  UpdateKycApi,
  purposeOfShipmentApi,
  Get_Incoterm,
  check_prohibited_hsncode,
  Pga_hsncode_Api,
  common_get,
  uploadShipperInvoiceApi,
  getShipnstockCountriesApi,
  getShipnstockStatesApi,
} from "../../../AllServices/services";
import CommonSearchableAll from "../../../components/commonSearchableAll";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Dialog, Disclosure } from "@headlessui/react";
import Lucide from "../../../base-components/Lucide";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormSelect,
  FormSwitch,
  InputGroup,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";
import Tippy from "../../../base-components/Tippy";
import {
  disableSymbols,
  getCourierMaxLength,
  handleConditionalPaste,
  handlePaste,
  isValidHsn,
  onlyNumbers,
} from "../../../utils";
import Modal from "../../../components/Modal";
import LoadingGif from "../../../assets/images/loading.gif";
import ErrorGif from "../../../assets/images/error.gif";
import Table from "../../../base-components/Table";
import { Link } from "react-router-dom";
import TomSelect from "../../../base-components/TomSelect";
import AutoCompleteZipcode from "./AutoCompleteZipcode";
import AutoCompleteCity from "./AutoCompleteCity";
import noPreview from "/images/no-preview.png";
import "../../../components/Table/index.css";
import ShipperInvoiceModal from "./shipperInvoiceModal";
import Courier_commercial_icon from "../../../assets/images/courier_commercial_icon.png";
import ReceiverIcon from "../../../assets/images/receivericon.png";

const edit_booking = ({ awbData, setShowEditBooking, setAwbNo }) => {

  const [dimensionData, setDimensionData] = useState<Array<any>>(
    awbData?.pickup_item,
  );
  const { showAlert } = useAlert();
  const [isOpen, setIsOpen] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentFaq, setCurrentFaq] = useState(1);
  const [rateSpinner, setRateSpinner] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isVendorLoading, setVendorLoading] = useState(false);
  const [isVendorError, setVendorError] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [vendorData, setVendorData] = useState([]);
  const [isEditDimension, setIsEditDimension] = useState(false);
  const [editIndex, setEditIndex] = useState<any>();
  const [editDimensionData, setEditDimensionData] = useState<any>();
  const [franchiseeData, setFranchiseeData] = useState(null);
  const [shipmentResponse, setShipmentResponse] = useState();
  const [priceDetailsData, setPriceDetailsData] = useState({});
  const [senderOpen, setSenderOpen] = useState(false);
  const [receiverOpen, setReceiverOpen] = useState(false);
  const [skartCounter, setSkartCounter] = useState(0);
  const [consignerDocTypes, setConsignerDocTypes] = useState([]);
  const [consigneeDocTypes, setConsigneeDocTypes] = useState([]);
  const [gstApplicable, setGstApplicable] = useState([]);
  const [taxPaymentOption, setTaxPaymentOption] = useState([]);
  const [otpField, setOtpField] = useState(false);
  const [exportTypesData, setExportTypesData] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shipmentTypes, setShipmentTypes] = useState([]);
  const [weightUnit, setWeightUnit] = useState([]);
  const [currencyData, setCurrencyData] = useState([]);
  const [shipmentPurpose, setShipmentPurpose] = useState([]);
  const [invoiceType, setInvoiceType] = useState([]);
  const [invoiceTerm, setInvoiceTerm] = useState([]);
  const [data, setData] = useState<any>({
    airwaybill_no: awbData?.pickup_data?.airwaybilno,
    franchisee_id: awbData?.pickup_data?.pickup_franchisee_id,
    hub_id: awbData?.pickup_data?.hub_id,
    branch_id: awbData?.pickup_data?.pickup_branch_id,
    is_kawach: awbData?.pickup_data?.is_kawach || 0,
    is_direct_cust: awbData?.pickup_data?.is_direct_cust || 0,
    is_overseas: awbData?.pickup_data?.is_overseas || 0,
    import_booking: awbData?.pickup_data?.import_booking || 1,
    import_booking_type: awbData?.pickup_data?.import_booking_type || 1,
    direct_party: "walk-in",
    booking_type: awbData?.pickup_data?.is_domestic,
    origin_pincode:
      awbData?.pickup_data?.import_booking == 2
        ? awbData?.pickup_data?.origin_pincode
        : awbData?.shipper_data[0]?.pincode,
    origin_country_code:
      awbData?.pickup_data?.import_booking == 2
        ? awbData?.pickup_data?.origin_country_code
        : "IN",
    destination_pincode:
      awbData?.pickup_data?.import_booking == 2
        ? awbData?.pickup_data?.destination_pincode
        : awbData?.consignee_data[0]?.international_zipcode || "",
    destination_country:
      awbData?.pickup_data?.import_booking == 2
        ? awbData?.pickup_data?.destination_country
        : awbData?.consignee_data[0]?.destination_country || "",
    destination_country_id: awbData?.pickup_data?.delivery_country_id,
    destination_country_code:
      awbData?.pickup_data?.import_booking == 2
        ? awbData?.pickup_data?.destination_country_code
        : awbData?.consignee_data[0]?.destination_country_code || "",
    origin_city:
      awbData?.pickup_data?.import_booking == 2
        ? awbData?.pickup_data?.origin_city
        : awbData?.shipper_data[0]?.city_name || "",
    origin_state:
      awbData?.pickup_data?.import_booking == 2
        ? awbData?.pickup_data?.origin_state
        : awbData?.shipper_data[0]?.state || "",
    origin_state_code:
      awbData?.pickup_data?.import_booking == 2
        ? awbData?.pickup_data?.origin_state_code
        : awbData?.pickup_data?.origin_state_code || "",
    city:
      awbData?.pickup_data?.import_booking == 2
        ? awbData?.pickup_data?.city
        : awbData?.consignee_data[0]?.city || "",
    state:
      awbData?.pickup_data?.import_booking == 2
        ? awbData?.pickup_data?.state
        : awbData?.consignee_data[0]?.state || "",
    shipment_type: awbData?.pickup_data?.booking_shipment_type_id,
    unit: {
      weight_unit: awbData?.pickup_data?.weight_unit,
      length_unit: awbData?.pickup_data?.dimention_unit,
      currency: awbData?.get_currency_data[0]?.id,
    },
    consigner_first_name: awbData?.shipper_data[0]?.shipper_name,
    consigner_company_name: awbData?.shipper_data[0]?.company_name,
    consigner_mobile_number: awbData?.shipper_data[0]?.mobile_no,
    consigner_email_id: awbData?.shipper_data[0]?.email_id,
    consigner_address_1: awbData?.shipper_data[0]?.gst_registered_address,
    consigner_address_2: awbData?.shipper_data[0]?.street_address,
    consigner_city: awbData?.shipper_data[0]?.city_name,
    consigner_pincode: awbData?.shipper_data[0]?.pincode,
    consigner_state: awbData?.shipper_data[0]?.state,
    consigner_doc_type: awbData?.shipper_data[0]?.doc_type,
    consignee_first_name: awbData?.consignee_data[0]?.first_name,
    consignee_company_name: awbData?.consignee_data[0]?.company_name,
    consignee_mobile_number: awbData?.consignee_data[0]?.mobile_no,
    consignee_email_id: awbData?.consignee_data[0]?.email_id,
    consignee_address_1: awbData?.consignee_data[0]?.address1,
    consignee_address_2: awbData?.consignee_data[0]?.address2,
    consignee_city: awbData?.consignee_data[0]?.city,
    consignee_pincode: awbData?.consignee_data[0]?.international_zipcode,
    consignee_state: awbData?.consignee_data[0]?.state,
    consignee_country: awbData?.pickup_data?.destination_country || "",
    consignee_reference_no: awbData?.pickup_data?.order_referenceno,
    booking_invoice_number: awbData?.pickup_data?.booking_invoice_no,
    booking_invoice_date: awbData?.pickup_data?.invoice_date,
    consigner_gst_number: awbData?.shipper_data[0]?.gstin,
    consignee_gst_number: awbData?.additional_data?.consignee_gst_number || "",
    consignee_doc_type: awbData?.additional_data?.consignee_doc_type || "1",
    consignee_tax_id: awbData?.consignee_tax_id || "",
    delivery_instructions:
      awbData?.additional_data?.delivery_instructions || "",
    consigner_gst_applicable: awbData?.pickup_data?.gst_applicable,
    flag: "edit_booking",
    counter: skartCounter,
    consigner_tax_payment:
      awbData?.additional_data?.consigner_tax_payment || "3",
    kyc_details: awbData?.kyc_details[0],
    pickup_required: "2",
    shipper_type: awbData?.additional_data?.shipper_type || "1",
    otp: "",
    shipment_purpose: awbData?.pickup_data?.shipment_purpose || "",
    state_name:
      awbData?.pickup_data?.import_booking == 2
        ? awbData?.pickup_data?.state_name
        : awbData?.consignee_data[0]?.state_name || "",
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
        is_spot: 1,
        rate: awbData?.isSpotData[0]?.spot_price,
        buy_rate: awbData?.isSpotData[0]?.buy_price,
        is_per_kg: awbData?.isSpotData[0]?.price_type == "2" ? 1 : 0,
        weight_from: awbData?.isSpotData[0]?.weight_from,
        weight_to: awbData?.isSpotData[0]?.weight_to,
        booking_id: `${awbData?.isSpotData[0]?.id}`,
      }
      : {}),
    ...(awbData?.pickup_data?.is_domestic == 1 &&
      awbData?.pickup_data?.booking_shipment_type_id == 7
      ? {
        ad_code: awbData?.pickup_data?.ad_code || "",
        iec_code: awbData?.pickup_data?.iec_code || "",
        invoice_type: awbData?.pickup_data?.invoice_type || "",
        invoice_term: awbData?.pickup_data?.invoice_term || "",
        iec_no: awbData?.pickup_data?.iec_no || "",
        iec_branch_code: awbData?.pickup_data?.iec_branch_code || "",
        export_using_ecommerce:
          awbData?.pickup_data?.export_using_ecommerce || "",
        meis_scheme: awbData?.pickup_data?.meis_scheme || "",
        export_is_payment: awbData?.pickup_data?.export_is_payment || "",
        bond_or_ut: awbData?.pickup_data?.bond_or_ut || "",
        total_igst: awbData?.pickup_data?.total_igst || "",
        total_cess: awbData?.pickup_data?.total?.pickup_data_cess || "",
        uom: awbData?.pickup_data?.uom || "",
        bank_account_number: awbData?.pickup_data?.bank_account_number || "",
        nefi: awbData?.pickup_data?.nefi || "",
      }
      : {}),
    ...(awbData?.pickup_data?.import_booking == 2
      ? {
        origin_country: awbData?.pickup_data?.origin_country,
        origin_country_id: awbData?.pickup_data?.origin_country_id,
      }
      : {}),
    incoterm: awbData?.pickup_data?.inco_term || "1",
    ...(awbData?.pickup_data?.is_domestic == 2
      ? {
        order_id: awbData?.pickup_data?.order_id || "",
        is_cod: awbData?.pickup_data?.is_cod || 0,
      }
      : {}),
    ...(awbData?.pickup_data?.shipper_invoice
      ? { shipper_invoice: awbData?.pickup_data?.shipper_invoice }
      : {}),
  });

  const isShipnstock =
    data?.courier_code?.includes("shipnstock") && data?.import_booking == 1;

  const shipment_value = dimensionData?.reduce(
    (sum: number, item: any) => sum + (Number(item?.value) || 0),
    0,
  );

  const [pincodeAvail, setPincodeAvail] = useState(
    data?.origin_pincode == "0000" ? 1 : 0,
  );
  const [cityAvail, setCityAvail] = useState(data?.origin_city ? 1 : 0);

  const [showField, setShowField] = useState(false);
  const restrictedCountries = ["BH", "IQ", "QA", "AE", "KW", "OM", "SA"];
  const isRestricted = restrictedCountries.includes(
    data?.destination_country_code,
  );
  const [pga, setPga] = useState(false);
  const [incotermType, setIncotermType] = useState([]);
  const [shipperPreview, setShipperPreview] = useState(false);
  const [originModal, setOriginModal] = useState(false);
  const [destinationModal, setDestinationModal] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const fileInput1Ref = useRef(null);
  const fileInput2Ref = useRef(null);
  const [kycSpinner, setKycSpinner] = useState(false);
  const [organizationTypes, setOrganizationTypes] = useState([]);
  const [organizationDocs, setOrganizationDocs] = useState([]);
  const [selectedOrganizationType, setSelectedOrganizationType] = useState("");
  const [selectedDocOne, setSelectedDocOne] = useState("");
  const [selectedDocTwo, setSelectedDocTwo] = useState("");
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [previewContent1, setPreviewContent1] = useState(
    <img
      src={noPreview}
      alt="No File Chosen"
      width="250px"
      height="150px!important"
    />,
  );
  const [previewContent2, setPreviewContent2] = useState(
    <img
      src={noPreview}
      alt="No File Chosen"
      width="250px"
      height="150px!important"
    />,
  );
  const [aclSpinner, setAclSpinner] = useState(false);

  const handleOrganizationTypeChange = () => {
    handleReset();
    setPreviewContent1(
      <img
        src={noPreview}
        alt="No File Chosen"
        width="250px"
        height="150px!important"
      />,
    );
    setFile1(null);
    setPreviewContent2(
      <img
        src={noPreview}
        alt="No File Chosen"
        width="250px"
        height="150px!important"
      />,
    );
    setFile2(null);

    setSelectedDocOne("");
    setSelectedDocTwo("");
  };

  const handleFileChange1 = (e) => {
    const selectedFile = e.target.files[0];
    setFile1(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;
        if (selectedFile.type.startsWith("image/")) {
          setPreviewContent1(
            <img
              src={fileContent}
              alt="Preview"
              width="250px"
              height="150px!important"
            />,
          );
        } else if (selectedFile.type === "application/pdf") {
          setPreviewContent1(
            <embed
              src={fileContent}
              type="application/pdf"
              width="100%"
              height="250px!important"
            />,
          );
        } else {
          showAlert("Unsupported file type", "error");
          // console.log("Unsupported file type");
        }
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewContent1(
        <img
          src={noPreview}
          alt="Default"
          width="250px"
          height="150px!important"
        />,
      );
    }
  };

  const handleFileChange2 = (e) => {
    const selectedFile = e.target.files[0];
    setFile2(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;
        if (selectedFile.type.startsWith("image/")) {
          setPreviewContent2(
            <img
              src={fileContent}
              alt="Preview"
              width="250px"
              height="150px!important"
            />,
          );
        } else if (selectedFile.type === "application/pdf") {
          setPreviewContent2(
            <embed
              src={fileContent}
              type="application/pdf"
              width="100%"
              height="250px!important"
            />,
          );
        } else {
          showAlert("Unsupported file type", "error");
          // console.log("Unsupported file type");
        }
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewContent2(
        <img
          src={noPreview}
          alt="Default"
          width="250px"
          height="150px!important"
        />,
      );
    }
  };

  const handleUploadKyc = async () => {
    try {
      const formData = new FormData();

      if (selectedOrganizationType) {
        formData.append("organisation_type_id", selectedOrganizationType);
      } else {
        showAlert("Please select organisation type", "error");
        return;
      }
      if (selectedDocOne) {
        formData.append("document_1_id", selectedDocOne);
      } else {
        showAlert("Please select document one type", "error");
        return;
      }
      if (file1) {
        formData.append("document_1", file1);
      } else {
        showAlert("Please upload document one", "error");
        return;
      }
      if (selectedDocTwo) {
        formData.append("document_2_id", selectedDocTwo);
      } else {
        showAlert("Please  select document two type", "error");
        return;
      }

      if (file2) {
        formData.append("document_2", file2);
      } else {
        showAlert("Please upload document two", "error");
        return;
      }

      setKycSpinner(true);
      const response = await UpdateKycApi(formData);
      if (response?.status === 200) {
        if (data?.import_booking == 2) {
          setReceiverDetails((prev) => ({
            ...prev,
            kyc_details: {
              orgnization_id: selectedOrganizationType,
              document_id_1: selectedDocOne,
              document_id_2: selectedDocTwo,
              document_path_1: response?.data?.doc_1,
              document_path_2: response?.data?.doc_2,
            },
            ...(response?.data?.message_v1
              ? {
                kyc_message: response?.data?.message_v1 || true,
                kyc_ocr_data: response?.data?.kyc_ocr_data || [],
              }
              : {}),
          }));
        } else {
          setSenderDetails((prev) => ({
            ...prev,
            kyc_details: {
              orgnization_id: selectedOrganizationType,
              document_id_1: selectedDocOne,
              document_id_2: selectedDocTwo,
              document_path_1: response?.data?.doc_1,
              document_path_2: response?.data?.doc_2,
            },
            ...(response?.data?.message_v1
              ? {
                kyc_message: response?.data?.message_v1 || true,
                kyc_ocr_data: response?.data?.kyc_ocr_data || [],
              }
              : {}),
          }));
        }
        setData((prev) => ({
          ...prev,
          kyc_details: {
            orgnization_id: selectedOrganizationType,
            document_id_1: selectedDocOne,
            document_id_2: selectedDocTwo,
            document_path_1: response?.data?.doc_1,
            document_path_2: response?.data?.doc_2,
          },
          ...(response?.data?.message_v1
            ? {
              kyc_message: response?.data?.message_v1 || true,
              kyc_ocr_data: response?.data?.kyc_ocr_data || [],
            }
            : {}),
        }));

        // console.log(response?.data, "kycmodal");

        showAlert(
          response?.data?.message_v1
            ? response?.data?.message_v1
            : "KYC Uploaded successfully",
          response?.data?.message_v1 ? "warning" : "success",
        );
        setSelectedOrganizationType("");
        handleOrganizationTypeChange();

        setKycModalOpen(false);
      } else if (response.status === 400) {
        showAlert(response.data.message, "error");
      } else if (response.status === 401) {
        showAlert("Unauthorized", "error");
      } else if (response.status === 404) {
        showAlert("Not Found", "error");
      } else if (
        response.status === 500 ||
        response.status === 502 ||
        response.status === 406
      ) {
        showAlert("Internal Server Error", "error");
      } else {
        showAlert("Unexpected Error", "error");
      }
    } catch (error) {
      showAlert("Error uploading KYC documents", "error");
      console.error("Error uploading KYC documents:", error);
    } finally {
      setKycSpinner(false);
    }
  };

  const handleReset = () => {
    fileInput1Ref.current.value = null;
    fileInput2Ref.current.value = null;
  };

  const kycDescription = (
    <>
      {" "}
      <div>
        <FormLabel htmlFor="modal-form-6">
          Organization <span className="text-red-500">*</span>{" "}
        </FormLabel>
        <FormSelect
          id="modal-form-6"
          onChange={(e) => {
            setSelectedOrganizationType(e.target.value);
            handleOrganizationTypeChange();
          }}
          value={selectedOrganizationType}
        >
          <option value="">Select Organization Type</option>
          {organizationTypes &&
            organizationTypes?.map((elem, index) => (
              <option key={index} value={elem?.id}>
                {elem?.value}
              </option>
            ))}
        </FormSelect>
      </div>
      <div className="flex justify-between items-center my-4 gap-4 pb-4 border-b">
        <div className="flex justify-between gap-2 ">
          <div className="w-[40%]">
            <FormLabel htmlFor="modal-form-6 ">
              Document One <span className="text-red-500">*</span>{" "}
            </FormLabel>
            <FormSelect
              id="modal-form-6"
              onChange={(e) => setSelectedDocOne(e.target.value)}
              value={selectedDocOne}
            >
              <option value="">Select Document Type</option>
              {selectedOrganizationType &&
                organizationDocs
                  .find(
                    (elem) => elem.organisation_id == selectedOrganizationType,
                  )
                  ?.value?.filter((item) => item.id != selectedDocTwo)
                  ?.map((document, index) => (
                    <option key={index} value={document.id}>
                      {document.value}
                    </option>
                  ))}
            </FormSelect>
            <input
              type="file"
              ref={fileInput1Ref}
              className="mt-4 w-56"
              onChange={handleFileChange1}
            />
          </div>
          <div className="w-[54%] h-[100%]">
            <div id="preview">
              {/* Display preview content */}
              {previewContent1}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center my-4 gap-4">
        <div className="flex justify-between gap-2 ">
          <div className="w-[40%]">
            <FormLabel htmlFor="modal-form-6 ">
              Document Two <span className="text-red-500">*</span>{" "}
            </FormLabel>
            <FormSelect
              id="modal-form-6"
              onChange={(e) => setSelectedDocTwo(e.target.value)}
              value={selectedDocTwo}
            >
              <option value="">Select Document Type</option>
              {selectedOrganizationType &&
                organizationDocs
                  .find(
                    (elem) => elem.organisation_id == selectedOrganizationType,
                  )
                  ?.value?.filter((item) => item.id != selectedDocOne)
                  ?.map((document, index) => (
                    <option key={index} value={document.id}>
                      {document.value}
                    </option>
                  ))}
            </FormSelect>
            <input
              type="file"
              ref={fileInput2Ref}
              className="mt-4 w-56"
              onChange={handleFileChange2}
            />
          </div>
          <div className="w-[54%] h-[100%]">
            <div id="preview">{previewContent2}</div>
          </div>
        </div>
      </div>
    </>
  );
  const kycFooter = (
    <>
      {" "}
      <Button
        type="button"
        className="p-1 w-24 bg-mustard border-none text-white text-md "
        onClick={handleUploadKyc}
        disabled={kycSpinner}
      >
        UPLOAD{" "}
        {kycSpinner && (
          <LoadingIcon
            icon="puff"
            color="white"
            className="w-5 h-5 ml-2 stroke-2.5 text-white"
          />
        )}
      </Button>
    </>
  );

  const checkProhibited = async (booking_charges: any) => {
    try {
      setAclSpinner(true);
      const hsn_code = JSON.parse(data?.shipment_dimensions || "[]")?.reduce(
        (acc: any[], curr: any) => {
          if (curr?.hsn_code) {
            acc.push(curr.hsn_code);
          }
          return acc;
        },
        [],
      );
      const res = await check_prohibited_hsncode({ hsn_code });
      if (res?.data?.status == 200) {
        await checkPga(booking_charges);
      } else if (res?.data?.status == 400) {
        showAlert(res?.data?.message, "warning");
        setCurrentFaq(1);
        setCurrentStep(1);
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      console.error("Error checking prohibited HSN codes:", error);
    } finally {
      setAclSpinner(false);
    }
  };

  const checkPga = async (booking_charges) => {
    try {
      setAclSpinner(true);
      const hts_code = JSON.parse(data?.shipment_dimensions || "[]")?.reduce(
        (acc: any[], curr: any) => {
          if (curr?.hsn_code) {
            acc.push(curr.hsn_code);
          }
          return acc;
        },
        [],
      );

      const res = await Pga_hsncode_Api({ hts_code });
      if (res?.data?.status == 200) {
        setPga(true);
        await checkAcl(booking_charges);
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      console.error("Error checking pga:", error);
    } finally {
      setAclSpinner(false);
    }
  };

  useEffect(() => {
    Get_kyc_organization().then((res) => setOrganizationTypes(res?.data?.data));
    Get_kyc_document().then((res) => {
      setOrganizationDocs(res?.data?.data);
    });
  }, []);

  const [senderDetails, setSenderDetails] = useState({
    consigner_mobile_number: data?.consigner_mobile_number || "",
    consigner_email_id: data?.consigner_email_id || "",
    consigner_first_name: data?.consigner_first_name || "",
    consigner_company_name: data?.consigner_company_name || "",
    consigner_address_1: data?.consigner_address_1 || "",
    consigner_address_2: data?.consigner_address_2 || "",
    consigner_pincode: data?.consigner_pincode || "",
    consigner_city: data?.consigner_city || "",
    consigner_state: isShipnstock
      ? ""
      : data?.consigner_state?.trim() || data?.origin_country_code?.trim() || "",
    ...(isShipnstock ? { consigner_state_id: "" } : {}),
    consigner_doc_type: data?.consigner_doc_type || "1",
    consigner_gst_applicable: data?.consigner_gst_applicable || "",
    consigner_gst_number: data?.consigner_gst_number || "",
    consigner_tax_payment: data?.consigner_tax_payment || "",
    ...(data?.courier_code.includes("widect")
      ? {
        business_number: awbData?.additional_data?.business_number || "",
        ioss_number: awbData?.additional_data?.ioss_number || "",
        eori_number: awbData?.additional_data?.eori_number || "",
        rgr_number: awbData?.additional_data?.rgr_number || "",
        sku: awbData?.additional_data?.sku || "",
        market_place_vat_number:
          awbData?.additional_data?.market_place_vat_number || "",
        vat_number: awbData?.pickup_data?.vat_number || "",
        ...(data?.destination_country_code == "US"
          ? {
            manufacturer_id: awbData?.pickup_data?.manufacturer_id || "",
            iorr_number: awbData?.pickup_data?.iorr_number || "",
            poa: awbData?.pickup_data?.poa || "",
          }
          : {}),
      }
      : {}),
    ...(awbData?.pickup_data?.is_domestic == 1 &&
      awbData?.pickup_data?.booking_shipment_type_id == 7
      ? {
        ad_code: awbData?.pickup_data?.ad_code || "",
        iec_code: awbData?.pickup_data?.iec_code || "",
        invoice_type: awbData?.pickup_data?.invoice_type || "",
        invoice_term: awbData?.pickup_data?.invoice_term || "",
        iec_no: awbData?.pickup_data?.iec_no || "",
        iec_branch_code: awbData?.pickup_data?.iec_branch_code || "",
        export_using_ecommerce:
          awbData?.pickup_data?.export_using_ecommerce || "",
        meis_scheme: awbData?.pickup_data?.meis_scheme || "",
        export_is_payment: awbData?.pickup_data?.export_is_payment || "",
        bond_or_ut: awbData?.pickup_data?.bond_or_ut || "",
        total_igst: awbData?.pickup_data?.total_igst || "",
        total_cess: awbData?.pickup_data?.total_cess || "",
        uom: awbData?.pickup_data?.uom || "",
        bank_account_number: awbData?.pickup_data?.bank_account_number || "",
        nefi: awbData?.pickup_data?.nefi || "",
      }
      : {}),
    ...(data?.courier_code.includes("dhl") &&
      data?.shipment_type == 1 &&
      data?.destination_country_code == "US"
      ? { commodity_code: data?.commodity_code || "" }
      : {}),
    ...(data?.import_booking == 1
      ? {
        kyc_details: data?.kyc_details || "",
      }
      : {}),
    ...(data?.booking_type == 2
      ? {
        order_id: awbData?.pickup_data?.order_id || "",
        is_cod: awbData?.pickup_data?.is_cod || 0,
      }
      : {}),
  });

  const [receiverDetails, setReceiverDetails] = useState({
    consignee_mobile_number: data?.consignee_mobile_number || "",
    consignee_email_id: data?.consignee_email_id || "",
    consignee_first_name: data?.consignee_first_name || "",
    consignee_company_name: data?.consignee_company_name || "",
    consignee_address_1: data?.consignee_address_1 || "",
    consignee_address_2: data?.consignee_address_2 || "",
    consignee_pincode: data?.destination_pincode,
    consignee_city: data?.city,
    consignee_state: isShipnstock ? "" : data?.state,
    ...(isShipnstock ? { consignee_state_id: "" } : {}),
    consignee_country: data?.consignee_country || "",
    consignee_reference_no: data?.consignee_reference_no || "",
    booking_invoice_number: data?.booking_invoice_number || "",
    booking_invoice_date: data?.booking_invoice_date,
    consignee_gst_number: data?.consignee_gst_number || "",
    consignee_doc_type: data?.consignee_doc_type || "1",
    delivery_instructions: data?.delivery_instructions || "",
    ...(data?.import_booking == 2
      ? {
        kyc_details: data?.kyc_details || "",
      }
      : {}),
    ...(data?.courier_code.includes("emirates")
      ? {
        is_residential: Number(data?.is_residential) || "",
      }
      : {}),
  });

  const SHIPNSTOCK_INDIA_COUNTRY_ID = 101;

  const [shipnstockCountries, setShipnstockCountries] = useState<any[]>([]);
  const [senderShipnstockStates, setSenderShipnstockStates] = useState<any[]>([]);
  const [receiverShipnstockStates, setReceiverShipnstockStates] = useState<any[]>([]);
  const [senderStateSelecteddata, setSenderStateSelecteddata] = useState<any>({
    name: "",
    id: "",
  });
  const [receiverStateSelecteddata, setReceiverStateSelecteddata] = useState<any>({
    name: "",
    id: "",
  });

  const matchedReceiverShipnstockCountryId = shipnstockCountries?.find(
    (country: any) =>
      country?.name?.toLowerCase() === data?.destination_country?.toLowerCase(),
  )?.id;

  useEffect(() => {
    if (isShipnstock) {
      getShipnstockCountriesApi().then((res) => {
        setShipnstockCountries(res?.data?.countries || []);
      });
      setSenderStateSelecteddata({
        name: awbData?.shipper_data[0]?.state || "",
        id: awbData?.extraData?.consigner_state_id || "",
      });
      setReceiverStateSelecteddata({
        name: awbData?.consignee_data[0]?.state || "",
        id: awbData?.extraData?.consignee_state_id || "",
      });
      setReceiverDetails((prev: any) => ({
        ...prev,
        consignee_state_id: awbData?.extraData?.consignee_state_id,
      }));
      setSenderDetails((prev: any) => ({
        ...prev,
        consigner_state_id: awbData?.extraData?.consigner_state_id,
      }));
      setData((prev: any) => ({
        ...prev,
        consigner_state_id: awbData?.extraData?.consigner_state_id,
        consignee_state_id: awbData?.extraData?.consignee_state_id,
      }));
    }
  }, [isShipnstock]);

  useEffect(() => {
    if (isShipnstock) {
      getShipnstockStatesApi(SHIPNSTOCK_INDIA_COUNTRY_ID).then((res) => {
        setSenderShipnstockStates(res?.data?.states || []);
      });
    }
  }, [isShipnstock]);

  useEffect(() => {
    if (isShipnstock && matchedReceiverShipnstockCountryId) {
      getShipnstockStatesApi(matchedReceiverShipnstockCountryId).then((res) => {
        setReceiverShipnstockStates(res?.data?.states || []);
      });
    }
  }, [isShipnstock, matchedReceiverShipnstockCountryId]);

  useEffect(() => {
    if (isShipnstock && data?.consigner_state_id && senderShipnstockStates?.length) {
      const matchedState = senderShipnstockStates.find(
        (state: any) => state?.id == data?.consigner_state_id,
      );
      if (matchedState) {
        setSenderStateSelecteddata({
          name: matchedState?.name || "",
          id: matchedState?.id || "",
        });
        setSenderDetails((prev) => ({
          ...prev,
          consigner_state: matchedState?.name || "",
          consigner_state_id: matchedState?.id || "",
        }));
      }
    }
  }, [isShipnstock, data?.consigner_state_id, senderShipnstockStates]);

  useEffect(() => {
    if (isShipnstock && data?.consignee_state_id && receiverShipnstockStates?.length) {
      const matchedState = receiverShipnstockStates.find(
        (state: any) => state?.id == data?.consignee_state_id,
      );
      if (matchedState) {
        setReceiverStateSelecteddata({
          name: matchedState?.name || "",
          id: matchedState?.id || "",
        });
        setReceiverDetails((prev) => ({
          ...prev,
          consignee_state: matchedState?.name || "",
          consignee_state_id: matchedState?.id || "",
        }));
      }
    }
  }, [isShipnstock, data?.consignee_state_id, receiverShipnstockStates]);

  const funSenderStateSelect = (item: any) => {
    setSenderDetails((prev) => ({
      ...prev,
      consigner_state: item?.name || "",
      consigner_state_id: item?.id || "",
    }));
  };

  const funSenderStateEmpty = () => {
    setSenderDetails((prev) => ({
      ...prev,
      consigner_state: "",
      consigner_state_id: "",
    }));
  };

  const funReceiverStateSelect = (item: any) => {
    setReceiverDetails((prev) => ({
      ...prev,
      consignee_state: item?.name || "",
      consignee_state_id: item?.id || "",
    }));
  };

  const funReceiverStateEmpty = () => {
    setReceiverDetails((prev) => ({
      ...prev,
      consignee_state: "",
      consignee_state_id: "",
    }));
  };
  const [shipperTypeConfirm, setShipperTypeConfirm] = useState(false);
  const [pendingShipperType, setPendingShipperType] = useState<any>(null);

  const shipperTypeLabel: Record<number, string> = {
    1: "Individual",
    2: "MSME",
  };

  const shipperTypeRefersTo: Record<number, string> = {
    1: "a private person, not an organization",
    2: "an organization, not an individual person",
  };

  const ShipperTypeInfoText = ({ type }: { type: number }) => (
    <>
      By selecting{" "}
      <span className="font-bold text-blue-600">"{shipperTypeLabel[type]}"</span>
      , you confirm that the Shipper Name and Company Name refer to{" "}
      {shipperTypeRefersTo[type]}. If this cannot be verified and the
      information is found to be incorrect, a penalty may be applied for
      mis-declaration.
    </>
  );

  const applyShipperType = (newType: number) => {
    setSenderDetails((prev: any) => ({
      ...prev,
      shipper_type: newType,
      consigner_doc_type: "",
      ...(newType == 1 ? { otp: "" } : {}),
    }));
  };

  const handleShipperTypeSelect = (newType: number) => {
    const currentType = senderDetails?.shipper_type;
    if (currentType !== "" && currentType != null && Number(currentType) !== newType) {
      setPendingShipperType(newType);
      setShipperTypeConfirm(true);
    } else {
      applyShipperType(newType);
    }
  };

  const closeShipperTypeConfirm = () => {
    setShipperTypeConfirm(false);
    setPendingShipperType(null);
  };

  const shipperTypeConfirmTitle = (
    <span className="flex items-center gap-3">
      <span className="w-9 h-9 rounded-full bg-orange-100 inline-flex items-center justify-center flex-shrink-0">
        <Lucide icon="AlertTriangle" className="w-5 h-5 text-orange-500" />
      </span>
      <span className="text-gray-800">
        Change shipper type to{" "}
        <span className="text-blue-600">
          {shipperTypeLabel[pendingShipperType]}
        </span>
        ?
      </span>
    </span>
  );

  const shipperTypeConfirmDescription = (
    <div>
      <p className="text-sm text-gray-600 mb-3">
        By selecting{" "}
        <span className="font-bold text-blue-600">
          {shipperTypeLabel[pendingShipperType]}
        </span>
        , you confirm that the Shipper Name and Company Name refer to{" "}
        {shipperTypeRefersTo[pendingShipperType]}.
      </p>
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <Lucide
          icon="AlertCircle"
          className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
        />
        <p className="text-xs text-amber-700">
          If this information cannot be verified or is found to be incorrect,
          a penalty may be applied for mis-declaration.
        </p>
      </div>
    </div>
  );

  const shipperTypeConfirmFooter = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
        onClick={closeShipperTypeConfirm}
      >
        Cancel
      </Button>
      <Button
        type="button"
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 border-none"
        onClick={() => {
          applyShipperType(pendingShipperType);
          closeShipperTypeConfirm();
        }}
      >
        Confirm change
      </Button>
    </div>
  );

  const [region, setRegion] = useState("");

  const [originPincodeData, setOriginPincodeData] = useState([]);

  const originDescription = (
    <>
      {data?.import_booking == 2 ? (
        <>
          {pincodeAvail == 1 && (
            <div className="my-4 ">
              <FormLabel htmlFor="originZipcode" className="text-base">
                ORIGIN ZIPCODE <span className="text-red-500">*</span>
              </FormLabel>
              <AutoCompleteZipcode
                setData={setData}
                data={data}
                setReceiverDetails={setReceiverDetails}
                setSenderDetails={setSenderDetails}
              />
            </div>
          )}
          {cityAvail == 1 && (
            <div className="my-4 ">
              <FormLabel htmlFor="originCity" className="text-base">
                CITY <span className="text-red-500">*</span>
              </FormLabel>
              <AutoCompleteCity
                setData={setData}
                data={data}
                setReceiverDetails={setReceiverDetails}
                setSenderDetails={setSenderDetails}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="my-4">
            <FormLabel htmlFor="originPincode" className="text-base">
              ORIGIN PINCODE <span className="text-red-500">*</span>
            </FormLabel>
            <TomSelect
              value={data?.origin_pincode}
              className={`w-[100%]`}
              onChange={(e) => {
                const Data = JSON.parse(e);

                if (Data?.state_code) {
                  setData((prev) => ({
                    ...prev,
                    origin_pincode: Data?.pincode,
                    origin_city: Data?.city?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
                    origin_state: Data?.state?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
                    origin_state_code: Data?.state_code,
                    consigner_pincode: Data?.pincode,
                    consigner_city: Data?.city?.replaceAll(
                      /[^a-zA-Z0-9 ]/g,
                      "",
                    ),
                    consigner_state: Data?.state?.replaceAll(
                      /[^a-zA-Z0-9 ]/g,
                      "",
                    ),
                  }));

                  setSenderDetails((prev) => ({
                    ...prev,
                    consigner_pincode: Data?.pincode,
                    consigner_city: Data?.city?.replaceAll(
                      /[^a-zA-Z0-9 ]/g,
                      "",
                    ),
                    consigner_state: Data?.state?.replaceAll(
                      /[^a-zA-Z0-9 ]/g,
                      "",
                    ),
                  }));

                  showAlert("Origin pincode changed", "warning");
                  setCurrentStep(1);
                  setCurrentFaq(1);
                } else {
                  showAlert(
                    "State code is missing for this pincode. Please contact with zone sales person.",
                    "error",
                  );
                }
              }}
              options={{
                placeholder: "Select Origin Pincode",
                onType: (e) =>
                  getLocalPincodeApi(e).then((res) =>
                    setOriginPincodeData(res?.data?.data),
                  ),
              }}
            >
              <option value={data?.origin_pincode}>
                {data?.origin_pincode}
              </option>
              {originPincodeData?.map((data, index) => (
                <option value={JSON.stringify(data)} key={index}>
                  {data?.pincode}
                </option>
              ))}
            </TomSelect>
          </div>
        </>
      )}
    </>
  );

  const originFooter = (
    <>
      <Button
        type="button"
        className="w-20 p-1 bg-mustard border-none text-white"
        onClick={() => {
          if (data?.import_booking == 2) {
            setCurrentStep(1);
            setCurrentFaq(1);
            setOriginModal(false);
          } else {
            setOriginModal(false);
          }
        }}
      >
        Save
      </Button>
    </>
  );

  const [destinationPincodeData, setDestinationPincodeData] = useState([]);

  const destinationDescription = (
    <>
      {data?.booking_type == 1 ? (
        <>
          {data?.import_booking == 2 ? (
            <div className="my-4">
              <FormLabel htmlFor="destinationPincode" className="text-base">
                DESTINATION PINCODE <span className="text-red-500">*</span>
              </FormLabel>
              <TomSelect
                value={data?.destination_pincode}
                className={`w-[100%]`}
                onChange={(e) => {
                  const Data = JSON.parse(e);

                  if (Data?.state_code) {
                    setData((prev) => ({
                      ...prev,
                      destination_pincode: Data?.pincode,
                      city: Data?.city?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
                      state_name: Data?.state?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
                      state: Data?.state_code,
                      consignee_pincode: Data?.pincode,
                      consignee_city: Data?.city?.replaceAll(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      ),
                      consignee_state: Data?.state_code?.replaceAll(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      ),
                    }));

                    setReceiverDetails((prev) => ({
                      ...prev,
                      consignee_pincode: Data?.pincode,
                      consignee_city: Data?.city?.replaceAll(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      ),
                      consignee_state: Data?.state_code?.replaceAll(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      ),
                    }));

                    showAlert("Destination pincode changed", "warning");
                    setCurrentStep(1);
                    setCurrentFaq(1);
                  } else {
                    showAlert(
                      "State code is missing for this pincode. Please contact with zone sales person.",
                      "error",
                    );
                  }
                }}
                options={{
                  placeholder: "Select Destination Pincode",
                  onType: (e) =>
                    getLocalPincodeApi(e).then((res) =>
                      setOriginPincodeData(res?.data?.data),
                    ),
                }}
              >
                <option value={data?.destination_pincode}>
                  {data?.destination_pincode}
                </option>
                {originPincodeData?.map((data, index) => (
                  <option value={JSON.stringify(data)} key={index}>
                    {data?.pincode}
                  </option>
                ))}
              </TomSelect>
            </div>
          ) : (
            <>
              {pincodeAvail == 1 && (
                <div className="my-4 ">
                  <FormLabel htmlFor="destinationZipcode" className="text-base">
                    ZIPCODE <span className="text-red-500">*</span>
                  </FormLabel>
                  <AutoCompleteZipcode
                    setData={setData}
                    data={data}
                    setReceiverDetails={setReceiverDetails}
                  />
                </div>
              )}
              {cityAvail == 1 && (
                <div className="my-4 ">
                  <FormLabel htmlFor="destinationCity" className="text-base">
                    CITY <span className="text-red-500">*</span>
                  </FormLabel>
                  <AutoCompleteCity
                    setData={setData}
                    data={data}
                    setReceiverDetails={setReceiverDetails}
                  />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <div>
            <FormLabel htmlFor="destination_pincode" className="text-base">
              DESTINATION PINCODE <span className="text-red-500">*</span>
            </FormLabel>
            <TomSelect
              className={`w-[100%] `}
              name="destination_pincode"
              value={data?.destination_pincode}
              onChange={(e) => {
                const Data = JSON.parse(e);
                setData((prev) => ({
                  ...prev,
                  destination_pincode: Data?.pincode,
                  city: Data?.city.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
                  state: Data?.state.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
                }));
              }}
              options={{
                placeholder: "Select Destination Pincode",
                onType: (e) =>
                  getLocalPincodeApi(e).then((res) =>
                    setDestinationPincodeData(res?.data?.data),
                  ),
              }}
            >
              <option value={data?.destination_pincode}>
                {data?.destination_pincode}
              </option>
              {destinationPincodeData?.map(
                (data, index) =>
                  data?.pincode !== data?.origin_pincode && (
                    <option value={JSON.stringify(data)} key={index}>
                      {data?.pincode}
                    </option>
                  ),
              )}
            </TomSelect>
          </div>
          <div className="grid grid-cols-2 my-3 px-2">
            {data?.city && <h1 className="text-base">CITY : {data?.city}</h1>}
            {data?.state && (
              <h1 className="text-base">STATE : {data?.state}</h1>
            )}
          </div>
        </>
      )}
    </>
  );

  const destinationFooter = (
    <>
      {" "}
      <Button
        type="button"
        className="w-20 p-1 bg-mustard border-none text-white"
        onClick={() => {
          if (data?.import_booking == 2) {
            setDestinationModal(false);
          } else {
            setCurrentStep(1);
            setCurrentFaq(1);
            setDestinationModal(false);
          }
        }}
      >
        Save
      </Button>
    </>
  );

  const handleSenderClick = () => {
    // console.log(senderDetails, "bbbb");
    if (data?.courier_code.includes("dhl")) {
      const restrictedDocTypes = ["1", "6", "7", "8"];
      const docType = String(senderDetails?.consigner_doc_type);
      if (
        senderDetails?.shipper_type == 1 &&
        restrictedDocTypes.includes(docType)
      ) {
        showAlert("consigner doc type is required", "error");
        setSenderDetails((prev: any) => ({
          ...prev,
          consigner_doc_type: "",
        }));
        return;
      }
      if (
        senderDetails?.shipper_type == 2 &&
        !restrictedDocTypes.includes(docType)
      ) {
        showAlert("consigner doc type is required", "error");
        setSenderDetails((prev: any) => ({
          ...prev,
          consigner_doc_type: "",
        }));
        return;
      }
    }

    for (const key in senderDetails) {
      if (
        key == "otp" ||
        key == "consigner_address_3" ||
        key == "consigner_state_id"
      ) {
        continue;
      }

      if (
        !data?.courier_code.includes("dhl") &&
        !data?.courier_code.includes("skynet") &&
        !data?.shipment_type == "1" &&
        !data?.shipment_type == "2" &&
        (key == "shipper_type" || key == "shipment_purpose")
      ) {
        continue;
      }

      if (
        !data?.courier_code.includes("dhl") &&
        !data?.shipment_type == 1 &&
        !data?.destination_country_code == "US" &&
        key == "commodity_code"
      ) {
        continue;
      }

      if (
        data?.booking_type == "2" &&
        (key == "consigner_tax_payment" ||
          key == "consigner_gst_applicable" ||
          key == "consigner_doc_type" ||
          key == "consigner_email_id" ||
          key == "consigner_gst_number" ||
          key == "consigner_email_id" ||
          key == "kyc_details" ||
          key == "order_id" ||
          key == "is_cod")
      ) {
        continue;
      }

      if (
        key == "business_number" ||
        key == "rgr_number" ||
        (key == "ioss_number" && data?.destination_country_code == "GB") ||
        (key == "ioss_number" && isRestricted) ||
        (key == "ioss_number" &&
          (data?.destination_country_code == "GB" ||
            data?.destination_country_code == "US" ||
            region == "europe") &&
          data?.incoterm == 2) ||
        (key == "vat_number" && isRestricted) ||
        (key == "vat_number" &&
          ((data?.destination_country_code == "GB" && data?.incoterm == 2) ||
            data?.destination_country_code == "US" ||
            (region == "europe" &&
              data?.destination_country_code != "GB" &&
              (data?.incoterm == 1 || data?.incoterm == 2)))) ||
        (key == "ioss_number" && region != "europe" && data?.incoterm != 1) ||
        (key == "vat_number" &&
          data?.destination_country_code != "GB" &&
          data?.incoterm != 1) ||
        key == "eori_number" ||
        key == "market_place_vat_number" ||
        key == "sku" ||
        key == "manufacturer_id" ||
        key == "iorr_number" ||
        key == "poa"
      ) {
        continue;
      }

      if (
        (key == "vat_number" || key == "ioss_number") &&
        data?.destination_country_code == "US"
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
      if (data?.import_booking == "2" && key == "kyc_details") {
        continue;
      }

      if (senderDetails?.tax_paid == 2 && key == "tax_amount") {
        continue;
      }
      const restrictedKeys = [
        "ad_code",
        "iec_code",
        "invoice_type",
        "invoice_term",
        "iec_no",
        "iec_branch_code",
        "export_using_ecommerce",
        "meis_scheme",
        "export_is_payment",
        "bond_or_ut",
        "total_igst",
        "total_cess",
        "uom",
        "bank_account_number",
        "nefi",
      ];

      if (
        data?.shipment_type != 7 &&
        awbData?.pickup_data?.is_domestic != 1 &&
        restrictedKeys.includes(key)
      ) {
        continue;
      }

      if (senderDetails.hasOwnProperty(key) && senderDetails[key] === "") {
        showAlert(`${key.replaceAll("_", " ")} is required`, "warning");
        return;
      }
    }

    if (
      shipment_value > 2500 &&
      data?.import_booking == "2" &&
      data?.courier_code.includes("fedex") &&
      Number(data?.unit?.currency) == 48
    ) {
      if (data?.origin_country_code == "US" && !senderDetails?.ei_number) {
        showAlert("ei number is required", "error");
        return;
      }
      if (data?.origin_country_code == "CA" && !senderDetails?.cad_number) {
        showAlert("cad number is required", "error");
        return;
      }
    }
    setData((prev) => ({ ...prev, ...senderDetails }));
    setSenderOpen(false);
  };

  const [senderContactEdit, setSenderContactEdit] = useState(
    senderDetails?.consigner_mobile_number ? true : false,
  );
  const [resetSpinner2, setResetSpinner2] = useState(false);
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

      ...(data?.courier_code.includes("dhl") &&
        data?.shipment_type == 1 &&
        data?.destination_country_code == "US"
        ? { commodity_code: "" }
        : {}),
      ...(data?.import_booking == "1" ? { kyc_details: "" } : {}),
      ...(awbData?.pickup_data?.is_domestic == 1 && data?.shipment_type == 7
        ? {
          ad_code: "",
          iec_code: "",
          invoice_type: "",
          invoice_term: "",
          iec_no: "",
          iec_branch_code: "",
          export_using_ecommerce: "",
          meis_scheme: "",
          export_is_payment: "",
          bond_or_ut: "",
          total_igst: "",
          total_cess: "",
          uom: "",
          bank_account_number: "",
          nefi: "",
        }
        : {}),
      ...(data?.booking_type == 2
        ? {
          order_id: awbData?.pickup_data?.order_id || "",
          is_cod: awbData?.pickup_data?.is_cod || 0,
        }
        : {}),
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
  const getConsignerData = async () => {
    if (!senderDetails?.consigner_mobile_number) {
      showAlert("Please enter mobile number", "error");
      return;
    }
    setResetSpinner2(true);
    try {
      const response: any = await getConsignerDetailsApi(
        senderDetails?.consigner_mobile_number,
        data?.import_booking || 1,
      );
      if (response?.data?.status == 200) {
        setSenderContactEdit(true);

        setSenderDetails((prev) => ({ ...prev, ...response?.data?.data }));
        showAlert("Receiver Details Found");
      } else if (response?.data?.status == 400) {
        showAlert(response?.data?.data[0]?.message, "error");
      } else {
        showAlert("Something Went Wrong", "error");
      }
    } catch (err: any) {
      showAlert("Something Went Wrong", "error");
    } finally {
      setResetSpinner2(false);
    }
  };

  const senderDescription = (
    <>
      {data?.import_booking == 1 && (
        <div className="flex justify-between gap-4 mb-2">
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
          )}
        </div>
      )}
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
              maxLength={data?.import_booking == 2 ? 15 : 10}
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
                  35,
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
            maxLength={getCourierMaxLength(data?.courier_code?.toLowerCase())}
            onPaste={(e) =>
              handleConditionalPaste({
                key: "consigner_address_1",
                state: senderDetails,
                setState: setSenderDetails,
                event: e,
                courierCode: data?.courier_code?.toLowerCase(),
              })
            }
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
            maxLength={getCourierMaxLength(data?.courier_code?.toLowerCase())}
            onPaste={(e) =>
              handleConditionalPaste({
                key: "consigner_address_2",
                state: senderDetails,
                setState: setSenderDetails,
                event: e,
                courierCode: data?.courier_code?.toLowerCase(),
              })
            }
            onChange={(e) =>
              setSenderDetails((prev) => ({
                ...prev,
                consigner_address_2: e.target.value,
              }))
            }
          />
        </div>

        {data?.courier_code.includes("dhl") ? (
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-5-add-3">ADDRESS 3</FormLabel>
            <FormInput
              id="modal-form-5-add-3"
              type="text"
              placeholder="Address 3"
              value={senderDetails?.consigner_address_3}
              maxLength={getCourierMaxLength(data?.courier_code?.toLowerCase())}
              onPaste={(e) =>
                handleConditionalPaste({
                  key: "consigner_address_3",
                  state: senderDetails,
                  setState: setSenderDetails,
                  event: e,
                  courierCode: data?.courier_code?.toLowerCase(),
                })
              }
              onChange={(e) =>
                setSenderDetails({
                  ...senderDetails,
                  consigner_address_3: e.target.value,
                })
              }
            />
          </div>
        ) : null}

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
          {isShipnstock ? (
            <CommonSearchableAll
              localData={senderShipnstockStates}
              zIndex="20"
              selecteddata={senderStateSelecteddata}
              setSelecteddata={setSenderStateSelecteddata}
              fun1={funSenderStateSelect}
              funtoempty={funSenderStateEmpty}
              comingselectedname={"name"}
              comingselectedid={"id"}
              id={senderStateSelecteddata?.id}
              placeholder="Search State"
            />
          ) : (
            <FormInput
              id="modal-form-5"
              type="text"
              placeholder=""
              value={senderDetails?.consigner_state}
              disabled
            />
          )}
        </div>

        <div className="col-span-12 sm:col-span-6">
          <FormLabel htmlFor="modal-form-6">
            DOCUMENT TYPE <span className="text-red-500">*</span>{" "}
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
              consignerDocTypes
                ?.filter((elem) => {
                  if (data?.courier_code.includes("dhl")) {
                    if (senderDetails?.shipper_type == 1) {
                      return !["1", "6", "7", "8"].includes(String(elem?.id));
                    } else if (senderDetails?.shipper_type == 2) {
                      return ["1", "6", "7", "8"].includes(String(elem?.id));
                    }
                  }
                  return true;
                })
                ?.map((elem, index) => (
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
                (elem) => elem.id == senderDetails?.consigner_doc_type,
              )?.value) ||
              "Please select a document type"}
            <span className="text-red-500"> *</span>
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
            GST APPLICABLE ON INVOICE{" "}
            <span className="text-red-500">*</span>{" "}
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
        {data?.booking_type == 1 && data?.shipment_type == 7 && (
          <>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="ad_code">
                AD CODE <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                type="text"
                name="ad_code"
                value={senderDetails?.ad_code}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    ad_code: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="iec_code">
                IEC CODE (Import Export Code){" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                type="text"
                name="iec_code"
                value={senderDetails?.iec_code}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    iec_code: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-6">
                Invoice Type <span className="text-red-500">*</span>{" "}
              </FormLabel>
              <FormSelect
                id="modal-form-6"
                value={senderDetails?.invoice_type}
                onChange={(e) =>
                  setSenderDetails((prev) => ({
                    ...prev,
                    invoice_type: e.target.value,
                  }))
                }
              >
                <option value={""}>Select Invoice Type</option>
                {invoiceType?.map((elem, index) => (
                  <option value={elem?.id} key={index}>
                    {elem?.invoice_type}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-6">
                Invoice Term <span className="text-red-500">*</span>{" "}
              </FormLabel>
              <FormSelect
                id="modal-form-6"
                value={senderDetails?.invoice_term}
                onChange={(e) =>
                  setSenderDetails((prev) => ({
                    ...prev,
                    invoice_term: e.target.value,
                  }))
                }
              >
                <option value={""}>Select Invoice Term</option>
                {invoiceTerm?.map((elem, index) => (
                  <option value={elem?.id} key={index}>
                    {elem?.invoice_term}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                IEC No of the Exporter <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                type="text"
                value={senderDetails?.iec_no}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    iec_no: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                IEC Branch code <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                type="text"
                value={senderDetails?.iec_branch_code}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    iec_branch_code: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="export_using_ecommerce_radio_button">
                {" "}
                Whether export using ecommerce{" "}
                <span className="text-red-400">*</span>
              </FormLabel>
              <div className="flex flex-row gap-10">
                <FormCheck className="m-2">
                  <FormCheck.Input
                    id="radio-switch-1"
                    type="radio"
                    name="export_using_ecommerce_radio_button"
                    checked={senderDetails?.export_using_ecommerce == 1}
                    onClick={() =>
                      setSenderDetails((prev) => ({
                        ...prev,
                        export_using_ecommerce: 1,
                      }))
                    }
                  />
                  <FormCheck.Label htmlFor="radio-switch-1">
                    Yes
                  </FormCheck.Label>
                </FormCheck>
                <FormCheck className="mr-2 ">
                  <FormCheck.Input
                    id="radio-switch-2"
                    type="radio"
                    name="export_using_ecommerce_radio_button"
                    checked={senderDetails?.export_using_ecommerce == 2}
                    onClick={() =>
                      setSenderDetails((prev) => ({
                        ...prev,
                        export_using_ecommerce: 2,
                      }))
                    }
                  />
                  <FormCheck.Label htmlFor="radio-switch-2">No</FormCheck.Label>
                </FormCheck>
              </div>
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="meis_scheme_radio_button">
                {" "}
                Whether under MEIS scheme{" "}
                <span className="text-red-400">*</span>
              </FormLabel>
              <div className="flex flex-row gap-10">
                <FormCheck className="m-2">
                  <FormCheck.Input
                    id="radio-switch-1"
                    type="radio"
                    name="meis_scheme_radio_button"
                    checked={senderDetails?.meis_scheme == 1}
                    onClick={() =>
                      setSenderDetails((prev) => ({
                        ...prev,
                        meis_scheme: 1,
                      }))
                    }
                  />
                  <FormCheck.Label htmlFor="radio-switch-1">
                    Yes
                  </FormCheck.Label>
                </FormCheck>
                <FormCheck className="mr-2 ">
                  <FormCheck.Input
                    id="radio-switch-2"
                    type="radio"
                    name="meis_scheme_radio_button"
                    checked={senderDetails?.meis_scheme == 2}
                    onClick={() =>
                      setSenderDetails((prev) => ({
                        ...prev,
                        meis_scheme: 2,
                      }))
                    }
                  />
                  <FormCheck.Label htmlFor="radio-switch-2">No</FormCheck.Label>
                </FormCheck>
              </div>
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="export_is_payment_radio_button">
                {" "}
                Whether Supply for export is on payment of IGST{" "}
                <span className="text-red-400">*</span>
              </FormLabel>
              <div className="flex flex-row gap-10">
                <FormCheck className="m-2">
                  <FormCheck.Input
                    id="radio-switch-1"
                    type="radio"
                    name="export_is_payment_radio_button"
                    checked={senderDetails?.export_is_payment == 1}
                    onClick={() =>
                      setSenderDetails((prev) => ({
                        ...prev,
                        export_is_payment: 1,
                      }))
                    }
                  />
                  <FormCheck.Label htmlFor="radio-switch-1">
                    Yes
                  </FormCheck.Label>
                </FormCheck>
                <FormCheck className="mr-2 ">
                  <FormCheck.Input
                    id="radio-switch-2"
                    type="radio"
                    name="export_is_payment_radio_button"
                    checked={senderDetails?.export_is_payment == 2}
                    onClick={() =>
                      setSenderDetails((prev) => ({
                        ...prev,
                        export_is_payment: 2,
                      }))
                    }
                  />
                  <FormCheck.Label htmlFor="radio-switch-2">No</FormCheck.Label>
                </FormCheck>
              </div>
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="bond_or_ut_radio_button">
                {" "}
                Whether against Bond or UT{" "}
                <span className="text-red-400">*</span>
              </FormLabel>
              <div className="flex flex-row gap-10">
                <FormCheck className="m-2">
                  <FormCheck.Input
                    id="radio-switch-1"
                    type="radio"
                    name="bond_or_ut_radio_button"
                    checked={senderDetails?.bond_or_ut == 1}
                    onClick={() =>
                      setSenderDetails((prev) => ({
                        ...prev,
                        bond_or_ut: 1,
                      }))
                    }
                  />
                  <FormCheck.Label htmlFor="radio-switch-1">
                    Yes
                  </FormCheck.Label>
                </FormCheck>
                <FormCheck className="mr-2 ">
                  <FormCheck.Input
                    id="radio-switch-2"
                    type="radio"
                    name="bond_or_ut_radio_button"
                    checked={senderDetails?.bond_or_ut == 2}
                    onClick={() =>
                      setSenderDetails((prev) => ({
                        ...prev,
                        bond_or_ut: 2,
                      }))
                    }
                  />
                  <FormCheck.Label htmlFor="radio-switch-2">No</FormCheck.Label>
                </FormCheck>
              </div>
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                Total IGST paid <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                type="text"
                value={senderDetails?.total_igst}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    total_igst: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                Total Cess Paid <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                type="text"
                value={senderDetails?.total_cess}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    total_cess: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                UOM <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                type="text"
                value={senderDetails?.uom}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    uom: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                Bank A/C Number <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                type="text"
                value={senderDetails?.bank_account_number}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    bank_account_number: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-5">
                NFEI <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                type="text"
                value={senderDetails?.nefi}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    nefi: e.target.value,
                  })
                }
              />
            </div>
          </>
        )}
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
        {data?.courier_code.includes("aramex") || data?.courier_code.includes("sf_express") ? (
          <>
            {data?.courier_code.includes("aramex") ? (
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
              </div>) : null}

            {(data?.courier_code.includes("sf_express") && data?.import_booking == 2) ? (<div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-6-tax-id">
                TAX ID <span className="text-red-500">*</span>{" "}
              </FormLabel>
              <FormInput
                id="modal-form-6-tax-id"
                type="text"
                placeholder=""
                value={senderDetails?.tax_id}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    tax_id: e.target.value,
                  })
                }
              />
            </div>) : null}

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
        ) : null}

        {shipment_value > 2500 && data?.import_booking == "2" && data?.courier_code.includes("fedex") && Number(data?.unit?.currency) == 48 ? (
          <>
            {data?.origin_country_code == "US" ?
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="ei_number">EI NUMBER{" "}
                  <span className="text-red-500">*</span>{" "}</FormLabel>
                <FormInput
                  id="ei_number"
                  type="text"
                  placeholder="Enter EI NUMBER"
                  value={senderDetails?.ei_number}
                  onChange={(e) =>
                    setSenderDetails((prev) => ({
                      ...prev,
                      ei_number: e.target.value,
                    }))
                  }
                />
              </div> : null}
            {data?.origin_country_code == "CA" ?
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="cad_number">CAD NUMBER{" "}
                  <span className="text-red-500">*</span>{" "}</FormLabel>
                <FormInput
                  id="cad_number"
                  type="text"
                  placeholder="Enter CAD NUMBER"
                  value={senderDetails?.cad_number}
                  onChange={(e) =>
                    setSenderDetails((prev) => ({
                      ...prev,
                      cad_number: e.target.value,
                    }))
                  }
                />
              </div> : null}
          </>
        ) : null}

        {data?.courier_code.includes("dhl") &&
          (data?.shipment_type == 1 || data?.shipment_type == 2) && (
            <>
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
                      onClick={() => handleShipperTypeSelect(1)}
                    />
                    <FormCheck.Label className="flex items-center gap-1">
                      Individual
                      <div className="relative group">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center cursor-pointer">
                          <Lucide
                            icon="Info"
                            className="w-2.5 h-2.5 text-white stroke-[2.5]"
                          />
                        </div>
                        <div className="absolute bottom-6 left-0 z-50 hidden group-hover:block w-72 pointer-events-none">
                          <div className="bg-white text-gray-700 text-xs rounded-xl px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-blue-100">
                            <ShipperTypeInfoText type={1} />
                          </div>
                        </div>
                      </div>
                    </FormCheck.Label>
                  </FormCheck>
                  <FormCheck className="mt-2 mr-2 sm:mt-0">
                    <FormCheck.Input
                      id="radio-switch"
                      type="radio"
                      name="shipper_type_radio_button"
                      checked={senderDetails?.shipper_type == 2}
                      onClick={() => handleShipperTypeSelect(2)}
                    />
                    <FormCheck.Label className="flex items-center gap-1">
                      MSME
                      <div className="relative group">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center cursor-pointer">
                          <Lucide
                            icon="Info"
                            className="w-2.5 h-2.5 text-white stroke-[2.5]"
                          />
                        </div>
                        <div className="absolute bottom-6 left-0 z-50 hidden group-hover:block w-72 pointer-events-none">
                          <div className="bg-white text-gray-700 text-xs rounded-xl px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-blue-100">
                            <ShipperTypeInfoText type={2} />
                          </div>
                        </div>
                      </div>
                    </FormCheck.Label>
                  </FormCheck>
                </div>
              </div>

              <Modal
                open={shipperTypeConfirm}
                setOpen={setShipperTypeConfirm}
                size="md"
                title={shipperTypeConfirmTitle}
                description={shipperTypeConfirmDescription}
                footer={shipperTypeConfirmFooter}
                handleCancel={closeShipperTypeConfirm}
              />
            </>
          )}

        {(data?.courier_code.includes("dhl") ||
          data?.courier_code.includes("skynet")) ? (
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="shipment_purpose">
              PURPOSE OF SHIPMENT
              <span className="text-red-400">*</span>
            </FormLabel>
            <FormSelect
              id="shipment_purpose"
              value={senderDetails?.shipment_purpose}
              onChange={(e) =>
                setSenderDetails((prev) => ({
                  ...prev,
                  shipment_purpose: e.target.value,
                }))
              }
            >
              <option value={""}>Select Purpose</option>
              {shipmentPurpose &&
                shipmentPurpose
                  ?.filter((ele) => {
                    if (data?.courier_code.includes("dhl")) {
                      // For DHL → exclude 7 & 8
                      return ele?.id != 7 && ele?.id != 8;
                    } else if (data?.courier_code.includes("skynet")) {
                      // For skynet → show only 7 & 8
                      return ele?.id == 7 || ele?.id == 8;
                    } else {
                      return true;
                    }
                  })
                  ?.map((ele, index) => (
                    <option key={index} value={ele?.id}>
                      {ele?.purpose_name}
                    </option>
                  ))}
            </FormSelect>
          </div>
        ) : null}

        {data?.courier_code.includes("dhl") &&
          data?.shipment_type == 1 &&
          data?.destination_country_code == "US" && (
            <>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel>
                  10 DIGIT COMMODITY CODE{" "}
                  <span className="text-red-400">*</span>
                </FormLabel>
                <div className="flex flex-col gap-2">
                  <FormInput
                    type="text"
                    placeholder="Commodity Code"
                    id="commodity_code"
                    value={senderDetails?.commodity_code}
                    onChange={(e) => {
                      setSenderDetails((prev) => ({
                        ...prev,
                        commodity_code: e.target.value.replaceAll(" ", ""),
                      }));
                    }}
                  />
                  <div className="text-mustard text-xs font-bold">
                    Example : Box1Code, Box2Code, Box3Code
                  </div>
                </div>
              </div>
            </>
          )}

        {data?.courier_code.includes("widect") && data?.booking_type == 1 && (
          <>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-3">BUSINESS NUMBER</FormLabel>
              <FormInput
                id="modal-form-3"
                type="text"
                placeholder="Business Number"
                value={senderDetails?.business_number}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    business_number: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-3">RGR NUMBER</FormLabel>
              <FormInput
                id="modal-form-3"
                type="text"
                placeholder="RGR Number"
                value={senderDetails?.rgr_number}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    rgr_number: e.target.value,
                  })
                }
              />
            </div>
            {data?.destination_country_code !== "GB" &&
              region == "europe" &&
              data?.incoterm == "1" &&
              !isRestricted && (
                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-3">
                    IOSS NUMBER <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormInput
                    id="modal-form-3"
                    type="text"
                    placeholder="IOSS Number"
                    value={senderDetails?.ioss_number}
                    onChange={(e) =>
                      setSenderDetails({
                        ...senderDetails,
                        ioss_number: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            {!isRestricted &&
              data?.incoterm == "1" &&
              data?.destination_country_code != "US" &&
              (region != "europe" ||
                data?.destination_country_code == "GB") && (
                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="vat_number">
                    VAT NUMBER
                    <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormInput
                    id="vat_number"
                    type="text"
                    placeholder="VAT Number"
                    value={senderDetails?.vat_number}
                    onChange={(e) =>
                      setSenderDetails({
                        ...senderDetails,
                        vat_number: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-3">EORI NUMBER</FormLabel>
              <FormInput
                id="modal-form-3"
                type="text"
                placeholder="EORI Number"
                value={senderDetails?.eori_number}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    eori_number: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-3">
                MARKET PLACE VAT NUMBER
              </FormLabel>
              <FormInput
                id="modal-form-3"
                type="text"
                placeholder="Market Place VAT Number"
                value={senderDetails?.market_place_vat_number}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    market_place_vat_number: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-3">SKU</FormLabel>
              <FormInput
                id="modal-form-3"
                type="text"
                placeholder="SKU"
                value={senderDetails?.sku}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    sku: e.target.value,
                  })
                }
              />
            </div>
            {data?.destination_country_code == "US" && (
              <>
                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-3">MANUFACTURER ID</FormLabel>
                  <FormInput
                    id="modal-form-3"
                    type="text"
                    placeholder="manufacturer id "
                    value={senderDetails?.manufacturer_id}
                    onChange={(e) =>
                      setSenderDetails({
                        ...senderDetails,
                        manufacturer_id: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="iorr_number">IORR NUMBER</FormLabel>
                  <FormInput
                    id="iorr_number"
                    type="text"
                    placeholder="IORR Number"
                    value={senderDetails?.iorr_number}
                    onChange={(e) =>
                      setSenderDetails({
                        ...senderDetails,
                        iorr_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="poa">POA</FormLabel>
                  <FormInput
                    id="poa"
                    type="text"
                    placeholder="POA"
                    value={senderDetails?.poa}
                    onChange={(e) =>
                      setSenderDetails({
                        ...senderDetails,
                        poa: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}
          </>
        )}
        {data?.booking_type == "2" && (
          <>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="order_id">ORDER ID</FormLabel>
              <FormInput
                id="order_id"
                type="text"
                placeholder="Enter Order ID"
                value={senderDetails?.order_id}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    order_id: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="is_cod">PAYMENT MODE</FormLabel>
              <FormSelect
                value={senderDetails?.is_cod}
                onChange={(e) =>
                  setSenderDetails((prev) => ({
                    ...prev,
                    is_cod: e.target.value,
                  }))
                }
              >
                <option value={0}>Not Applicable</option>
                <option value={1}>Cash on Delivery</option>
                <option value={2}>Prepaid</option>
              </FormSelect>
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

  const handleReceiverClick = () => {
    for (const key in receiverDetails) {
      if (key == "consignee_address_3" || key == "consignee_state_id") {
        continue;
      }
      if (data?.booking_type == "2" && key == "consignee_email_id") {
        continue;
      }
      if (data?.import_booking == "1" && key == "kyc_details") {
        continue;
      }
      if (!data?.courier_code.includes("emirates") && key == "is_residential") {
        continue;
      }
      if (
        !data?.courier_code.includes("dhl") &&
        (!data?.destination_country_code == "MX" ||
          !data?.destination_country_code == "ID") &&
        key == "consignee_tax_id"
      ) {
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
        !data?.courier_code?.includes("sf_express") &&
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
        !data?.courier_code.includes("sf_express") &&
        key == "booking_invoice_number"
      ) {
        continue;
      }
      if (
        receiverDetails.hasOwnProperty(key) &&
        (receiverDetails[key] === "" || !receiverDetails[key])
      ) {
        if (key == "is_residential") {
          showAlert(`Location is residential is required`, "error");
          return;
        }
        showAlert(`${key.replaceAll("_", " ")} is required`, "warning");
        return;
      }
    }
    setData((prev) => ({ ...prev, ...receiverDetails }));
    setReceiverOpen(false);
  };
  const [receiverContactEdit, setReceiverContactEdit] = useState(
    receiverDetails?.consignee_mobile_number ? true : false,
  );
  const [resetSpinner, setResetSpinner] = useState(false);
  const handleDataReset = () => {
    setReceiverDetails((prev) => ({
      ...prev,
      consignee_mobile_number: "",
      consignee_email_id: "",
      consignee_first_name: "",
      consignee_company_name: "",
      consignee_address_1: "",
      consignee_address_2: "",
      ...(data?.import_booking == "2" ? { kyc_details: "" } : {}),
      ...(data?.courier_code.includes("emirates")
        ? {
          is_residential: "",
        }
        : {}),
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

  const getConsigneeData = async () => {
    if (!receiverDetails?.consignee_mobile_number) {
      showAlert("Please enter mobile number", "error");
      return;
    }
    setResetSpinner(true);
    try {
      const response: any = await getConsigneeDetailsApi(
        receiverDetails?.consignee_mobile_number,
        data?.import_booking || 1,
      );
      if (response?.data?.status == 200) {
        setReceiverContactEdit(true);

        setReceiverDetails((prev) => ({ ...prev, ...response?.data?.data }));
        showAlert("Receiver Details Found");
      } else if (response?.data?.status == 400) {
        showAlert(response?.data?.data[0]?.message, "error");
      } else {
        showAlert("Something Went Wrong", "error");
      }
    } catch (err: any) {
      showAlert("Something Went Wrong", "error");
    } finally {
      setResetSpinner(false);
    }
  };
  const receiverDescription = (
    <>
      {data?.import_booking == 2 && (
        <div className="flex justify-between gap-4 mb-2">
          <div className="flex  gap-4">
            {receiverDetails?.kyc_details?.document_path_1 && (
              <Link
                to={receiverDetails?.kyc_details?.document_path_1}
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

            {receiverDetails?.kyc_details?.document_path_2 && (
              <Link
                to={receiverDetails?.kyc_details?.document_path_2}
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
          )}
        </div>
      )}
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
            {data?.booking_type == "1" && (
              <span className="text-red-500">*</span>
            )}
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
                  35,
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
            maxLength={getCourierMaxLength(data?.courier_code?.toLowerCase())}
            onPaste={(e) =>
              handleConditionalPaste({
                key: "consignee_address_1",
                state: receiverDetails,
                setState: setReceiverDetails,
                event: e,
                courierCode: data?.courier_code?.toLowerCase(),
              })
            }
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
            maxLength={getCourierMaxLength(data?.courier_code?.toLowerCase())}
            onPaste={(e) =>
              handleConditionalPaste({
                key: "consignee_address_2",
                state: receiverDetails,
                setState: setReceiverDetails,
                event: e,
                courierCode: data?.courier_code?.toLowerCase(),
              })
            }
            onChange={(e) =>
              setReceiverDetails((prev) => ({
                ...prev,
                consignee_address_2: e.target.value,
              }))
            }
          />
        </div>

        {data?.courier_code.includes("dhl") ? (
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-5-add-3">ADDRESS 3</FormLabel>
            <FormInput
              id="modal-form-5-add-3"
              type="text"
              placeholder="Address 3"
              value={receiverDetails?.consignee_address_3}
              maxLength={getCourierMaxLength(data?.courier_code?.toLowerCase())}
              onPaste={(e) =>
                handleConditionalPaste({
                  key: "consignee_address_3",
                  state: receiverDetails,
                  setState: setReceiverDetails,
                  event: e,
                  courierCode: data?.courier_code?.toLowerCase(),
                })
              }
              onChange={(e) =>
                setReceiverDetails({
                  ...receiverDetails,
                  consignee_address_3: e.target.value,
                })
              }
            />
          </div>
        ) : null}

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
          {isShipnstock ? (
            <CommonSearchableAll
              localData={receiverShipnstockStates}
              zIndex="20"
              selecteddata={receiverStateSelecteddata}
              setSelecteddata={setReceiverStateSelecteddata}
              fun1={funReceiverStateSelect}
              funtoempty={funReceiverStateEmpty}
              comingselectedname={"name"}
              comingselectedid={"id"}
              id={receiverStateSelecteddata?.id}
              placeholder="Search State"
            />
          ) : (
            <FormInput
              id="modal-form-5"
              type="text"
              placeholder=""
              value={receiverDetails?.consignee_state}
              onChange={(e) =>
                setReceiverDetails((prev) => ({
                  ...prev,
                  consignee_state: e.target.value,
                }))
              }
            />
          )}
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
                    (elem) => elem.id == receiverDetails?.consignee_doc_type,
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

        {data?.courier_code.includes("dhl") &&
          (data?.destination_country_code == "MX" ||
            data?.destination_country_code == "ID") && (
            <>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="modal-form-5">
                  RECEIVER TAX ID <span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  type="text"
                  value={receiverDetails?.consignee_tax_id}
                  onChange={(e: any) =>
                    setReceiverDetails((prev) => ({
                      ...prev,
                      consignee_tax_id: e.target.value,
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
              {data?.courier_code?.includes("aramex") || data?.courier_code?.includes("sf_express") ? (
                <span className="text-red-500">*</span>
              ) : null}
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

        {data?.courier_code.includes("emirates") && (
          <>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-is_residential">
                LOCATION IS RESIDENTIAL{" "}
                <span className="text-red-500">*</span>{" "}
              </FormLabel>
              <FormSelect
                id="modal-form-is_residential"
                value={receiverDetails?.is_residential}
                onChange={(e) =>
                  setReceiverDetails((prev) => ({
                    ...prev,
                    is_residential: e.target.value,
                  }))
                }
              >
                <option value="">Select </option>
                <option value={1}>Yes </option>
                <option value={2}>No </option>
              </FormSelect>
            </div>
          </>
        )}

        {data?.courier_code.includes("aramex") || data?.courier_code.includes("sf_express") ? (
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
        ) : null}

        {shipment_value > 2500 && data?.import_booking == "1" && data?.courier_code.includes("fedex") && Number(data?.unit?.currency) == 48 ? (
          <>
            {data?.destination_country_code == "US" ?
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="ei_number">EI NUMBER</FormLabel>
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
            {data?.destination_country_code == "CA" ?
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="cad_number">CAD NUMBER</FormLabel>
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

        {data?.booking_type == "1" && (
          <div className="col-span-12 sm:col-span-6">
            <FormLabel htmlFor="modal-form-5">
              INVOICE NUMBER{" "}
              {data?.courier_code?.includes("aramex") || data?.courier_code?.includes("sf_express") ? (
                <span className="text-red-500">*</span>
              ) : null}
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

  const getData = async () => {
    try {
      const response = await Get_country();
      const res2 = await common_get(`/admin/invoice-term`);
      const res3 = await common_get("/admin/invoice-type");

      // Invoice Type Api

      if (response?.status == 200) {
        setCountryData(response?.data?.data);
        if (awbData?.pickup_data?.import_booking == "2") {
          const country = response?.data?.data.find(
            (ele) => ele?.country_id == awbData?.pickup_data?.origin_country_id,
          );
          setRegion(country?.region?.toLowerCase() || "");
          localStorage.setItem("dcode", country?.country_code);
          setPincodeAvail(country?.pincode_avail || 0);
          setCityAvail(country?.city_avail || 0);
          setData((prev) => ({
            ...prev,
            origin_country: country?.country_name,
            origin_country_code: country?.country_code,
            origin_country_id: country?.country_id,
          }));
        } else {
          const country = response?.data?.data.find(
            (ele) =>
              ele?.country_id == awbData?.pickup_data?.delivery_country_id,
          );
          setRegion(country?.region?.toLowerCase() || "");
          localStorage.setItem("dcode", country?.country_code);
          setPincodeAvail(country?.pincode_avail || 0);
          setCityAvail(country?.city_avail || 0);
          setData((prev) => ({
            ...prev,
            destination_country: country?.country_name,
            consignee_country: country?.country_name,
            destination_country_code: country?.country_code,
            state: awbData?.consignee_data[0]?.state || country?.country_code,
          }));

          setReceiverDetails((prev) => ({
            ...prev,
            consignee_country: country?.country_name,
          }));
        }

      } if (res2?.status == 200) {
        setInvoiceTerm(res2?.data?.data || [])
      } if (res3?.status == 200) {
        setInvoiceType(res3?.data?.data || [])
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

    purposeOfShipmentApi().then((res) => {
      setShipmentPurpose(res?.data?.data || []);
    });

    Get_Incoterm().then((res) => {
      setIncotermType(res?.data?.data || []);
    });
  };

  const uploadInvoice = async (event: any) => {
    const selectedFile = event.target.files[0];
    setFileName(selectedFile ? selectedFile.name : "");

    const formData = new FormData();
    if (selectedFile) {
      formData.append("shipper_invoice", selectedFile);
    }

    try {
      if (selectedFile) {
        const response = await uploadShipperInvoiceApi(formData);

        if (response?.data?.status == 200) {
          setData((prev) => ({
            ...prev,
            shipper_invoice: response.data?.shipper_url,
          }));
        } else {
          showAlert("Error while uploading Shipper Invoice", "error");
          setFileName("No file chosen");
        }
      } else {
        showAlert("Please reselect file to upload", "error");
        setFileName("No file chosen");
      }
    } catch (error) {
      console.log(error);
      showAlert("Error while uploading Shipper Invoice", "error");
      setFileName("No file chosen");
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
        ...(data?.import_booking == 2
          ? {
            state: data?.state,
            country_code: data?.destination_country_code || "IN",
            import_booking: data?.import_booking || 2,
            origin_country: data?.origin_country_id,
            origin_country_code: data?.origin_country_code,
            origin_city: data?.origin_city,
            origin_state: data?.origin_state_code,
            origin_state_name: data?.origin_state,
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
        ...(data?.import_booking == 2
          ? {
            state: data?.state,
            country_code: data?.destination_country_code || "IN",
            import_booking: data?.import_booking || 2,
            origin_country: data?.origin_country_id,
            origin_country_code: data?.origin_country_code,
            origin_city: data?.origin_city,
            origin_state: data?.origin_state_code,
            origin_state_name: data?.origin_state,
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
      if (data?.is_spot == 1) {
        let actualWeight;
        if (data?.shipment_type == "2") {
          actualWeight = Number(rateData?.weight);
        } else {
          actualWeight = Number(
            rateData?.shipment_dimensions?.reduce(
              (acc: any, curr: any) => Number(acc) + Number(curr?.weight || 0),
              0,
            ),
          );
        }

        if (
          actualWeight < Number(data?.weight_from) ||
          actualWeight > Number(data?.weight_to)
        ) {
          showAlert("Weight should be in weight slab", "warning");
          return;
        }
      }

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

  const getSkynetCode = async () => {
    try {
      const response: any = await Get_skynet_service_code_api(
        data?.shipment_type,
        data?.destination_country,
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

  const getFranchiseeDetails = async (franchisee_id: string) => {
    try {
      const response = await Get_franchisee_details(franchisee_id);
      if (response?.status == 200) {
        if (response?.data?.data.length > 0) {
          setFranchiseeData(response?.data?.data[0]);
        } else {
          setFranchiseeData(null);
          showAlert("Franchisee Details not available", "warning");
        }
      }
    } catch (error) {
      showAlert("Error while fetching Franchisee Details", "error");
    }
  };

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
                        className={`border p-1 uppercase ${elem?.charge_name ? "" : "text-center"
                          }`}
                      >
                        {elem?.charge_name ? elem?.charge_name : "- - - - -"}
                      </Table.Td>
                      <Table.Td className="border p-1">
                        {Number(elem?.charge_amount).toLocaleString("en-IN")}
                      </Table.Td>
                    </Table.Tr>
                  ),
              )}

            <Table.Tr className="border p-1">
              <Table.Td className="border p-1 font-semibold">TOTAL</Table.Td>
              <Table.Td className="border p-1 font-semibold">
                {Number(
                  priceDetailsData?.grand_total_without_gst,
                ).toLocaleString("en-IN")}
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Dialog.Description>
    </>
  );

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
                maxLength={data?.destination_country_code == "US" ? 10 : 8}
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

  const checkAcl = async (booking_charges: any) => {
    setAclSpinner(true);
    try {
      const response = await Check_acl(
        data?.franchisee_id,
        booking_charges,
        data?.airwaybill_no,
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
          "error",
        );
      }
    } catch (error) {
      showAlert("Something went wrong", "error");
    } finally {
      setAclSpinner(false);
    }
  };

  const handleEditBooking = async () => {
    if (data?.courier_code?.includes("fedex") && !data?.kyc_details) {
      showAlert("Please upload kyc details", "warning");
      return;
    }

    setSpinner(true);
    setShipmentResponse("");
    setIsError(false);
    setIsLoading(true);

    try {
      const MID = data?.manufacturer_id || "INSKAGLO1281NEW";
      const result = await Edit_booking_api({
        ...data,
        counter: skartCounter,
        ...(data?.courier_code.includes("widect")
          ? { manufacturer_id: MID }
          : {}),
      });
      if (result?.data?.status == 200) {
        setShipmentResponse(result?.data?.data[0]);
        setSkartCounter(0);
        setData((prev) => ({ ...prev, counter: 0 }));
        setCurrentStep(4);
        setCurrentFaq(4);
      } else if (result?.data?.status == 201) {
        setOtpField(true);
        showAlert(result?.data?.error_message, "success");
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
      }
    } catch (error) {
      setSkartCounter((prev) => Number(prev) + 1);
      setIsError(true);
    } finally {
      setSpinner(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
    getFranchiseeDetails(awbData?.pickup_data?.pickup_franchisee_id);
    if (awbData?.pickup_data?.inco_term) {
      setData((prev) => ({
        ...prev,
        incoterm: awbData?.pickup_data?.inco_term,
      }));
    }
  }, []);

  return (
    <>
      <div className="overflow-y-scroll scrollbar-hidden h-[550px] md:h-full md:overflow-y-auto mb-8">
        <div
          className="p-2 my-2 cursor-pointer rounded-full shadow-lg mr-4 w-8 bg-white"
          onClick={() => {
            setAwbNo("");
            setShowEditBooking(false);
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
                  {!shipmentResponse && (
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
                  )}
                </div>

                <div className="flex gap-2 ">
                  <div className="text-center p-1 border-2 mx-auto h-14 w-10 rounded">
                    <img
                      src={`https://flagsapi.com/${data?.origin_country_code}/flat/32.png`}
                      alt="origin-flag"
                    />
                    <span className="text-sm">
                      ({data?.origin_country_code})
                    </span>
                  </div>
                  <div className="mx-auto p-1 pt-2 h-14 min-w-28 border-2 rounded flex flex-col  justify-center">
                    <h1 className="font-medium text-sm md:text-lg">
                      {data?.import_booking == 2
                        ? data?.origin_country
                        : "INDIA"}
                    </h1>
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
                  {!shipmentResponse && (
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
                  )}

                  {destinationModal && (
                    <Modal
                      size="md"
                      title={"Change Destination"}
                      open={destinationModal}
                      setOpen={setDestinationModal}
                      description={destinationDescription}
                      footer={destinationFooter}
                    />
                  )}
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
                    <div className="text-slate-500 text-sm mt-0.5">{`AWB No : ${data?.airwaybill_no}`}</div>
                  </div>
                  <div className="px-2 py-1 w-[30%] text-sm text-center font-medium text-white rounded-full cursor-pointer bg-green-500 whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {Number(
                      Number(franchiseeData?.available_credit_limit).toFixed(2),
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
                      className={`${currentStep == 1 ? "" : "rotate-180 transform"
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
                          <div className="grid grid-cols-1  md:grid-cols-2 gap-4">
                            <div className="flex gap-4 w-full">
                              <div
                                className={`${showField ? "w-1/2" : "w-full"}`}
                              >
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
                                        item?.booking_shipment_type_id !== 4,
                                    )
                                    ?.map(
                                      (type) =>
                                        type?.is_active == 1 && (
                                          <option
                                            key={type?.booking_shipment_type_id}
                                            value={
                                              type?.booking_shipment_type_id
                                            }
                                          >
                                            {type?.shipment_type}
                                          </option>
                                        ),
                                    )}
                                </FormSelect>
                              </div>
                              {showField && data?.shipment_type != "4" ? (
                                <div className="w-1/2">
                                  <FormLabel
                                    htmlFor="directParty"
                                    className="block mt-2 md:mb-2 md:mt-0 text-base font-medium text-gray-900 dark:text-white"
                                  >
                                    INCOTERM{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>

                                  <FormSelect
                                    id="default"
                                    value={data?.incoterm}
                                    disabled={
                                      rateSpinner ||
                                      spinner ||
                                      shipmentResponse?.airwaybilno ||
                                      isRestricted
                                    }
                                    onChange={(e) => {
                                      setData((prev) => ({
                                        ...prev,
                                        incoterm: e.target.value,
                                        shipment_charges: {},
                                        courier_id: "",
                                        courier_code: "",
                                        courier_name: "",
                                        courier_vendor_code: "",
                                      }));
                                      setCurrentFaq(1);
                                      setCurrentStep(1);
                                    }}
                                  >
                                    <option value="">Select Incoterm</option>
                                    {incotermType &&
                                      incotermType
                                        ?.filter((item) =>
                                          isRestricted
                                            ? item?.id === 1
                                            : item?.id === 1 || item?.id === 2,
                                        )
                                        ?.map((ele, index) => (
                                          <option key={index} value={ele?.id}>
                                            {ele?.name}
                                          </option>
                                        ))}
                                  </FormSelect>
                                </div>
                              ) : (
                                <></>
                              )}
                            </div>

                            <div>
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

                            {data?.import_booking == "2" ? (
                              <div>
                                <FormLabel
                                  htmlFor="import-booking-type"
                                  className="block mt-2 md:mb-2 md:mt-0 text-base font-medium text-gray-900 dark:text-white"
                                >
                                  IMPORT BOOKING TYPE{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormSelect
                                  id="import-booking-type"
                                  value={data?.import_booking_type}
                                  disabled={shipmentResponse}
                                  onChange={(e) => {
                                    setData((prev) => ({
                                      ...prev,
                                      import_booking_type: e.target.value,
                                    }));
                                    setCurrentFaq(1);
                                    setCurrentStep(1);
                                  }}
                                >
                                  <option value="">
                                    Select Import Booking Type
                                  </option>

                                  <option value={1}>
                                    Normal Import Booking
                                  </option>
                                  <option value={2}>BSO Import Booking</option>
                                  <option value={3}>
                                    Cargo Import Booking
                                  </option>
                                </FormSelect>
                              </div>
                            ) : null}
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
                                        ),
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
                                          setEditIndex();
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
                        <div className="flex w-full items-end justify-between mb-2">
                          <div className="w-1/2 pl-5">
                            <FormLabel
                              htmlFor="regular-form-1"
                              className="mt-2 text-base font-medium text-gray-900 whitespace-nowrap"
                            >
                              Shipper Invoice
                            </FormLabel>
                            {data?.shipper_invoice ? (
                              <div
                                className="flex flex-row items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 w-fit"
                                onClick={() =>
                                  window.open(
                                    data?.shipper_invoice,
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
                                title="View Shipper Invoice"
                              >
                                <Lucide
                                  icon="FileText"
                                  className="w-8 h-8 text-mustard flex-shrink-0"
                                />
                                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {fileName !== "No file chosen"
                                    ? fileName
                                    : "Shipper Invoice"}
                                </span>
                              </div>
                            ) : (
                              <div className=" flex border-2 border-l-none w-full  rounded-lg">
                                <label
                                  className="cursor-pointer bg-mustard text-white px-4 py-2 rounded-l-lg"
                                  htmlFor="file-upload"
                                >
                                  File
                                  <input
                                    className="sr-only"
                                    id="file-upload"
                                    type="file"
                                    onChange={(e) => uploadInvoice(e)}
                                  />
                                </label>
                                <div className="p-2 pt-3 text-gray-500 whitespace-nowrap overflow-hidden overflow-ellipsis">
                                  {fileName}
                                </div>
                              </div>
                            )}
                          </div>
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
                              className={`${currentStep == 2 ? "" : "rotate-180 transform"
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
                              {data?.shipment_type != "4" &&
                                data?.booking_type != "2" && (
                                  <div className="py-3 flex justify-center">
                                    <FormSwitch>
                                      <FormSwitch.Label
                                        htmlFor="is_ddp"
                                        className={`${data?.incoterm == 2
                                          ? "text-black"
                                          : "text-mustard font-bold text-base"
                                          } cursor-pointer hover:text-mustard mr-4`}
                                      >
                                        DDU
                                      </FormSwitch.Label>
                                      <FormSwitch.Input
                                        id="is_ddp"
                                        type="checkbox"
                                        checked={
                                          data?.incoterm == 2 ? true : false
                                        }
                                        // onChange={(e) => {
                                        //   setCurrentStep(2);
                                        //   setCurrentFaq(2);
                                        //   handleDataFilter(
                                        //     allVendorData,
                                        //     e.target.checked ? 2 : 1
                                        //   );
                                        //   setBooking((prev) => ({
                                        //     ...prev,
                                        //     incoterm: e.target.checked ? 2 : 1,
                                        //     shipment_charges: {},
                                        //     courier_id: "",
                                        //     courier_code: "",
                                        //     courier_name: "",
                                        //     courier_vendor_code: "",
                                        //   }));
                                        // }}
                                        disabled={true}
                                      />
                                      <FormSwitch.Label
                                        htmlFor="is_ddp"
                                        className={`${data?.incoterm == 2
                                          ? "text-mustard font-bold text-base"
                                          : "text-black"
                                          }  cursor-pointer hover:text-mustard ml-4`}
                                      >
                                        DDP
                                      </FormSwitch.Label>
                                    </FormSwitch>
                                  </div>
                                )}
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
                                                elem?.grand_total_without_gst,
                                              ).toFixed(2),
                                            ).toLocaleString("en-IN")}
                                            /-
                                          </Table.Td>
                                          <Table.Td className="border p-1 text-sm whitespace-nowrap">
                                            {Number(
                                              elem?.actual_weight,
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
                                  onClick={async (
                                    e: React.MouseEvent<HTMLButtonElement>,
                                  ) => {
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
                                        ?.includes("widect")
                                    ) {
                                      if (!data?.incoterm) {
                                        if (isRestricted) {
                                          setCurrentFaq(1);
                                          setCurrentStep(1);
                                          setData({
                                            ...data,
                                            incoterm: 1,
                                          });
                                          setShowField(true);
                                          showAlert(
                                            "DDU Incoterm is selected",
                                            "warning",
                                          );
                                          return;
                                        } else {
                                          setCurrentFaq(1);
                                          setCurrentStep(1);
                                          setShowField(true);
                                          showAlert(
                                            "Please select Incoterm",
                                            "warning",
                                          );
                                          return;
                                        }
                                      } else {
                                        setShowField(true);
                                        showAlert(
                                          `${data?.incoterm == 1
                                            ? "DDU Incoterm is selected"
                                            : data?.incoterm == 2
                                              ? "DDP Incoterm is selected"
                                              : "Incoterm is not selected"
                                          }`,
                                          "warning",
                                        );
                                      }

                                      if (
                                        data?.destination_country_code ==
                                        "GB" ||
                                        data?.destination_country_code == "US"
                                      ) {
                                        if (
                                          ![22, 48, 50].includes(
                                            Number(data?.unit?.currency)
                                          )
                                        ) {
                                          setCurrentFaq(1);
                                          setCurrentStep(1);
                                          showAlert(
                                            "Only USD, EUR or GBP is allowed in currency",
                                            "warning",
                                          );
                                          return;
                                        }
                                      }

                                      await checkProhibited(
                                        vendorData[0]?.grand_total_with_gst,
                                      );
                                    } else {
                                      setShowField(false);
                                    }

                                    if (
                                      vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("emirates")
                                    ) {
                                      setReceiverDetails((prev: any) => ({
                                        ...prev,
                                        is_residential:
                                          Number(
                                            awbData?.pickup_data
                                              ?.is_residential,
                                          ) || "",
                                      }));
                                      setData((prev: any) => ({
                                        ...prev,
                                        is_residential:
                                          Number(
                                            awbData?.pickup_data
                                              ?.is_residential,
                                          ) || "",
                                      }));
                                    }

                                    if (
                                      (vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("ups") ||
                                        vendorData[0]?.special_code
                                          ?.toLowerCase()
                                          ?.includes("fedex")) &&
                                      (data?.shipment_type == "1" ||
                                        data?.shipment_type == "7")
                                    ) {
                                      setShipperPreview(!data?.shipper_invoice);
                                      if (data?.shipper_invoice) {
                                        setShowField(false);
                                        checkAcl(
                                          vendorData[0]?.grand_total_with_gst,
                                        );
                                      }
                                    } else {
                                      delete data?.invoiceData;
                                      if (vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("dhl")) {
                                        if (data?.shipment_type == "2") {
                                          if (data?.description.length > 90) {
                                            showAlert(
                                              "Description length should be less than 90 characters in Dhl",
                                              "warning",
                                            );
                                            setCurrentStep(1);
                                            setCurrentFaq(1);
                                            return;
                                          }
                                        } else {
                                          const hasInvalid = dimensionData?.some(
                                            (elem: any, index: any) => {
                                              if (
                                                elem?.item_description?.length > 90
                                              ) {
                                                showAlert(
                                                  "Description length should be less than 90 characters in Dhl",
                                                  "warning",
                                                );
                                                setOpenModal(true);
                                                setEditDimensionData(elem);
                                                setEditIndex(index);
                                                setCurrentStep(1);
                                                setCurrentFaq(1);

                                                return true;
                                              }
                                              return false;
                                            },
                                          );
                                          if (hasInvalid) return;
                                        }
                                      }
                                      checkAcl(
                                        vendorData[0]?.grand_total_with_gst,
                                      );
                                    }

                                    if (
                                      vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("aramex")
                                    ) {
                                      setSenderDetails((prev) => ({
                                        ...prev,
                                        tax_paid:
                                          Number(
                                            awbData?.additional_data?.tax_paid,
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
                                            awbData?.additional_data?.tax_paid,
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
                                        ?.includes("sf_express")
                                    ) {
                                      setSenderDetails((prev) => ({
                                        ...prev,
                                        tax_paid:
                                          Number(
                                            awbData?.additional_data?.tax_paid,
                                          ) || "",
                                        tax_amount:
                                          awbData?.additional_data
                                            ?.tax_amount || "",
                                        tax_id:
                                          awbData?.pickup_data
                                            ?.tax_id || "",
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
                                            awbData?.additional_data?.tax_paid,
                                          ) || "",
                                        tax_amount:
                                          awbData?.additional_data
                                            ?.tax_amount || "",
                                        consignee_gst_number:
                                          awbData?.additional_data
                                            ?.consignee_gst_number || "",
                                        tax_id:
                                          awbData?.pickup_data
                                            ?.tax_id || "",
                                      }));
                                    }

                                    if (
                                      vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("skynet")
                                    ) {
                                      getSkynetCode();
                                    }

                                    if (
                                      vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("widect") &&
                                      data?.booking_type == "1"
                                    ) {
                                      setData((prev) => ({
                                        ...prev,
                                        business_number:
                                          awbData?.additional_data
                                            ?.business_number || "",
                                        ioss_number:
                                          awbData?.additional_data
                                            ?.ioss_number || "",
                                        eori_number:
                                          awbData?.additional_data
                                            ?.eori_number || "",
                                        rgr_number:
                                          awbData?.additional_data
                                            ?.rgr_number || "",
                                        sku:
                                          awbData?.additional_data?.sku || "",
                                        market_place_vat_number:
                                          awbData?.additional_data
                                            ?.market_place_vat_number || "",
                                        vat_number:
                                          awbData?.pickup_data?.vat_number ||
                                          "",
                                      }));
                                      setSenderDetails((prev) => ({
                                        ...prev,
                                        business_number:
                                          awbData?.additional_data
                                            ?.business_number || "",
                                        ioss_number:
                                          awbData?.additional_data
                                            ?.ioss_number || "",
                                        eori_number:
                                          awbData?.additional_data
                                            ?.eori_number || "",
                                        rgr_number:
                                          awbData?.additional_data
                                            ?.rgr_number || "",
                                        sku:
                                          awbData?.additional_data?.sku || "",
                                        market_place_vat_number:
                                          awbData?.additional_data
                                            ?.market_place_vat_number || "",
                                        vat_number:
                                          awbData?.pickup_data?.vat_number ||
                                          "",
                                      }));
                                    }

                                    if (
                                      vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("dhl") &&
                                      data?.shipment_type == "1" &&
                                      data?.destination_country_code == "US"
                                    ) {
                                      setData((prev: any) => ({
                                        ...prev,
                                        commodity_code:
                                          awbData?.pickup_data
                                            ?.commodity_code || "",
                                      }));
                                      setSenderDetails((prev: any) => ({
                                        ...prev,
                                        commodity_code:
                                          awbData?.pickup_data
                                            ?.commodity_code || "",
                                      }));
                                    }

                                    if (
                                      vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("dhl") &&
                                      (data?.destination_country_code == "MX" ||
                                        data?.destination_country_code == "ID")
                                    ) {
                                      setReceiverDetails((prev) => ({
                                        ...prev,
                                        consignee_tax_id:
                                          data?.consignee_tax_id || "",
                                      }));
                                    }

                                    if (
                                      vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("dhl")
                                    ) {
                                      setData((prev) => ({
                                        ...prev,
                                        shipment_purpose:
                                          awbData?.pickup_data
                                            ?.shipment_purpose || "",
                                        shipper_type:
                                          awbData?.additional_data
                                            ?.shipper_type || "",
                                      }));
                                      setSenderDetails((prev) => ({
                                        ...prev,
                                        shipment_purpose:
                                          awbData?.pickup_data
                                            ?.shipment_purpose || "",
                                        shipper_type:
                                          awbData?.additional_data
                                            ?.shipper_type || "",
                                        consigner_address_3:
                                          awbData?.shipper_data[0]
                                            ?.street_address_1 || "",
                                      }));
                                      setReceiverDetails((prev) => ({
                                        ...prev,
                                        consignee_address_3:
                                          awbData?.consignee_data[0]
                                            ?.address_3 || "",
                                      }));
                                    }
                                    if (
                                      vendorData[0]?.special_code
                                        ?.toLowerCase()
                                        ?.includes("skynet")
                                    ) {
                                      setData((prev) => ({
                                        ...prev,
                                        shipment_purpose:
                                          awbData?.pickup_data
                                            ?.shipment_purpose || "",
                                      }));
                                      setSenderDetails((prev) => ({
                                        ...prev,
                                        shipment_purpose:
                                          awbData?.pickup_data
                                            ?.shipment_purpose || "",
                                      }));
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
                        className={`${currentStep == 3 ? "" : "rotate-180 transform"
                          } h-5 w-5 text-mustard`}
                      />
                    </Disclosure.Button>
                    {currentStep == 3 && (
                      <Disclosure.Panel
                        static={true}
                        className="px-4 pb-2 pt-4 text-sm text-gray-500 border-t"
                      >
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-12 md:col-span-6">
                            <div className="flex  justify-between  items-center bg-[#F9F6EF] rounded-lg px-3 py-2">
                              <h1 className="flex items-center  font-bold text-sm md:text-base whitespace-nowrap">
                                <img
                                  src={Courier_commercial_icon}
                                  alt="Courier_commercial_icon"
                                  className="w-[38px] h-[auto] mr-2"
                                />
                                <strong className="uppercase">
                                  Sender Details{" "}
                                </strong>
                              </h1>
                              <div className="">
                                {!spinner && (
                                  <Tippy
                                    className="cursor-pointer bg-[#fab221] rounded-lg px-1 py-1 flex items-center "
                                    content="Add Sender Details"
                                    options={{ placement: "right" }}
                                    onClick={() => {
                                      setSenderOpen(true);
                                    }}
                                  >
                                    <Lucide
                                      icon="PlusCircle"
                                      className="w-6 h-6 cursor-pointer text-[#fff]"
                                      onClick={() => {
                                        setSenderOpen(true);
                                      }}
                                    />
                                  </Tippy>
                                )}
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
                            </div>

                            <div className="w-full m-2">
                              {data?.consigner_first_name && (
                                <div className="flex items-center mb-1">
                                  <i className="w-[28px] h-[28px] bg-[#FFF0CC] text-[#D8A128] rounded-full p-1 mr-3 flex items-center justify-center">
                                    <Lucide icon="User" className="w-[22px]" />
                                  </i>
                                  <p className="text-sm">
                                    {data?.consigner_first_name}
                                  </p>
                                </div>
                              )}
                              {data?.consigner_address_1 && (
                                <div className="flex items-center mb-1">
                                  <i className="w-[28px] h-[28px] bg-[#FFF0CC] text-[#D8A128] rounded-full p-1 mr-3 flex items-center justify-center">
                                    <Lucide
                                      icon="MapPin"
                                      className="w-[22px]"
                                    />
                                  </i>
                                  <p className="text-sm">
                                    {data?.consigner_address_1}
                                  </p>
                                </div>
                              )}
                              {data?.consigner_city && (
                                <div className="flex items-center mb-1">
                                  <i className="w-[28px] h-[28px] bg-[#FFF0CC] text-[#D8A128] rounded-full p-1 mr-3 flex items-center justify-center">
                                    <Lucide
                                      icon="Navigation"
                                      className="w-[22px]"
                                    />
                                  </i>
                                  <p className="text-sm">
                                    {data?.consigner_city}
                                  </p>
                                </div>
                              )}
                              {data?.consigner_pincode && (
                                <div className="flex items-center mb-1">
                                  <i className="w-[28px] h-[28px] bg-[#FFF0CC] text-[#D8A128] rounded-full p-1 mr-3 flex items-center justify-center">
                                    <Lucide
                                      icon="Locate"
                                      className="w-[22px]"
                                    />
                                  </i>
                                  <p className="text-sm">
                                    {data?.consigner_pincode}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col-span-12 md:col-span-6">
                            <div className="flex justify-between items-center bg-[#F0FFF2] rounded-lg px-3 py-2">
                              {" "}
                              <h1 className="flex items-center font-bold text-sm md:text-base whitespace-nowrap">
                                <img
                                  src={ReceiverIcon}
                                  alt="ReceiverIcon"
                                  className="w-[38px] h-[auto]"
                                />
                                <strong className="uppercase ml-2">
                                  {" "}
                                  Receiver Details
                                </strong>
                              </h1>
                              {!spinner && (
                                <Tippy
                                  className="cursor-pointer bg-[#25A21E] rounded-lg px-1 py-1 flex items-center "
                                  content="Add Receiver Details"
                                  options={{ placement: "right" }}
                                  onClick={() => {
                                    setReceiverOpen(true);
                                  }}
                                >
                                  <Lucide
                                    icon="PlusCircle"
                                    className="w-6 h-6 cursor-pointer text-[#fff]"
                                    onClick={() => {
                                      setReceiverOpen(true);
                                    }}
                                  />
                                </Tippy>
                              )}
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

                            <div className="w-full m-2">
                              {data?.consignee_first_name && (
                                <div className="flex items-center mb-1">
                                  <i className="w-[28px] h-[28px] bg-[#D3F2D6] text-[#11B324] rounded-full p-1 mr-3 flex items-center justify-center">
                                    <Lucide icon="User" className="w-[22px]" />
                                  </i>
                                  <p className="text-sm">
                                    {data?.consignee_first_name}
                                  </p>
                                </div>
                              )}
                              {data?.consignee_address_1 && (
                                <div className="flex items-center mb-1">
                                  <i className="w-[28px] h-[28px] bg-[#D3F2D6] text-[#11B324] rounded-full p-1 mr-3 flex items-center justify-center">
                                    <Lucide
                                      icon="MapPin"
                                      className="w-[22px]"
                                    />
                                  </i>
                                  <p className="text-sm">
                                    {data?.consignee_address_1}
                                  </p>
                                </div>
                              )}
                              {data?.consignee_city && (
                                <div className="flex items-center mb-1">
                                  <i className="w-[28px] h-[28px] bg-[#D3F2D6] text-[#11B324] rounded-full p-1 mr-3 flex items-center justify-center">
                                    <Lucide
                                      icon="Navigation"
                                      className="w-[22px]"
                                    />
                                  </i>
                                  <p className="text-sm">
                                    {data?.consignee_city}
                                  </p>
                                </div>
                              )}
                              {data?.consignee_pincode && (
                                <div className="flex items-center mb-1">
                                  <i className="w-[28px] h-[28px] bg-[#D3F2D6] text-[#11B324] rounded-full p-1 mr-3 flex items-center justify-center">
                                    <Lucide
                                      icon="Locate"
                                      className="w-[22px]"
                                    />
                                  </i>
                                  <p className="text-sm">
                                    {data?.consignee_pincode}
                                  </p>
                                </div>
                              )}
                            </div>
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
                            onClick={handleEditBooking}
                            disabled={
                              !data?.consigner_mobile_number ||
                              !data?.consigner_company_name ||
                              !data?.consigner_first_name ||
                              !data?.consigner_address_1 ||
                              !data?.consigner_address_2 ||
                              !data?.consigner_city ||
                              !data?.consigner_state ||
                              !data?.consigner_pincode ||
                              !data?.consigner_gst_number ||
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
                              ((data?.shipment_type == "1" ||
                                data?.shipment_type == "2") &&
                                data?.courier_code?.includes("dhl") &&
                                (!data?.shipper_type ||
                                  !data?.shipment_purpose)) ||
                              ((data?.shipment_type == "1" ||
                                data?.shipment_type == "2") &&
                                data?.courier_code?.includes("skynet") &&
                                (!data?.shipment_purpose)) ||
                              (data?.courier_code?.includes("dhl") &&
                                data?.shipment_type == "1" &&
                                data?.destination_country_code == "US" &&
                                !data?.commodity_code) ||
                              (data?.courier_code?.includes("emirates") &&
                                !data?.is_residential)
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
                        className={`${currentStep == 4 ? "" : "rotate-180 transform"
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
                                    data?.shipment_charges
                                      ?.grand_total_with_gst,
                                  ).toLocaleString("en-IN")}
                                  /-
                                </Table.Td>
                              </Table.Tr>
                              {pga && (
                                <Table.Tr className="border p-1 text-mustard font-bold ">
                                  <Table.Td className="border p-1">
                                    Additional Requirement
                                  </Table.Td>
                                  <Table.Td className="border p-1">
                                    Special Documents are required for this
                                    shipment
                                  </Table.Td>
                                </Table.Tr>
                              )}
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
                          {shipmentResponse?.invoice_url && (
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
                          )}

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
                          className={`${currentStep == 2 ? "" : "rotate-180 transform"
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
                          {data?.shipment_type != "4" &&
                            data?.booking_type != "2" && (
                              <div className="py-3 flex justify-center">
                                <FormSwitch>
                                  <FormSwitch.Label
                                    htmlFor="is_ddp"
                                    className={`${data?.incoterm == 2
                                      ? "text-black"
                                      : "text-mustard font-bold text-base"
                                      } cursor-pointer hover:text-mustard mr-4`}
                                  >
                                    DDU
                                  </FormSwitch.Label>
                                  <FormSwitch.Input
                                    id="is_ddp"
                                    type="checkbox"
                                    checked={data?.incoterm == 2 ? true : false}
                                    // onChange={(e) => {
                                    //   setCurrentStep(2);
                                    //   setCurrentFaq(2);
                                    //   handleDataFilter(
                                    //     allVendorData,
                                    //     e.target.checked ? 2 : 1
                                    //   );
                                    //   setBooking((prev) => ({
                                    //     ...prev,
                                    //     incoterm: e.target.checked ? 2 : 1,
                                    //     shipment_charges: {},
                                    //     courier_id: "",
                                    //     courier_code: "",
                                    //     courier_name: "",
                                    //     courier_vendor_code: "",
                                    //   }));
                                    // }}
                                    disabled={true}
                                  />
                                  <FormSwitch.Label
                                    htmlFor="is_ddp"
                                    className={`${data?.incoterm == 2
                                      ? "text-mustard font-bold text-base"
                                      : "text-black"
                                      }  cursor-pointer hover:text-mustard ml-4`}
                                  >
                                    DDP
                                  </FormSwitch.Label>
                                </FormSwitch>
                              </div>
                            )}
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
                                            elem?.grand_total_without_gst,
                                          ).toFixed(2),
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
                              onClick={async (
                                e: React.MouseEvent<HTMLButtonElement>,
                              ) => {
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
                                    ?.includes("widect")
                                ) {
                                  if (!data?.incoterm) {
                                    if (isRestricted) {
                                      setCurrentFaq(1);
                                      setCurrentStep(1);
                                      setData({
                                        ...data,
                                        incoterm: 1,
                                      });
                                      setShowField(true);
                                      showAlert(
                                        "DDU Incoterm is selected",
                                        "warning",
                                      );
                                      return;
                                    } else {
                                      setCurrentFaq(1);
                                      setCurrentStep(1);
                                      setShowField(true);
                                      showAlert(
                                        "Please select Incoterm",
                                        "warning",
                                      );
                                      return;
                                    }
                                  } else {
                                    setShowField(true);
                                    showAlert(
                                      `${data?.incoterm == 1
                                        ? "DDU Incoterm is selected"
                                        : data?.incoterm == 2
                                          ? "DDP Incoterm is selected"
                                          : "Incoterm is not selected"
                                      }`,
                                      "warning",
                                    );
                                  }

                                  if (
                                    data?.destination_country_code == "GB" ||
                                    data?.destination_country_code == "US"
                                  ) {
                                    if (
                                      ![22, 48, 50].includes(
                                        Number(data?.unit?.currency),
                                      )
                                    ) {
                                      setCurrentFaq(1);
                                      setCurrentStep(1);
                                      showAlert(
                                        "Only USD, EUR or GBP is allowed in currency",
                                        "warning",
                                      );
                                      return;
                                    }
                                  }

                                  await checkProhibited(
                                    vendorData[0]?.grand_total_with_gst,
                                  );
                                } else {
                                  setShowField(false);
                                }

                                if (
                                  vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("emirates")
                                ) {
                                  setReceiverDetails((prev: any) => ({
                                    ...prev,
                                    is_residential:
                                      Number(
                                        awbData?.pickup_data?.is_residential,
                                      ) || "",
                                  }));
                                  setData((prev: any) => ({
                                    ...prev,
                                    is_residential:
                                      Number(
                                        awbData?.pickup_data?.is_residential,
                                      ) || "",
                                  }));
                                }

                                if (
                                  (vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("ups") ||
                                    vendorData[0]?.special_code
                                      ?.toLowerCase()
                                      ?.includes("fedex")) &&
                                  (data?.shipment_type == "1" ||
                                    data?.shipment_type == "7")
                                ) {
                                  setShipperPreview(!data?.shipper_invoice);
                                  if (data?.shipper_invoice) {
                                    setShowField(false);
                                    checkAcl(
                                      vendorData[0]?.grand_total_with_gst,
                                    );
                                  }
                                } else {
                                  delete data?.invoiceData;
                                  if (vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("dhl")) {
                                    if (data?.shipment_type == "2") {
                                      if (data?.description.length > 90) {
                                        showAlert(
                                          "Description length should be less than 90 characters in Dhl",
                                          "warning",
                                        );
                                        setCurrentStep(1);
                                        setCurrentFaq(1);
                                        return;
                                      }
                                    } else {
                                      const hasInvalid = dimensionData?.some(
                                        (elem: any, index: any) => {
                                          if (
                                            elem?.item_description?.length > 90
                                          ) {
                                            showAlert(
                                              "Description length should be less than 90 characters in Dhl",
                                              "warning",
                                            );
                                            setOpenModal(true);
                                            setEditDimensionData(elem);
                                            setEditIndex(index);
                                            setCurrentStep(1);
                                            setCurrentFaq(1);

                                            return true;
                                          }
                                          return false;
                                        },
                                      );
                                      if (hasInvalid) return;
                                    }
                                  }
                                  checkAcl(vendorData[0]?.grand_total_with_gst);
                                }

                                if (
                                  vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("aramex")
                                ) {
                                  setSenderDetails((prev) => ({
                                    ...prev,
                                    tax_paid:
                                      Number(
                                        awbData?.additional_data?.tax_paid,
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
                                        awbData?.additional_data?.tax_paid,
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
                                    ?.includes("sf_express")
                                ) {
                                  setSenderDetails((prev) => ({
                                    ...prev,
                                    tax_paid:
                                      Number(
                                        awbData?.additional_data?.tax_paid,
                                      ) || "",
                                    tax_amount:
                                      awbData?.additional_data
                                        ?.tax_amount || "",
                                    tax_id:
                                      awbData?.pickup_data
                                        ?.tax_id || "",
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
                                        awbData?.additional_data?.tax_paid,
                                      ) || "",
                                    tax_amount:
                                      awbData?.additional_data
                                        ?.tax_amount || "",
                                    consignee_gst_number:
                                      awbData?.additional_data
                                        ?.consignee_gst_number || "",
                                    tax_id:
                                      awbData?.pickup_data
                                        ?.tax_id || "",
                                  }));
                                }


                                if (
                                  vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("skynet")
                                ) {
                                  getSkynetCode();
                                }

                                if (
                                  vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("widect") &&
                                  data?.booking_type == "1"
                                ) {
                                  setData((prev) => ({
                                    ...prev,
                                    business_number:
                                      awbData?.additional_data
                                        ?.business_number || "",
                                    ioss_number:
                                      awbData?.additional_data?.ioss_number ||
                                      "",
                                    eori_number:
                                      awbData?.additional_data?.eori_number ||
                                      "",
                                    rgr_number:
                                      awbData?.additional_data?.rgr_number ||
                                      "",
                                    sku: awbData?.additional_data?.sku || "",
                                    market_place_vat_number:
                                      awbData?.additional_data
                                        ?.market_place_vat_number || "",
                                    vat_number:
                                      awbData?.pickup_data?.vat_number || "",
                                  }));
                                  setSenderDetails((prev) => ({
                                    ...prev,
                                    business_number:
                                      awbData?.additional_data
                                        ?.business_number || "",
                                    ioss_number:
                                      awbData?.additional_data?.ioss_number ||
                                      "",
                                    eori_number:
                                      awbData?.additional_data?.eori_number ||
                                      "",
                                    rgr_number:
                                      awbData?.additional_data?.rgr_number ||
                                      "",
                                    sku: awbData?.additional_data?.sku || "",
                                    market_place_vat_number:
                                      awbData?.additional_data
                                        ?.market_place_vat_number || "",
                                    vat_number:
                                      awbData?.pickup_data?.vat_number || "",
                                  }));
                                }

                                if (
                                  vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("dhl") &&
                                  data?.shipment_type == "1" &&
                                  data?.destination_country_code == "US"
                                ) {
                                  setData((prev: any) => ({
                                    ...prev,
                                    commodity_code:
                                      awbData?.pickup_data?.commodity_code ||
                                      "",
                                  }));
                                  setSenderDetails((prev: any) => ({
                                    ...prev,
                                    commodity_code:
                                      awbData?.pickup_data?.commodity_code ||
                                      "",
                                  }));
                                }

                                if (
                                  vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("dhl") &&
                                  (data?.destination_country_code == "MX" ||
                                    data?.destination_country_code == "ID")
                                ) {
                                  setReceiverDetails((prev) => ({
                                    ...prev,
                                    consignee_tax_id:
                                      data?.consignee_tax_id || "",
                                  }));
                                }

                                if (
                                  vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("dhl")
                                ) {
                                  setData((prev) => ({
                                    ...prev,
                                    shipment_purpose:
                                      awbData?.pickup_data?.shipment_purpose ||
                                      "",
                                    shipper_type:
                                      awbData?.additional_data?.shipper_type ||
                                      "",
                                  }));
                                  setSenderDetails((prev) => ({
                                    ...prev,
                                    shipment_purpose:
                                      awbData?.pickup_data?.shipment_purpose ||
                                      "",
                                    shipper_type:
                                      awbData?.additional_data?.shipper_type ||
                                      "",
                                    consigner_address_3:
                                      awbData?.shipper_data[0]
                                        ?.street_address_1 || "",
                                  }));
                                  setReceiverDetails((prev) => ({
                                    ...prev,
                                    consignee_address_3:
                                      awbData?.consignee_data[0]?.address_3 ||
                                      "",
                                  }));
                                }
                                if (
                                  vendorData[0]?.special_code
                                    ?.toLowerCase()
                                    ?.includes("skynet")
                                ) {
                                  setData((prev) => ({
                                    ...prev,
                                    shipment_purpose:
                                      awbData?.pickup_data?.shipment_purpose ||
                                      "",
                                  }));
                                  setSenderDetails((prev) => ({
                                    ...prev,
                                    shipment_purpose:
                                      awbData?.pickup_data?.shipment_purpose ||
                                      "",
                                  }));
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

export default edit_booking;
