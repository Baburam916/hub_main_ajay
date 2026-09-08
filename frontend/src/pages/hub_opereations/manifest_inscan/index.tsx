import { useState } from "react";
import ManifestInscan from "./manifest_inscan";
import BagInscan from "./bag_inscan";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { ManifestNo } from "../../../DataTypes/dataTypes";
import { Inscan_manifest } from "../../../AllServices/services";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Index() {
  const { showAlert } = useAlert();
  const [showBagInscan, setShowBagInscan] = useState<boolean>(false);
  const [manifestNumber, setManifestNumber] = useState<any>(null);
  const [bagInscanList, setBagInscanList] = useState<Array<any>>([]);
  const [spinner, setSpinner] = useState<boolean>(false);

  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const manifestInscan = async (manifestNumber: any) => {
    setSpinner(true);
    const manifestNo: ManifestNo = {
      manifest_no: manifestNumber,
    }; 
    let response;
    try {
      response = await Inscan_manifest({ emp_id, hub_id }, manifestNo);
      if (response.status == 200) {
        setBagInscanList(response.data.data);
        setShowBagInscan(true);
      } else if (response?.status === 204) {
        setBagInscanList([]);
        showAlert("No data found!", "warning");
      }  else if (response.response.status == 406)
      showAlert(response.response.data.errors[0].msg, "warning");
    else showAlert(response.data.message, "error");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };
 
  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between mb-2">
          <h1 className="text-sm sm:text-lg font-bold">Manifest Inscan</h1>
          {!showBagInscan && (
            <div>
              <div className="flex items-center ml-2">
                <h1 className="text-sm sm:text-lg font-bold">Next Shipment Segregation</h1>
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
          )}
        </div>

        <hr />
        <div className="mt-4 sm:flex">
          <FormLabel
            className={`flex items-center text-500 ${
              showBagInscan ? "disable" : ""
            }`}
          >
            Manifest No. :
          </FormLabel>
          <FormInput
            disabled={showBagInscan || spinner}
            className="w-60 sm:ml-4"
            value={manifestNumber}
            onChange={(e) => setManifestNumber(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                manifestInscan(manifestNumber)
              }
            }}
          />
          
          <Button
            disabled={showBagInscan || spinner}
            className="bg-mustard border-none py-1 px-4 mt-2 sm:mt-0 sm:ml-8 text-white rounded-xl"
            onClick={() => manifestInscan(manifestNumber)}
          >
            Scan Manifest{" "}
            {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button></div>
       
      </div>
      {!showBagInscan ? (
        <ManifestInscan
          hub_id={hub_id}
          manifestInscan={manifestInscan}
          manifestNumber={manifestNumber}
          setManifestNumber={setManifestNumber}
          showBagInscan = {showBagInscan}
          setShowBagInscan={setShowBagInscan}
          spinner ={spinner}
        />
      ) : (
        <BagInscan
          hub_id={hub_id}
          emp_id={emp_id}
          manifestInscan={manifestInscan}
          setShowBagInscan={setShowBagInscan}
          bagInscanList={bagInscanList}
          manifestNumber={manifestNumber}
        />
      )}
    </>
  );
}
