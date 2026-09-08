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
import { ArrowRight } from "lucide-react";

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
        shipmentScanAirwaybill
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
        shipmentScanAirwaybill
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
          className="bg-mustard border-none py-1 px-4 mt-4 text-white rounded-xl"
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
      <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between mb-2">
          <div>
            <h1 className="text-sm sm:text-lg font-bold mb-2">
              Direct Shipment
            </h1>
          </div>
          <div>
            <div className="flex items-center">
              <h1 className="text-sm sm:text-lg font-bold mb-2">
                Next Create Bag
              </h1>
              <div className="p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2">
                <Link to="/hub/operation/create_bag" className="font-bold">
                  <ArrowRight className="w-5 h-4 " />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <hr />
        <div className="mt-4 sm:flex">
          <FormLabel className={`flex items-center text-500`}>
            Airwaybil No. :
          </FormLabel>
          <FormInput
            value={airwaybillNumber}
            autoFocus={true}
            className="mb-2 sm:mb-0 sm:w-60 sm:ml-4"
            onChange={(e) => setAirwaybillNumber(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // setOpenModal(true);
                shipmentInscan();
              }
            }}
          />

          <Button
            className="bg-mustard border-none py-1 px-4 sm:ml-8 text-white rounded-xl"
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
            {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>

          <Button
            className="bg-red-500 border-none py-1 px-4 sm:ml-8 text-white rounded-xl"
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