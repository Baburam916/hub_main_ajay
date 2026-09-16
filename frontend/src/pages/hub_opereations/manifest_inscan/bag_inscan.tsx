import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Scan,
  User,
  Wallet,
} from "lucide-react";
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
  const [spinner, setSpinner] = useState<boolean>(false);

  const bagInscan = async () => {
    const bagNo: BagNo = {
      manifest_no: data.manifestNumber,
      bag_no: bagNumber,
    };
    let response;
    setSpinner(true);
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
    } finally {
      setSpinner(false);
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
    total_bags += 1;
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
      total_weight: (
        <p className="text-end">{`${indianFormat(item.total_weight)} ${item.weight_unit}`}</p>
      ),
      status: isStatusText,
    };
  });

  return (
    <>
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="  flex justify-center items-center p-1 cursor-pointer rounded-full shadow-lg mr-1 ml-1 bg-[#777] w-[30px] h-[30px]"
                    onClick={() => data.setShowBagInscan(false)}
                  >
                    <ArrowLeft className="w-4 h-4 text-white" />
                  </div>

                  <h4 className="text-[16px] font-medium"> Bag Inscan</h4>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex justify-end items-center">
                  <h1 className="text-sm text-gray-500 sm:text-lg font-bold">
                    Next Shipment Segregation
                  </h1>
                  <div className=" flex justify-center items-center p-1 cursor-pointer rounded-full shadow-lg mr-4 ml-2 bg-[#777] w-[30px] h-[30px]">
                    <Link
                      to="/hub/operation/shipment_segregation"
                      className="font-bold"
                    >
                      <ArrowRight className="w-4 h-4 text-white" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full p-2 lg:p-3 border-b border-gray-200 bg-[#f1f1f1]">
            <div className="flex-wrap lg:flex-nowrap justify-between flex gap-2">
              <div className="flex-wrap lg:flex-nowrap justify-between flex gap-2 w-full lg:w-auto">
                <FormInput
                  className="w-full lg:w-auto "
                  placeholder="Enter Bag No."
                  value={bagNumber}
                  onChange={(e) => setBagNumber(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      bagInscan();
                    }
                  }}
                />
                <Button
                  onClick={() => bagInscan()}
                  disabled={spinner}
                  className="bg-mustard border-none py-1 px-3 text-white rounded-md  w-full lg:w-auto"
                >
                  Scan Bag{" "}
                  {spinner && <LoadingIcon icon="puff" className="ml-2" />}
                </Button>
              </div>
              <div className="">
                <div className="flex-wrap lg:flex-nowrap flex gap-2">
                  <div className="  justify-between rounded-lg bg-[#DFFEF3] px-3 py-2  items-center border border-[#ADEED8] ">
                    <div className="text-[15px] text-[#00704A] flex items-center">
                      <Briefcase className="w-[20px] h-[22px] mr-1 font-medium " />
                      <h3 className="font-medium uppercase">
                        Total Bags <span> : {total_bags}</span>
                      </h3>{" "}
                    </div>
                  </div>

                  <div className="  justify-between rounded-lg bg-[#f1f8ff] px-3 py-2  items-center border border-[#bedcff] ">
                    <div className="text-[15px] text-[#075dc2] flex items-center">
                      <Scan className="w-[20px] h-[22px] mr-1 font-medium " />
                      <h3 className="font-medium uppercase">
                        Total Scanned <span> : {total_scanned}</span>
                      </h3>{" "}
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "}
          </div>
          <div className="p-2  lg:p-6">
            <Table columns={columns} row={row} heightTable="32vh" />
          </div>
        </div>
      </div>
    </>
  );
}
