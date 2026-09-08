import React, { useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import BagInscanList from "./bag_inscan_list";
import IncompleteList from "./bag_segregation";
import { Segregation_inscan_bag } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const index = () => {
  const { showAlert } = useAlert();
  const [bagNumber, setBagNumber] = useState<any>(null);
  const [bagInscanList, setBagInscanList] = useState<Array<any>>([]);
  const [showBagInscanList, setShowBagInscanList] = useState<boolean>(false);
  const [spinner, setSpinner] = useState<boolean>(false);

  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const bagInscan = async (bagNumber: any) => {
    setSpinner(true);
    try {
      const response = await Segregation_inscan_bag({
        hub_id,
        bag_no: bagNumber,
      });
      if (response.status == 200) {
        setBagInscanList(response.data.data);
        setShowBagInscanList(true);
      } else if (response?.status === 204) {
        setBagInscanList([]);
        showAlert("No data found!", "warning");
      } else showAlert(response.data.message, "error");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  console.log(bagInscanList, "bagInscanList")

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between mb-2">
          <h1 className="text-sm sm:text-lg font-bold">Shipment Segregation</h1>
          {!showBagInscanList && (
            <div>
              <div className="flex items-center ml-2">
                <h1 className="text-sm sm:text-lg font-bold">
                  Next Create Bag
                </h1>
                <div className="p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2">
                  <Link to="/hub/operation/create_bag" className="font-bold">
                    <ArrowRight className="w-5 h-4 " />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        <hr />
        <div className="mt-4 sm:flex">
          <FormLabel>Bag No. :</FormLabel>
          <FormInput
            disabled={showBagInscanList || spinner}
            className="w-60 sm:ml-4 mb-2 sm:mb-0"
            value={bagNumber}
            onChange={(e) => setBagNumber(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                bagInscan(bagNumber);
              }
            }}
          />
          <Button
            className="bg-mustard border-none py-1 px-4 sm:ml-8 text-white rounded-xl"
            disabled={spinner || showBagInscanList}
            onClick={() => bagInscan(bagNumber)}
          >
            Inscan Bag {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>
        </div>
      </div>

      {showBagInscanList ? (
        <BagInscanList
          bagInscanList={bagInscanList}
          hub_id={hub_id}
          emp_id={emp_id}
          bagInscan={bagInscan}
          bagNumber={bagNumber}
          setShowBagInscanList={setShowBagInscanList}
          showBagInscanList={showBagInscanList}
        />
      ) : (
        <IncompleteList
          hub_id={hub_id}
          setBagNumber={setBagNumber}
          bagNumber={bagNumber}
          bagInscan={bagInscan}
        />
      )}
    </>
  );
};

export default index;
