import { useState } from "react";
import { FormInput } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import { UpdateWeights } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Ruler, User } from "lucide-react";

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


 <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
		
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Ruler className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                  Update Weights
                  </h4>
                </div>
              </div>

              <div className="flex items-center w-full lg:w-auto">
                



             <div className="flex-wrap md:flex-nowrap flex gap-2 items-center w-full lg:w-auto">
       <div className="flex-wrap md:flex-nowrap flex  items-center gap-x-1 lg:gap-2 w-[48%] lg:w-auto">
                <label className="!mb-0">From</label>
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
           <div className="flex-wrap md:flex-nowrap flex  items-center gap-x-1 lg:gap-2 w-[48%] lg:w-auto">
          
                  <label className="!mb-0">From</label>
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
            <div className=" w-full lg:w-auto">
            <Button
              onClick={() => handleSubmit()}
              disabled={spinner}
              className="px-3 py-2 border-none rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
            >
              Search {spinner && <LoadingIcon icon="puff" className="ml-2" />}
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
        {updateWeightList.length == 0 ? (
          <>
            <p className="text-gray-400 text-center mt-4">No Data Found!</p>
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
