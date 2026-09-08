import React, { useEffect, useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";
import { Search } from "lucide-react";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { formatDate } from "../../../utils";
import {
  Create_held_up_request,
  Held_up_request_list,
  Release_shipments,
} from "../../../AllServices/services";

const index = () => {
  const { showAlert } = useAlert();
  const [awbNo, setAwbNo] = useState<string>("");
  const [heldUpReason, setHeldUpReason] = useState<string>("");
  const [submitSpinner, setSubmitSpinner] = useState<boolean>(false);
  const [openHeldUpModal, setOpenHeldUpModal] = useState<boolean>(false);

  const [searchValue, setSearchValue] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<Array<any>>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [releaseSpinner, setReleaseSpinner] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const debouncedSearchValue = useDebounce<string>(searchValue, 500);
  const limit = 10;

  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const columns = [
    { field: "airwaybill_no", headerName: "Airwaybill No" },
    { field: "held_up_reason", headerName: "Held Up Reason" },
    { field: "created_date", headerName: "Held Up DateTime" },
    { field: "action", headerName: "Action" },
  ];

  const rows = tableData?.map((item: any) => ({
    ...item,
    created_date: formatDate(item.created_date),
    action: (
      <Button
        className="bg-mustard text-white p-2"
        onClick={() => {
          setSelectedRow(item);
          setConfirm(true);
        }}
      >
        Release Shipment
      </Button>
    ),
  }));

  const handleReleaseShipment = async () => {
    setReleaseSpinner(true);
    try {
      const response: any = await Release_shipments(
        { hub_id, emp_id },
        {
          airwaybill_no: selectedRow?.airwaybill_no,
          held_up_reason: selectedRow?.reason,
        },
      );
      if (response?.status == 200 || response?.status == 201) {
        showAlert(response?.data?.message || "Shipment released successfully");
        setConfirm(false);
        setSelectedRow(null);
        getHeldUpRequestList();
      } else if (response?.response) {
        showAlert(
          response?.response?.data?.message ||
            response?.response?.data?.errors?.[0]?.msg ||
            "Something went wrong!",
          "error",
        );
      } else {
        showAlert(response?.data?.message || "Something went wrong!", "error");
      }
    } catch (error: any) {
      showAlert(error?.message, "error");
    } finally {
      setReleaseSpinner(false);
    }
  };

  const handleSubmitHeldUpRequest = async () => {
    if (!awbNo.trim()) {
      showAlert("Please enter AWB No.", "warning");
      return;
    }
    if (!heldUpReason.trim()) {
      showAlert("Please enter Remarks.", "warning");
      return;
    }
    setSubmitSpinner(true);
    try {
      const response: any = await Create_held_up_request({
        airwaybill_no: awbNo,
        held_up_reason: heldUpReason,
      });
      if (response?.status == 200 || response?.status == 201) {
        showAlert(response?.data?.message || "Held up request created successfully");
        setAwbNo("");
        setHeldUpReason("");
        setOpenHeldUpModal(false);
        getHeldUpRequestList();
      } else if (response?.response) {
        showAlert(
          response?.response?.data?.message ||
            response?.response?.data?.errors?.[0]?.msg ||
            "Something went wrong!",
          "error",
        );
      } else {
        showAlert(response?.data?.message || "Something went wrong!", "error");
      }
    } catch (error: any) {
      showAlert(error?.message, "error");
    } finally {
      setSubmitSpinner(false);
    }
  };

  const getHeldUpRequestList = async () => {
    setIsLoading(true);
    try {
      const response: any = await Held_up_request_list(
        debouncedSearchValue,
        limit,
        page - 1,
        fromDate,
        toDate,
      );
      if (response?.status == 200) {
        setTableData(response?.data?.data || []);
        setTotalPages(Math.ceil((response?.data?.count || 0) / limit) || 1);
      } else if (response?.status == 204) {
        setTableData([]);
      } else {
        showAlert(response?.data?.message || "Something went wrong!", "warning");
      }
    } catch (error: any) {
      showAlert(error?.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (page !== 1) {
      setPage(1);
    } else {
      getHeldUpRequestList();
    }
  };

  useEffect(() => {
    getHeldUpRequestList();
  }, [debouncedSearchValue, page]);

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 px-6 py-4 bg-white rounded-lg shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-bold text-lg">Held Up Request</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <FormInput
              placeholder="Search AWB..."
              className="pr-8"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value.replace(/\s/g, ""));
                setPage(1);
              }}
            />
            <Search className="absolute right-2 w-4 h-4" />
          </div>
          <Button
            className="p-2 px-5 rounded-md bg-mustard text-white"
            onClick={() => setOpenHeldUpModal(true)}
          >
            Held Up
          </Button>
        </div>
      </div>
      <hr />

      <div className="flex flex-wrap items-end gap-4 mt-4">
        <div>
          <FormLabel htmlFor="from_date">From Date</FormLabel>
          <FormInput
            id="from_date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <FormLabel htmlFor="to_date">To Date</FormLabel>
          <FormInput
            id="to_date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <Button
          onClick={handleSearch}
          className="p-2 px-5 rounded-md bg-mustard text-white flex items-center"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      <h1 className="font-400 text-md mt-8">Held Up Shipment List</h1>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center mt-6">
            <LoadingIcon icon="puff" className="block w-[6%]" />
          </div>
        ) : tableData.length > 0 ? (
          <>
            <Table
              columns={columns}
              row={rows}
              heightTable="50vh"
              currentPage={page}
            />
            <CommonPagination
              totalpages={totalPages}
              onPageChange={(p) => setPage(p)}
              page={page}
            />
          </>
        ) : (
          <p className="text-gray-400 text-center">No Data Found!</p>
        )}
      </div>

      <Modal
        open={openHeldUpModal}
        setOpen={setOpenHeldUpModal}
        title="Held Up Request"
        size="md"
        description={
          <div className="flex flex-col gap-4">
            <div>
              <FormLabel htmlFor="awb_no">AWB No.</FormLabel>
              <FormInput
                id="awb_no"
                type="text"
                value={awbNo}
                onChange={(e) => setAwbNo(e.target.value.replace(/\s/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitHeldUpRequest()}
                placeholder="Enter AWB No."
              />
            </div>
            <div>
              <FormLabel htmlFor="remarks">Remarks</FormLabel>
              <FormInput
                id="remarks"
                type="text"
                value={heldUpReason}
                onChange={(e) => setHeldUpReason(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitHeldUpRequest()}
                placeholder="Enter Remarks"
              />
            </div>
          </div>
        }
        footer={
          <div className="flex justify-end gap-4">
            <Button
              className="px-4 py-1 rounded-lg bg-gray-400 text-white"
              onClick={() => setOpenHeldUpModal(false)}
              disabled={submitSpinner}
            >
              Cancel
            </Button>
            <Button
              className="px-4 py-1 rounded-lg bg-mustard text-white flex items-center"
              onClick={handleSubmitHeldUpRequest}
              disabled={submitSpinner}
            >
              Save
              {submitSpinner && (
                <LoadingIcon icon="puff" className="ml-2 w-4 h-4" />
              )}
            </Button>
          </div>
        }
      />

      <Modal
        open={confirm}
        setOpen={setConfirm}
        title="Confirmation"
        size="md"
        description={
          <p className="text-center">
            Are you sure you want to release AWB{" "}
            <b>{selectedRow?.airwaybill_no}</b> shipment?
          </p>
        }
        footer={
          <div className="flex justify-end gap-4">
            <Button
              className="px-4 py-1 rounded-lg bg-gray-400 text-white"
              onClick={() => setConfirm(false)}
              disabled={releaseSpinner}
            >
              Cancel
            </Button>
            <Button
              className="px-4 py-1 rounded-lg bg-mustard text-white flex items-center"
              onClick={handleReleaseShipment}
              disabled={releaseSpinner}
            >
              Confirm
              {releaseSpinner && (
                <LoadingIcon
                  icon="puff"
                  color="white"
                  className="w-5 h-5 ml-2 stroke-2.5 text-white"
                />
              )}
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default index;
