import React, { useEffect, useState } from "react";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import {
  Get_Currency,
  Get_Currency_exchange,
  Get_approval,
  Get_Aramex_Product,
  Get_country,
  Get_shipment,
  Spot_form_submit,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { ArrowLeft, FileText } from "lucide-react";
import "../../../components/Table/index.css";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { User } from "lucide-react";

const spot_pricing_form = (data: any) => {
  const { pickDataforForm } = data;
  const { showAlert } = useAlert();
  const [getShipment, setgetShipment] = useState<Array<any>>([]);
  const [country, setCountry] = useState<Array<any>>([]);
  const [approvalTypedata, setApprovalTypedata] = useState<Array<any>>([]);
  const [approvedSelect, setApprovedSelect] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [aramexProductList, setAramexProductList] = useState<Array<any>>([]);

  const today = new Date().toISOString().split("T")[0];
  const currentDate: any = new Date();

  const isAramexVisible =
    (pickDataforForm?.shipment_type == 4 ||
      pickDataforForm?.shipment_type == 5) &&
    pickDataforForm?.import_booking == 1 &&
    data?.vendorData
      ?.find((item: any) => item?.product_id == pickDataforForm?.courier_id)
      ?.product_name?.toLowerCase()
      ?.includes("aramex");

  const submitForm = async () => {
    if (isAramexVisible && !pickDataforForm?.courier_vendor_code) {
      showAlert("Aramex product code is required", "warning");
      return;
    }
    setSpinner(true);
    const response: any = await Spot_form_submit(pickDataforForm);
    try {
      if (response?.status == 200) {
        showAlert(response?.data?.message);
        data.getspotlistdata();
        data.setShowForm(true);
      } else if (
        response?.response?.status == 400 ||
        response?.response?.data?.status == 400
      ) {
        showAlert(response?.response?.data?.message, "warning");
      } else if (response?.response?.status == 406) {
        showAlert(response?.response?.data?.errors[0]?.msg, "warning");
      } else {
        showAlert(response?.data?.message, "error");
      }
    } catch (err: any) {
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setSpinner(false);
    }
  };

 

  const getShipmentdata = async () => {
    const response: any = await Get_shipment();
    try {
      if (response?.status == 200) {
        setgetShipment(response?.data?.data);
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  const getCountrydata = async () => {
    const response: any = await Get_country();
    try {
      if (response?.status == 200) {
        setCountry(response?.data?.data);
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  const approvalType = async () => {
    const response: any = await Get_approval();
    try {
      if (response?.status == 200) {
        setApprovalTypedata(response?.data?.data);
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  const rateValidity = (e: any) => {
    data?.setPickDataforForm((prev: any) => ({
      ...prev,
      valid_till: e.target.value,
    }));

    if (!e.target.value) return 0;
    const selected: any = new Date(e.target.value);
    const timeDifference = selected - currentDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    data?.setPickDataforForm((prev: any) => ({
      ...prev,
      rate_validity: daysDifference,
    }));
  };

  useEffect(() => {
    getShipmentdata();
    getCountrydata();
    approvalType();
    Get_Aramex_Product().then((res) =>
      setAramexProductList(res?.data?.data || []),
    );
    data.formChangeBtn
      ? data.setPickDataforForm((prev: any) => ({
          ...prev,
        }))
      : "";
  }, []);

  useEffect(() => {
    const getCurrency = async() => {
      const res = await Get_Currency_exchange();
      const currencyPrice = res?.data?.data?.find((elem) => elem?.currency_id == pickDataforForm?.currency_id)?.exchange_rate || 1;
      data?.setPickDataforForm((prev:any) => ({
        ...prev,
        spot_price: Number(currencyPrice) * Number(prev?.spot_price),
        freight_price: Number(currencyPrice) * Number(prev?.freight_price),
        buy_price : Number(currencyPrice) * Number(prev?.buy_price),
        sell_price: Number(currencyPrice) * Number(prev?.sell_price)
      }))
    }
    getCurrency()
  }, [])
  return (
    <>
      <div
   
        className="grid grid-cols-2 gap-2"
      >
        <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white h-full">



      <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  
                   <div
              className=" flex justify-center items-center p-1 cursor-pointer rounded-full shadow-lg mr-2 ml-0 bg-[#777] w-[32px] h-[32px]"
              onClick={() => {
                data.setShowForm(true);
                data.setPickDataforForm({});
                data.setFormChangeBtn(false);
              }}
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </div>



                  <h4 className="text-[16px] font-medium">
                   Serviceability
                  </h4>
                </div>
              </div>

        
            </div>
          </div>

<div className="p-2  lg:p-6">


          <div className="mt-2 mb-2">
            <FormLabel>Approval Type</FormLabel>
            <span className="text-red-500 ml-2">*</span>
            <br />

            <FormSelect
              value={pickDataforForm.booking_status}
              onChange={(e: any) => {
                data.setPickDataforForm((prev: any) => ({
                  ...prev,
                  booking_status: e.target.value,
                }));
                setApprovedSelect(e.target.value);
              }}
              name="state"
              aria-label="Select approval type"
            >
              {data.formChangeBtn ? (
                <option value="6">Change Weight</option>
              ) : (
                <>
                  <option value="0">Select Approval Type</option>
                  {approvalTypedata?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </>
              )}
            </FormSelect>
            {pickDataforForm.booking_status == 0 && (
              <span className="text-red-500 text-[12px]">
                Please select Approval type
              </span>
            )}
            {/* {pickDataforForm.booking_status == 0 && setErr()} */}
          </div>
          <div className="mb-2">
            <FormLabel>Origin Country</FormLabel>
            <span className="text-red-500 ml-2">*</span>
            <br />
            <FormSelect
              disabled
              value={pickDataforForm.org_country_id}
              name="state"
              aria-label="Select Country"
            >
              <option value="">Select Country</option>
              {country?.map(
                (item, index) =>
                  item?.is_active == 1 && (
                    <option key={index} value={item.country_id}>
                      {item.country_name}
                    </option>
                  )
              )}
            </FormSelect>
          </div>
          <div className="mb-2">
            <FormLabel>Origin Pincode</FormLabel>
            <span className="text-red-500 ml-2">*</span>
            <FormInput
              disabled
              name="address"
              value={pickDataforForm.org_zip}
            />
          </div>
          <div className="mb-2">
            <FormLabel>Origin City</FormLabel>
            <span className="text-red-500 ml-2">*</span>
            <FormInput
              disabled
              name="address"
              value={pickDataforForm.org_city}
            />
          </div>
          <div className="mt-2 mb-2">
            <FormLabel>Destination Country</FormLabel>
            <span className="text-red-500 ml-2">*</span>
            <br />
            <FormSelect
              disabled
              value={pickDataforForm.dest_country_id}
              name="state"
              aria-label="Select approval type"
            >
              <option value="">Select Country</option>
              {country?.map(
                (item, index) =>
                  item?.is_active == 1 && (
                    <option value={item.country_id}>{item.country_name}</option>
                  )
              )}
            </FormSelect>
          </div>
          <div className="mb-2">
            <FormLabel>Destination Pincode</FormLabel>
            <span className="text-red-500 ml-2">*</span>
            <FormInput
              disabled
              value={pickDataforForm.dest_zip}
              name="address"
            />
          </div>
          <div className="mb-2">
            <FormLabel>Destination City</FormLabel>
            <span className="text-red-500 ml-2">*</span>
            <FormInput disabled value={pickDataforForm.dest_city} />
          </div>
        </div>
       </div>
       </div>
   
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white h-full">
		
    <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <FileText className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                 Shipment Details
                  </h4>
                </div>
              </div>

        
            </div>
          </div>

    <div className="p-2  lg:p-6">

          <div className="mt-2 mb-2">
            <FormLabel>Shipment Type</FormLabel>
            <span className="text-red-500 ml-2">*</span>
            <br />
            <FormSelect
              disabled
              value={pickDataforForm.shipment_type}
              name="state"
              aria-label="Select shipment type"
            >
              <option value="">Select shipment Type</option>
              {getShipment.map((item: any) => (
                <option value={item.booking_shipment_type_id}>
                  {item.shipment_type}
                </option>
              ))}
            </FormSelect>
          </div>
          <div className="mb-2">
            <FormLabel>Weight</FormLabel>
            <span className="text-red-500 ml-2">*</span>
            <div className="flex gap-4">
              <FormInput
                disabled
                name="address"
                value={pickDataforForm.weight}
                onChange={(e) =>
                  data.setPickDataforForm((prev: any) => ({
                    ...prev,
                    weight: e.target.value,
                  }))
                }
                className="w-4/5"
              />
              <FormSelect
                name="state"
                disabled
                aria-label="Select shipment type"
                className="w-1/5"
              >
                <option value="">kgs</option>
              </FormSelect>
            </div>
          </div>
          <div className="mb-2">
            <div className="flex gap-2">
              <div className="w-1/2">
                <FormLabel>Quoted by</FormLabel>
                <span className="text-red-500 ml-2">*</span>
                <FormInput
                  disabled
                  value={pickDataforForm.quoted_by}
                  name="address"
                />
              </div>
              <div className="w-1/2">
                <FormLabel>Vendor</FormLabel>
                <span className="text-red-500 ml-2">*</span>
                <br />
                <FormSelect
                  value={pickDataforForm.courier_id}
                  onChange={(e) =>
                    data.setPickDataforForm((prev: any) => ({
                      ...prev,
                      courier_id: e.target.value,
                    }))
                  }
                  disabled={
                    approvedSelect == 1 ||
                    (approvedSelect == 2 ? true : false) ||
                    pickDataforForm?.booking_status == 4
                  }
                  name="state"
                  aria-label="Select shipment type"
                >
                  <option value={pickDataforForm.shipment_type}>
                    Select Vendor
                  </option>
                  {data?.vendorData?.map((item: any) => (
                    <option value={item.product_id}>{item.product_name}</option>
                  ))}
                </FormSelect>
              </div>
            </div>
          </div>
          <div className="mt-2 mb-2">
            <div className="col-span-12 sm:col-span-6 flex item-center gap-10">
              <FormLabel
                htmlFor="modal-form-5"
                className="mt-2 flex gap-2 whitespace-nowrap"
              >
                {" "}
                Price type <span className="text-red-400">*</span>
              </FormLabel>
              <div className="flex flex-col sm:flex-row gap-10">
                <FormCheck>
                  <FormCheck.Input
                    id="radio-switch-4"
                    disabled={
                      (approvedSelect == 3 ? false : true) ||
                      pickDataforForm?.booking_status != 4
                    }
                    type="radio"
                    name="price_type_radio_button"
                    defaultChecked={pickDataforForm?.price_type == 1}
                  />
                  <FormCheck.Label htmlFor="radio-switch-4">
                    Absolute
                  </FormCheck.Label>
                </FormCheck>
                <FormCheck>
                  <FormCheck.Input
                    id="radio-switch-5"
                    disabled={approvedSelect == 3 ? false : true}
                    type="radio"
                    name="price_type_radio_button"
                    defaultChecked={pickDataforForm?.price_type == 2}
                  />
                  <FormCheck.Label
                    htmlFor="radio-switch-5"
                    className="whitespace-nowrap"
                  >
                    Per Kg
                  </FormCheck.Label>
                </FormCheck>
              </div>
            </div>
          </div>
          <div className="mb-2">
            <div className="flex gap-2">
              {(approvedSelect == 1 ||
                approvedSelect == 3 ||
                pickDataforForm?.booking_status == 4) && (
                <div className="w-1/2">
                  <FormLabel>Spot Price buy</FormLabel>
                  <span className="text-red-500 ml-2">*</span>
                  <FormInput
                    value={pickDataforForm?.buy_price}
                    onChange={(e) =>
                      data.setPickDataforForm((prev: any) => ({
                        ...prev,
                        buy_price: e.target.value,
                      }))
                    }
                    name="address"
                  />
                </div>
              )}
              <div
                className={
                  approvedSelect == 1 || approvedSelect == 3
                    ? "w-1/2"
                    : "w-full"
                }
              >
                <FormLabel>Spot Price sell</FormLabel>
                <span className="text-red-500 ml-2">*</span>
                <FormInput
                  disabled={approvedSelect == 3 ? false : true}
                  value={pickDataforForm?.spot_price}
                  onChange={(e) =>
                    data.setPickDataforForm((prev: any) => ({ 
                      ...prev,
                      spot_price: e.target.value,
                    }))
                  }
                  name="address"
                />
              </div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex gap-2">
              {(approvedSelect == 1 ||
                approvedSelect == 3 ||
                pickDataforForm?.booking_status == 4) && (
                <div
                  className={
                    approvedSelect == 1 || approvedSelect == 3
                      ? "w-1/2"
                      : "w-full"
                  }
                >
                  <FormLabel>Rate Validity</FormLabel>
                  <span className="text-red-500 ml-2">*</span>
                  <FormInput
                    type="date"
                    value={pickDataforForm?.valid_till}
                    onChange={rateValidity}
                    min={today}
                  />
                </div>
              )}
              <div className="w-1/2">
                <FormLabel>Sell Freight Per kg</FormLabel>
                <span className="text-red-500 ml-2">*</span>
                <FormInput
                  value={pickDataforForm?.freight_price}
                  onChange={(e) =>
                    data.setPickDataforForm((prev: any) => ({
                      ...prev,
                      freight_price: "2000",
                    }))
                  }
                  disabled
                  type="text"
                  name="address"
                />
              </div>
            </div>
          </div>
          {(approvedSelect == 1 ||
            approvedSelect == 3 ||
            pickDataforForm?.booking_status == 4) && (
            <div className="mb-2">
              <div className="flex gap-2">
                <div className="w-1/2">
                  <FormLabel>Weight From</FormLabel>
                  <span className="text-red-500 ml-2">*</span>
                  <FormInput
                    type="text"
                    value={pickDataforForm?.weight_from}
                    onChange={(e) =>
                      data.setPickDataforForm((prev: any) => ({
                        ...prev,
                        weight_from: e.target.value,
                      }))
                    }
                    name="address"
                  />
                </div>
                <div className="w-1/2">
                  <FormLabel>Weight To</FormLabel>
                  <span className="text-red-500 ml-2">*</span>
                  <FormInput
                    type="text"
                    value={pickDataforForm?.weight_to}
                    name="address"
                    onChange={(e) =>
                      data.setPickDataforForm((prev: any) => ({
                        ...prev,
                        weight_to: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}
          {isAramexVisible && (
            <div className="mb-2">
              <FormLabel>
                Aramex Product Code <span className="text-red-500">*</span>
              </FormLabel>
              <FormSelect
                value={pickDataforForm?.courier_vendor_code || ""}
                onChange={(e) =>
                  data.setPickDataforForm((prev: any) => ({
                    ...prev,
                    courier_vendor_code: e.target.value,
                  }))
                }
              >
                <option value={""}>Select</option>
                {aramexProductList.map(
                  (item: any) =>
                    item?.is_active == 1 && (
                      <option key={item.id} value={item.code}>
                        {item.code}
                      </option>
                    ),
                )}
              </FormSelect>
            </div>
          )}
          <div className="mb-2">
            <FormLabel>Remarks</FormLabel>
            <FormTextarea
              name="address"
              className="px-4 py-3  max-h-20 min-h-16"
              autoComplete="off"
              value={pickDataforForm?.approve_remarks}
              onChange={(e) =>
                data.setPickDataforForm((prev: any) => ({
                  ...prev,
                  approve_remarks: e.target.value,
                }))
              }
            ></FormTextarea>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => submitForm()}
              className="bg-mustard border-none py-2 px-4 text-white"
              disabled={
                pickDataforForm.booking_status == 0 ? true : false || spinner
              }
            >
              Submit {spinner && <LoadingIcon icon="puff" className="ml-2" />}
            </Button>
          </div>
        </div>
    </div>
    </div>
      </div>
    </>
  );
};

export default spot_pricing_form;
