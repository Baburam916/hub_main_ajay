import React, { useEffect, useState } from "react";
// import Registration from "./registration";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import Modal from "../../../components/Modal";
import Table from "../../../base-components/Table";
// import CommonPagination from "../Pagination";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { useDebounce } from "../../../components/Search";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Link } from "react-router-dom";

import { FormInput, FormLabel, FormSelect, InputGroup } from "../../../base-components/Form";
import { common_delete, common_get, common_post, common_put } from "../../../AllServices/services";
import { convertJSONtoCSV } from "../../../utils";
import CommonPagination from "../../../components/Pagination";
import { Eye } from "lucide-react";
const intextradata = {
  contact_person: "",
  customers_email:""
};

const initialData = {
    franchisee_id:"",
    hub_id:"",
    company_name: "",
    contact_person: "",
    mobile_number: "",
    address_1: "",
    address_2: "",
    pincode: "",
    city: "",
    state: "",
    customers_email: "",
    gstin_number: "",
    iec_code: "",
    pan_number: "",
    tax_payment_status: "",
    gstin_signed_stamped: null,
    iec_signed_stamped: null,
    company_pan: null,
    authorisation_letter: null,
  };

const Msme = (props:any) => {
  const [openModal,setOpenModal]=useState<boolean>(false)
  const [regModal,setRegModal]=useState<boolean>(false)
  const [see,setSee]=useState<any>("")
  const [taxPayOption,setTaxpayoption]=useState<any>([])
  const [forwhat,setForwhat]=useState<any>("")
  const [actionloading,setActionloading]=useState<any>("")
  const [downlaoddata,setDownloaddata]=useState<boolean>(false)
  const [extradata,setExtradata]=useState<any>(intextradata)
  const [remarks,setRemarks]=useState<any>("")
    const [registration, setRegistration] = useState(initialData);
  const [id,setId]=useState<any>("")
  const [showReg, setShowReg] = useState<Boolean>(false);
  const [data, setData] = useState([]);
  const [hubId]=useState<any>(JSON.parse(localStorage.getItem("current_user")).mapped_id||"")
  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);
  const [spinner,setSpinner]=useState<boolean>(false)
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const {pdata}=props
  // console.log(pdata,"pdata is coming")
  useEffect(()=>{
getintdata()
  },[])
  const getintdata=async()=>{
try{
const res=await common_get('/booking/tax-payment')
if(res?.status==200){
  const data=res?.data?.data||[]
  setTaxpayoption(data)
}else{
  setTaxpayoption([])
}
}catch(err:any){
  console.log(err?.message)
}
  }
   const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    setRegistration((prev) => ({
      ...prev,
      [field]: file,
    }));
  };
