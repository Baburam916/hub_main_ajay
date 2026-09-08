import React, { useEffect, useState } from "react";

import { useAlert } from "../../../ContextProvider/AlertContext";
import Table from "../../../components/Table";

import Button from "../../../base-components/Button";

import CommonPagination from "../../../components/Pagination";

import Modal from "../../../components/Modal";

import { convertJSONtoCSV } from "../../../utils";

import { useDebounce } from "../../../components/Search";

import IsLoading from "../../../components/Isloading/isLoading";
import { Download } from "lucide-react";
import LoadingButtonCommon from "../../../components/loadingButtonCommon/loadingButttonCommon";
import { tranfereddata } from "../../../components/booking_summary_table/TransformKey";
import { common_get, common_put } from "../../../AllServices/services";
import LoadingIcon from "../../../base-components/LoadingIcon";
import Nodatafound from "../../../components/NoDatafound";


const initialerrdata = {
  loc_type: "",
  loc_name: "",
  ref_id: "",
};

const intfranchiseedata = {
  franchisee_id: "",
  franchisee_name: "",
};
const intmodaldata = {
  id: "",
  status: "",
};
export default function AWBchangeRequests({ pdata }:any) {
  const [count, setCount] = useState<any>(0);
  const [modaldata, setModaldata] = useState<any>(intmodaldata);
  const [branchdata, setBranchData] = useState<any>([]);
  const [filtervalue, setFiltervalue] = useState<any>(0);
  const [forWhat, setForwhat] = useState<string>("");
  const [searchvalue, setSearchvalue] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchvalue, 500);

  const [page, setPage] = useState<number>(1);
  const [error, setError] = useState<any>(initialerrdata);
  const { showAlert } = useAlert();
  // const [editdata, setEditData] = useState<pudData>({});
  const [refresh, setRefresh] = useState<boolean>(false);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const [downloaddata, setDownloaddata] = useState<boolean>(false);
  const [updateloading, setUpdateLoading] = useState<boolean>(false);
