import Table from "../../../components/Table";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "../../../base-components/Form";
import { useEffect, useState } from "react";
import {
  Pending_onforward_Shipment,
  On_forward_shipment,
  Get_contact_detail,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Button from "../../../base-components/Button";
import { OnForwardShipmentData } from "../../../DataTypes/dataTypes";
import LoadingIcon from "../../../base-components/LoadingIcon";
import AutoComplete from "../../../components/AutoComplete/index";
import CommonPagination from "../../../components/Pagination";
import { Plane, Search, User } from "lucide-react";
import { useDebounce } from "../../../components/Search";

export default function Index() {
  const { showAlert } = useAlert();
  const [pendingOnforwardShipment, setPendingOnforwardShipment] = useState([]);
  const [onforwardModeList, setOnforwardModeList] = useState([]);
  const [type, setType] = useState<any>(null);
  const [mobileNumber, setMobileNumber] = useState<any>(null);
  const [driverName, setDriverName] = useState<any>(null);
  const [vehicleNo, setVehicleNo] = useState<any>(null);
  const [manifestNumber, setManifestNumber] = useState<any>(null);
  const [extraDetails, setExtraDetails] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);
  const [manifestSearch, setManifestSearch] = useState("");

  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const debouncedSearchTerm = useDebounce<string>(manifestSearch, 500);

  const handlePagechange = (e: number) => {
    setPage(e);
  };

  useEffect(() => {
    onForwardPendingShipment();
  }, [debouncedSearchTerm, page]);

  const onForwardPendingShipment = async () => {
    try {
      const response = await Pending_onforward_Shipment(
        hub_id,
        debouncedSearchTerm,
        20,
        page - 1
      );
      if (response.status == 200) {
        setOnforwardModeList(response.data.data.onForwardModeList);
        setPendingOnforwardShipment(response.data.data.result);
        setTotalPages(Math.ceil(response?.data?.count / 20));
      } else if (response?.status == 204) setPendingOnforwardShipment([]);
      else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }
  };

  const columns = [
    { field: "manifest_code", headerName: "Manifest No" },
    { field: "count_of_bags", headerName: "Total Bags" },
    { field: "courier_name", headerName: "Courier Name" },
    // { field: "hub_name", headerName: "Product Type" },
    { field: "created_date", headerName: "Created Date" },
  ];

  const row = pendingOnforwardShipment.map((item: any) => {
    return { ...item, count_of_bags: <p className="text-end">{item?.count_of_bags}</p> };
  });

  const onForwardShipment = async () => {
    setSpinner(true);
    const onForwardShipmentData: OnForwardShipmentData = {
      type: type,
      mobile_no: mobileNumber,
      driver_name: driverName,
      vehicle_no: vehicleNo,
      manifest_no: manifestNumber,
      extra_details: extraDetails,
    };
    let response;
    try {
      response = await On_forward_shipment(
        { emp_id, hub_id },
        onForwardShipmentData
      );
      if (response.status == 200) {
        showAlert(response.data.message, "success");
        setType("");
        setMobileNumber("");
        setDriverName("");
        setVehicleNo("");
        setManifestNumber("");
        setExtraDetails("");
        onForwardPendingShipment();
      } else if (response.status == 204) showAlert("No data found!", "warning");
      else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
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
                    <Plane className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    {" "}
                    Manifest Onforword Shipment List
                  </h4>
                </div>
              </div>

            </div>
          </div>

     <div className="p-2  lg:p-6">
        <div className="grid grid-cols-12 gap-2 lg:gap-3">
          <div className="col-span-12 lg:col-span-3">
            <FormSelect
              className=""
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">--Select Mode--</option>
              {onforwardModeList?.map((val: any) => (
                <option key={val.id} value={val.id}>
                  {val.mode}
                </option>
              ))}
            </FormSelect>
          </div>
       <div className="col-span-12 lg:col-span-3">
            <AutoComplete
              apiFunction={Get_contact_detail}
              setMobileNumber={setMobileNumber}
              mobileNumber={mobileNumber}
              setDriverName={setDriverName}
              setVehicleNo={setVehicleNo}
            />
          </div>
           <div className="col-span-12 lg:col-span-3">
            <FormInput
              id="regular-form-1"
              type="text"
              value={driverName}
              placeholder="Driver Name"
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>
             <div className="col-span-12 lg:col-span-3">
            <FormInput
              id="regular-form-1"
              type="text"
              value={vehicleNo}
              placeholder="Vehicle Name"
              onChange={(e) => setVehicleNo(e.target.value)}
            />
          </div>
          <div className="col-span-12 lg:col-span-3">
            <FormInput
              id="regular-form-1"
              type="text"
              value={manifestNumber}
              placeholder="Manifest Number"
              onChange={(e) => setManifestNumber(e.target.value.toUpperCase())}
            />
          </div>
             <div className="col-span-12 lg:col-span-6">
          <FormTextarea
            name="address"
            className="p-2 h-[37px]"
            placeholder="Extra Details"
            autoComplete="off"
            value={extraDetails}
            onChange={(e) => setExtraDetails(e.target.value)}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                onForwardShipment();
              }
            }}
          ></FormTextarea>
          </div>
                <div className="col-span-12 lg:col-span-3">
          <Button
            disabled={spinner}
            onClick={() => onForwardShipment()}
            className=" border-none w-full  px-2 py-2 h-[37px] rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
          >
            Outscan Manifest{" "}
            {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button></div>
        </div>
        {/* <Button
        className="ml-2 bg-blue-600 border-none py-2 px-4 text-white"
      
      >
          Download Outscan Manifest
      </Button> */}
      </div>
</div></div>









 <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">

  <div className=" w-full py-3  px-3 border-b border-white commonGradientGray  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nwrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Plane className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
          Onforward Pending List
                  </h4>
                </div>
              </div>

              <div className="flex items-center w-full lg:w-auto">




       
          <div className="relative flex justify-between items-center w-full lg:w-auto">
            <FormInput
              placeholder="Search..."
              className="pr-8 pt-1 pb-1 rounded-md border-none h-[35px] w-full lg:w-auto"
              value={manifestSearch}
              onChange={(e) => {
                setManifestSearch(e.target.value.toUpperCase());
                onForwardPendingShipment();
                setPage(1);
              }}
            />
            <Search className="absolute right-2 w-4 h-4" />
          </div>
        





              </div>
            </div>
          </div>




        {pendingOnforwardShipment.length > 0 ? (
          <>
                   <div className="p-2  lg:p-6">
            <Table columns={columns} row={row} heightTable="29vh" />
            <CommonPagination
              totalpages={totalpages}
              onPageChange={handlePagechange}
              page={page}
            />
            </div>
          </>
        ) : (
          <>
             <div className="p-2  lg:p-6">
            {/* <h1 className="font-400 text-md">Pending Onforward Shipment</h1> */}
            <p className="text-gray-400 text-center">No Data Found!</p>
             </div>
          </>
        )}
      </div>
      
 </div>

    </>
  );
}
