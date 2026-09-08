import logoUrl from "../../assets/images/Side_logo.png";
import { FormInput, FormLabel, InputGroup } from "../../base-components/Form";
import Button from "../../base-components/Button";
import { LoginCredential } from "../../DataTypes/dataTypes";
import { useEffect, useRef, useState } from "react";
import { useAlert } from "../../ContextProvider/AlertContext";
import { useNavigate } from "react-router-dom";
import {
  Forgot_pass_send_otp,
  Forgot_pass_verify_otp,
  Get_hub_info,
  Login,
} from "../../AllServices/services";
import { useLogin } from "../../components/LoginContext";
import Lucide from "../../base-components/Lucide";
import { Lock, LogIn, User } from "lucide-react";
import scooterUrl from "../../assets/images/login/Skart-Banner.png";
import tyreUrl from "../../assets/images/login/tyre.png";
import ekartLineUrl from "../../assets/images/login/ekart-line2.gif";
import "../../assets/css/login.css";
import LoadingButtonCommon from "../../components/loadingButtonCommon/loadingButttonCommon";

const initialState = {
  buttonname: "Send OTP",
  resendotp: false,
  showresendbutton: false,
  type: 1,
  userName: "",
  password: "",
  start: false,
  showotpboxes: false,
  otp: ["", "", "", "", "", ""],
};

