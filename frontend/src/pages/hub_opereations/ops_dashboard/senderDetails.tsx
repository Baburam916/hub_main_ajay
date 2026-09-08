import { Dialog } from "../../../base-components/Headless";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import { useEffect, useState } from "react";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";
import {
  Get_document_type,
  Get_export_type,
  Get_gst_applicable,
  Get_tax_payment,
  getConsignerDetailsApi,
} from "../../../AllServices/services";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormSelect,
  InputGroup,
} from "../../../base-components/Form";
import { downloadAttachment } from "../../../utils";
import KycModal from "./KycModal";

interface SenderDetailsProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  booking?: any;
  setJobData?: () => void;
  vendorData?: any[];
}

const SenderDetails: React.FC<SenderDetailsProps> = ({
  open,
  onClose,
  isEdit = false,
  booking,
  setJobData,
  vendorData,
}) => {
  const { showAlert } = useAlert();
  const [docCheck, setDocCheck] = useState(null);
  const [contactEdit, setContactEdit] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [kycModalPreview, setKycModalPreview] = useState<boolean>(false);
  const [consignerDocTypes, setConsignerDocTypes] = useState([]);
  const [gstApplicable, setGstApplicable] = useState([]);
  const [taxPaymentOption, setTaxPaymentOption] = useState([]);
  const [exportTypesData, setExportTypesData] = useState([]);

  const isAramexTaxSection =
    (booking?.shipment_type == 4 || booking?.shipment_type == 5) &&
    vendorData
      ?.find((item: any) => item?.product_id == booking?.courier_id)
      ?.product_name?.toLowerCase()
      .includes("aramex");
  const [senderDetails, setSenderDetails] = useState({
    consigner_mobile_number:
      booking?.shipper_details?.consigner_mobile_number || "",
    consigner_email_id: booking?.shipper_details?.consigner_email_id || "",
    consigner_first_name: booking?.shipper_details?.consigner_first_name || "",
    consigner_company_name:
      booking?.shipper_details?.consigner_company_name || "",
    consigner_address_1: booking?.shipper_details?.consigner_address_1 || "",
    consigner_address_2: booking?.shipper_details?.consigner_address_2 || "",
    consigner_pincode: booking?.shipper_details?.consigner_pincode || booking?.org_zip || "",
    consigner_city: booking?.shipper_details?.consigner_city || booking?.org_city || "",
    consigner_state: booking?.shipper_details?.consigner_state || booking?.org_state || "",
    consigner_doc_type: booking?.shipper_details?.consigner_doc_type || "1",
    consigner_gst_number: booking?.shipper_details?.consigner_gst_number || "",
    consigner_gst_applicable:
      booking?.shipper_details?.consigner_gst_applicable || "",
    consigner_tax_payment:
      booking?.shipper_details?.consigner_tax_payment || "",
    pickup_required: 2,
    ...(isAramexTaxSection
      ? {
          export_type: booking?.shipper_details?.export_type || "",
          tax_paid: booking?.shipper_details?.tax_paid || 2,
          tax_amount: booking?.shipper_details?.tax_amount || "",
        }
      : {}),
    ...(booking?.import_booking == 2 ? {} : { kyc_details: booking?.shipper_details?.kyc_details || "", }),
  });

  const handleDataReset = () => {
    setSenderDetails({
      consigner_mobile_number: "",
      consigner_email_id: "",
      consigner_first_name: "",
      consigner_company_name: "",
      consigner_address_1: "",
      consigner_address_2: "",
      consigner_pincode: booking?.org_zip || "",
      consigner_city: booking?.shipper_details?.consigner_city || booking?.org_city || "",
      consigner_state: booking?.org_state || "",
      consigner_doc_type: "1",
      consigner_gst_number: "",
      consigner_gst_applicable: "",
      consigner_tax_payment: "",
      pickup_required: 2,
      ...(isAramexTaxSection
        ? { export_type: "", tax_paid: 2 , tax_amount: "" }
        : {}),
      ...(booking?.import_booking == 2 ? {} : { kyc_details: "", }),
    });
    setContactEdit(false);
  };

  const getConsignerData = async () => {
    if (spinner) {
      return;
    }
    if (!senderDetails?.consigner_mobile_number) {
      showAlert("Please enter mobile number", "error");
      return;
    }
    const mobile = senderDetails.consigner_mobile_number;
    const isSequential = mobile.split("").every((d, i, arr) => i === 0 || (parseInt(arr[i - 1]) + 1) % 10 === parseInt(d));
    if (isSequential) {
      showAlert("Please enter a valid mobile number", "warning");
      return;
    }
    setSpinner(true);
    try {
      const response: any = await getConsignerDetailsApi(
        senderDetails?.consigner_mobile_number,
        booking?.import_booking
      );
      if (response?.data?.status == 200) {
        if (response?.data?.data?.kyc_details?.length == 0) {
          setContactEdit(true);
          setSenderDetails((prev) => ({
            ...prev,
            ...response?.data?.data,
            kyc_details: null,
          }));
        } else if (response?.data?.data?.kyc_details == undefined) {
          if (booking?.import_booking == 2) {
            setContactEdit(true);
            setSenderDetails((prev) => ({
              ...prev,
              ...response?.data?.data,
              kyc_details: null,
            }));
          } else {
            setContactEdit(true);
            setSenderDetails((prev) => ({
              ...prev,
              ...response?.data?.data,
            }));
          }
        } else {
          setContactEdit(true);
          setSenderDetails((prev) => ({ ...prev, ...response?.data?.data }));
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

  const handleValidate = (docNumber: string) => {
    if (docNumber == "") {
      setDocCheck(null);
      return;
    }
    if (senderDetails?.consigner_doc_type == 1 && docNumber) {
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
      const isValid = gstRegex.test(docNumber);
      isValid ? setDocCheck(true) : setDocCheck(false);
      return;
    } else if (senderDetails?.consigner_doc_type == 2 && docNumber) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

      const isValid = panRegex.test(docNumber);
      isValid ? setDocCheck(true) : setDocCheck(false);
      return;
    } else if (senderDetails?.consigner_doc_type == 3 && docNumber) {
      const passportRegex = /^[A-PR-WY-Z][1-9]\\d\\s?\\d{4}[1-9]$/;

      const isValid = passportRegex.test(docNumber);
      isValid ? setDocCheck(true) : setDocCheck(false);
      return;
    } else if (senderDetails?.consigner_doc_type == 4 && docNumber) {
      const aadhaarRegex = /^\d{12}$/;

      const isValid = aadhaarRegex.test(docNumber);
      isValid ? setDocCheck(true) : setDocCheck(false);
      return;
    } else if (
      (senderDetails?.consigner_doc_type == 5 ||
        senderDetails?.consigner_doc_type == 6 ||
        senderDetails?.consigner_doc_type == 7) &&
      docNumber
    ) {
      setDocCheck(true);
      return;
    } else if (senderDetails?.consigner_doc_type == 8 && docNumber) {
      const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
      const isValid = tanRegex.test(docNumber);
      isValid ? setDocCheck(true) : setDocCheck(false);
      return;
    } else {
      setDocCheck(null);
      return;
    }
  };

  const handleClick = () => {
    const mobile = senderDetails.consigner_mobile_number;
    if (!mobile) {
      showAlert("Please enter mobile number", "error");
      return;
    }
    const isSequential = mobile.split("").every((d, i, arr) => i === 0 || (parseInt(arr[i - 1]) + 1) % 10 === parseInt(d));
    if (isSequential) {
      showAlert("Please enter a valid mobile number", "warning");
      return;
    }
    for (const key in senderDetails) {
      if (
        key == "kyc_details" ||
        key == "consigner_mobile_number" ||
        key == "consigner_email_id" ||
        key == "consigner_company_name" ||
        key == "consigner_first_name" ||
        key == "consigner_doc_type" ||
        key == "consigner_gst_number" ||
        key == "consigner_tax_payment" ||
        key == "consigner_gst_applicable"
      ) {
        continue;
      }
      if (
        senderDetails.hasOwnProperty(key) &&
        (senderDetails[key] == "" || !senderDetails[key])
      ) {
        showAlert(`${key.replaceAll("_", " ")} is required`, "warning");
        return;
      }
    }
    if (isAramexTaxSection) {
      if (!senderDetails?.export_type) {
        showAlert("export type is required", "warning");
        return;
      }
      if (senderDetails?.tax_paid != 1 && senderDetails?.tax_paid != 2) {
        showAlert("tax paid is required", "warning");
        return;
      }
      if (senderDetails?.tax_paid == 1 && !senderDetails?.tax_amount) {
        showAlert("tax amount is required", "warning");
        return;
      }
    }
    setJobData((prev) => ({
      ...prev,
      shipper_details: senderDetails,
    }));
    onClose();
  };

  useEffect(() => {
    setSenderDetails({
      consigner_mobile_number:
        booking?.shipper_details?.consigner_mobile_number || "",
      consigner_email_id: booking?.shipper_details?.consigner_email_id || "",
      consigner_first_name:
        booking?.shipper_details?.consigner_first_name || "",
      consigner_company_name:
        booking?.shipper_details?.consigner_company_name || "",
      consigner_address_1: booking?.shipper_details?.consigner_address_1 || "",
      consigner_address_2: booking?.shipper_details?.consigner_address_2 || "",
      consigner_pincode: booking?.shipper_details?.consigner_pincode || booking?.org_zip || "",
      consigner_city: booking?.shipper_details?.consigner_city || booking?.org_city || "",
      consigner_state: booking?.shipper_details?.consigner_state || booking?.org_state || "",
      consigner_doc_type: booking?.shipper_details?.consigner_doc_type || "1",
      consigner_gst_number:
        booking?.shipper_details?.consigner_gst_number || "",
      consigner_gst_applicable:
        booking?.shipper_details?.consigner_gst_applicable || "",
      consigner_tax_payment:
        booking?.shipper_details?.consigner_tax_payment || "",
      pickup_required: 2,
      kyc_details: booking?.shipper_details?.kyc_details || "",
      ...(isAramexTaxSection
        ? {
            export_type: booking?.shipper_details?.export_type || "",
            tax_paid: booking?.shipper_details?.tax_paid || 2,
            tax_amount: booking?.shipper_details?.tax_amount || "",
          }
        : {}),
    });
  }, [booking]);

  useEffect(() => {
    if (!isEdit) {
      setSenderDetails(booking);
    }
    Get_document_type().then((res) => {
      setConsignerDocTypes(res?.data?.data);
    });

    Get_gst_applicable().then((res) => {
      setGstApplicable(res?.data?.data);
    });

    Get_tax_payment().then((res) => {
      setTaxPaymentOption(res?.data?.data);
    });

    Get_export_type().then((res) => {
      setExportTypesData(res?.data?.data);
    });
  }, []);

  return (
    <Dialog staticBackdrop open={open} size={"lg"} onClose={onClose}>
      <Dialog.Panel className={"mt-16"}>
        <Dialog.Title className="flex justify-between">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <h2 className="mr-auto text-base font-medium whitespace-nowrap">
              Sender Details
            </h2>

            {booking?.import_booking == 1 && (senderDetails?.kyc_details?.document_path_1 &&
              senderDetails?.kyc_details?.document_path_2 ? (
              <>
                {senderDetails?.kyc_details?.document_path_1 && (
                  <Button
                    className="text-white bg-mustard p-[2px] md:p-2"
                    size="sm"
                    onClick={() =>
                      downloadAttachment(
                        senderDetails?.kyc_details?.document_path_1,
                        "document_1"
                      )
                    }
                  >
                    KYC Document 1
                  </Button>
                )}

                {senderDetails?.kyc_details?.document_path_2 && (
                  <Button
                    className="text-white bg-mustard p-[2px] md:p-2"
                    size="sm"
                    onClick={() =>
                      downloadAttachment(
                        senderDetails?.kyc_details?.document_path_2,
                        "document_2"
                      )
                    }
                  >
                    KYC Document 2
                  </Button>
                )}
                {isEdit && (
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
                )}
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

            {kycModalPreview && (<KycModal
              open={kycModalPreview}
              setSenderDetails={setSenderDetails}
              onClose={() => setKycModalPreview(false)}
              booking={booking}
            />)}
          </div>
          <Lucide
            icon="XCircle"
            className="w-5 h-5 cursor-pointer"
            onClick={onClose}
          />
        </Dialog.Title>
        <Dialog.Description className="overflow-y-auto h-[65vh]">
          <div className="grid grid-cols-12 gap-6 gap-y-3 ">
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-1">MOBILE NO <span className="text-red-500">*</span></FormLabel>
              <InputGroup>
                <FormInput
                  id="modal-form-1"
                  type="text"
                  placeholder="Mobile No."
                  maxLength={booking?.import_booking == 2 ? 15 : 10}
                  value={senderDetails?.consigner_mobile_number}
                  onChange={(e) =>
                    setSenderDetails({
                      ...senderDetails,
                      consigner_mobile_number: e.target.value.replace(
                        /[^0-9.]/g,
                        ""
                      ),
                    })
                  }
                  disabled={contactEdit || !isEdit}
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
                      onClick={getConsignerData}
                    >
                      CHECK{" "}
                      {spinner && (
                        <LoadingIcon
                          icon="puff"
                          color="white"
                          className="w-5 h-5 ml-2 stroke-2.5 text-white"
                        />
                      )}
                    </InputGroup.Text>
                  ))}
              </InputGroup>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-4">EMAIL</FormLabel>
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
                disabled={!isEdit}
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-3">FULL NAME</FormLabel>
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
                disabled={!isEdit}
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-2">COMPANY NAME</FormLabel>
              <FormInput
                id="modal-form-2"
                type="text"
                placeholder="Company Name"
                value={senderDetails?.consigner_company_name}
                maxLength={50}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    consigner_company_name: e.target.value,
                  })
                }
                disabled={!isEdit}
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
                disabled={!isEdit}
                value={senderDetails?.consigner_address_1}
                maxLength={50}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    consigner_address_1: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-6">
                STREET/LOCALITY <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                id="modal-form-6"
                type="text"
                placeholder=""
                disabled={!isEdit}
                value={senderDetails?.consigner_address_2}
                maxLength={50}
                onChange={(e) =>
                  setSenderDetails({
                    ...senderDetails,
                    consigner_address_2: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-7">PINCODE</FormLabel>
              <FormInput
                id="modal-form-7"
                type="text"
                value={senderDetails?.consigner_pincode}
                disabled
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-8">
                CITY <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                id="modal-form-8"
                type="text"
                value={senderDetails?.consigner_city}
                disabled={!isEdit}
                onChange={(e) =>
                  setSenderDetails((prev) => ({
                    ...prev,
                    consigner_city: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-9">STATE</FormLabel>
              <FormInput
                id="modal-form-9"
                type="text"
                value={senderDetails?.consigner_state}
                disabled
              />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-10">DOCUMENT TYPE</FormLabel>
              <FormSelect
                id="modal-form-10"
                disabled={!isEdit}
                value={senderDetails?.consigner_doc_type}
                onChange={(e) =>
                  setSenderDetails((prev) => ({
                    ...prev,
                    consigner_doc_type: e.target.value,
                  }))
                }
              >
                <option value="0">Select Document Type</option>
                {consignerDocTypes &&
                  consignerDocTypes?.map((elem, index) => (
                    <option value={elem?.id} key={index}>
                      {elem?.value}
                    </option>
                  ))}
              </FormSelect>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-11">
                {(consignerDocTypes &&
                  consignerDocTypes?.find(
                    (elem) => elem.id == senderDetails?.consigner_doc_type
                  )?.value) ||
                  "Please select a document type"}
              </FormLabel>

              <InputGroup>
                <FormInput
                  id="modal-form-11"
                  type="text"
                  disabled={!isEdit}
                  value={senderDetails?.consigner_gst_number}
                  maxLength={
                    senderDetails?.consigner_doc_type == "1"
                      ? 15
                      : senderDetails?.consigner_doc_type == "2"
                        ? 10
                        : senderDetails?.consigner_doc_type == "3"
                          ? 9
                          : senderDetails?.consigner_doc_type == "4"
                            ? 12
                            : senderDetails?.consigner_doc_type == "8"
                              ? 10
                              : undefined
                  }
                  onChange={(e) =>
                    setSenderDetails((prev) => ({
                      ...prev,
                      consigner_gst_number: e.target.value,
                    }))
                  }
                  onBlur={(e) => handleValidate(e.target.value)}
                  className="uppercase"
                />
                <InputGroup.Text
                  id="input-group-price"
                  className="py-2 px-3 w-14"
                >
                  {" "}
                  {senderDetails?.consigner_gst_number && docCheck == true && (
                    <Lucide
                      icon="Check"
                      className="text-green-500 stroke-2.5  h-5"
                    />
                  )}
                  {senderDetails?.consigner_gst_number && docCheck == false && (
                    <Lucide icon="X" className="text-red-500 stroke-2.5  h-5" />
                  )}
                </InputGroup.Text>
              </InputGroup>
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-12">
                GST APPLICABLE ON INVOICE{" "}
              </FormLabel>
              <FormSelect
                id="modal-form-12"
                value={senderDetails?.consigner_gst_applicable}
                disabled={!isEdit}
                onChange={(e) =>
                  setSenderDetails((prev) => ({
                    ...prev,
                    consigner_gst_applicable: e.target.value,
                  }))
                }
              >
                <option value="0"> Select</option>
                {gstApplicable &&
                  gstApplicable.map((elem, index) => (
                    <option value={elem?.id} key={index}>
                      {elem?.value}
                    </option>
                  ))}
              </FormSelect>
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="modal-form-13">TAX PAYMENT OPTION</FormLabel>
              <FormSelect
                id="modal-form-13"
                value={senderDetails?.consigner_tax_payment}
                disabled={!isEdit}
                onChange={(e) =>
                  setSenderDetails((prev) => ({
                    ...prev,
                    consigner_tax_payment: e.target.value,
                  }))
                }
              >
                <option value="0"> Select</option>
                {taxPaymentOption &&
                  taxPaymentOption.map((elem, index) => (
                    <option value={elem?.id} key={index}>
                      {elem?.value}
                    </option>
                  ))}
              </FormSelect>
            </div>

            {isAramexTaxSection && (
              <>
                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-14">
                    EXPORT TYPE <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormSelect
                    id="modal-form-14"
                    value={senderDetails?.export_type}
                    disabled={!isEdit}
                    onChange={(e) =>
                      setSenderDetails((prev) => ({
                        ...prev,
                        export_type: e.target.value,
                      }))
                    }
                  >
                    <option value=""> Select</option>
                    {exportTypesData &&
                      exportTypesData.map((elem, index) => (
                        <option value={elem?.id} key={index}>
                          {elem?.value}
                        </option>
                      ))}
                  </FormSelect>
                </div>

                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-15">
                    TAX PAID <span className="text-red-400">*</span>
                  </FormLabel>
                  <div className="flex flex-row gap-10">
                    <FormCheck className="m-2">
                      <FormCheck.Input
                        id="radio-switch-1"
                        type="radio"
                        name="tax_paid_radio_button"
                        disabled={!isEdit}
                        checked={senderDetails?.tax_paid == 1}
                        onClick={() =>
                          isEdit &&
                          setSenderDetails((prev) => ({ ...prev, tax_paid: 1 }))
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
                        name="tax_paid_radio_button"
                        disabled={!isEdit}
                        checked={senderDetails?.tax_paid == 2}
                        onClick={() =>
                          isEdit &&
                          setSenderDetails((prev) => ({
                            ...prev,
                            tax_paid: 2,
                          }))
                        }
                      />
                      <FormCheck.Label htmlFor="radio-switch-2">
                        No
                      </FormCheck.Label>
                    </FormCheck>
                  </div>
                </div>

                {senderDetails?.tax_paid == 1 && (
                  <div className="col-span-12 sm:col-span-6">
                    <FormLabel htmlFor="modal-form-16">
                      TAX AMOUNT <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormInput
                      id="modal-form-16"
                      type="number"
                      placeholder=""
                      disabled={!isEdit}
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
          </div>
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

export default SenderDetails;
