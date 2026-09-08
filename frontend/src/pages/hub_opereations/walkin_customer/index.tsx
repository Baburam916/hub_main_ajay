import React, { useEffect, useState } from "react";
import { FormInput } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import {
  Get_kyc_document,
  Get_walkin_customer,
  WalkIn_customer_search,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Link } from "react-router-dom";
import { downloadAttachment, formatDate } from "../../../utils";
import LoadingIcon from "../../../base-components/LoadingIcon";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";
import Lucide from "../../../base-components/Lucide";

const index = () => {
  const { showAlert } = useAlert();
  const [walkindata, setWalkindata] = useState<Array<any>>([]);
  const [kycDoc, setKycDoc] = useState<Array<any>>([]);
  const [airwaybill, setAirwaybill] = useState<any>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);
  const debouncedSearchTerm = useDebounce<string>(airwaybill, 500);

  const handlePagechange = (e: number) => {
    setPage(e);
  };

  useEffect(() => {
    getKycTableData();
  }, []);

  useEffect(() => {
    getWalkinTable();
  }, [debouncedSearchTerm, page]);

  const getWalkinTable = async () => {
    setIsLoading(true);
    try {
      const res: any = await Get_walkin_customer(
        hub_id,
        debouncedSearchTerm,
        20,
        page - 1
      );
      if (res?.status == 200) {
        setWalkindata(res?.data?.data);
        setTotalPages(Math.ceil(res?.data?.total / 20));
      } else if (res?.status == 204) {
        setWalkindata([]);
        setTotalPages(1);
      } else {
        showAlert(res?.data.message, "warning");
      }
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getKycTableData = async () => {
    try {
      const res: any = await Get_kyc_document();
      if (res?.status == 200) {
        setKycDoc(res?.data?.data);
      } else showAlert(res?.data.message, "warning");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }
  };

  const columns = [
    { field: "shipper_name", headerName: "Name" },
    { field: "airwaybilno", headerName: "Airwaybill No." },
    { field: "order_referenceno", headerName: "Reference" },
    { field: "booking_date", headerName: "Booking Date" },
    { field: "kyc", headerName: "Kyc Documents" },
    { field: "shipper_invoice", headerName: "Shipper Invoice" },
    { field: "dispatch_label", headerName: "Awb Label" },
  ];

  const row: any = walkindata?.map((item: any) => {
    const kycdata =
      item?.document_id_1 && item?.document_id_2 ? (
        <>
          <Link to={`${item?.document_path_1}?${Math.random()}`} target="_blank">
            <Button className="bg-green-500 border-none py-1 px-2 text-white ml-2">
              {
                kycDoc
                  ?.find(
                    (elem: any) => elem?.organisation_id == item?.orgnization_id
                  )
                  ?.value?.find((data: any) => data?.id == item?.document_id_1)
                  ?.value
              }
            </Button>
          </Link>
          <Link to={`${item?.document_path_2}?${Math.random()}`} target="_blank">
            <Button className="bg-cyan-500 border-none py-1 px-2 text-white ml-2">
              {
                kycDoc
                  ?.find(
                    (elem: any) => elem?.organisation_id == item?.orgnization_id
                  )
                  ?.value?.find((data: any) => data?.id == item?.document_id_2)
                  ?.value
              }
            </Button>
          </Link>
        </>
      ) : (
        "	No Documents"
      );
    const shipperData = (
      <>
        {item?.shipper_invoice == "N/A" || item?.shipper_invoice == null ? (
          <p>N.A.</p>
        ) : (
          <Link to={`${item?.shipper_invoice}?${Math.random()}`} target="_blank">
            <Button className="bg-blue-500 border-none py-1 px-2 text-white ml-2">
              Performa Invoice
            </Button>
          </Link>
        )}
      </>
    );
    const awbData = (
      <>
        {item?.dispatch_label == "N/A" || item?.dispatch_label == null ? (
          <p>N.A.</p>
        ) : (
          <Link to={`${item?.dispatch_label}?${Math.random()}`} target="_blank">
            <Button className="bg-blue-500 border-none py-1 px-2 text-white ml-2">
              AWB Label
            </Button>
          </Link>
        )}
      </>
    );
    const bookingDate = <>{formatDate(item?.booking_date)}</>;
    return {
      ...item,
      kyc: kycdata,
      shipper_invoice: shipperData,
      dispatch_label: awbData,
      order_referenceno:
        item?.order_referenceno == "" ? "N.A." : item?.order_referenceno,
      booking_date: bookingDate,
    };
  });

  return (
    <>
      <div className="w-full max-w-8xl mx-auto mt-4 py-3 px-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-row justify-between">
          <div className="grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-end gap-6 w-full">
            <div className="w-full">
              <h1 className="text-2xl font-bold ">Walkin Customer</h1>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                className="bg-mustard text-white  flex items-center justify-center space-x-2 py-1 px-2 rounded-md"
                onClick={() =>
                  downloadAttachment(
                    "https://skartnew-dev.s3.ap-southeast-1.amazonaws.com/T%26C/1747808227508-KnowYourCustomer.docx",
                    "KYC Form"
                  )
                }
              >
                <Lucide
                  icon="Contact"
                  className="h-5 stroke-2.5 text-white mr-2"
                />
                KYC Form
              </Button>
              <Button
                className="bg-mustard text-white  flex items-center justify-center space-x-2 py-1 px-2 rounded-md"
                onClick={() =>
                  downloadAttachment(
                    "https://skartnew-dev.s3.amazonaws.com/T%26C/1747808212576-Skart_Authority.pdf",
                    "Authorization Letter"
                  )
                }
              >
                <Lucide
                  icon="FolderKey"
                  className="h-5 stroke-2.5 text-white mr-2"
                />
                Authorization Letter
              </Button>
            </div>

            <div className="flex items-center">
              <FormInput
                className="pr-8 pt-1 pb-1 rounded-xl w-2/3"
                type="text"
                value={airwaybill}
                onChange={(e) => {
                  setAirwaybill(e.target.value.toUpperCase());
                  // getWalkinTable();
                  setPage(1);
                }}
                placeholder="Enter AWB No."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    getWalkinTable();
                    setPage(1);
                  }
                }}
              />
              <Button
                onClick={() => {
                  getWalkinTable();
                  setPage(1);
                }}
                className="bg-blue-500 border-none py-1 px-2 text-white ml-2 w-1/3"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-center w-full my-4 border-t border-slate-200 dark:border-darkmode-400"></div>

        {isLoading ? (
          <div className="flex justify-center mt-6">
            <LoadingIcon icon="bars" className="block w-[6%]" />
          </div>
        ) : (
          <>
            {walkindata?.length > 0 ? (
              <>
                <Table
                  heightTable="55vh"
                  columns={columns}
                  row={row}
                  currentPage={page || 0}
                />
                <CommonPagination
                  totalpages={totalpages}
                  onPageChange={handlePagechange}
                  page={page}
                />
              </>
            ) : (
              <p className="mt-4 text-gray-400 text-center">No Data Found!</p>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default index;
