import React, { useEffect, useRef, useState } from "react";
import Table from "../../../components/Table";
import hubdashbg from "../../../assets/images/hubdashbg.gif";
import AOS from "aos";
import "aos/dist/aos.css";


import {
  ThumbsDown,
  Clock8,
  UserPlus,
  Check,
  FolderOpen,
  ShieldAlert,
  Wallet,
  Search,
  UserCog,
  ChevronDown,
  Trash2,
  Eye,
  ClipboardList,
  FileCog,
  Laptop,
  Laptop2,
  CalendarCheck,
  RefreshCcw,
  Plus,
  PlusCircle,
  Hand,
} from "lucide-react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { Menu } from "../../../base-components/Headless";
import SearchImg from "../../../assets/images/searchbox.png";
import CommonPagination from "../../../components/Pagination";
import { Lightbulb } from "lucide-react";
import { UserCheck } from "lucide-react";
import { ClipboardCheck } from "lucide-react";
import {
  Delete_job,
  Get_country,
  Get_franchise,
  Get_Job_Count,
  Get_Job_list,
  Get_Spot_Count,
} from "../../../AllServices/services";
import ReadyToProcess from "./readyToProcess";
import ReadyToExecute from "./readyToExecuted";
import Executed from "./executed";
import {
  checkisEmpty,
  formatDate,
  formatDateWithoutTime,
} from "../../../utils";
import { Spinner } from "flowbite-react";
import Modal from "../../../components/Modal";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";
import NoData from "../../../../src/assets/images/no-data.jpg";
import { useDebounce } from "../../../components/Search";
import CommonSearchableAll from "../../../components/commonSearchableAll";
import { useLogin } from "../../../components/LoginContext";
import { ref } from "yup";
import Tippy from "../../../base-components/Tippy";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";

const intfranchiseedata = {
  franchisee_id: "",
  franchisee_name: "",
};

const intselecteddata = {
  country_name: "",
  country_id: "",
};

const intdata = {
  search1: "",
  search2: "",
  search3: "",
  search4: "",
  totalpages1: 1,
  totalpages2: 1,
  totalpages3: 1,
  totalpages4: 1,
  page1: 1,
  page2: 1,
  page3: 1,
  page4: 1,
  franchisee_id: "",
  destination_country: "",
  weight: "",
  refresh: false,
};

