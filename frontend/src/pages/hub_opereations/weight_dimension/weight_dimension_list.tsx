import { Download, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Lucide from "../../../base-components/Lucide";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Table from "../../../components/Table";
import {
  Approve_single_multi,
  common_get,
  Get_franchise,
  Get_hub_info,
  Process_single_multi,
  Weight_dimension_export,
  Weight_dimension_list,
} from "../../../AllServices/services";
import Modal from "../../../components/Modal";
import { useDebounce } from "../../../components/Search";
import CommonPagination from "../../../components/Pagination";
import { formatDate, getCurrentDate, indianFormat } from "../../../utils";
import Button from "../../../base-components/Button";
import Modal1 from "../../../components/Modal";
import { WeightDimenstionExport } from "../../../DataTypes/dataTypes";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { unparse } from "papaparse";
import IsLoading from "../../../components/Isloading/isLoading";
import { useNavigate } from "react-router-dom";

export default function WeightDimensionList(data: any) {
  const {
    handlewtdimlist,
    manifestSearch,
    setManifestSearch,
    debouncedSearchTerm,
    page,
    setPage,
    limit,
    setLimit,
    totalpages,
    setTotalPages,
    getList,
    setGetList,
    scanApprove,
    singleweightDimensionList,
  } = data;

  const { showAlert } = useAlert();

  const [openModal, setOpenModal] = useState(false);
  const [openModal1, setOpenModal1] = useState(false);
  const [imageLink, setImageLink] = useState("");
  const [franchiseeData, setFranchiseeData] = useState<Array<any>>([]);
  const [amtToPayList, setAmtToPayList] = useState<Array<any>>([]);
  const [csvSpinner, setCsvSpinner] = useState<boolean>(false);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [toDate, setToDate] = useState<any>();
  const [fromDate, setFromDate] = useState<any>();
  const [breached, setBreached] = useState<any>();
  const [printCsvData, setPrintCsv] = useState<Array<any>>([]);
  const [currentDate, setCurrentDate] = useState<any>(getCurrentDate());
  const [spinnerApprove, setSpinnerApprove] = useState<boolean>(false);
  const [spinnerReject, setSpinnerReject] = useState<boolean>(false);
  const [spinnerProcess, setSpinnerProcess] = useState<boolean>(false);
  const [approveloading, setApproveloading] = useState<any>();
  const [rejectloading, setRejectloading] = useState<any>();
  const [threshold, setThreshold] = useState<any>();
  const [hubLocation, setHubLocation] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [openAccRejectModal, setOpenAccRejectModal] = useState<any>();
  const [forWhat, setForwhat] = useState<any>();
  const [approveItem, setApproveItem] = useState<any>();
  const [rejectItem, setRejectItem] = useState<any>();
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const [isemirates, setIsEmirates] = useState<boolean>(false);
  const [actiondata, setActiondata] = useState<any>({});
  const navigate = useNavigate();

  const { handleApprove } = data;

  const weightDimensionList = async () => {
    setLoading(true);
    try {
      const response = isemirates
        ? await common_get(
            `/hub/weight_dimension/${data?.user_id}?emirates=1`,
            {
              params: {
                awb: debouncedSearchTerm,
                limit: limit,
                offset: page - 1,
              },
            },
          )
        : await Weight_dimension_list(
            data.user_id,
            debouncedSearchTerm,
            limit,
            page - 1,
          );
      if (response.status == 200) {
        setGetList(response.data.data);
        setTotalPages(Math.ceil(response?.data?.count / limit));
      } else if (response.status == 204) {
        showAlert("No data found!", "warning");
        setGetList([]);
      } else {
        setGetList([]);
        showAlert(response.data.message, "warning");
      }
    } catch (error) {
      setGetList([]);
      if (error) showAlert("something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePagechange = (e: number) => {
    setPage(e);
  };

  const getHubName = async () => {
    const response = await Get_hub_info(hub_id);
    setHubLocation(response?.data?.data?.[0]?.hub_name);
  };

  const handleDateExport = async () => {
    setSpinner(true);
    const weightDimentionExport: WeightDimenstionExport = {
      from_date: fromDate,
      to_date: toDate,
      shipment_status: breached,
    };
    let response;
    try {
      response = await Weight_dimension_export(weightDimentionExport);
      setBreached(response?.data?.data);
    } catch (error) {
    } finally {
      setSpinner(false);
    }
  };
  const convertJSONtoCSV = async (data: any[] = [], fileName: string) => {
    // try {
    setCsvSpinner(true);
    const csv = unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove(); // Use remove() instead of removeChild
    // } catch (error: any) {
    // console.error("Error converting JSON to CSV:", error.message);
    setCsvSpinner(false);
    // }finally{
    //     setCsvSpinner(false);
    // }
  };
  const handlecancel = () => {
    setActiondata({});
    setSpinnerApprove(false);
    setSpinnerReject(false);
    setRejectloading(false);
    setApproveloading(false);
  };

  const formatData = (data: any) => {
    if (!data?.length > 0) return [{ "No Data Found": "" }];

    return data?.map((item: any, index: number) => ({
      "Sr. No.": `${index + 1}.`,
      "Shipping Id": item?.shipment_id,
      "Booking Date": formatDate(item?.booking_date),
      "Booking Weight": `${item?.booking_weight} kgs`,
      "Scanned Weight": `${item?.scanned_weight} kgs`,
      "Weight Difference": `${item?.weight_difference}`,
      Type: item.type == 1 ? "Single" : "Multiple",
      "Hub Location": hubLocation, // Ensure hubLocation is defined in scope
      "Scanned Date": formatDate(item?.scanned_date),
      "Threshold Breached": item?.threshold_breach,
      Status: item?.status == null ? "No Action" : item?.status,
    }));
  };

  const csvDataForPrint = async () => {
    setSpinner(true);
    const weightDimentionExport: WeightDimenstionExport = {
      from_date: fromDate,
      to_date: toDate,
      shipment_status: breached,
    };
    let response;
    try {
      response = await Weight_dimension_export(weightDimentionExport);
      // setBreached(response?.data?.data)
      if (response?.status == 200) {
        // setPrintCsv(response?.data?.data);
        // debugger;
        convertJSONtoCSV(
          formatData(response?.data?.data),
          "weight_dimensions.csv",
        );
        // setPrintCsv([])
      } else if (response?.status == 204) {
        setPrintCsv([]);
      } else {
        showAlert("Something went wrong!", "error");
      }
    } catch (err: any) {
      console.error("Error fetching CSV data:", err);
    } finally {
      setSpinner(false);
    }
  };

  const approveRejectAction = async (awb: any, action: any) => {
    try {
      setSpinnerApprove(true);
      setSpinnerReject(true);
      const response = await Approve_single_multi(awb, action);

      if (response?.status == 200) {
        showAlert(response?.data?.message);
        setForwhat("");
        setOpenAccRejectModal(false);

        handlewtdimlist();
        handlecancel();
        singleweightDimensionList(scanApprove?.id);
      } else if (response?.response?.status == 406) {
        showAlert(response?.response?.data?.errors, "error");
      } else if (response?.data?.status == 203) {
        showAlert(response?.data?.message, "error");
        setForwhat("");
        setOpenAccRejectModal(false);
        handlewtdimlist();
        // setShowWeightDimensionList(false);
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

  const thresholdfunc = async () => {
    try {
      const res = await Get_hub_info(hub_id);
      setThreshold(res?.data?.data[0]?.threshold_limit);
    } catch (err: any) {
      console.log(err);
    }
  };

  const getFranchiseeData = async () => {
    try {
      const response = await Get_franchise();
      if (response.status == 200) {
        setFranchiseeData(response.data.data);
      } else {
        setFranchiseeData([]);
      }
    } catch (error) {
      setFranchiseeData([]);
    }
  };

  useEffect(() => {
    getHubName();
    getFranchiseeData();
    thresholdfunc();
    // handlewtdimlist();
  }, []);

  useEffect(() => {
    weightDimensionList(data.user_id);

    const fetchAmountToPay = async () => {
      try {
        const AmountToPay = await common_get(
          `/hub/weight_dimension/shipment/rates/${data.user_id}?limit=${limit}&offset=${page - 1}&awb=${debouncedSearchTerm}`,
        );
        if (AmountToPay.status == 200 && AmountToPay.data?.data?.length > 0) {
          setAmtToPayList(AmountToPay.data.data);
        } else {
          setAmtToPayList([]);
        }
      } catch (error) {
        setAmtToPayList([]);
      }
    };
    fetchAmountToPay();
  }, [debouncedSearchTerm, data.user_id, page, limit, isemirates]);

  const handleLimitChange = (e: any) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const description = (
    <>
      <img
        className="w-full h-full m-0 p-0"
        src={imageLink}
        alt="Scanned Image"
      />
    </>
  );
  const description1 = (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
        <div>
          <FormLabel htmlFor="regular-form-1">
            <strong>From Date</strong>
          </FormLabel>
          <FormInput
            id="regular-form-1"
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e: any) => setFromDate(e.target.value)}
            placeholder="Search..."
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">
            <strong>To Date</strong>
          </FormLabel>
          <FormInput
            id="regular-form-1"
            type="date"
            value={toDate}
            min={fromDate}
            max={getCurrentDate()}
            onChange={(e: any) => setToDate(e.target.value)}
            placeholder="Search..."
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">
            <strong>Shipment Type</strong>
          </FormLabel>
          <FormSelect
            className=""
            value={breached}
            onChange={(e) => setBreached(e.target.value)}
          >
            <option>Select One</option>
            <option value="1">Breached</option>
            <option value="0">Not Breached</option>
            {/* {statusList.map((val) => {
                  return <option value={val.status_code}>{val.status}</option>;
                })} */}
          </FormSelect>
        </div>
      </div>
      <div className="text-end">
        <Button
          disabled={spinner}
          //  onClick={()=> handleDateExport()
          onClick={() => csvDataForPrint()}
          className="mt-2 w-100 ml-0 p-[9px] bg-green-500 border-none text-white rounded-xl"
        >
          Export CSV {spinner && <LoadingIcon icon="puff" className="ml-2" />}
        </Button>
      </div>
    </>
  );

  const descriptionAccReject1 = (
    <div className="flex flex-col items-center">
      {/* Icon + Title */}

      {/* Description */}
      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to{" "}
        <strong className="text-mustard">{forWhat}</strong> it?
      </p>

      {/* Buttons */}
    </div>
  );
  const footerAccReject = (
    <div className="flex justify-end gap-3">
      <Button
        onClick={() => setOpenAccRejectModal(false)}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
      >
        Cancel
      </Button>

      {forWhat == "APPROVED" ? (
        <Button
          className="px-4 py-2 bg-success text-white rounded"
          onClick={() => approveRejectAction(approveItem, 1)}
          disabled={spinnerApprove}
        >
          Accept{" "}
          {spinnerApprove ? <LoadingIcon icon="puff" className="ml-2" /> : ""}
        </Button>
      ) : forWhat == "REJECTED" ? (
        <Button
          disabled={spinnerReject}
          className="px-4 py-2 bg-red-700 text-white rounded"
          onClick={() => approveRejectAction(rejectItem, 0)}
        >
          Reject{" "}
          {spinnerReject ? <LoadingIcon icon="puff" className="ml-2" /> : ""}
        </Button>
      ) : (
        ""
      )}
    </div>
  );
  const processAction = async (data: any) => {
    try {
      setSpinnerProcess(true);
      const response = await Process_single_multi(data?.airwaybill_no);

      if (response?.data?.status == 200) {
        showAlert(response?.data?.message, "success");
        handlewtdimlist();
        if (response?.data?.redirect)
          window.open(response?.data?.redirect, "_blank");
      }
      if (response?.response?.status == 406) {
        showAlert(response?.response?.data?.errors, "error");
      } else if (response?.response?.status == 404)
        showAlert(response?.response?.data?.errors, "warning");
      else if (response?.response?.status == 400) {
        handlewtdimlist();
        if (response?.data?.redirect)
          window.open(response?.response?.data?.redirect, "_blank");
      } else {
        showAlert(response?.data?.message, "error");
      }
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong", "error");
    } finally {
      setSpinnerProcess(false);
    }
  };
  const columns = [
    { field: "image", headerName: "Image" },
    { field: "airwaybill_no", headerName: "AirwayBill No." },
    { field: "franchisee_name", headerName: "Customer" },
    // { field: "width", headerName: "Width(cms)" },
    // { field: "height", headerName: "Height(cms)" },
    // { field: "weight", headerName: "Weigth(kgs)" },
    // { field: "volume", headerName: "Volume" },
    // { field: "vol_weight", headerName: "Volume Weight(kgs)" },
    { field: "lwh", headerName: "L(cms) X B(cms) X H(cms)" },
    { field: "chargeable_weight", headerName: "Chargable WT." },
    { field: "machine_weight", headerName: "Machine WT." },
    { field: "difference", headerName: "Weight Diff" },
    ...(amtToPayList?.length > 0
      ? [{ field: "amount_to_pay", headerName: "Amount To Pay" }]
      : []),
    { field: "created_date", headerName: "Scan Date" },
    { field: "is_approved", headerName: "Status" },
    { field: "type", headerName: "Type" },
    { field: "action", headerName: "Action" },
  ];

  const row = getList?.map((item: any) => {
    isemirates && delete item["difference"];
    const matchedAmount = amtToPayList?.find(
      (amt: any) => amt?.airwaybill_no == item?.airwaybill_no,
    );
    const actionButton = (
      <>
        <div className="flex">
          <Lucide
            onClick={() => {
              handleApprove(item);
              data?.setAirwaybillNo(item.airwaybill_no);
              data?.setShowWeightDimensionList(true);
            }}
            icon="Eye"
            className="text-blue-500 stroke-2 h-5 cursor-pointer"
          />
          {(item?.type == 1 || item?.type == 2) && item?.is_approved == 1 ? (
            <p className="ml-2 px-2 py-1 " style={{ color: "green" }}>
              Approved
            </p>
          ) : (
            item?.is_approved == null && (
              <Button
                onClick={() => {
                  setForwhat("APPROVED");
                  setOpenAccRejectModal(true);
                  setApproveItem(item?.airwaybill_no);
                  // approveRejectAction(item?.airwaybill_no, 1);
                  setApproveloading(item?.id);
                }}
                className="ml-2 px-2 py-1rounded border border-green-500 text-green-500 hover:bg-green-200 focus:outline-none focus:bg-green-200"
                // disabled={spinnerApprove && item?.id}
              >
                Approve{" "}
              </Button>
            )
          )}
          {(item?.type == 1 || item?.type == 2) && item?.is_approved == 0 ? (
            <p className="ml-2 px-2 py-1" style={{ color: "red" }}>
              Rejected
            </p>
          ) : (
            item?.is_approved == null && (
              <Button
                onClick={() => {
                  setForwhat("REJECTED");
                  setOpenAccRejectModal(true);
                  setRejectItem(item?.airwaybill_no);
                  // approveRejectAction(item?.airwaybill_no, 0);
                  setRejectloading(item?.id);
                }}
                className="ml-2 px-2 py-1 rounded border border-red-500 text-red-500 hover:bg-red-200 focus:outline-none focus:bg-red-200"
                // disabled={spinnerReject}
              >
                Reject{" "}
              </Button>
            )
          )}

          {item?.is_approved == 2 &&
          item?.expires_at &&
          new Date() > new Date(item?.expires_at) &&
          (item?.type == 2 || item?.type == 1) ? (
            <Button
              disabled={spinnerProcess}
              onClick={() => processAction(item)}
              className="ml-2 px-2 py-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-200 focus:outline-none focus:bg-blue-200"
            >
              Approve by ops team
              {spinnerProcess && <LoadingIcon icon="puff" className="ml-2" />}
            </Button>
          ) : (
            ""
          )}
        </div>
      </>
    );

    return {
      ...item,
      franchisee_name: franchiseeData?.find(
        (val) => val.franchisee_id == item.franchisee_id,
      )?.franchisee_name,
      is_approved:
        item?.is_approved == 3 ? (
          <p className={`px-2 py-1 rounded bg-blue-600 text-white`}>
            Approved by Ops Team
          </p>
        ) : item?.threshold == 1 ? (
          <p className={`px-2 py-1 rounded bg-blue-600 text-white`}>
            Approved by Customer
          </p>
        ) : item?.is_approved == 0 ? (
          <p className={`px-2 py-1 rounded bg-red-500 text-white`}>Rejected</p>
        ) : item?.is_approved == 1 ? (
          <p className={`px-2 py-1 rounded bg-green-500 text-white`}>
            Approved
          </p>
        ) : item?.is_approved == 2 ? (
          <p className={`px-2 py-1 rounded bg-blue-600 text-white`}>
            Processing
          </p>
        ) : (
          <p className={`px-2 py-1 rounded bg-mustard text-white`}>No Action</p>
        ),
      type: item.type == 1 ? "Single" : "Multiple",
      image: (
        <img
          className="rounded-md w-10 h-10 cursor-pointer"
          src={item?.image}
          alt="Scanned Image"
          onClick={() => {
            setOpenModal(true);
            setImageLink(item?.image);
          }}
        />
      ),
      action: actionButton,
      // length: <p className="text-end">{indianFormat(item?.length) || "-"}</p>,
      // width: <p className="text-end">{indianFormat(item?.width) || "-"}</p>,
      // height: <p className="text-end">{indianFormat(item?.height) || "-"}</p>,
      weight: <p className="text-end">{indianFormat(item?.weight) || "-"}</p>,
      volume: <p className="text-end">{indianFormat(item?.volume) || "-"}</p>,
      vol_weight: (
        <p className="text-end">{indianFormat(item?.vol_weight) || "-"}</p>
      ),
      amount_to_pay: (
        <p className="text-end">
          {matchedAmount?.amount_to_pay != null
            ? indianFormat(matchedAmount.amount_to_pay)
            : "-"}
        </p>
      ),
      lwh: (
        <p>
          {indianFormat(item?.length) || "-"} X{" "}
          {indianFormat(item?.width) || "-"} X{" "}
          {indianFormat(item?.height) || "-"}
        </p>
      ),
      ...(!isemirates
        ? {
            difference: (
              item?.weight_consideration == 1
                ? item?.difference >= item?.f_threshold
                : item?.difference >= threshold ||
                  item?.difference >=
                    item?.chargeable_weight * (threshold / 100)
            ) ? (
              <p className="bg-[#FFA09B] rounded-md text-white">
                {item?.difference}
              </p>
            ) : (
              <p className="rounded-md bg-green-500 text-white">
                {item?.difference}
              </p>
            ),
          }
        : {}),
    };
  });

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 py-4 px-6 bg-white rounded-lg shadow-lg sm:flex justify-between items-center">
        <h1 className="font-bold text-lg">Weight Dimension</h1>

        {/* <div className="flex items-center">
          <Download className="ml-6 w-5 h-5 cursor-pointer" />
        </div> */}
        <div className="lg:flex md:flex justify-end ">
          <FormCheck>
            <FormCheck.Input
              checked={isemirates}
              onChange={(e) => {
                if (e.target.checked) {
                  setIsEmirates(true);
                } else {
                  setIsEmirates(false);
                }
              }}
              className="border border-mustard"
              type="checkbox"
            />
            <FormCheck.Label>
              <p>EMIRATES</p>
            </FormCheck.Label>
          </FormCheck>
          <Button
            onClick={() => {
              setOpenModal1(true);
            }}
            className="mt-2 mb-2 sm:mt-0 sm:mb-0 mr-2 bg-green-500 border-none py-1 px-4 sm:ml-8 text-white rounded-xl"
          >
            Download CSV
          </Button>
          <div className="flex items-center mr-2">
            <FormLabel htmlFor="records-per-page" className="mr-2 mb-0 whitespace-nowrap">
              Show
            </FormLabel>
            <FormSelect
              id="records-per-page"
              className="w-20"
              value={limit}
              onChange={handleLimitChange}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </FormSelect>
          </div>
          <div className=" relative flex justify-between items-center">
            <FormInput
              placeholder="Search..."
              className="pr-8 pt-1 pb-1 rounded-xl"
              value={manifestSearch}
              onChange={(e) => {
                setManifestSearch(e.target.value.toUpperCase());
                setPage(1);
              }}
            />
            <Search className="absolute right-1 w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto mt-4 px-6 py-3 bg-white rounded-lg shadow-lg">
        {getList?.length > 0 && !loading ? (
          <>
            <Table
              columns={
                isemirates
                  ? columns.filter((item: any) => item?.field != "difference")
                  : columns
              }
              row={row}
              heightTable="50vh"
              currentPage={page || 0}
              limit={limit}
            />
            <CommonPagination
              totalpages={totalpages}
              onPageChange={handlePagechange}
              page={page}
            />

            <Modal
              size="xl"
              title={"Scanned Image"}
              open={openModal}
              setOpen={setOpenModal}
              description={description}
            />
          </>
        ) : loading ? (
          <IsLoading height="h-[50vh]" />
        ) : (
          <p className="text-gray-400 text-center">No Data Found!</p>
        )}
      </div>

      <Modal1
        open={openModal1}
        title=""
        size="md"
        setOpen={setOpenModal1}
        description={description1}
        footer={null}
      />

      <Modal1
        open={openAccRejectModal}
        title=""
        size="md"
        setOpen={setOpenAccRejectModal}
        description={descriptionAccReject1}
        footer={footerAccReject}
      />
    </>
  );
}
