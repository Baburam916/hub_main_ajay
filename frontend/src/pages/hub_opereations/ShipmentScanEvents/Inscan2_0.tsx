import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FormLabel,
  FormInput,
  FormCheck,
  FormSelect,
  FormTextarea,
} from "../../../base-components/Form";
import {
  Download,
  Layers,
  ClipboardList,
  Scan,
  Box,
  Trash2,
} from "lucide-react";
import { Dialog } from "../../../base-components/Headless";
import Lucide from "../../../base-components/Lucide";
import Airwaybill from "../../../assets/images/airwaybill.png";
import Weight from "../../../assets/images/weight.png";
import Accountbox from "../../../assets/images/account_box.png";
import Boxanimation from "../../../assets/images/boxanimation.png";
import Remaingbox from "../../../assets/images/remaingbox.png";
import Action from "../../../assets/images/actionn.png";
import Button from "../../../base-components/Button";
import Table from "../../../base-components/Table";
import Modal from "../../../components/Modal";
import { useAlert } from "../../../ContextProvider/AlertContext";
import {
  Delete_Inscan,
  Direct_inscan_airwaybill,
  Download_manifest_details,
  Download_rest_manifest_no,
  Inscan_shipment,
  Short_shipment,
  Status_code_list,
} from "../../../AllServices/services";
import LoadingIcon from "../../../base-components/LoadingIcon";
import {
  sentAllData,
  ShipmentScanAirwaybill,
  ShortShipmentData,
} from "../../../DataTypes/dataTypes";
import { AnyAsyncThunk } from "@reduxjs/toolkit/dist/matchers";
import { User } from "lucide-react";

