import { useEffect, useState } from "react";
import { FormCheck } from "../../../base-components/Form";
import {
  Get_enable_vendor_btn,
  Get_vendor_list,
  Put_authenticate_vendor,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";

const index = () => {
  const { showAlert } = useAlert();
  const [vendorListAll, setVendorListAll] = useState<Array<any>>([]);
  const [checkedValue, setCheckedValue] = useState<Array<any>>([]);
  const [getHubCourier, setGetHubCourier] = useState<Array<any>>([]);
  const [spinner, setSpinner] = useState<boolean>(false);

  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const [postCheckboxValue, setPostCheckboxValue] = useState<any>({
    hub_id: hub_id,
    couriers: [],
  });

  const getCheckboxData = async () => {
    const response: any = await Get_vendor_list();
    try {
      if (response?.status == 200) setVendorListAll(response?.data?.data);
    } catch (err: any) {
      console.log(err);
    }
  };

  const getHub = async () => {
    const response: any = await Get_enable_vendor_btn(hub_id);
    setGetHubCourier(response?.data?.data[0]?.hub_couriers);
  };

  const handleCheckboxChange = (e: any, index: any) => {
    const isChecked = e.target.checked;
    const value = parseInt(e.target.value);
    let updatedCheckedValue: any;

    if (isChecked) {
      updatedCheckedValue = [...checkedValue, value];
    } else {
      updatedCheckedValue = checkedValue.filter((item) => item !== value);
    }
    setCheckedValue(updatedCheckedValue);
    setPostCheckboxValue((prev: any) => ({
      ...prev,
      couriers: updatedCheckedValue,
    }));
  };

  const saveCheckbox = async () => {
    setSpinner(true);
    const response: any = await Put_authenticate_vendor(postCheckboxValue);
    try {
      if (response?.status == 200) {
        showAlert(response.data.message);
      } else {
        showAlert(response.data.message, "warning");
      }
    } catch (err: any) {
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setSpinner(false);
    }
  };

  useEffect(() => {
    getCheckboxData();
    getHub();
  }, []);

  useEffect(() => {
    setCheckedValue(getHubCourier);
  }, [getHubCourier]);

  return (
    <>
      <div
        className="w-full max-w-6xl mx-auto mt-4 px-6 py-3 bg-white rounded-lg shadow-lg"
        style={{ maxHeight: "78vh", overflowY: "scroll" }}
      >
        <h1 className="text-base text-gray-500 font-bold">
          Authenticate Vendor List
        </h1>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {vendorListAll?.map((item, index) => (
            <FormCheck className="mt-2 justify-start" key={index}>
              <FormCheck.Input
                value={item.product_id}
                onChange={(e) => handleCheckboxChange(e, index)}
                checked={checkedValue?.includes(item?.product_id)}
                id={`checkbox-switch-${item?.product_id}`}
                type="checkbox"
              />
              <FormCheck.Label htmlFor={`checkbox-switch-${item?.product_id}`}>
                {item?.product_name}
              </FormCheck.Label>
            </FormCheck>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            disabled={spinner}
            onClick={() => saveCheckbox()}
            className="bg-mustard border-none py-2 px-6 mr-4 text-white rounded-xl"
          >
            Save {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>
        </div>
      </div>
    </>
  );
};

export default index;
