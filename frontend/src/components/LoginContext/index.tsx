import React, { createContext, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { common_get } from "../../AllServices/services";
// Create a context for login state
const LoginContext = createContext();
// Create a provider component to wrap your app
export const LoginProvider = ({ children }:any) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [permissionsId,setPermissionsId]=useState<any>([])
  const [oldstatedata,setOldstatedata]=useState<any>("")
const [userdata,setUserdata]=useState("")
const [permissionid,setpermissionsId]=useState<any>([])
const [statusdata,setStatusdata]=useState<any>([])
const getstatusdata=useCallback(async()=>{
  try{
    const res=await common_get('/booking/enquiry_status')
    if(res?.status==200){
      setStatusdata(res?.data?.data||[])
    }
  }catch(err:any){
    console.log(err)
  }
},[])
const navigate=useNavigate()
  const login = async(data:any) => {
    // Perform your login logic here
   
    setIsLoggedIn(true);
    setUserdata(data)
    const newdata = data?.role_permission?.map(
      (item: any) => item?.read_permission == 1 && item?.p_id
    );
setpermissionsId(newdata||[])
 await getstatusdata()
  };
  const logout = () => {
    // Perform your logout logic here
    setIsLoggedIn(false);
    setUserdata("")
// navigate("/")
  };
  const setstatedata=(data?:any)=>{
setOldstatedata(data)
  }
  return (
    <LoginContext.Provider value={{ isLoggedIn, login, logout,userdata,setstatedata,oldstatedata,permissionid,statusdata }}>
      {children}
    </LoginContext.Provider>
  );
};
export const useLogin = () => useContext(LoginContext);