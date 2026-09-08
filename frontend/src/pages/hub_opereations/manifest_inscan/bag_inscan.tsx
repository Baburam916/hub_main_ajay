import { ArrowLeft, ArrowRight } from "lucide-react";
import { Inscan_bag } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { BagNo } from "../../../DataTypes/dataTypes";
import Table from "../../../components/Table";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { useState } from "react";
import { Link } from "react-router-dom";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { indianFormat } from "../../../utils";

export default function BagInscan(data: any) {
  const { showAlert } = useAlert();
  const { emp_id, hub_id } = data;
  const [bagNumber, setBagNumber] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false)

  const bagInscan = async () => {
    const bagNo: BagNo = {
      manifest_no: data.manifestNumber,
      bag_no: bagNumber,
    };
    let response;
    setSpinner(true)
    try {
      response = await Inscan_bag({ emp_id, hub_id }, bagNo);
      if (response.status == 201) {
        data.manifestInscan(data.manifestNumber);
        data.setShowBagInscan(false);
        
        showAlert(response.data.message, "success");
      } else if (response.status == 203)
        showAlert(response?.data?.message, "warning");
      else showAlert(response.data.message, "error");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally{
      setSpinner(false)
    }
  };

  const columns = [
    { field: "bag_no", headerName: "Bag No." },
    { field: "total_shipments", headerName: "Total Shipments" },
    { field: "total_weight", headerName: "Weight" },
    { field: "status", headerName: "Status" },
  ];

  let total_bags = 0;
  let total_scanned = 0;

  const row = data.bagInscanList.map((item: any) => {
    total_bags += 1
    total_scanned += item.status == 3 ? 1 : 0;

    let isStatusText;
    let text = (data: any) => (
      <p className={`px-2 py-1 rounded bg-${data.bgColor} text-white`}>
        {data.value}
      </p>
    );
    switch (item.status) {
      case 4:
        isStatusText = text({ value: "Short Shipment", bgColor: "red-500" });
        break;
      case 3:
        isStatusText = text({ value: "Scanned", bgColor: "green-500" });
        break;
      case 2:
        isStatusText = text({ value: "Pending", bgColor: "blue-600" });
        break;
      default:
        isStatusText = "Unknown";
    }

    return {
      ...item,
      total_shipments: <p className="text-end">{item.total_shipments}</p>,
      total_weight: <p className="text-end">{`${indianFormat(item.total_weight)} ${item.weight_unit}`}</p>,
      status: isStatusText,
    };
  });

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 px-6 py-3 bg-white rounded-lg shadow-lg">
        <div className="flex items-center">
          <div
            className="p-2 mb-2 cursor-pointer rounded-full shadow-lg mr-4"
            onClick={() => data.setShowBagInscan(false)}
          >
            <ArrowLeft className="w-5 h-4" />
          </div>
          <div className="flex justify-between w-[100%]">
            <h1 className="text-gray-500 text-sm sm:text-lg font-bold">Bag Inscan</h1>
            <div className="flex justify-end items-center">
              <h1 className="text-sm text-gray-500 sm:text-lg font-bold">Next Shipment Segregation</h1>
              <div className="p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2">
                <Link
                  to="/hub/operation/shipment_segregation"
                  className="font-bold"
                >
                  <ArrowRight className="w-5 h-4 " />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <hr />
        <div className="flex justify-between items-center mt-2 mb-2">
          <div className="w-[50%] mt-3 sm:flex">
            <FormLabel className="flex items-center text-500">
              Bag No. :
            </FormLabel>
            <FormInput
              className="w-[100%] sm:w-60 sm:ml-4"
              value={bagNumber}
              onChange={(e) => setBagNumber(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                   bagInscan();
                }
              }}
            />
            <Button
              onClick={() => bagInscan()}
              disabled = {spinner}
              className="bg-mustard border-none py-1 px-4 mt-2 sm:mt-0 sm:ml-8 text-white rounded-xl"
            >
              Scan Bag  {spinner && <LoadingIcon icon="puff" className="ml-2" />}
            </Button>
          </div>
          <div className="w-[48%] sm:w-[15%] text-right bg-gray-400 p-2 rounded-lg">
            <p className="font-500 text-white">Total Bags : {total_bags}</p>
            <p className="font-500 text-white">
              Total Scanned : {total_scanned}
            </p>
          </div>
        </div>

        <Table columns={columns} row={row} heightTable="32vh"/>
      </div>
    </>
  );
}
