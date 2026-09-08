import React, { useEffect, useState } from "react";
import Table from "../../../components/Table";
import { Search } from "lucide-react";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import CommonPagination from "../../../components/Pagination";
import {
  Get_Enquiry_list,
  Release_held_up_shipment_list,
  requestForCreditLimit,
  requestForReleaseShipment,
} from "../../../AllServices/services";
import { formatDateWithoutTime } from "../../../utils";
import { Spinner } from "flowbite-react";
import NoData from "../../../../src/assets/images/no-data.jpg";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Modal from "../../../components/Modal";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { useDebounce } from "../../../components/Search";

const Executed = ({
  loadCountData,
  countryData,
  franchiseeData,
  page,
  search,
  totalPages,
  handlePageChange,
  datatoget,
  setDatatoget,
}) => {
  const { showAlert } = useAlert();
  const debouncedSearch = useDebounce(search, 500);
  const [isActive, setActive] = useState(false);
  const [executed, setExecuted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [statusList, setStatusList] = useState<Array<any>>([]);
  const [confirmData, setConfirmData] = useState({
    data: "",
    forWhat: "",
    reason: "",
    remark: "",
    booking_no: "",
    franchisee_id: "",
  });

  const ToggleClass = () => {
    setActive(!isActive);
  };

  const loadEnquiryData = async () => {
    setLoading(true);
    try {
      const res = await Get_Enquiry_list(
        {
          limit: 5,
          page: page - 1,
        },
        {
          from_date: "",
          to_date: "",
          booking_status: [14, 17],
          ...(datatoget?.franchisee_id
            ? { franchisee_id: [datatoget?.franchisee_id] }
            : {}),
        },
        debouncedSearch.trim() || "",
        datatoget?.weight || "",
        datatoget?.destination_country || ""
      );
      if (res?.status == 200) {
        setExecuted(res?.data?.data || []);
        setDatatoget((pre: any) => ({
          ...pre,
          totalpages3: Math.ceil(res?.data?.total / 5),
        }));
      } else {
        setExecuted([]);
        setDatatoget((pre: any) => ({
          ...pre,
          totalpages3: 1,
        }));
      }
    } catch (error) {
      showAlert(error?.message, "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadEnquiryData();
  }, [
    page,
    debouncedSearch,
    datatoget?.franchisee_id,
    datatoget?.destination_country,
    datatoget?.weight,
    datatoget?.refresh,
  ]);

  useEffect(() => {
    Release_held_up_shipment_list().then((res) =>
      setStatusList(res?.data?.data)
    );
  }, []);

  const handleRequestForCreditLimit = async (data: any) => {
    setSpinner(true);
    try {
      const res = await requestForCreditLimit({
        booking_id: data?.id,
        booking_status: 8,
      });
      if (res?.status == 200) {
        setConfirm(false);
        loadEnquiryData();
        loadCountData();
        setConfirmData({ data: "", forWhat: "" });
        showAlert(res?.data?.message);
      } else if (res?.response?.status == 406) {
        showAlert(res?.response?.data?.errors[0]?.msg, "warning");
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error"
        );
      }
    } catch (error) {
      showAlert(error?.message, "error");
    } finally {
      setSpinner(false);
    }
  };
  const handleRequestForRelease = async (data: any) => {
    setSpinner(true);
    try {
      if (!data?.enquiry_id)
        return showAlert("Enquiry id is required", "warning");
      if (!data?.reason)
        return showAlert("Held Up Reason is required", "warning");
      if (data?.reason == "264" && !data?.remark)
        return showAlert("Remarks is required", "warning");
      const res = await requestForReleaseShipment({
        enquiry_id: data?.enquiry_id,
        remark: data?.reason == "264" ? data?.remark : data?.reason,
      });
      if (res?.status == 200) {
        setConfirm(false);
        loadEnquiryData();
        loadCountData();
        setConfirmData({ data: "", forWhat: "" });
        setDatatoget((pre: any) => ({ ...pre, refresh: !pre?.refresh }));
        showAlert(res?.data?.message);
      } else if (res?.response?.status == 406) {
        showAlert(res?.response?.data?.errors[0]?.msg, "warning");
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error"
        );
      }
    } catch (error) {
      showAlert(error?.message, "error");
    } finally {
      setSpinner(false);
    }
  };

  const confirmDescription = (
    <p className="text-center">
      {confirmData?.forWhat == 1 ? (
        "Are you sure you want to Held Request for Credit Limit for this Shipment ?"
      ) : confirmData?.forWhat == 2 ? (
        <>
          <div className=" flex justify-between gap-4 mb-2">
            <div className=" bg-gray-200 rounded p-2 max-w-1/2 overflow-hidden truncate">
              <b>ENQUIRY No: </b>
              {confirmData?.booking_no}
            </div>
            <div className=" bg-gray-200 rounded p-2 overflow-hidden truncate max-w-1/2">
              <b>FRANCHISEE : </b>
              {
                franchiseeData?.find(
                  (item: any) =>
                    item?.franchisee_id == confirmData?.franchisee_id
                )?.franchisee_name
              }
            </div>
          </div>
          <div className="text-left mb-4">
            <FormLabel htmlFor="remarks">
              Release Reason <span className="text-red-500">*</span>
            </FormLabel>
            <FormSelect
              className=""
              value={confirmData?.data?.reason}
              onChange={(e) =>
                setConfirmData((pre: any) => ({
                  ...pre,
                  data: { ...pre?.data, reason: e.target.value },
                }))
              }
            >
              <option value="">Select release reason</option>
              {statusList?.map((item: any, index: number) => (
                <option key={index} value={item?.status}>
                  {item?.status}
                </option>
              ))}
              <option value="264">Other reason</option>
            </FormSelect>
          </div>
          {confirmData?.data?.reason == 264 && (
            <div className="text-left">
              <FormLabel htmlFor="remarks">
                Remarks <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                id="remarks"
                type="text"
                placeholder="Enter Remarks"
                value={confirmData?.data?.remark}
                onChange={(e) =>
                  setConfirmData((pre: any) => ({
                    ...pre,
                    data: { ...pre?.data, remark: e.target.value },
                  }))
                }
              />
            </div>
          )}
        </>
      ) : (
        "Are you sure you want to perform this action ?"
      )}
    </p>
  );
  const confirmFooter =
    confirmData?.forWhat == 2 ? (
      <Button
        className="px-4 py-1 rounded-lg bg-mustard text-white "
        onClick={() => {
          handleRequestForRelease(confirmData?.data);
        }}
        disabled={spinner || !confirmData?.data?.reason}
      >
        Submit{" "}
        {spinner && (
          <LoadingIcon
            icon="puff"
            color="white"
            className="w-5 h-5 ml-2 stroke-2.5 text-white"
          />
        )}
      </Button>
    ) : (
      <div className="flex justify-end gap-4">
        <Button
          className="px-4 py-1 rounded-lg bg-green-400 text-white hover:bg-green-500 ml-2"
          onClick={() => {
            if (confirmData?.forWhat == 1) {
              handleRequestForCreditLimit(confirmData);
            }
          }}
          disabled={spinner}
        >
          Yes
          {spinner && (
            <LoadingIcon
              icon="puff"
              color="white"
              className="w-5 h-5 ml-2 stroke-2.5 text-white"
            />
          )}
        </Button>
        <Button
          className="px-4 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 ml-2"
          onClick={() => setConfirm(false)}
          disabled={spinner}
        >
          No
        </Button>
      </div>
    );

  const columns = [
    { field: "action", headerName: "Action" },
    { field: "booking_no", headerName: "Enquiry No." },
    { field: "created_date", headerName: "Date" },
    { field: "franchisee_name", headerName: "Franchisee" },
    { field: "country_name", headerName: "Destination" },
    { field: "weight", headerName: "Weight" },
    { field: "status", headerName: "Status" },
  ];

  const rows = executed?.map((item: any) => {
    const Action = (
      // <Menu>
      //   <Menu.Button
      //     as={Button}
      //     variant="primary"
      //     className="bg-blue-100 text-blue-500 border-blue-500"
      //   >
      //     <UserCog className="w-5 stroke-2.5" />
      //     <ChevronDown className="w-4 stroke-2.5 mt-1" />
      //   </Menu.Button>
      //   <Menu.Items className="" placement="right-start">
      //     <Menu.Item
      //       onClick={() => {
      //         setConfirmData({ data: item, forWhat: 1 });
      //         setConfirm(true);
      //       }}
      //     >
      //       <Wallet className="w-4 mr-2" /> Request for Credit Limit
      //     </Menu.Item>
      //     <Menu.Item
      //       onClick={() => {
      //         setConfirmData({
      //           data: { enquiry_id: item?.id, remark: "" },
      //           forWhat: 2,
      //         });
      //         setConfirm(true);
      //       }}
      //     >
      //       <ArrowUpRight className="w-4 mr-2" /> Release
      //     </Menu.Item>
      //   </Menu.Items>
      // </Menu>
      <Button
        className="bg-mustard text-white p-2"
        onClick={() => {
          setConfirmData({
            data: { enquiry_id: item?.id, remark: "" },
            forWhat: 2,
            booking_no: item?.booking_no,
            franchisee_id: item?.franchisee_id,
          });
          setConfirm(true);
        }}
      >
        Release Shipment
      </Button>
    );

    const Status = (
      <>
        {item?.booking_status == 14 ? (
          <p className=" text-red-500 text-base ">Insufficient Balance</p>
        ) : item?.booking_status == 17 ? (
          <p className=" text-red-500 text-base ">
            {item?.held_up_remark ? item?.held_up_remark : "Manual Held Up"}
          </p>
        ) : (
          "N.A."
        )}
      </>
    );

    return {
      ...item,
      franchisee_name:
        franchiseeData?.find((cus) => cus.franchisee_id == item.franchisee_id)
          ?.franchisee_name || "-",
      country_name: countryData?.find(
        (con) => con.country_id == item.dest_country_id
      )?.country_name,
      created_date: formatDateWithoutTime(item?.created_date),
      weight: item.weight + " " + item.weight_unit,
      action: Action,
      status: Status,
    };
  });

  return (
    <>
      <div className="  bg-white rounded-md justify-between shadow-blue-900 p-2 h-[100%]">
        <div className=" p-2 bg-gray-100 flex justify-between items-center ">
          <h2 className="text-sm font-medium">
            {/* <button onClick={ToggleClass} className="p-0">
              <ChevronDown className="relative top-1 w-[18px]" />
            </button> */}
            Held Up
          </h2>

          <div className=" relative w-200">
            <FormInput
              id="vertical-form-1"
              type="text"
              placeholder="Search"
              onChange={(e) => {
                setDatatoget((pre: any) => ({
                  ...pre,
                  search3: e.target.value.replace(/\s/g, ""),
                  page3: 1,
                }));
              }}
            />

            <button className="searchListTable absolute top-2 right-3 text-stone-300">
              <Search />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-3 flex items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="tablelist p-3">
            {executed.length == 0 ? (
              <div className="flex items-center justify-center h-[40vh]">
                <img
                  src={NoData}
                  alt="No Data Found!"
                  className="w-1/2 rounded-full opacity-50"
                />
              </div>
            ) : (
              <>
                <div className={`overflow-x-auto`}>
                  <Table
                    minHeightTable="94%"
                    className="h-[100vh]"
                    columns={columns}
                    row={rows}
                    limit={5}
                    currentPage={page}
                    ops={1}
                  />
                </div>

                <CommonPagination
                  onPageChange={(e) => handlePageChange(e, 3)}
                  page={Number(page)}
                  totalpages={Number(totalPages)}
                />
              </>
            )}
          </div>
        )}
        <Modal
          open={confirm}
          setOpen={setConfirm}
          title="Confirmation"
          size="lg"
          description={confirmDescription}
          footer={confirmFooter}
        />
      </div>
      <style>
        {`
          button[data-headlessui-state="open"] {
            border-color: #f0b646;
            color: #f0b646;
          }
        `}
      </style>
    </>
  );
};

export default Executed;
