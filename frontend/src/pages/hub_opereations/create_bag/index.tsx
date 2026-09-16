import { useEffect, useState } from "react";
import {
  Bag_no_and_type,
  Created_bag_list,
  Incomplete_bag_shipment_list,
  Create_bag_pending_list,
  Create_bag,
  Shipment_inscan_list,
  Chargable_weight_list,
  common_get,
  common_post,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import { ArrowLeft, Box, ClipboardList, Eye, User } from "lucide-react";
import CreateBag from "./create_bag";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Modal from "../../../components/Modal";
import {
  ChargableWeightData,
  CreateBagData,
} from "../../../DataTypes/dataTypes";
import { Truck } from "lucide-react";

export default function Index() {
  const { showAlert } = useAlert();
  const [seal, setSeal] = useState(0);
  const [bagNumber, setBagNumber] = useState<any>(null);
  const [typeList, setTypeList] = useState<Array<any>>([]);
  const [cancelModal,setCancelModal]=useState<boolean>(false)
  const [cancelLoading,setCancelLoading]=useState<boolean>(false)
  const [cancelMotherboxno,setCancelMotherboxNo]=useState<any>('')
  ;
  const [createdBagList, setCreatedBagList] = useState<Array<any>>([]);
  const [forwhat,setForwhat]=useState<any>("")
  const [incompleteShipmentList, setIncompleteShipmentList] = useState<
    Array<any>
  >([]);
    const [motherboxlist, setMotherboxlist] = useState<
      Array<any>
    >([]);
  const [pendingCreateBagList, setPendingCreateBagList] = useState<Array<any>>(
    []
  );
  const [chargableWeightList, setChargableWeightList] = useState<Array<any>>(
    []
  );
  const [disableField, setDisableField] = useState<boolean>(false);
  const [showCreateBag, setShowCreateBag] = useState<boolean>(false);
  const [showIncompleteShipmentList, setShowIncompleteShipmentList] =
    useState<boolean>(false);
      const [showMotherBoxlist, setShowMotherBoxLists] =
        useState<boolean>(false);
  const [incompleteCreatedBagData, setIncompleteCreatedBagData] =
    useState<any>(null);
  const [shipmentInscanList, setShipmentInscanList] = useState<Array<any>>([]);
  const [courierTypeId, setCourierTypeId] = useState<any>(-1);
  const [branchTypeId, setBranchTypeId] = useState<any>(null);
  const [hubTypeId, setHubTypeId] = useState<any>(null);
  const [regHubTypeId, setRegHubTypeId] = useState<any>(null);
  const [showCloseBag, setShowCloseBag] = useState<boolean>(false);
  const [spinner, setSpinner] = useState<any>("");

  // const [toggleShipment, setToggleShipment] = useState<boolean>(false);
  const [pendingSpinner, setPendingSpinner] = useState<boolean>(false);

  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;

  useEffect(() => {
    getCreatedBagList();
  }, []);

  const getCreatedBagList = async () => {
    try {
      const response = await Created_bag_list(hub_id);
      if (response.status == 200) setCreatedBagList(response.data.data);
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }
  };

  const getIncompleteShipmentList = async (check:any) => {
    setSpinner(check);
    let response;

   
    try {
      if(check=="Bag")
      {
         response = await Incomplete_bag_shipment_list(hub_id)
           if (response.status == 200) {
             setIncompleteShipmentList(response?.data?.data);

             setShowIncompleteShipmentList(true);
           } else if (response.status == 204)
             showAlert("No data found!", "warning");
    }
      if(check=="Mother"){
        response =       
           await common_get("/hub/widect/motherbox_list");
      if (response.status == 200) {
        setMotherboxlist(response?.data?.data);

        setShowMotherBoxLists(true);
      } else if (response.status == 204) showAlert("No data found!", "warning");
      }
     
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    } finally {
      setSpinner("");
    }
  };

  // const getPendingShipmentList = async () => {
  //   setPendingSpinner(true);
  //   let response;
  //   try {
  //     response = await Create_bag_pending_list(hub_id);
  //     if (response.status == 200) {
  //       setIncompleteShipmentList(response.data.data);
  //       setShowIncompleteShipmentList(true);
  //     } else if (response.status == 204) showAlert("No data found!", "warning");
  //   } catch (error) {
  //     console.log(error);
  //     showAlert("Something went wrong!", "error");
  //   } finally {
  //     setPendingSpinner(false);
  //   }
  // };

  const handlecancel=()=>{
    setCancelLoading(false)
    setCancelModal(false)
    setCancelMotherboxNo("")
  }
  const getBagNumberAndType = async (seal: any,value?:any) => {
    let response;
    try {
      response =
        value == "Bag"
          ? await Bag_no_and_type(hub_id, seal)
          : await common_get("/hub/widect/motherbox_number");
      if (response.status == 200) {
        if(value=="Bag"){
 setTypeList(response?.data?.data?.type_list);
 setBagNumber(response?.data?.data?.bag_no);
 setShowIncompleteShipmentList(false);
 setShowCreateBag(true);
        }else{
          setBagNumber(response?.data?.data?.motherbox_no)
           setShowIncompleteShipmentList(false);
           setShowCreateBag(true);
        }
       
      } else showAlert("Bag no. not found!", "warning");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }
  };

  const createdBagColumns = [
    { field: "bag_no", headerName: "Bag No." },
    { field: "bag_weight", headerName: "Bag Weight" },
    { field: "destination_type", headerName: "Handover Type" },
    { field: "courier_name", headerName: "Courier Name" },
    { field: "created_date", headerName: "Created Date" },
  ];

  const incompleteShipmentColumns =  [
        { field: "bag_no", headerName: "Bag No." },
        { field: "airwaybill_no", headerName: "Airwaybill No." },
        { field: "action", headerName: "Continue" },
      ]
    const motherboxlistscolumn = [
      { field: "label", headerName: "Label" },
      { field: "motherbox_no", headerName: "MotherBox No." },

      { field: "injection_point", headerName: "Injection Point" },
      { field: "action", headerName: "Action" },
    ];
  

  const createdBagRows = createdBagList.map((item: any) => {
    return {
      ...item,
      bag_weight: `${item.total_weight}${item.weight_unit}`,
    };
  });

  const incompleteShipmentRows = incompleteShipmentList.map((item: any) => {
    const ActionButton = (
      <Button
        onClick={() => {
          setIncompleteCreatedBagData(item);
          getBagNumberAndType(1,"Bag");
     setForwhat("Bag");
          getShipmentInscanList(item?.bag_no,"Bag");
        }}
        className="px-2 py-1 rounded-md border-none bg-blue-500 text-white hover:bg-blue-700"
      >
        Continue
      </Button>
    );
    
  
return {
    ...item,
    action: ActionButton,
  };



  });
  const handleSubmit=async()=>{
    try{
      setCancelLoading(true)
const res = await common_post("/hub/widect/cancel_motherbox", {
  bag_no: cancelMotherboxno,
});
if(res?.status==200){
  showAlert(res?.data?.message||res?.data?.msg||"Cancelled Successfully")
  setCancelModal(false)
  setCancelMotherboxNo("")
  getIncompleteShipmentList("Mother")
}else if (res?.status==203) {
   showAlert(
     res?.data?.message ||
       res?.data?.msg ||
       "Something going wrong!!..please try after some time"
   ,"warning");}
  else{
 showAlert(res?.response?.data?.message||res?.response?.data?.error||res?.response?.data?.msg||"Something going wrong!!..please try after some time")
}   }catch(err:any){
  console.log(err?.message)
}finally{
  setCancelLoading(false)
}
  }
  const ModalTitle = <h2 className="mr-auto text-base font-medium">Action </h2>;
  const Modaldescription = (
    <>
      {/* <div className="col-span-12">
      <FormLabel >Enter Remarks</FormLabel> 
    <FormInput placeholder="Remarks" onChange={(e:any)=>setModaldata((pre:any)=>({...pre,remark:e.target.value}))}/>
          <div>
        </div>
      </div> */}
      <div className="col-span-12 text-center">
        {" "}
        Are you Sure!!.. You want to perform this action?..
      </div>
    </>
  );

  //  Modal footer

  const Modalfooter = (
    <>
      <Button
        type="button"
        variant="outline-secondary"
        onClick={() => {
          setCancelModal(false);
          setCancelMotherboxNo("")
          setCancelLoading(false)
          // setModaldata(intmodaldata);
        }}
        className="w-20 p-2 ml-2"
      >
        Close
      </Button>
      {cancelLoading ? (
        <Button
          variant="mustard"
          type="button"
          disabled={cancelLoading}
          className=" p-2 ml-2 w-[150px]"
        >
          Processing..
        </Button>
      ) : (
        <Button
          variant="mustard"
          type="button"
          disabled={cancelLoading}
          onClick={(e: any) => handleSubmit()}
          className="w-[150px] p-2 ml-2 rounded-md border-none"
        >
          Cancel
        </Button>
      )}
    </>
  );
    const motherboxlistsrow = motherboxlist?.map((item: any) => {
      // const ActionButton = (
      //   <Button
      //     onClick={() => {
      //       setIncompleteCreatedBagData(item);
      //       getBagNumberAndType(1, "Bag");
      //       getShipmentInscanList(item.bag_no);
      //     }}
      //     className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-700"
      //   >
      //     Continue
      //   </Button>
      // );
      const label = (
        <div className="flex justify-center items-center">
          <a href={item?.label} target="_blank">
            {" "}
            <Eye className="text-mustard cursor-pointer hover:text-success" />
          </a>
        </div>
      );
      const cancelShipment = (
        <Button className="px-2 py-1 rounded-md border-none bg-blue-500 text-white hover:bg-blue-700" onClick={()=>{
          setCancelModal(true)
          setCancelMotherboxNo(item?.bag_no)
        }}>
          Cancel
        </Button>
      );
      return {
        action: cancelShipment,
        label: label,
        motherbox_no: item?.bag_no,
        injection_point: item?.injection_point,
      };
     
    });
  const createBag = async (bagNumber: any, airwaybillNo: any, type: any,value?:any) => {
    const createBagData: CreateBagData = {
      bag_no: bagNumber,
      airwaybill_no: airwaybillNo,
      courier_type_id: courierTypeId,
      branch_type_id: branchTypeId,
      hub_type_id: hubTypeId,
      reg_hub_type_id: regHubTypeId,
      bag_vendor: type,
    };
    let response;
  
    try {
      setSpinner(value);
      response =
        value == "Bag"
          ? await Create_bag({ emp_id, hub_id, seal }, createBagData)
          : await common_post("/hub/widect/create_motherbox",{
    "bag_no":bagNumber,
    "airwaybill_no" : airwaybillNo
});
      if (response.status == 201) {
      if(value=="Bag"){
  getShipmentInscanList(bagNumber,forwhat);
      setSpinner("");
      }else{
       setShipmentInscanList(response?.data?.data || []);
             setShowCloseBag(true);
      }

        
      
        setDisableField(true);
       
        showAlert(response?.data?.message||"Inscaned Successfully", "success");
        

      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setSpinner('');
    }
  };

  const getShipmentInscanList = async (bagNumber: any,value:any) => {
    try {
      const response = await Shipment_inscan_list(bagNumber, hub_id)
      if (response.status == 200) {
      
        setShipmentInscanList(response?.data?.data||[]);
        if(value=="Mother"){
          setShowCloseBag(true)
        }
        if(value=="Bag"){
  getChargableWeightList(response?.data?.data||[]);
      setSpinner("");
        }
      
      } else showAlert("Shipment inscan list not found!", "warning");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }finally{
          setSpinner("");
    }
  };

  const getChargableWeightList = async (shipmentInscanList: any) => {
    const chargableWeightData: ChargableWeightData = {
      list: shipmentInscanList,
    };
    try {
      const response = await Chargable_weight_list(chargableWeightData);
      if (response.status == 200) {
        setChargableWeightList(response.data.data);
        setShowCloseBag(true);
            setSpinner("");
      }
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }finally{
      setSpinner("")
    }
  };

  return (
    <>
      {!showCreateBag ? (
        <>
          <div className="w-full">
          <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
       
               <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
           

 <div className="block lg:flex items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2 mb-2 lg:mb-0">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <ClipboardList  className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
             Bag List
                  </h4>
                </div>
              </div>



              <div className="flex-wrap lg:flex-none flex gap-2 items-center ">
                <Button
               className="px-3 py-1 border-none rounded-md bg-mustard text-white hover:bg-[#777]"
                  onClick={() => {
                    setShowCloseBag(false);
                    setDisableField(false);
                    setIncompleteCreatedBagData(null);
                    setSeal(0);
                    getBagNumberAndType("", "Mother");
                    setForwhat("Mother");
                  }}
                >
                  Mother Box
                </Button>
                <Button
                 className="px-3 py-1 border-none rounded-md bg-blue-500 text-white hover:bg-[#777]"
                  onClick={() => {
                    setShowCloseBag(false);
                    setDisableField(false);
                    setIncompleteCreatedBagData(null);
                    setSeal(1);
                    getBagNumberAndType(1, "Bag");
                  }}
                >
                  Create Bag Seal
                </Button>

                <Button
                  className="px-3 py-1 border-none rounded-md bg-[#777] text-white hover:bg-[#777]"
                  onClick={() => {
                    setShowCloseBag(false);
                    setDisableField(false);
                    setIncompleteCreatedBagData(null);
                    setSeal(0);
                    setForwhat("Bag");
                    getBagNumberAndType(0, "Bag");
                  }}
                >
                  Create Bag
                </Button>
                <div className="flex items-center ml-2">
                  <h1 className="font-bold">Next Create Manifest</h1>
                  <div className="p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2 bg-[#777] w-[34px] h-[34px]">
                    <Link
                      to="/hub/operation/create_manifest"
                      className="font-bold"
                    >
                      <ArrowRight className="w-5 h-4 text-[#fff] " />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
     </div>


        
            <div className="p-2  lg:p-6">
              {createdBagList.length > 0 ? (
                <Table
                  columns={createdBagColumns}
                  row={createdBagRows}
                  heightTable="20vh"
                />
              ) : (
                <>
                  <h1 className="font-bold text-md">Created Bag List</h1>
                  <p className="text-gray-400 text-center">No Data Found!</p>
                </>
              )}
            </div>
          </div>
          </div>

          <div className="w-full mt-4 flex-wrap lg:flex-none flex gap-2">
            {!showIncompleteShipmentList ? (
              <>
                <Button
                  className="mr-2 px-3 py-2 rounded-md bg-mustard text-white border-none"
                  disabled={spinner}
                  onClick={() => getIncompleteShipmentList("Bag")}
                >
                <i className="bg-[#FFEEC5] rounded-full p-1 w-[30px] h-[30px] flex items-center justify-center">
                <Truck className="w-[16px] h-[16px] text-[#DBA628]" /> </i>
                <p className="font-bold ml-2"> Check Incomplete Shipments{" "}</p>
                  {spinner=="Bag" && <LoadingIcon icon="puff" className="ml-2" />}
                </Button>

                {/* <Button
                  className="ml-2 px-4 py-1 rounded-lg bg-mustard text-white"
                  disabled={pendingSpinner}
                  onClick={() => getPendingShipmentList()}
                >
                  Check Pending Shipments{" "}
                  {pendingSpinner && (
                    <LoadingIcon icon="puff" className="ml-2" />
                  )}
                </Button> */}
              </>
            ) : (
              <>
               
               <div className="w-full border border-[#E6E6E6] rounded-[15px] shadow-[0_0px_5px_#edf5ff] mb-4 bg-white">
                <div className="bookleftTittle rounded-tl-[15px] rounded-tr-[15px] border-b border-[#E6E6E6] px-[12px] py-[10px]  bg-[#F8F8F8] ">
                <div className="flex items-center ">
                  <div
                    className="p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2 bg-[#777] w-[34px] h-[34px]"
                    onClick={() => setShowIncompleteShipmentList(false)}
                  >
                    <ArrowLeft className="w-5 h-4 text-[#fff] " />
                  </div>
                  <h1 className="text-base text-gray-500 font-bold">
                    Pending Inscan List
                  </h1>
                </div></div>


                <div className="  p-1 lg:p-4">
                  <Table
                    columns={incompleteShipmentColumns}
                    row={incompleteShipmentRows}
                    heightTable="29vh"
                  />
                </div>
    </div>


              </>
            )}
            {!showMotherBoxlist ? (
              <>
                <Button
                    className="px-3 py-2 rounded-md bg-mustard text-white border-none"
                  disabled={spinner}
                  onClick={() => getIncompleteShipmentList("Mother")}
                >

                  <i className="bg-[#FFEEC5] rounded-full p-1 w-[30px] h-[30px] flex items-center justify-center">
                <Box className="w-[16px] h-[16px] text-[#DBA628]" /> </i>
                <p className="font-bold ml-2">
                  Check Mother Boxes{" "}
                  </p>
                  {spinner=="Mother" && <LoadingIcon icon="puff" className="ml-2" />}
                </Button>

                {/* <Button
                  className="ml-2 px-4 py-1 rounded-lg bg-mustard text-white"
                  disabled={pendingSpinner}
                  onClick={() => getPendingShipmentList()}
                >
                  Check Pending Shipments{" "}
                  {pendingSpinner && (
                    <LoadingIcon icon="puff" className="ml-2" />
                  )}
                </Button> */}
              </>
            ) : (
              <>
              
                <div className="w-full border border-[#E6E6E6] rounded-[15px] shadow-[0_0px_5px_#edf5ff] mb-4 mt-4 bg-white">
                <div className="bookleftTittle rounded-tl-[15px] rounded-tr-[15px] border-b border-[#E6E6E6] px-[12px] py-[10px]  bg-[#F8F8F8] ">
               

                <div className="flex items-center ">
                  <div
                    className="p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2 bg-[#777] w-[34px] h-[34px]"
                    onClick={() => setShowMotherBoxLists(false)}
                  >
                    <ArrowLeft className="w-5 h-4 text-[#fff]" />
                  </div>
                  <h1 className="text-base text-gray-500 font-bold">
                    Mother Box List
                  </h1>
                </div>
                </div>
                 <div className="  p-1 lg:p-4">
                  <Table
                    columns={motherboxlistscolumn}
                    row={motherboxlistsrow}
                    heightTable="29vh"
                  />
                </div>

</div>

              </>
            )}
          </div>
        </>
      ) : (
        <CreateBag
          seal={seal}
          hub_id={hub_id}
          emp_id={emp_id}
          typeList={typeList}
          bagNumber={bagNumber}
          setBagNumber={setBagNumber}
          setShowCreateBag={setShowCreateBag}
          setBranchTypeId={setBranchTypeId}
          setCourierTypeId={setCourierTypeId}
          createBag={createBag}
          spinner={spinner}
          setDisableField={setDisableField}
          disableField={disableField}
          regHubTypeId={regHubTypeId}
          hubTypeId={hubTypeId}
          branchTypeId={branchTypeId}
          courierTypeId={courierTypeId}
          setSpinner={setSpinner}
          getCreatedBagList={getCreatedBagList}
          showCloseBag={showCloseBag}
          shipmentInscanList={shipmentInscanList}
          setShowCloseBag={setShowCloseBag}
          setHubTypeId={setHubTypeId}
          setRegHubTypeId={setRegHubTypeId}
          chargableWeightList={chargableWeightList}
          incompleteCreatedBagData={incompleteCreatedBagData}
          forwhat={forwhat}
          setForwhat={setForwhat}
          setShipmentInscanList={setShipmentInscanList}
        />
      )}
        {cancelModal && (
              <Modal
                open={cancelModal}
                setOpen={setCancelModal}
                title={ModalTitle}
                description={Modaldescription}
                footer={Modalfooter}
                gridColumns={6}
                size={"md"}
                handlecancel={handlecancel}
              />
            )}
    </>
  );
}
