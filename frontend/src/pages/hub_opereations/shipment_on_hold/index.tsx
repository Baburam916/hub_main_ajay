import React, { useEffect, useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import TomSelect from "../../../base-components/TomSelect";
import { Search } from "lucide-react";
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
      <div className="w-full max-w-6xl mx-auto mt-4 px-6 py-4 bg-white rounded-lg shadow-lg">
        <h1 className="font-bold text-lg">Shipment On Hold</h1>
        <hr />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <FormLabel>From Date</FormLabel>
            <FormInput
              id="regular-form-1"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="Search..."
            />
          </div>
          <div>
            <FormLabel>To Date</FormLabel>
            <FormInput
              id="regular-form-1"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="Search..."
            />
          </div>

          <div className="flex items-end"> 
            <Button
              onClick={() => {
                formData(2);
              }}
              disabled={spinner && type == 2}
              className="p-2 px-5 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
            >
              Search{" "}
              {spinner && type == 2 && (
                <LoadingIcon icon="puff" className="ml-2" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto mt-4 px-6 py-4 bg-white rounded-lg shadow-lg">
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
    </>
  );
};

export default index;
