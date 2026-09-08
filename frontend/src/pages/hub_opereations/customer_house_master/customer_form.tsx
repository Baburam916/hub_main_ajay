import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { useEffect, useState } from "react";
import {
  Customer_house_master,
  Get_city,
  Get_state,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { HouseMasterData } from "../../../DataTypes/dataTypes";
import LoadingIcon from "../../../base-components/LoadingIcon";
import "../../../components/Table/index.css";

const customer_form = (data: any) => {
  const {
    hub_id,
    gstStatusList,
    pickDataForEdit,
    setPickDataForEdit,
    getHouseMasterList,
    setShowHouseMasterForm,
    showHouseMasterForm,
    submitUpdatebtn,
  } = data;
  const { showAlert } = useAlert();
  const [gstMandatory, setGstMandatory] = useState<boolean>(false);
  const [stateList, setStateList] = useState<Array<any>>([]);
  const [cityList, setCityList] = useState<Array<any>>([]);
  const [error, setError] = useState<Array<any>>([]);
  const [spinner, setSpinner] = useState<boolean>(false);
  console.log("DFsaf", pickDataForEdit);
  useEffect(() => {
    if (stateList.length == 0) getStates();

    if (pickDataForEdit?.state) getCities(pickDataForEdit.state);
  }, [pickDataForEdit?.state]);

  const getStates = async () => {
    try {
      const response: any = await Get_state();
      if (response?.status == 200) setStateList(response?.data.data);
      else showAlert("State list is not rendering!", "warning");
    } catch (error) {
      if (error) showAlert("something went wrong", "error");
    }
  };

  const getCities = async (id: any) => {
    try {
      const response: any = await Get_city(id);
      if (response?.status == 200) setCityList(response?.data.data);
      else showAlert("City list is not rendering!", "warning");
    } catch (err) {
      console.log(err);
    }
  };

  const handleFormSubmit = async () => {
    const houseMasterData: HouseMasterData = {
      id: pickDataForEdit.id || null,
      name: pickDataForEdit.name,
      address: pickDataForEdit.address,
      state: pickDataForEdit.state,
      city: pickDataForEdit.city,
      pincode: pickDataForEdit.pincode,
      phone: pickDataForEdit.phone,
      pan_no: pickDataForEdit.pan_no,
      tan_no: pickDataForEdit.tan_no,
      email_id: pickDataForEdit.email_id,
      contact_person: pickDataForEdit.contact_person,
      gst_status: pickDataForEdit.gst_status,
      gst_no: pickDataForEdit.gst_no,
      courier_stock_id: pickDataForEdit.courier_stock_id || null,
    };
    try {
      setSpinner(true);
      const response = await Customer_house_master(hub_id, houseMasterData);
      if (response?.status == 201) {
        showAlert(response.data.message, "success");
        getHouseMasterList();
        setShowHouseMasterForm(false);
        setPickDataForEdit(null);
      } else if (response.response.status == 406) {
        setError(response.response.data.errors);
      } else showAlert(response.data.message, "warning");
    } catch (err) {
      console.log(err);
    } finally {
      setSpinner(false);
    }
  };

  return (
    <div style={{ maxHeight: "69vh" }} className=" tbl-overflow-x-auto">
      <div className="mt-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <FormLabel>Customer Name</FormLabel>
          <span className="text-red-500 ml-2">*</span>
          <FormInput
            name="name"
            defaultValue={pickDataForEdit && pickDataForEdit.name}
            onChange={(e) => {
              setPickDataForEdit((prev: any) => ({
                ...prev,
                name: e.target.value,
              }));
            }}
          />
          <small style={{ color: "red" }}>
            {error?.map((val) => {
              if (val.path === "name") return val.msg;
            })}
          </small>
        </div>
        <div>
          <FormLabel>Phone Number</FormLabel>
          <span className="text-red-500 ml-2">*</span>
          <FormInput
            name="phone"
            defaultValue={pickDataForEdit && pickDataForEdit.phone}
            onChange={(e) => {
              setPickDataForEdit((prev: any) => ({
                ...prev,
                phone: e.target.value,
              }));
            }}
          />
          <small style={{ color: "red" }}>
            {error?.map((val) => {
              if (val.path === "phone") return val.msg;
            })}
          </small>
        </div>
        <div>
          <FormLabel>Email</FormLabel>
          <span className="text-red-500 ml-2">*</span>
          <FormInput
            name="email_id"
            defaultValue={pickDataForEdit && pickDataForEdit.email_id}
            onChange={(e) => {
              setPickDataForEdit((prev: any) => ({
                ...prev,
                email_id: e.target.value,
              }));
            }}
          />
          <small style={{ color: "red" }}>
            {error?.map((val) => {
              if (val.path === "email_id") return val.msg;
            })}
          </small>
        </div>
      </div>

      <div className="mt-4 w-full ">
        <FormLabel>Customer Address</FormLabel>
        <span className="text-red-500 ml-2">*</span>
        <FormInput
          name="address"
          defaultValue={pickDataForEdit && pickDataForEdit.address}
          onChange={(e) => {
            setPickDataForEdit((prev: any) => ({
              ...prev,
              address: e.target.value,
            }));
          }}
        />
        <small style={{ color: "red" }}>
          {error?.map((val) => {
            if (val.path === "address") return val.msg;
          })}
        </small>
      </div>

      <div className="mt-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <FormLabel>Select State</FormLabel>
          <span className="text-red-500 ml-2">*</span>
          <br />
          <FormSelect
            name="state"
            value={pickDataForEdit?.state}
            onChange={(e) => {
              setPickDataForEdit((prev: any) => ({
                ...prev,
                state: e.target.value,
              }));
              getCities(e.target.value);
            }}
            aria-label="Select State"
          >
            <option value="">Select State</option>
            {stateList?.map((item: any) => (
              <option value={item.state_id} key={item.state_id}>
                {item.state_name}
              </option>
            ))}
          </FormSelect>
          <small style={{ color: "red" }}>
            {error?.map((val) => {
              if (val.path === "state") return val.msg;
            })}
          </small>
        </div>
        <div>
          <FormLabel>Select City</FormLabel>
          <span className="text-red-500 ml-2">*</span>
          <br />
          <FormSelect
            name="city"
            aria-label="Select City"
            value={pickDataForEdit?.city}
            onChange={(e) => {
              setPickDataForEdit((prev: any) => ({
                ...prev,
                city: e.target.value,
              }));
            }}
          >
            <option value="">Select City</option>
            {cityList?.map((item: any) => (
              <option value={item.city_id} key={item.city_id}>
                {item.city_name}
              </option>
            ))}
          </FormSelect>
          <small style={{ color: "red" }}>
            {error?.map((val) => {
              if (val.path === "city") return val.msg;
            })}
          </small>
        </div>
        <div>
          <FormLabel>Pincode</FormLabel>
          <span className="text-red-500 ml-2">*</span>
          <FormInput
            name="pincode"
            defaultValue={pickDataForEdit && pickDataForEdit.pincode}
            onChange={(e) => {
              setPickDataForEdit((prev: any) => ({
                ...prev,
                pincode: e.target.value,
              }));
            }}
          />
          <small style={{ color: "red" }}>
            {error?.map((val) => {
              if (val.path === "pincode") return val.msg;
            })}
          </small>
        </div>
      </div>

      <div className="mt-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <FormLabel>PAN Number</FormLabel>
          <span className="text-red-500 ml-2">*</span>
          <FormInput
            name="pan_no"
            defaultValue={pickDataForEdit && pickDataForEdit.pan_no}
            onChange={(e) => {
              setPickDataForEdit((prev: any) => ({
                ...prev,
                pan_no: e.target.value,
              }));
            }}
          />
          <small style={{ color: "red" }}>
            {error?.map((val) => {
              if (val.path === "pan_no") return val.msg;
            })}
          </small>
        </div>
        <div>
          <FormLabel>TAN Number</FormLabel>
          <span className="text-red-500 ml-2">*</span>
          <FormInput
            name="tan_no"
            defaultValue={pickDataForEdit && pickDataForEdit.tan_no}
            onChange={(e) => {
              setPickDataForEdit((prev: any) => ({
                ...prev,
                tan_no: e.target.value,
              }));
            }}
          />
          <small style={{ color: "red" }}>
            {error?.map((val) => {
              if (val.path === "tan_no") return val.msg;
            })}
          </small>
        </div>
        <div>
          <FormLabel>Contact Person</FormLabel>
          <span className="text-red-500 ml-2">*</span>
          <FormInput
            name="contact_person"
            defaultValue={pickDataForEdit && pickDataForEdit.contact_person}
            onChange={(e) => {
              setPickDataForEdit((prev: any) => ({
                ...prev,
                contact_person: e.target.value,
              }));
            }}
          />
          <small style={{ color: "red" }}>
            {error?.map((val) => {
              if (val.path === "contact_person") return val.msg;
            })}
          </small>
        </div>
      </div>

      <div className="mt-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <FormLabel>GST Status</FormLabel>
          <span className="text-red-500 ml-2">*</span>
          <br />
          <FormSelect
            name="gst_status"
            aria-label="Select Status"
            // disabled = { }
            value={pickDataForEdit?.gst_status}
            disabled={submitUpdatebtn && pickDataForEdit?.gst_status == "1"}
            onChange={(e: any) => {
              if (e.target.value == 1) setGstMandatory(true);
              else setGstMandatory(false);
              setPickDataForEdit((prev: any) => ({
                ...prev,
                gst_status: e.target.value,
              }));
            }}
          >
            <option value="">Select GST</option>
            {gstStatusList?.map((item: any) => (
              <option key={item.id} value={item.id}>
                {item.gst_status}
              </option>
            ))}
          </FormSelect>
        </div>
        <div>
          <FormLabel>GST Number</FormLabel>
          {gstMandatory ? <span className="text-red-500 ml-2">*</span> : ""}
          <FormInput
            name="gst_no"
            disabled={!gstMandatory}
            defaultValue={pickDataForEdit && pickDataForEdit.gst_no}
            onChange={(e) => {
              setPickDataForEdit((prev: any) => ({
                ...prev,
                gst_no: pickDataForEdit.gst_status == 1 ? e.target.value : null,
              }));
            }}
          />
          <small style={{ color: "red" }}>
            {error?.map((val) => {
              if (val.path === "gst_no") return val.msg;
            })}
          </small>
        </div>
      </div>

      <div className="mt-4">
        <Button
          disabled={spinner}
          onClick={() => handleFormSubmit()}
          className="bg-mustard border-none py-2 px-4 text-white"
        >
          {submitUpdatebtn ? "Update" : "Submit"}{" "}
          {spinner && <LoadingIcon icon="puff" className="ml-2" />}
        </Button>
      </div>
    </div>
  );
};

export default customer_form;
