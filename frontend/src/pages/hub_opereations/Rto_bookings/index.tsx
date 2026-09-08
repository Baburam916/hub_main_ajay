import React, { useEffect, useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { useDebounce } from "../../../components/Search";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import CommonPagination from "../../../components/Pagination";
import LoadingIcon from "../../../base-components/LoadingIcon";
import {
  convertJSONtoCSV,
  downloadAttachment,
  formatDate,
  get90DaysBeforeDate,
} from "../../../utils";
import { Rto_listing_api } from "../../../AllServices/services";
import { Box, Download, FileText } from "lucide-react";

const main = () => {
  const today = new Date().toISOString().split("T")[0];
  const { showAlert } = useAlert();
  const [fromDate, setFromDate] = useState(get90DaysBeforeDate());
  const [toDate, setToDate] = useState(today);
  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [bookingData, setBookingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const [downloadSpinner, setDownloadSpinner] = useState(false);
  const [downloadData, setDownloadData] = useState([]);

  const handleTrack = async (awb: string) => {
    const url = `/hub/tracking?awb=${awb}`;
    window.open(url, "_blank");
  };
  const handlePagechange = (e: number) => {
    setPage(e);
  };

  const getData = async () => {
    setIsLoading(true);
    try {
      const res = await Rto_listing_api({
        hub_id: hub_id,
        from_date: fromDate,
        to_date: toDate,
        airwaybill_no: debouncedSearch,
        limit: 20,
        page: page - 1,
      });
      if (res?.status == 200 || 204) {
        setBookingData(res?.data?.data || []);
        setTotalPages(Math.ceil(res?.data?.total / 20) || 1);
      } else {
        setBookingData([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { field: "new_airwaybilno", headerName: "R.T.O. Airwaybill" },
    { field: "created_date", headerName: "R.T.O Date" },
    { field: "airwaybilno", headerName: "Booking Airwaybill" },
    { field: "dispatch_url", headerName: "Dispatch Label" },
    { field: "invoice_url", headerName: "Invoice Pdf" },
  ];

  const row: any = bookingData?.map((item: any) => {
    const Label = (
      <div className="flex justify-center">
        <Box
          className="stroke-2.5 text-mustard cursor-pointer"
          onClick={() =>
            downloadAttachment(
              item?.booked_data?.dispatch_url,
              item?.booked_data?.airwaybilno
            )
          }
        />
      </div>
    );
    const Invoice = (
      <div className="flex justify-center">
        <FileText
          className="stroke-2.5 text-mustard cursor-pointer"
          onClick={() =>
            downloadAttachment(
              item?.booked_data?.invoice_url,
              item?.booked_data?.airwaybilno
            )
          }
        />
      </div>
    );

    const newAWB = (
      <p
        className="text-mustard font-bold cursor-pointer underline underline-offset-4 hover:no-underline"
        onClick={() => {
          if (item?.new_airwaybilno) {
            handleTrack(item?.new_airwaybilno);
          }
        }}
      >
        {item?.new_airwaybilno || "-"}
      </p>
    );
    const oldAWB = (
      <p
        className="text-mustard font-bold cursor-pointer underline underline-offset-4 hover:no-underline"
        onClick={() => {
          if (item?.airwaybilno) {
            handleTrack(item?.airwaybilno);
          }
        }}
      >
        {item?.airwaybilno || "-"}
      </p>
    );

    return {
      ...item,
      created_date: formatDate(item?.created_date),
      dispatch_url: Label,
      invoice_url: Invoice,
      new_airwaybilno: newAWB,
      airwaybilno: oldAWB,
    };
  });

  const handleDownload = async () => {
    try {
      setDownloadSpinner(true);
      const res = await Rto_listing_api({
        hub_id: hub_id,
        from_date: fromDate,
        to_date: toDate,
      });
      if (res?.status == 200 || 204) {
        setDownloadData(res?.data?.data || []);
        convertJSONtoCSV(formatData(res?.data?.data || []), "RTO");
      } else {
        showAlert(res?.data?.message || res?.response?.data?.message, "error");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDownloadSpinner(false);
    }
  };

  const formatData = (data: any) => {
    if (!(data?.length > 0)) {
      showAlert("No data available for download", "warning");
      return;
    }

    return data?.map((data: any, index: number) => ({
      "Sr. No.": `${index + 1}.`,
      "R.T.O. Airwaybill": data?.new_airwaybilno,
      "R.T.O Date": formatDate(data?.created_date),
      "Booking Airwaybill": data?.airwaybilno,
      "Dispatch Label": data?.booked_data?.dispatch_url,
      "Invoice Pdf": data?.booked_data?.invoice_url,
    }));
  };

  useEffect(() => {
    getData();
  }, [fromDate, toDate, debouncedSearch, page]);

  return (
    <div className="w-full max-w-8xl p-6 px-10 bg-white rounded-lg shadow-lg  mt-8 mb-16 z-[0] relative">
      <div className="grid  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  xl:grid-cols-5  items-end gap-6 w-full">
        <div className="w-full">
          <h1 className="text-2xl font-bold ">R.T.O. List</h1>
        </div>
        <div className="w-full">
          <FormLabel htmlFor="modal-form-5">
            FROM DATE <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="w-full">
          <FormLabel htmlFor="modal-form-5">
            TO DATE <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="modal-form-5"
            type="date"
            value={toDate}
            min={fromDate}
            max={today}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <FormInput
          type="text"
          placeholder="Enter AWB No."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value.replace(/\s/g, ""));
            setPage(1);
          }}
        />
        <Button
          className=" rounded-lg bg-green-500 hover:bg-green-600 text-white ml-4 p-2"
          onClick={handleDownload}
          disabled={downloadSpinner}
        >
          DOWNLOAD{" "}
          {downloadSpinner ? (
            <LoadingIcon
              icon="puff"
              color="white"
              className="w-5 h-5 ml-2 stroke-2.5 text-white"
            />
          ) : (
            <Download className="ml-2" />
          )}
        </Button>
      </div>

      <div className="flex justify-center w-full my-4 border-t border-slate-200 dark:border-darkmode-400"></div>

      <div className="">
        {bookingData?.length > 0 ? (
          <>
            <Table heightTable="60vh" columns={columns} row={row} />

            {totalpages > 1 && (
              <CommonPagination
                totalpages={totalpages}
                onPageChange={handlePagechange}
                page={page}
              />
            )}
          </>
        ) : (
          <>
            {" "}
            <p className="mt-4 text-gray-400 text-center">No Data Found!</p>
          </>
        )}
      </div>
    </div>
  );
};

export default main;
