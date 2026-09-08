import React, { useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Change_weight from "./change_weight";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Shipment_details } from "../../../AllServices/services";
import LoadingIcon from "../../../base-components/LoadingIcon";

const index = () => {
  const [awbNo, setAwbNo] = useState<string>("");
  const [showChangeWeight, setShowChangeWeight] = useState<boolean>(false);
  const [oldDimensions, setOldDimensions] = useState<Array<any>>([]);
  const { showAlert } = useAlert();
  const [awbData, setAwbData] = useState({});
  const [spinner, setSpinner] = useState(false);

  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;

  const getData = async () => {
    setSpinner(true);
    let res;
    try {
      res = await Shipment_details(awbNo?.trim(), 2);
      if (res?.status == 200 || res.status == 201) {
        const shipmentType =
          res?.data?.data?.pickup_data?.booking_shipment_type_id;
        if (res?.data?.data.length == 0) {
          showAlert("No data found", "warning");
          setSpinner(false);
          return;
        }
        if (shipmentType == 2 || shipmentType == 4 || shipmentType == 5) {
          showAlert(
            `Change Weight is not available for ${
              shipmentType == 2
                ? "document"
                : shipmentType == 4
                ? "commercial"
                : "cargo commercial"
            } bookings!`,
            "warning"
          );
          setSpinner(false);
          return;
        }
        setAwbData(res?.data?.data);
        setOldDimensions(JSON.stringify(res?.data?.data?.pickup_item));
        setShowChangeWeight(true);
        showAlert(res.data.message, "success");
      } else if (res?.status == 203 || res?.status == 204) {
        showAlert(res?.data?.message, "warning");
      } else {
        showAlert("something went wrong", "error");
      }
    } catch (error) {
      console.log(error);
      if (res.response.status == 406)
        showAlert(res.response.data.errors[0].msg, "warning");
      else showAlert(res.response.data.message, "error");
    } finally {
      setSpinner(false);
    }
  };
  return (
    <>
      <div className="w-full max-w-8xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="font-bold text-lg">Change Weight</h1>
        <hr />
        <div className="mt-4 sm:flex items-center">
          <FormLabel>Airwaybill No. :</FormLabel>
          <FormInput
            className="sm:w-60 sm:ml-4"
            value={awbNo}
            disabled={showChangeWeight}
            onChange={(e) => setAwbNo(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                getData();
              }
            }}
          />

          <Button
            type="button"
            onClick={getData}
            disabled={!awbNo || spinner || showChangeWeight}
            className="bg-mustard border-none py-2 px-4 mt-2 sm:mt-0 sm:mx-4 text-white rounded-xl mr-2"
          >
            FETCH
            {spinner && (
              <LoadingIcon
                icon="puff"
                color="white"
                className="w-5 h-5 ml-2 stroke-2.5 text-white"
              />
            )}
          </Button>

          {showChangeWeight && (
            <Button
              type="button"
              onClick={() => {
                setAwbNo("");
                setShowChangeWeight(false);
              }}
              className="bg-red-500 border-none py-2 px-4  text-white rounded-xl"
            >
              RESET
            </Button>
          )}
        </div>
      </div>

      {showChangeWeight ? (
        <Change_weight
          awbData={awbData}
          oldDimensions={oldDimensions}
          setShowChangeWeight={setShowChangeWeight}
          setAwbNo={setAwbNo}
          emp_id={emp_id}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default index;
