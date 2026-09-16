import { useEffect, useState } from "react";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import CustomerForm from "./customer_form";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Customer_house_master_list } from "../../../AllServices/services";
import { ArrowLeft, Home } from "lucide-react";

const index = () => {
  const { showAlert } = useAlert();
  const [showHouseMasterForm, setShowHouseMasterForm] =
    useState<boolean>(false);
  const [houseMasterList, setHouseMasterList] = useState<Array<any>>([]);
  const [gstStatusList, setGstStatusList] = useState<Array<any>>([]);
  const [pickDataForEdit, setPickDataForEdit] = useState<any>(null);

  const [submitUpdatebtn, setSubmitUpdateBtn] = useState<boolean>(false);
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  useEffect(() => {
    getHouseMasterList();
  }, []);

  const getHouseMasterList = async () => {
    let response: any;
    try {
      response = await Customer_house_master_list(hub_id);
      if (response?.status == 200) {
        setHouseMasterList(response?.data.data.list);
        if (response.data.data.list.length == 0) setShowHouseMasterForm(true);
        else setShowHouseMasterForm(false);
        setGstStatusList(response?.data?.data?.gst_status);
      } else if (response.status == 204) showAlert("No data found!", "warning");
      else showAlert(response.data.message, "warning");
    } catch (error) {
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    }
  };

  const columns = [
    { field: "name", headerName: "Customer Name" },
    { field: "address", headerName: "Address" },
    { field: "phone", headerName: "Phone Number" },
    { field: "action", headerName: "Action" },
  ];

  const row = houseMasterList?.map((item: any) => {
    const action = (
      <Button
        className="bg-blue-600 border-none py-2 px-4 text-white"
        onClick={() => {
          setPickDataForEdit(item);
          setShowHouseMasterForm(true);
          setSubmitUpdateBtn(true);
        }}
      >
        Edit
      </Button>
    );

    return {
      ...item,
      action: action,
    };
  });

  return (
    <>
 <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
        
  <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-none flex gap-2 items-center justify-between w-full">
          <div className=" flex">
            {houseMasterList.length > 0 && showHouseMasterForm && (
              <div
                className="  p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2 bg-[#777] w-[34px] h-[34px]"
                onClick={() => {
                  setPickDataForEdit(null);
                  setShowHouseMasterForm(false);
                }}
              >
                <ArrowLeft className="w-5 h-4 text-white" />
              </div>
            )}
     

 <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Home className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    {" "}
                  Customer House Master 
                  </h4>
                </div>



          </div>
          {!showHouseMasterForm && (
            <div className="flex items-center">
              <Button
                className="px-4 py-1 rounded-md bg-mustard text-white  ml-2 border-none"
                onClick={() => {
                  setShowHouseMasterForm(true), setSubmitUpdateBtn(false);
                }}
              >
                Add House
              </Button>
            </div>
          )}
        </div>
   </div>

    
      <div className="p-2  lg:p-6">

        {!showHouseMasterForm ? (
          <Table columns={columns} row={row} heightTable="66vh" />
        ) : (
          <CustomerForm
            hub_id={hub_id}
            pickDataForEdit={pickDataForEdit}
            setPickDataForEdit={setPickDataForEdit}
            gstStatusList={gstStatusList}
            getHouseMasterList={getHouseMasterList}
            setShowHouseMasterForm={setShowHouseMasterForm}
            submitUpdatebtn={submitUpdatebtn}
          />
        )}
</div>


      </div>
      </div>
    </>
  );
};

export default index;
