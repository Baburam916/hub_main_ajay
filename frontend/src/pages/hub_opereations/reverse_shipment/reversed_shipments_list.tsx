import { useEffect, useState } from "react";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Table from "../../../components/Table";
import Button from "../../../base-components/Button";
import {
  Reverse_shipment_inscan,
  Status_code_list,
} from "../../../AllServices/services";
import {
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "../../../base-components/Form";
import { ClipboardCheck, Scan, Search } from "lucide-react";
import { ReverseShipmentInscanData } from "../../../DataTypes/dataTypes";
import Modal from "../../../components/Modal";
import LoadingIcon from "../../../base-components/LoadingIcon";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";
import { User } from "lucide-react";
import { Loader } from "lucide-react";

export default function ReverseShipmentAirwaybill(data: any) {
  const { showAlert } = useAlert();
  const [airwaybillNo, setAirwaybillNo] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [otherReason, setOtherReason] = useState<any>(null);
  const [heldUpReason, setHeldUpReason] = useState<any>(-1);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openHoldList, setOpenHoldList] = useState<boolean>(false);
  const [statusList, setStatusList] = useState<Array<any>>([]);

  useEffect(() => {
    const getStatusList = async () => {
      try {
        const response = await Status_code_list();
        if (response.status == 200) setStatusList(response.data.data);
        else if (response?.response?.status === 204) {
          showAlert("No data found!", "warning");
        } else showAlert(response.data.message, "error");
      } catch (error) {
        console.log(error);
        showAlert("Something went wrong with status list!", "error");
      }
    };

    getStatusList();
  }, []);

  const columns = [
    { field: "airwaybill_no", headerName: "AirwayBill No." },
    { field: "remark", headerName: "Remarks" },
    { field: "created_date", headerName: "Reversed Date" },
    { field: "action", headerName: "Held Up/Inscan" },
  ];

  const row = data.reversedShipmentsList.map((item: any) => {
    const actionButton = (
      <Button
        onClick={() => {
          setAirwaybillNo(item.airwaybill_no);
          setOpenModal(true);
        }}
        className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-200 border-none "
      >
        Inscan Shipment
      </Button>
    );

    return {
      ...item,
      action: actionButton,
    };
  });

  const reverseShipmentInscan = async () => {
    if(heldUpReason == 264 && !otherReason){
      showAlert('Please fill the reason', "error");
      return;
    }
    setSpinner(true);
    const reverseShipmentInscanData: ReverseShipmentInscanData = {
      airwaybill_no: airwaybillNo,
      held_up_reason: heldUpReason,
      ...(Number(heldUpReason) == 264 ? { other_reason: otherReason } : {}),
    };

    let response;
    try {
      response = await Reverse_shipment_inscan(
        { emp_id: data.emp_id, hub_id: data.hub_id },
        reverseShipmentInscanData
      );
      setOpenHoldList(false);
      setOpenModal(false);
      if (response.status == 200) {
        showAlert(response.data.message, "success");
        data.getReversedShipmentList();
        setHeldUpReason(-1);
        setOtherReason("");
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert("Something went wrong!", "error");
    } finally {
      setOtherReason("");
      setSpinner(false);
    }
  };

  const description = (
    <>
      <div className="mb-3 justify-between gap-4  border border-[#ffe7b1]   bg-gradient-to-r from-[#FFF9EB] via-[#FDFDFD] to-[#FDFDFD] rounded-lg">
        <div className="border-b border-[#ffe7b1] p-2 ">Direct Shipment Paper work</div>
            <div className="  p-2 font-bold text-lg ">
          Airwaybill No - {airwaybillNo}
        </div>
      </div>

      <div>
        <div className="flex-wrap lg:flex-nowrap flex gap-2 justify-between">
          <Button
            className="w-full lg:w-[48%] block bg-[#c9302c] align-left border-none p-2  text-white rounded-md hover:bg-[#c9302c] focus:ring-4 focus:ring-opacity-70"

            onClick={() => {setOpenHoldList(!openHoldList);setHeldUpReason(-1);setOtherReason(null)}}
          >
         <div className="flex justify-start gap-2">
        <figure className="bg-[#9c1b18] rounded-full p-[3px] flex justify-center items-center w-[30px] h-[30px]">  
            <Loader className="w-[17px] h-[17px] text-[#fff]" /></figure>
        
         <aside className="flex-wrap justify-start"> <h2 className="text-bold text-[20px] w-full text-left"> Hold</h2> 
          
           <p className="text-[12px] uppercase w-full text-left"> (Paperwork Not Clear)</p>
           </aside>
</div>

          </Button>
          <Button
            className="w-full lg:w-[48%]  bg-[#14d28b] border-none p-2 text-white rounded-md hover:bg-[#169F85] focus:ring-4 focus:ring-opacity-70"
            disabled={openHoldList || spinner}
            onClick={() => reverseShipmentInscan()}
          >
            
    
           

     <div className="flex justify-start gap-2 w-full">
        <figure className="bg-[#177552] rounded-full p-[3px] flex justify-center items-center w-[30px] h-[30px]"> 
             <Scan className="w-[17px] h-[17px] text-[#fff]" /></figure>
        
         <aside className="flex-wrap justify-start"> <h2 className="text-bold text-[20px] w-full text-left"> Inscan</h2> 
          
           <p className="text-[12px] uppercase w-full text-left">  (Paperwork Clear)</p>
           </aside>
</div>





            {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>
        </div>
        {openHoldList && (
          <>
            <div className="mt-4 bg-[#fff5f5] rounded-lg p-3 border border-[#ffc0c0]" >
              <FormLabel htmlFor="modal-form-6">Select Hold Reason</FormLabel>
              <FormSelect
                onChange={(e) => setHeldUpReason(e.target.value)}
                id="modal-form-6"
              >
                <option>Select held up reason</option>
                {statusList.map((val) => {
                  return <option value={val.status_code}>{val.status}</option>;
                })}
                <option value="264">Other</option>
              </FormSelect>
              {Number(heldUpReason) == 264 && (
                <div className="mt-2 mb-2">
                  <FormLabel>Reason</FormLabel><span className="text-red-500 ml-2">*</span>
                  <FormTextarea
                    className="px-4 py-3  max-h-20 min-h-16"
                    autoComplete="off"
                    value={otherReason}
                    onChange={(e) => {
                      setOtherReason(e.target.value);
                    }}
                  ></FormTextarea>
                </div>
              )}
              <Button
                disabled={spinner}
                className="bg-mustard border-none py-1 px-4 mt-4 text-white rounded-md"
                onClick={() => reverseShipmentInscan()}
              >
                Submit
                {spinner && <LoadingIcon icon="puff" className="ml-2" />}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">


 <div className=" w-full py-3  px-3 border-b border-white commonGradientGray  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nwrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <ClipboardCheck className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    {" "}
                   Reversed Shipments
                  </h4>
                </div>
              </div>

              <div className="flex items-center w-full lg:w-auto">
                


    
     
          <div className="relative flex justify-between items-center  w-full lg:w-auto">
            <FormInput
              placeholder="Search..."
              className="pr-8 pt-1 pb-1 rounded-md h-[37px]  w-full lg:w-auto"
              value={data?.manifestSearch}
              onChange={(e) => {
                data?.setManifestSearch(e.target.value.toUpperCase());
                data?.getReversedShipmentList();
                data?.setPage(1);
              }}
            />
            <Search className="absolute right-2 w-4 h-4" />
          </div>






              </div>
            </div>
          </div>




      
     <div className="p-2  lg:p-6">
          {data.reversedShipmentsList.length > 0 ? (
            <>
              <Table columns={columns} row={row} heightTable="28.5vh" />
              <CommonPagination
                totalpages={data?.totalpages}
                onPageChange={data?.handlePagechange}
                page={data?.page}
              />
            </>
          ) : (
            <>
              <h1 className="font-400 text-md">Shipment List</h1>{" "}
              <p className="text-gray-400 text-center">No Data Found!</p>
            </>
          )}
        </div>
      </div>
</div>

      <Modal
        open={openModal}
        title="Inscan Shipment"
        size="lg"
        setOpen={setOpenModal}
        description={description}
        footer={null}
      />
    </>
  );
}
