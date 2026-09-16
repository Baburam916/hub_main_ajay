import React, { useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { Generate_dispatch } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Box, ClipboardList, FileCog, User } from "lucide-react";

import generate_dispatch_label from "../../../assets/images/generate_dispatch_label.png";

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
    <>
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-none flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <FileCog className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    {" "}
                    Generate Dispatch Label
                  </h4>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full ">
            <div className="w-full awbsearchbg bg-[#f7f8f9] border-b border-[#fff0cd] py-3 px-3 md:py-3 md:px-5  ">
              <div className="flex items-center  ">
                <figure className="hidden lg:flex items-center justify-center  mr-1   bg-[#fff] rounded-full border border-[#fff0c9] w-[65px] h-[65px] ">
                  <img
                    src={generate_dispatch_label}
                    alt=""
                    className="w-[38px] "
                  />
                </figure>

                <div className=" lg:ml-[12px] mb-2 md:mb-0 lg:border-l border-[#ffe6af] lg:pl-[10px] ">
                  <h2 className="text-[14px] !mb-0">Airwaybill No.</h2>
                  <div className="scanBox gap-2 flex-wrap lg:flex-nowrap flex ">
                    <div className=" relative p-[1px] overflow-hidden w-full lg:w-[390px]  rounded-[10px]">
                      <div className="inputIcon relative">
                        <FormInput
                          // value={airwaybillNumber}
                          className="rounded-[10px] w-full z-4 relative border border-[#ffd67f] !h-[42px] !pl-[54px]"
                          placeholder="Enter Airwaybill No."
                          value={airwaybillNo}
                          onChange={(e) => {
                            setAirwaybillNo(e.target.value.toUpperCase());
                            setForDisableGenerateBtn(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              generateDispatch();
                            }
                          }}
                          // onChange={(e) => setAirwaybillNumber(e.target.value)}
                        />

                        <i className="absolute top-[1px] left-[1px] rounded-l-lg bg-[#fffaee] bottom-[-1px] flex items-center w-[42px] h-[39px] border-r border-[#E8E8E8] justify-center">
                          <ClipboardList className="text-[#7b7b7b] " />
                        </i>
                      </div>
                    </div>
                    <div>
                      <Button
                        disabled={!airwaybillNo || spinner}
                        className="h-[42px] text-[15px] border-none inline-flex items-center justify-center cursor-pointer bg-mustard hover:bg-[#777779] text-white  py-2 px-7 rounded-lg hover:bg-yellow-250 transition uppercase"
                        onClick={() => generateDispatch()}
                        // onClick={() => manif bestInscan()}
                      >
                        Generate{" "}
                        {spinner && <LoadingIcon icon="puff" className="" />}
                      </Button>
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
    </>
  );
};

export default index;
