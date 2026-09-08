import { ArrowLeft } from "lucide-react";
import Button from "../../../base-components/Button";
import {
  FormInput,
  FormLabel,
  FormTextarea,
} from "../../../base-components/Form";
import "../../../components/Table/index.css";
import { useEffect, useState } from "react";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Post_house_detail, common_get } from "../../../AllServices/services";
import CommonSearchableAll from "../../../components/commonSearchableAll";
const intselecteddata = {
  code: "",
  name: "",
};
const TagHouseDetail = (data: any) => {
  const { showAlert } = useAlert();
  const { editId, setShowTagHouseDetail, editHouseData, setEditHouseData } =
    data;
  const [spinner, setSpinner] = useState<boolean>(false);
  const [selecteddata, setSelecteddata] = useState<any>(intselecteddata);
   const fun1 = (a: any) => {
     setEditHouseData((prev:any) => ({
       ...prev,
       to_airport_code: a?.code || "",
     }));
   };
   const funtoempty = () => {
     setEditHouseData((prev:any) => ({
       ...prev,
       to_airport_code: "",
     }));
   };
  const postTaggedHouseData = async () => {
    setSpinner(true);
    const data = {
      pickup_id: editId,
      extra_data: editHouseData,
    };
    let response;
    try {
      response = await Post_house_detail(data);
      if (response.status == 200) {
        showAlert(response.data.message, "success");
        setEditHouseData(null);
        setShowTagHouseDetail(false);
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setSpinner(false);
    }
  };
  useEffect(()=>{
if(editHouseData?.to_airport_code){
  getparticulardata(editHouseData?.to_airport_code)
}
  },[])
 const getparticulardata = async (code: any) => {
   try {
     const res = await common_get(`/admin/airports?code=${"IOM"}`);
     if (res?.status == 200) {
       const data = res?.data?.data[0];
       setSelecteddata({ code: data?.code || "", name: data?.name || "" });
     } else {
       setSelecteddata(intselecteddata);
     }
   } catch (err: any) {
     console.log(err?.message);
   }
 };
  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 py-3 px-6 bg-white rounded-lg shadow-lg">
        <div className="w-full flex justify-between">
          <div className=" flex">
            <div
              className="p-2 cursor-pointer rounded-full shadow-lg mr-4"
              onClick={() => setShowTagHouseDetail(false)}
            >
              <ArrowLeft className="w-5 h-4" />
            </div>
            <h1 className="font-bold text-lg">Tagged House Details</h1>
          </div>
        </div>

        <div
          className="gap-4 tbl-overflow-x-auto"
          style={{ maxHeight: "70vh" }}
        >
          <div className="mt-3 flex">
            <FormLabel className="flex items-center font-bold">
              To (3-digit Airport code) :
            </FormLabel>
            <CommonSearchableAll
              apiEndpoint="/admin/airports"
              zIndex="20"
              selecteddata={selecteddata}
              setSelecteddata={setSelecteddata}
              fun1={fun1}
              funtoempty={funtoempty}
              key1={"key"}
              //  border={`${interrors?.country_id ? "border border-red-400" : ""}`}
              comingselectedname={"name"}
              comingselectedid={"code"}
              id={editHouseData?.to_airport_code}
            />
            {/* <FormInput
              className="w-60 ml-4"
              value={editHouseData?.to_airport_code}
              onChange={(e) =>
                setEditHouseData({
                  ...editHouseData,
                  to_airport_code: e.target.value,
                })
              }
            /> */}
          </div>
          <div className="mt-3 flex">
            <FormLabel className="flex items-center font-bold">
              By First Carrier :
            </FormLabel>
            <FormInput
              className="w-60 ml-4"
              value={editHouseData?.by_first_carrier}
              onChange={(e) =>
                setEditHouseData({
                  ...editHouseData,
                  by_first_carrier: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-3 flex">
            <FormLabel className="flex items-center font-bold">
              Airport Destination :
            </FormLabel>
            <FormInput
              className="w-60 ml-4"
              value={editHouseData?.airport_destination}
              onChange={(e) =>
                setEditHouseData({
                  ...editHouseData,
                  airport_destination: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-3 flex">
            <FormLabel className="flex items-center font-bold">
              Accounting Information :
            </FormLabel>
            <FormTextarea
              name="address"
              className="w-60 ml-4 p-2 mt-3 min-h-8 max-h-12"
              autoComplete="off"
              value={editHouseData?.accounting_information}
              onChange={(e) =>
                setEditHouseData({
                  ...editHouseData,
                  accounting_information: e.target.value,
                })
              }
            ></FormTextarea>
          </div>
          <div className="mt-3 flex">
            <FormLabel className="flex items-center font-bold">
              Handling Information :
            </FormLabel>
            <FormTextarea
              name="address"
              className="w-60 p-2 ml-4 mt-3 min-h-8 max-h-12"
              autoComplete="off"
              value={editHouseData?.handling_information}
              onChange={(e) =>
                setEditHouseData({
                  ...editHouseData,
                  handling_information: e.target.value,
                })
              }
            ></FormTextarea>
          </div>
          <div className="mt-3 flex">
            <FormLabel className="flex items-center font-bold">
              Quantity Of Goods :
            </FormLabel>
            <FormInput
              className="w-60 ml-4"
              value={editHouseData?.quantity_of_goods}
              onChange={(e) =>
                setEditHouseData({
                  ...editHouseData,
                  quantity_of_goods: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-3 flex">
            <FormLabel className="flex items-center font-bold">
              Invoice No. :
            </FormLabel>
            <FormInput
              className="w-60 ml-4"
              value={editHouseData?.booking_invoice_no}
              onChange={(e) =>
                setEditHouseData({
                  ...editHouseData,
                  booking_invoice_no: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-3 flex">
            <FormLabel className="flex items-center font-bold">
              IEC No. :
            </FormLabel>
            <FormInput
              className="w-60 ml-4"
              value={editHouseData?.iec_no}
              onChange={(e) =>
                setEditHouseData({
                  ...editHouseData,
                  iec_no: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-3 flex">
            <FormLabel className="flex items-center font-bold">
              HSN CODE :
            </FormLabel>
            <FormInput
              className="w-60 ml-4"
              value={editHouseData?.hsn_code}
              onChange={(e) =>
                setEditHouseData({
                  ...editHouseData,
                  hsn_code: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-3 flex">
            <FormLabel className="flex items-center font-bold">
              Execution Date :
            </FormLabel>
            <FormInput
              className="w-60 ml-4"
              type="date"
              value={editHouseData?.executiondate}
              onChange={(e) =>
                setEditHouseData({
                  ...editHouseData,
                  executiondate: e.target.value,
                })
              }
            />
          </div>
          <Button
            disabled={spinner}
            onClick={() => postTaggedHouseData()}
            className="mt-4 py-2 px-6 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
          >
            Save {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>
        </div>
      </div>
    </>
  );
};

export default TagHouseDetail;