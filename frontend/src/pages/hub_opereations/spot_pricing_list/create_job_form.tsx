import React, { useEffect, useState } from "react";

import { Truck } from "lucide-react";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Tippy from "../../../base-components/Tippy";
import Lucide from "../../../base-components/Lucide";
import Modal from "../../../components/Modal";
import { useAlert } from "../../../ContextProvider/AlertContext";
import {
  disableSymbols,
  handlePaste,
  isValidHsn,
  onlyNumbers,
} from "../../../utils";
import {
  Create_Job,
  Get_country,
  Get_franchise,
  Get_Job_Type,
} from "../../../AllServices/services";
import TomSelect from "../../../base-components/TomSelect";
import LoadingIcon from "../../../base-components/LoadingIcon";
import SearchableInput from "../../../base-components/SearchableInput";
const CreateJob = () => {
  const [dimensionData, setDimensionData] = useState<Array<any>>([]);
  const [dataPayload, setDataPayload] = useState<any>({});
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isEditDimension, setIsEditDimension] = useState(false);
  const [editDimensionData, setEditDimensionData] = useState<any>();
  const [editIndex, setEditIndex] = useState<any>();
  const [shipmentResponse, setShipmentResponse] = useState();
  const [country, setCountry] = useState([]);
  const [jobTypeList, setJobTypeList] = useState([]);
  const [customer, setCustomer] = useState({
    franchisee_id: "",
    franchisee_name: "",
  });
  const [insideSales, setInsideSales] = useState({
    id: "",
    sales_person: "",
  });
  const [spinner, setSpinner] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    Get_country().then((res) => setCountry(res?.data?.data));
    Get_Job_Type().then((res) => setJobTypeList(res?.data?.data));
  }, []);
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
              // onKeyDown={(e) => disableSymbols(e)}
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
              // onKeyDown={(e) => disableSymbols(e)}
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
        </div>
      </div>
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
      editDimensionData?.height &&
      editDimensionData?.hsn_code
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

      if (isValidHsn(editDimensionData?.hsn_code)) {
        const newData = dimensionData;
        newData[editIndex] = { ...editDimensionData };
        setDimensionData(newData);
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

      if (isValidHsn(editDimensionData?.hsn_code)) {
        setDimensionData((prev) => [...prev, editDimensionData]);
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
  const handleDelete = (e, index) => {
    e.stopPropagation();
    e.isPropagationStopped();
    const newData = [...dimensionData];
    newData.splice(index, 1);

    setDimensionData(newData);
  };
  async function createJob() {
    const data = dataPayload;
    data.shipment_dimensions = dimensionData;
    const checkData = Object.values(data).filter(
      (item) => item == "" || item == []
    );
    if (checkData.length) {
      showAlert("Please fill all required fields", "warning");
    } else {
      setSpinner(true);
      const response: any = await Create_Job(data);
      try {
        if (response?.status == 200) {
          showAlert(response?.data?.message);
          fun1toempty();
          fun2toempty();
          setDataPayload({ consigner_first_name: "", job_type: "" });
          setDimensionData([]);
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
    }
  }
  async function handleChange(value, key) {
    setDataPayload((prev) => ({
      ...prev,
      [key]: value,
    }));
  }
  function fun1(data) {
    handleChange(data.franchisee_id, "franchisee_id");
  }
  function fun1toempty() {
    setCustomer({
      franchisee_id: "",
      franchisee_name: "",
    });
    setDataPayload((prev: any) => ({
      ...prev,
      franchisee_id: "",
    }));
  }
  function fun2toempty() {
    setInsideSales({
      id: "",
      sales_person: "",
    });
    setDataPayload((prev: any) => ({
      ...prev,
      sales_person: "",
    }));
  }
  function fun2(data) {
    handleChange(data.id, "inside_sales");
  }
  return (
    <form>
      {/* START  Scenario 1    When shipment comes booked by customer */}

      <div className="grid grid-cols-12  p-2  lg:p-6 box gap-x-3  mb-6">
        <div className=" col-span-12 lg:col-span-12 md:col-span-12 sm:col-span-12 mb-4 ">
          <div className="text-lg flex">
            <i className="bg-yellow-50 w-[29px] h-[29px] rounded-full  border border-yellow-200  flex justify-center item-center center">
              <Truck className="w-[20px] text-yellow-300 " />
            </i>
            <h2 className="ml-2 uppercase font-bold">Initiate Job </h2>
          </div>
        </div>

        <div className=" jobGroup col-span-6 lg:col-span-3 md:col-span-4 sm:col-span-6 mb-3 ">
          <FormLabel htmlFor="vertical-form-1" className="mb-1">
            Customer Name <i className="text-red-500">*</i>
          </FormLabel>
          <SearchableInput
            apiEndpoint={`/admin/franchisee-settings`}
            // ?sales_id=${userdata?.mapped_id}`}
            placeholder={"Search For Franchisee"}
            selecteddata={customer}
            setSelecteddata={setCustomer}
            fun1={fun1}
            comingselectedname={"franchisee_name"}
            comingselectedid={"franchisee_id"}
            funtoempty={fun1toempty}
            // questionmark={true}
            key1={"key"}
            // border={error?.franchisee ? true : false}
          />
          {/* <TomSelect
            name="franchisee_id"
            aria-placeholder="Select Customer"
            value={dataPayload.franchisee_id}
            onChange={(v)=>handleChange(v,'franchisee_id')}
          >
              <option value={null}>Select Customer</option>

            {customerList.map((item) => (
              <option value={item.franchisee_id}>{item.franchisee_name}</option>
            ))}
          </TomSelect> */}
        </div>
        <div className=" jobGroup col-span-6 lg:col-span-3 md:col-span-4 sm:col-span-6 mb-3 ">
          <FormLabel htmlFor="vertical-form-1" className="mb-1">
            Job Type <i className="text-red-500">*</i>
          </FormLabel>
          <FormSelect
            className=""
            name="job_type"
            value={dataPayload?.job_type}
            onChange={(e) => handleChange(e.target.value, "job_type")}
          >
            <option value={""}>Select</option>
            {jobTypeList?.map((item: any, index: number) => (
              <option key={index} value={item?.id}>
                {item?.job_type_name}
              </option>
            ))}
          </FormSelect>
        </div>

        <div className=" jobGroup col-span-6 lg:col-span-3 md:col-span-4 sm:col-span-6 mb-3 ">
          <FormLabel htmlFor="vertical-form-1" className="mb-1">
            Destination Country <i className="text-red-500">*</i>
          </FormLabel>
          <TomSelect
            name="destination_country"
            aria-placeholder="Select Country"
            value={dataPayload.destination_country}
            onChange={(v) => handleChange(v, "destination_country")}
          >
            <option value={null}>Select Country</option>

            {country.map((item) => (
              <option value={item.country_id}>{item.country_name}</option>
            ))}
          </TomSelect>
        </div>

        <div className=" jobGroup col-span-6 lg:col-span-3 md:col-span-4 sm:col-span-6 mb-3 ">
          <FormLabel htmlFor="vertical-form-1" className="mb-1">
            Shipper name <i className="text-red-500">*</i>
          </FormLabel>
          <FormInput
            name="consigner_first_name"
            type="text"
            placeholder=""
            value={dataPayload?.consigner_first_name}
            onChange={(e) =>
              handleChange(e.target.value, "consigner_first_name")
            }
          />
        </div>
        <div className=" jobGroup col-span-6 lg:col-span-3 md:col-span-4 sm:col-span-6 mb-3 ">
          <FormLabel htmlFor="vertical-form-1" className="mb-1">
            Inside Sales <i className="text-red-500">*</i>
          </FormLabel>
          <SearchableInput
            apiEndpoint={`/admin/sales-person`}
            // ?sales_id=${userdata?.mapped_id}`}
            placeholder={"Search For Sales"}
            selecteddata={insideSales}
            setSelecteddata={setInsideSales}
            fun1={fun2}
            comingselectedname={"sales_person"}
            comingselectedid={"id"}
            funtoempty={fun2toempty}
            // questionmark={true}
            key1={"key"}
            // border={error?.franchisee ? true : false}
          />
          {/* <TomSelect
            name="franchisee_id"
            aria-placeholder="Select Customer"
            value={dataPayload.franchisee_id}
            onChange={(v)=>handleChange(v,'franchisee_id')}
          >
              <option value={null}>Select Customer</option>

            {customerList.map((item) => (
              <option value={item.franchisee_id}>{item.franchisee_name}</option>
            ))}
          </TomSelect> */}
        </div>
        <div className="col-span-12 lg:col-span-12 md:col-span-12 sm:col-span-12 my-3 mb-3">
          <FormLabel htmlFor="vertical-form-1" className="mb-1">
            {" "}
            Shipment Dimensions <i className="text-red-500">*</i>
          </FormLabel>
          {dimensionData?.length > 0 ? (
            <div className="mt-2">
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
                              onClick={(e) => handleDelete(e, index)}
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
                type="button"
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
          <Modal
            size="lg"
            title={"Shipment Dimension"}
            open={openModal}
            setOpen={setOpenModal}
            description={description}
            footer={footer}
          />
        </div>

        <div className="mt-3">
          <Button
            type="button"
            className=" p-2 bg-mustard text-white"
            disabled={spinner}
            onClick={createJob}
          >
            Submit{" "}
            {spinner && (
              <LoadingIcon icon="puff" color="white" className="ml-2 w-3 h-3" />
            )}
          </Button>
        </div>
      </div>

      {/* END  Scenario 1    When shipment comes booked by customer */}
    </form>
  );
};

export default CreateJob;
