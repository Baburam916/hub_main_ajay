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
import { Search } from "lucide-react";
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
      <div className="w-full max-w-6xl mx-auto mt-4 py-4 px-6 bg-white rounded-lg shadow-lg">
        <h1 className="font-bold text-lg mb-2">
          Manifest Onforword Shipment List
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="">
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
          <div className="">
            <AutoComplete
              apiFunction={Get_contact_detail}
              setMobileNumber={setMobileNumber}
              mobileNumber={mobileNumber}
              setDriverName={setDriverName}
              setVehicleNo={setVehicleNo}
            />
          </div>
          <div className="">
            <FormInput
              id="regular-form-1"
              type="text"
              value={driverName}
              placeholder="Driver Name"
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>
          <div className="">
            <FormInput
              id="regular-form-1"
              type="text"
              value={vehicleNo}
              placeholder="Vehicle Name"
              onChange={(e) => setVehicleNo(e.target.value)}
            />
          </div>
          <div className="">
            <FormInput
              id="regular-form-1"
              type="text"
              value={manifestNumber}
              placeholder="Manifest Number"
              onChange={(e) => setManifestNumber(e.target.value.toUpperCase())}
            />
          </div>
          <FormTextarea
            name="address"
            className="px-4 py-3 mt-2  max-h-10 min-h-12"
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
          <Button
            disabled={spinner}
            onClick={() => onForwardShipment()}
            className="mt-4 p-2 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
          >
            Outscan Manifest{" "}
            {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>
        </div>
        {/* <Button
        className="ml-2 bg-blue-600 border-none py-2 px-4 text-white"
      
      >
          Download Outscan Manifest
      </Button> */}
      </div>
      <div className="w-full max-w-6xl mx-auto mt-4 py-3 px-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between">
          <h1 className="font-400 text-md">Onforward Pending List</h1>
          <div className="relative flex justify-between items-center">
            <FormInput
              placeholder="Search..."
              className="pr-8 pt-1 pb-1 rounded-xl"
              value={manifestSearch}
              onChange={(e) => {
                setManifestSearch(e.target.value.toUpperCase());
                onForwardPendingShipment();
                setPage(1);
              }}
            />
            <Search className="absolute right-1 w-5 h-4" />
          </div>
        </div>
        {pendingOnforwardShipment.length > 0 ? (
          <>
            <Table columns={columns} row={row} heightTable="29vh" />
            <CommonPagination
              totalpages={totalpages}
              onPageChange={handlePagechange}
              page={page}
            />
          </>
        ) : (
          <>
            {/* <h1 className="font-400 text-md">Pending Onforward Shipment</h1> */}
            <p className="text-gray-400 text-center">No Data Found!</p>
          </>
        )}
      </div>
    </>
  );
}
