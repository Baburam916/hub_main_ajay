import React, { useState } from "react";
import { FormInput } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import { ShipmentAwbReport } from "../../../DataTypes/dataTypes";
import { Shipment_awb_report } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Calendar } from "lucide-react";

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
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Calendar className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    Shipment Awb Repostory
                  </h4>
                </div>
              </div>

              <div className="flex items-center w-full lg:w-auto">
                <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center w-full lg:w-auto">
                  <div className="flex-wrap lg:flex-nowrap flex  items-center gap-0 lg:gap-2 w-[48%] lg:w-auto">
                    <label className="!mb-0">From</label>
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
                  <div className="flex-wrap lg:flex-nowrap  items-center flex gap-0 lg:gap-2  w-[48%] lg:w-auto">
                    <label className="!mb-0">To</label>
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
                  <div className=" w-full lg:w-auto">
                    <Button
                      onClick={() => handleSubmit()}
                      disabled={spinner}
                      className="px-4 py-2 rounded-md border-none font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
                    >
                      Search{" "}
                      {spinner && <LoadingIcon icon="puff" className="ml-2" />}
                    </Button>
                    {/* <Button className="ml-2 p-2 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-blue-500 text-white">
            Download
          </Button> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2  lg:p-6">
            <div className="w-full">
              {shipment.length == 0 ? (
                <>
                  <p className="text-gray-400 text-center mt-4">
                    No Data Found!
                  </p>
                </>
              ) : (
                <Table columns={columns} row={row} heightTable="51.5vh" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default index;
