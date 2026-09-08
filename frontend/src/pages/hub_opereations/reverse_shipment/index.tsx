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

export default function Index() {
  const { showAlert } = useAlert();
  const [reversedShipmentList, setReversedShipmentList] = useState<Array<any>>(
    []
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
        page - 1
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
        reverseShipmentData
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
      <div className="w-full max-w-6xl mx-auto mt-4 px-6 py-3 bg-white rounded-lg shadow-lg">
        <h1 className="font-bold text-lg">Shipment Reverse</h1>
        <hr />
        <div className="mt-4 sm:flex">
          <FormLabel className="sm:flex items-center text-500 ">
            Airwaybill No :
          </FormLabel>
          <FormInput
            className="sm:w-60 sm:ml-5"
            value={airwaybillNo}
            onChange={(e) => setAirwaybillNo(e.target.value.toUpperCase())}
          />
        </div>
        <div className="mt-4 sm:flex">
          <FormCheck className="gap-4">
            <FormCheck.Label htmlFor="rto">
              is this a R.T.O Shipment ? :
            </FormCheck.Label>
            <FormCheck.Input
              id="rto"
              type="checkbox"
              value={rto}
              onChange={(e) => setRto(e.target.checked ? 1 : 0)}
              checked={rto == 1}
            />
          </FormCheck>
        </div>
        <div className="mt-4 sm:flex">
          <FormLabel className="sm:flex items-center text-500 ">
            Remarks :
          </FormLabel>
          <FormInput
            className="sm:w-60 sm:ml-5"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>
        <div className="mt-3 flex w-full items-center justify-end">
          <Button
            disabled={spinner}
            className="bg-mustard border-none py-2 px-4 text-white rounded-xl"
            onClick={() => reverseShipment()}
          >
            Reverse Shipment{" "}
            {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>
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
