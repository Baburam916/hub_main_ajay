import React, { useEffect, useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import TomSelect from "../../../base-components/TomSelect";
import { Box, Search, User } from "lucide-react";
import Table from "../../../components/Table";
import { Shipment_on_hold } from "../../../AllServices/services";
import { ShipmentOnHoldReport } from "../../../DataTypes/dataTypes";
import { useAlert } from "../../../ContextProvider/AlertContext";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";
import LoadingIcon from "../../../base-components/LoadingIcon";

const index = () => {
  const { showAlert } = useAlert();
  const [type, setType] = useState<any>(1);
  const [count, setCount] = useState<any>("1");
  const [toDate, setToDate] = useState<any>("");
  const [search, setSearch] = useState<any>("");
  const [fromDate, setFromDate] = useState<any>("");
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Array<any>>([]);

  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const debouncedSearchTerm = useDebounce<string>(search, 500);

  const columns = [
    { field: "hub_name", headerName: "Mother Hub/ Pud Center" },
    { field: "airwaybill_no", headerName: "Airwaybill No" },
    { field: "status", headerName: "Held up Reason" },
    { field: "created_date", headerName: "Held up DateTime" },
  ];

  const row: any = searchResult?.map((item: any) => {
    return {
      ...item,
    };
  });

  const onPageChange = (e: any) => {
    setCurrentPage(e);
  };

  const formData = async (val: any) => {
    setSpinner(true);
    let response: any;
    try {
      setType(val);
      const shipmentOnHold: ShipmentOnHoldReport = {
        to_date: toDate,
        from_date: fromDate,
      };
      response = await Shipment_on_hold(
        hub_id,
        shipmentOnHold,
        debouncedSearchTerm,
        debouncedSearchTerm ? 0 : Number(currentPage - 1)
      );
      if (response.status == 200) {
        setCount(Math.ceil(Number(response?.data?.count || 0) / 10));
        setSearchResult(response?.data?.data);
      } else if (response.status == 203) {
        showAlert(response.data.message, "warning");
      } else if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.data.message, "error");
    } catch (error: any) {
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setSpinner(false);
      setType(1);
    }
  };

  useEffect(() => {
    if (fromDate && toDate) {
      formData(1);
    }
  }, [debouncedSearchTerm, currentPage]);

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
              Shipment On Hold
                  </h4>
                </div>
              </div>

           <div className="flex items-center w-full lg:w-auto">
                

                <div className="flex-wrap md:flex-nowrap flex gap-2 items-center w-full lg:w-auto">
       <div className="flex-wrap md:flex-nowrap flex  items-center gap-x-1 lg:gap-2 w-[48%] lg:w-auto">
            <FormLabel className="!mb-0 whitespace-nowrap">From Date</FormLabel>
            <FormInput
              id="regular-form-1"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="Search..."
            />
          </div>
             <div className="flex-wrap md:flex-nowrap flex  items-center gap-x-1 lg:gap-2 w-[48%] lg:w-auto">
            <FormLabel className="!mb-0 whitespace-nowrap" >To Date</FormLabel>
            <FormInput
              id="regular-form-1"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="Search..."
            />
          </div>

               <div className=" w-full lg:w-auto">
            <Button
              onClick={() => {
                formData(2);
              }}
              disabled={spinner && type == 2}
              className="p-2 px-5 border-none rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
            >
              Search{" "}
              {spinner && type == 2 && (
                <LoadingIcon icon="puff" className="ml-2" />
              )}
            </Button>
          </div>
        </div>
     






              </div>
            </div>
          </div>

          <div className="p-2  lg:p-6">
            


      <div className="w-full">
        {searchResult.length > 0 && (
          <div className="relative flex justify-end items-center w-100">
            <FormInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="w-[30%] pr-8 pt-1 pb-1 rounded-xl"
            />
            <Search
              onClick={() => formData(2)}
              className="absolute right-1 w-5 h-5"
            />
          </div>
        )}

        {searchResult.length > 0 ? (
          <Table
            columns={columns}
            row={row}
            heightTable="32vh"
            currentPage={currentPage || 0}
          />
        ) : (
          <p className="text-gray-400 text-center">No Data Found!</p>
        )}

        {searchResult.length > 0 && (
          <CommonPagination
            totalpages={+count}
            onPageChange={onPageChange}
            page={currentPage}
          />
        )}
      </div>


          </div>
        </div>
      </div>
      








   

    </>
  );
};

export default index;
