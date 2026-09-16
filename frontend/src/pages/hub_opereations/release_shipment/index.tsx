import React, { useEffect, useState } from "react";
import { FormInput, FormSelect } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import {
  Release_shipments,
  Held_up_shipment_list,
  Release_held_up_shipment_list,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { ReleaseShipmentData } from "../../../DataTypes/dataTypes";
import LoadingIcon from "../../../base-components/LoadingIcon";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";
import { Search, Truck } from "lucide-react";
import { User } from "lucide-react";

const index = () => {
  const { showAlert } = useAlert();
  const [statusList, setStatusList] = useState<Array<any>>([]);
  const [heldUpShipments, setHeldUpShipments] = useState([]);
  const [airwaybillnumber, setAirwaybillNumber] = useState<any>(null);
  const [heldUpReason, setHeldUpReason] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [manifestSearch, setManifestSearch] = useState("");
  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);

  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const debouncedSearchTerm = useDebounce<string>(manifestSearch, 500);

  const handlePagechange = (e: number) => {
    setPage(e);
  };

  useEffect(() => {
    statusCodeList();
    getHeldUpShipmentList();
  }, [debouncedSearchTerm, page]);

  const statusCodeList = async () => {
    try {
      const response = await Release_held_up_shipment_list();
      if (response.status == 200) setStatusList(response.data.data);
      else showAlert("Reason list is not rendering!", "warning");
    } catch (error) {
      console.log(error);
      showAlert("Reason list is not rendering!", "error");
    }
  };

  const getHeldUpShipmentList = async () => {
    try {
      const response: any = await Held_up_shipment_list(
        hub_id,
        debouncedSearchTerm,
        20,
        page - 1
      );
      if (response?.status == 200) {
        setHeldUpShipments(response.data.data);
        setTotalPages(Math.ceil(response?.data?.count / 20));
      } else if (response?.status == 204) setHeldUpShipments([]);
      else showAlert(response.data.message, "warning");
    } catch (error) {
      if (error) showAlert("something went wrong!", "error");
    }
  };

  const columns = [
    { field: "airwaybill_no", headerName: "Airwaybill No." },
    { field: "reason", headerName: "Held up Reason" },
    { field: "created_date", headerName: "Held Up  DateTime" },
    { field: "other_reason", headerName: "Remark" },
  ];

  const row: any = heldUpShipments.map((item: any) => {
    return {
      ...item,
      reason: !item?.reason ? "Other Reason" : item?.reason,
      other_reason: !item?.other_reason ? "N.A." : item?.other_reason,
    };
  });

  const releaseShipments = async () => {
    setSpinner(true);
    const releaseShipmentData: ReleaseShipmentData = {
      airwaybill_no: airwaybillnumber,
      held_up_reason: heldUpReason,
    };
    try {
      const response = await Release_shipments(
        { hub_id, emp_id },
        releaseShipmentData
      );
      if (response.status == 201) {
        showAlert(response.data.message, "success");
        setAirwaybillNumber("");
        setHeldUpReason("");
        getHeldUpShipmentList();
      } else if (response.status == 203) {
        showAlert(response.data.message, "warning");
      } else if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.data.message, "error");
    } catch (error) {
      showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  return (
    <>
   <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
		
    <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nwrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Truck className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    {" "}
                   Release Shipment
                  </h4>
                </div>
              </div>

    
            </div>
          </div>


       <div className="p-2  lg:p-6">
    
        <div className="sm:flex">
          <div className="sm:w-[19%] sm:mr-2 mb-2 sm:mb-0">
            <FormSelect
              className=""
              value={heldUpReason}
              onChange={(e) => setHeldUpReason(e.target.value)}
            >
              <option value="">Select Reason</option>
              {statusList.map((val) => {
                return <option value={val.status_code}>{val.status}</option>;
              })}
            </FormSelect>
          </div>
          <div className="sm:w-[19%] sm:mr-2 mb-2 sm:mb-0">
            <FormInput
              placeholder="Airwaybill No"
              value={airwaybillnumber}
              onChange={(e) => setAirwaybillNumber(e.target.value.toUpperCase())}
              onKeyDown={(e)=> {
                if (e.key === 'Enter') {
                  releaseShipments()
                }
              }}
            />
          </div>
          <Button
            onClick={() => releaseShipments()}
            disabled={spinner}
            className="border-none px-3 py-2 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
          >
            Release Shipment{" "}
            {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>
        </div>
</div>
      </div>
        </div>

      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
		
 <div className=" w-full py-3  px-3 border-b border-white commonGradientGray  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nwrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Truck className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    {" "}
                Held up shipment list
                  </h4>
                </div>
              </div>

              <div className="flex items-center w-full lg:w-auto">


    
        
          <div className="relative flex justify-between items-center w-full lg:w-auto">
            <FormInput
              placeholder="Search..."
              className="pr-8 pt-1 pb-1 rounded-md h-[35px] w-full lg:w-auto"
              value={manifestSearch}
              onChange={(e) => {
                setManifestSearch(e.target.value.toUpperCase());
                getHeldUpShipmentList();
                setPage(1);
              }}
            />
            <Search className="absolute right-2 w-4 h-4" />
          </div>
      



              </div>
            </div>
          </div>


    <div className="p-2  lg:p-6">

        {heldUpShipments.length > 0 ? (
          <>
            <Table columns={columns} row={row} heightTable="45vh" currentPage={page || 0}/>
            <CommonPagination
              totalpages={totalpages}
              onPageChange={handlePagechange}
              page={page}
            />
          </>
        ) : (
          <>
            <p className="text-gray-400 text-center">No Data Found!</p>
          </>
        )}
      </div>
      </div>
      </div>
    </>
  );
};

export default index;
