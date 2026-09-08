import { useState } from "react";
import { FormInput } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import { UpdateWeights } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";

const index = () => {
  const { showAlert } = useAlert();
  const [toDate, setToDate] = useState<any>();
  const [fromDate, setFromDate] = useState<any>();
  const [spinner, setSpinner] = useState<boolean>(false);
  const [updateWeightList, setUpdateWeightList] = useState<Array<any>>([]);

  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const columns = [
    { field: "airwaybilno", headerName: "Airwaybill No" },
    { field: "handover_airwaybilno", headerName: "Handover Airwaybill no" },
    { field: "actual_weight", headerName: "Actual weight" },
    { field: "volumetric_weight", headerName: "Volumetric weight" },
    { field: "no_of_packages", headerName: "No of Packages" },
    { field: "length", headerName: "Length" },
    { field: "breadth", headerName: "Breadth" },
    { field: "height", headerName: "Height" },
    { field: "product_description", headerName: "Product Description" },
    { field: "courier_name", headerName: "Courier Name" },
    { field: "courier_type", headerName: "Courier Type" },
    { field: "created_date", headerName: "Created Date" },
    { field: "weight_status", headerName: "Weight Status" },
    { field: "party_name", headerName: "Party Name" },
  ];

  function updateWeightStatus(courierData: any) {
    const latestEntries = {};
    courierData.forEach((item: any) => {
      const awbNo = item.airwaybilno;
      const createdDate = new Date(item.weight_status);
      if (latestEntries[awbNo]) {
        if (createdDate > new Date(latestEntries[awbNo].weight_status)) {
          latestEntries[awbNo] = item;
        }
      } else {
        latestEntries[awbNo] = item;
      }
    });

    courierData.forEach((item: any) => {
      const awbNo = item.airwaybilno;
      if (item === latestEntries[awbNo]) {
        item.weight_status = "updated weight";
      } else {
        item.weight_status = "old weight";
      }
      item.courier_type = item.courier_type == 1 ? "International" : "Domestic";
    });
    return courierData;
  }

  const row: any = updateWeightStatus(updateWeightList);

  const handleSubmit = async () => {
    let response: any;
    setSpinner(true);
    try {
      const data = {
        from_date: fromDate,
        to_date: toDate,
      };
      response = await UpdateWeights(data, hub_id);
      if (response?.status == 200) {
        setUpdateWeightList(response?.data?.data);
      } else if (response.status == 406)
        showAlert(response.data.errors[0].msg, "warning");
      else if (response.status == 204) showAlert("No data found!", "warning");
      else showAlert(response.data.message, "warning");
    } catch (error: any) {
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="font-bold text-lg">Update Weights</h1>
        <hr />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <FormInput
              id="regular-form-1"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
              }}
              placeholder="From Date..."
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
              placeholder="To Date..."
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
        {updateWeightList.length == 0 ? (
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