const index = () => {
  const [datatoget, setDatatoget] = useState<any>(intdata);
  const debouncedSearch = useDebounce(datatoget?.search4, 500);
  const [isActive, setActive] = useState(false);
  const [countData, setCountData] = useState({});
  const [initiatedJobs, setInitiatedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteID, setDeleteID] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [franchiseeData, setFranchiseeData] = useState([]);
  const { showAlert } = useAlert();
  const { userdata } = useLogin();

  const description = (
    <p className="text-center">Are you sure you want to delete this job ?</p>
  );

  const footer = (
    <div className="flex justify-end gap-4">
      <Button
        className="px-4 py-1 rounded-lg bg-green-400 text-white hover:bg-green-500 ml-2"
        onClick={() => {
          handleDeleteJob();
          setSpinner(true);
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
        onClick={() => setOpen(false)}
      >
        No
      </Button>
    </div>
  );

  const handleDeleteJob = async () => {
    try {
      const res = await Delete_job(deleteID);
      if (res?.status == 200) {
        setOpen(false);
        getJobData();
        loadCountData();
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      console.log(error);
      showAlert(error?.message, "error");
    } finally {
      setSpinner(false);
    }
  };

  const ToggleClass = () => {
    setActive(!isActive);
  };
  const handlePageChange = (e: number, value: any) => {
    if (value == 1) {
      handlealldatatoget("page1", e);
    }
    if (value == 2) {
      handlealldatatoget("page2", e);
    }
    if (value == 3) {
      handlealldatatoget("page3", e);
    }
    if (value == 4) {
      setDatatoget((pre: any) => ({ ...pre, page4: e }));
    }
  };
  const handlealldatatoget = (name: any, value: any) => {
    setDatatoget((pre: any) => ({ ...pre, [name]: value }));
  };

  const loadCountData = async () => {
    const jobCountData = await Get_Job_Count();
    const spotCountData = await Get_Spot_Count();
    if (jobCountData?.status == 200) {
      setCountData({
        ...jobCountData?.data?.data,
        ...spotCountData?.data?.data[0],
      });
    }
  };
  const getJobData = async () => {
    setLoading(true);
    try {
      const res = await Get_Job_list(
        {
          status: 0,
          limit: 5,
          page: datatoget?.page4 - 1,
        },
        debouncedSearch.trim() || "",
        datatoget?.franchisee_id || "",
        datatoget?.destination_country || "",
        Number(datatoget?.weight) || "",
      );
      if (res?.status == 200) {
        setInitiatedJobs(res?.data?.data || []);
        setDatatoget((pre: any) => ({ ...pre, totalpages4: res?.data?.count }));
      } else {
        setInitiatedJobs([]);
        setDatatoget((pre: any) => ({ ...pre, totalpages4: 1 }));
      }
    } catch (error) {
      showAlert(error?.message, "error");
    } finally {
      setLoading(false);
    }
  };


useEffect(() => {
  AOS.init({
    duration: 1000,
    once: true,
  });
}, []);

  useEffect(() => {
    Get_country().then((res) => setCountryData(res?.data?.data));
    Get_franchise().then((res) => setFranchiseeData(res?.data?.data));
    loadCountData();
  }, []);

  useEffect(() => {
    getJobData();
  }, [
    datatoget?.page4,
    debouncedSearch,
    datatoget?.franchisee_id,
    datatoget?.destination_country,
    datatoget?.weight,
    datatoget?.refresh,
  ]);

  const columns = [
    { field: "action", headerName: "Action" },
    { field: "created_date", headerName: "Date" },
    { field: "franchisee_name", headerName: "Franchisee" },
    { field: "country_name", headerName: "Destination" },
    { field: "weight", headerName: "Weight" },
  ];

  const rows = initiatedJobs?.map((item: any, index: any) => {
    const Action = (
      <Menu>
        <Menu.Button
          as={Button}
          variant="primary"
          className="bg-blue-100 text-blue-500 border-blue-500"
        >
          <UserCog className="w-5 stroke-2.5" />
          <ChevronDown className="w-4 stroke-2.5 mt-1" />
        </Menu.Button>
        <Menu.Items className="w-48" placement="right-start">
          <Menu.Item
            onClick={() => {
              setOpen(true);
              setDeleteID(item?.job_id);
            }}
          >
            <Trash2 className="w-4 mr-2" /> Delete Job
          </Menu.Item>
        </Menu.Items>
      </Menu>
    );

    return {
      ...item,
      franchisee_name:
        franchiseeData?.find((cus) => cus?.franchisee_id == item?.franchisee_id)
          ?.franchisee_name || "-",
      country_name: countryData?.find(
        (con) => con?.country_id == item?.destination_country,
      )?.country_name,
      created_date: formatDateWithoutTime(item?.created_date),
      weight:
        item?.shipment_dimensions?.reduce(
          (acc, { weight }) => acc + +weight,
          0,
        ) + " kg",
      action: Action,
    };
  });

  // Searching Code
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedfranchisedata, setSelectedfranchisedata] =
    useState<any>(intfranchiseedata);
  const [selecteddata, setSelecteddata] = useState<any>(intselecteddata);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([
    "Franchisee",
    "Destination",
    "Chargeable Weight",
  ]);
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const handleCheckboxChange = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const options = [
    { id: "Franchisee", label: "Franchisee" },
    { id: "Destination", label: "Destination" },
    { id: "Chargeable Weight", label: "Chargeable Weight" },
  ];

  const fun1 = (a?: any) => {
    setInputs((pre: any) => ({
      ...pre,
      franchisee_id: a?.franchisee_id,
    }));
  };
  const fun2 = () => {
    setSelectedfranchisedata(intfranchiseedata);
    setInputs((pre: any) => ({ ...pre, franchisee_id: "" }));
  };
  const fun3 = (a: any) => {
    setInputs((pre: any) => ({ ...pre, dest_country_id: a?.country_id }));
  };
  const fun3toempty = () => {
    setSelecteddata(intselecteddata);
    setInputs((pre: any) => ({ ...pre, dest_country_id: "" }));
  };

  const handleReset = () => {
    setDatatoget((pre: any) => ({
      ...pre,
      franchisee_id: "",
      destination_country: "",
      weight: "",
    }));
    setInputs({});
    setSelectedfranchisedata(intfranchiseedata);
    setSelectedOptions(["Franchisee", "Destination", "Chargeable Weight"]);
    setSelecteddata(intselecteddata);
  };

  return (
    <>
      <div>
        <div className="mt-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold">Jobs</h2>
          </div>
          <div className=" flex w-full items-center">
            <div className="   grid  grid-cols-12 gap-3 w-full">
              <div className="col-span-12 lg:col-span-3" data-aos="fade-up">
                <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-[#fff7e8] via-[#fbfcff] to-[#fff]  rounded-[10px] p-[15px] border-2 border-[#fff] flex">
                  <div className="flex relative z-[1]">
                    <i className=" bg-[#ffedca] rounded-[10px] w-[50px] h-[50px] flex justify-center items-center">
                      <Lightbulb className="w-8 h-8 p-1   text-[#e59f12]" />
                    </i>
                    <aside className="ml-[10px]">
                      <h6 className="text-[16px] font-bold ">
                        {countData.initiated || 0}
                      </h6>
                      <p className="uppercase text-[14px] text-[#e7ab34]">
                        {" "}
                        Initiated Jobs
                      </p>
                    </aside>
                  </div>

                  <div className="absolute bottom-[-60px] left-0  w-[200%]  ">
                    <img
                      src={hubdashbg}
                      className=" m-auto mt-2 [filter:sepia(2)_saturate(12)] opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div
                className="col-span-12 lg:col-span-3 "
                data-aos="fade-up"
                data-aos-duration="1000"
              >
                <div className="h-full  relative overflow-hidden w-full bg-gradient-to-r from-[#f1fff1] via-[#fbfcff] to-[#fff]  rounded-[10px] p-[15px] border-2 border-[#fff] flex">
                  <div className="flex relative z-[1]">
                    <i className=" bg-[#e1f4e1] rounded-[10px] w-[50px] h-[50px] flex justify-center items-center">
                      <UserCheck className="w-8 h-8 p-1   text-[#2aa92a]" />
                    </i>
                    <aside className="ml-[10px]">
                      <h6 className="text-[16px] font-bold ">
                        {countData?.ready_to_process || 0}
                      </h6>
                      <p className="uppercase text-[14px] text-[#3f9a3f]">
                        {" "}
                        Ready to Process
                      </p>
                    </aside>
                  </div>
                  <div className="absolute bottom-[-60px] left-0  w-[200%]  ">
                    <img
                      src={hubdashbg}
                      className=" m-auto mt-2 [filter:sepia(11111)_saturate(5)_hue-rotate(403deg)] opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div
                className="col-span-12 lg:col-span-3 "
                data-aos="fade-up"
                data-aos-duration="1500"
              >
                <div className="h-full  relative overflow-hidden w-full  bg-gradient-to-r from-[#f0f7ff] via-[#fbfcff] to-[#fff] rounded-[10px] p-[15px] border-2 border-[#fff] flex">
                  <div className="flex relative z-[1]">
                    <i className=" bg-blue-100 rounded-[10px] w-[50px] h-[50px] flex justify-center items-center">
                      <CalendarCheck className="w-8 h-8 p-1   text-blue-500" />
                    </i>
                    <aside className="ml-[10px]">
                      <h6 className="text-[16px] font-bold ">
                        {countData?.booked || 0}
                      </h6>
                      <p className="uppercase text-[14px] text-[#4a8ad4]">
                        {" "}
                        Ready To Execute
                      </p>
                    </aside>
                  </div>
                  <div className="absolute bottom-[-60px] left-0  w-[200%]  ">
                    <img
                      src={hubdashbg}
                      className="m-auto mt-2 [filter:sepia(2)_saturate(12)_hue-rotate(163deg)] opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div
                className="col-span-12 lg:col-span-3 "
                data-aos="fade-up"
                data-aos-duration="1900"
              >
                <div className="h-full  relative overflow-hidden w-full  bg-gradient-to-r from-[#fff6f6] via-[#fbfcff] to-[#fff] rounded-[10px] p-[15px] border-2 border-[#fff] flex">
                  <div className="flex relative z-[1]">
                    <i className=" bg-[#ffe6e6] rounded-[10px] w-[50px] h-[50px] flex justify-center items-center">
                      <Loader className="w-8 h-8 p-1   text-[#ff5353]" />
                    </i>
                    <aside className="ml-[10px]">
                      <h6 className="text-[16px] font-bold ">
                        {countData?.insufficient || 0}
                      </h6>
                      <p className="uppercase text-[14px] text-[#f04646]">
                        {" "}
                        Held Up
                      </p>
                    </aside>
                  </div>
                  <div className="absolute bottom-[-60px] left-0  w-[200%]  ">
                    <img
                      src={hubdashbg}
                      className="m-auto mt-2 [filter:sepia(2)_saturate(12)_hue-rotate(333deg)] opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div
            className="relative z-[10]  bg-white rounded-[10px] p-4 w-full     border border-[#fff]"
            data-aos="fade-up"
          >
            <div className="grid grid-cols-12  gap-2 ">
              <div className="col-span-12 lg:col-span-2">
                <h3>Search By</h3>
                <div
                  className={`relative w-full ${
                    selectedOptions?.length >= 1 ? "mt-0" : ""
                  }`}
                  ref={dropdownRef}
                >
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full bg-[#efb847] h-[38px] text-white px-3 py-[7px] rounded-md font-medium  flex justify-between items-center uppercase"
                  >
                    Select <ChevronDown className=" w-[17px]" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-full bg-white border rounded-md shadow-md z-30">
                      {options.map((option) => (
                        <div key={option.id} className="flex items-center p-2">
                          <input
                            type="checkbox"
                            id={option.id}
                            checked={selectedOptions.includes(option.id)}
                            // checked={(e: any) => {
                            //   selectedOptions.includes(option.id);
                            // }}
                            onChange={(e: any) => {
                              handleCheckboxChange(option.id);
                              if (
                                !e.target.checked &&
                                option.id == "Franchisee"
                              ) {
                                const newdata = { ...inputs };
                                delete newdata["franchisee_id"];
                                setInputs(newdata);
                                setSelectedfranchisedata(intfranchiseedata);
                              } else if (
                                !e.target.checked &&
                                option.id == "Destination"
                              ) {
                                const newdata = { ...inputs };
                                delete newdata["dest_country_id"];
                                setInputs(newdata);
                                setSelecteddata(intselecteddata);
                              } else if (
                                !e.target.checked &&
                                option.id == "Chargeable Weight"
                              ) {
                                const newdata = { ...inputs };
                                delete newdata["weight"];
                                setInputs(newdata);
                              }
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={option.id}>{option.label}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Input Fields Section (Right by Right) */}
              {/* <div
                className={`min-[548px]:grid grid-cols-${selectedOptions?.length} gap-2  md:mt-2 sm:mt-2`}
              > */}
              {selectedOptions?.map((optionId) => (
                <>
                  {optionId == "Franchisee" ? (
                    <div className="col-span-12 lg:col-span-3">
                      <FormLabel className="inline-block text-left w-full mb-[3px] text-[14px] text-[#4c4c4c]">
                        Franchisee
                      </FormLabel>
                      <CommonSearchableAll
                        apiEndpoint={`/admin/franchisee-settings`}
                        placeholder={"Search For  Franchisee"}
                        selecteddata={selectedfranchisedata}
                        setSelecteddata={setSelectedfranchisedata}
                        fun1={fun1}
                        comingselectedname={"franchisee_name"}
                        comingselectedid={"franchisee_id"}
                        funtoempty={fun2}
                        zIndex={20}
                        key1={"key"}
                        // border={error?.franchisee ? true : false}
                      />
                    </div>
                  ) : optionId == "Destination" ? (
                    <div className="col-span-12 lg:col-span-3">
                  <FormLabel className="inline-block text-left w-full mb-[3px] text-[14px] text-[#4c4c4c]">
                        Destination
                      </FormLabel>
                      <CommonSearchableAll
                        apiEndpoint={"/admin/country"}
                        placeholder={"Search For Country"}
                        selecteddata={selecteddata}
                        setSelecteddata={setSelecteddata}
                        fun1={fun3}
                        key1={"country"}
                        comingselectedname={"country_name"}
                        comingselectedid={"country_id"}
                        funtoempty={fun3toempty}
                        zIndex={20}
                      />
                    </div>
                  ) : (
                    <div className="col-span-12 lg:col-span-2">
                  <FormLabel className="inline-block text-left w-full mb-[3px] text-[14px] text-[#4c4c4c]">
                        Chargeable Weight
                      </FormLabel>
                      <FormInput
                        type="number"
                        placeholder="Chargeable Weight"
                        value={inputs["weight"] || ""}
                        onChange={(e) => {
                          setInputs((pre: any) => ({
                            ...pre,
                            weight: e.target.value.replace(/[^0-9.]/g, ""),
                          }));
                        }}
                      />
                    </div>
                  )}
                </>
              ))}
              {/* </div> */}
              {/* Search Button */}
              {selectedOptions.length > 0 && (
                <div className="col-span-12 lg:col-span-2">
                  <div className="flex items-center gap-2 mt-[22px]">
                    <Button
                      onClick={() => {
                        setDatatoget((pre: any) => ({
                          ...pre,
                          franchisee_id: inputs?.franchisee_id || "",
                          destination_country: inputs?.dest_country_id || "",
                          weight: Number(inputs?.weight) || "",
                          refresh: !pre?.refresh,
                        }));
                      }}
                     className="bg-mustard text-white px-2 py-2  rounded-md border-none h-[38px] w-full"
                    >
                      {/* <Search className="w-[16px] h-[16px] mr-2" /> Search */}Search
                    </Button>
                    <Button
                      onClick={handleReset}
                      disabled={checkisEmpty(inputs) ? true : false}
                     className="bg-red-400 text-white px-2 py-2 rounded-md  border-none h-[38px] w-full"
                    >
                      {/* <RefreshCcw className="w-[16px] h-[16px] mr-2" /> Reset */}Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 h-auto gap-4 mt-4">
          <div className=" NewtableBox min-h-auto lg:h-full bg-white rounded-md justify-between shadow-blue-900 border border-[#fff]  ">
            <div className=" tbaleTittle p-2 bg-[#e9edf2] flex justify-between items-center rounded-t-md  ">
              <div className="flex items-end gap-2">
                <h2 className="text-sm font-medium">Initiated Jobs </h2>
                <Tippy
                  content="Create New Job"
                  options={{ placement: "right" }}
                >
                  <Link to="/hub/operation/initiate-job">
                    <PlusCircle className="text-mustard" />
                  </Link>
                </Tippy>
              </div>

              <div className="tableSearch relative w-200">
                <FormInput
                  className="h-[30px] w-full rounded-md border border-[#e5e7eb] pl-3 pr-10 text-sm focus:border-[#f0b646] focus:ring-[#f0b646]"
                  id="vertical-form-1"
                  type="text"
                  placeholder="Search "
                  onChange={(e) => {
                    setDatatoget((pre: any) => ({
                      ...pre,
                      search4: e.target.value.replace(/\s/g, ""),
                      page4: 1,
                    }));
                  }}
                />

                <button className=" searchListTable absolute top-[6px] right-2 text-stone-300">
                  <Search className="w-[17px] h-[17px]" />
                </button>
              </div>
            </div>

            <div className={`p-3 ${isActive ? "showtable" : "hideTable"}`}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : (
                <div>
                  {initiatedJobs.length == 0 ? (
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
                          currentPage={Number(datatoget?.page4)}
                          ops={1}
                        />
                      </div>
                      <CommonPagination
                        onPageChange={(e) => handlePageChange(e, 4)}
                        page={Number(datatoget?.page4)}
                        totalpages={Number(datatoget?.totalpages4)}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <ReadyToProcess
            loadCountData={loadCountData}
            countryData={countryData}
            franchiseeData={franchiseeData}
            page={datatoget?.page1}
            search={datatoget?.search1}
            totalPages={datatoget?.totalpages1}
            handlePageChange={handlePageChange}
            datatoget={datatoget}
            setDatatoget={setDatatoget}
          />

          <ReadyToExecute
            loadCountData={loadCountData}
            countryData={countryData}
            franchiseeData={franchiseeData}
            page={datatoget?.page2}
            search={datatoget?.search2}
            totalPages={datatoget?.totalpages2}
            handlePageChange={handlePageChange}
            datatoget={datatoget}
            setDatatoget={setDatatoget}
          />

          <Executed
            loadCountData={loadCountData}
            countryData={countryData}
            franchiseeData={franchiseeData}
            page={datatoget?.page3}
            search={datatoget?.search3}
            totalPages={datatoget?.totalpages3}
            handlePageChange={handlePageChange}
            datatoget={datatoget}
            setDatatoget={setDatatoget}
          />
        </div>
      </div>
      <style>
        {`
          button[data-headlessui-state="open"] {
            border-color: #f0b646;
            color: #f0b646;
          }
        `}
      </style>
      <Modal
        open={open}
        setOpen={setOpen}
        title="Confirm"
        size="md"
        description={description}
        footer={footer}
      />
    </>
  );
};

export default index;
