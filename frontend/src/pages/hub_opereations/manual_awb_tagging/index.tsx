import React, { useEffect, useState } from "react";
import Button from "../../../base-components/Button";
import { FormInput, FormLabel } from "../../../base-components/Form";
import {
  Manual_awb_tagging_check_airwaybill,
  Manual_awb_tagging,
} from "../../../AllServices/services";
import { TagAirwaybillData } from "../../../DataTypes/dataTypes";
import { useAlert } from "../../../ContextProvider/AlertContext";
import LoadingIcon from "../../../base-components/LoadingIcon";

const index = () => {
  const { showAlert } = useAlert();
  const [courierId, setCourierId] = useState<any>(null);
  const [airwaybillNumber, setAirwaybillNumber] = useState<any>(null);
  const [showTagAirwaybill, setShowTagAirwaybill] = useState<boolean>(false);
  const [newAirwaybillNumber, setNewAirwaybillNumber] = useState<any>(null);
  const [refrenceNumber, setRefrenceNumber] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [upload, setUpload] = useState<any>(null);
  const [tagSpinner, setTagSpinner] = useState<boolean>(false);

  const checkAirwaybillNumber = async () => {
    setSpinner(true);
    try {
      const response: any = await Manual_awb_tagging_check_airwaybill(
        airwaybillNumber
      );
      if (response.status == 200) {
        setCourierId(response.data.data.courier_id);
        setShowTagAirwaybill(true);
      } else showAlert(response.data.message, "warning");
    } catch (err) {
      console.log(err);
      showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  const tagAirwaybillNumber = async () => {
    setTagSpinner(true);
    const formData = new FormData();
    formData.append("file", upload);
    formData.append("courier_id", courierId);
    formData.append("refrence_no", refrenceNumber);
    formData.append("airwaybill_no", airwaybillNumber);
    formData.append("new_airwaybill_no", newAirwaybillNumber);
    let response;
    try {
      response = await Manual_awb_tagging(formData);
      if (response.status == 201) {
        showAlert(response.data.message, "success");
        setShowTagAirwaybill(false);
        setNewAirwaybillNumber("");
        setAirwaybillNumber("");
        setRefrenceNumber("");
      } else if (response.status == 204) showAlert("No data found!", "warning");
      else showAlert(response.data.message, "warning");
    } catch (err) {
      console.log(err);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setTagSpinner(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="font-bold text-lg">Manual Awb Tagging</h1>
        <hr />
        <div className="mt-4 sm:flex">
          <FormLabel className={`flex items-center text-500`}>
            Airwaybill No. :
          </FormLabel>
          <FormInput
            value={airwaybillNumber}
            className="w-100 sm:w-60 sm:ml-4"
            disabled={showTagAirwaybill}
            onChange={(e) => setAirwaybillNumber(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                checkAirwaybillNumber()
              }
            }}
          />
          {!showTagAirwaybill && (
            <Button
              disabled={spinner}
              className="bg-mustard border-none py-1 px-4 mt-2 sm:mt-0 sm:ml-8 text-white rounded-xl"
              onClick={() => checkAirwaybillNumber()}
            >
              Check Airwaybill{" "}
              {spinner && <LoadingIcon icon="puff" className="ml-2" />}
            </Button>
          )}
        </div>
      </div>

      {showTagAirwaybill && (
        <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
          <div className="flex w-full">
            <div className="mr-4">
              <FormLabel className={`flex items-center text-500`}>
                Airwaybill No. To Tag
              </FormLabel>
              <FormInput
                value={newAirwaybillNumber}
                className="w-60"
                onChange={(e) => setNewAirwaybillNumber(e.target.value.toUpperCase())}
              />
            </div>
            <div className="">
              <FormLabel className={`flex items-center text-500`}>
                Upload
              </FormLabel>
              <FormInput
                type="file"
                className="w-60 ml-4"
                onChange={(e) =>
                  setUpload(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>
          </div>
          {courierId == 34 && (
            <div>
              <FormLabel className={`flex items-center text-500`}>
                Refrence No.
              </FormLabel>
              <FormInput
                value={refrenceNumber}
                className="w-60"
                onChange={(e) => setRefrenceNumber(e.target.value)}
              />
            </div>
          )}
          <div className="flex items-end mt-2">
            <Button
              disabled={tagSpinner}
              onClick={() => tagAirwaybillNumber()}
              className="bg-[#14d28b] border-none py-2 px-4 text-white rounded-xl hover:bg-[#169F85]"
            >
              Tag Airwaybill no.{" "}
              {tagSpinner && <LoadingIcon icon="puff" className="ml-2" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default index;
