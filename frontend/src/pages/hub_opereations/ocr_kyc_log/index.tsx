import React, { useEffect, useState } from "react";
import { Download, Search, XCircle } from "lucide-react";
import CommonPagination from "../../../components/Pagination";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { FormInput, FormLabel } from "../../../base-components/Form";
import LoadingIcon from "../../../base-components/LoadingIcon";
import Button from "../../../base-components/Button";
import { Get_kyc_document, OcrKycLogApi } from "../../../AllServices/services";
import { useDebounce } from "../../../components/Search";
import {
  convertJSONtoCSV,
  downloadAttachment,
  getCurrentDate,
} from "../../../utils";
import Table from "../../../components/Table";
import { CheckCircle2 } from "lucide-react";
import { set } from "lodash";

const OCRKYCLog: React.FC = () => {
  const { showAlert } = useAlert();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [totalPages, setTotalPages] = useState(1);
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const [hit, setHit] = useState(false);

  const getData = async () => {
    setLoading(true);
    setHit(true);
    try {
      const res = await OcrKycLogApi(
        page - 1,
        fromDate,
        toDate,
        debouncedSearch?.trim() || ""
      );
      if (res?.status == 200 || res?.status == 201 || res?.status == 204) {
        setData(res?.data?.data || []);
        setTotalPages(Math.ceil(res?.data?.total / 20) || 1);
      } else {
        setData([]);
        setPage(1);
        setTotalPages(1);
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error"
        );
      }
    } catch (error) {
      showAlert(error?.message || error?.msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setPage(1);
    setTotalPages(1);
    setData(null);
    setHit(false);
  };

  const handlePagechange = (e: number) => {
    setPage(e);
  };

  const columns = [
    {
      field: "airwaybilno",
      headerName: "Airwaybill No.",
      textAlign: "text-left",
    },
    {
      field: "kyc_details",
      headerName: "Kyc Documents",
      textAlign: "text-left",
    },
    {
      field: "response",
      headerName: "Status /Error Message",
      textAlign: "text-left",
    },
  ];

  const rows: any = data?.map((item: any, index: number) => {
    let data: any = {};
    try {
      data = item?.kyc_details ? JSON.parse(item.kyc_details) : {};
    } catch {
      data = {};
    }
    return {
      airwaybilno: item?.airwaybilno || "N.A.",
      kyc_details: (
        <>
          {" "}
          {data?.document_id_1 && data?.document_id_2 ? (
            <>
              <Button
                className="rounded-lg bg-green-500 text-white hover:bg-green-700 p-1 px-2 mr-2"
                onClick={() =>
                  downloadAttachment(data?.document_path_1, "document_1")
                }
              >
                {
                  documentTypeList
                    ?.find(
                      (elem) => elem?.organisation_id == data?.orgnization_id
                    )
                    ?.value?.find(
                      (item: any) => item?.id == data?.document_id_1
                    )?.value
                }
              </Button>{" "}
              <Button
                className="rounded-lg bg-cyan-500 text-white hover:bg-cyan-700 p-1 px-2"
                onClick={(e) => {
                  e.preventDefault();
                  downloadAttachment(data?.document_path_2, "document_2");
                }}
              >
                {/* Document Two */}
                {
                  documentTypeList
                    ?.find(
                      (elem) => elem?.organisation_id == data?.orgnization_id
                    )
                    ?.value?.find(
                      (item: any) => item?.id == data?.document_id_2
                    )?.value
                }
              </Button>
            </>
          ) : (
            "No Documents"
          )}
        </>
      ),
      response:
        item?.response?.length > 0 ? (
          <div className="flex gap-4">
            <XCircle className="w-5 h-5 text-red-500 stroke-2.5" />
            <p className="text-red-500">
              {item?.response[0]?.reason ||  "Document is not Authorized by GOVT OF INDIA" }
            </p>
          </div>
        ) : (
          <CheckCircle2 className="w-5 h-5 text-green-400 stroke-2.5" />
        ),
    };
  });

  const formatData = (data: any = []) => {
    if (!data?.length > 0) return [{ "No Data Found": "" }];
    return data?.map((item: any, index: number) => ({
      "Sr. No.": `${index + 1}.`,
      "Airwaybill Number": item?.airwaybilno,
      "Kyc Status": item?.response?.length > 0 ? "Invalid Kyc" : "Valid Kyc",
    }));
  };

  useEffect(() => {
    Get_kyc_document().then((res: any) => {
      setDocumentTypeList(res?.data?.data || []);
    });
  }, []);

  useEffect(() => {
    if (!hit) return;
    getData();
  }, [page]);

  return (
    <div className="m-auto  rounded p-4 mt-2">
      <div className=" border-l border-gray-300"></div>
      <div className="flex justify-between  border-b-2 mb-4 pb-2 ">
        <div className="flex items-centermb-2 w-full">
          <span className="mr-auto text-2xl text-primary font-bold">
            OCR KYC LOG
          </span>
        </div>
        {data?.length >= 1 ? (
          <Button
            className="p-2 text-white whitespace-nowrap"
            variant="success"
            onClick={() =>
              convertJSONtoCSV(formatData(data || []), "ocr_kyc_log")
            }
          >
            <Download className="mr-2" />
            Download CSV
          </Button>
        ) : (
          ""
        )}
      </div>
      <div className="w-full">
        <div className="bg-white  p-8 shadow-lg rounded-lg">
          <div
            className={` w-full grid sm:grid-cols-2 md:grid-cols-4 gap-4 items-end m-auto `}
          >
            <div>
              <FormLabel>FROM DATE</FormLabel>
              <span className="text-red-400">*</span>

              <FormInput
                type="date"
                name="from_date"
                value={fromDate}
                max={toDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <FormLabel>TO DATE</FormLabel>
              <span className="text-red-400">*</span>

              <FormInput
                type="date"
                name="to_date"
                value={toDate}
                min={fromDate}
                max={getCurrentDate()}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div>
              <FormLabel htmlFor="search_awb_no">Search AWB</FormLabel>
              <FormInput
                id="search_awb_no"
                type="text"
                placeholder="Enter AWB No."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex gap-4">
              <Button
                className="w-full bg-mustard text-white p-2"
                onClick={getData}
                disabled={!fromDate || !toDate}
              >
                Search
              </Button>
              <Button
                className="w-full bg-red-500 text-white p-2"
                onClick={handleReset}
                disabled={!fromDate || !toDate}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingIcon icon="tail-spin" className="block m-auto w-[4%] mt-8" />
      ) : hit == false ? null : data?.length == 0 ? (
        <p className="text-gray-400 text-center mt-8">No Data Found!</p>
      ) : data?.length > 0 ? (
        <div className="overflow-x-auto bg-white  mt-8 shadow-lg rounded-lg ">
          <Table
            heightTable="52vh"
            columns={columns}
            row={rows}
            listheight={"h-[100vh]"}
            loading={loading}
            margin={"mt-[100px]"}
            currentPage={page}
          />
        </div>
      ) : null}

      {data?.length > 0 && (
        <CommonPagination
          totalpages={totalPages}
          onPageChange={handlePagechange}
          page={page}
        />
      )}
    </div>
  );
};

export default OCRKYCLog;