const Inscan2_0 = () => {
  const [buttonModalPreview, setButtonModalPreview] = useState<boolean>(false);
  const [showSection, setShowSection] = useState<boolean>(false);
  const [value, setValue] = useState<any>("");
  const [showDispatch, setShowDispatch] = useState<any>("");
  const [showInscanList, setShowInscanList] = useState<any>([]);
  const [showTableList, setShowTableList] = useState<any>([]);
  const [shortShipment, setShortShipment] = useState<any>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [heldUpReason, setHeldUpReason] = useState<any>(-1);
  const [otherReason, setOtherReason] = useState<any>(null);
  const [statusList, setStatusList] = useState<Array<any>>([]);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [manifestno, getManifestNo] = useState<any>("");
  const [restManifestno, setRestManifestNo] = useState<any>("");
  const [manifestDetails, setManifestDetails] = useState<any>("");
  const [checkedIds, setCheckedIds] = useState<Array<any>>([]);
  const [totalAirbill, setTotalAirbill] = useState<any>("");
  const [inscannedCount, setInscannedCount] = useState(0);
  const { showAlert } = useAlert();
  const current_user = localStorage.getItem("current_user");
  const emp_id = current_user ? JSON.parse(current_user).emp_id : null;
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  console.log(showDispatch, "showDispatch");

  useEffect(() => {
    const getStatusList = async () => {
      try {
        const response = await Status_code_list();
        if (response.status == 200) setStatusList(response.data.data);
      } catch (error) {
        console.log(error);
        showAlert("Something went wrong with status list!", "error");
      }
    };

    getStatusList();
  }, []);

  const directInscan = async () => {
    const sentData: sentAllData = {
      airwaybill_no: value,
      held_up_reason: -1,
      manifest_code: manifestno || "",
    };
    setSpinner(true);
    try {
      const response: any = await Inscan_shipment(sentData);
      if (response?.status == 200 || response?.status == 201) {
        setValue("");
        showAlert(response.data.message, "success");
        setShowSection(true);
        setShowInscanList(response?.data?.data);
        setShortShipment(response?.data?.short_shipment);
        setInscannedCount((prev) => prev + 1);
        setTotalAirbill(response.data?.total_airwaybill);
        getManifestNo(response.data?.data?.[0]?.manifest_code);
        setShowDispatch(
          response.data?.short_shipment?.[0]?.dispatch_status_code,
        );
      } else if (response?.status == 203) {
        setValue("");
        showAlert(response.data.message, "warning");
      } else showAlert(response.data.message, "error");
    } catch (error) {
    } finally {
      setSpinner(false);
    }
  };

  // const handleDelete = async (awb: string, dispatch: string) => {
  //   try {
  //     const response: any = await Delete_Inscan(awb, dispatch);

  //     if (response?.status === 200 || response?.status === 201) {
  //       setShowTableList((prev: any) =>
  //         prev.filter((item: any) => item.airwaybill_no !== awb),
  //       );
  //       getManifestNo("");
  //       setButtonModalPreview(false);
  //       showAlert(response.data.message, "success");
  //     } else if (response?.status === 203) {
  //       showAlert(response.data.message, "warning");
  //     } else {
  //       showAlert(response.data.message, "error");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     showAlert("Something went wrong!", "error");
  //   }
  // };

  const holdShipment = async () => {
    if (heldUpReason == 264 && !otherReason) {
      showAlert("Please fill the reason", "error");
      return;
    }
    const sentData: sentAllData = {
      airwaybill_no: value,
      held_up_reason: heldUpReason,
      ...(Number(heldUpReason) == 264 ? { other_reason: otherReason } : {}),
    };
    setSpinner(true);
    try {
      const response = await Inscan_shipment(sentData);
      if (response?.status == 200 || response?.status == 201) {
        showAlert(response.data.message, "success");
        setValue("");
        setHeldUpReason(-1);
        setOtherReason("");
        setOpenModal(false);
      } else if (response?.status == 203) {
        setOpenModal(false)
        setHeldUpReason('')
        setOtherReason('')
        showAlert(response.data.message, "warning");
      } else showAlert(response.data.message, "error");
    } catch (error) {
    } finally {
      setSpinner(false);
    }
  };

  const manifestDetailsDownload = async () => {
    try {
      const response = await Download_manifest_details(manifestno);
      if (response.status === 200) {
        setManifestDetails(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const manifestRemainingAwbDownload = async () => {
    try {
      const response = await Download_rest_manifest_no({
        manifest_no: manifestno,
      });
      if (response.status === 200) {
        setRestManifestNo(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (manifestDetails) {
      window.open(manifestDetails, "_blank");
    }
  }, [manifestDetails]);

  useEffect(() => {
    if (restManifestno) {
      window.open(restManifestno, "_blank");
    }
  }, [restManifestno]);

  const totalWeight = showTableList.reduce((sum: any, item: any) => {
    return sum + Number(item.weight || 0);
  }, 0);

  const description = (
    <>
      <div>
        <h1 className="text-[20px] text-center p-4 sm:leading-6 leading-8">
          Airwaybill No - {value}
        </h1>
      </div>

      <div className="mt-4">
        <FormSelect onChange={(e) => setHeldUpReason(e.target.value)}>
          <option>Select held up reason</option>
          {statusList.map((val) => {
            return <option value={val.status_code}>{val.status}</option>;
          })}
          <option value="264">Other</option>
        </FormSelect>
      </div>
      {Number(heldUpReason) == 264 && (
        <div className="mt-2 mb-2">
          <FormLabel>Reason</FormLabel>
          <span className="text-red-500 ml-2">*</span>
          <FormTextarea
            className="px-4 py-3  max-h-20 min-h-16"
            autoComplete="off"
            value={otherReason}
            onChange={(e: any) => {
              setOtherReason(e.target.value);
            }}
          ></FormTextarea>
        </div>
      )}

      <Button
        disabled={spinner}
        className="bg-mustard border-none py-1 px-4 mt-4 text-white rounded-xl"
        onClick={() => holdShipment()}
      >
        Submit {spinner && <LoadingIcon icon="puff" className="ml-2" />}
      </Button>
    </>
  );

  useEffect(() => {
    setShowTableList((prev: any) => {
      return [
        ...prev,
        ...showInscanList.filter(
          (item: any) =>
            !prev.some(
              (item2: any) => item2.airwaybill_no === item.airwaybill_no,
            ),
        ),
      ];
    });
  }, [showInscanList]);

  return (
    <>
   <div className=" mt-2 mb-4 	  w-full xl:w-[100%]  2xl:w-[70%]  m-auto">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">




	
          <div className=" w-full py-3  px-3 border-b border-white commonGradientGray  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-none flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <User className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    {" "}
                  Direct Inscan
                  </h4>
                </div>
              </div>


            </div>
          </div>






        
          <div className="p-2  lg:p-6">
        
          {showSection ? (
            <>
              {manifestno && (
                <div className="w-full block md:flex justify-between items-center mb-5">
                  <div
                    className="manifestBox text-xl mb-3 md:mb-0"
                    onClick={manifestDetailsDownload}
                  >
                    Manifest No. : <strong>{manifestno}</strong>
                  </div>
                  {shortShipment && (
                    <div className="manifestRight block md:flex">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setButtonModalPreview(true);
                        }}
                        className="mb-2 md:mb-0 bg-[#FBFDFF] text-[#3D3D3D font-bold px-4 py-2 rounded-md hover:bg-[#f4b900] hover:border-[#f4b900]  hover:text-[#fff] mr-3 flex items-center border border-[#E4E6E8]"
                      >
                        Short Shipment <Layers className="w-[16px] ml-2" />
                      </Button>

                      {/* <Button className="bg-[#FBFDFF] text-[#3D3D3D]  font-bold  px-4 py-2 rounded-md  hover:bg-[#f4b900] hover:border-[#f4b900] hover:text-[#fff]  flex items-center  border border-[#E4E6E8]">
                    Download <Download className="w-[16px] ml-2" />
                  </Button> */}
                    </div>
                  )}
                </div>
              )}

              {/* BEGIN: Modal Content */}
              <Dialog
                size="lg"
                open={buttonModalPreview}
                onClose={() => {
                  setButtonModalPreview(false);
                }}
              >
                <Dialog.Panel>
                  <div className="flex justify-between items-center bg-[#F8F9FA] px-5 py-3 border-b border-gray-200 rounded">
                    <h3 className="text-xl mb-3 md:mb-0 font-bold">
                      Shipment Short{" "}
                    </h3>
                    {/* <a
                      onClick={() => {                    
                        setButtonModalPreview(false);
                      }}
                      className="absolute top-0 right-0 mt-3 mr-3"
                      href="#"
                    >
                      <Lucide icon="X" className="w-8 h-8 text-slate-400" />
                    </a> */}
                  </div>
                  <div className="w-full p-4 mb-2">
                    <div className="shipShortMain">
                      <div className=" grid 2xl:grid-cols-12 gap-x-2 ">
                        {manifestno && (
                          <div className=" col-span-6  md:col-span-6 mb-2 ">
                            <div className="shipShortBox flex items-center  border border-amber-200 p-2 bg-yellow-50 rounded-lg">
                              <figure className="">
                                <ClipboardList className="text-[#f2b518]" />
                              </figure>
                              <aside className="leading-[16px]  pl-3 ml-2 border-l border-amber-200 ">
                                <h2 className="text-sm  text-yellow-400  text-base/1  leading-none mb-1">
                                  Manifest No.
                                </h2>
                                <p className="text-base leading-none">
                                  {manifestno}
                                </p>
                              </aside>
                            </div>
                          </div>
                        )}
                        <div className=" col-span-6  md:col-span-6 mb-2 ">
                          <div className="shipShortBox flex items-center  border border-blue-200 p-2 bg-blue-50 rounded-lg">
                            <figure className="">
                              <Box className="text-[#1e74ca]" />
                            </figure>
                            <aside className="leading-[16px]  pl-3 ml-2 border-l border-blue-200 ">
                              <h2 className="text-sm  text-blue-400  text-base/1  leading-none mb-1">
                                PUD Name{" "}
                              </h2>
                              <p className="text-base leading-none">FedEx</p>
                            </aside>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full rounded-lg  overflow-auto pb-3 ">
                      <Table className=" airbillTbale md:w-full text-left border border-[#EEEEEE] whitespace-nowrap min-w-[485px] ">
                        <Table.Thead className="bg-[#FBFBFB] text-white ">
                          <Table.Tr className="">
                            <Table.Th className="w-[40px] rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-center">
                              S.NO.
                            </Table.Th>

                            <Table.Th className="rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase">
                              <i className="inline-block  relative top-[5px] mr-1">
                                <img
                                  src={Airwaybill}
                                  alt=""
                                  className="w-[23px] h-[23px]"
                                />
                              </i>
                              Airwaysbill number
                            </Table.Th>
                            <Table.Th className="border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase">
                              <i className="inline-block  relative top-[4px] mr-1">
                                <img
                                  src={Weight}
                                  alt=""
                                  className="w-[19px] h-[19px] "
                                />
                              </i>
                              Weight
                            </Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {shortShipment?.map((item: any, index: any) => (
                            <Table.Tr key={index}>
                              <Table.Td className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase">
                                {index + 1}
                              </Table.Td>
                              <Table.Td className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase">
                                {item.airwaybill_no}
                              </Table.Td>
                              <Table.Td className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase">
                                {item.weight}
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </div>

                    <div className="shorbtn relative flex md:ml-5 mt-3 md:mt-0 justify-end">
                      <Button
                        className="bg-yellow-300 border-none px-6 py-2 mr-2 text-white text-md"
                        onClick={() => {
                          setShowSection(false);
                          setShowTableList([]);
                          setInscannedCount(0);
                        }}
                      >
                        DONE
                      </Button>
                      <Button
                        className="bg-red-600 border-none px-6 py-2 mr-2 text-white text-md"
                        onClick={() => {
                          setButtonModalPreview(false);
                        }}
                      >
                        CANCEL
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Dialog>
              {/* END: Modal Content */}

              {/* START count  */}
              {manifestno && (
                <div className="w-full shipmentAccount bg-[#F8FBFE] border border-[#D4E6F8] rounded-lg py-2 px-2 lg:py-6 lg:px-8">
                  <div className="shipmentAccountBoxinn flex justify-between">
                    <div className="shipmentAccountBox flex-wrap md:flex-nowrap    flex flex-col-reverse md:flex-row items-center md:w-[200px] w-[260px]">
                      <div className="text-green-500  font-bold md:leading-6 leading-[15px] text-sm md:text-lg ">
                        Shipments <br />
                        Inscanned
                      </div>

                      <div className="sacountboxx relative w-[80px] md:ml-8 ml-0">
                        <i>
                          <img src={Accountbox} alt="" className="w-[77px] " />
                        </i>
                        <h3 className="absolute top-[8px] left-[30px] text-[#fff] font-bold">
                          {inscannedCount}
                        </h3>
                      </div>
                    </div>

                    <div className="shipmentAccountBox w-[350px] flex items-center relative">
                      <div className="line border border-dashed  border-gray-400 w-full relative">
                        <div
                          className="relative after:content-[''] after:block after:w-[6px] after:h-[1px] after:bg-gray-400 after:absolute after:left-[-2px] after:top-[-2px] after:-rotate-45
before:w-[6px] before:h-[1px] before:bg-gray-400 before:absolute before:left-[-2px] before:top-[2px] before:rotate-45"
                        ></div>

                        <div className="lineright absolute right-[0px] top-[0px]"></div>

                        <div
                          className="relative after:content-[''] after:block after:w-[6px] after:h-[1px] after:bg-gray-400 after:absolute after:right-[-2px] after:top-[-2px] after:rotate-45
before:w-[6px] before:h-[1px] before:bg-gray-400 before:absolute before:right-[-2px] before:top-[1px] before:-rotate-45"
                        ></div>
                      </div>

                      <div className="animationBox">
                        <img
                          src={Boxanimation}
                          alt=""
                          className="w-[24px] h-[24px] absolute "
                        />
                      </div>
                    </div>

                    <div className="shipmentAccountBox  items-center block flex-wrap md:flex md:flex-nowrap md:w-[200px] w-[260px]">
                      <div className="sacountboxx relative w-[80px] ml-3">
                        <i>
                          <img
                            src={Remaingbox}
                            alt=""
                            className="w-[77px] "
                            onClick={manifestRemainingAwbDownload}
                          />
                        </i>
                        <h3 className="absolute top-[8px] left-[30px] text-[#fff] font-bold">
                          {Math.max(0, totalAirbill - inscannedCount)}
                        </h3>
                      </div>

                      <div className="shipmentAccountBox  items-center ml-7 ">
                        <div className="text-blACK-500 md:text-lg text-sm font-bold leading-6 whitespace-nowrap  md:leading-[14px]">
                          Out of {totalAirbill}
                        </div>

                        <div className="text-yellow-500 md:text-[18px]  text-sm  md:leading-6 leading-[14px]">
                          Remaining
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* END count  */}
            </>
          ) : (
            " "
          )}
          <div className="w-full scan bg-[#FFFAEE] border border-[#EEE3C9] rounded-lg py-3 px-3 md:py-6 md:px-8">
            <h2 className="text-lg font-bold mb-2">Airwaybill No.</h2>
            <div className="scanBox md:flex block">
              <div className="scanBoxInput relative p-[1px] overflow-hidden w-full  rounded-[10px]">
                <div className="inputIcon relative">
                  <FormInput
                    type="text"
                    value={value}
                    placeholder="Enter or scan Airwaysbill No."
                    className="rounded-[10px] w-full z-4 relative border border-[#DECDA3] h-[49px] pl-[54px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        directInscan();
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
                  className="border-none btnAnimation overflow-hidden  duration-200  inline-flex items-center justify-center cursor-pointer  bg-mustard text-white  text-xl py-2 px-7 rounded-lg hover:bg-yellow-250 transition uppercase"
                  disabled={!value}
                  onClick={() => {
                    directInscan();
                  }}
                >
                  <Scan className="mr-2 w-[18px]" /> inscan
                  {spinner && <LoadingIcon icon="puff" className="ml-2" />}
                </Button>
                <Button
                  className="border-none  btnAnimation overflow-hidden  duration-200  inline-flex items-center justify-center cursor-pointer  bg-mustard text-white text-xl py-2 px-7 rounded-lg hover:bg-yellow-250 transition uppercase ml-2"
                  onClick={() => {
                    if (!value) {
                      showAlert("Airwaybill No is required!", "warning");
                      setOpenModal(false);
                    } else {
                      setOpenModal(true);
                    }
                  }}
                >
                  <Box className="mr-2 w-[18px]" /> hold
                </Button>
              </div>
            </div>
          </div>

          {showSection ? (
            <div className="mt-8">
              <div className=" w-full ">
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
                          AIRWAYBILL NO.
                        </Table.Th>
                        <Table.Th className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-end">
                          <i className="inline-block  relative top-[4px] mr-1">
                            <img
                              src={Weight}
                              alt=""
                              className="w-[19px] h-[19px] "
                            />
                          </i>
                          WEIGHT
                        </Table.Th>

                        {/* <Table.Th className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-center">
                          <i className="inline-block  relative top-[0px] mr-1">
                            <img
                              src={Action}
                              alt=""
                              className="w-[14px] h-[14px]"
                            />
                          </i>
                          ACTION
                        </Table.Th> */}
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
                            {item.weight}
                          </Table.Td>
                          {/* <Table.Td className=" rounded-tl-sm border-b border-r border-[#EEEEEE] text-[#000] py-[9px] px-[18px] text-lg uppercase text-center">
                            <Button
                            onClick={() =>
                              handleDelete(item?.airwaybill_no, showDispatch)
                            }
                          >
                            <Trash2 className="text-red-500" />
                          </Button>
                          </Table.Td> */}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end mt-6 text-lg ">
                <h2>
                  Total weight : <strong>{totalWeight} k.g</strong>
                </h2>
              </div>
              <div className="flex justify-end">
                {shortShipment ? (
                  <Button
                    className="bg-yellow-300 border-none px-6 py-2 mt-4 text-white text-xl"
                    onClick={() => {
                      setButtonModalPreview(true);
                    }}
                  >
                    DONE
                  </Button>
                ) : (
                  <Button
                    className="bg-yellow-300 border-none px-6 py-2 mt-4 text-white text-xl"
                    onClick={() => {
                      setShowSection(false);
                      setShowTableList([]);
                      setButtonModalPreview(false);
                      setInscannedCount(0);
                    }}
                  >
                    DONE
                  </Button>
                )}
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
            </div>
      <Modal
        open={openModal}
        size="md"
        title="Hold Shipment"
        setOpen={setOpenModal}
        description={description}
        footer={null}
      />
    </>
  );
};

export default Inscan2_0;
