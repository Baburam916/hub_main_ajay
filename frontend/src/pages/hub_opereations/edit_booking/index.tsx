import React, { useState } from "react";
import Edit_booking from "./edit_booking";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Editbooking_details } from "../../../AllServices/services";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Box, ClipboardList, User } from "lucide-react";
import { PenTool } from "lucide-react";

import edit_booking from "../../../assets/images/edit_booking.png";

const index = () => {
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const [awbNo, setAwbNo] = useState<string>("");
  const [showEditBooking, setShowEditBooking] = useState<boolean>(false);
  const { showAlert } = useAlert();
  const [awbData, setAwbData] = useState({});
  const [spinner, setSpinner] = useState(false);

  const getData = async () => {
    setSpinner(true);
    try {
      const res = await Editbooking_details(awbNo.trim());
      if (res?.status == 200) {
        if (res?.data?.data?.length == 0) {
          showAlert("Data Not Found", "warning");
          setSpinner(false);
          return;
        } else {
          const shipmentType =
            res?.data?.data?.pickup_data?.booking_shipment_type_id;
          if (shipmentType == 5) {
            showAlert(
              `Edit Booking is not available for cargo commercial bookings!`,
              "warning",
            );
            setSpinner(false);
          } else {
            setAwbData(res?.data?.data);
            setShowEditBooking(true);
          }
        }
      } else if (res?.status == 203) {
        setAwbData([]);
        showAlert(res?.data?.message, "warning");
      } else {
        showAlert("something went wrong", "error");
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
      {showEditBooking ? (
        <Edit_booking
          awbData={awbData}
          setShowEditBooking={setShowEditBooking}
          setAwbNo={setAwbNo}
        />
      ) : (
        <>
          <div className="w-full  xl:w-[100%]  2xl:w-[100%]  m-auto mt-2 mb-4">
            <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
              <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
                <div className="flex-wrap lg:flex-none flex gap-2 items-center justify-between w-full">
                  <div>
                    <div className="flex items-center gap-2">
                      <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                        <PenTool className="w-[17px]  text-[#fff] " />
                      </i>
                      <h4 className="text-[16px] font-medium"> Edit Booking</h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full ">
                <div className="w-full awbsearchbg bg-[#f7f8f9] border-b border-[#fff0cd] py-3 px-3 md:py-3 md:px-5  ">
                  <div className="flex items-center  ">
                    <figure className="hidden lg:flex items-center justify-center  mr-1   bg-[#fff] rounded-full border border-[#fff0c9] w-[65px] h-[65px] ">
                      <img src={edit_booking} alt="" className="w-[38px] " />
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
                            disabled={!awbNo || spinner}
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
      )}
    </>
  );
};

export default index;
