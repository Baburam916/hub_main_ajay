import React, { useEffect, useState } from "react";
import Button from "../../../base-components/Button";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import { Download, Search } from "lucide-react";
import { ArrowLeft } from "lucide-react";

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Modal from "../../../components/Modal";
import {
  Created_manifest_list,
  Create_manifest,
  Generate_manifest,
  Download_create_manifest_pdf,
  common_post,
  common_get,
  Get_Currency,
  Get_invoice,
  Create_widect_bag,
  Get_bag_data,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { GenerateManifestData } from "../../../DataTypes/dataTypes";
import LoadingIcon from "../../../base-components/LoadingIcon";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";
import { convertJSONtoCSV, formatDate } from "../../../utils";
import Table from "../../../components/Table";
import TomSelect from "../../../base-components/TomSelect";
const intmanifestdata = {};
const index = () => {
  const { showAlert } = useAlert();
  const [manifestedList, setManifestedList] = useState<Array<any>>([]);
  const [createManifestList, setCreateManifestList] = useState<Array<any>>([]);
  const [showGenerateManfest, setShowGenerateManifest] =
    useState<boolean>(false);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [pdfLink, setPdfLink] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadId, setDownloadId] = useState<any>(null);
  const [manifestSearch, setManifestSearch] = useState<any>("");
  const [page, setPage] = useState<number>(1);
  const [generateloading, setGenearteLoading] = useState<boolean>(false);
  const [totalpages, setTotalPages] = useState<number>(1);
  const [manifestModal, setManifistModal] = useState<boolean>(false);
  const [maifestData, setManifestData] = useState<any>({});
  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const debouncedSearchTerm = useDebounce<string>(manifestSearch, 500);
  const [file, setFile] = useState<any>("");
  const [puddata, setPuddata] = useState<any>([]);
  const [countrydata, setCountryData] = useState<any>([]);
  const [salesperson, setSalesperson] = useState<any>([]);
  const [franchieedata, setFranchiseedata] = useState<any>([]);
  const [courierdata, setCourierdata] = useState<any>([]);
  const [errorModal, setErrorModal] = useState<any>(false);
  const [errorMsg, setErrorMsg] = useState<Array<any>>();
  const [currencyData, setCurrencyData] = useState<Array<any>>();
  const [invoiceTerm, setInvoiceTerm] = useState<Array<any>>();
  const [widectSpinner, setWidectSpinner] = useState<boolean>(false);
  const [widectBagData, setWidectBagData] = useState<object>({"bag_list" : [],"manifest_no" : ""});
  const [widectBagModal, setWidectBagModal] = useState<boolean>(false);
  const [bagData, setBagData] = useState<Array<any>>([]);

  const handleFileChange = (e: any) => {
    const filtedata = e.target.files[0];
    if (filtedata) {
      setFile(filtedata);
    }
    return;
  };

  useEffect(() => {
    getManifestedList();
  }, [debouncedSearchTerm, page]);

  const handlePagechange = (e: number) => {
    setPage(e);
  };

  

  const getManifestedList = async () => {
    try {
      const response = await Created_manifest_list(
        hub_id,
        debouncedSearchTerm,
        20,
        page - 1
      );
      if (response.status == 200) {
        setManifestedList(response.data.data);
        setTotalPages(Math.ceil(response?.data?.count / 20));
      } else if (response.status == 204) {
        setManifestedList([]);
      }``
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }
  };

  const downloadCreateManifestPdf = async (manifest_id: any) => {
    try {
      setLoading(true);
      const response = await Download_create_manifest_pdf(manifest_id);
      if (response.status == 200) setPdfLink(response.data.data);
      else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdfLink != null) handleDownload(pdfLink);
  }, [pdfLink]);

  
  useEffect(() => {
    getintdatas();
  }, []);
  useEffect(() => {
    getCurrency();
    getBagData()
  }, []);
  useEffect(() => {
    getInvoiceTerm();
  }, []);
  const getintdatas = async () => {
    try {
      const [response, response2, response3, response4]: any =
        await Promise.allSettled([
          common_get("/admin/franchisee-settings"),
          common_get("/admin/country"),
          common_get("/admin/courier-product"),
          common_get("/admin/hub-pud"),
        ]);

      if (response?.value?.status == 200) {
        setFranchiseedata(response?.value?.data?.data || []);
      }
      if (response2?.value?.status == 200) {
        setCountryData(response2?.value?.data?.data || []);
      }
      if (response3?.value?.status == 200) {
        setFranchiseedata(response3?.value?.data?.data || []);
        setCourierdata(response3?.value?.data?.data || []);
      }
      if (response4?.value?.status == 200) {
        setPuddata(response4?.value?.data?.data || []);
      }
    } catch (err: any) {
      console.log(err?.message);
    }
  };
  const handleDownload = (pdfLink: string) => {
    const link = document.createElement("a");
    link.href = `${pdfLink}?${Math.random()}`;
    link.download = "manifest_inward";
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      field: "manifest_code",
      headerName: "Manifest No.",
      textAlign: "text-left",
    },
    {
      field: "count_of_bags",
      headerName: "Total Bags",
      textAlign: "text-right",
    },
    {
      field: "courier_name",
      headerName: "Courier Name",
      textAlign: "text-left",
    },
    {
      field: "created_date",
      headerName: "Created Date",
      textAlign: "text-left",
    },
    {
      field: "download_manifest",
      headerName: "Download Manifest",
      textAlign: "text-center",
    },
  ];

  const row = manifestedList.map((item: any) => {
    const actionButton = (
      <Button
        onClick={() => {
          setDownloadId(item.manifest_id);
          downloadCreateManifestPdf(item.manifest_id);
        }}
        disabled={loading}
        className="bg-blue-600 border-none py-2 px-4 text-white"
      >
        Download Manifest
        {loading && downloadId == item.manifest_id ? (
          <LoadingIcon icon="oval" color="white" className="w-4 h-4 ml-2" />
        ) : null}
      </Button>
    );

    return {
      ...item,
      count_of_bags: <p className="text-end">{item?.count_of_bags}</p>,
      download_manifest: actionButton,
    };
  });

  const createManifestColumn = [
    {
      field: "manifest_no",
      headerName: "Manifest No.",
      textAlign: "text-left",
    },
    { field: "total_bags", headerName: "Total Bags", textAlign: "text-right" },
    {
      field: "courier_name",
      headerName: "Courier Name",
      textAlign: "text-left",
    },
    {
      field: "shipment_status",
      headerName: "Shipment Type",
      textAlign: "text-left",
    },
    { field: "action", headerName: "Status" },
  ];

  const createManifestRow = createManifestList.map((item: any) => {
    let isStatusText;
    let text = (data: any) => (
      <p className={`px-2 py-1 rounded bg-${data.bgColor} text-white`}>
        {data.value}
      </p>
    );
    switch (item.status) {
      case 1:
        isStatusText = (
          // text({ value: "Pending", bgColor: "blue-600" });
          <div className="flex justify-center items-center ">
            <Button
              className="flex justify-center items-center p-2 bg-green-400 text-white"
              onClick={() => {
                setManifistModal(true);
                setManifestData((pre: any) => ({
                  ...pre,
                  list: item?.product_type,
                  shipment_type: item?.shipment_type,
                  bagnos: item?.bag_nos?.split(","),
                }));
              }}
            >
              Generate Manifest
            </Button>
          </div>
        );
        break;
      default:
        isStatusText = "Manifested";
    }
    return {
      ...item,
      total_bags: <p className="text-end">{item?.total_bags}</p>,
      shipment_status:
        item?.shipment_type == 0
          ? "Other Shipment Types"
          : item?.shipment_type == 7
          ? "CSB V"
          : "",
      action: isStatusText,
    };
  });

  const createManifest = async () => {
    setSpinner(true);
    try {
      const response: any = await Create_manifest(hub_id);
      if (response?.status == 200) {
        setCreateManifestList(response?.data?.data||"Action Performed Successfully");
        setShowGenerateManifest(true);
      } else if (response?.status == 204)
        showAlert("No data found for create manifest!", "warning");
      else showAlert(
        response?.data?.message || "Action Performed Successfully",
        "warning"
      );
    } catch (error) {
      if (error) showAlert("something went wrong", "error");
    } finally {
      setSpinner(false);
    }
  };
  const createWidectBag = async () => {
    try {
      setWidectSpinner(true)
      const response: any = await Create_widect_bag(widectBagData);
      if (response?.status == 200) {
        showAlert(
          response?.data?.message || "Action Performed Successfully",
          "success"
        );
      } else if (response?.status == 204)
        showAlert("No data found for create manifest!", "warning");
      else showAlert(response?.data?.message, "warning");
      setWidectBagData({"bag_list" : [],"manifest_no" : ""})
      setWidectBagModal(false)
    } catch (error) {
      if (error) 
      showAlert("something went wrong", "error");
    }finally{
      setWidectSpinner(false)
    }
  };
  // console.log(maifestData, "mainfestdata");
  const generateManifest = async () => {
    const formdata: any = new FormData();

    formdata.append("list", JSON.stringify([maifestData?.list] || ""));
    formdata.append("shipment_type", maifestData?.shipment_type || "0");
    if (maifestData?.shipment_type == 7) {
      formdata.append("file", file);
    }
    setSpinner(true);
    try {
      setGenearteLoading(true);
      const response: any = await Generate_manifest(
        { hub_id, emp_id },
        formdata
      );
      if (response?.status == 200) {
        getManifestedList();
        setShowGenerateManifest(false);
        handlecancel();
        showAlert(response.data.message, "success");
      } else if (response?.status == 203) {
        let data = response?.data?.data || [];
        if (data && data?.length >= 1) {
          let newdata = data?.map((item: any) => ({ airwaybillno: item }));
          convertJSONtoCSV(
            newdata,
            "Invalid Data or provided awb No. Doesn't Exists!!.."
          );
          const message: string = response?.data?.message || "Invalid Data";
          const awbList = data.join(", \n");
          const finalMessage = `${awbList}`;
          setErrorMsg(data);
          setErrorModal(true);
        }
        getManifestedList();
        // setShowGenerateManifest(false);
        handlecancel();
        if (response?.data?.message) {
          showAlert(response?.data?.message, "warning");
        }
      } else if (response?.response?.status == 400) {
        showAlert(
          response?.response?.data?.message ||
            response?.response?.data?.msg ||
            "Something going wrong!!..please try after some time"
        );
      } else if (response?.response?.status == 406) {
        showAlert(
          response?.response?.data?.error[0]?.msg ||
            response?.response?.data?.msg ||
            "Something going wrong!!..please try after some time"
        );
      } else
        showAlert(
          response?.response?.data.msg ||
            "Something going wrong please try after some time...",
          "warning"
        );
    } catch (error) {
      if (error) showAlert("something went wrong", "error");
    } finally {
      setSpinner(false);
      setGenearteLoading(false);
    }
  };
  // const getrelateddata = (data: any, id?: any, forwhat?: any) => {};
  const getshipperdata = async (id: any, forwhat: any) => {
    try {
      const res =
        forwhat == "ship"
          ? await common_get(`/booking/shipper-list/${id}`)
          : await common_get(`/admin/country?id=${id}`);
      return res?.data?.data[0];
    } catch (err: any) {
      console.log(err?.message);
      return;
    }
  };
  const getCurrency = async () => {
    const res = await Get_Currency();
    if (res?.status == 200) {
      setCurrencyData(res?.data?.data);
    } else {
      showAlert("Something went wrong!", "error");
    }
  };
  const getBagData = async (key:any="") => {
    const res = await Get_bag_data(key);
    if (res?.status == 200) {      
      setBagData(res?.data?.data);
    } else if(res?.status == 204){
      setBagData([])
    } else {
      showAlert("Something went wrong!", "error");
    }
  };
  const getInvoiceTerm = async () => {
    const res = await Get_invoice();
    if (res?.status == 200) {
      setInvoiceTerm(res?.data?.data);
    } else {
      showAlert("Something went wrong!", "error");
    }
  };
  const handledownloadformat = async () => {
    let listdata = maifestData?.bagnos?.filter((item: any) => item !== "");
    try {
      const res = await common_post(
        "/hub/create_manifest/bag_airwaybill_list",
        {
          bag_nos: listdata,
        }
      );

      if (res?.status == 200) {
        const data = res?.data?.data || [];
        // Use Promise.all to wait for all async map results
        const newdata = await Promise.all(
          data.map(async (item: any) => {
            const singledata = await getshipperdata(item?.shipper_id, "ship");
            const singledata2 = await getshipperdata(
              item?.delivery_country_id,
              "country"
            );
            console.log("singledata", singledata);
            console.log("item", item);
            // console.log("singledata2", singledata2)
            return {
              HAWBNumber: item?.airwaybilno.replace(/^'/, "") || "",
              ReceiverReference: item?.reference_no || "",
              ReceiverName: item?.consignee_data?.company_name || "",
              ReceiverAttention: item?.consignee_data?.first_name,
              ReceiverPhoneNo: item?.consignee_data?.mobile_no || "",
              ReceiverEmailId: item?.consignee_data?.email_id || "",
              ReceiverAddress1: item?.consignee_data?.address1,
              ReceiverAddress2: item?.consignee_data?.address2,
              ReceiverAddress3: "",
              ZipCode: item?.consignee_data?.international_zipcode || "",
              CountryCode: item?.consignee_data?.country || "",
              IOSSValue: item?.ioss_number || "N.A.",
              StateName: item?.consignee_data?.state || "",
              CityName: item?.consignee_data?.city || "",
              ConsigneeTaxIdVATEINNo: "",
              TermsOfTrade: invoiceTerm?.find(
                (elem) => elem?.id == item?.invoice_term
              )?.invoice_term,
              IsSupplyforExportOnPaymentOfIGST:
                item?.export_is_payment == 1
                  ? "Yes"
                  : item?.export_is_payment == 2
                  ? "No"
                  : "",
              Contents: item?.contents || "",
              ShipmentValue: item?.shipment_value || "",
              CurrencyCode: currencyData?.find(
                (elem) => elem?.id == item?.currency_id
              )?.currency,
              ShipperReference1_OrderNO: "",
              ShipperReference2: "",
              Lenght: item?.length || "",
              Width: item?.breadth || "",
              Height: item?.height || "",
              CODService: "",
              CODValue: "",
              CODCurrencyCode: "",
              ShieldService: "",
              ShieldValue: "",
              ShieldCurrencyCode: "",
              FRDMService: "",
              SIGRService: "",
              LIQUIDService: "",
              NoOfPieces: item?.number_of_pieces || "",
              Weight: item?.chargeable_weight || "",
              ProductType: "",
              IsAgainstBondorUT:
                item?.bond_or_ut == "0"
                  ? "yes"
                  : item?.bond_or_ut == "1"
                  ? "No"
                  : "",
              InvoiceNo: item?.booking_invoice_no,
              InvoiceDate: formatDate(item?.invoice_date) || "",
              ExporterType: "",
              IsBillingAddressSameAsReceiver: "",
              BillToName: [
                item?.consignee_data?.first_name,
                item?.consignee_data?.last_name,
              ]
                ?.filter(Boolean)
                ?.join(" "),
              BillToAddress: [
                item?.consignee_data?.address1,
                item?.consignee_data?.address2,
              ]
                ?.filter(Boolean)
                ?.join(" "),
              BillToCountryCode: item?.country_data?.country_code,
              ADCode: item?.ad_code,
              GovtOrNonGovt: "",
              // Bank: "",
              // BankName_Other: "",
              BankAccountNo: item?.bank_account_number,
              HAWBDataRef1: "",
              HAWBDataRef2: "",
              HAWBDataRef3: "",
              Freight: "",
              Insurance: "",
              NFEI: item?.nefi,
            };
          })
        );
        // console.log(newdata, "resolved newdata");
        convertJSONtoCSV(newdata, "format");
      } else {
        showAlert("No Data Exists!.. ", "warning");
      }
    } catch (err: any) {
      console.log(err?.message);
    }
  };
  const handlecancel = () => {
    setManifestData(intmanifestdata);
    setManifistModal(false);
    setWidectBagModal(false);
  };
  const title = (
    <div className="flex justify-between ">
      {/* <h1>Generate Manifest</h1> */}
      <div>
        <Button
          className="p-2 bg-success text-white"
          onClick={async () => await handledownloadformat()}
        >
          <Download /> Download Format
        </Button>
      </div>
    </div>
  );
  const footer = (
    <div>
      <Button
        className="p-2 bg-gray-400 text-white "
        onClick={() => handlecancel()}
      >
        Cancel
      </Button>
      <Button
        className="p-2 bg-mustard text-white "
        disabled={
          spinner ||
          (maifestData?.shipment_type &&
            maifestData?.shipment_type == 7 &&
            !file)
        }
        onClick={() => generateManifest()}
      >
        Generate
        {spinner && <LoadingIcon icon="puff" className="ml-2" />}
      </Button>
    </div>
  );
  const description = (
    <>
      <div>
        <FormLabel>
          SHIPMENT TYPE
          <span className="text-red-400">*</span>
        </FormLabel>
        <FormSelect value={maifestData?.shipment_type} disabled>
          <option value="">Select</option>
          <option value={"7"}>CSB V</option>
          <option value="0">Other Shipment Types</option>
        </FormSelect>
      </div>

      {maifestData?.shipment_type == 7 ? (
        <div className="col-span-3 mt-4">
          <FormLabel htmlFor="modal-form-4">
            Upload Document<span className="text-red-400">*</span>
          </FormLabel>
          <FormInput
            type="file"
            accept=".csv"
            className="border border-primary w-full"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        ""
      )}
    </>
  );
  const widectBagFooter = (
    <div>
      <Button
        className="p-2 bg-gray-400 text-white "
        onClick={() => handlecancel()}
      >
        Cancel
      </Button>
      <Button
        className="p-2 bg-mustard text-white "
        disabled={widectSpinner}
        onClick={() => createWidectBag()}
      >
        Create
        {widectSpinner && <LoadingIcon icon="puff" className="ml-2" />}
      </Button>
    </div>
  );
  const widectBagDescription = (
    <>
      <div>
        <FormLabel>
          MANIFEST NO
          <span className="text-red-400">*</span>
        </FormLabel>
        <FormInput
          placeholder="Enter Manifest Number"
          value={widectBagData.manifest_no}
          onChange={(e) => {
            setWidectBagData((prev) => ({
              ...prev,
              manifest_no: e.target.value,
            }));
          }}
        />
        <FormLabel className="mt-4">
          SELECT BAGS
          <span className="text-red-400">*</span>
        </FormLabel>
        <TomSelect
              className={`w-[100%] `}
              name="destination_pincode"
              value={widectBagData.bag_list.length? widectBagData.bag_list : []}
              onChange={(e) => {
                
                setWidectBagData(prev=>({...prev,bag_list:e}))
              }}
              options={{
                placeholder: "Select Bag",
                // onType: (e) =>getBagData(e)
              }}
              defaultValue={[]}
              multiple
            >
              {bagData?.map(
                (data, index) =>
                    <option value={data.bag_no} key={index}>
                      {data?.bag_no}
                    </option>
              )}
            </TomSelect>
      </div>
    </>
  );

  const description1 = (
    <div className="border rounded w-full">
      <table className="table-auto w-full border-collapse">
        <thead className="sticky top-0 bg-gray-200 z-10">
          <tr>
            <th className="border px-4 py-2">#</th>
            <th className="border px-4 py-2">Airway Bill No</th>
          </tr>
        </thead>
      </table>

      {/* Scrollable tbody */}
      <div className="max-h-64 overflow-y-auto">
        <table className="table-auto w-full border-collapse">
          <tbody>
            {errorMsg?.map((item, index) => (
              <tr key={index}>
                <td className="text-center border px-4 py-2">{index + 1}</td>
                <td className="text-center border px-4 py-2">{item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 px-6 py-3 bg-white rounded-lg shadow-lg">
        {!showGenerateManfest ? (
          <div className="w-full flex justify-between">
            <h1 className="font-bold text-lg">Create Manifest</h1>
            <div className="flex items-center">
              <Button
                disabled={widectSpinner}
                className=" mr-4 px-4 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-700"
                onClick={() => {
                  setWidectBagModal(true);
                }}
              >
                Create Widect Bag
                {widectSpinner && <LoadingIcon icon="puff" className="ml-2" />}
              </Button>
              <Button
                disabled={spinner}
                className=" mr-4 px-4 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-700"
                onClick={() => createManifest()}
              >
                Create Manifest{" "}
                {spinner && <LoadingIcon icon="puff" className="ml-2" />}
              </Button>
              <h1 className="mt-2 font-bold">Next Onforward Shipment</h1>
              <div className="p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2">
                <Link
                  to="/hub/operation/onforward_shipment"
                  className="font-bold"
                >
                  <ArrowRight className="w-5 h-4 " />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-between">
            <div className="flex items-center mb-2">
              <div
                className="p-2 cursor-pointer rounded-full shadow-lg mr-4"
                onClick={() => setShowGenerateManifest(false)}
              >
                <ArrowLeft className="w-5 h-4" />
              </div>
              <h1 className="font-bold text-lg">Generate Manifest</h1>
            </div>
            <div className="flex items-center">
              {/* <Button
                className=" mr-4 px-4 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-700"
                onClick={() => generateManifest()}
              >
                Generate Manifest{" "}
                {spinner && <LoadingIcon icon="puff" className="ml-2" />}
              </Button> */}
              <h1 className="mt-2 font-bold">Next Onforward Shipment</h1>
              <div className="p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2">
                <Link
                  to="/hub/operation/onforward_shipment"
                  className="font-bold"
                >
                  <ArrowRight className="w-5 h-4 " />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {!showGenerateManfest ? (
        <>
          <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <h1 className="font-400 text-md">Manifested List</h1>
              <div className="relative flex justify-between items-center">
                <FormInput
                  placeholder="Search..."
                  className="pr-8 pt-1 pb-1 rounded-xl"
                  value={manifestSearch}
                  onChange={(e) => {
                    setManifestSearch(e.target.value.toUpperCase());
                    getManifestedList();
                    setPage(1);
                  }}
                />
                <Search className="absolute right-1 w-5 h-5" />
              </div>
            </div>
            {manifestedList.length > 0 ? (
              <>
                <Table columns={columns} row={row} heightTable="53vh" />
                <CommonPagination
                  totalpages={totalpages}
                  onPageChange={handlePagechange}
                  page={page}
                />
              </>
            ) : (
              <>
                {/* <h1 className="font-400 text-md">Manifested List</h1> */}
                <p className="text-gray-400 text-center">No Data Found!</p>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="w-full max-w-6xl mx-auto mt-4 px-6 py-3 bg-white rounded-lg shadow-lg">
          <div className="flex items-center mt-2 justify-between">
            <h1 className="font-400 text-lg">List for generate manifest</h1>
          </div>
          <Table
            columns={createManifestColumn}
            row={createManifestRow}
            heightTable="55vh"
          />
        </div>
      )}
      <Modal
        open={manifestModal}
        title={"Generate"}
        size="md"
        setOpen={setManifistModal}
        description={description}
        footer={footer}
        handlecancel={handlecancel}
        // addfield={title}
        addfield={maifestData?.shipment_type == 7 ? title : ""}
      />
      <Modal
        open={widectBagModal}
        title={"Create Widect Bag"}
        size="md"
        setOpen={setWidectBagModal}
        description={widectBagDescription}
        footer={widectBagFooter}
        handlecancel={handlecancel}
      />

      {errorModal && (
        <Modal
          open={errorModal}
          title="These airwaybills doesn't exist!"
          size="md"
          setOpen={setErrorModal}
          description={description1}
          footer=""
          handlecancel=""
        />
      )}
    </>
  );
};

export default index;
