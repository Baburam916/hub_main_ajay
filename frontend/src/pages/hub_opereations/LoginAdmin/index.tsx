import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import { useState } from "react";
import { Login, userNamePassword } from "../../../AllServices/services";
import { LoginCredential } from "../../../DataTypes/dataTypes";
import { useAlert } from "../../../ContextProvider/AlertContext";

const index = () => {
const [toggleLogin, setToggleLogin] = useState<boolean>(true)
const [userName, setUsername] = useState<any>();
const [password, setPassword] = useState<any>();
const [allData, setAllData] = useState<Array<any>>([]);

const { showAlert } = useAlert();

const columns = [
    { field: "user_name", headerName: "UserName" },
    { field: "raw_password", headerName: "Password" },
    { field: "type_id", headerName: "Type Id" },
]
let row:any = allData?.map((item:any) => {
    
    return {
        ...item,
        type_id : item?.type_id== 1 ? 'admin' : item.type_id ==2 ? 'hub' : item.type_id == 3 ? 'branch' : item.type_id == 4 ? 'franchisee' : item.type_id ==5 ? 'Regional hub' : ''
    }
})

const loginFunc = async () => {
    const loginCredential: LoginCredential = {
      user_name: userName,
      password: password,
    };
    let response;
   
    try {
      response = await Login(loginCredential);
      if (response.status == 200) {
        let data = await userNamePassword()
        if(data.status == 200) {
            row = data.data.data
            setAllData(row)
            setToggleLogin(false);
        } else {
            setToggleLogin(true);
            showAlert("something went wrong", "warning");
        }
      } else if (response.status == 204) {
        showAlert("User not found", "warning");
      } else showAlert(response.data.message, "warning");
      
    } catch (error) {
      console.log(error);
      if (response.response.status == 406) {
        showAlert(response.response.data.errors[0].msg, "error");
      } else {
        showAlert(response?.response?.data?.message, "error");
      }
    }
  };

  return (
    <>
     {toggleLogin ? (<div className="flex mt-8 justify-center h-screen py-5 my-10 xl:h-auto xl:py-0 xl:my-0">
        <div className="border rounded-sm bg-light px-4 py-8 ">
          <h2 className="text-2xl font-bold text-center intro-x xl:text-3xl ">
            Login
          </h2>
          <div className="mt-4 intro-x">
            <FormLabel className="font-medium text-base text-primary">
              Username
            </FormLabel>
            <FormInput
              type="text"
              className="block px-4 py-3 intro-x min-w-full xl:min-w-[350px]"
              placeholder="username"
              value={userName}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mt-2 intro-x">
            <FormLabel className="font-medium text-base text-primary">
              Password
            </FormLabel>
            <FormInput
              type="password"
              className="block px-4 py-3 intro-x min-w-full xl:min-w-[350px]"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mt-4 text-center intro-x xl:text-left">
            <Button onClick={()=> loginFunc()} className="w-full px-4 py-2 align-top xl:w-full xl:mr-3 mb-2 bg-mustard text-white">
              Login
            </Button>
          </div>
        </div>
      </div>)
     :
      <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
         <Table columns={columns} row={row} heightTable="80vh" />
      </div>}
    </>
  );
};

export default index;
