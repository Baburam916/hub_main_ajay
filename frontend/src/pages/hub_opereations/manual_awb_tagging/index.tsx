import React, { useEffect, useState } from "react";
import Button from "../../../base-components/Button";
import { FormInput, FormLabel } from "../../../base-components/Form";
import {
  Manual_awb_tagging_check_airwaybill,
  Manual_awb_tagging,
} from "../../../AllServices/services";
import { TagAirwaybillData } from "../../../DataTypes/dataTypes";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Box, ClipboardList, User } from "lucide-react";
import { Plane } from "lucide-react";

import manual_awb from "../../../assets/images/manual_awb.png";

const index = () => {
  const { showAlert } = useAlert();
  const [courierId, setCourierId] = useState<any>(null);
  const [airwaybillNumber, setAirwaybillNumber] = useState<any>(null);
  const [showTagAirwaybill, setShowTagAirwaybill] = useState<boolean>(false);
  const [newAirwaybillNumber, setNewAirwaybillNumber] = useState<any>(null);
  const [refrenceNumber, setRefrenceNumber] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [upload, setUpload] = useState<any>(null);
  const [tagSpinner, setTagSpinner] = useState<boolean>(false);

  const checkAirwaybillNumber = async () => {
    setSpinner(true);
    try {
      const response: any =
        await Manual_awb_tagging_check_airwaybill(airwaybillNumber);
      if (response.status == 200) {
        setCourierId(response.data.data.courier_id);
        setShowTagAirwaybill(true);
      } else showAlert(response.data.message, "warning");
    } catch (err) {
      console.log(err);
      showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  const tagAirwaybillNumber = async () => {
    setTagSpinner(true);
    const formData = new FormData();
    formData.append("file", upload);
    formData.append("courier_id", courierId);
    formData.append("refrence_no", refrenceNumber);
    formData.append("airwaybill_no", airwaybillNumber);
    formData.append("new_airwaybill_no", newAirwaybillNumber);
    let response;
    try {
      response = await Manual_awb_tagging(formData);
      if (response.status == 201) {
        showAlert(response.data.message, "success");
        setShowTagAirwaybill(false);
        setNewAirwaybillNumber("");
        setAirwaybillNumber("");
        setRefrenceNumber("");
      } else if (response.status == 204) showAlert("No data found!", "warning");
      else showAlert(response.data.message, "warning");
    } catch (err) {
      console.log(err);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setTagSpinner(false);
    }
  };

  return (
    <>
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nwrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Plane className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    {" "}
                    Manual Awb Tagging
                  </h4>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full ">
            <div className="w-full awbsearchbg bg-[#f7f8f9] border-b border-[#fff0cd] py-3 px-3 md:py-3 md:px-5  ">
              <div className="flex items-center  ">
                <figure className="hidden lg:flex items-center justify-center  mr-1   bg-[#fff] rounded-full border border-[#fff0c9] w-[65px] h-[65px] ">
                  <img src={manual_awb} alt="" className="w-[35px] " />
                </figure>

                <div className=" lg:ml-[12px] mb-2 md:mb-0 lg:border-l border-[#ffe6af] lg:pl-[10px] ">
                  <h2 className="text-[14px] !mb-0">Airwaybill No.</h2>
                  <div className="scanBox gap-2 flex-wrap lg:flex-nowrap flex ">
                    <div className=" relative p-[1px] overflow-hidden w-full lg:w-[390px]  rounded-[10px]">
                      <div className="inputIcon relative">
                        <FormInput
                          value={airwaybillNumber}
                          className="rounded-[10px] w-full z-4 relative border border-[#ffd67f] !h-[42px] !pl-[54px]"
                          placeholder="Enter Airwaybill No."
                          disabled={showTagAirwaybill}
                          onChange={(e) =>
                            setAirwaybillNumber(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              checkAirwaybillNumber();
                            }
                          }}
                        />

                        <i className="absolute top-[1px] left-[1px] rounded-l-lg bg-[#fffaee] bottom-[-1px] flex items-center w-[42px] h-[39px] border-r border-[#E8E8E8] justify-center">
                          <ClipboardList className="text-[#7b7b7b] " />
                        </i>
                      </div>
                    </div>
                    <div>
                      {!showTagAirwaybill && (
                        <Button
                          disabled={spinner}
                          className="h-[42px] text-[15px] border-none inline-flex items-center justify-center cursor-pointer bg-mustard hover:bg-[#777779] text-white  py-2 px-7 rounded-lg hover:bg-yellow-250 transition uppercase"
                          onClick={() => checkAirwaybillNumber()}
                        >
                          Check Airwaybill{" "}
                          {spinner && (
                            <LoadingIcon icon="puff" className="ml-2" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2  lg:p-6 flex-wrap lg:flex-nwrap flex gap-2">


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

      {showTagAirwaybill && (
        <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
          <div className="flex w-full">
            <div className="mr-4">
              <FormLabel className={`flex items-center text-500`}>
                Airwaybill No. To Tag
              </FormLabel>
              <FormInput
                value={newAirwaybillNumber}
                className="w-60"
                onChange={(e) =>
                  setNewAirwaybillNumber(e.target.value.toUpperCase())
                }
              />
            </div>
            <div className="">
              <FormLabel className={`flex items-center text-500`}>
                Upload
              </FormLabel>
              <FormInput
                type="file"
                className="w-60 ml-4"
                onChange={(e) =>
                  setUpload(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>
          </div>
          {courierId == 34 && (
            <div>
              <FormLabel className={`flex items-center text-500`}>
                Refrence No.
              </FormLabel>
              <FormInput
                value={refrenceNumber}
                className="w-60"
                onChange={(e) => setRefrenceNumber(e.target.value)}
              />
            </div>
          )}
          <div className="flex items-end mt-2">
            <Button
              disabled={tagSpinner}
              onClick={() => tagAirwaybillNumber()}
              className="bg-[#14d28b] border-none py-2 px-4 text-white rounded-xl hover:bg-[#169F85]"
            >
              Tag Airwaybill no.{" "}
              {tagSpinner && <LoadingIcon icon="puff" className="ml-2" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default index;
