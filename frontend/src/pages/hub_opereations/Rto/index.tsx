import React, { useState } from "react";
import Rto from "./Rto";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Rto_booking_details } from "../../../AllServices/services";
import LoadingIcon from "../../../base-components/LoadingIcon";

const index = () => {
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const [awbNo, setAwbNo] = useState<string>("");
  const [showRto, setShowRto] = useState<boolean>(false);
  const { showAlert } = useAlert();
  const [awbData, setAwbData] = useState({});
  const [spinner, setSpinner] = useState(false);

  const getData = async () => {
    setSpinner(true);
    try {
      const res = await Rto_booking_details(awbNo.trim());
      if (res?.status == 200) {
        if (res?.data?.data?.length == 0) {
          showAlert("Data Not Found", "warning");
          setSpinner(false);
          return;
        } else {
          const is_domestic = res?.data?.data?.pickup_data?.is_domestic;
          if (is_domestic == 1) {
            showAlert(
              `R.T.O is not available for international bookings!`,
              "warning"
            );
            setSpinner(false);
          } else {
            setAwbData(res?.data?.data);
            setShowRto(true);
          }
        }
      } else if (res?.status == 203) {
        setAwbData([]);
        showAlert(res?.data?.message, "warning");
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error"
        );
      }
    } catch (error) {
      console.log(error);
      showAlert("something went wrong", "error");
    } finally {
      setSpinner(false);
    }
  };

  return (
    <>
      {showRto ? (
        <Rto awbData={awbData} setShowRto={setShowRto} setAwbNo={setAwbNo} />
      ) : (
        <div className="w-full max-w-8xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
          <h1 className="font-bold text-lg">Return To Origin</h1>
          <hr />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center">
            <FormLabel>Airwaybill No. :</FormLabel>
            <FormInput
              className="w-100 sm:w-60 sm:ml-4"
              value={awbNo}
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
              disabled={!awbNo || spinner}
              className="mt-2 sm:mt-0 bg-mustard border-none py-2 px-4 sm:mx-4 text-white rounded-xl"
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
          </div>
        </div>
      )}
    </>
  );
};

export default index;
