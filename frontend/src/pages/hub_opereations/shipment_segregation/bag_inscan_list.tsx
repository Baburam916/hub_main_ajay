import { useEffect, useState } from "react";
import { useAlert } from "../../../ContextProvider/AlertContext";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import {
  SegregationScanAirwaybill,
  ShortShipmentData,
} from "../../../DataTypes/dataTypes";
import {
  Segregation_inscan_airwaybill,
  Short_shipment,
  Status_code_list,
} from "../../../AllServices/services";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import LoadingIcon from "../../../base-components/LoadingIcon";

export default function BagInscanList(data: any) {
  const { showAlert } = useAlert();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [checkedIds, setCheckedIds] = useState<Array<any>>([]);
  const [statusList, setStatusList] = useState<Array<any>>([]);
  const [heldUpReason, setHeldUpReason] = useState<any>(-1);
  // const [openHoldList, setOpenHoldList] = useState<boolean>(false);
  const [airwaybillNumber, setAirwaybillNumber] = useState<any>(null);
  const [otherReason, setOtherReason] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false);

  useEffect(() => {
    const getStatusList = async () => {
      try {
        const response = await Status_code_list();
        if (response.status == 200) setStatusList(response.data.data);
        else if (response?.response?.status === 204) {
          showAlert("No data found!", "warning");
        } else showAlert(response.data.message, "error");
      } catch (error) {
        console.log(error);
        showAlert("Something went wrong with status list!", "error");
      }
    };

    getStatusList();
  }, []);

  // useEffect(() => {
  //   if (openModal == false) {
  //     setOpenHoldList(false);
  //     setHeldUpReason(-1);
  //   }
  // }, [openModal]);

  const columns = [
    { field: "airwaybill_no", headerName: "Airwaybill No." },
    { field: "weight", headerName: "Weight" },
    { field: "status", headerName: "Status" },
    {
      field: "select",
      headerName: "Select Shipment",
    },
  ];

  const row = data.bagInscanList?.map((item: any) => {
    let isStatusText;
    let text = (data: any) => (
      <p className={`px-2 py-1 rounded bg-${data.bgColor} text-white`}>
        {data.value}
      </p>
    );

    switch (item.dispatch_status_code) {
      case "203":
        isStatusText = text({ value: "Short Shipment", bgColor: "red-500" });
        break;
      case "205":
        isStatusText = text({ value: "Hold", bgColor: "red-500" });
        break;
      case "201":
        isStatusText = text({ value: "Pending", bgColor: "blue-600" });
        break;
      default:
        isStatusText = text({ value: "Scanned", bgColor: "green-500" });
    }

    const SelectId = (
      <FormCheck>
        <FormCheck.Input
          onChange={(e) => {
            if (e.target.checked)
              setCheckedIds((prev) => [...prev, item.pickup_id]);
            else
              setCheckedIds(checkedIds.filter((val) => val != item.pickup_id));
          }}
          id="vertical-form-3"
          type="checkbox"
          value=""
        />
      </FormCheck>
    );

    return {
      ...item,
      select: item.dispatch_status_code == 201 ? SelectId : null,
      weight: <p className="text-end">{`${item.actual_weight}${item.weight_unit}`}</p>,
      status: isStatusText,
    };
  });

  const shortShipment = async () => {
    const shortShipmentData: ShortShipmentData = {
      pickup_ids: checkedIds,
    };
    let response;
    try {
      response = await Short_shipment(
        { emp_id: data.emp_id, hub_id: data.hub_id },
        shortShipmentData
      );
      if (response.status == 200) {
        data.bagInscan(data.bagNumber);
        showAlert(response.data.message, "success");
        data.setShowBagInscanList(false);
      } else showAlert(response.data.message, "error");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    }
  };

  const shipmentInscan = async () => {
    // if (heldUpReason == 264 && !otherReason) {
    //   showAlert("Please fill the reason", "error");
    //   return;
    // }
    const segregationScanAirwaybill: SegregationScanAirwaybill = {
      airwaybill_no: airwaybillNumber,
      held_up_reason: -1,
      // ...(Number(heldUpReason) == 264 ? { other_reason: otherReason } : {}),
    };
    setSpinner(true);
    let response;
    try {
      response = await Segregation_inscan_airwaybill(
        { emp_id: data.emp_id, hub_id: data.hub_id },
        segregationScanAirwaybill
      );
      // setOpenHoldList(false);
      if (response.status == 200) {
        // setOpenModal(false);
        data.bagInscan(data.bagNumber);
        showAlert(response.data.message, "success");
        setAirwaybillNumber("");
        // setHeldUpReason(-1);
        // setOtherReason("");
      } else showAlert(response.data.message, "warning");
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
    const segregationScanAirwaybill: SegregationScanAirwaybill = {
      airwaybill_no: airwaybillNumber,
      held_up_reason: heldUpReason,
      ...(Number(heldUpReason) == 264 ? { other_reason: otherReason } : {}),
    };
    setSpinner(true);
    let response;
    try {
      response = await Segregation_inscan_airwaybill(
        { emp_id: data.emp_id, hub_id: data.hub_id },
        segregationScanAirwaybill
      );
      // setOpenHoldList(false);
      if (response.status == 200) {
        setOpenModal(false);
        data.bagInscan(data.bagNumber);
        showAlert(response.data.message, "success");
        setAirwaybillNumber("");
        setHeldUpReason(-1);
        setOtherReason("");
      } else showAlert(response.data.message, "warning");
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
            disabled={openHoldList}
            onClick={() => shipmentInscan()}
          >
            Inscan
            <br />
            (Paperwork Clear)
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
              onChange={(e) => {
                setOtherReason(e.target.value);
              }}
            ></FormTextarea>
          </div>
        )}
        <Button
          className="bg-mustard border-none py-1 px-4 mt-4 text-white rounded-xl"
          onClick={() => shipmentHold()}
        >
          Submit {spinner && <LoadingIcon icon="puff" className="ml-2" />}
        </Button>
      </div>
      {/* </>
        )}
      </div> */}
    </>
  );

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 px-6 py-3 bg-white rounded-lg shadow-lg">
        <div className="flex items-center">
          <div
            className="p-2 mb-2 cursor-pointer rounded-full shadow-lg mr-4"
            onClick={() => data.setShowBagInscanList(false)}
          >
            <ArrowLeft className="w-5 h-4" />
          </div>
          <div className="flex justify-between w-[100%]">
            <h1 className="text-base text-gray-500 font-bold">Bag Inscan</h1>
            <div className="flex justify-end items-center">
              <h1 className="mt-2 font-bold">Next Create Bag</h1>
              <div className="p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2">
                <Link to="/hub/operation/create_bag" className="font-bold">
                  <ArrowRight className="w-5 h-4 " />
                </Link>
              </div>
            </div>
          </div>
          <hr />
        </div>
        <div className="mt-4 flex">
          <FormInput
            placeholder="Airwaybill No."
            className="w-60 ml-4"
            value={airwaybillNumber}
            onChange={(e) => setAirwaybillNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // if (airwaybillNumber) setOpenModal(true);
                // else showAlert("Airwaybill number is required!", "warning");
                shipmentInscan()
              }
            }}
          />
          <Button
            className="bg-mustard border-none py-1 px-4 ml-8 text-white rounded-xl"
            onClick={() => {
              // if (!airwaybillNumber) {
              //   showAlert("Fill the Airwaybil No", "error");
              //   setOpenModal(false);
              // } else {
              //   setOpenModal(true);
              //   setOpenHoldList(false);
              //   setHeldUpReason(-1);
              //   setOtherReason(null);
              // }
              shipmentInscan()
            }}
          >
            Inscan Shipment {spinner && <LoadingIcon icon="puff" className="ml-2" />}
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
        <Table columns={columns} row={row} heightTable="28.5vh" />
        <Button
          className="bg-red-500 border-none py-1 px-4 mt-3 text-white rounded-xl"
          onClick={() => shortShipment()}
        >
          Short Shipment
        </Button>
      </div>
      <Modal
        open={openModal}
        title="Inscan Shipment"
        size="md"
        setOpen={setOpenModal}
        description={description}
        footer={null}
      />
    </>
  );
}
