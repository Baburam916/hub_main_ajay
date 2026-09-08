import React, { useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { Generate_dispatch } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";

const index = () => {
  const { showAlert } = useAlert();
  const [airwaybillNo, setAirwaybillNo] = useState<any>(null);
  const [forDisableGenerateBtn, setForDisableGenerateBtn] =
    useState<boolean>(true);
  const [spinner, setSpinner] = useState<boolean>(false);

  const generateDispatch = async () => {
    setSpinner(true);
    try {
      const response = await Generate_dispatch(airwaybillNo);
      if (response?.status == 200) {
        setAirwaybillNo("");
        setForDisableGenerateBtn(false);
        window.open(response?.data?.data, "_blank");
        //  navigate(response?.data?.data);
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between mb-2">
        <div>
          <h1 className="font-bold text-lg">Generate Dispatch Label</h1>
        </div>
      </div>
      <hr />
      <div className="mt-4 sm:flex">
        <FormLabel className={`flex items-center text-500`}>
          Airwaybil No. :
        </FormLabel>
        <FormInput
          // value={airwaybillNumber}
          className="sm:w-60 sm:ml-4"
          value={airwaybillNo}
          onChange={(e) => {
            setAirwaybillNo(e.target.value.toUpperCase());
            setForDisableGenerateBtn(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              generateDispatch()
            }
          }}
          // onChange={(e) => setAirwaybillNumber(e.target.value)}
        />
        <Button
          disabled={!airwaybillNo || spinner}
          className="bg-mustard border-none py-1 px-4 mt-2 sm:mt-0 sm:ml-8 text-white rounded-xl"
          onClick={() => generateDispatch()}
          // onClick={() => manif bestInscan()}
        >
          Generate {spinner && <LoadingIcon icon="puff" className="" />}
        </Button>
      </div>
    </div>
  );
};

export default index;
