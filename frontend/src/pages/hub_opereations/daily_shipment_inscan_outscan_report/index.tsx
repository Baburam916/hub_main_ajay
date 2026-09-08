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


const index = () => {
  const [selectReport, setSelectReport] = useState<Array<any>>([]);
  const [selectData, setSelectData] = useState<Array<any>>([]);
  const [data, setData] = useState<any>();
  const [tableData, setTableData] = useState<Array<any>>([]);
  const [spinner, setSpinner] = useState<boolean>(false);
  const { showAlert } = useAlert();

  const [hideData, setHideData] = useState<any>();
  const [dataCheck, setDataCheck] = useState<boolean>(true)
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
    (hideData ==3 || hideData ==4) &&{ field: "branch_inscan_date", headerName: "Branch Inscan Date" },
    hideData == 2 && { field: "hub_inscan_date", headerName: "Hub Inscan Date" },
    { field: "remarks", headerName: "Remarks" },
  ]
  const row:any = tableData?.map((item:any) => {
     return {
       ...item,
       mobile_no : <p className="text-end">{item?.mobile_no}</p>
     }
  });
  const selectOptionData = async () => {
    const res: any = await Get_daily_inscan_option();
    setSelectData(res?.data?.data);
  };
  const selectDataFunc = async () => {
    setSpinner(true)
    let response:any;
    try {
      const dailyShipment: Daily_shipment_select = {
        id: data,
      };
      response = await DailyShipmentInscanOutscan(dailyShipment, hub_id);
      if (response?.status == 200) {
        setTableData(response?.data?.data);        
        setDataCheck(true)
      } 
      else if (response.status == 406){ showAlert("No data found!", "warning"),setDataCheck(false)}
      else if (response.status == 204) {showAlert("No data found!", "warning"), setDataCheck(false)}
      else showAlert(response.data.message, "warning");
      
    } catch(err:any){
        console.log(err)
        if (response.response.status == 406)
       { showAlert(response.response.data.errors[0].msg, "warning");
        setDataCheck(false)}
      else showAlert(response.response.data.message, "error");
    
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
      "Remarks" : item?.remarks
    }));
  };

  const csvDataForPrint = async () => {
    let response:any;
    setCsvSpinner(true);
    try {
      const dailyShipment: Daily_shipment_select = {
        id: data,
      };
      response = await DailyShipmentInscanOutscan(dailyShipment, hub_id);
      if (response?.status == 200) {
        setPrintCsv(response?.data?.data);
        // setPrintCsv([])
        convertJSONtoCSV(formatData(response?.data?.data), "inscan_outscan.csv")
      } else if (response?.status == 204) {
        setPrintCsv([]);
      } else {
        showAlert("Something went wrong!", "error");
      } 
    } catch(err:any){
        console.log(err)
        console.error("Error fetching CSV data:", err);   
    } finally {
      setCsvSpinner(false);
    }
  };

  useEffect(() => {
    selectOptionData();
  }, []);
 
  console.log("TableData", tableData)
  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between">
          <h1 className="font-bold text-lg">HUB Inscan vs Outscan Reports</h1>
            {(tableData.length > 0 &&  dataCheck) && <div className="mr-2 ">
                <Button
                  variant="outline-secondary"
                  className="w-full sm:w-auto pt-1 pb-1 pl-2 pr-2 rounded-xl"
                  disabled={csvSpinner}
                  onClick={() =>
                    {csvDataForPrint();
                    }
                  }
                >
                  <Lucide icon="FileText" className="w-4 h-4 mr-2" />
                  Export
                  {csvSpinner && <LoadingIcon icon="puff" className="ml-2" />}
                </Button>
              </div>}
        
        </div>

        <hr />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="sm:flex justify-between"> 
            <div className="sm:w-[70%]">
              <FormSelect
                onChange={(e) => {
                  setData(e.target.value);
                  setHideData(e.target.value)
                }}
                formSelectSize="sm"
                className="h-[100%] p-2"
                aria-label=".form-select-sm example"
              >
                <option value=''>Select Branch And Hub Inscan Data</option>
                {selectData?.map((item: any) => (
                  <option value={item.id}>{item?.option}</option>
                ))}
              </FormSelect>
            </div>
            <div className="mt-2 sm:mt-0 sm:w-[25%]">
              <Button disabled={spinner} onClick={()=> selectDataFunc()} className="p-2 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white">
                Get Data {spinner && <LoadingIcon icon="puff" className="" />}
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
      <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        {tableData.length > 0 &&  dataCheck ? (
          <Table columns={columns} row={row} heightTable="50vh" />
        ) : (
          <>
            <p className="text-gray-400 text-center">No Data Found!</p>
          </>
        )}
      </div>
    </>
  );
};

export default index;