function Main() {
  const { showAlert } = useAlert();
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(120);
  const refs = useRef([]);
  const navigate = useNavigate();
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const { login } = useLogin();
  const {
    start,
    resendotp,
    buttonname,
    userName,
    type,
    otp,
    showotpboxes,
    showresendbutton,
  } = state;

  const getHubDetails = async (id) => {
    let res;
    try {
      res = await Get_hub_info(id);
      if (res.status === 200) {
        const data = JSON.parse(localStorage.getItem("current_user")) || {};

        data.mapped_name = res?.data?.data[0]?.hub_name;

        localStorage.setItem("current_user", JSON.stringify(data));
      } else showAlert(res?.data?.message, "warning");
    } catch (error) {
      console.log(error);
      if (res.response.status == 406) {
        showAlert(res.response.data.errors[0].msg, "error");
      } else {
        showAlert(res?.response?.data?.message, "error");
      }
    }
  };

  const loginFunc = async () => {
    const loginCredential: LoginCredential = {
      user_name: userName,
      password: password,
    };
    let response;
    try {
      setIsLoading(true);
      response = await Login(loginCredential);
      if (response.status == 200) {
        localStorage.setItem(
          "current_user",
          JSON.stringify(response.data.data),
        );
        getHubDetails(response?.data?.data?.mapped_id);
        login(response?.data?.data);
        showAlert("Logged In", "success");
        navigate("/hub/dashboard");
      } else if (response?.status == 203) {
        showAlert(response?.data?.message, "error");
      } else if (response?.status == 204) {
        showAlert("Username not found", "error");
      } else if (response?.response?.status == 412) {
        showAlert(response?.response?.data?.message, "warning");
      } else if (response?.status == 504 || response?.response?.status == 504) {
        showAlert("Failed to fetch", "error");
      } else if (response?.status == 500 || response?.response?.status == 500) {
        showAlert("Internal Server Error", "error");
      } else if (response?.status == 502 || response?.response?.status == 502) {
        showAlert("Bad Gateway", "error");
      } else if (response?.response && response?.response?.status == 406) {
        showAlert(response?.response?.data?.errors[0]?.msg, "error");
      } else {
        if (response?.message) {
          showAlert(response?.message, "error");
        } else if (response?.data?.message) {
          showAlert(response?.data?.message, "error");
        } else {
          showAlert("something went wrong", "error");
        }
      }
      // if (response.response && response.response.status == 406) {
      //   showAlert(response.response.data.errors[0].msg, "error");
      // } else {
      //   showAlert(response?.response?.data?.message, "error");
      // }
    } catch (error) {
      console.log(error);
      if (response?.response?.status == 406) {
        showAlert(response?.response?.data?.errors[0].msg, "error");
      } else {
        showAlert(response?.response?.data?.message, "error");
      }
    } finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timer == 0) {
      setState((pre) => ({ ...pre, start: false, resendotp: true }));
      setTimer(120);
      // setResendotp(true)
    } else {
      if (type == 2 && start) {
        setState((pre) => ({ ...pre, resendotp: false }));
        const value = setInterval(() => {
          if (timer > 0) {
            setTimer((prevSeconds) => prevSeconds - 1);
          }
        }, 1000);
        return () => clearInterval(value);
      }
    }
  }, [timer, start, buttonname]);
  const minutes = Math.floor(timer / 60);
  const remainingSeconds = timer % 60;
  const handleotprequest = async () => {
    try {
      setIsLoading(true);
      const response: any = await Forgot_pass_send_otp(userName);
      if (response?.status == 200) {
        showAlert(response?.message, "success");
        setState((pre) => ({
          ...pre,
          showotpboxes: true,
          showresendbutton: true,
        }));
        // setShowResendbutton(true)
        setState((pre: any) => ({
          ...pre,
          buttonname: "Verify OTP",
          start: true,
        }));
        // setStart(true);
      } else if (response?.status == 204) {
        showAlert(response?.data.message, "error");
      } else if (response?.status == 203) {
        showAlert(response?.data.message, "error");
      } else if (response?.message == "Network Error") {
        setError(response?.message);
        showAlert(response?.message, "error");
      } else if (response?.response.status == 500) {
        setError("500");
        showAlert("Internal Error is Going on..", "error");
      } else if (response?.response.status == 400) {
        showAlert("Bad Request", "error");
      } else if (response?.response.status == 401) {
        showAlert("Unauthorized", "error");
      } else if (response?.response.status == 404) {
        showAlert("Not Found", "error");
      } else if (response?.response.status == 502) {
        showAlert("Bad GateWay", "error");
      }
    } catch (err: any) {
      showAlert(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  // post otp request
  const verifyotprequest = async () => {
    try {
      setIsLoading(true);
      const response: any = await Forgot_pass_verify_otp(
        userName,
        otp.join(""),
      );
      if (response?.status == 200) {
        showAlert(response?.data.message, "success");
        setState((pre: any) => ({
          ...pre,
          otp: ["", "", "", "", "", ""],
          userName: "",
          showotpboxes: false,
          showresendbutton: false,
          buttonname: "Send OTP",
          type: 1,
          resendotp: true,
          start: false,
        }));
        setTimer(120);
      } else if (response?.status == 203) {
        showAlert(response?.data.message, "error");
      } else if (response?.response.status == 204) {
        showAlert(response?.response.data.message, "error");
      } else if (response?.response.status == 203) {
        showAlert(response?.response.data.message, "error");
      } else if (response?.message == "Network Error") {
        setError(response?.message);
        showAlert(response?.message, "error");
      } else if (response?.response.status == 500) {
        setError("500");
        showAlert(response.data.message, "error");
      } else if (response?.response.status == 400) {
        showAlert("Bad Request", "error");
      } else if (response?.response.status == 401) {
        showAlert("Unauthorized", "error");
      } else if (response?.response.status == 404) {
        showAlert("Not Found", "error");
      } else if (response?.response.status == 502) {
        showAlert("Bad GateWay", "error");
      }
    } catch (err: any) {
      showAlert(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = (index: any, event: any) => {
    const newOTP = [...otp];
    newOTP[index] = event.target.value;
    setState((pre) => ({ ...pre, otp: newOTP }));
    if (event.target.value && index < otp.length - 1) {
      refs.current[index + 1].focus();
    }
  };
  const handleKeyPress = (index: any, event: any) => {
    // Move focus to the previous input box if backspace is pressed in an empty input
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1].focus();
    }
  };

  const checklength = () => {
    const data = otp.filter((item) => {
      if (item) {
        return item;
      }
    });
    // console.log(data,"data")
    return data.length == 6;
  };

  return (
    <>
      <div
        className={
          "lg:flex  block lg:-m-3 lg:-mx-8 relative lg:h-[100%]  lg:overflow-hidden lg:w-auto w-full overflow-hidden"
        }
      >
        <div className="lg:w-[50%] bg-white absolute bottom-[0px] left-[0px] right-[0px] lg:static mx-[-10px] lg:m-0 w-[109%] hidden lg:block ">
          <div
            className="relative before:hidden lg:before:block after:hidden lg:after:block   lg:overflow-hidden bg-primary lg:bg-gradient-to-r lg:from-[#777779] lg:via-[#777779] lg:to-[#fff]  dark:bg-darkmode-800 xl:dark:bg-darkmode-600 
 before:content-[''] before:w-[99%] before:-mt-[28%] before:-mb-[16%] before:-ml-[0] before:absolute before:inset-y-0 before:left-0 before:transform
   before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400 after:content-[''] 
   after:w-[99%] after:-mt-[20%] after:-mb-[13%] after:-ml-[0] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] 
   after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700  h-[100%] animate-morph transition-all duration-1000 "
          >
            <div className="flex-col min-h-auto lg:min-h-screen md:flex rounded-[431px] ">
              <div className=" m-auto w-full  z-[1]  relative">
                <div className=" justify-end lg:flex  hidden">
                  <div className=" md:pl-[100px] md:pr-[100px] lg:pl-[100px] lg:pr-[100px  xl:pl-[120px] xl:pr-[100px] 2xl:pl-[0px] 2xl:pr-[120px] w-[700px]  ">
                    <a href="" className="flex items-center pt-5 ">
                      <img
                        alt="sKart Logo"
                        className="w-[370px]"
                        src={logoUrl}
                        style={{ filter: "drop-shadow(5px 5px 3px #222)" }}
                      />
                    </a>
                  </div>
                </div>

                <div className="lg:pt-[70px]  xl:pt-[70px]  2xl:pt-[160px]  w-[99%] overflow-hidden z-[1]  scooterBox   lg:rounded-r-[70px] xl:rounded-r-[80px]  2xl:rounded-r-[90px]  3xl:rounded-r-[100px]   ">
                  <div className="scooteranimate ">
                    <div id="homer" className="scale-[.5] lg:transform-none">
                      <img className="scooter" src={scooterUrl} />
                      <i className="tyre wheel">
                        <img src={tyreUrl} />
                      </i>
                      <i className="tyre2 wheel">
                        <img src={tyreUrl} />
                      </i>
                      <i className="ekartline">
                        <img src={ekartLineUrl} />
                      </i>
                    </div>
                  </div>
                </div>

                <div className=" justify-end lg:flex  hidden">
                  <div className=" md:pl-[100px] md:pr-[100px] lg:pl-[100px] lg:pr-[100px  xl:pl-[120px] xl:pr-[100px] 2xl:pl-[0px] 2xl:pr-[120px] w-[700px]  ">
                    <div className="mt-4 text-2xl font-medium leading-tight text-white -intro-x">
                      sKart Global Express Pvt Ltd
                    </div>
                    <div className="mt-7 text-md text-white -intro-x text-opacity-70 dark:text-slate-400 w-[100%] xl:w-[90%] 2xl:w-[70%]">
                      sKart Global Express Pvt Ltd is a next-gen tech-driven
                      express and e-commerce Logistics solution provider.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* END: Login Info */}
        {/* BEGIN: Login Form */}
        <div className="lg:w-[50%] w-full bg-[#777779] lg:bg-[#fff] lg:p-[100px] md:p-[10px] ">
          <div className="lg:hidden block">
            <a
              href=""
              className="flex items-center mt-3 mb-5 text-center justify-center"
            >
              <img
                alt="sKart Logo"
                className="w-[240px]"
                src={logoUrl}
                style={{ filter: "drop-shadow(5px 5px 3px #222)" }}
              />
            </a>
          </div>

          <div className="w-full m-auto md:h-full flex items-center ">
            <div className="w-full lg:w-[460px] bg-white  rounded-[20px] overflow-hidden relative p-[1px]">
              <div className="absolute inset-[-100%] animate-[spin_8s_linear_infinite] hover:[animation-play-state:paused]">
                <div
                  className="h-full w-full
                       bg-[conic-gradient(#d8def0,#f9cd73_4%,#d8def0_20%,#d8def0_95%)]
                       [mask:linear-gradient(#d8def0_0_0)_content-box,linear-gradient(#d8def0_0_0)]
                       [mask-composite:exclude]
                       p-[5px] hover:bg-[conic-gradient(#303030,#303030%,#303030_60%,#303030_95%)]"
                ></div>
              </div>

              <div className="bg-white  rounded-[20px] overflow-hidden relative">
                <div className="w-full bg-[#f7f8fb] border-b border-[#d8def0] rounded-t-[20px] p-[10px] flex items-center justify-center ">
                  <LogIn className="w-[21px]" />
                  <h2 className="text-lg font-bold uppercase text-center text-[#303030] ml-2">
                    {type == 1 ? "Sign In" : "Forgot Password"}
                  </h2>
                </div>

                <div className="bg-white  rounded-[20px] overflow-hidden relative">
                  <div className=" p-[20px]">
                    <div className="mt-4 intro-x">
                      <div className="mb-3">
                        <FormLabel className="text-[14px] text-primary mb-[2px]">
                          Username
                        </FormLabel>
                        <div className="w-full relative">
                          <i className="absolute top-[7px] left-[0px] z-[50] border-r border-[#eee]  h-[70%] px-[6px] py-[3px] w-[36px] flex items-center justify-center">
                            <User className="text-[#B1B1B1] w-[21px]" />
                          </i>

                          <FormInput
                            type="text"
                            className="block pr-4 pl-[45px] py-3  bg-[#FDFDFD] border-[#EBEBEB] rounded-[10px]"
                            placeholder="Enter username"
                            value={userName}
                            onChange={(e) =>
                              setState((prev) => ({
                                ...prev,
                                userName: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                loginFunc();
                              }
                            }}
                          />
                        </div>{" "}
                      </div>
                      {type == 1 ? (
                        <div className="mb-0">
                          <FormLabel className="text-[14px] text-primary mb-[2px]">
                            Password
                          </FormLabel>

                          <div className="w-full relative">
                            <i className="absolute top-[7px] left-[0px] z-[50] border-r border-[#eee]  h-[70%] px-[6px] py-[3px] w-[36px] flex items-center justify-center">
                              <Lock className="text-[#B1B1B1] w-[18px]" />
                            </i>
                            <InputGroup className="w-full roundedBox">
                              <FormInput
                                type={`${showPass ? "text" : "password"}`}
                                className="block pr-4 pl-[45px] py-3  bg-[#FDFDFD] border-[#EBEBEB] rounded-[20px]"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => {
                                  setPassword(e.target.value);
                                  setState((pre: any) => ({
                                    ...pre,
                                    password: e.target.value,
                                  }));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    loginFunc();
                                  }
                                }}
                              />
                            </InputGroup>

                            <InputGroup.Text
                              id="input-group-price"
                              className="bg-inherit shadow-none w-[20px] absolute right-[15px] top-[9px] z-[10] border-none  p-0"
                            >
                              <Lucide
                                icon={`${showPass ? "Eye" : "EyeOff"}`}
                                className="text-mustard stroke-2.5 mt-1 h-5 cursor-pointer"
                                onClick={() => setShowPass(!showPass)}
                              />
                            </InputGroup.Text>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                      <div className="flex justify-end mr-auto">
                        {type == 1 && (
                          <div
                            className="mt-2"
                            onClick={() => {
                              setState((pre) => ({ ...pre, type: 2 }));
                            }}
                          >
                            <p className="text-mustard cursor-pointer">
                              Forgot Password?
                            </p>
                          </div>
                        )}
                      </div>
                      {type == 2 && start && (
                        <div className="flex justify-center p-2 mt-2 bg-mustard text-white">
                          {" "}
                          <p>
                            RESEND OTP IN:{" "}
                            {minutes < 10 ? `0${minutes}` : minutes}:
                            {remainingSeconds < 10
                              ? `0${remainingSeconds}`
                              : remainingSeconds}
                          </p>
                        </div>
                      )}
                      {type == 2 && showotpboxes ? (
                        <div className="flex justify-center mt-8">
                          <div className="flex space-x-4">
                            {otp.map((digit, index) => (
                              <input
                                key={index}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e)}
                                onKeyDown={(e) => handleKeyPress(index, e)}
                                className="w-12 h-12 text-4xl text-center text-primary  border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                ref={(input) => (refs.current[index] = input)}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                      <div className="mt-4 text-center intro-x xl:text-left">
                        {isLoading ? (
                          <Button className="w-full px-4 py-2 align-top xl:w-full xl:mr-3 mb-2 bg-mustard text-white rounded-full text-lg hover:bg-[#dba948]">
                            {type == 1 ? (
                              <LoadingButtonCommon text="Logging" />
                            ) : type == 2 &&
                              buttonname == "Verify OTP" &&
                              !resendotp ? (
                              <LoadingButtonCommon text="Verifying" />
                            ) : type == 2 &&
                              buttonname == "Send OTP" &&
                              !resendotp ? (
                              <LoadingButtonCommon text={"Sending OTP"} />
                            ) : type == 2 &&
                              buttonname == "Send OTP" &&
                              resendotp ? (
                              <LoadingButtonCommon text={"Sending OTP"} />
                            ) : (
                              ""
                            )}
                          </Button>
                        ) : (
                          <Button
                            disabled={
                              type == 2 &&
                              start &&
                              timer !== 0 &&
                              otp.join("").length !== 6
                            }
                            onClick={() => {
                              type == 1
                                ? loginFunc()
                                : type == 2 && buttonname == "Verify OTP"
                                  ? type == 2 && verifyotprequest()
                                  : buttonname == "Send OTP"
                                    ? type == 2 && handleotprequest()
                                    : "";
                            }}
                            className="w-full px-4 py-2 mb-2 align-top xl:w-full xl:mr-3 bg-mustard text-white rounded-full text-lg hover:bg-[#dba948]"
                          >
                            {type == 1 ? "Log In" : type == 2 ? buttonname : ""}
                          </Button>
                        )}
                        <div>
                          {" "}
                          <div>
                            {type == 2 && showresendbutton && (
                              <Button
                                disabled={resendotp == false}
                                onClick={() => {
                                  handleotprequest();
                                }}
                                className="w-full text-white px-4 py-2 align-top xl:w-full xl:mr-3 bg-mustard"
                              >
                                Resend OTP
                              </Button>
                            )}
                          </div>
                        </div>
                        {type == 2 ? (
                          <div className="flex justify-end mt-2">
                            {" "}
                            <div
                              onClick={() => {
                                setTimer(120);
                                setState((pre: any) => ({
                                  ...pre,
                                  otp: ["", "", "", "", "", ""],
                                  userName: "",
                                  showotpboxes: false,
                                  showresendbutton: false,
                                  buttonname: "Send OTP",
                                  type: 1,
                                  start: false,
                                  resendotp: true,
                                }));
                                setTimer(120);
                              }}
                            >
                              <p className="text-mustard cursor-pointer">
                                Go Back
                              </p>
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                      <div className="flex text-xs font-medium justify-center text-primary dark:text-slate-200">
                        By signing up, you agree to our Terms and Conditions &
                        Privacy Policy
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* END: Login Form */}
      </div>
      <div className="md:static absolute bottom-[0px] left-[0px] right-[0px]    w-[109%] block lg:hidden mobilescooter ">
        <div className=" w-full overflow-hidden z-[1]  scooterBox">
          <div className="scooteranimate ">
            <div id="homer" className="scale-[.5] lg:transform-none">
              <img className="scooter" src={scooterUrl} />
              <i className="tyre wheel">
                <img src={tyreUrl} />
              </i>
              <i className="tyre2 wheel">
                <img src={tyreUrl} />
              </i>
              <i className="ekartline">
                <img src={ekartLineUrl} />
              </i>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
