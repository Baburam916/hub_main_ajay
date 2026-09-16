import React, { useEffect, useRef, useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";
import CommonPagination from "../../../components/Pagination";
import Table from "../../../components/Table";
import { useDebounce } from "../../../components/Search";
import NoData from "../../../../src/assets/images/no-data.jpg";
import {
  ApproveChecklist_Api,
  Get_country,
  Get_Enquiry_list,
  Get_franchise,
  MailChecklist_Api,
  ShippingBill_Api,
  UploadChecklist_Api,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { downloadAttachment, formatDateWithoutTime } from "../../../utils";
import Modal from "../../../components/Modal";
import { ChevronDown, Search, Send, Upload } from "lucide-react";
import { Check } from "lucide-react";
import { Menu } from "../../../base-components/Headless";
import { FileText, User, ClipboardList } from "lucide-react";

const index = () => {
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checklistData, setChecklistData] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [countryData, setCountryData] = useState([]);
  const [franchiseData, setFranchiseData] = useState([]);
  const [uploadSpinner, setUploadSpinner] = useState(false);
  const [approveSpinner, setApproveSpinner] = useState(false);
  const [modalData, setModalData] = useState({});
  const [open, setOpen] = useState(false);
  const uploadSingleFile = useRef<HTMLInputElement | null>(null);
  const [singleFile, setSingleFile] = useState(null);
  const uploadMultipleFile = useRef<HTMLInputElement | null>(null);
  const [multipleFile, setMultipleFile] = useState(null);
  const uploadMailFile = useRef<HTMLInputElement | null>(null);
  const [mailFile, setMailFile] = useState(null);
  const [mailSpinner, setMailSpinner] = useState(false);
  const [shippingBill, setShippingBill] = useState(null);
  const [shippingBillSpinner, setShippingBillSpinner] = useState(false);
  const shippingBillFile = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: any, forWhat: any) => {
    const files = event.target.files;
    if (forWhat == 1 && files.length == 1) {
      setSingleFile(files[0]);
    } else if (forWhat == 2 && files.length >= 1) {
      setMultipleFile(files);
    } else if (forWhat == 3 && files.length == 1) {
      setMailFile(files[0]);
    } else if (forWhat == 4 && files.length == 1) {
      setShippingBill(files[0]);
    } else {
      if (forWhat == 1) {
        uploadSingleFile.current.value = null;
        setSingleFile(null);
      } else if (forWhat == 2) {
        uploadMultipleFile.current.value = null;
        setMultipleFile(null);
      } else if (forWhat == 3) {
        uploadMailFile.current.value = null;
        setMailFile(null);
      } else if (forWhat == 4) {
        shippingBillFile.current.value = null;
        setShippingBill(null);
      }
    }
  };

  const columns = [
    { field: "action", headerName: "Action" },
    { field: "created_date", headerName: "Date" },
    { field: "booking_no", headerName: "Enquiry No." },
    { field: "checklist_docs", headerName: "Checklist Docs" },
    { field: "franchisee_name", headerName: "Franchisee" },
    { field: "weight", headerName: "Weight" },
    { field: "country_name", headerName: "Destination" },
    { field: "booking_status", headerName: "Status" },
  ];

  const rows = checklistData?.map((item: any) => {
    const Action = (
      <Button
        className="text-white bg-mustard p-1 border-none"
        onClick={() => {
          setModalData(item);
          setOpen(true);
        }}
      >
        Action
      </Button>
    );

    const Docs =
      item?.checklist_docs?.length > 0 ? (
        <Menu>
          <Menu.Button
            as={Button}
            variant="primary"
            className="bg-blue-100 text-blue-500 border-blue-500"
          >
            <FileText className="w-5 stroke-2.5" />
            <ChevronDown className="w-4 stroke-2.5 mt-1" />
          </Menu.Button>
          <Menu.Items className="w-48 z-50" placement="custom">
            {item?.checklist_docs?.map((ele, index) => (
              <Menu.Item
                key={index}
                onClick={() => downloadAttachment(ele, `Document ${index + 1}`)}
              >
                <FileText className="w-4 mr-2" /> Document {index + 1}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
      ) : (
        <p className="text-gray-400">Not Yet Done</p>
      );

    const Checklist = (
      <>
        {item?.is_checklist == 1 ? (
          <p className=" text-green-500 text-base ">Done</p>
        ) : item?.is_checklist == 0 ? (
          <p className=" text-mustard text-base ">Pending</p>
        ) : (
          "N.A."
        )}
      </>
    );

    const Status = (
      <>
        {item?.booking_status == 1 ? (
          <p className=" text-green-500 text-base ">Pricing Approved</p>
        ) : item?.booking_status == 8 ? (
          <p className=" text-mustard text-base ">CC Pending</p>
        ) : item?.booking_status == 9 ? (
          <p className=" text-green-500 text-base ">CC Approved</p>
        ) : item?.booking_status == 10 ? (
          <p className=" text-red-500 text-base ">CC Rejected</p>
        ): item?.booking_status == 14 ? (
          <p className=" text-red-500 text-base ">Insufficient Balance</p>
        ) : item?.booking_status == 15 && item?.is_checklist == 1 ? (
          <p className=" text-green-500 text-base ">Checklist Done</p>
        ) : item?.booking_status == 15 && item?.is_checklist == 0 ? (
          <p className=" text-mustard text-base ">Checklist Pending</p>
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
      checklist_docs: Docs,
      booking_status: Status,
      action: item?.is_checklist == 1 ? Checklist : Action,
    };
  });

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
          booking_status: [1, 5, 8, 9, 10, 14, 15],
        },
        debouncedSearch.trim() || ""
      );
      if (res?.status == 200) {
        setChecklistData(res?.data?.data || []);
        setTotalPages(Math.ceil(res?.data?.total / 20));
      } else {
        setChecklistData([]);
        setTotalPages(1);
      }
    } catch (error) {
      showAlert(error?.message, "error");
    } finally {
      setIsLoading(false);
    }
  };
  const uploadChecklist = async (job_id: any = "") => {
    setUploadSpinner(true);
    try {
      const formData = new FormData();
      formData.append("job_id", modalData?.job_id);
      if (!multipleFile) {
        showAlert("Please upload a file", "warning");
        return;
      }
      Array.from(multipleFile)?.forEach((file: any) => {
        formData.append("files", file);
      });
      const res = await UploadChecklist_Api(formData);
      if (res?.status == 200) {
        uploadMultipleFile.current.value = null;
        setMultipleFile(null);
        getEnquiryData();
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
      if (error) showAlert("something went wrong", "error");
    } finally {
      setUploadSpinner(false);
    }
  };
  const approveChecklist = async (job_id: any = "") => {
    setApproveSpinner(true);
    try {
      const formData = new FormData();
      formData.append("job_id", modalData?.job_id);
      if (!singleFile) {
        showAlert("Please upload a file", "warning");
        return;
      }
      formData.append("file", singleFile);
      const res = await ApproveChecklist_Api(formData);
      if (res?.status == 200) {
        uploadSingleFile.current.value = null;
        setSingleFile(null);
        setOpen(false);
        getEnquiryData();
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
      if (error) showAlert("something went wrong", "error");
    } finally {
      setApproveSpinner(false);
    }
  };

  const sendChecklistMail = async () => {
    setMailSpinner(true);

    try {
      const formData = new FormData();
      formData.append("job_id", modalData?.job_id);
      if (!mailFile) {
        showAlert("Please upload a file", "warning");
        return;
      }
      formData.append("file", mailFile);

      const res = await MailChecklist_Api(formData);
      if (res?.status == 200) {
        uploadMailFile.current.value = null;
        setMailFile(null);
        setOpen(false);
        getEnquiryData();
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
      if (error) showAlert("something went wrong", "error");
    } finally {
      setMailSpinner(false);
    }
  };

  const shippingBillUpload = async () => {
    setShippingBillSpinner(true);

    try {
      const formData = new FormData();
      formData.append("job_id", modalData?.job_id);
      if (!shippingBill) {
        showAlert("Please upload a file", "warning");
        return;
      }
      formData.append("file", shippingBill);

      const res = await ShippingBill_Api(formData);
      if (res?.status == 200) {
        shippingBillFile.current.value = null;
        setShippingBill(null);
        setOpen(false);
        getEnquiryData();
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
      if (error) showAlert("something went wrong", "error");
    } finally {
      setShippingBillSpinner(false);
    }
  };

  const Description = (
    <>
      <div className=" justify-between gap-4 mb-2 border border-[#ffe7b1]   bg-gradient-to-r from-[#FFF9EB] via-[#FDFDFD] to-[#FDFDFD] rounded-lg">
        <div className="border-b border-[#ffe7b1] p-2 ">
          <b>ENQUIRY No: </b>
          {modalData?.booking_no}
        </div>
        <div className="  p-2 ">
          <b>FRANCHISEE : </b>
          {
            franchiseData?.find(
              (item: any) => item?.franchisee_id == modalData?.franchisee_id
            )?.franchisee_name
          }
        </div>
      </div>

      <div className="text-left">
        <FormLabel htmlFor="regular-form-1">
          KYC Documents <span className="text-red-500">*</span>
        </FormLabel>
        <div className="flex-col lg:flex-row flex gap-4 items-end">
          <FormInput
            type="file"
            placeholder="Choose File"
            multiple
            onChange={(e) => handleFileChange(e, 2)}
            ref={uploadMultipleFile}
            className="w-full !bg-[#f1f1f1]"
          />
          <Button
            className="text-white bg-mustard p-2 border-none"
            disabled={uploadSpinner}
            onClick={uploadChecklist}
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload{" "}
            {uploadSpinner && (
              <LoadingIcon
                icon="puff"
                color="white"
                className="w-5 h-5 ml-2 stroke-2.5 text-white"
              />
            )}
          </Button>
        </div>
      </div>
      <div className="flex justify-center w-full my-4 border-t border-slate-200 dark:border-darkmode-400"></div>
      <div className="text-left">
        <FormLabel htmlFor="regular-form-1">
          Upload Checklist <span className="text-red-500">*</span>
        </FormLabel>
        <div className="flex-col lg:flex-row flex  gap-4 items-end justify-between">
          <FormInput
            type="file"
            placeholder="Choose File"

            onChange={(e) => handleFileChange(e, 3)}
            ref={uploadMailFile}
                   className="w-full lg:w-full !bg-[#f1f1f1]"
          />
          <Button
            className="text-white bg-mustard p-2 border-none "
            disabled={mailSpinner}
            onClick={sendChecklistMail}
          >
            <Send className="h-5 w-5 mr-2" />
            Send
            {mailSpinner && (
              <LoadingIcon
                icon="puff"
                color="white"
                className="w-5 h-5 ml-2 stroke-2.5 text-white"
              />
            )}
          </Button>
        </div>
      </div>
      {modalData?.checklist_email_doc && (
        <>
          <div className="flex justify-center w-full my-4 border-t border-slate-200 dark:border-darkmode-400"></div>
          <div className="text-left">
            <FormLabel htmlFor="regular-form-1">
              Approved Checklist <span className="text-red-500">*</span>
            </FormLabel>
            <div className="flex-col lg:flex-row flex gap-4 items-end">
              <FormInput
                type="file"
                placeholder="Choose File"
                onChange={(e) => handleFileChange(e, 1)}
                ref={uploadSingleFile}
                   className="w-full lg:w-full !bg-[#f1f1f1]"
              />
              <Button
                className="text-white bg-mustard p-2 border-none"
                disabled={approveSpinner}
                onClick={approveChecklist}
              >
                <Check className="mr-2 h-5 w-5" />
                Approve
                {approveSpinner && (
                  <LoadingIcon
                    icon="puff"
                    color="white"
                    className="w-5 h-5 ml-2 stroke-2.5 text-white"
                  />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
      <div className="flex justify-center w-full my-4 border-t border-slate-200 dark:border-darkmode-400"></div>
      <div className="text-left">
        <FormLabel htmlFor="regular-form-1">
          Upload Shipping Bill Document <span className="text-red-500">*</span>
        </FormLabel>
        <div className="  flex-col lg:flex-row flex gap-4 items-end justify-between">
          <FormInput
            type="file"
            placeholder="Choose File"
              className="w-full lg:w-full !bg-[#f1f1f1]"
            onChange={(e) => handleFileChange(e, 4)}
            ref={shippingBillFile}
          />
          <Button
            className="text-white bg-mustard p-2 border-none "
            disabled={shippingBillSpinner}
            onClick={shippingBillUpload}
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload
            {shippingBillSpinner && (
              <LoadingIcon
                icon="puff"
                color="white"
                className="w-5 h-5 ml-2 stroke-2.5 text-white"
              />
            )}
          </Button>
        </div>
      </div>
    </>
  );

  useEffect(() => {
    Get_country().then((res) => setCountryData(res?.data?.data));
    Get_franchise().then((res) => setFranchiseData(res?.data?.data));
  }, []);

  useEffect(() => {
    getEnquiryData();
  }, [page, debouncedSearch]);
  return (
    <>


 <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="block lg:flex items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2 mb-2 lg:mb-0">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <ClipboardList  className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                  Checklist
                  </h4>
                </div>
              </div>

              <div className="flex items-center">






      <div className="flex items-center w-full">
          <div className="relative flex justify-between items-center w-full">
            <FormInput
              className="pr-8 pt-1 pb-1 rounded-md border-none h-[35px] w-full"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value.replace(/\s/g, ""));
                setPage(1);
              }}
              placeholder="Enter Enquiry No."
            />
            <Search className="absolute right-2 w-5 h-5" />
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
          </div>

          <div className="p-2  lg:p-6">


     
	  
	  







      <div className="w-full ">
      

        {isLoading ? (
          <div className="flex justify-center mt-6">
            <LoadingIcon icon="puff" className="block w-[6%]" />
          </div>
        ) : (
          <>
            {checklistData?.length > 0 ? (
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
      </div>
      
	  




      <Modal
        open={open}
        setOpen={setOpen}
        title="Approve Checklist"
        size="lg"
        description={Description}
      />
    </>
  );
};

export default index;
