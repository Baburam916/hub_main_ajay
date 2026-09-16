import React, { useEffect, useState } from "react";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import TomSelect from "../../../base-components/TomSelect";
import { Calendar, File, Search, Trash2, Upload } from "lucide-react";
import Table from "../../../components/Table";
import {
  Get_kyc_document,
  Get_kyc_organization,
  Inscan_outscan_csv,
  Inscan_outscan_date,
  Inscan_outscan_report,
  Inscan_outscan_report_approval,
  Inscan_outscan_report_delete_doc,
  Inscan_outscan_search,
  Inscan_outscan_search_full,
  UploadKycApi,
  UploadShipperInvoice,
} from "../../../AllServices/services";
import { InscanOutscanReport } from "../../../DataTypes/dataTypes";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";
import Modal from "../../../components/Modal/index";
import noPreview from "/images/no-preview.png";
import Lucide from "../../../base-components/Lucide";
import { unparse } from "papaparse";
import { formatDate } from "../../../utils";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";

const index = () => {
  const { showAlert } = useAlert();
  const [toDate, setToDate] = useState<any>();
  const [fromDate, setFromDate] = useState<any>();
  const [spinner, setSpinner] = useState<boolean>(false);
  const [documentType1, setDocumentType1] = useState("");
  const [documentType2, setDocumentType2] = useState("");
  const [tableData, setTableData] = useState<Array<any>>([]);

  const [organizationType, setOrganizationType] = useState<any>("");
  const [kycDocumentList, setKycDocumentList] = useState<Array<any>>([]);
  const [selectApprovalType, setSelectApprovalType] = useState<Array<any>>([]);
  const [selectShipmentType, setSelectShipmentType] = useState<Array<any>>([]);
  const [kycOrganizationList, setKycOrganizationList] = useState<Array<any>>(
    [],
  );
  const [file1, setFile1] = useState<any>(null);
  const [file2, setFile2] = useState<any>(null);
  const [fileShipper, setFileShipper] = useState<any>(null);
  const [uploadParticular, setUploadParticularData] = useState<any>();
  const [spinnerModal, setSpinnerModal] = useState<boolean>(false);
  const [spinnerModalInv, setSpinnerModalInv] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openModal1, setOpenModal1] = useState<boolean>(false);
  const [printCsvData, setPrintCsv] = useState<Array<any>>([]);
  const [csvSpinner, setCsvSpinner] = useState<boolean>(false);
  const [manifestSearch, setManifestSearch] = useState<any>("");
  const [toggleSearch, setToggleSearch] = useState<boolean>(false);

  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const debouncedSearchTerm = useDebounce<string>(manifestSearch, 500);
  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);
  const [fullAirwaybillSearch, setFullAirwaybillSearch] = useState<any>("");
  const [searchToggle, setSearchToggle] = useState<any>();

  console.log("FUllAirwaybill", fullAirwaybillSearch);

  const debouncedFull = useDebounce<string>(fullAirwaybillSearch, 500);

  const handlePagechange = (e: number) => {
    setPage(e);
  };
  const getKycOrganizationList = async () => {
    try {
      const response = await Get_kyc_organization();
      if (response.status == 200) setKycOrganizationList(response.data.data);
      else setKycOrganizationList([]);
    } catch (error) {
      console.log(error);
    }
  };
  const getKycDocumentList = async () => {
    try {
      const response = await Get_kyc_document();
      if (response.status == 200) setKycDocumentList(response.data.data);
      else setKycDocumentList([]);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getKycDocumentList();
    getKycOrganizationList();
  }, []);

  const onSubmit = async () => {
    setSpinner(true);
    const inscanOutscanReport: InscanOutscanReport = {
      from_date: fromDate,
      to_date: toDate,
      approve_status: selectApprovalType,
      shipment_type: selectShipmentType,
    };
    let response;
    try {
      response = await Inscan_outscan_report(inscanOutscanReport);

      if (response.status == 200) {
        setTableData(response?.data?.data.result);
        // console.log("TRTY",response?.data?.data.result?.length)
        const data = response?.data?.data.result || [];
        inscanOutscanDate(data);
        setToggleSearch(true);
        setTotalPages(Math.ceil(response?.data?.data?.count / 20));
      } else if (response?.status === 204) {
        showAlert("No data found!", "warning");
      } else showAlert(response.data.errors[0], "warning");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  const searching = async () => {
    const inscanOutscanReport: InscanOutscanReport = {
      from_date: fromDate,
      to_date: toDate,
      approve_status: selectApprovalType,
      shipment_type: selectShipmentType,
    };
    let response;
    try {
      setSearchToggle(2);
      response = await Inscan_outscan_search(
        inscanOutscanReport,
        debouncedSearchTerm,
        20,
        page - 1,
      );

      if (response.status == 200) {
        setTableData(response?.data?.data.result);
        setTotalPages(Math.ceil(response?.data?.data?.count / 20));
      } else if (response?.status === 204) {
        showAlert("No data found!", "warning");
      } else showAlert(response.data.errors[0], "warning");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  const searchAirwayFull = async () => {
    let response;
    let data = {
      search: debouncedFull,
    };

    try {
      setSearchToggle(1);
      response = await Inscan_outscan_search_full(data);
      // console.log("response",response?.data?.data?.result)
      if (response?.status == 200 || []) {
        const matchedElement = response?.data?.data?.result?.filter((elem) =>
          elem?.airwaybilno?.includes(debouncedFull),
        );

        if (matchedElement && matchedElement.length > 0) {
          // Set data if there are matches
          setTableData(matchedElement);
        } else {
          // Clear table data when no matches are found
          setTableData([]);
        }
      } else if (response?.status == 204) {
        setTableData([]);
      }
    } catch (error) {
      console.log(error);
      if (response?.response?.status == 406) {
        showAlert(response?.response?.data.errors[0].msg, "warning");
      } else {
        showAlert("Something went wrong!", "error");
      }
    }
  };
  useEffect(() => {
    if (fromDate && toDate) {
      searching();
    }
  }, [debouncedSearchTerm, page]);

  useEffect(() => {
    if (debouncedFull) {
      searchAirwayFull();
    }
  }, [debouncedFull]);

  const updateInscanOutscan = async (
    shipperId: Number,
    approveStatus: Number,
  ) => {
    const data = {
      shipper_id: shipperId,
      approved_by: emp_id,
      approve_status: approveStatus,
    };
    try {
      const response = await Inscan_outscan_report_approval(data);
      if (response.status == 200) {
        onSubmit();
        showAlert(response.data.message, "success");
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      showAlert("Something went wrong!", "warning");
    }
  };

  const deleteInscanOutscanDoc = async (
    shipperId: Number,
    pickupId: Number,
    docType: Number,
  ) => {
    const data = {
      shipper_id: shipperId,
      pickup_id: pickupId,
      type_doc: docType,
    };
    try {
      const response = await Inscan_outscan_report_delete_doc(data);
      if (response.status == 200) {
        if (searchToggle == 1) {
          searchAirwayFull();
        } else if (searchToggle == 2) {
          searching();
        }
        // onSubmit();

        // setFullAirwaybillSearch('')

        showAlert(response.data.message, "success");
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      showAlert("Something went wrong!", "warning");
    }
  };

  const handleKycUpload = async () => {
    try {
      const formData = new FormData();
      if (organizationType) {
        formData.append("organization", organizationType);
      } else {
        showAlert("Please select organisation type", "error");
        return;
      }
      if (documentType1) {
        formData.append("organization_document1", documentType1);
      } else {
        showAlert("Please select document one type", "error");
        return;
      }
      if (file1) {
        formData.append("document_1", file1);
      } else {
        showAlert("Please upload document one", "error");
        return;
      }
      if (documentType2) {
        formData.append("organization_document2", documentType2);
      } else {
        showAlert("Please  select document two type", "error");
        return;
      }
      if (file2) {
        formData.append("document_2", file2);
      } else {
        showAlert("Please upload document two", "error");
        return;
      }

      formData.append("shipper_id", uploadParticular?.shipper_id);
      formData.append("pickup_id", uploadParticular?.pickup_id);
      setSpinner(true);
      setSpinnerModal(true);

      let response: any;
      try {
        response = await UploadKycApi(formData);
        if (response?.status == 200) {
          setTableData(response?.data?.data);
          setOpenModal(false);
          onSubmit();
          showAlert(
            response?.data?.message_v1
              ? response?.data?.message_v1
              : response?.data?.message,
            response?.data?.message_v1 ? "warning" : "success",
          );
          if (searchToggle == 1) {
            searchAirwayFull();
          } else if (searchToggle == 2) {
            searching();
          }
          // onSubmit();
        } else if (response.status == 406) {
          showAlert("No data found!", "warning");
        } else if (response.status == 204) {
          showAlert("No data found!", "warning");
        } else showAlert(response.data.message, "warning");
      } catch (err: any) {
        console.log(err);
        if (response.response.status == 406) {
          showAlert(response.response.data.errors[0].msg, "warning");
        } else showAlert(response.response.data.message, "error");
      } finally {
        setSpinnerModal(false);
      }
    } catch (error) {
      showAlert("Error uploading KYC documents", "error");
    } finally {
      setSpinner(false);
    }
  };

  const handleShipperUpload = async () => {
    const formData1 = new FormData();
    if (fileShipper) {
      formData1.append("inv_doc", fileShipper);
    } else {
      showAlert("Please select document one type", "error");
      return;
    }
    formData1.append("shipper_id", uploadParticular?.shipper_id);
    formData1.append("pickup_id", uploadParticular?.pickup_id);
    setSpinnerModalInv(true);
    let response: any;
    try {
      response = await UploadShipperInvoice(formData1);
      if (response?.status == 200) {
        setTableData(response?.data?.data);
        setOpenModal1(false);
        showAlert(response?.data?.message, "success");
        if (searchToggle == 1) {
          searchAirwayFull();
        } else if (searchToggle == 2) {
          searching();
        }
      } else if (response.status == 406) {
        showAlert("No data found!", "warning");
      } else if (response.status == 204) {
        showAlert("No data found!", "warning");
      } else showAlert(response.data.message, "warning");
    } catch (err: any) {
      console.log(err);
      if (response.response.status == 406) {
        showAlert(response.response.data.errors[0].msg, "warning");
      } else showAlert(response.response.data.message, "error");
    } finally {
      setSpinnerModalInv(false);
    }
  };

  const description = (
    <>
      <div>
        <FormLabel>Organization</FormLabel>
        <FormSelect
          onChange={(e) => {
            setOrganizationType(e.target.value);
            setDocumentType1("");
            setDocumentType2("");
          }}
          value={organizationType}
          aria-label="Default select example"
        >
          <option value="">Select </option>
          {kycOrganizationList?.map((item: any) => (
            <option value={item?.id}>{item?.value}</option>
          ))}
        </FormSelect>
      </div>
      <div className="mt-2">
        <FormLabel>Document 1</FormLabel>
        <div className="">
          <div className="grid grid-cols-2 gap-2">
            <FormSelect
              onChange={(e) => setDocumentType1(e.target.value)}
              value={documentType1}
              aria-label="Default select example"
            >
              <option value="">Select </option>
              {organizationType &&
                kycDocumentList
                  ?.find((elem) => elem.organisation_id == organizationType)
                  ?.value?.filter((item: any) => item.id != documentType2)
                  ?.map((document: any, index: any) => (
                    <option key={index} value={document.id}>
                      {document.value}
                    </option>
                  ))}
            </FormSelect>
            <FormInput
              type="file"
              onChange={(e: any) => setFile1(e.target.files[0])}
            />
          </div>
        </div>
      </div>
      <div className="mt-2">
        <FormLabel>Document 2</FormLabel>
        <div className="">
          <div className="grid grid-cols-2 gap-2">
            <FormSelect
              onChange={(e) => setDocumentType2(e.target.value)}
              value={documentType2}
              aria-label="Default select example"
            >
              <option value="">Select </option>
              {organizationType &&
                kycDocumentList
                  ?.find((elem) => elem.organisation_id == organizationType)
                  ?.value?.filter((item: any) => item.id != documentType1)
                  ?.map((document: any, index: any) => (
                    <option key={index} value={document.id}>
                      {document.value}
                    </option>
                  ))}
            </FormSelect>
            <FormInput
              type="file"
              onChange={(e: any) => setFile2(e.target.files[0])}
            />
          </div>
        </div>
      </div>
      <div>
        <Button
          disabled={spinnerModal}
          onClick={handleKycUpload}
          className="bg-mustard text-white py-2 px-4 mt-2"
        >
          Save {spinnerModal && <LoadingIcon icon="puff" className="ml-2" />}
        </Button>
      </div>
    </>
  );

  const description1 = (
    <>
      <FormLabel>Upload Shipper Invoice</FormLabel>
      <FormInput
        type="file"
        onChange={(e: any) => setFileShipper(e.target.files[0])}
      />
      <Button
        onClick={handleShipperUpload}
        disabled={spinnerModalInv}
        className="bg-mustard text-white py-2 px-4 mt-2"
      >
        Save {spinnerModalInv && <LoadingIcon icon="puff" className="ml-2" />}
      </Button>
    </>
  );
  const handleKycCheckImg = (dataa: any) => {
    const imageUrl = dataa;
    window.open(imageUrl, "_blank");
    console.log("dataimg", dataa);
  };

  const inscanOutscanDate = async (data: any) => {
    const inscanOutscanReport: InscanOutscanReport = {
      from_date: fromDate,
      to_date: toDate,
    };
    let response;
    try {
      response = await Inscan_outscan_date(inscanOutscanReport);
      const newdata = response?.data?.data?.inscan || [];
      // console.log("table", data)
      const modifieddata = data?.map((item) => {
        const airwaybilno = item.airwaybilno;
        console.log(newdata[airwaybilno], "check");

        return {
          ...item,
          matchingValue: newdata[airwaybilno] || "N.A",
        };
      });
      const newdata2 = response?.data?.data?.outscan || [];

      const modifieddata2 = data?.map((item) => {
        const airwaybilno = item.airwaybilno;
        console.log(newdata[airwaybilno], "check");

        return {
          ...item,
          matchingValue2: newdata2[airwaybilno] || "N.A",
        };
      });
      //  console.log(modifieddata,"modified data")
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  const columns = [
    { field: "franchisee_name", headerName: "Franchisee Name" },
    { field: "airwaybilno", headerName: "Airwaybill No" },
    { field: "booking_date", headerName: "Booking Date" },
    { field: "courier_name", headerName: "Courier Name" },
    { field: "scan", headerName: "Scan Status" },
    { field: "inscan_date", headerName: "Inscanned Date" },
    { field: "outscan_date", headerName: "Outscanned Date" },
    { field: "shipment_type", headerName: "Shipment Type" },
    { field: "status", headerName: "Status" },
    { field: "view_kyc", headerName: "View Kyc" },
    { field: "kyc", headerName: "Upload / Replace kyc" },
    // { field: "view_shipper", headerName: "View Shipper"},
    { field: "shipper", headerName: "Upload Shipper Invoice" },
    { field: "is_approved", headerName: "Approve Kyc" },
  ];

  const row: any = tableData?.map((item: any) => {
    const shipper = item?.shipper_invoice;
    const kycData = item.kyc_data;
    // const outscanDate = item?.outscan_date== null ? 'N.A.' : item?.outscan_date
    let isApproveStatus;
    let text = (data: any) => (
      <Button
        onClick={() => updateInscanOutscan(item.shipper_id, data.value)}
        className={`px-2 py-1 rounded bg-${data.bgColor} text-white`}
      >
        {data.text}
      </Button>
    );
    switch (item.approved_status) {
      case 1:
        isApproveStatus = text({
          text: "Reject",
          bgColor: "red-500",
          value: "0",
        });
        break;
      default:
        isApproveStatus = text({
          text: "Approve",
          bgColor: "green-500",
          value: "1",
        });
    }

    const viewKycBtns = (
      <>
        {kycData && kycData.document_id_1 && kycData.document_path_1 ? (
          <div className="flex justify-center items-center">
            <Button
              onClick={() => handleKycCheckImg(kycData.document_path_1)}
              className="px-2 py-1 rounded bg-green-400 text-white"
            >
              {
                kycDocumentList
                  ?.find((val) => val.organisation_id == kycData.orgnization_id)
                  ?.value?.find((ele: any) => ele.id == kycData.document_id_1)
                  ?.value
              }
            </Button>
            <Trash2
              className="cursor-pointer"
              onClick={() =>
                deleteInscanOutscanDoc(item.shipper_id, item.pickup_id, 1)
              }
              size={"20px"}
            />
          </div>
        ) : null}
        {kycData && kycData.document_id_2 && kycData.document_path_2 ? (
          <div className="flex justify-center items-center">
            <Button
              onClick={() => handleKycCheckImg(kycData.document_path_2)}
              className="px-2 py-1 rounded bg-blue-400 text-white"
            >
              {
                kycDocumentList
                  .find((val) => val.organisation_id == kycData.orgnization_id)
                  ?.value?.find((ele: any) => ele.id == kycData.document_id_2)
                  ?.value
              }
            </Button>
            <Trash2
              className="cursor-pointer"
              onClick={() =>
                deleteInscanOutscanDoc(item.shipper_id, item.pickup_id, 2)
              }
              size={"20px"}
            />
          </div>
        ) : null}
      </>
    );
    const uploadKyc = (
      <div className="flex justify-center">
        <Upload
          className="cursor-pointer"
          onClick={() => {
            setOpenModal(true);
            setUploadParticularData(item);
          }}
        />
      </div>
    );
    const shipperInvoice = (
      <div className="flex justify-center">
        <Upload
          className="cursor-pointer"
          onClick={() => {
            setOpenModal1(true);
            setUploadParticularData(item);
          }}
        />
        {shipper != "N/A" ? (
          <File className="ml-2" onClick={() => handleKycCheckImg(shipper)} />
        ) : (
          ""
        )}
      </div>
    );

    return {
      ...item,
      is_approved: isApproveStatus,
      view_kyc: viewKycBtns,
      kyc: uploadKyc,
      shipper: shipperInvoice,
      outscan_date: item?.matchingValue2 || "N.A.",
      inscan_date: item?.matchingValue || "N.A.",
    };
  });

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

  const formatData = (data: any) => {
    if (!data?.length > 0) return [{ "No Data Found": "" }];
    return data?.map((item: any, index: number) => ({
      "Sr. No.": `${index + 1}.`,
      // "Created Date": item?.created_date,
      "Franchisee Name": item?.franchisee_name,
      "Airwaybill Number": item?.airwaybilno,
      "Booking Date": formatDate(item?.booking_date),
      "Courier Name": item?.courier_name,
      "Scan Status": item?.scan,
      "Inscan Date": formatDate(item?.inscan_date),
      "Shipment Type": item?.shipment_type,
      Status: item?.status,
      "Approved Status":
        item?.approved_status == null ? "Unapproved" : "Approved",
    }));
  };

  const csvDataForPrint = async () => {
    const inscanOutscanReport: InscanOutscanReport = {
      from_date: fromDate,
      to_date: toDate,
      // approve_status: selectApprovalType,
      // shipment_type: selectShipmentType,
    };
    setCsvSpinner(true);
    try {
      const res: any = await Inscan_outscan_csv(inscanOutscanReport);
      console.log("RETY", res?.data?.data?.result);
      if (res?.status == 200) {
        setPrintCsv(res?.data?.data?.result);
        // setPrintCsv([])
        convertJSONtoCSV(
          formatData(res?.data?.data?.result),
          "inscan_outscan.csv",
        );
      } else if (res?.status == 204) {
        setPrintCsv([]);
      } else {
        showAlert("Something went wrong!", "error");
      }
    } catch (err: any) {
      console.error("Error fetching CSV data:", err);
    } finally {
      setCsvSpinner(false);
    }
  };

  return (
    <>
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Calendar className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    Inscanned VS Outscanned
                  </h4>
                </div>
              </div>

              <div className="flex items-center w-full lg:w-auto">
             
                  <div className="relative flex justify-between items-center w-full lg:w-auto">
                    <FormInput
                      placeholder="Search Airwaybill"
                      className="p-2 rounded-md h-[35px] w-full lg:w-auto"
                      value={fullAirwaybillSearch}
                      onChange={(e) => {
                        setFullAirwaybillSearch(e.target.value.toUpperCase());
                        // searchAirwayFull()
                        // manifestInward();
                      }}
                    />
                    <Search className="absolute right-2 w-4 h-4 text-[#ccc]" />
                
                </div>
              </div>
            </div>
          </div>

          <div className="w-full p-2 lg:p-3 border-b border-gray-200 bg-[#f1f1f1]">
            <div className="grid grid-cols-12 gap-2 lg:gap-3">
              <div className="col-span-6 lg:col-span-2">
                <FormLabel htmlFor="regular-form-1" className="!mb-0">
                  From Date
                </FormLabel>
                <FormInput
                  id="regular-form-1"
                  type="date"
                  value={fromDate}
                  onChange={(e: any) => setFromDate(e.target.value)}
                  placeholder="Search..."
                />
              </div>
              <div className="col-span-6 lg:col-span-2">
                <FormLabel htmlFor="regular-form-1" className="!mb-0">
                  To Date
                </FormLabel>
                <FormInput
                  id="regular-form-1"
                  type="date"
                  value={toDate}
                  onChange={(e: any) => setToDate(e.target.value)}
                  placeholder="Search..."
                />
              </div>
              <div className="col-span-12 lg:col-span-3">
                <FormLabel htmlFor="regular-form-1" className="!mb-0">
                  Shipment Type
                </FormLabel>
                <TomSelect
                  value={selectShipmentType}
                  onChange={(e) => {
                    setSelectShipmentType(e);
                  }}
                  className="w-full bg-white"
                  multiple
                >
                  <option value="1">Non Document</option>
                  <option value="2">Document</option>
                </TomSelect>
              </div>

              <div className="col-span-12 lg:col-span-3">
                <FormLabel htmlFor="regular-form-1" className="!mb-0">
                  Approval Type
                </FormLabel>
                <TomSelect
                  value={selectApprovalType}
                  onChange={(e) => {
                    setSelectApprovalType(e);
                  }}
                  className="w-full bg-white"
                  multiple
                >
                  <option value="0">Unapproved</option>
                  <option value="1">Approved</option>
                </TomSelect>
              </div>
              <div className="col-span-12 lg:col-span-2">
                <div className="flex mt-[20px]">
                  <Button
                    disabled={spinner || !fromDate || !toDate}
                    onClick={() => {
                      // setPage(1)
                      onSubmit();
                    }}
                    className="border-none py-2 px-4 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
                  >
                    Search{" "}
                    {spinner && <LoadingIcon icon="puff" className="ml-2" />}
                  </Button>
                </div>
              </div>
            </div>
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
          <div>
            <FormLabel htmlFor="regular-form-1">Approval Type</FormLabel>
            <TomSelect
              value={selectApprovalType}
              onChange={(e) => {
                setSelectApprovalType(e);
              }}
              className="w-full"
              multiple
            >
              <option value="0">Unapproved</option>
              <option value="1">Approved</option>
            </TomSelect>
          </div>
          <div className="flex mt-6 ml-4">
            <Button
              disabled={spinner}
              onClick={() => {
                onSubmit();
              }}
              className="mt-1 py-2 px-4 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
            >
              Search {spinner && <LoadingIcon icon="puff" className="ml-2" />}
            </Button>
          
          </div>
        </div> */}
          </div>

          <div className="p-2  lg:p-6">
            <div className="w-full">
              <div className="relative flex justify-end items-center w-100">
                {toggleSearch && (
                  <>
                    <div className="mr-2 ">
                      <Button
                        variant="outline-secondary"
                        className="w-full sm:w-auto pt-1 pb-1 pl-2 pr-2 rounded-xl"
                        disabled={csvSpinner}
                        onClick={() => {
                          csvDataForPrint();
                        }}
                      >
                        <Lucide icon="FileText" className="w-4 h-4 mr-2" />
                        Export
                        {csvSpinner && (
                          <LoadingIcon icon="puff" className="ml-2" />
                        )}
                      </Button>
                    </div>
                    <FormInput
                      placeholder="Search..."
                      className="w-[30%] pr-8 pt-1 pb-1 rounded-xl"
                      value={manifestSearch}
                      onChange={(e) => {
                        setManifestSearch(e.target.value);

                        setPage(1);
                      }}
                    />
                    <Search className="absolute right-1 w-5 h-5" />
                  </>
                )}
              </div>
              {tableData?.length > 0 ? (
                <>
                  <Table
                    columns={columns}
                    row={row}
                    heightTable="32vh"
                    currentPage={page || 0}
                  />
                  <CommonPagination
                    totalpages={totalpages}
                    onPageChange={handlePagechange}
                    page={page}
                  />
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-center mt-4">
                    No Data Found!
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={openModal}
        size="lg"
        title=""
        setOpen={setOpenModal}
        description={description}
        footer={null}
      />
      <Modal
        open={openModal1}
        size="md"
        title=""
        setOpen={setOpenModal1}
        description={description1}
        footer={null}
      />
    </>
  );
};

export default index;
