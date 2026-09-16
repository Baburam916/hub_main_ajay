import React, { useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import BagInscanList from "./bag_inscan_list";
import IncompleteList from "./bag_segregation";
import { Segregation_inscan_bag } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Box, ClipboardList, User } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import edit_booking from "../../../assets/images/edit_booking.png";

const index = () => {
  const { showAlert } = useAlert();
  const [bagNumber, setBagNumber] = useState<any>(null);
  const [bagInscanList, setBagInscanList] = useState<Array<any>>([]);
  const [showBagInscanList, setShowBagInscanList] = useState<boolean>(false);
  const [spinner, setSpinner] = useState<boolean>(false);

  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const bagInscan = async (bagNumber: any) => {
    setSpinner(true);
    try {
      const response = await Segregation_inscan_bag({
        hub_id,
        bag_no: bagNumber,
      });
      if (response.status == 200) {
        setBagInscanList(response.data.data);
        setShowBagInscanList(true);
      } else if (response?.status === 204) {
        setBagInscanList([]);
        showAlert("No data found!", "warning");
      } else showAlert(response.data.message, "error");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  console.log(bagInscanList, "bagInscanList");

  return (
    <>
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <ShieldCheck className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    {" "}
                    Shipment Segregation
                  </h4>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex justify-between ">
                  {!showBagInscanList && (
                    <div>
                      <div className="flex items-center ">
                        <h1 className="text-sm sm:text-lg font-bold">
                          Next Create Bag
                        </h1>
                        <div className=" p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2 bg-[#777] w-[32px] h-[32px]">
                          <Link
                            to="/hub/operation/create_bag"
                            className="font-bold"
                          >
                            <ArrowRight className="w-4 h-4 text-white" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full ">
            <div className="w-full awbsearchbg bg-[#f7f8f9] border-b border-[#fff0cd] py-3 px-3 md:py-3 md:px-5  ">
              <div className="flex items-center  ">
                <figure className="hidden lg:flex items-center justify-center  mr-1   bg-[#fff] rounded-full border border-[#fff0c9] w-[65px] h-[65px] ">
                  <img src={edit_booking} alt="" className="w-[35px] " />
                </figure>

                <div className=" lg:ml-[12px] mb-2 md:mb-0 lg:border-l border-[#ffe6af] lg:pl-[10px] ">
                  <h2 className="text-[14px] !mb-0">Bag No.</h2>
                  <div className="scanBox gap-2 flex-wrap lg:flex-nowrap flex ">
                    <div className=" relative p-[1px] overflow-hidden w-full lg:w-[390px]  rounded-[10px]">
                      <div className="inputIcon relative">
                        <FormInput
                          disabled={showBagInscanList || spinner}
                          className="rounded-[10px] w-full z-4 relative border border-[#D4D4D4] !h-[45px] !pl-[54px]"
                          placeholder="Enter Bag No."
                          value={bagNumber}
                          onChange={(e) =>
                            setBagNumber(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              bagInscan(bagNumber);
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
                        className="h-[42px] text-[15px] border-none inline-flex items-center justify-center cursor-pointer bg-mustard hover:bg-[#777779] text-white  py-2 px-7 rounded-lg hover:bg-yellow-250 transition uppercase"
                        disabled={spinner || showBagInscanList}
                        onClick={() => bagInscan(bagNumber)}
                      >
                        Inscan Bag{" "}
                        {spinner && (
                          <LoadingIcon icon="puff" className="ml-2" />
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

      {showBagInscanList ? (
        <BagInscanList
          bagInscanList={bagInscanList}
          hub_id={hub_id}
          emp_id={emp_id}
          bagInscan={bagInscan}
          bagNumber={bagNumber}
          setShowBagInscanList={setShowBagInscanList}
          showBagInscanList={showBagInscanList}
        />
      ) : (
        <IncompleteList
          hub_id={hub_id}
          setBagNumber={setBagNumber}
          bagNumber={bagNumber}
          bagInscan={bagInscan}
        />
      )}
    </>
  );
};

export default index;
