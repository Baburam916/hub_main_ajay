import React, { useEffect, useState } from "react";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";
import Lucide from "../../../base-components/Lucide";
import clsx from "clsx";
import Tippy from "../../../base-components/Tippy";
import { useAlert } from "../../../ContextProvider/AlertContext";
import AnimatedCounter from "../AnimateCounter";
import {
  Get_book_csv_list,
  Get_book_dashboard,
} from "../../../AllServices/services";
import SearchableComp from "./searchableComp";
import {
  FormInline,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Table from "../../../components/Table";
import CommonPagination from "../../../components/Pagination";
import { convertUTCtoIST } from "../../../components/UtcToIst";
import { Link } from "react-router-dom";
import Modal from "../../../components/Modal";

const index = () => {
  const { showAlert } = useAlert();
  const [selectedData, setSelectedData] = useState({
    franchisee_id: "",
    franchisee_name: "",
  });
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState([{}]);
  const [status, setStatus] = useState("");

  const [awbData, setAWBData] = useState({
    total_awbs: 0,
    pending_awbs: 0,
    failed_awbs: 0,
    success_awbs: 0,
  });
  const [loading, setLoading] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);
  const handlePagechange = (e: number) => {
    setPage(e);
  };

  const fun1 = (a?: any) => {
    // setInitialdatatoget((pre: any) => ({ ...pre, franchisee_id: a?.franchisee_id }));
    const { franchisee_name, is_direct_customer, field_sales, credit_days } = a;
  };

  const fun2 = () => {};

  const getListData = async () => {
    try {
      const res = await Get_book_csv_list(
        selectedData?.franchisee_id,
        10,
        page - 1,
        status
      );
      if (res?.status == 200) {
        setTableData(res?.data?.data);
        setTotalPages(res?.data?.pages);
      } else if (res?.status == 204) {
        setTableData([]);
        setTotalPages(1);
      } else if (res?.status == 404 || res?.response?.status == 404) {
        showAlert("Not Found", "error");
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error"
        );
      }
    } catch (error) {
      showAlert(error?.message, "error");
      console.log(error);
    } finally {
    }
  };
  const getDashboardData = async () => {
    setLoading(true);
    try {
      const res = await Get_book_dashboard(selectedData?.franchisee_id);
      if (res?.status == 200) {
        setAWBData((prev) => ({
          ...prev,
          total_awbs: res?.data?.count || 0,
          pending_awbs: res?.data?.total_pending || 0,
          failed_awbs: res?.data?.total_fail || 0,
          success_awbs: res?.data?.total_success || 0,
        }));
      } else if (res?.status == 204) {
        setAWBData((prev) => ({
          ...prev,
          total_awbs: 0,
          pending_awbs: 0,
          failed_awbs: 0,
          success_awbs: 0,
        }));
      } else if (res?.status == 404 || res?.response?.status == 404) {
        showAlert("Not Found", "error");
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error"
        );
      }
    } catch (error) {
      showAlert(error?.message, "error");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const tableColumns = [
    { field: "description", headerName: "Description" },
    { field: "weight", headerName: "Weight" },
    { field: "length", headerName: "Length" },
    { field: "width", headerName: "Width" },
    { field: "height", headerName: "Height" },
  ];

  const tableRows = modalData?.map((item: any) => {
    return {
      ...item,
    };
  });

  const ModalDescription = (
    <>
      <Table columns={tableColumns} row={tableRows} heightTable="50vh" />
    </>
  );

  const columns = [
    { field: "awb_no", headerName: "AWB NO." },
    { field: "booking_code", headerName: "Booking Code" },
    { field: "shipment_type", headerName: "Shipment Type" },
    { field: "created_date", headerName: "Created Date" },
    { field: "origin_pincode", headerName: "Origin Pincode" },
    { field: "destination_pincode", headerName: "Destination Pincode" },
    { field: "shipper_name", headerName: "Shipper Name" },
    { field: "shipper_phone_no", headerName: "Shipper Phone No." },
    { field: "shipper_email", headerName: "Shipper Email" },
    { field: "shipper_address", headerName: "Shipper Address" },
    { field: "consignee_name", headerName: "Consignee Name" },
    { field: "consignee_address", headerName: "Consignee Address" },
    { field: "consignee_phone_no", headerName: "Consignee Phone No." },
    { field: "consignee_email", headerName: "Consignee Email" },
    { field: "shipment_details", headerName: "Shipment Details" },
    { field: "status", headerName: "Status" },
    { field: "dispatch_label", headerName: "Dispatch Label" },
    { field: "remarks", headerName: "Remarks" },
  ];

  const row = tableData?.map((item: any) => {
    return {
      ...item,
      shipment_type:
        item?.shipment_type == 1
          ? "Non-Document"
          : item?.shipment_type == 2
          ? "Document"
          : item?.shipment_type == 4
          ? "Commercial"
          : "N.A.",
      created_date: convertUTCtoIST(item?.created_date) || "N.A.",
      origin_pincode: item?.origin_pin_code,
      destination_pincode: item?.destination_pin_code,
      shipper_address:
        item?.shipper_address_1 + " , " + item?.shipper_address_2,
      consignee_address:
        item?.consignee_address_1 + " , " + item?.consignee_address_2,
      shipment_details: (
        <div className="flex justify-center ">
          <Lucide
            icon="Eye"
            className="text-mustard stroke-2.5 w-8 h-8 cursor-pointer"
            onClick={() => {
              setModalData([item]);
              setOpen(true);
            }}
          />

          {open && item?.id == modalData[0]?.id && (
            <Modal
              open={open}
              setOpen={setOpen}
              title={"Shipment Details"}
              description={ModalDescription}
              sticky={false}
              size="lg"
            />
          )}
        </div>
      ),
      status:
        item?.booking_status == 0 ? (
          <p className="text-base   text-mustard">Pending</p>
        ) : item?.booking_status == 1 ? (
          <p className="text-base   text-green-400">Completed</p>
        ) : item?.booking_status == 2 ? (
          <p className="text-base   text-red-500">Failed</p>
        ) : item?.booking_status == 3 ? (
          <p className="text-base   text-red-500">Error</p>
        ) : (
          "N.A."
        ),
      dispatch_label: item?.shipper_inv ? (
        <div className="flex justify-center ">
          <Link to={item?.shipper_inv} target="_blank">
            <Lucide
              icon="FileText"
              className="stroke-2.5 text-mustard cursor-pointer"
            />
          </Link>
        </div>
      ) : (
        "N.A."
      ),
      remarks:
        item?.booking_status == 0 ? (
          <p className="text-base  ">{item?.remarks || "N.A."}</p>
        ) : item?.booking_status == 1 ? (
          <p className="text-base   text-green-400">
            {item?.remarks || "N.A."}
          </p>
        ) : item?.booking_status == 2 ? (
          <p className="text-base   text-red-500">{item?.remarks || "N.A."}</p>
        ) : item?.booking_status == 3 ? (
          <p className="text-base   text-red-500">{item?.remarks || "N.A."}</p>
        ) : (
          "N.A."
        ),
    };
  });

  useEffect(() => {
    getDashboardData();
  }, [selectedData?.franchisee_id]);

  useEffect(() => {
    getListData();
  }, [selectedData?.franchisee_id, page, status]);
  return (
    <>
      <div className="my-4 flex  gap-8 items-center ">
        {" "}
        <div>
          <FormLabel>
            Franchisee Name <span className="text-red-500">*</span>{" "}
          </FormLabel>
          <SearchableComp
            placeholder="Search Franchisee..."
            zIndex="50"
            selectedData={selectedData}
            setSelectedData={setSelectedData}
            fun1={fun1}
            fun2={fun2}
          />
        </div>
      </div>
      <div className="grid min-[750px]:grid-cols-4 gap-6 my-6">
        <div className="col-span-1">
          <div
            className={clsx([
              "relative zoom-in",
              "before:content-[''] before:w-[90%] before:shadow-[0px_3px_20px_#0000000b] before:bg-slate-50 before:h-full before:mt-3 before:absolute before:rounded-md before:mx-auto before:inset-x-0 before:dark:bg-darkmode-400/70",
            ])}
          >
            <div className="p-5 box">
              <div className="flex">
                <Lucide
                  icon="Boxes"
                  className="w-[28px] h-[28px] text-blue-500"
                />
                <div className="ml-auto">
                  <Tippy
                    as="div"
                    className="cursor-pointer bg-blue-500 p-[10px] flex rounded-full text-white text-xs  items-center font-medium"
                    content="Total Booking"
                  >
                    {/* <Lucide
                      icon="Circle"
                      className="w-4 h-4 ml-0.5 text-blue-500"
                    /> */}
                  </Tippy>
                </div>
              </div>
              <div className="mt-6 text-3xl font-medium leading-8">
                {!awbData?.total_awbs && loading ? (
                  0
                ) : (
                  <AnimatedCounter
                    value={Number(awbData?.total_awbs) || 0}
                    withDecimal={false}
                  />
                )}
              </div>
              <div className="mt-1 text-base text-slate-500">Total Booking</div>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div
            className={clsx([
              "relative zoom-in",
              "before:content-[''] before:w-[90%] before:shadow-[0px_3px_20px_#0000000b] before:bg-slate-50 before:h-full before:mt-3 before:absolute before:rounded-md before:mx-auto before:inset-x-0 before:dark:bg-darkmode-400/70",
            ])}
          >
            <div className="p-5 box">
              <div className="flex">
                <Lucide
                  icon="PackageOpen"
                  className="w-[28px] h-[28px] text-mustard"
                />
                <div className="ml-auto">
                  <Tippy
                    as="div"
                    className="cursor-pointer bg-mustard p-[10px] flex rounded-full text-white text-xs  items-center font-medium"
                    content="Pending Booking"
                  >
                    {/* <Lucide
                      icon="Download"
                      className="w-4 h-4 ml-0.5 stroke-2.5"
                    /> */}
                  </Tippy>
                </div>
              </div>
              <div className="mt-6 text-3xl font-medium leading-8">
                {!awbData?.pending_awbs && loading ? (
                  0
                ) : (
                  <AnimatedCounter
                    value={Number(awbData?.pending_awbs) || 0}
                    withDecimal={false}
                  />
                )}
              </div>
              <div className="mt-1 text-base text-slate-500">
                Pending Booking
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div
            className={clsx([
              "relative zoom-in",
              "before:content-[''] before:w-[90%] before:shadow-[0px_3px_20px_#0000000b] before:bg-slate-50 before:h-full before:mt-3 before:absolute before:rounded-md before:mx-auto before:inset-x-0 before:dark:bg-darkmode-400/70",
            ])}
          >
            <div className="p-5 box">
              <div className="flex">
                <Lucide
                  icon="Package2"
                  className="w-[28px] h-[28px] text-green-400"
                />
                <div className="ml-auto">
                  <Tippy
                    as="div"
                    className="cursor-pointer bg-green-400 p-[10px] flex rounded-full text-white text-xs  items-center font-medium"
                    content="Success Booking"
                  >
                    {/* <Lucide
                      icon="Download"
                      className="w-4 h-4 ml-0.5 stroke-2.5"
                    /> */}
                  </Tippy>
                </div>
              </div>
              <div className="mt-6 text-3xl font-medium leading-8">
                {!awbData?.success_awbs && loading ? (
                  0
                ) : (
                  <AnimatedCounter
                    value={Number(awbData?.success_awbs) || 0}
                    withDecimal={false}
                  />
                )}
              </div>
              <div className="mt-1 text-base text-slate-500">
                Success Booking
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div
            className={clsx([
              "relative zoom-in",
              "before:content-[''] before:w-[90%] before:shadow-[0px_3px_20px_#0000000b] before:bg-slate-50 before:h-full before:mt-3 before:absolute before:rounded-md before:mx-auto before:inset-x-0 before:dark:bg-darkmode-400/70",
            ])}
          >
            <div className="p-5 box">
              <div className="flex">
                <Lucide icon="Box" className="w-[28px] h-[28px] text-red-500" />
                <div className="ml-auto">
                  <Tippy
                    as="div"
                    className="cursor-pointer bg-red-500 p-[10px] flex rounded-full text-white text-xs  items-center font-medium"
                    content="Failed Booking"
                  >
                    {/* <Lucide
                      icon="ChevronUp"
                      className="w-4 h-4 ml-0.5 text-mustard"
                    /> */}
                  </Tippy>
                </div>
              </div>
              <div className="mt-6 text-3xl font-medium leading-8">
                {!awbData?.failed_awbs && loading ? (
                  0
                ) : (
                  <AnimatedCounter
                    value={Number(awbData?.failed_awbs) || 0}
                    withDecimal={false}
                  />
                )}
              </div>
              <div className="mt-1 text-base text-slate-500">
                Failed Booking
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-8xl mx-auto mt-4 px-6 py-3 bg-white rounded-lg shadow-lg">
        {tableData?.length > 0 ? (
          <>
            <div className="flex justify-end ">
              <FormInline className="flex items-center">
                <FormLabel htmlFor="horizontal-form-1" className="sm:w-20 whitespace-nowrap">
                  Booking Status : 
                </FormLabel>
                <FormSelect
                  formSelectSize="sm"
                  className="w-24 ml-2"
                  aria-label=".form-select-sm example"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="0">Pending</option>
                  <option value="1">Success</option>
                  <option value="2">Failed</option>
                </FormSelect>
              </FormInline>
            </div>
            <Table
              columns={columns}
              row={row}
              heightTable="50vh"
              currentPage={page || 0}
            />

            <CommonPagination
              totalpages={totalpages}
              onPageChange={handlePagechange}
              page={page}
            />
          </>
        ) : (
          <p className="text-gray-400 text-center">No Data Found!</p>
        )}
      </div>
    </>
  );
};

export default index;
