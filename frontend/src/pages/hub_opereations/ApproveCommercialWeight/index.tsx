import React, { useEffect, useState } from "react";
import Button from "../../../base-components/Button";
import { Download, Search } from "lucide-react";
import LoadingIcon from "../../../base-components/LoadingIcon";
import LoadingButtonCommon from "../../../components/loadingButtonCommon/loadingButttonCommon";
import {
  postIntegratorChange_weight,
  GetAllUserList,
  AwbDatafranchiseename,
  postIntegratorAcceptReject,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { FormInput, FormLabel } from "../../../base-components/Form";
import CommonSearchableAll from "../../../components/commonSearchableAll";
import IsLoading from "../../../components/Isloading/isLoading";
import Table from "../../../base-components/Table";
import Nodatafound from "../../../components/NoDatafound/nodataFound";
import CommonPagination from "../../../components/Pagination";
import { formatDate } from "../../../components/FormatDate/FormatDate";
import { ExportToXLSX } from "../../../components/ExportToXLSX/ExportToXLSX";

const LIMIT = 10;
const EMPTY_FRANCHISEE = { franchisee_id: "", franchisee_name: "" };

type FilterOverrides = {
  fromDate?: string;
  toDate?: string;
  searchvalue?: string;
  franchisee_id?: string;
  page?: number;
};

function ApproveCommercialWeight() {
  const { showAlert } = useAlert();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [selectedFranchisee, setSelectedFranchisee] = useState<any>(EMPTY_FRANCHISEE);
  const [franchiseeId, setFranchiseeId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [userList, setUserList] = useState<any[]>([]);
  const [franchiseeList, setFranchiseeList] = useState<any[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const getFranchiseeName = (id: number) =>
    franchiseeList.find((f) => f.franchisee_id === id)?.franchisee_name ?? id;

  const getUserName = (emp_id: number) =>
    userList.find((u) => u.type?.some((t: any) => t.emp_id === emp_id))?.name ?? emp_id;

  const fetchData = async (overrides?: FilterOverrides) => {
    try {
      setIsLoading(true);
      const response = await postIntegratorChange_weight({
        from: (overrides?.fromDate ?? fromDate) || undefined,
        to: (overrides?.toDate ?? toDate) || undefined,
        limit: LIMIT,
        page: overrides?.page ?? page,
        f_id: (overrides?.franchisee_id ?? franchiseeId) || undefined,
        key: (overrides?.searchvalue ?? searchValue) || undefined,
      });
      setData(response?.data?.data ?? []);
      setTotalPages(response?.data?.pages ?? 0);
    } catch {
      showAlert("Error fetching data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptReject = async (action: 1 | 2, rowId: number) => {
    const key = `${action}-${rowId}`;
    setActionLoadingId(key);
    try {
      const response = await postIntegratorAcceptReject(rowId, action);
      if (response?.data?.status) {
        showAlert(action === 1 ? "Accepted successfully" : "Rejected successfully", "success");
        fetchData({ page });
      } else {
        showAlert(response?.data?.message || "Something went wrong", "error");
      }
    } catch {
      showAlert("Action failed", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await postIntegratorChange_weight({
        from: fromDate || undefined,
        to: toDate || undefined,
        f_id: franchiseeId || undefined,
        key: searchValue || undefined,
      });
      const mappedData = (response?.data?.data ?? []).map((item: any) => ({
        STATUS:
          item?.status === 0 ? "Pending" :
          item?.status === 1 ? "Accepted" :
          item?.status === 2 ? "Rejected" : "",
        "FRENCHISEE NAME": item?.data?.pickup_franchisee_id
          ? getFranchiseeName(item.data.pickup_franchisee_id)
          : "",
        "AWB NO.": item?.data?.AWB_No || "",
        "CREATED DATE": formatDate(item?.created_date) || "",
        "CREATED BY": item?.created_by ? getUserName(item.created_by) : "",
      }));
      ExportToXLSX({
        tableData: mappedData,
        leftAlignColumns: ["FRENCHISEE NAME", "AWB NO.", "CREATED BY"],
        centerAlignColumns: ["STATUS", "CREATED DATE"],
        rightAlignColumns: [],
        fileName: "approve_commercial_weight",
      });
    } catch {
      showAlert("Error downloading data", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchData({ page: 0 });
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setSearchValue("");
    setSelectedFranchisee(EMPTY_FRANCHISEE);
    setFranchiseeId("");
    setPage(0);
    setData([]);
    fetchData({ fromDate: "", toDate: "", searchvalue: "", franchisee_id: "", page: 0 });
  };

  const handleFranchiseeSelect = (a?: any) => {
    setFranchiseeId(a?.franchisee_id ?? "");
  };

  const handleFranchiseeClear = () => {
    setSelectedFranchisee(EMPTY_FRANCHISEE);
    setFranchiseeId("");
  };

  useEffect(() => {
    fetchData();
    GetAllUserList()
      .then((r) => setUserList(r?.data?.data?.result ?? []))
      .catch(() => showAlert("Error fetching user list", "error"));
    AwbDatafranchiseename()
      .then((r) => setFranchiseeList(r?.data?.data ?? []))
      .catch(() => showAlert("Error fetching franchisee list", "error"));
  }, []);

  const hasFilters = !!(fromDate || toDate || searchValue || franchiseeId);
  const isDateIncomplete = (!!fromDate && !toDate) || (!fromDate && !!toDate);

  return (
    <div>
      <div className="flex justify-between mt-5 mb-2 p-2 bg-white shadow-lg rounded-md">
        <h2 className="text-xl mt-1 font-bold text-primary">APPROVE COMMERCIAL WEIGHT</h2>
        {data.length > 0 && (
          <Button
            className="text-white p-2 mr-1"
            disabled={isDownloading}
            variant="success"
            onClick={handleDownload}
          >
            <Download />
            {isDownloading ? <LoadingButtonCommon text="Downloading" /> : "Download"}
          </Button>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-md relative z-[60]">
        <div className="grid grid-cols-5 gap-4 mt-5 mb-2 p-3 w-full m-auto">
          <div>
            <FormLabel>SEARCH BY AWB</FormLabel>
            <FormInput
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e: any) => setSearchValue(e.target.value)}
            />
          </div>
          <div>
            <FormLabel>SEARCH FRANCHISEE</FormLabel>
            <CommonSearchableAll
              apiEndpoint="/admin/franchisee-settings"
              placeholder="Search For Franchisee"
              selecteddata={selectedFranchisee}
              setSelecteddata={setSelectedFranchisee}
              fun1={handleFranchiseeSelect}
              comingselectedname="franchisee_name"
              comingselectedid="franchisee_id"
              funtoempty={handleFranchiseeClear}
              zIndex={60}
              key1="key"
            />
          </div>
          <div>
            <FormLabel>FROM DATE</FormLabel>
            <FormInput
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e: any) => {
                const val = e.target.value;
                setFromDate(val);
                if (toDate && val > toDate) setToDate("");
              }}
            />
          </div>
          <div>
            <FormLabel>TO DATE</FormLabel>
            <FormInput
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e: any) => setToDate(e.target.value)}
            />
          </div>
          <div className="col-span-1 flex flex-col">
            <FormLabel>&nbsp;</FormLabel>
            <div className="flex gap-2">
              <Button
                variant="mustard"
                disabled={isLoading || !hasFilters || isDateIncomplete}
                onClick={handleSearch}
                className="mb-2 p-2 flex-1 !bg-mustard-500"
              >
                <Search className="mr-1" />
                {isLoading ? <LoadingIcon icon="puff" /> : "Search"}
              </Button>
              <Button
                variant="secondary"
                disabled={!hasFilters}
                onClick={handleReset}
                className="mb-2 p-2 flex-1 !bg-gray-500 !border-gray-500 text-white"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white w-full rounded-md shadow-lg overflow-auto">
        {isLoading ? (
          <IsLoading />
        ) : (
          <Table sm hover>
            <Table.Thead variant="dark" className="thead-primary table-sorting bg-mustard sticky top-0">
              <Table.Tr>
                <Table.Th className="text-right whitespace-nowrap">S.NO.</Table.Th>
                <Table.Th className="text-center whitespace-nowrap">STATUS</Table.Th>
                <Table.Th className="text-left whitespace-nowrap">FRENCHISEE NAME</Table.Th>
                <Table.Th className="text-left whitespace-nowrap">AWB NO.</Table.Th>
                <Table.Th className="text-center whitespace-nowrap">CREATED DATE</Table.Th>
                <Table.Th className="text-left whitespace-nowrap">CREATED BY</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((item: any, index: number) => (
                <Table.Tr key={index} className="intro-x">
                  <Table.Td className="text-right">{page * LIMIT + index + 1}</Table.Td>
                  <Table.Td className="text-center whitespace-nowrap">
                    {item?.status === 0 ? (
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="success"
                          className="text-white p-1 text-xs"
                          disabled={!!actionLoadingId}
                          onClick={() => handleAcceptReject(1, item?.id)}
                        >
                          {actionLoadingId === `1-${item?.id}` ? (
                            <LoadingIcon icon="puff" className="w-4 h-4" />
                          ) : "Accept"}
                        </Button>
                        <Button
                          variant="danger"
                          className="text-white p-1 text-xs"
                          disabled={!!actionLoadingId}
                          onClick={() => handleAcceptReject(2, item?.id)}
                        >
                          {actionLoadingId === `2-${item?.id}` ? (
                            <LoadingIcon icon="puff" className="w-4 h-4" />
                          ) : "Reject"}
                        </Button>
                      </div>
                    ) : item?.status === 1 ? (
                      <span className="text-green-600 font-semibold">Accepted</span>
                    ) : item?.status === 2 ? (
                      <span className="text-red-600 font-semibold">Rejected</span>
                    ) : ""}
                  </Table.Td>
                  <Table.Td className="text-left whitespace-nowrap">
                    {item?.data?.pickup_franchisee_id ? getFranchiseeName(item.data.pickup_franchisee_id) : ""}
                  </Table.Td>
                  <Table.Td className="text-left whitespace-nowrap">{item?.data?.AWB_No || ""}</Table.Td>
                  <Table.Td className="text-center whitespace-nowrap">{formatDate(item?.created_date) || ""}</Table.Td>
                  <Table.Td className="text-left whitespace-nowrap">
                    {item?.created_by ? getUserName(item.created_by) : ""}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </div>

      {data.length === 0 && <Nodatafound />}

      {totalPages > 1 && (
        <CommonPagination
          onPageChange={(newPage: number) => {
            setPage(newPage);
            fetchData({ page: newPage });
          }}
          page={page}
          totalpages={totalPages}
        />
      )}
    </div>
  );
}

export default ApproveCommercialWeight;
