import React, { useEffect, useState } from "react";
import Table from "../../../components/Table";
import { Search, FileText } from "lucide-react";

import AOS from "aos";
import "aos/dist/aos.css";

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
import { User } from "lucide-react";

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
        datatoget?.destination_country || "",
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
      setStatusList(res?.data?.data),
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
          "error",
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
          "error",
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
                    item?.franchisee_id == confirmData?.franchisee_id,
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
          <p className=" text-red-500 text-[13px] ">Insufficient Balance</p>
        ) : item?.booking_status == 17 ? (
          <p className=" text-red-500 text-[13px] ">
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
        (con) => con.country_id == item.dest_country_id,
      )?.country_name,
      created_date: formatDateWithoutTime(item?.created_date),
      weight: item.weight + " " + item.weight_unit,
      action: Action,
      status: Status,
    };
  });

  // on scroll animatil this useffect load a card after one sec delay when you scroll

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(
      ".exec-reveal:not(.exec-reveal-visible)",
    );
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Number((a.target as HTMLElement).dataset.revealIndex) -
              Number((b.target as HTMLElement).dataset.revealIndex),
          )
          .forEach((entry, i) => {
            const el = entry.target as HTMLElement;
            el.style.transitionDelay = `${i * 600}ms`;
            el.classList.remove("opacity-0", "translate-y-6");
            el.classList.add(
              "opacity-100",
              "translate-y-0",
              "exec-reveal-visible",
            );
            const onEnd = (e: TransitionEvent) => {
              if (e.propertyName === "transform") {
                el.classList.remove("translate-y-0");
                el.removeEventListener("transitionend", onEnd);
              }
            };
            el.addEventListener("transitionend", onEnd);
            observer.unobserve(entry.target);
          });
      },
      { threshold: 0.1 },
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [executed]);

  // end

  return (
    <>
      <div className=" NewtableBox min-h-auto lg:h-full bg-white rounded-md justify-between shadow-blue-900 border border-[#fff]  ">
        <div className=" tbaleTittle p-2 bg-[#e9edf2] flex justify-between items-center rounded-t-md  ">
          <div className="flex items-end gap-2">
            <h2 className="text-sm font-medium">
              {/* <button onClick={ToggleClass} className="p-0">
              <ChevronDown className="relative top-1 w-[18px]" />
            </button> */}
              Held Up
            </h2>
          </div>

          <div className=" relative w-200">
            <FormInput
              className="h-[30px] w-full rounded-md border border-[#e5e7eb] pl-3 pr-10 text-sm focus:border-[#f0b646] focus:ring-[#f0b646]"
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

            <button className=" searchListTable absolute top-[6px] right-2 text-stone-300">
              <Search className="w-[17px] h-[17px]" />
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
                {/* Old table UI - commented out in favor of card UI below, functionality unchanged */}
                {/* <div className={`overflow-x-auto`}>
                  <Table
                    minHeightTable="94%"
                    className="h-[100vh]"
                    columns={columns}
                    row={rows}
                    limit={5}
                    currentPage={page}
                    ops={1}
                  />
                </div> */}

                <div className="w-full">
                  {rows?.map((item: any, index: number) => (
                    <div
                      key={item?.id || item?.job_id || index}
                      data-reveal-index={index}
                      className="exec-reveal w-full border rounded-lg mb-3 group bg-[#fff] border-[#fff1d3] even:bg-[#fff] even:border-[#eaf1f6] hover:bg-[#fff] hover:border-[#E6E6E6] opacity-0 translate-y-6 transition-all duration-700 ease-out"
                    >
                      <div className="justify-between border-[#fff1d3] border-b w-full block lg:flex pt-[5px] pb-[3px] px-2 items-center bg-[#fffbf2] group-even:bg-[#f6faff] rounded-t-lg group-even:border-[#eaf1f6] group-hover:bg-[#F8F8F8] group-hover:border-[#E6E6E6]">
                        <div className="flex relative mb-2 lg:mb-0">
                          <figure className="bg-[#FFF0CE] group-even:bg-[#E8F2FF] rounded-full p-[2px] w-[30px] h-[30px] justify-between flex items-center group-hover:bg-[#e3e3e3]">
                            <FileText className="w-[18px] h-[18px] text-[#B68F34] group-even:text-[#5A81B4] m-auto group-hover:text-[#303030]" />
                          </figure>
                          <aside className="ml-2 leading-[14px]">
                            <h2 className="text-[#9099a2] text-[12px]  uppercase leading-[14px]">
                              Enquiry Number
                            </h2>
                            <h3 className="text-[12px] font-bold text-[#e1a722] rounded-[10px]">
                              {item?.booking_no || "-"}
                            </h3>
                          </aside>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="text-left lg:text-right leading-[16px]">
                            <h4 className="font-medium text-[13px]">
                              WEIGHT :<span> {item?.weight}</span>
                            </h4>
                            <p className="text-[13px] text-[#797979]">
                              {item?.created_date || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 pt-3 pb-2">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-12 lg:col-span-8">
                            <div className="w-full">
                              <div className="w-full font-medium text-[14px]">
                                Name : {item?.franchisee_name || "-"}
                              </div>
                              <div className="w-full block lg:flex gap-x-5 mt-1">
                                <div className="leading-[16px]">
                                  <small className="text-[11px] text-[#797979] flex items-center">
                                    <i className="w-[5px] h-[5px] bg-[#efb847] group-even:bg-[#6EA8E0] rounded-full mr-1 inline-block group-hover:bg-[#a0a0a0]"></i>
                                    DESTINATION
                                  </small>
                                  <p className="text-[14px] text-[#303030]">
                                    {item?.country_name || "-"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-12 lg:col-span-4">
                            <div className="flex relative gap-2 justify-end">
                              <div className="flex justify-center items-center">
                                {item?.action}
                              </div>
                            </div>
                          </div>

                          <div className="col-span-12 lg:col-span-12">
                            <div className=" flex  w-full  border-t border-[#f2f2f2] px-[0] pt-[4px]">
                              <h2 className="flex text-[#9099a2] text-[11px] font-medium   leading-[20px]  ">
                                <i className="mr-1 bg-[#f1f5f9] border-none p-[2px] w-[18px] h-[18px] rounded-full flex justify-center items-center ">
                                  <User
                                    className="w-[12px] h-[12px]  text-[#959595]"
                                    strokeWidth={3}
                                  />
                                </i>
                                <span className="text-[#959595]">STATUS </span>
                                &nbsp; : &nbsp; <span>{item?.status}</span>
                              </h2>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
          @keyframes execCardReveal {
            from {
              opacity: 0;
              transform: translateY(24px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </>
  );
};

export default Executed;
