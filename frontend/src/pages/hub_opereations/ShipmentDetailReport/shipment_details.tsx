import React, { useEffect, useState } from "react";

import { ShieldAlert, ClipboardList, Box, User } from "lucide-react";
import {
  Delhi_shipment_count,
  Get_vendor_list,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import TinySlider from "../../../base-components/TinySlider";
import { Wallet } from "lucide-react";
import { X } from "lucide-react";

const shipment_details = () => {
  const { showAlert } = useAlert();
  const [shipmentCount, setShipmentCount] = useState<any>({});
  const [vendorList, setVendorList] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData();
  }, []);

  const totalInscan = shipmentCount?.couriers?.reduce(
    (sum: number, item: any) => sum + Number(item?.inscan_count || 0),
    0
  );

  const totalOutscan = shipmentCount?.couriers?.reduce(
    (sum: number, item: any) => sum + Number(item?.outscan_count || 0),
    0
  );

  // const getData = async () => {
  //   try {
  //     const response = await Delhi_shipment_count();
  //     console.log("shipment count response", response);
  //     if (response.status == 200) {
  //       setShipmentCount(response?.data?.result || {});
  //       await courierData();
  //     } else showAlert(response.data.message, "error");
  //   } catch (error) {
  //     console.log(error);
  //     showAlert("Something went wrong!", "error");
  //   }
  // };

  const getData = async () => {
    try {
      setLoading(true);

      const [shipmentRes, vendorRes] = await Promise.all([
        Delhi_shipment_count(),
        Get_vendor_list(),
      ]);

      if (shipmentRes.status === 200 && vendorRes.status === 200) {
        const shipmentData = shipmentRes?.data?.result || {};
        const vendorData = vendorRes?.data?.data || [];

        const vendorMap = new Map(
          vendorData.map((v: any) => [Number(v.product_id), v.product_name])
        );

        const mergedCouriers = (shipmentData?.couriers || []).map((c: any) => ({
          ...c,
          courier_name:
            vendorMap.get(Number(c.courier_id)) || `Courier ${c.courier_id}`,
        }));

        setShipmentCount({
          ...shipmentData,
          couriers: mergedCouriers,
        });
      }
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  // const courierData = async () => {
  //   try {
  //     const response = await Get_vendor_list();
  //     console.log("vendor list response", response);
  //     if (response.status == 200) {
  //       setVendorList(response.data.data || []);
  //       setShipmentCount((prev: any) => ({
  //         ...prev,
  //         couriers: prev?.couriers?.map((user: any) => {
  //           const match = response?.data?.data?.find(
  //             (item: any) => item?.product_id == user?.courier_id,
  //           );
  //           return { ...user, courier_name: match?.product_name };
  //         }),
  //       }));
  //     } else showAlert(response.data.message, "error");
  //   } catch (error) {
  //     console.log(error);
  //     showAlert("Something went wrong!", "error");
  //   }
  // };

  return (
    <>
      <style>
        {`
          @keyframes softBounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-6px);
            }
          }
          .soft-bounce {
            animation: softBouncee 2.5s ease-in-out infinite;
          }

          @keyframes softBouncee {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-2px);
            }
          }
          .softinscan{
            animation: softBouncee 2.5s ease-in-out infinite;
          }
        `}
      </style>

      {loading ? (
        <div className="p-10 text-center">Loading...</div>
      ) : (

        <div className="m-0">
          <TinySlider
            options={{
              controls: false, // ❌ remove arrows
              nav: false, // ❌ remove dots (optional)
              autoplay: true, // ✅ auto slide
              autoplayTimeout: 60000, // ⏱ 1 Minute
              autoplayHoverPause: true,
              mouseDrag: true,
              loop: true,
              speed: 500,
              gutter: 30,
            }}
          >
            <div className=" w-full">
              <div className="w-full mt-4">
                <div className="grid grid-cols-12 gap-[20px] w-full">
                  <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <div className="w-full  bg-[#d8def0]  rounded-[20px] overflow-hidden relative p-[2px] mb-2">
                      <div className="absolute inset-[-100%] animate-[spin_8s_linear_infinite] hover:[animation-play-state:paused]">
                        <div
                          className="h-full w-full
                       bg-[conic-gradient(#d8def0,#f9cd73_4%,#d8def0_20%,#d8def0_95%)]
                       [mask:linear-gradient(#d8def0_0_0)_content-box,linear-gradient(#d8def0_0_0)]
                       [mask-composite:exclude]
                       p-[5px] hover:bg-[conic-gradient(#303030,#303030%,#303030_60%,#303030_95%)]"
                        ></div>
                      </div>

                      <div className="   w-full px-5 pt-5 pb-3  bg-[#fff] min-h-[161px] z-[2] relative rounded-[20px]">
                        <div className=" w-full   mt-1 pl-2 text-center   ">
                          <div className="text-[#df6d6d] text-[30px] font-bold  uppercase l mb-3  tracking-[1px]">
                            {shipmentCount?.total_booking_from_feb || 0}
                          </div>

                          <h2 className="text-[#303030] text-[17px]   leading-[21px] group-hover:text-[#f75656] ">
                            Total Bookings
                          </h2>
                        </div>

                        <div className="  flex items-center justify-start rounded-full  z-[5] mt-1 absolute bottom-[17px] left-[10px]">
                          <figure
                            className=" relative rounded-full flex items-center justify-center opacity-80 before:content-[''] before:absolute before:top-0 before:left-0
                   before:w-[80px] before:h-[80px] before:bg-[#ffbaba]/90 before:rounded-full before:blur-lg"
                          >
                            <Box className="text-[#d55b5b] w-[50px] h-[40px] relative z-[3] soft-bounce" />
                          </figure>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <div className="w-full bg-[#d8def0]  rounded-[20px] overflow-hidden relative p-[2px] mb-2">
                      <div className="absolute inset-[-100%] animate-[spin_8s_linear_infinite] hover:[animation-play-state:paused]">
                        <div
                          className="h-full w-full
                       bg-[conic-gradient(#d8def0,#f9cd73_4%,#d8def0_20%,#d8def0_95%)]
                       [mask:linear-gradient(#d8def0_0_0)_content-box,linear-gradient(#d8def0_0_0)]
                       [mask-composite:exclude]
                       p-[5px] hover:bg-[conic-gradient(#303030,#303030%,#303030_60%,#303030_95%)]"
                        ></div>
                      </div>

                      <div className="   w-full px-5 pt-5 pb-3  bg-[#fff] min-h-[161px] z-[2] relative rounded-[20px]">
                        <div className=" w-full   mt-1 pl-2 text-center   ">
                          <div className="text-mustard text-[30px] font-bold  uppercase l mb-3  tracking-[1px]">
                            {shipmentCount?.total_todays_booking || 0}
                          </div>

                          <h2 className="text-[#303030] text-[17px]   leading-[21px] group-hover:text-[#f75656] ">
                            Total Todays <br /> Bookings
                          </h2>
                        </div>
                        <div className="  flex items-center justify-start rounded-full  z-[5] mt-1 absolute bottom-[17px] left-[10px]">
                          <figure
                            className=" relative rounded-full flex items-center justify-center opacity-80 before:content-[''] before:absolute before:top-0 before:left-0
                   before:w-[80px] before:h-[80px] before:bg-[#ffdfa0]/90 before:rounded-full before:blur-lg"
                          >
                            <ClipboardList className="text-[#e8b455] w-[50px] h-[40px] relative z-[3] soft-bounce" />
                          </figure>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <div className="w-full bg-[#d8def0]  rounded-[20px] overflow-hidden relative p-[2px] mb-2">
                      <div className="absolute inset-[-100%] animate-[spin_8s_linear_infinite] hover:[animation-play-state:paused]">
                        <div
                          className="h-full w-full
                       bg-[conic-gradient(#d8def0,#f9cd73_4%,#d8def0_20%,#d8def0_95%)]
                       [mask:linear-gradient(#d8def0_0_0)_content-box,linear-gradient(#d8def0_0_0)]
                       [mask-composite:exclude]
                       p-[5px] hover:bg-[conic-gradient(#303030,#303030%,#303030_60%,#303030_95%)]"
                        ></div>
                      </div>

                      <div className="   w-full px-5 pt-5 pb-3  bg-[#fff] min-h-[161px] z-[2] relative rounded-[20px]">
                        <div className=" w-full   mt-1 pl-2 text-center   ">
                          <div className="text-[#4b82bd] text-[30px] font-bold  uppercase l mb-3  tracking-[1px]">
                            {/* {shipmentCount?.total_held_up_booking || 0} */}
                            {shipmentCount?.total_held_up_booking > 0
                              ? shipmentCount?.total_held_up_booking
                              : "0"}
                          </div>

                          <h2 className="text-[#303030] text-[17px]   leading-[21px] group-hover:text-[#f75656] ">
                            Todays <br /> Held up Shipment
                          </h2>
                        </div>
                        <div className="  flex items-center justify-start rounded-full  z-[5] mt-1 absolute bottom-[17px] left-[10px]">
                          <figure
                            className=" relative rounded-full flex items-center justify-center opacity-80 before:content-[''] before:absolute before:top-0 before:left-0
                   before:w-[80px] before:h-[80px] before:bg-[#dceaf9]/90 before:rounded-full before:blur-lg"
                          >
                            <ShieldAlert className="text-[#4b82bd] w-[50px] h-[40px] relative z-[3] soft-bounce" />
                          </figure>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full mt-1">
                <div className="grid grid-cols-12 gap-[15px] w-full">
                  <div className="col-span-12 lg:col-span-6">
                    <div className="mt-1  w-full py-2  px-2 bg-white rounded-lg shadow-lg">
                      <div className="w-full relative overflow-hidden  rounded-[11px] p-2   bg-white  ">
                        <div className=" flex-1 mb-[10px] shadow-[0_0px_8px_#f1f1f1] hover:bg[#fff0d3] rounded-[10px] border-[2px] border-[#fff] transition-colors duration-300">
                          <button className="cursor-pointer bg-[#F1F5F9] w-full py-2 px-3 rounded-[10px] flex items-center">
                            <i className="px-2 py-[5px] w-[45px]  h-[40px] rounded-[10px] bg-[#fff] flex items-center justify-center">
                              <img
                                src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/inscan_shipment.png"
                                alt="export"
                                className=" w-[30px] softinscan"
                              />
                            </i>

                            <p className="m-0 uppercase font-bold text-[17px] ml-[12px] intro-x">
                              Today Integrator Wise Inscans
                            </p>
                          </button>
                        </div>

                        <div className="w-full">
                          <div className="overflow-y-auto max-h-[300px] pr-[10px]">
                            <table className="border text-left w-full border-[#fff] border-separate border-spacing-y-0 flow-table">
                              <tbody>
                                <tr className="border p-1   intro-x">
                                  <td className="border-y border-l bg-[#f0f0f0] border-[#d6e0ea] px-3 py-2  text-[#303030] text-[13px] rounded-tl-lg">
                                    Period 12.00 PM - 12.00 AM
                                  </td>
                                  <td className="border-y border-r bg-[#f0f0f0] border-l border-[#d6e0ea] px-3 py-2 font-bold text-[#303030] text-[17px] text-right  rounded-tr-lg"></td>
                                </tr>

                                {shipmentCount?.couriers?.map(
                                  (val: any, index: number) => {
                                    return (
                                      <tr
                                        key={index}
                                        className="border p-1 group odd:bg-[#fff] even:bg-[#F7F9FB] hover:bg-[#FFF6D8]"
                                      >
                                        <td className="border-b border-l border-[#D6E0EA] px-3 py-2 text-[#303030] text-[17px] font-bold">
                                          {val?.courier_name}
                                        </td>
                                        <td className="border-b border-r border-l border-[#D6E0EA] px-3 py-2 font-bold text-[#303030] text-[17px] text-right">
                                          {val?.inscan_count}
                                        </td>
                                      </tr>
                                    );
                                  }
                                )}
                              </tbody>
                              <tfoot className="sticky bottom-0 ">
                                <tr className="border p-1 text-sm  font-bold intro-x">
                                  <td className="border-b border-l border-mustard px-3 py-2 rounded-bl-lg text-[17px] bg-mustard text-white">
                                    Total
                                  </td>
                                  <td className="border-b border-r border-l border-mustard px-3 py-2 text-right rounded-br-lg text-[17px] bg-mustard  text-white">
                                    {totalInscan || 0}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <div className="mt-1  w-full py-2  px-2 bg-white rounded-lg shadow-lg">
                      <div className="w-full relative overflow-hidden  rounded-[11px] p-2   bg-white  ">
                        <div className=" flex-1 mb-[10px] shadow-[0_0px_8px_#f1f1f1] hover:bg[#fff0d3] rounded-[10px] border-[2px] border-[#fff] transition-colors duration-300">
                          <button className="cursor-pointer bg-[#F1F5F9] w-full py-2 px-3 rounded-[10px] flex items-center">
                            <i className="px-2 py-[5px] w-[45px]  h-[40px] rounded-[10px] bg-[#fff] flex items-center justify-center">
                              <img
                                src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/outscantable.png"
                                alt="export"
                                className=" w-[30px] softinscan"
                              />
                            </i>

                            <p className="m-0 uppercase font-bold text-[17px] ml-[12px] intro-x">
                              Today Integrator Wise Outscans
                            </p>
                          </button>
                        </div>

                        <div className="w-full">
                          <div className="overflow-y-auto max-h-[300px] pr-[10px]">
                            <table className="border text-left w-full border-[#fff] border-separate border-spacing-y-0 flow-table">
                              <tbody>
                                <tr className="border p-1   intro-x">
                                  <td className="border-y border-l bg-[#f0f0f0] border-[#d6e0ea] px-3 py-2  text-[#303030] text-[13px] rounded-tl-lg">
                                    Period 12.00 PM - 12.00 AM
                                  </td>
                                  <td className="border-y border-r bg-[#f0f0f0] border-l border-[#d6e0ea] px-3 py-2 font-bold text-[#303030] text-[17px] text-right  rounded-tr-lg"></td>
                                </tr>

                                {shipmentCount?.couriers?.map(
                                  (val: any, index: number) => {
                                    return (
                                      <tr
                                        key={index}
                                        className="border p-1 group odd:bg-[#fff] even:bg-[#F7F9FB] hover:bg-[#FFF6D8]"
                                      >
                                        <td className="border-b border-l border-[#D6E0EA] px-3 py-2 text-[#303030] text-[17px] font-bold">
                                          {val?.courier_name}
                                        </td>
                                        <td className="border-b border-r border-l border-[#D6E0EA] px-3 py-2 font-bold text-[#303030] text-[17px] text-right">
                                          {val?.outscan_count}
                                        </td>
                                      </tr>
                                    );
                                  }
                                )}
                              </tbody>
                              <tfoot className="sticky bottom-0 ">
                                <tr className="border p-1 text-sm  font-bold intro-x">
                                  <td className="border-b border-l border-mustard px-3 py-2 rounded-bl-lg text-[17px] bg-mustard text-white">
                                    Total
                                  </td>
                                  <td className="border-b border-r border-l border-mustard px-3 py-2 text-right rounded-br-lg text-[17px] bg-mustard  text-white">
                                    {totalOutscan || 0}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className=" w-full">
              <div className="w-full mt-7">
                <div className="bg-[#FFD9D9] rounded-lg p-2  relative flex items-center ">
                  <i className="w-[35px] ">
                    <img
                      src={
                        "https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/alerticon.png"
                      }
                      alt=""
                      className="w-[32px] soft-bounce"
                    />
                  </i>

                  <p className="ml-2 leading-[16px] font-base w-[94%] ">
                    This compliance screen identifies prohisted actions,
                    restriities, and illegal goods based on regulatory requirments
                    standards. All shipments must pas compliance checks before
                    processing.
                  </p>
                </div>

                <div className="w-full mt-5">
                  <div className="grid grid-cols-12 gap-[14px] w-full">
                    <div className="col-span-12 lg:col-span-6">
                      <div className="bg-[#fff] rounded-lg p-5  relative mb-3 h-full overflow-hidden group">
                        <div className="  flex items-center justify-start rounded-full  z-[5] mt-1 absolute top-[13px] right-[28px]  ">
                          <figure
                            className=" relative rounded-full flex items-center justify-center opacity-80 before:content-[''] before:absolute before:top-0 before:left-0
                   before:w-[40px] before:h-[40px] before:bg-[#ffbaba]/90 before:rounded-full before:blur-lg"
                          >
                            <img
                              src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/ban.png"
                              alt=""
                              className="w-[32px] soft-bounce"
                            />
                          </figure>
                        </div>

                        <div className=" mb-4 relative flex  pr-[60px]">
                          <div className=" z-10">
                            <div className=" bg-[#efb847] w-[26px] h-[26px] rounded-full p-[2px]  relative z-10 flex justify-center  font-bold text-white">
                              1
                            </div>
                            <span className="absolute top-[3px] left-[2px] inline-flex h-[21px]  w-[21px] animate-ping rounded-full bg-[#efb847] opacity-85 [animation-duration:3s]"></span>
                          </div>

                          <h2 className="text-lg font-bold text-[#000] ml-3 leading-[24px]">
                            Restricted Parties & Entities
                          </h2>
                        </div>

                        <div className=" pt-2  relative flex  ">
                          <i className="">
                            <X className="text-red-500" />
                          </i>
                          <aside className="ml-2">
                            <p className="text-[14px] leading-[19px] text-justify text-[#4f4f4f]">
                              SDN / Denied <strong>Parties</strong> - Shipping
                              to/rom indviduals, compatias, or ornpaties on
                              govanlement watchlists (OFAC SDN, BIS Entity List,
                              Denied Persons List)
                            </p>
                          </aside>
                        </div>

                        <div className=" pt-2  relative flex  ">
                          <i className="">
                            <X className="text-red-500" />
                          </i>
                          <aside className="ml-2">
                            <p className="text-[14px] leading-[19px] text-justify text-[#4f4f4f]">
                              <strong>Sanctioned Locations</strong> - Transporting
                              goods to/from/Via countties under coure total or
                              partial ernbogies Embages (UN, EU, USA sanctions)
                            </p>
                          </aside>
                        </div>

                        <div className="absolute bottom-[-80px]  right-[0px] z-98 hidden group-hover:block">
                          <img
                            src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/dottedbg.gif"
                            alt=""
                            className=" w-[390px] h-[200px]  [filter:sepia(2)_saturate(173)_hue-rotate(1031deg)] rotate-[-10deg]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-6">
                      <div className="bg-[#fff] rounded-lg p-5  relative mb-3  h-full group  overflow-hidden">
                        <div className="  flex items-center justify-start rounded-full  z-[5] mt-1 absolute top-[13px] right-[28px]">
                          <figure
                            className=" relative rounded-full flex items-center justify-center opacity-80 before:content-[''] before:absolute before:top-0 before:left-0
                   before:w-[40px] before:h-[40px] before:bg-[#ffbaba]/90 before:rounded-full before:blur-lg"
                          >
                            <img
                              src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/prohibited.png"
                              alt=""
                              className="w-[37px] soft-bounce"
                            />
                          </figure>
                        </div>

                        <div className=" mb-4 relative flex  pr-[60px]">
                          <div className=" z-10">
                            <div className=" bg-[#efb847] w-[26px] h-[26px] rounded-full p-[2px]  relative z-10 flex justify-center  font-bold text-white">
                              2
                            </div>
                            <span className="absolute top-[3px] left-[2px] inline-flex h-[21px]  w-[21px] animate-ping rounded-full bg-[#efb847] opacity-85 [animation-duration:3s]"></span>
                          </div>

                          <h2 className="text-lg font-bold text-[#000] ml-3">
                            Prohibited or Restricted Cargo
                          </h2>
                        </div>

                        <div className=" pt-2  relative flex  ">
                          <i className="">
                            <X className="text-red-500" />
                          </i>
                          <aside className="ml-2">
                            <p className="text-[14px] leading-[19px] text-justify text-[#4f4f4f]">
                              <strong>Illegal Goods</strong> - Contarba it goods
                              Duak-use, miitary, or high-tech items without
                              without proper licenses
                            </p>
                          </aside>
                        </div>

                        <div className=" pt-2  relative flex  ">
                          <i className="">
                            <X className="text-red-500" />
                          </i>
                          <aside className="ml-2">
                            <p className="text-[14px] leading-[19px] text-justify text-[#4f4f4f]">
                              <strong> Unpported Hazarous Materials</strong>{" "}
                              Dangerous goods not properly packaged, pakaged, or
                              classified per IATA DGR or ADR/RID labor
                            </p>
                          </aside>
                        </div>

                        <div className="absolute bottom-[-80px]  right-[0px] z-98 hidden group-hover:block">
                          <img
                            src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/dottedbg.gif"
                            alt=""
                            className=" w-[390px] h-[200px]  [filter:sepia(2)_saturate(173)_hue-rotate(1031deg)] rotate-[-10deg]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-6">
                      <div className="bg-[#fff] rounded-lg p-5  relative mb-3 h-full group  overflow-hidden">
                        <div className="  flex items-center justify-start rounded-full  z-[5] mt-1 absolute top-[13px] right-[28px]">
                          <figure
                            className=" relative rounded-full flex items-center justify-center opacity-80 before:content-[''] before:absolute before:top-0 before:left-0
                   before:w-[40px] before:h-[40px] before:bg-[#ffbaba]/90 before:rounded-full before:blur-lg"
                          >
                            <img
                              src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/non_complaint.png"
                              alt=""
                              className="w-[32px] soft-bounce"
                            />
                          </figure>
                        </div>

                        <div className=" mb-4 relative flex pr-[60px]">
                          <div className=" z-10">
                            <div className=" bg-[#efb847] w-[26px] h-[26px] rounded-full p-[2px]  relative z-10 flex justify-center  font-bold text-white">
                              3
                            </div>
                            <span className="absolute top-[3px] left-[2px] inline-flex h-[21px]  w-[21px] animate-ping rounded-full bg-[#efb847] opacity-85 [animation-duration:3s]"></span>
                          </div>

                          <h2 className="text-lg font-bold text-[#000] ml-3 leading-[24px]">
                            Non-Compliant Documentation Procedures
                          </h2>
                        </div>

                        <div className=" pt-2  relative flex  ">
                          <i className="">
                            <X className="text-red-500" />
                          </i>
                          <aside className="ml-2">
                            <p className="text-[14px] leading-[19px] text-justify text-[#4f4f4f]">
                              <strong>Incorrect Declarations</strong> - Vague
                              cargo descriptions like "parte or equipment without
                              certificates of origin, safety sheets, or health
                              certificates
                            </p>
                          </aside>
                        </div>

                        <div className=" pt-2  relative flex  ">
                          <i className="">
                            <X className="text-red-500" />
                          </i>
                          <aside className="ml-2">
                            <p className="text-[14px] leading-[19px] text-justify text-[#4f4f4f]">
                              Trade Agreement Violations, Falsy claming FTA
                              eligibility
                            </p>
                          </aside>
                        </div>

                        <div className=" pt-2  relative flex  ">
                          <i className="">
                            <X className="text-red-500" />
                          </i>
                          <aside className="ml-2">
                            <p className="text-[14px] leading-[19px] text-justify text-[#4f4f4f]">
                              <strong>Customs Non-Compliance</strong> Failure to
                              comply with ICS2 or intemational trade protocols
                            </p>
                          </aside>
                        </div>
                        <div className="absolute bottom-[-80px]  right-[0px] z-98 hidden group-hover:block">
                          <img
                            src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/dottedbg.gif"
                            alt=""
                            className=" w-[390px] h-[200px] [filter:sepia(2)_saturate(173)_hue-rotate(1031deg)] rotate-[-10deg]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-6">
                      <div className="bg-[#fff] rounded-lg p-5  relative mb-3 h-full group overflow-hidden">
                        <div className="  flex items-center justify-start rounded-full  z-[5] mt-1 absolute top-[13px] right-[28px]">
                          <figure
                            className=" relative rounded-full flex items-center justify-center opacity-80 before:content-[''] before:absolute before:top-0 before:left-0
                   before:w-[40px] before:h-[40px] before:bg-[#ffbaba]/90 before:rounded-full before:blur-lg"
                          >
                            <img
                              src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/safety_violations.png"
                              alt=""
                              className="w-[32px] soft-bounce"
                            />
                          </figure>
                        </div>

                        <div className=" mb-4 relative flex  pr-[60px]">
                          <div className=" z-10">
                            <div className=" bg-[#efb847] w-[26px] h-[26px] rounded-full p-[2px]  relative z-10 flex justify-center  font-bold text-white">
                              4
                            </div>
                            <span className="absolute top-[3px] left-[2px] inline-flex h-[21px]  w-[21px] animate-ping rounded-full bg-[#efb847] opacity-85 [animation-duration:3s]"></span>
                          </div>
                          <h2 className="text-lg font-bold text-[#000] ml-3 leading-[24px]">
                            Operational & Safety Violations Violations
                          </h2>
                        </div>

                        <div className=" pt-2  relative flex  ">
                          <i className="">
                            <X className="text-red-500" />
                          </i>
                          <aside className="ml-2">
                            <p className="text-[14px] leading-[19px] text-justify text-[#4f4f4f]">
                              <strong>Driver/Vehicle Mieaoudet</strong> -
                              Operating without necesses or violaiing Hounsies of
                              Service (HOS) Hosding temperature parsnters (GP/FDA
                              violations)
                            </p>
                          </aside>
                        </div>

                        <div className=" pt-2  relative flex  ">
                          <i className="">
                            <X className="text-red-500" />
                          </i>
                          <aside className="ml-2">
                            <p className="text-[14px] leading-[19px] text-justify text-[#4f4f4f]">
                              <strong>Data Security Breaches</strong> -
                              Pharmackalas or persihables execding Handing
                              personal/shipnent data .. GDDR Practices... FCPA or
                              UK Bribey Act
                            </p>
                          </aside>
                        </div>
                        <div className="absolute bottom-[-80px]  right-[0px] z-98 hidden group-hover:block">
                          <img
                            src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/dottedbg.gif"
                            alt=""
                            className=" w-[390px] h-[200px]  [filter:sepia(2)_saturate(173)_hue-rotate(1031deg)] rotate-[-10deg]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-12">
                      <div className="bg-[#fff] rounded-lg p-5  relative mb-3 h-full ">
                        <div className="  flex items-center justify-start rounded-full  z-[5] mt-1 absolute top-[13px] right-[28px]">
                          <figure
                            className=" relative rounded-full flex items-center justify-center opacity-80 before:content-[''] before:absolute before:top-0 before:left-0
                   before:w-[40px] before:h-[40px] before:bg-[#ffbaba]/90 before:rounded-full before:blur-lg"
                          >
                            <img
                              src={
                                "https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/alerticon.png"
                              }
                              alt=""
                              className="w-[32px] soft-bounce"
                            />
                          </figure>
                        </div>

                        <div className=" mb-4 relative flex pr-[60px]">
                          <div className=" z-10">
                            <div className=" bg-[#efb847] w-[26px] h-[26px] rounded-full p-[2px]  relative z-10 flex justify-center items-center font-bold text-white">
                              5
                            </div>
                            <span className="absolute top-[3px] left-[2px] inline-flex h-[21px]  w-[21px] animate-ping rounded-full bg-[#efb847] opacity-85 [animation-duration:3s]"></span>
                          </div>
                          <h2 className="text-lg font-bold text-[#000] ml-3 leading-[24px]">
                            Red Flag Requiring Investigation
                          </h2>
                        </div>

                        <div className="grid grid-cols-12 gap-[10px] ">
                          <div className="col-span-12 lg:col-span-4">
                            <div className="w-full bg-[#f8d7da] rounded-lg p-2 relative overflow-hidden h-[80px] group hover:bg-[#303030]">
                              <div className="w-full relative z-[2] flex items-center">
                                <div className="w-[65px] h-[62px]">
                                  <figure className=" m-auto relative w-[60px] h-[60px] rounded-full flex items-center justify-center bg-[#fff] ">
                                    <Wallet className="text-[#efb847] w-[34px] h-[34px] group-hover:text-[#808080]" />
                                  </figure>
                                </div>

                                <h2 className="text-lg font-bold text-[#fff] ml-3 leading-[22px] group-hover:text-[#fff]">
                                  Unusual Payment <br /> Methods
                                </h2>
                              </div>
                              <figure className="absolute top-[0px] left-[0px] right-[0px]">
                                <img
                                  src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/additional_bg.gif"
                                  alt=""
                                  className="w-full h-[100px] group-hover:filter group-hover:grayscale rounded-lg group-hover:opacity-70"
                                />
                              </figure>
                            </div>
                          </div>

                          <div className="col-span-12 lg:col-span-4">
                            <div className="w-full bg-[#139389] rounded-lg p-2 relative overflow-hidden h-[80px] group hover:bg-[#303030]">
                              <div className="w-full relative z-[2] flex items-center">
                                <div className="w-[65px] h-[62px]">
                                  <figure className=" m-auto relative w-[60px] h-[60px] rounded-full flex items-center justify-center bg-[#fff] ">
                                    <Box className="text-[#11bcb0] w-[36px] h-[36px] group-hover:text-[#808080]" />
                                  </figure>
                                </div>

                                <h2 className="text-lg font-bold text-[#fff] ml-3 leading-[22px]">
                                  Illogical Shipment <br /> Routes
                                </h2>
                              </div>
                              <figure className="absolute top-[0px] left-[0px] right-[0px] opacity-80">
                                <img
                                  src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/additional_bg.gif"
                                  alt=""
                                  className="w-full h-[100px] group-hover:filter group-hover:grayscale rounded-lg filter hue-rotate-[120deg] group-hover:opacity-70"
                                />
                              </figure>
                            </div>
                          </div>

                          <div className="col-span-12 lg:col-span-4">
                            <div className="w-full bg-[#0a6c15] rounded-lg p-2 relative overflow-hidden h-[80px] group hover:bg-[#303030]">
                              <div className="w-full relative z-[2] flex items-center">
                                <div className="w-[65px] h-[62px]">
                                  <figure className=" m-auto relative w-[60px] h-[60px] rounded-full flex items-center justify-center bg-[#fff] ">
                                    <User className="text-[#0cb31f] w-[34px] h-[34px] group-hover:text-[#808080]" />
                                  </figure>
                                </div>

                                <h2 className="text-lg font-bold text-[#fff] ml-3 leading-[22px] group-hover:text-[#fff]">
                                  Unfamiliar Customer
                                </h2>
                              </div>
                              <figure className="absolute top-[0px] left-[0px] right-[0px] opacity-80">
                                <img
                                  src="https://skartnew-prod.s3.ap-southeast-1.amazonaws.com/others/additional_bg.gif"
                                  alt=""
                                  className="w-full h-[100px] group-hover:filter group-hover:grayscale rounded-lg filter hue-rotate-[430deg] group-hover:opacity-70"
                                />
                              </figure>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TinySlider>
        </div>
      )}
    </>
  );
};

export default shipment_details;
