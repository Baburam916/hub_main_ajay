import { useState } from "react";
import ManifestInscan from "./manifest_inscan";
import BagInscan from "./bag_inscan";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { ManifestNo } from "../../../DataTypes/dataTypes";
import { Inscan_manifest } from "../../../AllServices/services";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Box, ClipboardList, FileCog } from "lucide-react";
import { User } from "lucide-react";
import  manifest_inscan from "../../../assets/images/manifest_inscan.png";

export default function Index() {
  const { showAlert } = useAlert();
  const [showBagInscan, setShowBagInscan] = useState<boolean>(false);
  const [manifestNumber, setManifestNumber] = useState<any>(null);
  const [bagInscanList, setBagInscanList] = useState<Array<any>>([]);
  const [spinner, setSpinner] = useState<boolean>(false);

  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const manifestInscan = async (manifestNumber: any) => {
    setSpinner(true);
    const manifestNo: ManifestNo = {
      manifest_no: manifestNumber,
    };
    let response;
    try {
      response = await Inscan_manifest({ emp_id, hub_id }, manifestNo);
      if (response.status == 200) {
        setBagInscanList(response.data.data);
        setShowBagInscan(true);
      } else if (response?.status === 204) {
        setBagInscanList([]);
        showAlert("No data found!", "warning");
      } else if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.data.message, "error");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  return (
    <>
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-none flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <FileCog className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium"> Manifest Inscan</h4>
                </div>
              </div>

              <div className="flex items-center">
                {!showBagInscan && (
                  <div>
                    <div className="flex items-center ml-2">
                      <h1 className="text-sm sm:text-lg font-bold">
                        Next Shipment Segregation
                      </h1>
                      <div className=" p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2 bg-[#777] w-[34px] h-[34px]">
                        <Link
                          to="/hub/operation/shipment_segregation"
                          className="font-bold"
                        >
                          <ArrowRight className="w-5 h-4 text-white " />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full ">
            <div className="w-full awbsearchbg bg-[#f7f8f9] border-b border-[#fff0cd] py-3 px-3 md:py-3 md:px-5  ">
              <div className="flex items-center  ">
                <figure className="hidden lg:flex items-center justify-center  mr-1   bg-[#fff] rounded-full border border-[#fff0c9] w-[65px] h-[65px] ">
                  <img
                    src={manifest_inscan}
                    alt=""
                    className="w-[38px] "
                  />
                </figure>

                <div className=" lg:ml-[12px] mb-2 md:mb-0 lg:border-l border-[#ffe6af] lg:pl-[10px] ">
                  <FormLabel
                    className={`text-[14px] !mb-0 ${
                      showBagInscan ? "disable" : ""
                    }`}
                  >
                    Manifest No.
                  </FormLabel>

                  <div className="scanBox gap-2 flex-wrap lg:flex-nowrap flex ">
                    <div className=" relative p-[1px] overflow-hidden w-full lg:w-[390px]  rounded-[10px]">
                      <div className="inputIcon relative">
                        <FormInput
                          disabled={showBagInscan || spinner}
                          className="rounded-[10px] w-full z-4 relative border border-[#ffd67f] !h-[42px] !pl-[54px]"
                          placeholder="Enter Manifest No."
                          value={manifestNumber}
                          onChange={(e) =>
                            setManifestNumber(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              manifestInscan(manifestNumber);
                            }
                          }}
                        />

                        <i className="absolute top-[1px] left-[1px] rounded-l-lg bg-[#fffaee] bottom-[-1px] flex items-center w-[42px] h-[39px] border-r border-[#E8E8E8] justify-center">
                          <ClipboardList className="text-[#7b7b7b] " />
                        </i>
                      </div>
                    </div>
                    <div>
                      <Button
                        disabled={showBagInscan || spinner}
                        className="h-[42px] text-[15px] border-none inline-flex items-center justify-center cursor-pointer bg-mustard hover:bg-[#777779] text-white  py-2 px-7 rounded-lg hover:bg-yellow-250 transition uppercase"
                        onClick={() => manifestInscan(manifestNumber)}
                      >
                        Scan Manifest{" "}
                        {spinner && (
                          <LoadingIcon icon="puff" className="ml-2" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2  lg:p-6">
            <div className="w-full text-center py-2 lg:py-10 opacity-30 nodataNew">
              <figure className="text-center flex justify-center mb-4">
                <Box className="w-[28px] h-[28px] " />
              </figure>
              <p className="text-[13px] ">
                Currently, there is no data available to display
              </p>
            </div>
          </div>
        </div>
      </div>

      {!showBagInscan ? (
        <ManifestInscan
          hub_id={hub_id}
          manifestInscan={manifestInscan}
          manifestNumber={manifestNumber}
          setManifestNumber={setManifestNumber}
          showBagInscan={showBagInscan}
          setShowBagInscan={setShowBagInscan}
          spinner={spinner}
        />
      ) : (
        <BagInscan
          hub_id={hub_id}
          emp_id={emp_id}
          manifestInscan={manifestInscan}
          setShowBagInscan={setShowBagInscan}
          bagInscanList={bagInscanList}
          manifestNumber={manifestNumber}
        />
      )}
    </>
  );
}
