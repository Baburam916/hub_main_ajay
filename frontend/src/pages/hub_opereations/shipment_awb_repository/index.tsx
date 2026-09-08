import React, { useState } from "react";
import { FormInput } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import { ShipmentAwbReport } from "../../../DataTypes/dataTypes";
import { Shipment_awb_report } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";

const index = () => {
  const { showAlert } = useAlert();
  const [fromDate, setFromDate] = useState<any>();
  const [toDate, setToDate] = useState<any>();
  const [shipment, setShipment] = useState<Array<any>>([]);
  const current_user = localStorage.getItem("current_user");
  const [spinner, setSpinner] = useState<boolean>(false);
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const columns = [
    { field: "booking_date", headerName: "Booking Date" },
    { field: "airwaybilno", headerName: "Airwaybill No" },
    { field: "courier_name", headerName: "Courier Name" },
    { field: "pincode", headerName: "Origin Pincode" },
    { field: "city_name", headerName: "Origin City" },
    { field: "destination_pincode", headerName: "Destination Pincode" },
    { field: "destination_city", headerName: "Destination City" },
    { field: "destination_state", headerName: "Destination State" },
    { field: "destination_country", headerName: "Destination Country" },
    { field: "shipment_type", headerName: "Shipment Type" },
    { field: "chargable_weight", headerName: "Chargable Weight" },
    { field: "number_of_pieces", headerName: "No of Boxes" },
    { field: "product_value", headerName: "Declared Value" },
    { field: "product_description", headerName: "Description" },
    { field: "mobile_no", headerName: "Senders Mobile No" },
    { field: "senders_name", headerName: "Sender Full Name" },
    { field: "email_id", headerName: "Sender Email id" },
    { field: "senders_address", headerName: "Sender Address" },
    { field: "reciever_mobile", headerName: "Receiver Mobile No" },
    { field: "reciver_full_name", headerName: "Receiver Full Name" },
    { field: "reciver_email", headerName: "Receiver Email Id" },
    { field: "reciver_address", headerName: "Receiver Address" },
  ];

  const row: any = shipment?.map((item) => {
    return {
      ...item,
    };
  });

  const handleSubmit = async () => {
    let response: any;
    setSpinner(true);
    try {
      const inscanOutscanReport: ShipmentAwbReport = {
        from_date: fromDate,
        to_date: toDate,
      };
      response = await Shipment_awb_report(inscanOutscanReport, hub_id);
      if (response?.status == 200) {
        setShipment(response?.data?.data);
      } else if (response.status == 406) showAlert("No data found!", "warning");
      else if (response.status == 204) showAlert("No data found!", "warning");
      else showAlert(response.data.message, "warning");
    } catch (error: any) {
      console.log("Err", error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setSpinner(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="font-bold text-lg">Shipment Awb Repostory</h1>
        <hr />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <FormInput
              id="regular-form-1"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
              }}
              placeholder="Search..."
            />
          </div>
          <div>
            <FormInput
              id="regular-form-1"
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
              }}
              placeholder="Search..."
            />
          </div>
          <div>
            <Button
              onClick={() => handleSubmit()}
              disabled={spinner}
              className="p-2 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
            >
              Search {spinner && <LoadingIcon icon="puff" className="ml-2" />}
            </Button>
            {/* <Button className="ml-2 p-2 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-blue-500 text-white">
            Download
          </Button> */}
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto mt-4 px-6 py-3 bg-white rounded-lg shadow-lg">
        {shipment.length == 0 ? (
          <>
            <p className="text-gray-400 text-center mt-4">No Data Found!</p>
          </>
        ) : (
          <Table columns={columns} row={row} heightTable="51.5vh" />
        )}
      </div>
    </>
  );
};

export default index;
