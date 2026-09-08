import React, { useEffect, useState } from "react";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Tippy from "../../../base-components/Tippy";
import Lucide from "../../../base-components/Lucide";
import Modal from "../../../components/Modal";
import Button from "../../../base-components/Button";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { disableSymbols, isValidHsn } from "../../../utils";
import {
  Change_weight,
  Get_Weight_Unit,
  Get_vendor_name,
} from "../../../AllServices/services";
import LoadingIcon from "../../../base-components/LoadingIcon";

const change_weight = ({
  awbData,
  oldDimensions,
  setShowChangeWeight,
  setAwbNo,
  emp_id,
}) => {
  const [data, setData] = useState<Array<any>>(awbData?.pickup_item);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<any>();
  const [editDimensionData, setEditDimensionData] = useState<any>();
  const [vendorData, setVendorData] = useState<any>([]);
  const [weightUnitData, setWeightUnitData] = useState<any>([]);
  const [weight, setWeight] = useState(
    awbData?.pickup_data?.actual_weight || ""
  );
  const [weightUnit, setWeightUnit] = useState<any>(
    awbData?.pickup_data?.weight_unit || ""
  );
  const { showAlert } = useAlert();
  const [spinner, setSpinner] = useState(false);

  const handleEdit = () => {
    if (
      editDimensionData?.item_description &&
      editDimensionData?.weight &&
      editDimensionData?.value &&
      editDimensionData?.quantity &&
      editDimensionData?.length &&
      editDimensionData?.breadth &&
      editDimensionData?.height &&
      editDimensionData?.hsn_code
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

      if (isValidHsn(editDimensionData.hsn_code)) {
        const newData = data;
        newData[editIndex] = { ...editDimensionData };
        setData(newData);
        setOpenModal(false);
      } else {
        showAlert("Please Enter Valid HSN Code", "error");
      }
    } else {
      showAlert("Please fill all the fields", "error");
    }
  };

  const getData = async () => {
    try {
      const response = await Get_vendor_name(awbData?.pickup_data?.courier_id);
      if (response?.status == 200) {
        setVendorData(response?.data?.data);
      } else {
        setVendorData([]);
        showAlert(
          response?.data?.message ||
            response?.response?.data?.message ||
            response?.message,
          "error"
        );
      }
    } catch (error) {
      console.log("Something went wrong", "error");
    }

    try {
      const response = await Get_Weight_Unit();
      if (response?.status == 200) {
        setWeightUnitData(response?.data?.data);
      } else {
        setWeightUnitData([]);
        showAlert(response?.data?.message, "error");
      }
    } catch (error) {
      console.log("Something went wrong", "error");
    }
  };

  const handleChangeWeight = async () => {
    if (!weightUnit) {
      showAlert("Please select weight unit", "warning");
      return;
    }
    if (!weight) {
      showAlert("Please enter weight", "warning");
      return;
    }

    let RequestData = {};

    if (awbData?.pickup_data?.booking_shipment_type_id == 2) {
      RequestData = {
        is_kawach: awbData?.pickup_data?.is_kawach || 0,
        weight: weight,
        weight_unit: weightUnit,
        dimention_unit: awbData?.pickup_data?.dimention_unit,
        franchisee_id: awbData?.pickup_data?.pickup_franchisee_id,
        pickup_id: awbData?.pickup_data?.pickup_id,
        is_domestic: awbData?.pickup_data?.is_domestic,
        pincode: awbData?.shipper_data[0]?.pincode,
        international_zipcode:
          awbData?.consignee_data[0]?.international_zipcode,
        city: awbData?.consignee_data[0]?.city,
        state: awbData?.consignee_data[0]?.state,
        state_name: awbData?.consignee_data[0]?.state_name,
        delivery_country_id: awbData?.pickup_data?.delivery_country_id,
        booking_shipment_type_id:
          awbData?.pickup_data?.booking_shipment_type_id,
        courier_id: awbData?.pickup_data?.courier_id,
        currency_id: awbData?.pickup_data?.currency_id,
        dispatch_status_code: awbData?.pickup_data?.dispatch_status_code,
        old_weight: awbData?.pickup_data?.chargeable_weight,
        airwaybilno: awbData?.pickup_data?.airwaybilno,
      };
    } else {
      RequestData = {
        is_kawach: awbData?.pickup_data?.is_kawach || 0,
        weight_unit: weightUnit,
        dimention_unit: awbData?.pickup_data?.dimention_unit,
        franchisee_id: awbData?.pickup_data?.pickup_franchisee_id,
        pickup_id: awbData?.pickup_data?.pickup_id,
        shipment_dimensions: awbData?.pickup_item,
        old_shipment_dimensions: JSON.parse(oldDimensions),
        is_domestic: awbData?.pickup_data?.is_domestic,
        pincode: awbData?.shipper_data[0]?.pincode,
        international_zipcode:
          awbData?.consignee_data[0]?.international_zipcode,
        city: awbData?.consignee_data[0]?.city,
        state: awbData?.consignee_data[0]?.state,
        state_name: awbData?.consignee_data[0]?.state_name,
        delivery_country_id: awbData?.pickup_data?.delivery_country_id,
        booking_shipment_type_id:
          awbData?.pickup_data?.booking_shipment_type_id,
        courier_id: awbData?.pickup_data?.courier_id,
        currency_id: awbData?.pickup_data?.currency_id,
        dispatch_status_code: awbData?.pickup_data?.dispatch_status_code,
        old_weight: awbData?.pickup_data?.chargeable_weight,
        airwaybilno: awbData?.pickup_data?.airwaybilno,
      };
    }

    setSpinner(true);

    try {
      const response = await Change_weight(
        awbData?.pickup_data?.hub_id,
        RequestData,
        emp_id
      );

      if (response?.data?.status == 200) {
        setShowChangeWeight(false);
        showAlert(response?.data?.message);
        setAwbNo("");
      } else if (response?.response?.status == 422) {
        showAlert(response?.response?.data?.errors[0]?.msg, "error");
      } else {
        showAlert(
          response?.data?.message ||
            response?.response?.data?.message ||
            response?.message,
          "error"
        );
      }
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong", "error");
    } finally {
      setSpinner(false);
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const description = (
    <>
      <div className="w-full h-auto overflow-y-auto text-left ">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  xl:grid-cols-4  gap-8  p-2 rounded-lg ">
          <div>
            <FormLabel htmlFor="regular-form-1">Description</FormLabel>
            <FormInput
              type="text"
              placeholder="Description"
              id="item_description"
              className="capitalize"
              value={editDimensionData?.item_description}
              // onKeyDown={(e) => disableSymbols(e)}
              // onChange={(e) =>
              //   setEditDimensionData((prev: any) => ({
              //     ...prev,
              //     item_description: e.target.value,
              //   }))
              // }
              disabled
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
              // onChange={(e) =>
              //   setEditDimensionData((prev: any) => ({
              //     ...prev,
              //     value: e.target.value,
              //   }))
              // }
              disabled
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
              // onKeyDown={(e) => disableSymbols(e)}
              // onChange={(e) =>
              //   setEditDimensionData((prev: any) => ({
              //     ...prev,
              //     quantity: e.target.value,
              //   }))
              // }
              disabled
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
          <div>
            <FormLabel htmlFor="regular-form-1">HSN Code</FormLabel>
            <FormInput
              type="text"
              placeholder="HSN Code"
              minLength={6}
              maxLength={8}
              id="hsn_code"
              value={editDimensionData?.hsn_code}
              // onChange={(e) =>
              //   setEditDimensionData((prev: any) => ({
              //     ...prev,
              //     hsn_code: e.target.value.replaceAll(" ", ""),
              //   }))
              // }
              disabled
            />
          </div>
        </div>
      </div>
    </>
  );

  const footer = (
    <>
      <Button
        type="button"
        className="bg-mustard border-none py-2 px-4 text-white rounded-xl"
        onClick={handleEdit}
      >
        SAVE
      </Button>
    </>
  );

  return (
    <div className="w-full max-w-8xl mx-auto mt-4 p-6 h-[250px] lg:overflow-y-hidden overflow-y-scroll bg-white rounded-lg shadow-lg">
      <div className="sm:flex gap-8 ">
        <div>
          <FormLabel htmlFor="regular-form-1">Customer Name</FormLabel>
          <FormInput value={awbData?.shipper_data[0]?.shipper_name} disabled />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">Vendor</FormLabel>
          <FormInput value={vendorData[0]?.product_name} disabled />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">Weight Unit</FormLabel>
          <FormSelect
            className="capitalize"
            aria-label="Default select example"
            value={weightUnit}
            disabled
            // onChange={(e) => setWeightUnit(e.target.value)}
          >
            <option value="">Select</option>
            {weightUnitData &&
              weightUnitData?.map((data, index) => (
                <option className="uppercase" key={index} value={data?.value}>
                  {data?.value}
                </option>
              ))}
          </FormSelect>
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">Dimension Unit</FormLabel>
          <FormSelect
            className="capitalize"
            aria-label="Default select example"
            disabled
          >
            <option>Select</option>
            <option selected>{awbData?.pickup_data?.dimention_unit}</option>
            <option>Inch</option>
          </FormSelect>
        </div>
      </div>

      {awbData?.pickup_data?.booking_shipment_type_id == 2 ? (
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
              value={awbData?.pickup_item[0]?.product_description || ""}
              disabled
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
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
      ) : (
        data?.length > 0 && (
          <>
            <div className="my-3">
              <div className="mt-2">
                <FormLabel htmlFor="regular-form-1">
                  Shipment Dimension
                </FormLabel>
                <div className="w-full box cursor-pointer border border-gray-200 flex justify-between items-end">
                  <div className="flex flex-wrap gap-2 p-1">
                    {data?.map(
                      (elem, index) =>
                        elem?.item_description && (
                          <div
                            key={index}
                            className="flex px-2 py-1 gap-4 mr-2 bg-slate-300 items-center justify-between rounded-lg"
                          >
                            <span
                              className="text-lg flex capitalize"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenModal(true);
                                setEditDimensionData(elem);
                                setEditIndex(index);
                              }}
                            >
                              {elem?.item_description}
                            </span>
                            <Tippy
                              content="Edit Dimension"
                              options={{ placement: "top" }}
                            >
                              <Lucide
                                icon="Edit"
                                className="text-red-500 stroke-2.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenModal(true);
                                  setEditDimensionData(elem);
                                  setEditIndex(index);
                                }}
                              />
                            </Tippy>
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Modal
              size="lg"
              title={"Shipment Dimension"}
              open={openModal}
              setOpen={setOpenModal}
              description={description}
              footer={footer}
            />
          </>
        )
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          className="bg-mustard border-none py-2 px-4 text-white rounded-xl"
          onClick={handleChangeWeight}
          disabled={spinner}
        >
          UPDATE{" "}
          {spinner && (
            <LoadingIcon
              icon="puff"
              color="white"
              className="w-5 h-5 ml-2 stroke-2.5 text-white"
            />
          )}
        </Button>
      </div>
    </div>
  );
};

export default change_weight;