const handlecancel=()=>{
  setForwhat("")
  setRemarks("")
  setId("")
  setExtradata(intextradata)
  setOpenModal(false)
  setRegistration(initialData)
  setRegModal(false)
  setId("")
}

  const handleGetData = async () => {
  
    const params={
        // franchisee_id: 55,
        hub_id:hubId,
        limit: 20,
        offset: page - 1,
        search: debouncedSearch.trim(),}
    try {
        setIsLoading(true);
        const res=await common_post(`/book/listsmeCustomer`,params)
        
        if (res?.status == 200) {
        setData(res?.data?.data||[]);
        setTotalPages(Math.ceil(Number(res?.data?.total_count)/20)||0);
      } else if (res?.status == 204) {
        setData([]);
        setTotalPages(1);
      }
       else if (res?.response?.status == 400) {
        showAlert(res?.response?.message, "error");
        setTotalPages(1)        
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error"
        );
             setTotalPages(1);    
      }
    } catch (error) {
      console.log(error);
      showAlert(error?.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [debouncedSearch, page]);

  
const handleaction=async(value:any)=>{
  const data: any = {
    msme_id: id,
    updated_by: hubId,
    ops_approvel: forwhat == 1 ? 1 : 2,
    contact_person: extradata?.contact_person || "",
    customers_email: extradata?.customers_email||""
  };
  if(remarks){
    data.remarks=remarks
  }
try{
  setActionloading(true)
const res: any = await common_post("/book/approved_admin", data);
if(res?.status==200){
showAlert(res?.data?.message||"Record Updated Successfully")
handlecancel()
    handleGetData();
}else if(res?.response?.status==400){
showAlert(res?.response?.data?.message||"Something going wrong!!..please try after some time","error")
}else{
  showAlert("Something going wrong!..please try after some time","error")
}
}catch(err:any){
  console.log(err?.message)
}finally{
  setActionloading(false)
}
}

const handleDelete=async()=>{
try{
  setActionloading(true)
const res: any = await common_delete(`/booking/msme/${id}`);
if(res?.status==200){
showAlert(res?.data?.message||"Record Deleted Successfully")
handlecancel()
handleGetData();
}else if(res?.response?.status==400){
showAlert(res?.response?.data?.message||"Something going wrong!!..please try after some time","error")
}else{
  showAlert("Something going wrong!..please try after some time","error")
}
}catch(err:any){
  console.log(err?.message)
}finally{
  setActionloading(false)
}
}
const Check=(value:any,forwhat:string)=>{

  const numbers = /^[-+]?[0-9]+$/;
 const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

 
    if (forwhat == "num" && value.match(numbers)) {
      return true
    }else if (forwhat == "email" && emailPattern.test(value)) {
      return true
    }
}
 const handleCityState = async (pincode: any) => {
    if (!pincode) {
      return;
    }
    try {
      const response = await common_get(`/admin/domestic-pincode/${pincode}`);
      if (response?.status == 200) {
        setRegistration((prev) => ({
          ...prev,
          city: response?.data?.data[0]?.city,
          state: response?.data?.data[0]?.state,
        }));
      } else {
        showAlert(
          response?.data?.message ||
            response?.response?.data?.message ||
            response?.message,
          "error"
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

const handleRegistration = async () => {

    for (const key in registration) {
      // console.log(key,"key coming")
      if (key !== "ops_approvel"&& key !=="remarks" && key !== "created_date") {
     
        if (
          registration.hasOwnProperty(key) &&
          (registration[key] == "" || !registration[key])
        ) {
          showAlert(`${key.replaceAll("_", " ")} is required`, "error");
          return;
        } }
      
      
    }
  

    const formData = new FormData();
    // formData.append("country", "97");
console.log(registration);

    for (const key in registration) {
          formData.append(key, registration[key]);
    }

  

    try {
        setSpinner(true);
      const res = await common_put(`/booking/msme/${id}`,formData);
      if (res?.status == 200) {
        showAlert(res?.data?.message||"Updated successfully");
      setRegistration(initialData);
      setRegModal(false);
      handleGetData();
      setId("")
      } else if (res?.response?.status == 500) {
        showAlert("Internal Server Error", "error");
      } else if (res?.response?.status == 400) {
        showAlert(res?.response?.message, "error");
      } else if (res?.response?.status == 401) {
        showAlert("Unauthorized", "error");
      } else if (res?.response?.status == 404) {
        showAlert("Not Found", "error");
      } else if (res?.response?.status == 502) {
        showAlert("Bad GateWay", "error");
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error"
        );
      }
    } catch (error) {
      console.log(error);
      showAlert(error?.message, "error");
    } finally {
      setSpinner(false);
    }
  };


const description = (
  <>
    <div className="w-full h-auto overflow-y-auto text-left ">
      <div className="  gap-8  p-2 rounded-lg ">
        {forwhat == 2 ? (
          <div>
            <FormLabel htmlFor="regular-form-1">
              Remarks<span className="text-red-400">*</span>
            </FormLabel>
            <FormInput
              type="text"
              placeholder="Remarks"
              // minLength={6}
              maxLength={128}

              id="remarks"
              onChange={(e: any) => setRemarks(e.target.value)}
              // value={editDimensionData?.hsn_code}
              // onChange={(e) =>
              //   setEditDimensionData((prev: any) => ({
              //     ...prev,
              //     hsn_code: e.target.value.replaceAll(" ", ""),
              //   }))
              // }
            
            />
          </div>
        ) : (
          <div className="text-center">Are You Sure..</div>
        )}
      </div>
    </div>
  </>
);

const updateModaldescription = (
  <>
    <div className=" h-[60vh] overflow-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-4 ">
        <div>
          <FormLabel htmlFor="company_name">
            Company Name <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="company_name"
            type="text"
            placeholder="Enter Company Name"
            value={registration.company_name}
            onChange={(e) =>
              setRegistration((prev) => ({
                ...prev,
                company_name: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <FormLabel htmlFor="contact_person">
            Contact Person <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="contact_person"
            type="text"
            placeholder="Enter Contact Person"
            value={registration.contact_person}
            onChange={(e) =>
              setRegistration((prev) => ({
                ...prev,
                contact_person: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <FormLabel htmlFor="mobile_number">
            Mobile Number <span className="text-red-500">*</span>
          </FormLabel>

          <InputGroup>
            <InputGroup.Text
              id="input-group-email"
              className="flex items-center justify-center"
            >
              <img
                src="https://flagsapi.com/IN/flat/32.png"
                alt="india-flag"
                className="mr-1 w-6 h-5"
              />
              +91
            </InputGroup.Text>
            <FormInput
              id="mobile_number"
              type="text"
              maxLength={10}
              placeholder="Enter Mobile Number"
              value={registration.mobile_number}
              onChange={(e) =>{
                const value=e.target.value
                if(Check(value,"num")){
                    setRegistration((prev) => ({
                      ...prev,
                      mobile_number: e.target.value,
                    }));
                }

              
              }
              }
            />
          </InputGroup>
        </div>
        <div>
          <FormLabel htmlFor="address_1">
            Address 1 <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="address_1"
            type="text"
            placeholder="Enter Address 1"
            value={registration.address_1}
            onChange={(e) =>
              setRegistration((prev) => ({
                ...prev,
                address_1: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <FormLabel htmlFor="address_2">
            Address 2 <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="address_2"
            type="text"
            placeholder="Enter Address 2"
            value={registration.address_2}
            onChange={(e) =>
              setRegistration((prev) => ({
                ...prev,
                address_2: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <FormLabel htmlFor="pincode">
            Pincode <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="pincode"
            type="text"
            maxLength={6}
            placeholder="Enter Pincode"
            value={registration.pincode}
            onBlur={() => handleCityState(registration.pincode)}
            onChange={(e) =>{
              const value=e.target.value
              if(Check(value,"num")){
           setRegistration((prev) => ({
             ...prev,
             pincode: e.target.value,
             city: "",
             state: "",
           }));      
              }
             
            }
            }
          />
        </div>
        <div>
          <FormLabel htmlFor="city">
            City <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="city"
            type="text"
            disabled
            // placeholder="Enter City"
            value={registration.city}
            // onChange={(e) =>
            //   setRegistration((prev) => ({
            //     ...prev,
            //     city: e.target.value,
            //   }))
            // }
          />
        </div>
        <div>
          <FormLabel htmlFor="state">
            State <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="state"
            type="text"
            disabled
            // placeholder="Enter State"
            value={registration.state}
            // onChange={(e) =>
            //   setRegistration((prev) => ({
            //     ...prev,
            //     state: e.target.value,
            //   }))
            // }
          />
        </div>
        <div>
          <FormLabel htmlFor="customers_email">Email</FormLabel>
          <FormInput
            id="customers_email"
            type="text"
            placeholder="Enter Email"
            value={registration.customers_email}
            onBlur={(e:any)=>{
              if(Check(e.target.value,"email")){
               setRegistration((prev) => ({
                 ...prev,
                 customers_email: e.target.value,
               }));  
              }else{
                showAlert("Please provide a valid email!..","warning")
                  setRegistration((prev) => ({
                    ...prev,
                    customers_email: "",
                  }));
              }
            }}
            onChange={(e) =>
             
              setRegistration((prev) => ({
                ...prev,
                customers_email: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <FormLabel htmlFor="gstin_number">
            GSTIN Number <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="gstin_number"
            type="text"
            placeholder="Enter GSTIN Number"
            maxLength={15}
            value={registration.gstin_number}
            accept=".pdf, .jpg, .jpeg, .png"
            onChange={(e) =>
              setRegistration((prev) => ({
                ...prev,
                gstin_number: e.target.value?.toUpperCase(),
              }))
            }
          />
        </div>
        <div>
          <FormLabel htmlFor="iec_code">
            IEC Code <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="iec_code"
            type="text"
            placeholder="Enter IEC Code"
            maxLength={10}
            value={registration.iec_code}
            accept=".pdf, .jpg, .jpeg, .png"
            onChange={(e) =>
              setRegistration((prev) => ({
                ...prev,
                iec_code: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <FormLabel htmlFor="pan_number">
            PAN Number <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="pan_number"
            type="text"
            placeholder="Enter PAN Number"
            maxLength={10}
            value={registration.pan_number}
            accept=".pdf, .jpg, .jpeg, .png"
            onChange={(e) =>
              setRegistration((prev) => ({
                ...prev,
                pan_number: e.target.value?.toUpperCase(),
              }))
            }
          />
        </div>

        <div>
          <FormLabel htmlFor="tax_payment_status">
            Tax Payment <span className="text-red-500">*</span>
          </FormLabel>

          <FormSelect
            className="mt-2 sm:mr-2"
            aria-label="tax_payment_status"
            id="tax_payment_status"
            value={registration.tax_payment_status}
            onChange={(e) =>
              setRegistration((prev) => ({
                ...prev,
                tax_payment_status: e.target.value,
              }))
            }
          >
            <option value="0"> Select Tax Payment</option>
            {taxPayOption &&
              taxPayOption?.map((elem, index) => (
                <option value={elem?.id} key={index}>
                  {elem?.value}
                </option>
              ))}
          </FormSelect>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 mb-4">
        <div className="flex relative ">
          <div>
            <FormLabel htmlFor="gstin_signed_stamped">
              GSTIN (Signed & Stamped) <span className="text-red-500">*</span>
            </FormLabel>
            <FormInput
              id="gstin_signed_stamped"
              type="file"
              className="border border-gray-300"
              onChange={(e) => handleFileChange(e, "gstin_signed_stamped")}
            />
          </div>
          <div>
            <a href={`${registration?.gstin_signed_stamped}`} target="_blank">
              {" "}
              <div>
                {" "}
                <Eye
                  onMouseEnter={() => setSee(1)}
                  onMouseLeave={() => setSee("")}
                  className="text-yellow-300 ml-2 mt-8"
                />
              </div>{" "}
            </a>
          </div>
          {see == 1 ? (
            <div className="absolute right-1">
              <span>See Document</span>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="flex relative">
          <div>
            {" "}
            <FormLabel htmlFor="iec_signed_stamped">
              IEC (Signed & Stamped) <span className="text-red-500">*</span>
            </FormLabel>
            <FormInput
              id="iec_signed_stamped"
              type="file"
              className="border border-gray-300"
              onChange={(e) => handleFileChange(e, "iec_signed_stamped")}
            />
          </div>
          <div>
            <a href={`${registration?.iec_signed_stamped}`} target="_blank">
              {" "}
              <div>
                {" "}
                <Eye
                  onMouseEnter={() => setSee(2)}
                  onMouseLeave={() => setSee("")}
                  className="text-yellow-300 ml-2 mt-8"
                />
              </div>{" "}
            </a>
          </div>
          {see == 2 ? (
            <div className="absolute right-1">
              <span>See Document</span>
            </div>
          ) : (
            ""
          )}
        </div>

        <div className="flex relative">
          <div>
            {" "}
            <FormLabel htmlFor="company_pan">
              Company's PAN <span className="text-red-500">*</span>
            </FormLabel>
            <FormInput
              id="company_pan"
              type="file"
              className="border border-gray-300"
              onChange={(e) => handleFileChange(e, "company_pan")}
            />
          </div>
          <div>
            <a href={`${registration?.company_pan}`} target="_blank">
              {" "}
              <div>
                {" "}
                <Eye
                  onMouseEnter={() => setSee(3)}
                  onMouseLeave={() => setSee("")}
                  className="text-yellow-300 ml-2 mt-8"
                />
              </div>{" "}
            </a>
          </div>
          {see == 3 ? (
            <div className="absolute right-1">
              <span>See Document</span>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="flex relative">
          <div>
            {" "}
            <FormLabel htmlFor="authorisation_letter">
              Authorisation Letter <span className="text-red-500">*</span>
            </FormLabel>
            <FormInput
              id="authorisation_letter"
              type="file"
              className="border border-gray-300"
              onChange={(e) => handleFileChange(e, "authorisation_letter")}
            />
          </div>
          <div>
            <a href={`${registration?.authorisation_letter}`} target="_blank">
              {" "}
              <div>
                {" "}
                <Eye
                  onMouseEnter={() => setSee(4)}
                  onMouseLeave={() => setSee("")}
                  className="text-yellow-300 ml-2 mt-8"
                />
              </div>{" "}
            </a>
          </div>
          {see == 4 ? (
            <div className="absolute right-1">
              <span>See Document</span>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>{" "}
  </>
);
const updateModalFooter=(

  <>
    <div className="flex justify-end">
      <Button
        type="button"
        className="bg-gray-400 border-none  mr-2 py-2 px-4 text-white rounded-xl"
        // onClick={handleEdit}
        onClick={handlecancel}
      >
        Cancel
      </Button>
      <Button
        type="button"
        // disabled={(forwhat==2&&!remarks)||actionloading}
        className="bg-mustard border-none py-2 px-4 text-white rounded-xl"
        // onClick={()=>handleaction(forwhat)}
        disabled={spinner}
      onClick={()=>handleRegistration()}
      >
       
     {spinner?"Updating..":"Update"} 
      </Button>
    </div>
  </>

)





const footer = (
  <>
    <div className="flex justify-end">
      <Button
        type="button"
        className="bg-gray-400 border-none  mr-2 py-2 px-4 text-white rounded-xl"
        // onClick={handleEdit}
        onClick={handlecancel}
      >
        Cancel
      </Button>
      <Button
        type="button"
        disabled={(forwhat==2&&!remarks)||actionloading as boolean}
        className={`border-none py-2 px-4 text-white rounded-xl ${forwhat==3?"bg-red-500":"bg-mustard"}`}
        onClick={()=> forwhat==3 ? handleDelete() : handleaction(forwhat)}
      >

       {forwhat==1&&!actionloading?"Accept":forwhat==1&&actionloading?"Accepting...":forwhat==2&&actionloading?"Rejecting...":forwhat==2&&!actionloading?"Reject":forwhat==3&&actionloading?"Deleting...":forwhat==3&&!actionloading?"Delete":""}
      </Button>
    </div>
  </>
);
 const onPageChange = (page: number) => {
    setPage(page);
  
  };

const handledownload=async()=>{
  const data = {
    hub_id:hubId,
      search: debouncedSearch.trim(),
  };
try{
  setDownloaddata(true)
const res:any = await common_post("/book/listsmeCustomer",data);

  if (res?.status == 200) {
const data=res?.data?.data||[]
const newdata=data?.map((item:any)=>{
  return {
    ...item,
    ops_approvel:
      item?.ops_approvel == 0
        ? "Pending"
        : item?.ops_approvel == 1
        ? "Accepted"
        : item?.ops_approvel==2?"Rejected":""
  };
})
   convertJSONtoCSV(newdata,"msme_registrations_data")
  } else if (res?.status == 204) {
    showAlert("No Data found","warning")
  } else if (res?.response?.status == 500) {
    showAlert("Internal Server Error", "error");
  } else if (res?.response?.status == 400) {
    showAlert(res?.response?.message, "error");
  }
}catch(err:any){
  console.log(err)
}finally{
  setDownloaddata(false)
}
}


  return (
    <>
      <div className="w-full max-w-8xl p-6 px-10 bg-white rounded-lg shadow-lg mt-2 mb-16 z-[0] relative">
        <div className="min-[700px]:flex justify-between gap-8 w-full">
          <div className="w-full">
            <h1 className="text-2xl font-bold text-left whitespace-nowrap">
              MSME / Corporate Customer List
            </h1>
          </div>

          <div className="flex w-full items-end">
            <FormInput
              type="text"
              placeholder="Enter MSME ID / Company Name / GSTIN"
              value={search}
              className="w-2/3"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Button
              className="w-1/3 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white ml-4"
              onClick={() => {
                setSearch("");
                setPage(1);
                handleGetData();
              }}
            >
              CLEAR
            </Button>
            {data?.length >= 1 ? (
              <Button
                className="w-1/3 p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white ml-4"
                onClick={() => {
                  handledownload();
                }}
                disabled={downlaoddata}
              >
                {downlaoddata ? "Downloading" : "Download"}
              </Button>
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="flex justify-center w-full my-4 border-t border-slate-200 dark:border-darkmode-400"></div>

        {data?.length > 0 && !isLoading ? (
          <div className="overflow-auto max-h-[350px]  ">
            <Table className="table table-text-small mb-0 border">
              <Table.Thead
                variant="dark"
                className="thead-primary table-sorting bg-mustard sticky top-0 z-50"
              >
                <Table.Tr className="text-center ">
                  <Table.Th className="whitespace-nowrap border">
                    SR.NO.
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    MSME ID
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    COMPANY NAME
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    CONTACT PERSON
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    MOBILE NUMBER
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    EMAIL
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    ADDRESS
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">CITY</Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    STATE
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    PINCODE
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    TAX PAYMENT STATUS
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    GSTIN NUMBER
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    IEC CODE
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    PAN NUMBER
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    AUTHORISATION LETTER
                  </Table.Th>

                  <Table.Th className="whitespace-nowrap border">
                    ACTION
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data?.map((item:any, index:number) => (
                  <Table.Tr key={index} className={`text-center intro-x`}>
                    <Table.Td className="border whitespace-nowrap">
                      {search ? index + 1 : (page - 1) * 20 + (index + 1)}.
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      {item?.msme_id || "-"}
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      {item?.company_name || "-"}
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      {item?.contact_person || "-"}
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      {item?.mobile_number || "-"}
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      {item?.customers_email || "-"}
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      {item?.address_1} {item?.address_2}
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      {item?.city || "-"}
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      {item?.state || "-"}
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      {item?.zipcode || "-"}
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      {item?.tax_payment_status || "-"}
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      <Link
                        to={`${item?.gstin_signed_stamped}?${Math.random()}`}
                        target="_blank"
                        className="text-mustard underline-offset-4 underline hover:no-underline"
                      >
                        {item?.gstin_number || "-"}
                      </Link>
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      <Link
                        to={`${item?.iec_signed_stamped}?${Math.random()}`}
                        target="_blank"
                        className="text-mustard underline-offset-4 underline hover:no-underline"
                      >
                        {item?.iec_code || "-"}
                      </Link>
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      <Link
                        to={`${item?.company_pan}?${Math.random()}`}
                        target="_blank"
                        className="text-mustard underline-offset-4 underline hover:no-underline"
                      >
                        {item?.pan_number || "-"}
                      </Link>
                    </Table.Td>
                    <Table.Td className="border whitespace-nowrap">
                      <div className="flex justify-center">
                        <Link
                          to={`${item?.authorisation_letter}?${Math.random()}`}
                          target="_blank"
                          className="text-mustard underline-offset-4 underline hover:no-underline"
                        >
                          <Lucide
                            icon="FileText"
                            className="stroke-2.5 text-mustard cursor-pointer"
                          />
                        </Link>
                      </div>
                    </Table.Td>

                    <Table.Td className="border whitespace-nowrap">
                      {pdata?.update_permission ?( 
                       item?.ops_approvel==0 ? (
                          <div className="flex justify-center">
                            <Button
                              variant="success"
                              className="mr-2 p-1 text-white"
                              onClick={() => {
                                setOpenModal(true);
                                setForwhat(1);
                                setId(item?.msme_id);
                                setExtradata((pre: any) => ({
                                  ...pre,
                                  customers_email: item?.customers_email || "",
                                  contact_person: item?.contact_person||""
                                }));
                              }}
                            >
                              {" "}
                              Accept
                            </Button>
                            <Button
                              variant="danger"
                              className="p-1 text-white"
                              onClick={() => {
                                setOpenModal(true);
                                setForwhat(2);
                                setId(item?.msme_id);
                                 setExtradata((pre: any) => ({
                                   ...pre,
                                   customers_email: item?.customers_email || "",
                                   contact_person: item?.contact_person || "",
                                 }));
                              }}
                            >
                              Reject
                            </Button>
                                <Button
                              variant="mustard"
                              className="ml-2 p-1 text-white"
                              onClick={() => {
                              setRegModal(true)

setRegistration({
  ...item, // Spread all properties of item
  pincode: item?.zipcode || "", // Add or override zipcode with item?.pincode
});
                                setId(item?.msme_id);
                                // setExtradata((pre: any) => ({
                                //   ...pre,
                                //   customers_email: item?.customers_email || "",
                                //   contact_person: item?.contact_person||""
                                // }));
                              }}
                            >
                              {" "}
                            Update
                            </Button>
                          </div>
                        )  : item?.ops_approvel == 1 ? (
                        <div className="flex justify-center items-center gap-2">
                          <span className="text-green-400 font-medium">Approved</span>
                          <button
                            title="Edit"
                            className="p-1 rounded text-mustard hover:bg-yellow-50"
                            onClick={() => {
                              setRegModal(true);
                              setRegistration({
                                ...item,
                                pincode: item?.zipcode || "",
                              });
                              setId(item?.msme_id);
                            }}
                          >
                            <Lucide icon="Pencil" className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete"
                            className="p-1 rounded text-red-500 hover:bg-red-50"
                            onClick={() => {
                              setOpenModal(true);
                              setForwhat(3);
                              setId(item?.msme_id);
                            }}
                          >
                            <Lucide icon="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      ) : item?.ops_approvel == 2 ? (
                        <span className="text-red-400">Rejected</span>
                      ):"..."):"..."
                     }
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        ) : isLoading ? (
          <div className="h-[50vh] flex justify-center items-center">
            <LoadingIcon icon="tail-spin" className="block m-auto w-[4%]" />
          </div>
        ) : !isLoading ? (
          <p className="text-gray-400 text-center">No Data Found!</p>
        ) : (
          ""
        )}

        <Modal
          description={description}
          footer={footer}
          open={openModal}
          setOpen={setOpenModal}
          size="md"
          title={forwhat==3 ? "Delete MSME Record" : "MSME Registration Request"}
        />
         <Modal
          description={updateModaldescription}
          footer={updateModalFooter}
          open={regModal}
          setOpen={setRegModal}
          size="xl"
          title="UPDATE DETAILS"
        />
        {totalpages > 1 ? (
          <CommonPagination
            onPageChange={onPageChange}
            page={Number(page)}
            totalpages={Number(totalpages)}
          />
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default Msme;