const handlecancel=()=>{
    setModaldata(intmodaldata)
}
  const handledownload = async () => {
    const paramsobj: any = {};
    if (debouncedSearchTerm) {
      paramsobj.key = debouncedSearchTerm.trim();
    }
    if (filtervalue) {
      paramsobj.status = filtervalue - 1;
    }

    try {
      setDownloaddata(true);
      const response: any = await common_get(
        `/booking/house-approval-list`,
        {
          params: paramsobj,
        }
      );
      if (response?.status == 200 || response?.status == 204) {
        const data = response?.data?.data || [];
        const newdata = data?.map((item: any) => {
          return {
            enqury_number: item?.enquiry_number || "",
            old_hawb: item?.old_house || "",
            requested_hawb: item?.new_house || "",
            old_mawb: item?.old_master || "",
            requested_mawb: item?.new_master || "",
            staus:
              item?.status == 0
                ? "Approval Pending"
                : item?.status == 1
                ? "Accepted"
                : "Rejected",
          };
        });
        convertJSONtoCSV(tranfereddata(newdata) || [], "Change Mawb/Hawb Requests");
      } else if (response?.message == "Network Error") {
        setError(response?.message);

        showAlert(response.message, "error");
      } else {
        showAlert("something going wrong ", "error");
      }
    } catch (err: any) {
      showAlert(err.message, "error");
    } finally {
      setDownloaddata(false);
    }
  };

  const handleSubmit = async (obj?: any) => {
    try {
      setUpdateLoading(true);

      const response: any = await common_put(
        `/booking/house-approval-action`,
        obj
      );
      if (response?.status == 200) {
        showAlert(response?.data?.message || "Action Performed Successfully");
        handleRefresh();
      } else if (response?.response?.status == 400) {
        showAlert(
          response?.response?.data?.message ||
            "Something going wrong!!.. please try after some time",
          "error"
        );
      } else {
        showAlert(
          response?.response?.data?.message ||
            "Something going wrong!!.. please try after some time",
          "error"
        );
      }
    } catch (err: any) {
      showAlert(err.message, "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  // console.log(uploadcsvdata, CSVData, "dataafterfileselect");
  //  Modal tiltle
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
          setOpen(false);
          setModaldata(intmodaldata);
        }}
        className="w-20 p-2 ml-2"
      >
        Cancel
      </Button>
      {updateloading ? (
        <Button
          variant="mustard"
          type="button"
          disabled={updateloading}
          className="w-20 p-2 ml-2"
        >
          Processing..
        </Button>
      ) : (
        <Button
          variant="mustard"
          type="button"
          disabled={updateloading}
          onClick={(e: any) => handleSubmit(modaldata)}
          className="w-20 p-2 ml-2"
        >
          Process
        </Button>
      )}
    </>
  );

  //   console.log(editdata, "editdata");
  const handleRefresh = () => {
    setModaldata(intmodaldata);
    setOpen(false);
    setRefresh(!refresh);
  };

  const handlePagechange = (e: number) => {
    setPage(e);
    setOffset((e - 1) * 20);
  };

  useEffect(() => {
    fetchData();
  }, [filtervalue, debouncedSearchTerm, refresh, page]);
  useEffect(() => {
    getintdata();
  }, []);
  const getintdata = async () => {
    try {
      const res = await common_get("/admin/hub-pud");
      if (res?.status == 200) {
        setBranchData(res?.data?.data || []);
      } else {
        setBranchData([]);
      }
    } catch (err: any) {
      console.log(err?.message);
    }
  };

  const fetchData = async () => {
    const paramsobj: any = {
      limit: 20,
      offset: page - 1,
    };

    if (debouncedSearchTerm) {
      paramsobj.key = debouncedSearchTerm.trim();
    }

    try {
      setLoading(true);
      const response: any = await common_get(
        `/booking/house-approval-list`,
        {
          params: paramsobj,
        }
      );
      if (response?.status == 200 || response?.status == 204) {
        // const data=response?.data?.data||[]
        // console.log(data,"data")
        setData(response?.data?.data || []);
        setCount(response?.data?.count || 0);
      } else if (response?.message == "Network Error") {
        setError(response?.message);

        showAlert(response.message, "error");
      } else if (response?.response.status == 400) {
        showAlert(response?.response?.data?.message || "Bad Request", "error");
      } else {
        showAlert(
          "Something going wrong!..please try after some time",
          "error"
        );
      }
    } catch (err: any) {
      showAlert(err.message);
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    {
      field: "enquiry_number",
      headerName: "Enquiry Number",
      textAlign: "text-left",
    },
    { field: "old_house", headerName: "Old HAWB", textAlign: "text-left" },
    { field: "new_house", headerName: "New HAWB", textAlign: "text-left" },
    { field: "old_master", headerName: "Old MAWB", textAlign: "text-left" },
    { field: "new_master", headerName: "New MAWB", textAlign: "text-left" },
    { field: "status", headerName: "Status", textAlign: "text-center" },
  
  ];

    const row: any = data?.map((item: any,index:number) => {
      let isStatus;
      switch (Number(item?.status)) {
   
         case 0:
            isStatus=<p className="text-green-500 font-bold ">APPROVAL PENDING</p>;
            break;
        case 1:
          isStatus = <p className="text-green-500 font-bold">ACCEPTED</p>;
          break;
        case 2:
          isStatus = <p className="text-red-500 font-bold">REJECTED</p>;
          break;
        
        default:
            isStatus = <p className="text-red-500 font-bold">PENDING</p>;
            break;
      }
     
   
  
  
      
      return {
    
     enquiry_number:item?.enquiry_number,
        old_house: item?.old_house,
        new_house: item?.new_house,
        old_master: item?.old_master,
        new_master: item?.new_master,
       status:isStatus
      };
    });
  return (
    <>
      <div>
        {/* <BackButton/> */}
        <div className="flex justify-between mt-5 mb-2 p-2 bg-white shadow-lg rounded-md">
          {" "}
          <div>
            <h2 className="text-xl mt-1 font-bold text-primary ">
              CHANGE HAWB/MAWB REQUESTS
            </h2>
          </div>
          <div>
            {data?.length >= 1 ? (
              <Button
                className="text-white  p-2 mr-1"
                disabled={downloaddata}
                variant="success"
                onClick={() => handledownload()}
              >
                <Download />
                {downloaddata ? (
                  <LoadingButtonCommon text="Downloading" />
                ) : (
                  "Download"
                )}
              </Button>
            ) : (
              ""
            )}
          </div>
        </div>
        {/* <div className="bg-white shadow-lg rounded-md">
          <div className="grid grid-cols-3 gap-4  mt-5 mb-2 p-2 w-[70%] m-auto">
            {" "}
            <div>
              <FormLabel>SEARCH</FormLabel>
              <FormInput
                type="text"
                placeholder="Search..."
                onChange={(e: any) => {
                  setSearchvalue(e.target.value);
                  setPage(1);
                }}
              />

             
            </div>
            <div className="grid col-span-1">
              <div>
                <FormLabel>
                  SEARCH FRANCHISEE <span className="text-red-400">*</span>
                </FormLabel>
              </div>

              <SearchableComp
                apiEndpoint="
admin/franchisee-settings"
                placeholder="Search items..."
                zIndex="50"
                selectedfranchisedata={selectedfranchisedata}
                setSelectedfranchisedata={setSelectedfranchisedata}
                fun1={fun1}
                fun2={fun2}
              />
            </div>
            <div>
              <FormLabel>SELECT TYPE</FormLabel>
              <TomSelect
              
                value={`${filtervalue}`}
      
                onChange={(e: any) => {
                  setFiltervalue(e);
                  setPage(1);
                  setOffset(0);
                }}
                options={{
                  placeholder: "SELECT",
                }}
              
              >
                <option value={`1`}>Pending</option>
                <option value={`2`}>Accepted</option>
                <option value={`3`}>Rejected</option>
              </TomSelect>
            
            </div>
          </div>
        </div> */}
        <div className=" w-full overflow-auto shadow-lg rounded-md">
          {loading ? (
            <IsLoading />
          ) : (
            <Table
              heightTable={"60vh"}
              columns={columns}
              row={row}
              listheight={"h-[100vh]"}
              loading={loading}
              margin={"mt-[100px]"}
            />
          )}
          {data?.length == 0 && !loading && <Nodatafound />}
          {data?.length > 0 ? (
            <>
              <CommonPagination
                totalpages={+count}
                onPageChange={handlePagechange}
                page={page}
              />
            </>
          ) : (
            ""
          )}
        </div>
      </div>
      {open && (
        <Modal
          open={open}
          setOpen={setOpen}
          title={ModalTitle}
          description={Modaldescription}
          footer={Modalfooter}
          gridColumns={6}
          handlecancel={handlecancel}
        />
      )}
    </>
  );
}
