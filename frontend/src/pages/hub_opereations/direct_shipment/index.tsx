import React, { useEffect, useState } from "react";

import {
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Modal from "../../../components/Modal";
import { useAlert } from "../../../ContextProvider/AlertContext";
import {
  Direct_inscan_airwaybill,
  Status_code_list,
} from "../../../AllServices/services";
import { ShipmentScanAirwaybill } from "../../../DataTypes/dataTypes";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Box, ClipboardList, Package, User } from "lucide-react";

import directshipmenticon from "../../../assets/images/courier_commercial_icon.png";

const index = () => {
  const { showAlert } = useAlert();
  const [airwaybillNumber, setAirwaybillNumber] = useState<any>(null);
  // const [openHoldList, setOpenHoldList] = useState<boolean>(false);
  const [statusList, setStatusList] = useState<Array<any>>([]);
  const [heldUpReason, setHeldUpReason] = useState<any>(-1);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [otherReason, setOtherReason] = useState<any>(null);
  // const [reasonModalbtn, setReasonModalbtn] = useState<boolean>(false);

  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  useEffect(() => {
    const getStatusList = async () => {
      try {
        const response = await Status_code_list();
        if (response.status == 200) setStatusList(response.data.data);
      } catch (error) {
        console.log(error);
        showAlert("Something went wrong with status list!", "error");
      }
    };

    getStatusList();
  }, []);

  const shipmentInscan = async () => {
    // if (heldUpReason == 264 && !otherReason) {
    //   showAlert("Please fill the reason", "error");
    //   return;
    // }
    const shipmentScanAirwaybill: ShipmentScanAirwaybill = {
      airwaybill_no: airwaybillNumber,
      held_up_reason: -1,
      // ...(Number(heldUpReason) == 264 ? { other_reason: otherReason } : {}),
    };
    setSpinner(true);
    let response;
    try {
      response = await Direct_inscan_airwaybill(
        { emp_id: emp_id, hub_id: hub_id },
        shipmentScanAirwaybill,
      );
      if (response?.status == 200 || response?.status == 201) {
        // setOpenModal(false);
        showAlert(response.data.message, "success");
        // setOpenHoldList(false);
        setAirwaybillNumber("");
        // setHeldUpReason(-1);
        // setOtherReason("");
      } else showAlert(response.data.message, "warning");
      // setOpenModal(false);
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setSpinner(false);
    }
  };

  const shipmentHold = async () => {
    if (heldUpReason == 264 && !otherReason) {
      showAlert("Please fill the reason", "error");
      return;
    }
    const shipmentScanAirwaybill: ShipmentScanAirwaybill = {
      airwaybill_no: airwaybillNumber,
      held_up_reason: heldUpReason,
      ...(Number(heldUpReason) == 264 ? { other_reason: otherReason } : {}),
    };
    setSpinner(true);
    let response;
    try {
      response = await Direct_inscan_airwaybill(
        { emp_id: emp_id, hub_id: hub_id },
        shipmentScanAirwaybill,
      );
      if (response?.status == 200 || response?.status == 201) {
        setOpenModal(false);
        showAlert(response.data.message, "success");
        // setOpenHoldList(false);
        setAirwaybillNumber("");
        setHeldUpReason(-1);
        setOtherReason("");
      } else showAlert(response.data.message, "warning");
      setOpenModal(false);
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setSpinner(false);
    }
  };

  const description = (
    <>
      <div>
        {/* <h1>Direct Shipment Paper work</h1> */}
        <h1 className="text-[25px] text-center p-4">
          Airwaybill No - {airwaybillNumber}
        </h1>
      </div>
      {/* <div> */}
      {/* <div className="flex justify-between">
          <Button
            className="bg-danger border-none py-2 px-4 text-white rounded-xl hover:bg-[#c9302c] focus:ring-4 focus:ring-opacity-70"
            onClick={() => {
              setOpenHoldList(!openHoldList);
              setHeldUpReason(-1);
              setOtherReason(null);
            }}
          >
            Hold
            <br />
            (Paperwork Not Clear)
          </Button>
          <Button
            className="bg-[#14d28b] border-none py-2 px-4 text-white rounded-xl hover:bg-[#169F85] focus:ring-4 focus:ring-opacity-70"
            disabled={openHoldList || spinner}
            onClick={() => shipmentInscan()}
          >
            Inscan
            <br />
            (Paperwork Clear){" "}
            {!openHoldList
              ? spinner && <LoadingIcon icon="puff" className="ml-2" />
              : ""}
          </Button>
        </div> */}
      {/* {openHoldList && (
          <> */}
      <div className="mt-4">
        {/* <FormLabel htmlFor="modal-form-6">Select Hold Reason</FormLabel> */}
        <FormSelect
          onChange={(e) => setHeldUpReason(e.target.value)}
          id="modal-form-6"
        >
          <option>Select held up reason</option>
          {statusList.map((val) => {
            return <option value={val.status_code}>{val.status}</option>;
          })}
          <option value="264">Other</option>
        </FormSelect>
        {Number(heldUpReason) == 264 && (
          <div className="mt-2 mb-2">
            <FormLabel>Reason</FormLabel>
            <span className="text-red-500 ml-2">*</span>
            <FormTextarea
              className="px-4 py-3  max-h-20 min-h-16"
              autoComplete="off"
              value={otherReason}
              onChange={(e: any) => {
                setOtherReason(e.target.value);
              }}
            ></FormTextarea>
          </div>
        )}
        <Button
          disabled={spinner}
          className="bg-mustard border-none py-2 px-4 mt-4 text-white rounded-mc"
          onClick={() => shipmentHold()}
        >
          Submit {spinner && <LoadingIcon icon="puff" className="ml-2" />}
        </Button>
      </div>
      {/* </>
        )} */}
      {/* </div> */}
    </>
  );

  return (
    <>
      <div className=" w-full xl:w-[100%]  2xl:w-[100%]  m-auto mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-none flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Package className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium"> Next Create Bag</h4>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <h1 className="text-sm sm:text-lg font-bold ">
                  Next Create Bag
                </h1>

                <div className="  p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2 bg-[#777] w-[34px] h-[34px]">
                  <Link to="/hub/operation/create_bag" className="font-bold">
                    <ArrowRight className="w-5 h-4 text-white " />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full ">
            <div className="w-full awbsearchbg bg-[#f7f8f9] border-b border-[#fff0cd] py-3 px-3 md:py-3 md:px-5  ">
              <div className="flex items-center  ">
                <figure className="hidden lg:flex items-center justify-center  mr-1   bg-[#fff] rounded-full border border-[#fff0c9] w-[65px] h-[65px] ">
                  <img src={directshipmenticon} alt="" className="w-[43px] " />
                </figure>

                <div className=" lg:ml-[12px] mb-2 md:mb-0 lg:border-l border-[#ffe6af] lg:pl-[10px] ">
                  <h2 className="text-[14px] !mb-0">Airwaybill No.</h2>
                  <div className="scanBox gap-2 flex-wrap lg:flex-nowrap flex ">
                    <div className=" relative p-[1px] overflow-hidden w-full lg:w-[390px]  rounded-[10px]">
                      <div className="inputIcon relative">
                        <FormInput
                          placeholder="Enter Airwaybill No."
                          value={airwaybillNumber}
                          autoFocus={true}
                          className="rounded-[10px] w-full z-4 relative border border-[#ffd67f] !h-[42px] !pl-[54px]"
                          onChange={(e) =>
                            setAirwaybillNumber(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              // setOpenModal(true);
                              shipmentInscan();
                            }
                          }}
                        />

                        <i className="absolute top-[1px] left-[1px] rounded-l-lg bg-[#fffaee] bottom-[-1px] flex items-center w-[42px] h-[39px] border-r border-[#E8E8E8] justify-center">
                          <ClipboardList className="text-[#7b7b7b] " />
                        </i>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="h-[42px] text-[15px] border-none inline-flex items-center justify-center cursor-pointer bg-mustard hover:bg-[#777779] text-white  py-2 px-3 rounded-lg hover:bg-yellow-250 transition "
                        onClick={() => {
                          // if (!airwaybillNumber) {
                          //   showAlert("Fill the Airwaybil No", "error");
                          //   setOpenModal(false);
                          // } else {
                          //   setOpenModal(true);
                          //   setOpenHoldList(false);
                          // setHeldUpReason(-1);
                          // setOtherReason(null);
                          shipmentInscan();
                          // }
                        }}
                      >
                        Inscan Shipment{" "}
                        {spinner && (
                          <LoadingIcon icon="puff" className="ml-2" />
                        )}
                      </Button>

                      <Button
                        className="h-[42px] text-[15px] border-none inline-flex items-center justify-center cursor-pointer bg-red-400 hover:bg-[#777779] text-white  py-2 px-3 rounded-lg hover:bg-yellow-250 transition "
                        onClick={() => {
                          if (!airwaybillNumber) {
                            showAlert("Airwaybill No is required!", "warning");
                            setOpenModal(false);
                          } else {
                            // setOpenHoldList(false);
                            setHeldUpReason(-1);
                            setOtherReason(null);
                            setOpenModal(true);
                          }
                        }}
                      >
                        Hold Shipment
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
   

      <Modal
        open={openModal}
        size="md"
        title="Hold Shipment"
        setOpen={setOpenModal}
        description={description}
        footer={null}
      />
    </>
  );
};

export default index;
