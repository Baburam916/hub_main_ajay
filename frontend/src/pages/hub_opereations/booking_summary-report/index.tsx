import React, { useEffect, useState } from "react";
import { Calendar, Search, User } from "lucide-react";
import {
  BookingDirectParty,
  BookingPartySummary,
  BookingTracking,
  Booking_summary_country_report,
  Booking_summary_courier_report,
  Booking_summary_hubpud_report,
  Booking_summary_report,
  Booking_summary_salesperson_report,
} from "../../../AllServices/services";
import CommonPagination from "../../../components/Pagination";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { FormInput, FormLabel } from "../../../base-components/Form";
import { formatDate } from "../../../utils";
import LoadingIcon from "../../../base-components/LoadingIcon";
import Button from "../../../base-components/Button";
import ReportCommonTable from "../../../components/booking_summary_table/Reportscommontable";
import { tranfereddata } from "../../../components/booking_summary_table/TransformKey";

const initialdata = {
  from_date: 0,
  to_date: "",
  franchisee_id: "",
  status: "",
};

const CustwisebookingReport: React.FC = () => {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [type, setType] = useState<any>(0);
  const [courierdata, setCourierdata] = useState<any>([]);
  const [maindata, setMaindata] = useState<any>([]);
  console.log("Maindata", maindata);
  const [postisLoading, setPostisLoading] = useState<any>(false);
  const [initialdatatoget, setInitialdatatoget] = useState<any>(initialdata);
  const [countrydata, setCountryData] = useState<any>([]);
  const [salesperson, setSalesperson] = useState<any>([]);
  const [puddata, setPuddata] = useState<any>([]);
  const [trackerdata, setTrackerdata] = useState<any>([]);
  const [selectedId, setSelectedId] = useState<any>("");
  //   console.log(hubId,'hubId')
  const [datatoselect, setDatatoSelect] = useState<any>([]);
  const { showAlert } = useAlert();
  const [bookingData, setBookingData] = useState<boolean>(true);

  const [downloaddata, setDownloaddata] = useState<any>([]);
  const onPageChange = (page: number) => {
    setPage(page - 1);
  };
  // const handlerefresh = () => {
  //   fetchData();
  // };

  useEffect(() => {
    if (page >= 1) {
      handleSubmit(1);
    }
  }, [page]);
  useEffect(() => {
    getfranchisees();
  }, []);
  const getfranchisees = async () => {
    try {
      //       const response = await commongetrequest("admin/franchisee-settings");
      //       const response2 = await commongetrequest("admin/country");
      //       const response3 = await commongetrequest("admin/courier-product");
      //       const response4 = await commongetrequest("admin/hub-pud");
      // const response5 = await commongetrequest("admin/sales-person");
      const response = await Booking_summary_report();
      const response2 = await Booking_summary_country_report();
      const response3 = await Booking_summary_courier_report();
      const response4 = await Booking_summary_hubpud_report();
      const response5 = await Booking_summary_salesperson_report();
      if (response?.status == 200 || response?.status == 204) {
        const data = response?.data?.data;
        const newdata = data?.map((item: any) => ({
          id: item?.franchisee_id,
          name: item?.franchisee_name,
          sales_person: item?.sales_person,
          ba_code: item?.ba_code,
        }));
        setDatatoSelect(newdata || []);
      }
      if (response2?.status == 200) {
        setCountryData(response2?.data?.data || []);
      }
      if (response3?.status == 200) {
        // console.log(response3,"response3")
        setCourierdata(response3?.data?.data || []);
      }
      if (response4?.status == 200) {
        setPuddata(response4?.data?.data || []);
      }
      if (response5?.status == 200) {
        setSalesperson(response5?.data?.data || []);
      } else {
        showAlert("Something going wrong!..", "error");
      }
    } catch (err: any) {
      console.log(err, "error");
    }
  };
  const findfranchisename = (id?: any) => {
    const newdata = datatoselect?.find((item: any) => item.id == id);
    return newdata;
  };
  const getsalesperson = (id?: any) => {
    const data = findfranchisename(id);
    if (data) {
      // console.log(data,"franchisedata")
      const newdata = salesperson?.find(
        (item?: any) => item?.id == data?.sales_person,
      );
      return newdata;
    }
  };
  const calculateTotalInrAmount = (data?: any) => {
    const sum = data.reduce(
      (total?: any, item?: any) => total + item.inr_amount,
      0,
    );
    return (sum + sum * 0.18).toFixed(3);
  };
  const profit = (buydata?: any, selldata?: any) => {
    const buysum = buydata.reduce(
      (total?: any, item?: any) => total + item.inr_amount,
      0,
    );
    const sellsum = selldata.reduce(
      (total?: any, item?: any) => total + item.inr_amount,
      0,
    );
    //  console.log(sellsum,buysum)
    //    console.log(sellsum + (sellsum * 0.18) , (buysum + (buysum * 0.18)));
    //  console.log(((sellsum + (sellsum * 0.18))- (buysum +( buysum * 0.18))));
    return sellsum + sellsum * 0.18 - (buysum + buysum * 0.18);
  };
  //   const gettrakingdata=async(awb?:any)=>{
  //     try{
  // const res=await commongetrequest(`track_shipment/track-shipment/${awb.trim()}`)

  // if(res?.status==200){
  //   const data=res?.data?.data||[]
  //   const newdata=data?.find((item?:any)=>item?.status_code==210)
  //   return newdata
  // }
  //     }catch(error:any){
  //       showAlert(error.message,"error")
  //     }
  //   }
  const findbuyrelateddata = (forwhat?: any, data?: any) => {
    if (forwhat == "freightbuy") {
      // console.log(forwhat,"forwh")

      const newdata = data.find((item?: any) => item.charges_id == 2);
      // console.log(newdata,"newdata")
      return newdata;
    } else if (forwhat == "freightsell") {
      const newdata = data.find((item?: any) => item.charges_id == 1);
      // console.log(newdata,"sellfreight")
      return newdata;
    } else if (forwhat == "fscbuy") {
      const newdata = data.find((item?: any) => item.charges_id == 29);

      return newdata;
    } else if (forwhat == "fscsell") {
      const newdata = data.find((item?: any) => item.charges_id == 28);

      return newdata;
    } else if (forwhat == "emergencybuy") {
      const newdata = data.find((item?: any) => item.charges_id == 8);

      return newdata;
    } else if (forwhat == "emergencysell") {
      const newdata = data.find((item?: any) => item.charges_id == 7);

      return newdata;
    } else if (forwhat == "clearncebuy") {
      const newdata = data.find((item?: any) => item.charges_id == 35);

      return newdata;
    } else if (forwhat == "clearncesell") {
      const newdata = data.find((item?: any) => item.charges_id == 34);

      return newdata;
    } else if (forwhat == "otherchargesbuy") {
      const sum = data
        .filter((item) => ![8, 29, 2, 35].includes(item.charges_id))
        .reduce((total, item) => total + item.inr_amount, 0);
      return sum.toFixed(2);
    } else if (forwhat == "otherchargessell") {
      const sum = data
        .filter((item) => ![1, 28, 7, 34].includes(item.charges_id))
        .reduce((total, item) => total + item.inr_amount, 0);
      return sum.toFixed(2);
    } else if (forwhat == "gstonbuy") {
      const sum = data.reduce((total, item) => total + item?.total_amount, 0);
      return (sum * (18 / 100)).toFixed(2);
    } else if (forwhat == "gstonsell") {
      const sum = data.reduce((total, item) => total + item?.total_amount, 0);
      return (sum * (18 / 100)).toFixed(2);
    }
  };
  const findcoutry = (id?: any) => {
    const newdata = countrydata.find((item: any) => item?.country_id == id);
    return newdata;
  };
  const findcourier = (id?: any) => {
    const newdata = courierdata?.find((item?: any) => item?.product_id == id);
    // console.log(newdata,id,"id","newdata")
    return newdata;
  };
  const getbranchdata = (id?: any) => {
    const newdata = puddata?.find((item?: any) => item?.branch_id == id);
    return newdata;
  };
  const gettrackingdata = (awbno?: any, trackingdata?: any) => {
    // console.log(awbno,trackingdata,"alldatacming")
    const newdata = trackingdata?.find(
      (item?: any) => item?.airwaybill_no == awbno,
    );
    return newdata;
  };
  const getchangedata = (data?: any, trackingdata?: any) => {
    const newdata = data?.map((item: any) => ({
      airwaybilno: item.airwaybilno,
      skart_awb_number: item.skyway_airwaybilno,
      franchisee_code:
        findfranchisename(item.pickup_franchisee_id)?.ba_code || "",
      franchisee_name: findfranchisename(item.pickup_franchisee_id)?.name,
      booking_entity: item.is_walkin || "",
      consignee_name: item.consignee_name,
      consignee_no: item.consignee_mobile_number,
      product_description: item.product_description,
      actual_weight: item.actual_weight,
      quantity: item.number_of_pieces,
      shipment_purpose: item?.shipment_purpose || "",

      product_value: item?.product_value,
      collectable_value: item?.collectable_value,
      Vendor: findcourier(item?.courier_id)?.product_name || "",
      buy_freight:
        findbuyrelateddata("freightbuy", item?.buying_data)?.inr_amount || 0,
      sell_freight:
        findbuyrelateddata("freightsell", item?.selling_data)?.inr_amount || 0,
      fsc_on_buy:
        findbuyrelateddata("fscbuy", item?.buying_data)?.inr_amount || 0,
      fsc_on_sell:
        findbuyrelateddata("fscsell", item?.selling_data)?.inr_amount || 0,
      emergency_charges_buy:
        findbuyrelateddata("emergencybuy", item?.buying_data)?.inr_amount || 0,
      clearance_charges_buy:
        findbuyrelateddata("clearncebuy", item?.buying_data)?.inr_amount || 0,
      emergency_charges_sell:
        findbuyrelateddata("emergencysell", item?.selling_data)?.inr_amount ||
        0,

      custom_clearnce_sell:
        findbuyrelateddata("clearncesell", item?.selling_data)?.inr_amount || 0,
      other_charges_buy:
        findbuyrelateddata("otherchargesbuy", item?.buying_data) || 0,
      other_charges_sell:
        findbuyrelateddata("otherchargessell", item?.selling_data) || 0,
      gst_on_buy: findbuyrelateddata("gstonbuy", item?.buying_data) || "",
      gst_on_sell: findbuyrelateddata("gstonsell", item?.selling_data) || "",
      total_buy_cost: calculateTotalInrAmount(item?.buying_data) || 0,
      total_sell_cost: calculateTotalInrAmount(item?.selling_data) || 0,
      profit:
        Number(profit(item?.buying_data, item?.selling_data)).toFixed(3) || 0,
      pickup_date: item?.pickup_date || "",
      client_code: item?.consigner_code || "",
      client_name: item.consigner_name || "",

      // client_type: item.client_type || "",
      delivery_address: item?.consignee_address || "",
      delivery_pincode: item?.consignee_pincode || "",
      delivery_state: item?.consignee_state || "",

      Country_name:
        findcoutry(item?.delivery_country_id)?.country_name || "N.A",
      status: gettrackingdata(item?.airwaybilno, trackingdata)?.status || "",
      Outscanned_Date_at_Hub: gettrackingdata(item?.airwaybilno, trackingdata)
        ?.handover_date
        ? formatDate(
            gettrackingdata(item?.airwaybilno, trackingdata)?.handover_date,
          )
        : "",
      booking_date: item.booking_date ? formatDate(item?.booking_date) : "",
      sales_person:
        getsalesperson(item?.pickup_franchisee_id)?.sales_person || "",
      booking_type: item.booking_type,
      shipment_type:
        item.shipment_type == 1
          ? "Non-Document"
          : item?.shipment_type == 2
            ? "Document"
            : item?.shipment_type == 3
              ? ""
              : item?.shipment_type == 4
                ? "Commercial"
                : "",
      branch_name: getbranchdata(item?.pickup_branch_id)?.branch_name || "",
      comm_shipment:
        item?.shipment_type == 1
          ? "NO"
          : item?.shipment_type == 2
            ? "NO"
            : item?.shipment_type == 3
              ? "No"
              : item?.shipment_type == 4
                ? "YES"
                : "",

      "Domestic/International": item?.domestic || "",
    }));
    return newdata;
  };

  const handlechange = (e: any) => {
    const { name, value } = e.target;
    setInitialdatatoget((pre: any) => ({ ...pre, [name]: value }));
    setPage(0);
  };
  const getdownloaddata = async () => {
    const params2: any = {};
    const { from_date, to_date } = initialdatatoget;
    if (from_date) {
      params2.from_date = from_date;
    }
    if (to_date) {
      params2.to_date = to_date;
    }
    //   const response: any = await commonpostrequest(
    //     `booking/direct_party_booking_summary_v1`,
    //     params2
    //     //  {franchisee_id:702}
    //   );
    // const response2: any = await commonpostrequest(
    //     "track_shipment/report/status-report",
    //     params2
    //   );
    const response: any = await BookingDirectParty(params2);

    const response2: any = await BookingTracking(params2);
    if (response?.status == 200) {
      const data = response?.data?.data || [];
      const res2data = response2?.data?.data || [];
      const newdata = getchangedata(data, res2data);

      setDownloaddata(tranfereddata(newdata) || []);
    } else {
      setDownloaddata([]);
    }
  };

  const handleSubmit = async (value: any) => {
    const params: any = {
      limit: 20,
      offset: Number((page + 1 - 1) * 20),
    };

    const { from_date, to_date } = initialdatatoget;

    if (from_date) {
      params.from_date = from_date;
    }
    if (to_date) {
      params.to_date = to_date;
    }
    if (from_date && to_date) {
      setBookingData(true);
      try {
        setPostisLoading(value);
        setType(value);
        //   const response: any =await commonpostrequest(
        //     `booking/direct_party_booking_summary`,
        //     params
        //     //  {franchisee_id:702}
        //   );
        //   const response2: any = await commonpostrequest("track_shipment/report/status-report",params);

        const response: any = await BookingPartySummary(params);
        const response2: any = await BookingTracking(params);
        if (response?.status == 200) {
          setTotalPages(Math.ceil(Number(response?.data?.total) / 20) || 0);
          const data = response?.data?.data || [];
          if (response2?.status == 200) {
            const res2data = response2?.data?.data || [];
            const newdata = getchangedata(data, res2data || []);
            // setTotalPages(response?.data?.count || 0);
            setMaindata(tranfereddata(newdata || []));
          }
        } else if (response?.status == 204) {
          setTotalPages(Number(response?.data?.total) || 0);
          setMaindata([]);
        } else if (response?.response?.status == 400) {
          showAlert(response?.response?.data?.message, "error");
        } else {
          showAlert("Something going!..", "error");
          setMaindata([]);
        }
      } catch (err: any) {
        showAlert(err.message);
      } finally {
        setPostisLoading(false);
        setType(0);
        setBookingData(false);
      }
    } else {
      showAlert("Please Povide requied details", "warning");
      setMaindata([]);
    }
  };

  return (
    <>
      <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Calendar className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">BOOKING SUMMARY</h4>
                </div>
              </div>

              <div className="flex items-center">
                {downloaddata?.length >= 1 ? (
                  <div>
                    {/* <Commondownload
              data={downloaddata}
              forwhat={"booking summary report"}
              icon={true}
            /> */}
                  </div>
                ) : (
                  ""
                )}

                <div className="">
                  <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center">
                    <div className="w-[48%] lg:w-full">
                      <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center">
                        <FormLabel className="whitespace-nowrap !mb-0">
                          FROM DATE
                        </FormLabel>
                        <span className="text-red-400">*</span>

                        <FormInput
                          type="date"
                          name="from_date"
                          value={initialdatatoget?.from}
                          onChange={handlechange}
                        />
                      </div>
                    </div>

                 <div className="w-[48%] lg:w-full">
                      <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center">
                        <FormLabel className="whitespace-nowrap !mb-0">
                          TO DATE
                        </FormLabel>
                        <span className="text-red-400">*</span>

                        <FormInput
                          type="date"
                          name="to_date"
                          value={initialdatatoget?.to}
                          onChange={handlechange}
                        />
                      </div>
                    </div>

                    <div className="w-fulllg:w-full">
                      <Button
                        variant="mustard"
                        disabled={
                          postisLoading ||
                          !initialdatatoget?.from_date ||
                          !initialdatatoget?.to_date
                        }
                        onClick={() => {
                          handleSubmit(2);
                          getdownloaddata();
                        }}
                        className="   px-3 py-2 w-full"
                      >
                        {/* <Search className="ml-2" /> */}
                        {postisLoading && postisLoading == 2 ? (
                          <LoadingIcon icon="puff" />
                        ) : (
                          "Search"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2  lg:p-6">
            {maindata?.length > 0 ? (
              <div className="w-full ">
                <>
                  {bookingData ? (
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        margin: "auto",
                        display: "block",
                      }}
                    >
                      <LoadingIcon icon="puff" />
                    </div>
                  ) : (
                    <ReportCommonTable
                      columns={maindata[0]}
                      row={maindata}
                      loading={postisLoading}
                      page={page}
                      overflowvalue={true}
                    />
                  )}
                  <CommonPagination
                    onPageChange={onPageChange}
                    page={Number(page + 1)}
                    totalpages={Number(totalPages)}
                  />
                </>
              </div>
            ) : (
              <p className="text-gray-400 text-center ">No Data Found!</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustwisebookingReport;
