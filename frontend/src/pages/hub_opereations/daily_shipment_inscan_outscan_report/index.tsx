import React, { useEffect, useState } from "react";
import Button from "../../../base-components/Button";
import { FormLabel, FormSelect } from "../../../base-components/Form";
import TomSelect from "../../../base-components/TomSelect";
import {
  DailyShipmentInscanOutscan,
  Get_daily_inscan_option,
} from "../../../AllServices/services";
import { Daily_shipment_select } from "../../../DataTypes/dataTypes";
import Table from "../../../components/Table";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Lucide from "../../../base-components/Lucide";
import { formatDate } from "../../../utils";
import { unparse } from "papaparse";
import { Box } from "lucide-react";

const index = () => {
  const [selectReport, setSelectReport] = useState<Array<any>>([]);
  const [selectData, setSelectData] = useState<Array<any>>([]);
  const [data, setData] = useState<any>();
  const [tableData, setTableData] = useState<Array<any>>([]);
  const [spinner, setSpinner] = useState<boolean>(false);
  const { showAlert } = useAlert();

  const [hideData, setHideData] = useState<any>();
  const [dataCheck, setDataCheck] = useState<boolean>(true);
  const [printCsvData, setPrintCsv] = useState<Array<any>>([]);
  const [csvSpinner, setCsvSpinner] = useState<boolean>(false);
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const columns = [
    { field: "airwaybilno", headerName: "Airwaybill No" },
    { field: "company_name", headerName: "Shipper Company Name" },
    { field: "shipper_name", headerName: "Shipper Name" },
    { field: "country_name", headerName: "Destination Country" },
    { field: "contact_person", headerName: "Contact Person" },
    { field: "mobile_no", headerName: "Shipper Contact Number" },
    { field: "email_id", headerName: "Shipper Email" },
    { field: "booking_date", headerName: "Booking Date" },
    // { field: "branch_name", headerName: "Integrator" },
    (hideData == 3 || hideData == 4) && {
      field: "branch_inscan_date",
      headerName: "Branch Inscan Date",
    },
    hideData == 2 && {
      field: "hub_inscan_date",
      headerName: "Hub Inscan Date",
    },
    { field: "remarks", headerName: "Remarks" },
  ];
  const row: any = tableData?.map((item: any) => {
    return {
      ...item,
      mobile_no: <p className="text-end">{item?.mobile_no}</p>,
    };
  });
  const selectOptionData = async () => {
    const res: any = await Get_daily_inscan_option();
    setSelectData(res?.data?.data);
  };
  const selectDataFunc = async () => {
    setSpinner(true);
    let response: any;
    try {
      const dailyShipment: Daily_shipment_select = {
        id: data,
      };
      response = await DailyShipmentInscanOutscan(dailyShipment, hub_id);
      if (response?.status == 200) {
        setTableData(response?.data?.data);
        setDataCheck(true);
      } else if (response.status == 406) {
        (showAlert("No data found!", "warning"), setDataCheck(false));
      } else if (response.status == 204) {
        (showAlert("No data found!", "warning"), setDataCheck(false));
      } else showAlert(response.data.message, "warning");
    } catch (err: any) {
      console.log(err);
      if (response.response.status == 406) {
        showAlert(response.response.data.errors[0].msg, "warning");
        setDataCheck(false);
      } else showAlert(response.response.data.message, "error");
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
  const formatData = (data: any) => {
    if (!data?.length > 0) return [{ "No Data Found": "" }];
    return data?.map((item: any, index: number) => ({
      "Sr. No.": `${index + 1}.`,
      // "Created Date": item?.created_date,
      "Airwaybill Number": item?.airwaybilno,
      "Shipper Company Name": item?.company_name,
      "Shipper Name": item?.shipper_name,
      "Destination Country": item?.country_name,
      "Contact Person": item?.contact_person,
      "Shipper Contact Number	": item?.mobile_no,
      "Shipper Email": item?.email_id,
      "Booking Date": formatDate(item?.booking_date),
      Remarks: item?.remarks,
    }));
  };

  const csvDataForPrint = async () => {
    let response: any;
    setCsvSpinner(true);
    try {
      const dailyShipment: Daily_shipment_select = {
        id: data,
      };
      response = await DailyShipmentInscanOutscan(dailyShipment, hub_id);
      if (response?.status == 200) {
        setPrintCsv(response?.data?.data);
        // setPrintCsv([])
        convertJSONtoCSV(
          formatData(response?.data?.data),
          "inscan_outscan.csv",
        );
      } else if (response?.status == 204) {
        setPrintCsv([]);
      } else {
        showAlert("Something went wrong!", "error");
      }
    } catch (err: any) {
      console.log(err);
      console.error("Error fetching CSV data:", err);
    } finally {
      setCsvSpinner(false);
    }
  };

  useEffect(() => {
    selectOptionData();
  }, []);

  console.log("TableData", tableData);
  return (
    <>
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Box className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    HUB Inscan vs Outscan Reports
                  </h4>
                </div>
              </div>


              <div className="flex items-center">











                {tableData.length > 0 && dataCheck && (
                
 <div className=" ">
                    <Button
                      variant="outline-secondary"
                      className="px-3 py-2 rounded-md bg-mustard border-none text-white"
                      disabled={csvSpinner}
                      onClick={() => {
                        csvDataForPrint();
                      }}
                    >
                      <Lucide icon="FileText" className="w-4 h-4 mr-1" />
                      Export
                      {csvSpinner && (
                        <LoadingIcon icon="puff" className="ml-2" />
                      )}
                    </Button>
                  </div>

                )}
              </div>
            </div>
          </div>

<div className="w-full p-2 lg:p-3 border-b border-gray-200 bg-[#f1f1f1]">

  <div className="w-full ">
           
                <div className="flex-wrap lg:flex-nowrap flex items-center gap-2">
                  <div className="w-full lg:!w-[320px]">
                    <FormSelect
                      onChange={(e) => {
                        setData(e.target.value);
                        setHideData(e.target.value);
                      }}
                      formSelectSize="sm"
                      className="h-[40px] w-full  p-2"
                      aria-label=".form-select-sm example"
                    >
                      <option value="">
                        Select Branch And Hub Inscan Data
                      </option>
                      {selectData?.map((item: any) => (
                        <option value={item.id}>{item?.option}</option>
                      ))}
                    </FormSelect>
                  </div>
                  <div className="">
                    <Button
                      disabled={spinner}
                      onClick={() => selectDataFunc()}
                      className="px-5 py-2 h-[38px] border-none rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
                    >
                      Get Data{" "}
                      {spinner && <LoadingIcon icon="puff" className="" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-end justify-end">
                  {/* <Button className="p-2 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-blue-500 text-white ml-2">
              Download
            </Button> */}
                </div>
             
            </div>

</div>



          <div className="p-2  lg:p-6">
          
            <div className="w-full ">
              {tableData.length > 0 && dataCheck ? (
                <Table columns={columns} row={row} heightTable="50vh" />
              ) : (
                <>
                  <p className="text-gray-400 text-center">No Data Found!</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default index;
