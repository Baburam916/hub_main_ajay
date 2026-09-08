import { useEffect, useState } from "react";
import {
  Approve_single,
  Approve_single_multi,
  Approve_weight_dimension,
  Delete_Weight_airwaybill_no,
  Process_single_multi,
  Reject_single_multi,
  Reject_weight_dimension,
  Weight_dimension_airwaybill_no,
  delete_single_multi,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Table from "../../../components/Table";
import Lucide from "../../../base-components/Lucide";
import { ArrowLeft } from "lucide-react";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Trash2 } from "lucide-react";
import Modal from "../../../components/Modal";
export default function WeightDimensionAirwaybill(data: any) {
  const {
    scanApprove,
    setShowWeightDimensionList,
    handlewtdimlist,
    singleweightDimensionList,
  } = data;

  const { showAlert } = useAlert();
  const [scanWeightDimension, setScanWeightDimension] = useState<Array<any>>(
    [],
  );
  const [bookingWeightDimension, setBookingWeightDimension] = useState<
    Array<any>
  >([]);
  const [approveSpinner, setApproveSpinner] = useState<boolean>(false);
  const [rejectSpinner, setRejectSpinner] = useState<boolean>(false);
  const [spinnerApprove, setSpinnerApprove] = useState<boolean>(false);
  const [spinnerReject, setSpinnerReject] = useState<boolean>(false);
  const [spinnerProcess, setSpinnerProcess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAction, setIsAction] = useState<boolean>(false);
  const [actiondata, setActiondata] = useState<any>({});
  const [scanApproveAwb, setScanApproveAwb] = useState<any>();
  const [scanRejectAwb, setScanRejectAwb] = useState<any>();
  const [openModal3, setOpenModal3] = useState<boolean>(false);
  const [forWhat, setForWhat] = useState<any>();
  const [opendeleteModal3, setOpendeleteModal3] = useState<boolean>(false);
  const [deleteItems, setDeleteItems] = useState<any>();
  useEffect(() => {
    if (data.airwaybillNo != null)
      weightDimensionAirwaybillNo(data.airwaybillNo);
  }, [data.airwaybillNo]);

  const weightDimensionAirwaybillNo = async (airwaybillNo: string) => {
    try {
      const response = await Weight_dimension_airwaybill_no(airwaybillNo);
      if (response.status == 200) {
        setScanWeightDimension(
          response?.data?.data?.dimensions?.scan_dimension,
        );
        setBookingWeightDimension(
          response?.data?.data?.dimensions?.booking_dimension,
        );
      } else if (response.status == 204) {
        setScanWeightDimension([]);
        setBookingWeightDimension([]);
        showAlert("No data found!", "warning");
      } else showAlert(response.data.message, "error");
    } catch (error) {
      console.log(error);
      if (error) showAlert("something went wrong", "error");
    }
  };
  const handlecancel = () => {
    setActiondata({});
    setSpinnerApprove(false);
    setSpinnerReject(false);
  };
  const description2 = (
    <>
      <div className=" gap-2 mt-3 text-center">
        Are You Sure! , You want to perform this action?
      </div>
      <div className="text-end"></div>
    </>
  );
  const footer = (
    <>
      <Button
        disabled={spinnerApprove}
        //  onClick={()=> handleDateExport()
        onClick={() => {
          handlecancel();
        }}
        className="mt-2 mr-2 w-100 ml-0 p-[9px] bg-gray-400 text-white border-none rounded-xl"
      >
        Cancel
      </Button>
      <Button
        disabled={spinnerApprove || spinnerReject}
        //  onClick={()=> handleDateExport()
        onClick={() => {
          actiondata?.type == 0
            ? setSpinnerReject(true)
            : setSpinnerApprove(true);
          approveRejectAction(actiondata?.awb, actiondata?.type);
        }}
        className="mt-2 w-100 ml-0 p-[9px] bg-green-500 border-none text-white rounded-xl"
      >
        Submit
        {spinnerApprove ||
          (spinnerReject && <LoadingIcon icon="puff" className="ml-2" />)}
      </Button>
    </>
  );

  const deleteWeightAirwaybillNo = async (id: any) => {
    try {
      const response = await Delete_Weight_airwaybill_no(id);
      if (response.status == 200) {
        showAlert(response.data.message, "success");
        weightDimensionAirwaybillNo(data.airwaybillNo);
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      if (error) showAlert("something went wrong", "error");
    }
  };

  const deleteItem = async (item: any) => {
    try {
      const response = await delete_single_multi(item);

      if (response?.data?.status == 200) {
        showAlert(response?.data?.message, "success");
        weightDimensionAirwaybillNo(data.airwaybillNo);
        setOpendeleteModal3(false);
        // handlewtdimlist()
        // singleweightDimensionList(scanApprove.id)
      } else if (response?.response?.status == 406) {
        showAlert(response?.response?.data?.errors, "error");
      } else if (response?.response?.status == 404)
        showAlert(response?.response?.data?.errors, "warning");
      else if (response?.response?.status == 400)
        showAlert(response?.response?.data?.message, "warning");
      else {
        showAlert(response?.data?.message, "error");
      }
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong", "error");
    }
  };

  const scanDimensionColumns = [
    { field: "airwaybill_no", headerName: "AirwayBill No." },
    { field: "length", headerName: "Length(cms)" },
    { field: "width", headerName: "Width(cms)" },
    { field: "height", headerName: "Height(cms)" },
    { field: "weight", headerName: "Weigth(kgs)" },
    { field: "action", headerName: "Action" },
  ];

  const bookingDimensionColumns = [
    { field: "awb", headerName: "AirwayBill No." },
    { field: "length", headerName: "Length(cms)" },
    { field: "breadth", headerName: "Width(cms)" },
    { field: "height", headerName: "Height(cms)" },
    { field: "weight", headerName: "Weigth(kgs)" },
  ];

  const row = scanWeightDimension?.map((item: any) => {
    const actionButton = (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <p>
          <Trash2
            style={{ cursor: "pointer" }}
            onClick={() => {
              setOpendeleteModal3(true);
              setDeleteItems(item);
            }}
          />
        </p>
      </div>
    );
    return {
      ...item,
      length: Number(item?.length).toFixed(2) || "-",
      width: Number(item?.width).toFixed(2) || "-",
      height: Number(item?.height).toFixed(2) || "-",
      weight: Number(item?.weight).toFixed(2) || "-",
      action: actionButton,
    };
  });

  // const approveWeightDimension = async (id: number) => {
  //   setApproveSpinner(true);
  //   try {
  //     const response = await Approve_weight_dimension(id);
  //     if (response?.data?.status == 200) {
  //       showAlert(response.data.message, "success");
  //       weightDimensionAirwaybillNo(data.airwaybillNo);
  //     } else {
  //       showAlert(response?.data?.message, "error");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     showAlert("Something went wrong", "error");
  //   } finally {
  //     setApproveSpinner(false);
  //   }
  // };

  // const rejectWeightDimension = async (id: number) => {
  //   setRejectSpinner(true);
  //   try {
  //     const response = await Reject_weight_dimension(id);

  //     if (response?.data?.status == 200) {
  //       showAlert(response.data.message, "success");
  //       weightDimensionAirwaybillNo(data.airwaybillNo);
  //     } else {
  //       showAlert(response?.data?.message, "error");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     showAlert("Something went wrong", "error");
  //   } finally {
  //     setRejectSpinner(false);
  //   }
  // };

  const approveRejectAction = async (awb: any, action: any) => {
    try {
      setSpinnerApprove(true);
      setSpinnerReject(true);
      const response = await Approve_single_multi(awb, action);
      if (response?.status == 200) {
        showAlert(response?.data?.message);
        handlewtdimlist();
        singleweightDimensionList(scanApprove.id);
        setShowWeightDimensionList(false);
        handlecancel();
      } else if (response?.response?.status == 406) {
        showAlert(response?.response?.data?.errors, "error");
      } else if (response?.data?.status == 203) {
        showAlert(response?.data?.message, "error");
        handlewtdimlist();
        setShowWeightDimensionList(false);
      } else if (response?.response?.status == 404) {
        showAlert(response?.response?.data?.errors, "warning");
      } else if (response?.response?.status == 400) {
        showAlert(response?.response?.data?.message, "warning");
      } else if (response?.response?.status == 500) {
        showAlert("Network Error", "error");
      } else {
        showAlert(response?.data?.message, "error");
      }
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong", "error");
    } finally {
      setSpinnerApprove(false);
      setSpinnerReject(false);
    }
  };

  const ModalDescription3 = (
    <>
      <div className="col-span-12 text-center">
        {" "}
        Are you Sure, you want to{" "}
        <strong className="text-mustard">{forWhat}</strong> it?
      </div>
    </>
  );

  //  Modal footer

  const ModalFooter3 = (
    <>
      <Button
        type="button"
        variant="outline-secondary"
        onClick={() => {
          setOpenModal3(false);
        }}
        className="w-20 p-2 ml-2"
      >
        Cancel
      </Button>
      {forWhat == "APPROVE" ? (
        <Button
          variant="mustard"
          type="button"
          disabled={spinnerApprove}
          onClick={(e: any) => approveRejectAction(scanApproveAwb, 1)}
          className="w-20 p-2 ml-2"
        >
          Approve{" "}
          {spinnerApprove && <LoadingIcon icon="puff" className="ml-2" />}
        </Button>
      ) : forWhat == "REJECT" ? (
        <Button
          type="button"
          disabled={spinnerReject}
          onClick={(e: any) => approveRejectAction(scanApproveAwb, 0)}
          className="w-20 p-2 ml-2 bg-red-600 text-white"
        >
          Reject {spinnerReject && <LoadingIcon icon="puff" className="ml-2" />}
        </Button>
      ) : (
        ""
      )}
    </>
  );
  const ModalDeleteDescription3 = (
    <div className="col-span-12 text-center">
      Are you sure, you want to <strong className="text-mustard">DELETE</strong>{" "}
      it?
    </div>
  );
  const ModalDeleteFooter3 = (
    <>
      <Button
        type="button"
        variant="outline-secondary"
        onClick={() => {
          setOpendeleteModal3(false);
        }}
        className="w-20 p-2 ml-2"
      >
        Cancel
      </Button>

      <Button
        type="button"
        disabled={spinnerApprove}
        onClick={() => deleteItem(deleteItems)}
        className="w-20 p-2 ml-2 bg-red-600 text-white"
      >
        Delete {spinnerApprove && <LoadingIcon icon="puff" className="ml-2" />}
      </Button>
    </>
  );
  const processAction = async (data: any) => {
    try {
      setSpinnerProcess(true);
      const response = await Process_single_multi(data?.airwaybill_no);

      if (response?.data?.status == 200) {
        showAlert(response?.data?.message);
        // singleweightDimensionList(scanApprove.id);
      }
      if (response?.response?.status == 406)
        showAlert(response?.response?.data?.errors, "error");
      else if (response?.response?.status == 404)
        showAlert(response?.response?.data?.errors, "warning");
      else if (response?.response?.status == 400)
        showAlert(response?.response?.data?.message, "warning");
      else showAlert(response?.data?.message, "error");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong", "error");
    } finally {
      setSpinnerProcess(false);
    }
  };
  console.log(scanApprove);

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div
              className="p-2 mb-2 cursor-pointer rounded-full shadow-lg mr-4"
              onClick={() => setShowWeightDimensionList(false)}
            >
              <ArrowLeft className="w-5 h-4" />
            </div>
            <h1 className="font-bold text-lg">Compare Dimensions</h1>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
          <div className="sm:flex justify-between items-center mb-4">
            <h1 className="font-bold text-lg">Scan Dimensions</h1>

            <div className="flex items-center">
              <div className="relative flex justify-between items-center">
                {(scanApprove?.type == 1 || scanApprove?.type == 2) &&
                scanApprove?.is_approved == 1 ? (
                  <p style={{ color: "green" }}>Approved</p>
                ) : (
                  scanApprove?.is_approved == null && (
                    <Button
                      onClick={() => {
                        // setSpinnerApprove(true);
                        setOpenModal3(true);
                        setScanApproveAwb(scanApprove?.airwaybill_no);
                        setForWhat("APPROVE");
                        // approveRejectAction(scanApprove?.airwaybill_no, 1);
                      }}
                      className="px-2 py-1 rounded border border-green-500 text-green-500 hover:bg-green-200 focus:outline-none focus:bg-green-200"
                      disabled={spinnerApprove}
                    >
                      Approve{" "}
                    </Button>
                  )
                )}

                {(scanApprove?.type == 1 || scanApprove?.type == 2) &&
                scanApprove?.is_approved == 0 ? (
                  <p style={{ color: "red" }}>Rejected</p>
                ) : (
                  scanApprove?.is_approved == null && (
                    <Button
                      onClick={() => {
                        // setSpinnerReject(true);
                        setOpenModal3(true);
                        setForWhat("REJECT");
                        setScanRejectAwb(scanApprove?.airwaybill_no);
                        // approveRejectAction(scanApprove?.airwaybill_no, 0);
                      }}
                      className="ml-2 px-2 py-1 rounded border border-red-500 text-red-500 hover:bg-red-200 focus:outline-none focus:bg-red-200"
                      disabled={spinnerReject}
                    >
                      Reject{" "}
                    </Button>
                  )
                )}
                {scanApprove?.is_approved == 2 && scanApprove?.type == 1 ? (
                  <Button
                    disabled
                    className="ml-2 px-2 py-1 rounded border border-blue-500 text-blue-500 hover:bg-red-200 focus:outline-none focus:bg-red-200"
                  >
                    Processing{" "}
                  </Button>
                ) : (
                  ""
                )}

                {scanApprove?.is_approved == 2 &&
                scanApprove?.expires_at &&
                new Date() > new Date(scanApprove?.expires_at) &&
                (scanApprove?.type == 2 || scanApprove?.type == 1) ? (
                  <Button
                    disabled={spinnerProcess}
                    onClick={() => {
                      processAction(scanApprove);
                    }}
                    className="ml-2 px-2 py-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-200 focus:outline-none focus:bg-blue-200"
                  >
                    Approve by ops team
                    {spinnerProcess && (
                      <LoadingIcon icon="puff" className="ml-2" />
                    )}
                  </Button>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>

          {scanWeightDimension.length > 0 ? (
            <Table columns={scanDimensionColumns} row={row} />
          ) : (
            <p className="text-gray-400 text-center">No Data Found!</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h1 className="font-bold text-lg">Booking Dimensions</h1>

          {bookingWeightDimension.length > 0 ? (
            <Table
              columns={bookingDimensionColumns}
              row={bookingWeightDimension}
            />
          ) : (
            <p className="text-gray-400 text-center">No Data Found!</p>
          )}
        </div>
        <Modal
          description={ModalDescription3}
          footer={ModalFooter3}
          open={openModal3}
          setOpen={setOpenModal3}
          size="md"
          title=""
        />
        <Modal
          description={ModalDeleteDescription3}
          footer={ModalDeleteFooter3}
          open={opendeleteModal3}
          setOpen={setOpendeleteModal3}
          size="md"
          title=""
        />
      </div>
      <Modal
        open={isAction}
        setOpen={setIsAction}
        title="confirmation"
        size="md"
        handleCancel={handlecancel}
        description={description2}
        footer={footer}
      />
    </>
  );
}
