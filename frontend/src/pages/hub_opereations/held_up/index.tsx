import React, { useEffect, useState } from "react";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";
import CommonPagination from "../../../components/Pagination";
import Table from "../../../components/Table";
import { useDebounce } from "../../../components/Search";
import NoData from "../../../../src/assets/images/no-data.jpg";
import {
  Get_country,
  Get_Enquiry_list,
  Get_franchise,
  Release_held_up_shipment_list,
  requestForCreditLimit,
  requestForReleaseShipment,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { formatDateWithoutTime } from "../../../utils";
import { Box, Search, User, Wallet } from "lucide-react";
import Modal from "../../../components/Modal";
import { Menu } from "../../../base-components/Headless";
import { UserCog } from "lucide-react";
import { ChevronDown } from "lucide-react";

const index = () => {
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [heldUpData, setHeldUpData] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [countryData, setCountryData] = useState([]);
  const [franchiseData, setFranchiseData] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [confirmData, setConfirmData] = useState({
    data: "",
    forWhat: "",
    reason: "",
    remark: "",
  });
  const [statusList, setStatusList] = useState<Array<any>>([]);

  const confirmDescription = (
    <p className="text-center">
      {confirmData?.forWhat == 1 ? (
        "Are you sure you want to Request for Credit Limit for this Shipment ?"
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
                franchiseData?.find(
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
              // handleRequestForCreditLimit(confirmData);
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
    { field: "created_date", headerName: "Date" },
    { field: "franchisee_name", headerName: "Franchisee" },
    { field: "weight", headerName: "Weight" },
    { field: "country_name", headerName: "Destination" },
    { field: "status", headerName: "Status" },
    { field: "booking_no", headerName: "Enquiry No." },
  ];

  const rows = heldUpData?.map((item: any) => {
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
      //   <Menu.Items placement="right">
      //     <Menu.Item
      //       onClick={() => {
      //         handleRequestForRelease(item);
      //       }}
      //     >
      //       <Wallet className="w-4 mr-2" /> Request for Credit Limit
      //     </Menu.Item>
      //   </Menu.Items>
      // </Menu>
      <Button
        className="bg-mustard text-white p-2 border-none"
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
        franchiseData?.find((cus) => cus.franchisee_id == item.franchisee_id)
          ?.franchisee_name || "-",
      country_name: countryData.find(
        (con) => con.country_id == item.dest_country_id
      )?.country_name,
      created_date: formatDateWithoutTime(item.created_date),
      weight: item.weight + " " + item.weight_unit,
      status: Status,
      action: Action,
    };
  });

  // const handleRequestForCreditLimit = async (data: any) => {
  //   try {
  //     const res = await requestForCreditLimit({
  //       booking_id: data?.id,
  //       booking_status: 8,
  //     });
  //     if (res?.status == 200) {
  //       console.log(res?.data?.message);
  //       showAlert(res?.data?.message);
  //       getEnquiryData();
  //     } else {
  //       showAlert(
  //         res?.data?.message || res?.response?.data?.message || res?.message,
  //         "error"
  //       );
  //     }
  //   } catch (error) {
  //     showAlert(error?.message, "error");
  //   }
  // };

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
        getEnquiryData();
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

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const getEnquiryData = async () => {
    setIsLoading(true);
    try {
      const res = await Get_Enquiry_list(
        {
          offset: (page - 1) * 20,
          limit: 20,
        },
        {
          from_date: "",
          to_date: "",
          booking_status: [14, 17],
        },
        debouncedSearch.trim() || ""
      );
      if (res?.status == 200) {
        setHeldUpData(res?.data?.data || []);
        setTotalPages(Math.ceil(res?.data?.total / 20));
      } else {
        setHeldUpData([]);
        setTotalPages(1);
      }
    } catch (error) {
      showAlert(error?.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Get_country().then((res) => setCountryData(res?.data?.data));
    Get_franchise().then((res) => setFranchiseData(res?.data?.data));
    Release_held_up_shipment_list().then((res) =>
      setStatusList(res?.data?.data)
    );
  }, []);

  useEffect(() => {
    getEnquiryData();
  }, [page, debouncedSearch]);
  return (
    <>
     <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
		


      <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-none flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Box className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    {" "}
                   Held Up
                  </h4>
                </div>
              </div>



     <div className="flex items-center w-full lg:w-auto">
      
          <div className="relative flex justify-between items-center  w-full lg:w-auto">
            <FormInput
              className="pr-8 pt-1 pb-1 rounded-md h-[35px]  w-full lg:w-auto"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value.replace(/\s/g, ""));
                setPage(1);
              }}
              placeholder="Enter Enquiry No."
            />
            <Search className="absolute right-2 w-4 h-4" />
            {/* <Button
              //   onClick={() => {
              //     getWalkinTable();
              //     setPage(1);
              //   }}
              className="bg-red-500 border-none py-1 px-2 text-white ml-2"
            >
              Search
            </Button> */}
          </div>
        </div>


            </div>
          </div>



 <div className="p-2  lg:p-6">


        {isLoading ? (
          <div className="flex justify-center mt-6">
            <LoadingIcon icon="puff" className="block w-[6%]" />
          </div>
        ) : (
          <>
            {heldUpData?.length > 0 ? (
              <>
                <Table
                  heightTable="75vh"
                  columns={columns}
                  row={rows}
                  currentPage={page || 0}
                />
                <CommonPagination
                  totalpages={totalPages}
                  onPageChange={handlePageChange}
                  page={page}
                />
              </>
            ) : (
              <div className="flex items-center justify-center ">
                <img
                  src={NoData}
                  alt="No Data Found!"
                  className="w-1/2 rounded-full opacity-50"
                />
              </div>
            )}
          </>
        )}
      </div>

  </div>

      </div>



      <Modal
        open={confirm}
        setOpen={setConfirm}
        title="Confirmation"
        size="lg"
        description={confirmDescription}
        footer={confirmFooter}
      />
    </>
  );
};

export default index;
