import { useEffect, useState } from "react";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import {
  Get_country,
  Get_franchise,
  Get_shipment,
  Get_spot_list,
  Get_vendor,
  common_get,
  common_post,
  common_put,
  get_booking_status_list,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import SpotPricingForm from "./spot_pricing_form";
import { foreignFormat, formatDate } from "../../../utils";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import { Eye, Scale, Search, Upload, User, UserCog } from "lucide-react";
import { useDebounce } from "../../../components/Search";
import CommonPagination from "../../../components/Pagination";
import CommonSearchableAll from "../../../components/commonSearchableAll";
import { unparse } from "papaparse";
import { Menu } from "../../../base-components/Headless";
import { ChevronDown } from "lucide-react";
import { Edit } from "lucide-react";
import { FileText } from "lucide-react";
import LoadingIcon from "../../../base-components/LoadingIcon";
import axios from "axios";
import Tippy from "../../../base-components/Tippy";
import { useLogin } from "../../../components/LoginContext";

const intfranchiseedata = {
  franchisee_name: "",
  franchisee_id: "",
};

const intgetdata = {
  from_date: "",
  to_date: "",
};
const intrequestdata = {
  mawb: "",
  hawb: "",
};
const intpredata = {
  house: "",
  master: "",
  status: "",
};
const index = ({ pdata }) => {
  const [getSpotList, setGetSpotList] = useState<Array<any>>([]);
  const [requestdata, setRequestdata] = useState<any>(intrequestdata);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(true);
  const [vendorData, setVendorData] = useState<any>(null);
  const [franchiseeData, setFranchiseeData] = useState<any>(null);
  const [pickDataforForm, setPickDataforForm] = useState<any>(null);
  const [formChangeBtn, setFormChangeBtn] = useState<boolean>(false);
  const [requestModal, setRequestModal] = useState<boolean>(false);
  const [countryData, setCountryData] = useState<Array<any>>([]);
  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);
  const { showAlert } = useAlert();
  const [selectedfranchisedata, setSelectedfranchisedata] =
    useState<any>(intfranchiseedata);
  const [franchiseId, setFranchiseeId] = useState<any>("");
  const [hit, setHit] = useState<any>(1);
  const [datatoget, setDatatoget] = useState<any>(intgetdata);
  const [isLoading, setIsLoading] = useState(false);
  const [enquiryId, setEnquiryId] = useState<any>("");
  const [pricingStatus, setPricingStatus] = useState<any>("");
  const [open2, setOpen2] = useState<boolean>(false);
  const [rowData, setRowData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [requestloading, setRequestLoading] = useState<boolean>(false);
  const [prerequeteddata, setpreRequesteddata] = useState<any>(intpredata);
  const [uploadmodal, setUploadModal] = useState<boolean>(false);
  const [uploadloading, setUploadloading] = useState<boolean>(false);
  const [multipleFile, setMultipleFile] = useState(null);
  const [modalData, setModalData] = useState<any>({});
  const [masterdocsdata, setMasterdocsdata] = useState<any>([]);
  const [shipmentTypes, setShipmentTypes] = useState<any>([]);
  const {statusdata}=useLogin()
  const handlePagechange = (e: number) => {
    setPage(e);
  };

  const handlechange = (e: any) => {
    const { name, value } = e.target;
    setDatatoget((pre: any) => ({ ...pre, [name]: value }));
    setPage(1);
    setGetSpotList([]);
    setHit(3);
  };
  const handleCancel = () => {
    setRequestdata(intrequestdata);
    setRequestModal(false);
    setUploadModal(false);
    setModalData({});
    setUploadloading(false);
  };
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const debouncedSearchTerm = useDebounce<string>(enquiryId, 500);
  useEffect(() => {
    getVendor();
    getFranchisee();
    getCountry();
    Get_shipment().then((res: any) => {
      setShipmentTypes(res?.data?.data || []);
    });
  }, []);

  useEffect(() => {
    getspotlistdata(2);
  }, [page, debouncedSearchTerm]);

  const getCountry = async () => {
    const res: any = await Get_country();
    setCountryData(res?.data?.data);
  };
  const getspotlistdata = async (value: any) => {
    if (value == 2) {
      try {
        setLoading(true);
        const response = await Get_spot_list(
          hub_id,
          debouncedSearchTerm,
          20,
          page - 1,
          selectedfranchisedata?.franchisee_id,
          datatoget?.from_date,
          datatoget?.to_date,
          pricingStatus
        );

        if (response.status == 200) {
          setGetSpotList(response.data.data);
          setTotalPages(Math.ceil(response?.data?.total / 20));
        } else if (response?.status == 204) {
          showAlert("No data found!", "warning");
          setGetSpotList([]);
        } else showAlert(response.data.message, "error");
      } catch (error) {
        console.log(error);
        showAlert("Something went wrong with status list!", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const getAllBookingStatus = async () => {
    try {
      const res = await get_booking_status_list();
      if (res?.status === 200) {
        setBookingStatuses(res?.data?.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllBookingStatus();
  }, []);

  const getVendor = async () => {
    const res: any = await Get_vendor();
    try {
      if (res?.status == 200) {
        setVendorData(res?.data?.data);
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  const getFranchisee = async () => {
    const res: any = await Get_franchise();
    try {
      if (res?.status == 200) {
        setFranchiseeData(res?.data?.data);
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  const fun1 = (value: any) => {
    setFranchiseeId(value?.franchisee_id);
  };
  const funtoempty = () => {
    setSelectedfranchisedata(intfranchiseedata);
    setHit(3);
    setFranchiseeId("");
  };

  const funcOpenDoc = (data: any) => {
    if (data) {
      window.open(`${data}?${Math.random()}`, "_blank", "noopener,noreferrer");
    } else {
      showAlert("This Doc is not available", "warning");
    }
  };
  console.log(prerequeteddata, "prerequestdata");
  const checkrequest = async (job_id: any) => {
    try {
      const res = await common_get(
        `/booking/house-approval-list?job_id=${job_id}`
      );
      if (res?.status == 200) {
        setpreRequesteddata(res?.data?.data[0]);
      } else {
        setpreRequesteddata(intpredata);
      }
    } catch (err: any) {
      console.log(err?.message);
    }
  };

  const handlerequest = async (data: any) => {
    try {
      setRequestLoading(true);
      const res = await common_post("/booking/house-approval ", {
        master: data?.mawb || "",
        house: data?.hawb,
        job_id: data?.job_id,
        remark: data?.remark || "",
      });
      if (res?.status == 200) {
        showAlert(
          res?.data?.message || res?.data?.msg || "Request Send Successfully"
        );
        handleCancel();
        //  await checkrequest(data?.job_id);
      } else if (res?.response?.status == 400) {
        showAlert(
          res?.response?.data?.message || res?.response?.data?.msg,
          "error"
        );
      } else {
        showAlert(
          res?.response?.data?.message ||
          res?.response?.data?.msg ||
          "Something going wrong please try after some time!!..",
          "error"
        );
      }
    } catch (err: any) {
      console.log(err?.message);
    } finally {
      setRequestLoading(false);
    }
  };
  const uploadChecklist = async () => {
    setUploadloading(true);
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
      const res: any = await common_put("/booking/upload-master-doc", formData);
      if (res?.status == 200) {
        setMultipleFile(null);
        setModalData({});
        setUploadModal(false);
        showAlert(res?.data?.message || "Uploaded Successfully");
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
      setUploadloading(false);
    }
  };
  const columns = [
    { field: "action", headerName: "Action", textAlign: "text-center" },
    { field: "status", headerName: "Status", textAlign: "text-left" },
    { field: "booking_no", headerName: "Enquiry Id", textAlign: "text-left" },
    {
      field: "created_date",
      headerName: "Enquiry Date",
      textAlign: "text-left",
    },
    { field: "franchisee", headerName: "Franchisee", textAlign: "text-left" },
    { field: "org_city", headerName: "Origin", textAlign: "text-left" },
    { field: "dest_city", headerName: "Destination", textAlign: "text-left" },
    { field: "weight", headerName: "Weight", textAlign: "text-left" },
    { field: "vendor", headerName: "Vendor", textAlign: "text-left" },
    {
      field: "shipment_type_value",
      headerName: "Shipment Type",
      textAlign: "text-left",
    },
    { field: "quoted_by", headerName: "Quoted By", textAlign: "text-left" },
    {
      field: "buy_price",
      headerName: "Buy Price (₹)",
      textAlign: "text-right",
    },
    {
      field: "spot_price",
      headerName: "Sell Price (₹)",
      textAlign: "text-right",
    },
    // {
    //   field: "overseas_price",
    //   headerName: "Overseas Currency Price",
    //   textAlign: "text-right",
    // },
    { field: "doc", headerName: "Document", textAlign: "text-left" },
    {
      field: "valid_till",
      headerName: "Rate Valid Till",
      textAlign: "text-left",
    },
    {
      field: "airwaybilno",
      headerName: "AirwaybillNo",
      textAlign: "text-left",
    },
    { field: "master", headerName: "MAWBNo", textAlign: "text-left" },
    { field: "weight_slab", headerName: "Weight Slab", textAlign: "text-left" },
  ];

  const description2 = (
    <>
      <FormLabel className="">Enquiry Docs</FormLabel>
      <div className="text-center flex-wrap lg:flex-nowrap flex gap-2 items-center">
        <Button
          className=" p-2 bg-mustard w-[120px] text-white border-none"
          onClick={() => funcOpenDoc(rowData?.proforma_url)}
        >
          Performa
        </Button>
        <Button
          className="p-2 bg-green-400 w-[120px] text-white  border-none"
          onClick={() => funcOpenDoc(rowData?.house_draft)}
        >
          House Draft
        </Button>
        <Button
          className="p-2 bg-blue-400 w-[120px] text-white  border-none"
          onClick={() => funcOpenDoc(rowData?.house_pdf)}
        >
          House Pdf
        </Button>
      </div>
      {masterdocsdata?.length >= 1 ? (
        <div className="mt-4  p-2">
          <FormLabel>Master Docs</FormLabel>
          <div className="grid grid-cols-3 gap-4">
            {masterdocsdata?.map((item: any, index: number) => (
              <Tippy content={`${decodeURIComponent(item?.split("/").pop())}`}>
                <Button
                  className="mr-2 p-2 bg-mustard  text-white  w-[120px]"
                  onClick={() => funcOpenDoc(item)}
                >
                  Doc ({index + 1})
                </Button>
              </Tippy>
            ))}
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
  const description3 = (
    <div className="">
      {(prerequeteddata?.new_house || prerequeteddata?.new_master) &&
        prerequeteddata?.status == 0 ? (
        <div>
          <div className=" bg-gray-400 rounded-lg shadow p-2">
            <h1>
              {" "}
              <span>Requested MAWB :</span>
              <span className="text-mustard font-bold text-lg">
                {" "}
                {prerequeteddata?.new_master}
              </span>
            </h1>
            <h1>
              {" "}
              <span>Requested HAWB :</span>
              <span className="text-mustard font-bold text-lg">
                {prerequeteddata?.new_house}
              </span>
            </h1>
            <h1>
              {" "}
              <span>Remarks :</span>
              <span className="text-mustard font-bold text-lg">
                {prerequeteddata?.remark}
              </span>
            </h1>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 grid min-[556px]:grid-cols-2 gap-5 shadow-lg rounded p-2 pb-4">
          <div>
            <FormLabel>
              HAWB
              {/* <span className="text-red-500 ml-2">*</span> */}
            </FormLabel>
            <FormInput
              value={requestdata?.hawb}
              placeholder="HAWB"
              // disabled={mawborhawb?.house}
              onChange={(e: any) =>
                setRequestdata((pre: any) => ({
                  ...pre,
                  hawb: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <FormLabel>
              MAWB
              {/* <span className="text-red-500 ml-2">*</span> */}
            </FormLabel>
            <FormInput
              value={requestdata?.mawb}
              // disabled={mawborhawb?.master}
              placeholder="Enter MAWB "
              onChange={(e: any) =>
                setRequestdata((pre: any) => ({
                  ...pre,
                  mawb: e.target.value,
                }))
              }
            />
          </div>
          <div className="col-span-2">
            <FormLabel>
              REMARKS
              {/* <span className="text-red-500 ml-2">*</span> */}
            </FormLabel>
            <FormInput
              value={requestdata?.remark}
              placeholder="Enter Remark"
              // disabled={mawborhawb?.house}
              onChange={(e: any) =>
                setRequestdata((pre: any) => ({
                  ...pre,
                  remark: e.target.value,
                }))
              }
            />
          </div>
        </div>
      )}
    </div>
  );

  const uploaddocsdescription = (
    <div className="flex justify-between items-end mb-4">
      <div className="w-full">
        <FormLabel htmlFor="upload_hawb">
          Upload Docs <span className="text-red-500">*</span>
        </FormLabel>
        <FormInput
          type="file"
          placeholder="Choose File"
          multiple
          onChange={(e) => {
            const files = e.target.files;
            setMultipleFile(files);
          }}
        />
      </div>
    </div>
  );
  const Uploadfooter = (
    <div className="flex gap-2 justify-end items-end ">
      <Button
        className="px-4 py-2  border-none bg-red-400 text-white  "
        onClick={() => {
          handleCancel();
        }}
      >
        Cancel
      </Button>
      <div>
        <Button
          disabled={!multipleFile || uploadloading}
          className="px-4 py-2  border-none bg-mustard text-white   "
          onClick={() => uploadChecklist()}
        >
          {uploadloading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
  const footer3 = (
    <div className="flex gap-2 justify-between ">
      <Button
        className=" bg-gray-400 text-white w-[100px] "
        onClick={() => {
          handleCancel();
        }}
      >
        Cancel
      </Button>
      <div>
        {(prerequeteddata?.new_house || prerequeteddata?.new_master) &&
          prerequeteddata?.status == 0 ? (
          <Button className="px-4 py-2 bg-blue-400 text-white   border-none" disabled>
            Approval Pending
          </Button>
        ) : (
          <Button
            disabled={
              (!requestdata?.hawb && !requestdata?.mawb) || requestloading
            }
            className="px-4 py-2 bg-mustard text-white   border-none"
            onClick={() => handlerequest(requestdata)}
          >
            {requestloading ? "Requesting..." : "Change Request (Mawb/Hawb)"}
          </Button>
        )}
      </div>
    </div>
  );
  const renderUploadDocsOption = (item) => (
    <Menu.Item
      onClick={() => {
        setUploadModal(true);
        setModalData(item);
      }}
    >
      <Upload className="w-4 mr-2" /> Upload Docs
    </Menu.Item>
  );
  const row: any = getSpotList?.map((item: any, index: number) => {
    let isStatus;
    switch (Number(item?.booking_status)) {
      case 0:
        isStatus = (
          <Menu>
            <Menu.Button
              as={Button}
              variant="primary"
              className="bg-blue-100 text-blue-500 border-blue-500"
            >
              <UserCog className="w-5 stroke-2.5" />
              <ChevronDown className="w-4 stroke-2.5 mt-1" />
            </Menu.Button>
            <Menu.Items
              className="w-48 z-50 "
              placement={`${(index == getSpotList.length - 1 ||
                  index == getSpotList?.length - 2 ||
                  index == getSpotList?.length - 3 ||
                  index == getSpotList?.length - 4) &&
                  getSpotList?.length >= 4
                  ? "top-start"
                  : "bottom-start"
                }`}
            >
              <Menu.Item
                onClick={() => {
                  setOpenModal(true);
                  setPickDataforForm({
                    ...item,
                    booking_id: item?.id,
                    booking_status: 0,
                    freight_price:
                      item?.price_type == 1
                        ? Number(
                          Number(item?.spot_price) / Number(item?.weight)
                        )?.toFixed(2)
                        : Number(item?.spot_price),
                  });
                }}
              >
                <Edit className="w-4 mr-2" /> Action
              </Menu.Item>
              {renderUploadDocsOption(item)}
            </Menu.Items>
          </Menu>
        );
        break;
      case 1:
      case 2:
      case 6:
        isStatus = (
          <Menu>
            <Menu.Button
              as={Button}
              variant="primary"
              className="bg-blue-100 text-blue-500 border-blue-500"
            >
              <UserCog className="w-5 stroke-2.5" />
              <ChevronDown className="w-4 stroke-2.5 mt-1" />
            </Menu.Button>
            <Menu.Items
              className="w-48 z-50"
              placement={`${index >= getSpotList.length - 4 && getSpotList?.length >= 4
                  ? "top-start"
                  : "bottom-start"
                }`}
            >
              {renderUploadDocsOption(item)}
            </Menu.Items>
          </Menu>
        );
        break;
      case 4:
        isStatus = (
          <>
            <Menu>
              <Menu.Button
                as={Button}
                variant="primary"
                className="bg-blue-100 text-blue-500 border-blue-500"
              >
                <UserCog className="w-5 stroke-2.5" />
                <ChevronDown className="w-4 stroke-2.5 mt-1" />
              </Menu.Button>
              <Menu.Items
                className="w-48 z-50 "
                placement={`${(index == getSpotList.length - 1 ||
                    index == getSpotList?.length - 2 ||
                    index == getSpotList?.length - 3 ||
                    index == getSpotList?.length - 4) &&
                    getSpotList?.length >= 4
                    ? "top-start"
                    : "bottom-start"
                  }`}
              >
                <Menu.Item
                  onClick={() => {
                    setOpenModal(true);
                    setPickDataforForm({
                      ...item,
                      booking_id: item?.id,
                      freight_price:
                        Number(item?.spot_price) / Number(item?.weight),
                    });
                    setFormChangeBtn(true);
                  }}
                >
                  {" "}
                  <Scale /> Change Weight
                </Menu.Item>
                {renderUploadDocsOption(item)}
              </Menu.Items>
            </Menu>
            {/* <Button
              className="bg-mustard  border-none py-1 px-2 text-white"
              onClick={() => {
                setOpenModal(true);
                setPickDataforForm({
                  ...item,
                  booking_id: item?.id,
                  freight_price:
                    Number(item?.spot_price) / Number(item?.weight),
                });
                setFormChangeBtn(true);
              }}
            >
              <Scale /> Change Weight
            </Button> */}
          </>
        );
        break;
      case 5:
      case 12:
        isStatus = (
          <Menu>
            <Menu.Button
              as={Button}
              variant="primary"
              className="bg-blue-100 text-blue-500 border-blue-500"
            >
              <UserCog className="w-5 stroke-2.5" />
              <ChevronDown className="w-4 stroke-2.5 mt-1" />
            </Menu.Button>
            <Menu.Items
              className="w-48 z-50 "
              placement={`${(index == getSpotList.length - 1 ||
                  index == getSpotList?.length - 2 ||
                  index == getSpotList?.length - 3 ||
                  index == getSpotList?.length - 4) &&
                  getSpotList?.length >= 4
                  ? "top-start"
                  : "bottom-start"
                }`}
            >
              {pdata?.update_permission ? (
                <Menu.Item
                  onClick={async () => {
                    setRequestModal(true);
                    setRequestdata((pre: any) => ({
                      ...pre,
                      job_id: item?.job_id,
                      mawb: item?.master || "",
                      hawb: item?.house,
                    }));
                    await checkrequest(item?.job_id);
                  }}
                >
                  <FileText className="w-4 mr-2" /> Change Awb/MAWB
                </Menu.Item>
              ) : (
                ""
              )}
              {Number(item?.booking_status) == 12 ? (
                <Menu.Item
                  onClick={() => {
                    setOpenModal(true);
                    setPickDataforForm({
                      ...item,
                      booking_id: item?.id,
                      freight_price:
                        item?.price_type == 1
                          ? Number(
                            Number(item?.spot_price) / Number(item?.weight)
                          ).toFixed(2)
                          : Number(item?.spot_price),
                    });
                    setFormChangeBtn(true);
                  }}
                >
                  {" "}
                  <Scale /> Change Weight
                </Menu.Item>
              ) : (
                ""
              )}
              {renderUploadDocsOption(item)}
            </Menu.Items>
          </Menu>
        );

        break;

      default:
        isStatus = (
          <Menu>
            <Menu.Button
              as={Button}
              variant="primary"
              className="bg-blue-100 text-blue-500 border-blue-500"
            >
              <UserCog className="w-5 stroke-2.5" />
              <ChevronDown className="w-4 stroke-2.5 mt-1" />
            </Menu.Button>
            <Menu.Items
              className="w-48 z-50 "
              placement={`${(index == getSpotList.length - 1 ||
                  index == getSpotList?.length - 2 ||
                  index == getSpotList?.length - 3 ||
                  index == getSpotList?.length - 4) &&
                  getSpotList?.length >= 4
                  ? "top-start"
                  : "bottom-start"
                }`}
            >
              <Menu.Item
                onClick={() => {
                  setOpenModal(true);
                  setPickDataforForm({
                    ...item,
                    booking_id: item?.id,
                    freight_price:
                      item?.price_type == 1
                        ? Number(
                          Number(item?.spot_price) / Number(item?.weight)
                        ).toFixed(2)
                        : Number(item?.spot_price),
                  });
                  setFormChangeBtn(true);
                }}
              >
                {" "}
                <Scale /> Change Weight
              </Menu.Item>
              {renderUploadDocsOption(item)}
            </Menu.Items>
          </Menu>
        );
    }
let isStatus2 = (
  <p
    className={`text-base ${
      item?.booking_status == 15
        ? item?.import_booking == 2
          ? "text-green-400"
          : item?.is_checklist == 1
          ? "text-green-400"
          : "text-red-400"
        : statusdata?.find(
            (s: any) => s.status_code == item?.booking_status
          )?.css_class
    } whitespace-nowrap`}
  >
    {item?.booking_status == 15
      ? item?.import_booking == 2
        ? "Customer Approval Pending"
        : item?.is_checklist == 1
        ? "CheckList Done"
        : "CheckList Pending"
      : statusdata?.find(
          (s: any) => s.status_code == item?.booking_status
        )?.status_name}
  </p>
);

   
    
    // const docdata = (
    //   <div className="flex justify-center">
    //     <Eye
    //       className="cursor-pointer"
    //       onClick={() => {
    //         setRowData(item);
    //         setOpen2(true);
    //       }}
    //     />
    //   </div>
    // );
    const docdata = (
      <div className="flex justify-center">
        <Eye
          className="cursor-pointer"
          onClick={async () => {
            try {
              const res = await common_get(
                `/booking/get-job-docs/${item?.job_id}`
              );
              if (res?.status == 200) {
                const masterdocs = res?.data?.data[0]?.master_doc || [];
                if (masterdocs?.length >= 1) {
                  setMasterdocsdata(masterdocs);
                } else {
                  setMasterdocsdata([]);
                }
              } else {
                setMasterdocsdata([]);
              }
            } catch (err: any) {
              console.log(err?.message);
            } finally {
              setRowData(item);
              setOpen2(true);
            }
          }}
        />
      </div>
    );

    const createddate = <p>{formatDate(item?.created_date)}</p>;

    const forFranchiseedata = (
      <p>
        {franchiseeData?.find(
          (elem: any) => elem.franchisee_id == item?.franchisee_id
        )?.franchisee_name || "-"}
      </p>
    );

    const weightdata = (
      <p>
        {Number(item?.weight).toFixed(2) || "-"}
        {item?.weight_unit ? `(${item.weight_unit})` : "-"}
      </p>
    );

    const forVendordata = (
      <p>
        {vendorData?.find((elem: any) => elem.product_id == item?.courier_id)
          ?.product_name || "-"}
      </p>
    );

    const buyprice = (
      <p>
        {item.buy_price}
        {item.buy_price && item?.price_type == "1"
          ? "(a)"
          : item.buy_price && item?.price_type == "2"
            ? "(k)"
            : "N.A."}
      </p>
    );
    const sellprice = (
      <p>
        {item?.franchisee_currency || ""}
        {foreignFormat(item?.spot_price_foreign_currency) || "0.00"}
        {item.spot_price && item?.price_type == "1"
          ? "(a)"
          : item.spot_price && item?.price_type == "2"
            ? "(k)"
            : " "}
      </p>
    );
    const validtill = <p>{formatDate(item?.valid_till)}</p>;

    const airway = <p>{item?.airwaybilno || "N.A."}</p>;

    const mawbno = <p>{item?.master || "N.A."}</p>;

    const weightSlabdata = (
      <p>
        {item?.weight_from}-{item?.weight_to}
      </p>
    );

    //  const overseasPrice = (
    //    <>
    //      {item?.franchisee_currency || ""}
    //      {"  "}
    //      {foreignFormat(item?.spot_price_foreign_currency) || "0.00"}
    //    </>
    //  );

    return {
      action: isStatus,
      status: isStatus2,
      ...item,
      created_date: createddate,
      franchisee: forFranchiseedata,
      weight: weightdata,
      vendor: forVendordata,
      shipment_type_value:
        shipmentTypes?.find(
          (data: any) => data?.booking_shipment_type_id == item?.shipment_type
        )?.shipment_type || "-",
      buy_price: buyprice,
      spot_price: sellprice,
      // overseas_price: overseasPrice,
      valid_till: validtill,
      airwaybilno: airway,
      master: mawbno,
      doc: docdata,

      weight_slab: weightSlabdata,
    };
  });

  const description = (
    <p className="text-center">
      Would you like to take action on this enquiry?
    </p>
  );

  const footer = (
    <div className="flex justify-end gap-4">
      <Button
        className="px-4 py-2 rounded-md border-none bg-mustard text-white hover:bg-green-500 ml-2"
        onClick={() => {
          setShowForm(false);
          setOpenModal(false);
        }}
      >
        Ok
      </Button>
    </div>
  );

  // Convert JSON data to CSV and trigger download
  const convertJSONtoCSV = async (data: any[] = [], fileName: string) => {
    const csv = unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Format data to be CSV-ready
  const formatData = (data: any) => {
    if (!data?.length > 0) return [{ "No Data Found": "" }];
    return data?.map((item: any, index: number) => ({
      "Sr. No.": `${index + 1}.`,
      "Enquiry Id": item?.booking_no,
      "Enquiry Date": item?.created_date,
      Franchisee:
        franchiseeData?.find(
          (elem: any) => elem.franchisee_id == item?.franchisee_id
        )?.franchisee_name || "-",
      Origin: item?.org_city,
      Destination: item?.dest_city,
      Weight: item?.weight,
      Vendor:
        vendorData?.find((elem: any) => elem.product_id == item?.courier_id)
          ?.product_name || "-",
      shipment_type_value:
        shipmentTypes?.find(
          (data: any) => data?.booking_shipment_type_id == item?.shipment_type
        )?.shipment_type || "-",
      "Quoted By": item?.quoted_by,
      "Buy Price":
        item.buy_price + item.buy_price && item?.price_type == "1"
          ? "(a)"
          : item.buy_price && item?.price_type == "2"
            ? "(k)"
            : "N.A.",
      "Sell Price": item.spot_price,
      "Rate Valid Till": formatDate(item?.valid_till),
      AirwaybillNo: item?.airwaybilno || "N.A.",
      MAWBNo: item?.master || "N.A.",
      "Weight Slab":
        item?.weight_from != null && item?.weight_to != null
          ? `${item?.weight_from}-${item?.weight_to}`
          : "N.A",
    }));
  };

  return (
    <>
      {showForm ? (
        <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">

  

   <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <FileText  className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                 Spot Pricing Enquiry List
                  </h4>
                </div>
              </div>

              <div className="flex items-center w-full lg:w-auto">
                

<div className="flex-wrap lg:flex-nowrap flex gap-2 w-full lg:w-auto">
          
                <div className="relative flex-wrap lg:flex-nowrap flex gap-2 w-full lg:w-[240px]">
                  <FormInput
                    className="px-2 py-2 h-[36px] text-[13px] pr-[20px]  w-full border-none "
                    type="text"
                    value={enquiryId}
                    onChange={(e) => {
                      setEnquiryId(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Enter Enq_Id/AWB/MAWB"
                  />
                  <Search className="absolute top-[10px] right-2 w-4 h-4 text-[#ccc]" />
                </div>
              
          
            <div className="">
              <Button
                className="p-2 bg-success text-white border-none px-3 py-2"
                // disabled={csvSpinner}
                onClick={() =>
                  convertJSONtoCSV(formatData(getSpotList), "spot_pricing.csv")
                }
              >
                Download
                {/* {csvSpinner && <LoadingIcon icon="puff" className="ml-2" />} */}
              </Button>
            </div>

  </div>






              </div>
            </div>
          </div>





          <div className="fw-full p-2 lg:p-3 border-b border-gray-200 bg-[#f1f1f1]">
            <div className="grid grid-cols-12  gap-2 ">
              <div className="col-span-12 lg:col-span-3">
                <FormLabel className="!mb-0 text-[13px]">
                  Search By Franchisee<span className="text-red-400">*</span>
                </FormLabel>
                <CommonSearchableAll
                  apiEndpoint={`/admin/franchisee-settings`}
                  placeholder={"Search By Franchisee"}
                  selecteddata={selectedfranchisedata}
                  setSelecteddata={setSelectedfranchisedata}
                  fun1={fun1}
                  comingselectedname={"franchisee_name"}
                  comingselectedid={"franchisee_id"}
                  funtoempty={funtoempty}
                  key1={"key"}
                // questionmark={true}
                />
              </div>
              <div className="col-span-6 lg:col-span-2">
                <FormLabel className="!mb-0 text-[13px]">Enquiry Date (from)</FormLabel>
                <FormInput
                  name="from_date"
                  onChange={handlechange}
                  value={datatoget?.from_date}
                  max={datatoget?.to_date}
                  type="date"
                />
              </div>
              <div className="col-span-6 lg:col-span-2">
                <FormLabel className="!mb-0 text-[13px]">Enquiry Date (To)</FormLabel>
                <FormInput
                  value={datatoget?.to_date}
                  onChange={handlechange}
                  name="to_date"
                  min={datatoget?.from_date}
                  type="date"
                />
              </div>
               <div className="col-span-12 lg:col-span-3">
                <FormLabel className="!mb-0 text-[13px]">Pricing Status</FormLabel>
                <FormSelect
                  name="booking_status"
                  value={pricingStatus}
                  onChange={(e: any) => {
                    setPricingStatus(e.target.value);
                    setPage(1);
                    getspotlistdata([]);
                    setHit(3);
                  }}
                >
                  <option value="">Select</option>
                  {statusdata?.map((item:any)=><option value={item?.status_code}>{item?.status_name}</option>)}
               
                </FormSelect>
              </div>
           <div className="col-span-12 lg:col-span-2">
                {" "}
                <Button
                  className="bg-mustard p-2 text-white w-full mt-[21px] border-none "
                  onClick={() => getspotlistdata(2)}
                  disabled={isLoading}
                >
                  {isLoading && hit == 2 ? "Searcing.." : "Search"}
                </Button>
              </div>
            </div>
          </div>
    <div className="p-2  lg:p-6">
            {getSpotList?.length > 0 ? (
              <>
                <Table
                  heightTable="60vh"
                  columns={columns}
                  row={row}
                  listheight={"h-[100vh]"}
                  loading={loading}
                  margin={"mt-[100px]"}
                  currentPage={page}
                />
                <CommonPagination
                  totalpages={totalpages}
                  onPageChange={handlePagechange}
                  page={page}
                />
              </>
            ) : (
              <>
                {loading ? (
                  <LoadingIcon />
                ) : (
                  <p className="mt-4 text-gray-400 text-center">
                    No Data Found!
                  </p>
                )}
              </>
            )}
          </div>
        </div>
     </div>
    ) : (
        <SpotPricingForm
          showForm={showForm}
          setShowForm={setShowForm}
          pickDataforForm={pickDataforForm}
          setPickDataforForm={setPickDataforForm}
          vendorData={vendorData}
          getspotlistdata={getspotlistdata}
          formChangeBtn={formChangeBtn}
          setFormChangeBtn={setFormChangeBtn}
        />
      )}
      <Modal
        open={openModal}
        title="Confirm"
        size="md"
        setOpen={setOpenModal}
        description={description}
        footer={footer}
      />
      <Modal
        open={open2}
        setOpen={setOpen2}
        title=""
        size="md"
        description={description2}
        footer=""
      />
      <Modal
        open={requestModal}
        setOpen={setRequestModal}
        title="Request"
        size="md"
        description={description3}
        footer={footer3}
        handlecancel={handleCancel}
      />
      {uploadmodal && (
        <Modal
          open={uploadmodal}
          setOpen={setUploadModal}
          title={"Upload Docs"}
          description={uploaddocsdescription}
          footer={Uploadfooter}
          gridColumns={6}
          handlecancel={handlechange}
          size={"md"}
        />
      )}
    </>
  );
};

export default index;
