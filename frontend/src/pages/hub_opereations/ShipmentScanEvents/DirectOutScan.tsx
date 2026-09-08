import React, { useEffect, useState } from "react";
import {
  FormLabel,
  FormInput,
  FormCheck,
  FormSelect,
  FormTextarea,
} from "../../../base-components/Form";
import { ClipboardList, Scan, Trash2 } from "lucide-react";
import Airwaybill from "../../../assets/images/airwaybill.png";
import Weight from "../../../assets/images/weight.png";
import Airway from "../../../assets/images/airway.png";
import Outscan from "../../../assets/images/outscan.png";
import Action from "../../../assets/images/actionn.png";
import {
  Get_contact_detail,
  Get_manifest_no,
  Get_vendor,
  On_forward_shipment,
  Outscan_shipment,
  Pending_onforward_Shipment,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { useDebounce } from "../../../components/Search";
import AutoComplete from "../../../components/AutoComplete/index";
import {
  OnForwardShipmentData,
  sentAllData2,
} from "../../../DataTypes/dataTypes";
import LoadingIcon from "../../../base-components/LoadingIcon";
import Button from "../../../base-components/Button";
import Table from "../../../base-components/Table";
import { useNavigate } from "react-router-dom";
import OrderSummary from "./OrderSummary";

const DirectOutscan = () => {
  const [type, setType] = useState<any>(null);
  const [selectMode, setSelectMode] = useState([]);
  const { showAlert } = useAlert();
  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const [value, setValue] = useState<any>("");
  const [manifestno, getManifestNo] = useState<any>("");
  const [bagno, getBagno] = useState<any>("");
  const [courierId, getCourierId] = useState<any>("");
  const [couriername, getCourierName] = useState<any>("");
  const [mobileNumber, setMobileNumber] = useState<any>(null);
  const [driverName, setDriverName] = useState<any>(null);
  const [vehicleNo, setVehicleNo] = useState<any>(null);
  const [extraDetails, setExtraDetails] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [showOutscanList, setShowOutscanList] = useState<any>([]);
  const [showTableList, setShowTableList] = useState<any>([]);
  const [initialLength, setInitialLength] = useState(0);
  const debouncedSearchTerm = useDebounce<string>(manifestno, 500);
  const [manifestId, setManifestId] = useState<any>("");
  console.log(manifestId, "response.data");
  const navigate = useNavigate();
  const getModeList = async () => {
    try {
      const response = await Pending_onforward_Shipment(
        hub_id,
        debouncedSearchTerm,
        20,
        1
      );
      if (response.status == 200) {
        setSelectMode(response.data.data.onForwardModeList);
      } else {
        showAlert(response.data.message, "warning");
      }
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong", "error");
    }
  };

  const fetchManifest = async () => {
    try {
      const response = await Get_manifest_no();
      if (response?.status == 200 || response?.status == 201) {
        showAlert(response.data.message, "success");
        getManifestNo(response.data?.data?.manifest_no);
      } else if (response?.status == 203) {
        showAlert(response.data.message, "warning");
      } else showAlert(response.data.message, "error");
    } catch (error) {}
  };

  const findCourierName = async () => {
    const res = await Get_vendor();
    const list = res?.data?.data;
    const courier = list?.find(
      (item: any) => item?.product_id == courierId
    ).product_name;
    getCourierName(courier);
  };

  const directOutscan = async () => {
    const sentData: sentAllData2 = {
      airwaybill_no: value,
      manifest_no: manifestno || "",
      bag_no: bagno || "",
    };
    setSpinner(true);
    try {
      const response = await Outscan_shipment(sentData);
      if (response?.status == 200 || response?.status == 201) {
        setValue("");
        showAlert(response.data.message, "success");
        setShowOutscanList(response?.data?.data);
        getBagno(response.data?.data?.[0]?.bag_no);
        getCourierId(response.data?.data?.[0]?.courier_id);
      } else if (response?.status == 203) {
        showAlert(response.data.message, "warning");
      } else showAlert(response.data.message, "error");
    } catch (error) {
    } finally {
      setSpinner(false);
    }
  };

  const onForwardShipment = async () => {
    setSpinner(true);
    const onForwardShipmentData: OnForwardShipmentData = {
      type: type,
      mobile_no: mobileNumber,
      driver_name: driverName,
      vehicle_no: vehicleNo,
      manifest_no: manifestno,
      extra_details: extraDetails,
    };
    let response;
    try {
      response = await On_forward_shipment(
        { emp_id, hub_id },
        onForwardShipmentData
      );
      if (response.status == 200) {
        showAlert(response.data.message, "success");
        setManifestId(response.data.manifest_id);
        fetchManifest();
        setType("");
        setMobileNumber("");
        setDriverName("");
        setVehicleNo("");
        getManifestNo("");
        setExtraDetails("");
        getModeList();
        navigate("/hub/operation/order_summary", {
          state: {
            manifestno,
            couriername,
            rows: showTableList.length - initialLength,
            manifestId: response.data.manifest_id,
          },
        });
      } else if (response.status == 204) showAlert("No data found!", "error");
      else showAlert(response.data.message, "error");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "error");
      else showAlert(response.response.data.message, "error");
    } finally {
      setSpinner(false);
    }
  };
  const handleDelete = (indextodelete: any) => {
    setShowTableList((prev: any) =>
      prev.filter((item: any, index: any) => index != indextodelete)
    );
  };
  useEffect(() => {
    getModeList();
    fetchManifest();
  }, []);

  useEffect(() => {
    findCourierName();
  }, [courierId]);

  useEffect(() => {
    setShowTableList((prev: any) => {
      return [
        ...prev,
        ...showOutscanList.filter(
          (item: any) =>
            !prev.some(
              (item2: any) => item2.airwaybill_no === item.airwaybill_no
            )
        ),
      ];
    });
  }, [showOutscanList]);

  useEffect(() => {
    setInitialLength(showTableList.length);
  }, []);

  return (
    <>
      <div className="mt-3  w-full md:py-8  md:px-5  py-3  px-3 bg-white rounded-lg shadow-lg">
        <div className="w-full lg:w-[810px] xl:w-[900px] m-auto ">
          <div>
            <h1 className="text-sm sm:text-xl font-bold mb-2">
              Direct Outscan
            </h1>
          </div>
          <div className="w-full shipmentAccount bg-[#F8FBFE] border border-[#D4E6F8] rounded-lg py-6 px-5 md:flex items-center justify-between  block mt-5">
            <div className="w-full flex  items-center ">
              <figure className="relative top-[5px] mr-1 hidden md:block">
                <img src={Outscan} alt="" className="w-[56px] " />
              </figure>
              <aside className="md:border-l md:border-gray-200 md:pl-3 md:ml-4 mb-2 md:mb-0 text-center md:text-left w-full">
                <h2 className="font-bold text-lg">Outscan</h2>
                <p>Scan packages for outbound delivery</p>
              </aside>
            </div>

            <div className="w-full btnsoutdeleivery flex md:justify-end justify-center">
              <button
                disabled={spinner}
                onClick={() => onForwardShipment()}
                className="btnAnimation overflow-hidden  duration-200  
                inline-flex items-center justify-center cursor-pointer 
                 bg-yellow-300 text-white  text-xl py-2 px-7 rounded-lg 
                 hover:bg-yellow-250 transition uppercase"
              >
                <Scan className="mr-2 w-[20px]" /> Outscan
                {spinner && <LoadingIcon icon="puff" className="ml-2" />}
              </button>
            </div>
          </div>

          <div className="outsanForm mt-8 mb-6">
            <div className="grid grid-cols-12 gap-3 labelMargin">
              <div className="col-span-12 md:col-span-4">
              <FormLabel className="pb-2">Select Mode</FormLabel>
                <FormSelect
                  className=""
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">--Select Mode--</option>
                  {selectMode.map((val: any) => (
                    <option key={val.id} value={val.id}>
                      {val.mode}
                    </option>
                  ))}
                </FormSelect>
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="pb-2">Contact No.</FormLabel>
                <AutoComplete
                  apiFunction={Get_contact_detail}
                  setMobileNumber={setMobileNumber}
                  mobileNumber={mobileNumber}
                  setDriverName={setDriverName}
                  setVehicleNo={setVehicleNo}
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="pb-2">Manifest No.</FormLabel>
                <FormInput
                  type="text"
                  value={manifestno}
                  readOnly
                  placeholder="Manifest Number"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="pb-2">Driver Name</FormLabel>
                <FormInput
                  id="regular-form-1"
                  type="text"
                  value={driverName}
                  placeholder="Driver Name"
                  onChange={(e) => setDriverName(e.target.value)}
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="pb-2">Courier Name</FormLabel>
                <FormInput
                  type="text"
                  value={couriername}
                  readOnly
                  placeholder="Courier Name"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="pb-2">Vehicle Name</FormLabel>
                <FormInput
                  type="text"
                  value={vehicleNo}
                  placeholder="Vehicle Name"
                  onChange={(e) => setVehicleNo(e.target.value)}
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <FormLabel className="pb-2">Extra Details</FormLabel>
                <FormTextarea
                  name="address"
                  className="px-4 py-3 mt-2  max-h-10 min-h-12"
                  placeholder="Extra Details"
                  autoComplete="off"
                  value={extraDetails}
                  onChange={(e) => setExtraDetails(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      onForwardShipment();
                    }
                  }}
                ></FormTextarea>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-8">
              <div className="w-full scan bg-[#FFFAEE] border border-[#EEE3C9] rounded-lg py-3 px-3 md:py-3 md:px-5 mt-5 min-h-[113px] ">
                <h2 className="text-lg font-bold mb-2">Airwaybill No.</h2>
                <div className="scanBox md:flex block">
                  <div className="scanBoxInput relative p-[1px] overflow-hidden w-full rounded-[10px]">
                    <div className="inputIcon relative">
                      <FormInput
                        type="text"
                        value={value}
                        placeholder="Enter or scan Airwaysbill No."
                        className="rounded-[10px] w-full z-4 relative border border-[#DECDA3] h-[49px] pl-[54px]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            directOutscan();
                          }
                        }}
                        onChange={(e) => {
                          setValue(e.target.value);
                        }}
                      />

                      <i className="absolute top-[0px] left-[0px] bottom-[-1px] flex items-center w-[42px] h-[49px] border-r border-[#E8E8E8] justify-center">
                        <ClipboardList className="text-[#BFAB7A]" />
                      </i>
                    </div>
                  </div>

                  <div className="scanBoxbutton relative flex md:ml-5 mt-3 md:mt-0">
                    <Button
                      className="btnAnimation overflow-hidden  duration-200  inline-flex items-center justify-center cursor-pointer  bg-yellow-300 text-white  text-xl py-2 px-7 rounded-lg hover:bg-yellow-250 transition uppercase"
                      disabled={!value}
                      onClick={() => {
                        directOutscan();
                      }}
                    >
                      <Scan className="mr-2 w-[18px]" /> scan
                      {spinner && <LoadingIcon icon="puff" className="ml-2" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4">
              <div className="w-full scan bg-[#FFFAEE] border border-[#EEE3C9] rounded-lg py-3 px-3 md:py-3 md:px-5 mt-5 min-h-[113px] flex items-center justify-center ">
                <div className="w-full flex  items-center ">
                  <figure className="flex items-center justify-center  relative top-[5px] mr-1  bg-[#fff] rounded-full border border-[#F8E0AA] w-[70px] h-[70px] ">
                    <img src={Airway} alt="" className="w-[33px] h-[39px]" />
                  </figure>
                  <aside className="md:border-l md:border-gray-200 md:pl-3 md:ml-4 mb-2 md:mb-0">
                    <h2 className="font-bold text-lg">
                      {" "}
                      {/* <Counter value={487} duration={3000} /> */}
                      {showTableList.length - initialLength}
                    </h2>
                    <p>Scanned Airwaybills</p>
                  </aside>
                </div>
              </div>
            </div>
          </div>

          <div className=" w-full mt-6">
            <div className="w-full rounded-lg  overflow-auto pb-3 ">
              <Table className="airbillTbale w-full text-left border border-[#EEEEEE] whitespace-nowrap ">
                <Table.Thead className="bg-[#FBFBFB] text-white ">
                  <Table.Tr className="">
                    <Table.Th className="w-[40px] rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-center">
                      S.NO.
                    </Table.Th>

                    <Table.Th className="rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-start">
                      <i className="inline-block  relative top-[5px] mr-1">
                        <img
                          src={Airwaybill}
                          alt=""
                          className="w-[23px] h-[23px]"
                        />
                      </i>
                      Airwaysbill number
                    </Table.Th>
                    <Table.Th className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-end">
                      <i className="inline-block  relative top-[4px] mr-1">
                        <img
                          src={Weight}
                          alt=""
                          className="w-[19px] h-[19px] "
                        />
                      </i>
                      Weight
                    </Table.Th>

                    <Table.Th className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-center">
                      <i className="inline-block  relative top-[0px] mr-1">
                        <img
                          src={Action}
                          alt=""
                          className="w-[14px] h-[14px]"
                        />
                      </i>
                      action
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {showTableList?.map((item: any, index: any) => (
                    <Table.Tr key={index}>
                      <Table.Td className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-center">
                        {index + 1}
                      </Table.Td>
                      <Table.Td className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-start">
                        {item.airwaybill_no}
                      </Table.Td>
                      <Table.Td className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-end">
                        {item.actual_weight}
                      </Table.Td>
                      <Table.Td className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-center">
                        <Button onClick={() => handleDelete(index)}>
                          <Trash2 className="text-red-500" />
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </div>

          {/* <div className="justify-end relative flex md:ml-5 mt-3 md:mt-0">
            <button className="btnAnimation overflow-hidden  duration-200  inline-flex items-center justify-center cursor-pointer  bg-yellow-300 text-white  text-xl py-2 px-5 rounded-lg hover:bg-yellow-250 transition uppercase">
              <Trash2 className="mr-2 w-[18px]" /> Bulk delete
            </button>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default DirectOutscan;
