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
import { User } from "lucide-react";

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




 <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
		
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <User className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    Authenticate Vendor List
                  </h4>
                </div>
              </div>

          
            </div>
          </div>

              <div className="p-2  lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 gap-4 ">
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
            className="bg-mustard border-none py-2 px-6  text-white rounded-md "
          >
            Save {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>
        </div>
      </div>   
       </div>
       </div>
    </>
  );
};

export default index;
