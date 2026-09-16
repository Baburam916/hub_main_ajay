import { useEffect, useState } from "react";
import ReversedShipmentsList from "./reversed_shipments_list";
import { FormCheck, FormInput, FormLabel } from "../../../base-components/Form";
import {
  Reverse_shipment,
  Reversed_shipment_list,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Button from "../../../base-components/Button";
import { ReverseShipmentData } from "../../../DataTypes/dataTypes";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { useDebounce } from "../../../components/Search";
import { ClipboardCheck, User } from "lucide-react";

export default function Index() {
  const { showAlert } = useAlert();
  const [reversedShipmentList, setReversedShipmentList] = useState<Array<any>>(
    [],
  );
  const [airwaybillNo, setAirwaybillNo] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [remark, setRemark] = useState<any>(null);
  const [manifestSearch, setManifestSearch] = useState<any>("");
  const [rto, setRto] = useState(0);

  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;

  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);
  const debouncedSearchTerm = useDebounce<string>(manifestSearch, 500);

  const handlePagechange = (e: number) => {
    setPage(e);
  };

  useEffect(() => {
    getReversedShipmentList();
  }, [debouncedSearchTerm, page]);

  const getReversedShipmentList = async () => {
    try {
      const response = await Reversed_shipment_list(
        hub_id,
        debouncedSearchTerm,
        20,
        page - 1,
      );
      if (response.status == 200) {
        setReversedShipmentList(response.data.data);
        setTotalPages(Math.ceil(response?.data?.count / 20));
      } else if (response.status == 204) setReversedShipmentList([]);
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }
  };

  const reverseShipment = async () => {
    setSpinner(true);
    const reverseShipmentData: ReverseShipmentData = {
      airwaybill_no: airwaybillNo,
      remark: remark,
      rto: rto,
    };

    let response;
    try {
      response = await Reverse_shipment(
        { hub_id, emp_id },
        reverseShipmentData,
      );
      if (response.status == 201) {
        showAlert(response.data.message, "success");
        setAirwaybillNo("");
        setRemark("");
        getReversedShipmentList();
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
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
            <div className="flex-wrap lg:flex-nwrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <ClipboardCheck className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium"> Shipment Reverse</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2  lg:p-6">
            <div className="grid grid-cols-12 gap-2 ">
              <div className="col-span-12 lg:col-span-12">
                <div className="align-left w-[260px] flex justify-start bg-[#f6f6f6] rounded-md py-2 px-3 border border-[#eee]">
                  <FormCheck className="gap-4">
                    <FormCheck.Label
                      htmlFor="rto"
                      className="font-bold text-[15px]"
                    >
                      is this a R.T.O Shipment ? :
                    </FormCheck.Label>

                    <FormCheck.Input
                      id="rto"
                      type="checkbox"
                      value={rto}
                      onChange={(e) => setRto(e.target.checked ? 1 : 0)}
                      checked={rto == 1}
                      className="w-[20px] h-[20px]"
                    />
                  </FormCheck>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-3">
                <FormLabel className="sm:flex items-center text-500 !mb-0 ">
                  Airwaybill No :
                </FormLabel>
                <FormInput
                  className="w-full"
                  value={airwaybillNo}
                  onChange={(e) =>
                    setAirwaybillNo(e.target.value.toUpperCase())
                  }
                />
              </div>

              <div className="col-span-12 lg:col-span-7">
                <FormLabel className="sm:flex items-center text-500 !mb-0">
                  Remarks :
                </FormLabel>
                <FormInput
                  className="w-full"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>
              <div className="col-span-12 lg:col-span-2">
                <Button
                  disabled={spinner}
                  className="bg-mustard py-2 px-4 mt-[10px] lg:mt-[20px] h-[38px] text-white rounded-md border-none w-full"
                  onClick={() => reverseShipment()}
                >
                  Reverse Shipment{" "}
                  {spinner && <LoadingIcon icon="puff" className="ml-2" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReversedShipmentsList
        hub_id={hub_id}
        emp_id={emp_id}
        getReversedShipmentList={getReversedShipmentList}
        reversedShipmentsList={reversedShipmentList}
        manifestSearch={manifestSearch}
        setManifestSearch={setManifestSearch}
        totalpages={totalpages}
        page={page}
        setPage={setPage}
        handlePagechange={handlePagechange}
      />
    </>
  );
}
