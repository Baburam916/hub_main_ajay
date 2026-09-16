import React, { useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Change_weight from "./change_weight";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Shipment_details } from "../../../AllServices/services";
import LoadingIcon from "../../../base-components/LoadingIcon";

import { Box, ClipboardList, FileCheck } from "lucide-react";

import changeweighticon from "../../../assets/images/changeweighticon.png";

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
            "warning",
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
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="block lg:flex items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2 mb-2 lg:mb-0">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <FileCheck className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">Change Weight</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full ">
            <div className="w-full awbsearchbg bg-[#f7f8f9] border-b border-[#fff0cd] py-3 px-3 md:py-3 md:px-5  ">
              <div className="flex items-center  ">
                <figure className="hidden lg:flex items-center justify-center  mr-1   bg-[#fff] rounded-full border border-[#fff0c9] w-[65px] h-[65px] ">
                  <img src={changeweighticon} alt="" className="w-[32px] " />
                </figure>

                <div className=" lg:ml-[12px] mb-2 md:mb-0 lg:border-l border-[#ffe6af] lg:pl-[10px] ">
                  <h2 className="text-[14px] !mb-0">Airwaybill No.</h2>
                  <div className="scanBox gap-2 flex-wrap lg:flex-nowrap flex ">
                    <div className=" relative p-[1px] overflow-hidden w-full lg:w-[390px]  rounded-[10px]">
                      <div className="inputIcon relative">
                        <FormInput
                          placeholder="Enter Airwaybill No."
                          className="rounded-[10px] w-full z-4 relative border border-[#ffd67f] !h-[42px] !pl-[54px]"
                          value={awbNo}
                          disabled={showChangeWeight}
                          onChange={(e) =>
                            setAwbNo(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              getData();
                            }
                          }}
                        />

                        <i className="absolute top-[1px] left-[1px] rounded-l-lg bg-[#fffaee] bottom-[-1px] flex items-center w-[42px] h-[39px] border-r border-[#E8E8E8] justify-center">
                          <ClipboardList className="text-[#7b7b7b] " />
                        </i>
                      </div>
                    </div>
                    <div>
                      <Button
                        type="button"
                        onClick={getData}
                        disabled={!awbNo || spinner || showChangeWeight}
                        className="h-[42px] text-[15px] border-none inline-flex items-center justify-center cursor-pointer bg-mustard hover:bg-[#777779] text-white  py-2 px-7 rounded-lg hover:bg-yellow-250 transition uppercase"
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
                          className="h-[42px] text-[15px] border-none inline-flex items-center justify-center cursor-pointer bg-red-400 hover:bg-[#777779] text-white  py-2 px-7 rounded-lg hover:bg-yellow-250 transition uppercase"
                        >
                          RESET
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2  lg:p-6">
            <div className="w-full text-center py-2 lg:py-10 opacity-30 nodataNew">
              <figure className="text-center flex justify-center mb-4">
                <Box className="w-[28px] h-[28px] " />
              </figure>
              <p className="text-[13px] ">
                Currently, there is no data available to display
              </p>
            </div>
          </div>
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
