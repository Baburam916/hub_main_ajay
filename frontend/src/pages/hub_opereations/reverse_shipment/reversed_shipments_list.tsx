import { useEffect, useState } from "react";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Table from "../../../components/Table";
import Button from "../../../base-components/Button";
import {
  Reverse_shipment_inscan,
  Status_code_list,
} from "../../../AllServices/services";
import {
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "../../../base-components/Form";
import { Search } from "lucide-react";
import { ReverseShipmentInscanData } from "../../../DataTypes/dataTypes";
import Modal from "../../../components/Modal";
import LoadingIcon from "../../../base-components/LoadingIcon";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";

export default function ReverseShipmentAirwaybill(data: any) {
  const { showAlert } = useAlert();
  const [airwaybillNo, setAirwaybillNo] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [otherReason, setOtherReason] = useState<any>(null);
  const [heldUpReason, setHeldUpReason] = useState<any>(-1);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openHoldList, setOpenHoldList] = useState<boolean>(false);
  const [statusList, setStatusList] = useState<Array<any>>([]);

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

  const columns = [
    { field: "airwaybill_no", headerName: "AirwayBill No." },
    { field: "remark", headerName: "Remarks" },
    { field: "created_date", headerName: "Reversed Date" },
    { field: "action", headerName: "Held Up/Inscan" },
  ];

  const row = data.reversedShipmentsList.map((item: any) => {
    const actionButton = (
      <Button
        onClick={() => {
          setAirwaybillNo(item.airwaybill_no);
          setOpenModal(true);
        }}
        className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-200"
      >
        Inscan Shipment
      </Button>
    );

    return {
      ...item,
      action: actionButton,
    };
  });

  const reverseShipmentInscan = async () => {
    if(heldUpReason == 264 && !otherReason){
      showAlert('Please fill the reason', "error");
      return;
    }
    setSpinner(true);
    const reverseShipmentInscanData: ReverseShipmentInscanData = {
      airwaybill_no: airwaybillNo,
      held_up_reason: heldUpReason,
      ...(Number(heldUpReason) == 264 ? { other_reason: otherReason } : {}),
    };

    let response;
    try {
      response = await Reverse_shipment_inscan(
        { emp_id: data.emp_id, hub_id: data.hub_id },
        reverseShipmentInscanData
      );
      setOpenHoldList(false);
      setOpenModal(false);
      if (response.status == 200) {
        showAlert(response.data.message, "success");
        data.getReversedShipmentList();
        setHeldUpReason(-1);
        setOtherReason("");
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert("Something went wrong!", "error");
    } finally {
      setOtherReason("");
      setSpinner(false);
    }
  };

  const description = (
    <>
      <div>
        <h1>Direct Shipment Paper work</h1>
        <h1 className="text-sm sm:text-[25px] text-center p-4">
          Airwaybill No - {airwaybillNo}
        </h1>
      </div>
      <div>
        <div className="flex justify-between">
          <Button
            className="bg-danger border-none px-1 py-1 sm:py-2 sm:px-4 text-white rounded-xl hover:bg-[#c9302c] focus:ring-4 focus:ring-opacity-70"

            onClick={() => {setOpenHoldList(!openHoldList);setHeldUpReason(-1);setOtherReason(null)}}
          >
            Hold
            <br />
            (Paperwork Not Clear)
          </Button>
          <Button
            className="bg-[#14d28b] border-none py-2 px-4 text-white rounded-xl hover:bg-[#169F85] focus:ring-4 focus:ring-opacity-70"
            disabled={openHoldList || spinner}
            onClick={() => reverseShipmentInscan()}
          >
            Inscan
            <br />
            (Paperwork Clear)
            {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>
        </div>
        {openHoldList && (
          <>
            <div className="mt-4">
              <FormLabel htmlFor="modal-form-6">Select Hold Reason</FormLabel>
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
                  <FormLabel>Reason</FormLabel><span className="text-red-500 ml-2">*</span>
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
                disabled={spinner}
                className="bg-mustard border-none py-1 px-4 mt-4 text-white rounded-xl"
                onClick={() => reverseShipmentInscan()}
              >
                Submit
                {spinner && <LoadingIcon icon="puff" className="ml-2" />}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 py-3 px-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-bold text-lg">Reversed Shipments</h1>
          <div className="relative flex justify-between items-center">
            <FormInput
              placeholder="Search..."
              className="pr-8 pt-1 pb-1 rounded-xl"
              value={data?.manifestSearch}
              onChange={(e) => {
                data?.setManifestSearch(e.target.value.toUpperCase());
                data?.getReversedShipmentList();
                data?.setPage(1);
              }}
            />
            <Search className="absolute right-1 w-5 h-5" />
          </div>
        </div>
        <hr />
        <div className="bg-white p-1 mt-2">
          {data.reversedShipmentsList.length > 0 ? (
            <>
              <Table columns={columns} row={row} heightTable="28.5vh" />
              <CommonPagination
                totalpages={data?.totalpages}
                onPageChange={data?.handlePagechange}
                page={data?.page}
              />
            </>
          ) : (
            <>
              <h1 className="font-400 text-md">Shipment List</h1>{" "}
              <p className="text-gray-400 text-center">No Data Found!</p>
            </>
          )}
        </div>
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
