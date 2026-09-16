import React, { useEffect, useRef, useState } from "react";
import Table from "../../../base-components/Table";
import CommonTable from "../../../components/Table";

import AOS from "aos";
import "aos/dist/aos.css";

import {
  Search,
  UserCog,
  ChevronDown,
  Trash2,
  Eye,
  Plus,
  Tag,
  Printer,
  Send,
  Upload,
  Minus,
  User,
} from "lucide-react";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { Menu } from "../../../base-components/Headless";
import CommonPagination from "../../../components/Pagination";
import {
  Get_country,
  Get_Enquiry_list,
  Tag_house_master,
  Get_franchise,
  Get_Cargo_Events,
  Add_scan_events,
  sendHawbEmail,
  requestForUploadSignedHouse,
  GetJobApi,
  UpdateJobApi,
  Generate_booking,
  Raise_spot_enquiry,
  UpdateHawbApi,
  Get_house,
  Get_tracking,
  Get_Chargeable_Weight,
  Get_Length_Unit,
  Edit_enquiry_booking_export,
  Get_shipment,
  Get_Weight_Unit,
  Get_Commodity_Type,
  Get_Clearance_Type,
  Get_Incoterm,
  Charge_head_drop_down,
  Get_Currency,
  Get_customer_type,
  common_get,
  GetChargesApi,
} from "../../../AllServices/services";
import {
  downloadAttachment,
  formatDate,
  formatDateWithoutTime,
  indianFormat,
  isValidHsn,
} from "../../../utils";
import { Spinner } from "flowbite-react";
import Modal from "../../../components/Modal";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { useAlert } from "../../../ContextProvider/AlertContext";
import NoData from "../../../../src/assets/images/no-data.jpg";
import { useDebounce } from "../../../components/Search";
import { ScanLine } from "lucide-react";
import { FileText } from "lucide-react";
import { convertUTCtoIST } from "../../../components/UtcToIst";
import { ArrowUpRight } from "lucide-react";
import { ArrowDownRight } from "lucide-react";
import SenderDetails from "./senderDetails";
import ReceiverDetails from "./receiverDetails";
import SellBuyForm from "./SellBuyForm";
import { Link } from "react-router-dom";
import { Edit } from "lucide-react";
import Tippy from "../../../base-components/Tippy";
import Lucide from "../../../base-components/Lucide";
import CommonSearchableAll from "../../../components/commonSearchableAll";

const initDimension = {
  item_description: "",
  weight: "",
  length: "",
  breadth: "",
  height: "",
  quantity: "",
  value: "",
  hsn_code: "",
};

const intarrcharges = {
  enquiry_id: "",
  charge_id: "",
  weight: 1,
  rate: 0,
  per_kg: 2,
  inr_amount: 0,
  currency: "24",
  sac_code: "",
  ex_rate: 1,
};
const intarrcharges2 = {
  enquiry_id: "",
  charge_id: "",
  weight: 1,
  rate: 0,
  per_kg: 2,
  inr_amount: 0,
  currency: "24",
  ex_rate: 1,
  pp_cc: "1",
  party: "",
  party_name: "",
  sac_code: "",
};
const intexchangedata = [
  { id: "1", currency_id: "24", currency: "INR", ex_rate: "1" },
  { id: "2", currency_id: "", currency: "", ex_rate: "" },
  { id: "3", currency_id: "", currency: "", ex_rate: "" },
];
const intexchangedataSell = [
  { id: "1", currency_id: "24", ex_rate: "1" },
  { id: "2", currency_id: "", ex_rate: "" },
];
const fun1 = (value: any) => {};
const funtoempty = () => {};

const ReadyToExecute = ({
  loadCountData,
  franchiseeData,
  countryData,
  page,
  search,
  totalPages,
  handlePageChange,
  datatoget,
  setDatatoget,
}) => {
  const debouncedSearch = useDebounce(search, 500);
  const [showEditBooking, setShowEditBooking] = useState(false);
  const [readyToExecute, setReadyToExecute] = useState([]);
  const [scanEvents, setScanEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [bookSpinner, setBookSpinner] = useState(false);
  const [counter, setCounter] = useState(0);
  const [lengthUnit, setLengthUnit] = useState([]);
  const [dimensionUnit, setDimensionUnit] = useState("1");
  const [businessType, setBusinessType] = useState("");
  const [convertedDimension, setConvertedDimension] = useState([]);
  const [weightSpinner, setWeightSpinner] = useState(false);
  const { showAlert } = useAlert();
  const [modalData, setModalData] = useState({
    enquiry_id: "",
    job_id: "",
    hawb: "",
    mawb: "",
    house_pdf: null,
    file: null,
  });
  const [scanData, setScanData] = useState({
    id: "",
    job_id: "",
    remarks: "",
    status_code: "",
    td_date: null,
    td_weight: null,
  });
  const [scanOpen, setScanOpen] = useState(false);
  const [scanSpinner, setScanSpinner] = useState(false);
  const [printSpinner, setPrintSpinner] = useState(false);
  const [mailSpinner, setMailSpinner] = useState(false);
  const [uploadSpinner, setUploadSpinner] = useState(false);
  const [senderOpen, setSenderOpen] = useState(false);
  const [receiverOpen, setReceiverOpen] = useState(false);
  const [editSpinner, setEditSpinner] = useState(false);
  const uploadedFile = useRef<HTMLInputElement | null>(null);
  const grUploadedFile = useRef<HTMLInputElement | null>(null);
  const [ataUrl, setAtaURL] = useState(null);
  const [grUrl, setGrURL] = useState(null);
  const ataUploadedFile = useRef<HTMLInputElement | null>(null);
  const [statusCodes, setStatusCodes] = useState([]);
  const [trackerData, setTrackerData] = useState([]);
  const [trackSpinner, setTrackSpinner] = useState(false);
  const [jobData, setJobData] = useState();
  const [details, setDetails] = useState({
    booking_no: "",
    franchisee_id: "",
  });
  const [packages, setPackages] = useState(0);
  const [grossWeight, setGrossWeight] = useState(0);
  const [chWeight, setChWeight] = useState(0);
  const [chargeWeight, setChargeWeight] = useState(0);
  const [grWeight, setGrWeight] = useState(0);
  const [mawbPresent, setMawbPresent] = useState(false);
  const [dimensionData, setDimensionData] = useState([initDimension]);
  const [editData, setEditData] = useState<any>({});
  const [shipmentType, setShipmentType] = useState([]);
  const [weightUnit, setWeightUnit] = useState([]);
  const [commodityType, setCommodityType] = useState([]);
  const [commoditySearch, setCommoditySearch] = useState<any>({
    commodity_id: "",
    commodity: "",
  });
  const [clearanceType, setClearanceType] = useState([]);
  const [incoterm, setIncoterm] = useState([]);
  const [chargesList, setChargesList] = useState<Array<any>>([]);
  const [toggle, setToggle] = useState<any>(1);
  const [currencyData, setCurrencyData] = useState([]);
  const [alltypedata, setAlltypedata] = useState<any>([]);
  const [totalbuy, setTotalBuy] = useState<any>(0);
  const [totalSell, setTotalsell] = useState<any>(0);
  const [sellingcharges, setSellingCharges] = useState<any>([
    { ...intarrcharges },
  ]);
  const [buycharges, setBuyCharges] = useState<any>([{ ...intarrcharges2 }]);
  const [exchangedata, setExchangedata] = useState<any>(intexchangedata);
  const [exchangedataSell, setExchangedataSell] =
    useState<any>(intexchangedataSell);
  const [exchangeSellLocked, setExchangeSellLocked] = useState(false);
  const [exchangeBuyLocked, setExchangeBuyLocked] = useState(false);
  const [importBookingType, setImportBookingType] = useState<any>(null);
  const [cargoOverseas, setCargoOverseas] = useState<any>({});
  const [cargoOverseasCurrency, setCargoOverseasCurrency] = useState<any>({});
  const [editGstStatus, setEditGstStatus] = useState(0);
  const [oldCharges, setOldCharges] = useState([]);

  const getChargeableWeight = async (
    shipment_dimensions: any = [],
    courier_id: any = "",
    forWhat: any = "",
  ) => {
    if (!courier_id) {
      return;
    }
    try {
      setWeightSpinner(true);
      const courier_data = await Get_Chargeable_Weight(courier_id)?.then(
        (res) => res?.data?.data,
      );

      if (!courier_data?.[0]) return;

      const bill_type = courier_data[0]?.courier_wt_bill_type;

      let chargeable_weight = 0;
      if (bill_type == 1) {
        chargeable_weight = shipment_dimensions?.reduce(
          (acc: any, item: any) =>
            acc +
            Math.max(
              ((+item?.length || 0) *
                (+item?.breadth || 0) *
                (+item?.height || 0) *
                (+item?.quantity || 0)) /
                courier_data[0]?.denom_fac,
              +item?.weight || 0,
            ),
          0,
        );
      } else {
        let gross_w = shipment_dimensions?.reduce(
          (acc: any, item: any) => acc + +item?.weight || 0,
          0,
        );
        let vol_w = shipment_dimensions?.reduce(
          (acc: any, item: any) =>
            acc +
            ((+item?.length || 0) *
              (+item?.breadth || 0) *
              (+item?.height || 0) *
              (+item?.quantity || 0)) /
              courier_data[0]?.denom_fac,
          0,
        );
        chargeable_weight = Math.max(gross_w, vol_w);
      }

      setChWeight(Number(chargeable_weight?.toFixed(2)) || 0);
      if (forWhat) {
        setChargeWeight(Number(chargeable_weight?.toFixed(2)) || 0);
      }
    } catch (error) {
      return 0;
    } finally {
      setWeightSpinner(false);
    }
  };

  useEffect(() => {
    const dimsForCalc =
      dimensionUnit == "2"
        ? dimensionData.map((item: any) => ({
            ...item,
            height: (parseFloat(item?.height) * 2.54).toFixed(2),
            length: (parseFloat(item?.length) * 2.54).toFixed(2),
            breadth: (parseFloat(item?.breadth) * 2.54).toFixed(2),
          }))
        : dimensionData;
    const courier_id = (modalData as any)?.courier_id || editData?.courier_id;
    getChargeableWeight(dimsForCalc, courier_id);
  }, [dimensionData]);

  const gettotal = (data?: any, key?: any) => {
    const total = data?.reduce(
      (total: any, item: any) => total + Number(item[key] || 0),
      0,
    );
    return total;
  };

  useEffect(() => {
    setTotalBuy(gettotal(buycharges, "inr_amount"));
  }, [JSON.stringify(buycharges)]);

  useEffect(() => {
    setTotalsell(gettotal(sellingcharges, "inr_amount"));
  }, [JSON.stringify(sellingcharges)]);

  const getgsttotal = (data?: any, key?: any, forwhat: string = "sell") => {
    const total = data?.reduce((total: any, item: any) => {
      if (item?.charge_id == 163 || item?.charge_id == 162) {
        return total;
      } else {
        const chargeInfo =
          forwhat === "sell"
            ? chargesList?.find((c: any) => c.ref_sell_id == item?.charge_id)
            : chargesList?.find((c: any) => c.charge_id == item?.charge_id);
        const igstRate =
          parseFloat(chargeInfo?.tax_breakup?.igst || "18") / 100;
        return (
          total +
          Number(item[key] || 0) *
            (editGstStatus == 4 ||
            (forwhat === "sell" && importBookingType == 3) ||
            cargoOverseas?.is_overseas
              ? 0
              : igstRate)
        );
      }
    }, 0);
    return total;
  };

  const totalWeight = chWeight;

  useEffect(() => {
    if (!editData?.id) return;
    const franchisee = franchiseeData?.find(
      (cus: any) => cus?.franchisee_id == editData?.franchisee_id,
    );
    setCargoOverseas(franchisee || {});
    if (franchisee?.is_overseas == 1) {
      const currency = currencyData?.find(
        (cur: any) => cur?.id == franchisee?.currency,
      );
      setCargoOverseasCurrency(currency || {});
    }
    setEditGstStatus(franchisee?.gst_status || 0);
    const initSell = [{ ...intarrcharges, enquiry_id: editData?.id }];
    const initBuy = [{ ...intarrcharges2, enquiry_id: editData?.id }];
    setSellingCharges(initSell);
    setBuyCharges(initBuy);
  }, [editData]);

  const handleCharges = async (id: any = "") => {
    try {
      const res = await GetChargesApi(id);
      if (res?.status == 200 && res?.data?.data?.length > 0) {
        // Selling: charge_type == 2
        const sellingChargesData =
          res?.data?.data?.filter((item: any) => item?.charge_type == 2) || [];
        const uniqueSellCurrencies: any[] = [];
        sellingChargesData.forEach((charge: any) => {
          const cId = String(charge?.currency || "24");
          if (
            cId &&
            cId !== "24" &&
            !uniqueSellCurrencies.find((c: any) => c.currency_id === cId)
          ) {
            uniqueSellCurrencies.push({
              currency_id: cId,
              ex_rate: String(charge?.ex_rate || ""),
            });
          }
        });
        if (uniqueSellCurrencies.length > 0) {
          setExchangedataSell([
            { id: "1", currency_id: "24", ex_rate: "1" },
            {
              id: "2",
              currency_id: uniqueSellCurrencies[0]?.currency_id || "",
              ex_rate: uniqueSellCurrencies[0]?.ex_rate || "",
            },
          ]);
          setExchangeSellLocked(true);
        }
        // Buying: charge_type == 1
        const buyingChargesData =
          res?.data?.data?.filter((item: any) => item?.charge_type == 1) || [];
        const uniqueBuyCurrencies: any[] = [];
        buyingChargesData.forEach((charge: any) => {
          const cId = String(charge?.currency || "24");
          if (
            cId &&
            cId !== "24" &&
            !uniqueBuyCurrencies.find((c: any) => c.currency_id === cId)
          ) {
            uniqueBuyCurrencies.push({
              currency_id: cId,
              ex_rate: String(charge?.ex_rate || ""),
            });
          }
        });
        if (uniqueBuyCurrencies.length > 0) {
          setExchangedata([
            { id: "1", currency_id: "24", currency: "INR", ex_rate: "1" },
            {
              id: "2",
              currency_id: uniqueBuyCurrencies[0]?.currency_id || "",
              currency: "",
              ex_rate: uniqueBuyCurrencies[0]?.ex_rate || "",
            },
            {
              id: "3",
              currency_id: uniqueBuyCurrencies[1]?.currency_id || "",
              currency: "",
              ex_rate: uniqueBuyCurrencies[1]?.ex_rate || "",
            },
          ]);
          setExchangeBuyLocked(true);
        }
      }
    } catch (error) {
      // silently ignore
    }
  };

  const handleTrack = async (awb: any) => {
    setTrackSpinner(true);
    try {
      const res = await Get_tracking(awb);
      if (res?.status == 200 && res?.data?.pickup_data?.courier_id) {
        setTrackerData(
          res?.data?.data?.sort(
            (a: any, b: any) => new Date(b?.date) - new Date(a?.date),
          ) || [],
        );
        const status =
          res?.data?.data
            ?.filter((ele: any) => ele?.status_code != "00")
            ?.map((ele: any) => ele?.status_code) || [];

        setStatusCodes(status);
      } else {
        setTrackerData([]);
        setStatusCodes([]);
      }
    } catch (err: any) {
      showAlert(err?.message, "error");
    } finally {
      setTrackSpinner(false);
    }
  };

  const generateHouseDraft = async () => {
    setPrintSpinner(true);
    try {
      if (!modalData?.job_id) return showAlert("Job id is required", "warning");
      const res = await Get_house(modalData?.job_id);
      if (res?.status == 200) {
        downloadAttachment(res?.data?.url, "House Draft");
        showAlert(res?.data?.message);
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      if (error) showAlert("something went wrong", "error");
    } finally {
      setPrintSpinner(false);
    }
  };

  const handleGetJob = async (
    job_id: any = "",
    captureOriginal: boolean = false,
  ) => {
    try {
      if (!job_id) return showAlert("Job id is required", "warning");
      const res = await GetJobApi(job_id);
      if (res?.status == 200) {
        const shipper = res?.data?.data?.shipper_details;
        const consignee = res?.data?.data?.consignee_details;
        setJobData((prev: any) => ({
          ...prev,
          job_id: job_id,
          shipper_details: shipper,
          consignee_details: consignee,
        }));
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      showAlert(error?.message || error?.msg);
    }
  };

  useEffect(() => {
    const commodityId = editData?.commodity;
    if (commodityId) {
      if (String(commoditySearch?.commodity_id ?? "") !== String(commodityId)) {
        common_get(`/admin/commodity-type/${commodityId}`).then((res) => {
          if (res?.status === 200) {
            const commodityData = Array.isArray(res?.data?.data)
              ? res?.data?.data[0]
              : res?.data?.data;
            setCommoditySearch({
              commodity_id: commodityData?.commodity_id ?? commodityId,
              commodity: commodityData?.commodity ?? "",
            });
          }
        });
      }
    } else if (commoditySearch?.commodity_id) {
      setCommoditySearch({ commodity_id: "", commodity: "" });
    }
  }, [editData?.commodity]);

  const handleCommoditySelect = (item: any) => {
    setEditData((prev: any) => ({
      ...prev,
      commodity: item?.commodity_id ?? "",
    }));
  };

  const handleCommodityClear = () => {
    setEditData((prev: any) => ({
      ...prev,
      commodity: "",
    }));
  };

  const handleFileChange = (event: any, field: any) => {
    const file = event.target.files[0] || null;
    if (file) {
      setModalData({ ...modalData, [field]: file });
      if (field == "ata_carnet_document") {
        setAtaURL(URL.createObjectURL(file));
      } else if (field == "gr_waiver_document") {
        setGrURL(URL.createObjectURL(file));
      }
    } else {
      uploadedFile.current.value = null;
      setModalData({ ...modalData, file: null });
    }
  };

  const handleBook = async () => {
    if (!editData?.job_id) return showAlert("Job id is required", "warning");
    setBookSpinner(true);
    const weightFrom = Number(editData?.weight_from);
    const weightTo = Number(editData?.weight_to);
    const isInWeightRange =
      !isNaN(weightFrom) &&
      !isNaN(weightTo) &&
      editData?.weight_from != null &&
      editData?.weight_to != null &&
      Number(chWeight) >= weightFrom &&
      Number(chWeight) <= weightTo;
    try {
      let res;
      if (isInWeightRange) {
        res = await Generate_booking(editData?.job_id, counter, {
          airwaybill_no: editData?.airwaybilno,
          flag: "edit_booking",
        });
      } else {
        res = await Raise_spot_enquiry({
          ...editData,
          booking_status: 7,
          weight: chWeight,
          chargeable_weight: chWeight,
        });
      }
      if (res?.status == 200) {
        if (!isInWeightRange) {
          showAlert(
            "Shipment is out of weight range, send to Pricing for Approval",
            "warning",
          );
        } else {
          showAlert(res?.data?.message);
        }
        setShowEditBooking(false);
        loadEnquiryData();
        loadCountData();
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      showAlert("something went wrong", "error");
    } finally {
      setBookSpinner(false);
      setCounter((pre: any) => pre + 1);
    }
  };

  const handleEditDetails = async () => {
    let sell = false;

    if (!sellingcharges[0]?.charge_id == "") {
      const isAllFilled = sellingcharges?.every((item: any) =>
        Object.values(item).every(
          (value) => value != "" && value != null && value != undefined,
        ),
      );
      if (!isAllFilled) {
        showAlert("Please fill all the details in the sell Charges", "warning");
        return;
      } else {
        sell = true;
      }
    } else {
      sell = true;
    }

    if (sell == true) {
      setEditSpinner(true);
      try {
        const res = await UpdateJobApi({
          ...(jobData as any),
          sell_charges: sellingcharges[0]?.charge_id ? sellingcharges : [],
          buy_charges: buycharges[0]?.charge_id ? buycharges : [],
          clearance_type: editData?.clearence_type || "",
          inco_term: editData?.incoterm || "",
          commodity: editData?.commodity || "",
          gross_weight: grWeight || 0,
          chargeable_weight: chWeight || 0,
          shipment_dimensions:
            dimensionUnit == "2" ? convertedDimension : dimensionData,
          currency_id: editData?.currency_id || "24",
        });
        if (res?.status == 200) {
          await handleBook();
          setDimensionUnit("1");
          setEditData({});
        } else if (res?.response?.status == 406) {
          showAlert(res?.response?.data?.errors[0]?.msg, "warning");
        } else {
          showAlert(
            res?.data?.message || res?.response?.data?.message || res?.message,
            "error",
          );
        }
      } catch (error: any) {
        showAlert(error?.message || error?.msg, "error");
      } finally {
        setEditSpinner(false);
      }
    }
  };

  const handleSendMail = async () => {
    setMailSpinner(true);
    try {
      if (!modalData?.job_id) return showAlert("Job id is required", "warning");
      const res = await sendHawbEmail(modalData?.job_id);
      if (res?.status == 200) {
        showAlert(res?.data?.message);
      } else if (res?.response?.status == 406) {
        showAlert(res?.response?.data?.errors[0]?.msg, "warning");
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      console.log(error);
      showAlert(error?.message, "error");
    } finally {
      setMailSpinner(false);
    }
  };

  const handleUploadSignedHouse = async () => {
    const formData = new FormData();
    formData.append("job_id", modalData?.job_id);
    formData.append("airwaybill_no", modalData?.hawb);
    formData.append("file", modalData?.file);

    if (!modalData?.job_id) return showAlert("Job id is required", "warning");
    if (!modalData?.hawb) return showAlert("Hawb is required", "warning");
    if (!modalData?.file) return showAlert("File is required", "warning");

    try {
      setUploadSpinner(true);
      const res = await requestForUploadSignedHouse(formData);
      if (res?.status == 200) {
        uploadedFile.current.value = null;
        setModalData({ ...modalData, file: null });
        showAlert(res?.data?.message);
      } else if (res?.response?.status == 406) {
        showAlert(res?.response?.data?.errors[0]?.msg, "warning");
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      console.log(error);
      showAlert(error?.message, "error");
    } finally {
      setUploadSpinner(false);
    }
  };

  const scanDescription = (
    <>
      {trackSpinner ? (
        <div className="p-3 flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <>







<div className="flex-wrap lg:flex-nowrap flex gap-2 mb-3">
<div className="bg-[#fff3dc] rounded-lg p-[7px] flex w-full lg:w-[50%]">
    <figure className="w-[35px] flex items-center justify-center">
      <FileText className="w-[35px]  text-[#ba9650] " />
    </figure>
    <aside className="md:border-l md:border-[#fbe9c7] md:pl-2 w-[80%] leading-[18px]">
        <p className="text-[12px] uppercase text-[#757575] w-full">ENQUIRY No.</p>
        <h4 className="font-medium text-[14px] text-[#383838] w-full flex justify-between items-center">
            <span className="capitalize font-bold cursor-pointer">        {scanData?.booking_no}</span>
           
        </h4>
    </aside>
</div>

<div className="bg-[#f2f7ff] rounded-lg p-[7px] flex  w-full lg:w-[50%]">
    <figure className="w-[35px] flex items-center justify-center">
      <User className="w-[30px]  text-[#4478cb] " />
    </figure>
    <aside className="md:border-l md:border-[#d8e7ff] md:pl-2 w-[80%] leading-[18px]">
        <p className="text-[12px] uppercase text-[#757575] w-full">ACL </p>
        <h4 className="font-medium text-[14px] text-[#383838] w-full flex justify-between items-center">
            <span className="capitalize font-bold cursor-pointer">
            {
                franchiseeData?.find(
                  (item: any) => item?.franchisee_id == scanData?.franchisee_id,
                )?.franchisee_name
              }</span>
           
        </h4>
    </aside>
</div>
</div>






{/* 
          <div className=" flex justify-between gap-4 mb-2">
            <div className=" bg-gray-200 rounded p-2 max-w-1/2 overflow-hidden truncate">
              <b>ENQUIRY No: </b>
              {scanData?.booking_no}
            </div>
            <div className=" bg-gray-200 rounded p-2 overflow-hidden truncate max-w-1/2">
              <b>FRANCHISEE : </b>
              {
                franchiseeData?.find(
                  (item: any) => item?.franchisee_id == scanData?.franchisee_id,
                )?.franchisee_name
              }
            </div>
          </div> */}
          <div className="flex gap-4 justify-between items-end w-full">
            <div className="w-full">
              <FormLabel htmlFor="regular-form-1">
                Scan Events <span className="text-red-500">*</span>
              </FormLabel>
              <FormSelect
                className=""
                aria-label="Default select example"
                value={scanData?.id}
                onChange={(e) => {
                  setScanData((pre) => ({
                    ...pre,
                    id: "",
                    remarks: "",
                    status_code: "",
                    td_date: null,
                    td_weight: null,
                  }));
                  const eventId = e.target.value;
                  const item = scanEvents?.find(
                    (item: any) => item?.id == eventId,
                  );
                  if (item?.id == 6) {
                    setScanData((pre) => ({
                      ...pre,
                      id: item?.id,
                      remarks: "",
                      status_code: item?.status_code,
                    }));
                  } else {
                    setScanData((pre) => ({
                      ...pre,
                      id: item?.id,
                      remarks: item?.event,
                      status_code: item?.status_code,
                    }));
                  }
                }}
              >
                <option>Select Scan Event</option>
                {scanEvents
                  ?.filter((ele) => !statusCodes?.includes(ele?.status_code))
                  ?.map(
                    (item: any, index: number) =>
                      item?.is_active == 1 && (
                        <option key={index} value={item?.id}>
                          {item?.event}
                        </option>
                      ),
                  )}
              </FormSelect>
            </div>
            {scanData?.id == 6 && (
              <div className="w-full">
                <FormLabel htmlFor="regular-form-1">
                  Remarks <span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  id="regular-form-1"
                  type="text"
                  placeholder="Enter Remarks"
                  value={scanData?.remarks}
                  onChange={(e) => {
                    setScanData((pre) => ({
                      ...pre,
                      remarks: e.target.value,
                    }));
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex gap-4 justify-between items-end my-4">
            {scanData?.id == 2 && (
              <>
                <div>
                  <FormLabel htmlFor="regular-form-1">
                    TD Weight <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormInput
                    id="regular-form-1"
                    type="text"
                    placeholder="Enter TD Weight"
                    value={scanData?.td_weight}
                    onChange={(e) => {
                      setScanData((pre) => ({
                        ...pre,
                        td_weight: e.target.value.replace(/[^0-9.]/g, ""),
                      }));
                    }}
                  />
                </div>
                <div>
                  <FormLabel htmlFor="regular-form-1">
                    TD Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormInput
                    id="regular-form-1"
                    type="date"
                    placeholder="Enter TD Date"
                    value={scanData?.td_date}
                    onChange={(e) => {
                      setScanData((pre) => ({
                        ...pre,
                        td_date: e.target.value,
                      }));
                    }}
                  />
                </div>
              </>
            )}
          </div>
          <div className="overflow-y-auto max-h-48">
            {trackerData?.length >= 1 ? (
              trackerData?.map((item: any, index: number) => (
                <div className=" bg-white w-full " key={index}>
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <CircleCheckIcon className="text-green-500 h-5 w-5" />
                      {index !== trackerData?.length - 1 && (
                        <div className="w-0.5 h-16 bg-green-500" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-green-500 bg-green-100 py-0.5 px-2 rounded-full">
                        {item?.status ? item?.status : "N.A"}
                      </span>
                      <p className="text-xs text-gray-500">
                        {" "}
                        {item?.date ? formatDate(item?.date) : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center py-16 px-10">
                <h1 className="text-center text-primary">
                  OOps.. No data found!..
                </h1>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );

  const scanFooter = (
    <div className="flex justify-end ">
      <Button
        className="px-4 py-1 rounded-lg bg-mustard text-white  ml-2"
        onClick={() => {
          setScanSpinner(true);
          handleUpdateScanEvents();
        }}
        disabled={scanSpinner}
      >
        Submit
        {scanSpinner && (
          <LoadingIcon
            icon="puff"
            color="white"
            className="w-5 h-5 ml-2 stroke-2.5 text-white"
          />
        )}
      </Button>
    </div>
  );

  const checkDimension = () => {
    if (dimensionData?.length == 0) {
      showAlert("Please add at least one shipment dimension", "warning");
      return;
    } else {
      for (let i = 0; i < dimensionData.length; i++) {
        const item = dimensionData[i];

        for (const key in item) {
          if (item.hasOwnProperty(key) && item[key]) {
            if (
              (key === "weight" ||
                key === "value" ||
                key === "length" || // fixed typo from 'lenght'
                key === "breadth" ||
                key === "height") &&
              Number(item[key]) <= 0
            ) {
              showAlert(
                `${key.replaceAll("_", " ")} should be greater than 0`,
                "warning",
              );
              return;
            } else if (key === "quantity" && Number(item[key]) < 1) {
              showAlert(
                `${key.replaceAll("_", " ")} should be at least 1`,
                "warning",
              );
              return;
            } else if (key === "hsn_code" && !isValidHsn(item[key])) {
              showAlert(
                `Please Enter a valid ${key.replaceAll("_", " ")}`,
                "warning",
              );
              return;
            }
          } else {
            showAlert(
              `${key.replaceAll("_", " ")} is required at row no ${i + 1}`,
              "warning",
            );
            return;
          }
        }
      }
    }
    handleTagHouseMaster();
  };

  const handleDimensionChange = (name: any, Value: any, index: any) => {
    const updatedDimensions = [...dimensionData];
    updatedDimensions[index] = { ...updatedDimensions[index], [name]: Value };
    setDimensionData(updatedDimensions);
  };

  const handleDelete = (e: any, index?: any) => {
    const newData = [...dimensionData];
    newData.splice(index, 1);
    setDimensionData(newData);
  };

  useEffect(() => {
    const [Pieces, gross_weight] = dimensionData?.reduce(
      (acc: any, curr: any) => {
        acc[0] += Number(curr?.quantity);
        acc[1] += Number(curr?.weight);
        return acc;
      },
      [0, 0],
    );
    setPackages(Pieces);
    setGrossWeight(gross_weight);
  }, [dimensionData]);

  useEffect(() => {
    if (!senderOpen && modalData?.job_id) {
      setOpen(true);
    }
  }, [senderOpen]);

  useEffect(() => {
    if (!receiverOpen && modalData?.job_id) {
      setOpen(true);
    }
  }, [receiverOpen]);

  const description = (
    <>
      {/* <div className=" flex justify-between gap-4 mb-4">
        <div className=" bg-gray-200 rounded p-2 max-w-1/2 overflow-hidden truncate">
          <b>ENQUIRY No: </b>
          {modalData?.booking_no}
        </div>
        <div className=" bg-gray-200 rounded p-2 overflow-hidden truncate max-w-1/2">
          <b>FRANCHISEE : </b>
          {
            franchiseeData?.find(
              (item: any) => item?.franchisee_id == modalData?.franchisee_id,
            )?.franchisee_name
          }
        </div>
      </div> */}



<div className="flex-wrap lg:flex-nowrap justify-between flex gap-2 mb-3">

<div className="flex-wrap lg:flex-nowrap flex gap-2 mb-3">
<div className="bg-[#fff3dc] rounded-lg p-[8px] flex w-full lg:w-auto">
    <figure className="w-[35px] flex items-center justify-center">
      <FileText className="w-[35px]  text-[#ba9650] " />
    </figure>
    <aside className="md:border-l md:border-[#fbe9c7] md:pl-2 md:pr-3 w-[80%] leading-[18px]">
        <p className="text-[12px] uppercase text-[#757575] w-full">ENQUIRY No.</p>
        <h4 className="font-medium text-[14px] text-[#383838] w-full flex justify-between items-center">
            <span className="capitalize font-bold cursor-pointer">            {modalData?.booking_no} </span>
           
        </h4>
    </aside>
</div>

<div className="bg-[#f2f7ff] rounded-lg p-[8px] flex  w-full lg:w-auto">
    <figure className="w-[35px] flex items-center justify-center">
      <User className="w-[30px]  text-[#4478cb] " />
    </figure>
    <aside className="md:border-l md:border-[#d8e7ff] md:pl-2 md:pr-3 w-[80%] leading-[18px]">
        <p className="text-[12px] uppercase text-[#757575] w-full">FRANCHISEE </p>
        <h4 className="font-medium text-[14px] text-[#383838] w-full flex justify-between items-center">
            <span className="capitalize font-bold cursor-pointer">
           {
            franchiseeData?.find(
              (item: any) => item?.franchisee_id == modalData?.franchisee_id,
            )?.franchisee_name
          }</span>
           
        </h4>
    </aside>
</div>
</div>







      <div>
        <div className="flex-wrap lg:flex-nowrap flex gap-1 mb-4">
          <Button
            className="bg-mustard text-white p-1  border-none"
            onClick={() => {
              // handleGetJob(modalData?.job_id);
              if (modalData?.job_id) {
                setOpen(false);
                setSenderOpen(true);
              }
            }}
          >
            <ArrowUpRight className="h-4 w-4 mr-1" /> Sender Details
          </Button>
          <Button
            className="bg-green-400 text-white p-1 border-none"
            onClick={() => {
              // handleGetJob(modalData?.job_id);
              if (modalData?.job_id) {
                setOpen(false);
                setReceiverOpen(true);
              }
            }}
          >
            <ArrowDownRight className="h-4 w-4 mr-1" /> Receiver Details
          </Button>
          <Button
            className="bg-gray-400 text-white p-1  border-none"
            onClick={generateHouseDraft}
            disabled={printSpinner}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print HAWB{" "}
            {printSpinner && (
              <LoadingIcon
                icon="puff"
                color="white"
                className="w-5 h-5 ml-2 stroke-2.5 text-white"
              />
            )}
          </Button>

          <Button
            className="bg-blue-400 text-white p-1  border-none"
            onClick={handleSendMail}
            disabled={mailSpinner}
          >
            <Send className="h-4 w-4 mr-1" />
            Send Email
            {mailSpinner && (
              <LoadingIcon
                icon="puff"
                color="white"
                className="w-5 h-5 ml-2 stroke-2.5 text-white"
              />
            )}
          </Button>
        </div>
      
      </div>
</div>


  <div className="flex-wrap lg:flex-nowrap flex gap-2 items-end mb-4 border-y border-[#eee]  px-0 py-2">
          <div className="">
            <FormLabel htmlFor="upload_hawb" className="!mb-0">
              Upload Signed HAWB <span className="text-red-500">*</span>
            </FormLabel>
            <FormInput
            className="bg-[#ddd]"
              id="upload_hawb"
              type="file"
              placeholder={`Upload Signed ${
                modalData?.shipment_type == "8" && modalData?.mode == "2"
                  ? "HBL"
                  : "HAWB"
              }`}
              onChange={(e) => handleFileChange(e, "file")}
              ref={uploadedFile}
            />
          </div>
          <div className="">
            <Button
              className="bg-mustard text-white px-4 py-2 border-none h-[37px]"
              onClick={handleUploadSignedHouse}
              disabled={uploadSpinner}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload{" "}
              {uploadSpinner && (
                <LoadingIcon
                  icon="puff"
                  color="white"
                  className="w-5 h-5 ml-2 stroke-2.5 text-white"
                />
              )}
            </Button>
          </div>
        </div>









      <div className="mb-4">
        <div className="flex items-end justify-between my-2">
          <FormLabel
            htmlFor="regular-form-1"
            className="text-base font-medium text-gray-900"
          >
            Shipment Dimensions
          </FormLabel>
          <Button
            className="bg-mustard text-white p-2 border-none"
            disabled={weightSpinner}
            onClick={() =>
              getChargeableWeight(
                dimensionUnit == 2 ? convertedDimension : dimensionData,
                modalData?.courier_id,
                1,
              )
            }
          >
            Calculate Chargeable Weight
            {weightSpinner && (
              <LoadingIcon
                icon="puff"
                color="white"
                className="w-5 h-5 ml-2 stroke-2.5 text-white"
              />
            )}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table sm hover striped className="bg-white shadow-lg rounded-md">
            <Table.Thead className="p-0">
              <Table.Tr className="bg-mustard text-white text-center">
                <Table.Th className="whitespace-nowrap border">
                  <div className="flex gap-2 items-center">
                    <p>SR NO.</p>
                    <Plus
                      className="w-[20px] h-[20px] bg-green-400 text-white p-[3px] rounded-sm mr-1 cursor-pointer stroke-2.5"
                      onClick={(e) => {
                        if (!spinner) {
                          setDimensionData((prev) => [
                            ...prev,
                            {
                              ...initDimension,
                              item_description:
                                dimensionData[dimensionData.length - 1]
                                  ?.item_description,
                              hsn_code:
                                dimensionData[dimensionData.length - 1]
                                  ?.hsn_code,
                            },
                          ]);
                        }
                      }}
                    />
                    <Minus
                      className="w-[20px] h-[20px] bg-red-500 text-white p-[3px] rounded-sm mr-1 cursor-pointer stroke-2.5"
                      onClick={(e) => {
                        if (!spinner) {
                          if (dimensionData?.length == 1) {
                            setDimensionData([initDimension]);
                          } else {
                            setDimensionData((prev) => prev.slice(0, -1));
                          }
                          getChargeableWeight(
                            dimensionUnit == 2
                              ? convertedDimension
                              : dimensionData,
                            modalData?.courier_id,
                          );
                        }
                      }}
                    />
                  </div>
                </Table.Th>
                <Table.Th className="whitespace-nowrap border">
                  DESCRIPTION
                </Table.Th>
                <Table.Th className="whitespace-nowrap border">
                  WEIGHT (in kgs)
                </Table.Th>
                <Table.Th className="whitespace-nowrap border">
                  LENGTH (in {dimensionUnit == "1" ? "cms" : "inches"})
                </Table.Th>
                <Table.Th className="whitespace-nowrap border">
                  BREADTH (in {dimensionUnit == "1" ? "cms" : "inches"})
                </Table.Th>
                <Table.Th className="whitespace-nowrap border">
                  HEIGHT (in {dimensionUnit == "1" ? "cms" : "inches"})
                </Table.Th>
                <Table.Th className="whitespace-nowrap border">
                  QUANTITY
                </Table.Th>
                <Table.Th className="whitespace-nowrap border">
                  VALUE (in INR)
                </Table.Th>
                <Table.Th className="whitespace-nowrap border">
                  HSN CODE
                </Table.Th>
                <Table.Th className="whitespace-nowrap border">ACTION</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody className="p-0">
              {dimensionData?.map((item, index) => (
                <Table.Tr>
                  <Table.Td className="text-center border p-0">
                    {index + 1}.
                  </Table.Td>
                  <Table.Td className="text-center border p-0">
                    <FormInput
                      id="item_description"
                      type="text"
                      name="item_description"
                      placeholder="Enter Description"
                      value={item?.item_description}
                      onChange={(e) => {
                        handleDimensionChange(
                          e.target.name,
                          e.target.value?.replace(/[^a-zA-Z0-9 ]/g, ""),
                          index,
                        );
                      }}
                    />
                  </Table.Td>
                  <Table.Td className="text-center border p-0">
                    <FormInput
                      id="weight"
                      type="text"
                      name="weight"
                      placeholder="Enter Weight"
                      value={item?.weight}
                      onChange={(e) => {
                        handleDimensionChange(
                          e.target.name,
                          e.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*?)\./g, "$1"),
                          index,
                        );
                      }}
                    />
                  </Table.Td>
                  <Table.Td className="text-center border p-0">
                    <FormInput
                      id="length"
                      type="text"
                      name="length"
                      placeholder="Enter Length"
                      value={item?.length}
                      onChange={(e) => {
                        handleDimensionChange(
                          e.target.name,
                          e.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*?)\./g, "$1"),
                          index,
                        );
                      }}
                    />
                  </Table.Td>
                  <Table.Td className="text-center border p-0">
                    <FormInput
                      id="breadth"
                      type="text"
                      name="breadth"
                      placeholder="Enter Breadth"
                      value={item?.breadth}
                      onChange={(e) => {
                        handleDimensionChange(
                          e.target.name,
                          e.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*?)\./g, "$1"),
                          index,
                        );
                      }}
                    />
                  </Table.Td>
                  <Table.Td className="text-center border p-0">
                    <FormInput
                      id="height"
                      type="text"
                      name="height"
                      placeholder="Enter Height"
                      value={item?.height}
                      onChange={(e) => {
                        handleDimensionChange(
                          e.target.name,
                          e.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*?)\./g, "$1"),
                          index,
                        );
                      }}
                    />
                  </Table.Td>
                  <Table.Td className="text-center border p-0">
                    <FormInput
                      id="quantity"
                      type="text"
                      name="quantity"
                      placeholder="Enter Quantity"
                      value={item?.quantity}
                      onChange={(e) => {
                        handleDimensionChange(
                          e.target.name,
                          e.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*?)\./g, "$1"),
                          index,
                        );
                      }}
                    />
                  </Table.Td>
                  <Table.Td className="text-center border p-0">
                    <FormInput
                      id="value"
                      type="text"
                      name="value"
                      placeholder="Enter Value"
                      value={item?.value}
                      onChange={(e) => {
                        handleDimensionChange(
                          e.target.name,
                          e.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*?)\./g, "$1"),
                          index,
                        );
                      }}
                    />
                  </Table.Td>
                  <Table.Td className="text-center border p-0">
                    <FormInput
                      id="hsn_code"
                      type="text"
                      name="hsn_code"
                      placeholder="Enter HSN Code"
                      value={item?.hsn_code}
                      minLength={6}
                      maxLength={8}
                      onChange={(e) => {
                        handleDimensionChange(
                          e.target.name,
                          e.target.value.replace(/[^0-9]/g, ""),
                          index,
                        );
                      }}
                    />
                  </Table.Td>
                  <Table.Td className="text-center border flex justify-center">
                    <Trash2
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                      onClick={(e) => {
                        if (!spinner) {
                          if (dimensionData?.length > 1) {
                            handleDelete(e, index);
                          } else {
                            handleDelete(e, index);
                            setDimensionData([initDimension]);
                          }
                        }
                      }}
                    />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <div>
          <FormLabel
            htmlFor="dimension-unit"
            className="text-base text-slate-500"
          >
            DIMENSIONS UNIT <span className="text-red-400">*</span>
          </FormLabel>
          <FormSelect
            value={dimensionUnit}
            onChange={(e) => {
              setDimensionUnit(e.target.value);
            }}
            className="uppercase"
          >
            {lengthUnit &&
              lengthUnit?.map((data: any, index: any) => (
                <option className="uppercase" key={index} value={data?.id}>
                  {data?.value}
                </option>
              ))}
          </FormSelect>
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">
            No. of Pieces <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="regular-form-1"
            type="text"
            value={packages}
            onChange={(e) => {
              setPackages(
                e.target.value
                  .replace(/[^0-9.]/g, "")
                  .replace(/(\..*?)\./g, "$1"),
              );
            }}
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">
            Gross Weight <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="regular-form-1"
            type="text"
            value={grWeight}
            onChange={(e) => {
              setGrWeight(
                e.target.value
                  .replace(/[^0-9.]/g, "")
                  .replace(/(\..*?)\./g, "$1"),
              );
            }}
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">
            Chargeable Weight <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="regular-form-1"
            type="text"
            value={chargeWeight}
            onChange={(e) => {
              setChargeWeight(
                e.target.value
                  .replace(/[^0-9.]/g, "")
                  .replace(/(\..*?)\./g, "$1"),
              );
            }}
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">
            House Number <span className="text-red-500">*</span>
          </FormLabel>
          <FormInput
            id="regular-form-1"
            type="text"
            placeholder="Enter House Number"
            value={modalData?.hawb}
            disabled={mawbPresent}
            onChange={(e) => {
              setModalData({ ...modalData, hawb: e.target.value });
            }}
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">Master Number</FormLabel>
          <FormInput
            id="regular-form-1"
            type="text"
            placeholder="Enter Master Number"
            value={modalData?.mawb}
            maxLength={11}
            disabled={mawbPresent}
            onChange={(e) => {
              setModalData({
                ...modalData,
                mawb: e.target.value.replace(/[^0-9.]/g, ""),
              });
            }}
          />
        </div>
        <div>
          <FormLabel
            htmlFor="dimension-unit"
            className="text-base text-slate-500"
          >
            BUSINESS TYPE <span className="text-red-400">*</span>
          </FormLabel>
          <FormSelect
            value={businessType}
            onChange={(e) => {
              setBusinessType(e.target.value);
            }}
            className="uppercase"
          >
            <option className="uppercase" value={""}>
              Select
            </option>
            <option className="uppercase" value={0}>
              Single Shipment
            </option>
            <option className="uppercase" value={1}>
              Console Shipment
            </option>
          </FormSelect>
        </div>
        {modalData?.shipment_type == 8 || modalData?.shipment_type == 9 ? (
          <>
            <div>
              <FormLabel htmlFor="regular-form-1">GR Waiver </FormLabel>
              <FormInput
                id="regular-form-1"
                type="text"
                placeholder="Enter GR Waiver"
                value={modalData?.gr_waiver}
                onChange={(e) => {
                  setModalData({
                    ...modalData,
                    gr_waiver: e.target.value,
                  });
                }}
              />
            </div>
            <div>
              <FormLabel htmlFor="regular-form-1">ATA Carnet </FormLabel>
              <FormInput
                id="regular-form-1"
                type="text"
                placeholder="Enter ATA Carnet"
                value={modalData?.ata_carnet}
                onChange={(e) => {
                  setModalData({
                    ...modalData,
                    ata_carnet: e.target.value.replace(/[^0-9.]/g, ""),
                  });
                }}
              />
            </div>
            <div>
              <FormLabel htmlFor="regular-form-1">GR Waiver Date</FormLabel>
              <FormInput
                id="regular-form-1"
                type="date"
                value={modalData?.gr_waiver_date}
                onChange={(e) => {
                  setModalData({
                    ...modalData,
                    gr_waiver_date: e.target.value,
                  });
                }}
              />
            </div>
            <div>
              <FormLabel htmlFor="regular-form-1">ATA Carnet Date</FormLabel>
              <FormInput
                id="regular-form-1"
                type="date"
                value={modalData?.ata_carnet_date}
                onChange={(e) => {
                  setModalData({
                    ...modalData,
                    ata_carnet_date: e.target.value,
                  });
                }}
              />
            </div>
            <div>
              <FormLabel htmlFor="regular-form-1">GR Waiver Document</FormLabel>
              <FormInput
                id="regular-form-1"
                type="file"
                onChange={(e) => handleFileChange(e, "gr_waiver_document")}
                ref={grUploadedFile}
              />

              {grUrl ? (
                <Link
                  to={grUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline my-2 block"
                >
                  Uploaded Document
                </Link>
              ) : modalData?.gr_waiver_document ? (
                <Link
                  to={modalData.gr_waiver_document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline my-2 block"
                >
                  Gr Waiver Document
                </Link>
              ) : null}
            </div>
            <div>
              <FormLabel htmlFor="regular-form-1">
                ATA Carnet Document
              </FormLabel>
              <FormInput
                id="regular-form-1"
                type="file"
                onChange={(e) => handleFileChange(e, "ata_carnet_document")}
                ref={ataUploadedFile}
              />
              {ataUrl ? (
                <Link
                  to={ataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline my-2 block"
                >
                  Uploaded Document
                </Link>
              ) : modalData?.ata_carnet_document ? (
                <Link
                  to={modalData.ata_carnet_document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline my-2 block"
                >
                  Ata Carnet Document
                </Link>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </>
  );

  const footer = (
    <div className="flex justify-end ">
      <Button
        className="px-4 py-1 rounded-lg bg-mustard text-white  ml-2 border-none"
        onClick={() => {
          checkDimension();
        }}
        disabled={spinner}
      >
        Submit
        {spinner && (
          <LoadingIcon
            icon="puff"
            color="white"
            className="w-5 h-5 ml-2 stroke-2.5 text-white"
          />
        )}
      </Button>
    </div>
  );

  const handleUpdateScanEvents = async () => {
    if (scanData?.id == 4 && !statusCodes?.includes("302")) {
      setScanSpinner(false);
      return showAlert("Please Add TD Received Events First", "warning");
    }
    if (scanData?.id == 5 && !statusCodes?.includes("300")) {
      setScanSpinner(false);
      return showAlert(
        "Please Add Shipment cleared Customs Events First",
        "warning",
      );
    }
    if (scanData?.id == 6 && !scanData?.remarks) {
      setScanSpinner(false);
      return showAlert("Please Enter Remarks", "warning");
    }
    if (scanData?.id != 6 && !scanData?.remarks) {
      setScanSpinner(false);
      return showAlert("Please Select Scan Events", "warning");
    }
    if (scanData?.id == 2 && !scanData?.td_weight) {
      setScanSpinner(false);
      return showAlert("Please Enter TD Weight", "warning");
    }
    if (scanData?.id == 2 && !scanData?.td_date) {
      setScanSpinner(false);
      return showAlert("Please Enter TD Date", "warning");
    }
    if (scanData?.id != 2) {
      delete scanData?.td_date;
      delete scanData?.td_weight;
    }

    try {
      const res = await Add_scan_events(scanData);
      if (res?.status == 200) {
        setScanData({
          id: "",
          job_id: "",
          remarks: "",
          status_code: "",
          td_date: null,
          td_weight: null,
        });
        loadEnquiryData();
        loadCountData();
        setScanOpen(false);
        showAlert(res?.data?.message);
      } else if (res?.response?.status == 406) {
        showAlert(res?.response?.data?.errors[0]?.msg, "warning");
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      console.log(error);
      showAlert(error?.message, "error");
    } finally {
      setScanSpinner(false);
    }
  };

  const handleTagHouseMaster = async () => {
    if (!packages || Number(packages) <= 0)
      return showAlert("Number of Pieces is required", "warning");
    if (!grossWeight || Number(grossWeight) <= 0)
      return showAlert("Gross Weight  is required", "warning");
    if (!chWeight || Number(chWeight) <= 0)
      return showAlert("Charegeable Weight  is required", "warning");
    if (!modalData?.hawb)
      return showAlert("House Number  is required", "warning");
    if (!businessType) return showAlert("Business Type is required", "warning");
    const formData = new FormData();

    for (const key in modalData) {
      if (
        ![
          "file",
          "ata_carnet",
          "ata_carnet_document",
          "ata_carnet_date",
          "gr_waiver",
          "gr_waiver_document",
          "gr_waiver_date",
        ].includes(key)
      ) {
        formData.append(key, modalData[key]);
      }
    }
    const selectedDimensions =
      dimensionUnit == "2" ? convertedDimension : dimensionData;
    formData.append("shipment_dimensions", JSON.stringify(selectedDimensions));

    formData.append("packages", packages || 0);
    formData.append("gross_weight", grWeight || grossWeight || 0);
    formData.append("chargeable_weight", chargeWeight || chWeight || 0);
    formData.append(
      "shipper_details",
      JSON.stringify(jobData?.shipper_details || {}),
    );
    formData.append(
      "consignee_details",
      JSON.stringify(jobData?.consignee_details || {}),
    );
    formData.append("is_console", businessType || 0);

    if (modalData?.shipment_type == 8 || modalData?.shipment_type == 9) {
      if (modalData?.gr_waiver) {
        formData.append("gr_waiver", modalData?.gr_waiver);
      }
      if (modalData?.ata_carnet) {
        formData.append("ata_carnet", modalData?.ata_carnet);
      }

      if (modalData?.gr_waiver_date) {
        formData.append("gr_waiver_date", modalData?.gr_waiver_date);
      }
      if (modalData?.ata_carnet_date) {
        formData.append("ata_carnet_date", modalData?.ata_carnet_date);
      }

      if (modalData?.gr_waiver_document) {
        formData.append("gr_waiver_document", modalData?.gr_waiver_document);
      }
      if (modalData?.ata_carnet_document) {
        formData.append("ata_carnet_document", modalData?.ata_carnet_document);
      }
    }
    setSpinner(true);
    try {
      const res = await Tag_house_master(formData);
      if (res?.status == 200) {
        loadEnquiryData();
        loadCountData();
        setOpen(false);
        showAlert(res?.data?.message);
        setDimensionUnit("1");
        setBusinessType("");
        setAtaURL(null);
        setGrURL(null);
      } else if (res?.response?.status == 406) {
        showAlert(res?.response?.data?.errors[0]?.msg, "warning");
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      console.log(error);
      showAlert(error?.message, "error");
    } finally {
      setSpinner(false);
    }
  };

  const loadEnquiryData = async () => {
    setLoading(true);
    try {
      const res = await Get_Enquiry_list(
        {
          limit: 5,
          page: page - 1,
        },
        {
          from_date: "",
          to_date: "",
          booking_status: [5],
          ...(datatoget?.franchisee_id
            ? { franchisee_id: [datatoget?.franchisee_id] }
            : {}),
        },
        debouncedSearch.trim() || "",
        datatoget?.weight || "",
        datatoget?.destination_country || "",
      );
      if (res?.status == 200) {
        setReadyToExecute(res?.data?.data || []);
        setDatatoget((pre: any) => ({
          ...pre,
          totalpages2: Math.ceil(res?.data?.total / 5),
        }));
      } else {
        setReadyToExecute([]);
        setDatatoget((pre: any) => ({
          ...pre,
          totalpages2: 1,
        }));
      }
    } catch (error) {
      showAlert(error?.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiryData();
  }, [
    page,
    debouncedSearch,
    datatoget?.franchisee_id,
    datatoget?.destination_country,
    datatoget?.weight,
    datatoget?.refresh,
  ]);

  const columns = [
    { field: "action", headerName: "Action" },
    { field: "booking_no", headerName: "Enquiry No." },
    { field: "created_date", headerName: "Date" },
    { field: "franchisee_name", headerName: "Franchisee" },
    { field: "country_name", headerName: "Destination" },
    { field: "weight", headerName: "Weight" },
    { field: "checklist", headerName: "Checklist" },
    { field: "checklist_docs", headerName: "Checklist Docs" },
    {
      field: "airwaybilno",
      headerName: `${
        modalData?.shipment_type == "8" && modalData?.mode == "2"
          ? "HBL"
          : "HAWB"
      }`,
    },
    {
      field: "master",
      headerName: `${
        modalData?.shipment_type == "8" && modalData?.mode == "2"
          ? "MBL"
          : "MAWB"
      }`,
    },
  ];

  const rows = readyToExecute?.map((item: any, index: any) => {
    const Action = (
      <Menu>
        <Menu.Button
          as={Button}
          variant="primary"
          className="bg-blue-100 text-blue-500 border-blue-500"
        >
          <UserCog className="w-5 stroke-2.5" />
          <ChevronDown className="w-4 stroke-2.5 mt-1" />
        </Menu.Button>
        <Menu.Items
          className="w-48"
          placement={`${index > 2 ? "left-start" : "left-start"}`}
        >
          <Menu.Item
            onClick={() => {
              setAtaURL(null);
              setGrURL(null);
              setDimensionData([initDimension]);
              setExchangedataSell(intexchangedataSell);
              setExchangeSellLocked(false);
              setExchangeBuyLocked(false);
              setImportBookingType(item?.import_booking ?? null);
              setModalData({
                enquiry_id: "",
                job_id: "",
                hawb: "",
                mawb: "",
                house_pdf: null,
                file: null,
                booking_no: "",
                franchisee_id: "",
                courier_id: "",
              });
              setMawbPresent(!!item?.master);
              setJobData({
                job_id: item?.job_id,
                org_zip: item?.org_zip || "",
                org_city: item?.org_city || "",
                org_state: item?.org_state || "",
                dest_zip: item?.dest_zip || "",
                dest_city: item?.dest_city || "",
                dest_state_code: item?.dest_state_code || "",
                dest_country_id: item?.dest_country_id,
                import_booking: item?.import_booking || 1,
                import_booking_type: item?.import_booking_type || 1,
              });
              setBusinessType(item?.is_console ? Number(item.is_console) : 0);
              handleGetJob(item?.job_id);
              setModalData({
                ...modalData,
                enquiry_id: item?.id,
                job_id: item?.job_id,
                hawb: item?.airwaybilno,
                mawb: item?.master || "",
                house_pdf: item?.house_pdf,
                booking_no: item?.booking_no,
                franchisee_id: item?.franchisee_id,
                courier_id: item?.courier_id,
                shipment_type: item?.shipment_type,
                ...(item?.shipment_type == "8"
                  ? {
                      gr_waiver: item?.fair_data?.gr_waiver || "",
                      ata_carnet: item?.fair_data?.ata_carnet || "",
                      gr_waiver_date: item?.fair_data?.gr_waiver_date || "",
                      ata_carnet_date: item?.fair_data?.ata_carnet_date || "",
                      gr_waiver_document:
                        item?.fair_data?.gr_waiver_document || "",
                      ata_carnet_document:
                        item?.fair_data?.ata_carnet_document || "",
                      mode: item?.fair_data?.mode,
                    }
                  : {}),
              });
              setDimensionData(item?.shipment_dimensions || [initDimension]);
              setPackages(item?.packages);
              setGrWeight(item?.gross_weight);
              setChargeWeight(item?.chargeable_weight);
              setDetails({
                booking_no: item?.booking_no,
                franchisee_id: item?.franchisee_id,
              });
              handleCharges(item?.id);
              setOpen(true);
            }}
          >
            <Tag className="w-4 mr-2" /> Tag House/Master
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              setScanData((pre) => ({
                ...pre,
                job_id: item?.job_id,
                id: "",
                remarks: "",
                status_code: "",
                td_date: null,
                td_weight: null,
                booking_no: item?.booking_no,
                franchisee_id: item?.franchisee_id,
              }));

              handleTrack(item?.airwaybilno);
              setScanOpen(true);
            }}
          >
            <ScanLine className="w-4 mr-2" /> Update Scan Events
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              const data = JSON.parse(
                JSON.stringify(
                  item?.shipment_dimensions || [
                    {
                      item_description: "",
                      weight: "",
                      length: "",
                      breadth: "",
                      height: "",
                      quantity: "",
                      value: "",
                      hsn_code: "",
                    },
                  ],
                ),
              );
              setDimensionData(data);
              setDimensionUnit("1");
              setEditData(item);
              setChWeight(item?.chargeable_weight || 0);
              setGrWeight(item?.gross_weight || 0);
              setJobData((prev: any) => ({
                ...prev,
                franchisee_id: item?.franchisee_id,
                job_id: item?.job_id,
                shipment_dimensions: item?.shipment_dimensions || [],
              }));
              handleGetJob(item?.job_id, true);
              setExchangedataSell(intexchangedataSell);
              setExchangeSellLocked(false);
              setExchangeBuyLocked(false);
              setImportBookingType(item?.import_booking ?? null);
              handleCharges(item?.id);
              setShowEditBooking(true);
            }}
          >
            <Edit className="w-4 mr-2" /> Edit Booking
          </Menu.Item>
        </Menu.Items>
      </Menu>
    );

    const Docs =
      item?.checklist_docs?.length > 0 ? (
        <Menu>
          <Menu.Button
            as={Button}
            variant="primary"
            className="bg-blue-100 text-blue-500 border-blue-500"
          >
            <FileText className="w-5 stroke-2.5" />
            <ChevronDown className="w-4 stroke-2.5 mt-1" />
          </Menu.Button>
          <Menu.Items className="w-48 z-50" placement="custom">
            {item?.checklist_docs?.map((ele, index) => (
              <Menu.Item
                key={index}
                onClick={() => downloadAttachment(ele, `Document ${index + 1}`)}
              >
                <FileText className="w-4 mr-2" /> Document {index + 1}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
      ) : (
        <p className="text-gray-400">Not Available</p>
      );

    const Checklist = (
      <>
        {item?.is_checklist == 1 ? (
          <p className=" text-green-500 text-[13px]">Done</p>
        ) : item?.is_checklist == 0 ? (
          <p className=" text-mustard text-[13px] ">Pending</p>
        ) : (
          "N.A."
        )}
      </>
    );

    return {
      ...item,
      franchisee_name:
        franchiseeData?.find((cus) => cus.franchisee_id == item.franchisee_id)
          ?.franchisee_name || "-",
      country_name: countryData?.find(
        (con) => con.country_id == item.dest_country_id,
      )?.country_name,
      created_date: formatDateWithoutTime(item?.created_date),
      weight: item?.weight + " " + item?.weight_unit,
      master: item?.master || "-",
      checklist: Checklist,
      checklist_docs: Docs,
      action: Action,
    };
  });

  useEffect(() => {
    Get_Cargo_Events().then((res: any) => setScanEvents(res?.data?.data));
    Get_Length_Unit().then((res) => setLengthUnit(res?.data?.data));
    Get_shipment().then((res) => setShipmentType(res?.data?.data));
    Get_Weight_Unit().then((res) => setWeightUnit(res?.data?.data));
    Get_Commodity_Type().then((res) => setCommodityType(res?.data?.data));
    Get_Clearance_Type().then((res) => setClearanceType(res?.data?.data));
    Get_Incoterm().then((res) => setIncoterm(res?.data?.data));
    Charge_head_drop_down(1).then((res) => setChargesList(res?.data?.data));
    Get_Currency().then((res) => setCurrencyData(res?.data?.data));
    Get_customer_type().then((res) => setAlltypedata(res?.data?.data));
  }, []);

  useEffect(() => {
    if (dimensionUnit == 2) {
      const clonedData = JSON.parse(JSON.stringify(dimensionData));
      const updatedData = clonedData.map((item: any) => ({
        ...item,
        height: (parseFloat(item?.height) * 2.54).toFixed(2),
        length: (parseFloat(item?.length) * 2.54).toFixed(2),
        breadth: (parseFloat(item?.breadth) * 2.54).toFixed(2),
      }));

      setConvertedDimension(updatedData);
    }
  }, [JSON.stringify(dimensionData), dimensionUnit]);

  const editBookingDescription = (
    <>
      {/* <div className=" flex justify-center mb-2">
        <div className=" bg-gray-200 rounded p-2">
          <b>AWB No: </b>
          {editData?.airwaybilno}
        </div>
      </div> */}

<div className="flex-wrap lg:flex-nowrap flex gap-2 mb-3">
<div className="bg-[#fff3dc] rounded-lg p-[8px] flex w-full lg:w-auto">
    <figure className="w-[35px] flex items-center justify-center">
      <FileText className="w-[35px]  text-[#ba9650] " />
    </figure>
    <aside className="md:border-l md:border-[#fbe9c7] md:pl-2 md:pr-2 w-[80%] leading-[18px]">
        <p className="text-[12px] uppercase text-[#757575] w-full">AWB No.</p>
        <h4 className="font-medium text-[14px] text-[#383838] w-full flex justify-between items-center">
            <span className="capitalize font-bold cursor-pointer">           {editData?.airwaybilno}</span>
           
        </h4>
    </aside>
</div>
</div>






      <div className="col-span-12 h-[50vh] overflow-auto ">
        <div className="box">
          <div className="space-y-4 px-2 py-1">
            <div className="grid grid-cols-12 gap-x-4 gap-y-4 items-end">
              <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                <FormLabel className="text-sm text-slate-500 whitespace-nowrap">
                  FRANCHISEE <span className="text-red-400">*</span>
                </FormLabel>
                <FormInput
                  value={
                    franchiseeData?.find(
                      (cus) => cus?.franchisee_id == editData?.franchisee_id,
                    )?.franchisee_name || "-"
                  }
                  disabled
                />
              </div>
              <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                <FormLabel
                  htmlFor="origin-country"
                  className="text-sm text-slate-500 whitespace-nowrap"
                >
                  SHIPMENT TYPE <span className="text-red-400">*</span>
                </FormLabel>
                <FormSelect
                  id="default"
                  disabled
                  value={editData?.shipment_type}
                >
                  <option value="">Select Shipment Type</option>
                  {shipmentType?.map(
                    (type) =>
                      type?.booking_shipment_type_id !== 2 &&
                      type?.is_active == 1 && (
                        <option
                          key={type?.booking_shipment_type_id}
                          value={type?.booking_shipment_type_id}
                        >
                          {type?.shipment_type}
                        </option>
                      ),
                  )}
                </FormSelect>
              </div>
              <div className="col-span-12 sm:col-span-12 lg:col-span-6 flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[110px]">
                  <FormLabel
                    htmlFor="chargeable_weight"
                    className="text-sm text-slate-500 whitespace-nowrap"
                  >
                    CHARGEABLE WEIGHT <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormInput
                    id="weight"
                    type="text"
                    value={chWeight}
                    disabled
                  />
                </div>
                <div className="flex-1 min-w-[110px]">
                  <FormLabel
                    htmlFor="gross_weight"
                    className="text-sm text-slate-500 whitespace-nowrap"
                  >
                    GROSS WEIGHT <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormInput
                    id="weight"
                    type="text"
                    value={grWeight}
                    onChange={(e) => {
                      setGrWeight(
                        e.target.value
                          .replace(/[^0-9.]/g, "")
                          .replace(/(\..*?)\./g, "$1"),
                      );
                    }}
                  />
                </div>
                <FormSelect
                  disabled
                  value={editData?.weight_unit}
                  className="w-20 h-10 flex-shrink-0"
                >
                  {weightUnit &&
                    weightUnit?.map((data: any, index: any) => (
                      <option
                        className="uppercase"
                        key={index}
                        value={data?.value}
                      >
                        {data?.value}
                      </option>
                    ))}
                </FormSelect>
              </div>
              <>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <FormLabel
                    htmlFor="commodity"
                    className="text-sm text-slate-500 whitespace-nowrap"
                  >
                    COMMODITY <span className="text-red-400">*</span>
                  </FormLabel>
                  <CommonSearchableAll
                    apiEndpoint="/admin/commodity-type"
                    placeholder="Search Commodity"
                    zIndex="50"
                    selecteddata={commoditySearch}
                    setSelecteddata={setCommoditySearch}
                    fun1={handleCommoditySelect}
                    funtoempty={handleCommodityClear}
                    key1={"key"}
                    comingselectedname={"commodity"}
                    comingselectedid={"commodity_id"}
                    id={editData?.commodity}
                  />
                </div>
                {(editData?.shipment_type == 4 ||
                  editData?.shipment_type == 5 ||
                  editData?.shipment_type == 8) && (
                  <>
                    <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                      <FormLabel
                        htmlFor="clearence-type"
                        className="text-sm text-slate-500 whitespace-nowrap"
                      >
                        CLEARANCE TYPE <span className="text-red-400">*</span>
                      </FormLabel>

                      <FormSelect
                        value={String(editData?.clearence_type ?? "")}
                        onChange={(e) => {
                          setEditData((prev: any) => ({
                            ...prev,
                            clearence_type: e.target.value,
                          }));
                        }}
                      >
                        <option value="">Select Clearance Type</option>
                        {clearanceType &&
                          (clearanceType as any[])
                            ?.filter((ele: any) => {
                              if (editData?.shipment_type == 8) {
                                return ele.id !== 3;
                              }
                              return true;
                            })
                            ?.map((ele: any, index: any) => (
                              <option key={index} value={String(ele.id)}>
                                {ele.name}
                              </option>
                            ))}
                      </FormSelect>
                    </div>

                    <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                      <FormLabel
                        htmlFor="incoterm"
                        className="text-sm text-slate-500 whitespace-nowrap"
                      >
                        INCOTERM <span className="text-red-400">*</span>
                      </FormLabel>

                      <FormSelect
                        id="incoterm"
                        value={String(editData?.incoterm ?? "")}
                        onChange={(e) => {
                          setEditData((prev: any) => ({
                            ...prev,
                            incoterm: e.target.value,
                          }));
                        }}
                      >
                        <option value="">Select Incoterm</option>
                        {incoterm &&
                          (incoterm as any[])?.map((ele: any, index: any) => (
                            <option key={index} value={String(ele?.id)}>
                              {ele?.name}
                            </option>
                          ))}
                      </FormSelect>
                    </div>
                    <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                      <FormLabel
                        htmlFor="dimension-unit"
                        className="text-sm text-slate-500 whitespace-nowrap"
                      >
                        DIMENSIONS UNIT <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormSelect
                        value={dimensionUnit}
                        onChange={(e) => {
                          setDimensionUnit(e.target.value);
                        }}
                        className="uppercase"
                      >
                        {lengthUnit &&
                          lengthUnit?.map((data: any, index: any) => (
                            <option
                              className="uppercase"
                              key={index}
                              value={data?.id}
                            >
                              {data?.value}
                            </option>
                          ))}
                      </FormSelect>
                    </div>
                    <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                      <FormLabel
                        htmlFor="currency-select"
                        className="text-sm text-slate-500 whitespace-nowrap"
                      >
                        CURRENCY
                      </FormLabel>
                      <FormSelect
                        id="currency-select"
                        value={editData?.currency_id || ""}
                        onChange={(e) => {
                          setEditData((prev: any) => ({
                            ...prev,
                            currency_id: e.target.value,
                          }));
                        }}
                        className="uppercase"
                      >
                        {currencyData &&
                          currencyData?.map((data: any, index: any) => (
                            <option
                              className="uppercase"
                              key={index}
                              value={data?.id}
                            >
                              {data?.currency}
                            </option>
                          ))}
                      </FormSelect>
                    </div>
                  </>
                )}
              </>
            </div>
            <div className="mb-4">
              <div>
                <div className="flex items-end justify-between my-2">
                  <FormLabel
                    htmlFor="regular-form-1"
                    className="text-base font-medium text-gray-900"
                  >
                    Shipment Dimensions
                  </FormLabel>
                  {/* <Button
                    className="bg-mustard text-white p-2"
                    disabled={weightSpinner}
                    onClick={() =>
                      getChargeableWeight(
                        dimensionUnit == 2 ? convertedDimension : dimensionData,
                        editData?.courier_id,
                        1,
                      )
                    }
                  >
                    Calculate Chargeable Weight
                    {weightSpinner && (
                      <LoadingIcon
                        icon="puff"
                        color="white"
                        className="w-5 h-5 ml-2 stroke-2.5 text-white"
                      />
                    )}
                  </Button> */}
                </div>

                <div className="overflow-x-auto">
                  <CommonTable
                    minHeightTable="14%"
                    forReadyToExecuteEdit="1"
                    className="h-[100vh]"
                    columns={[
                      {
                        field: "sno",
                        headerName: (
                          <div className="flex gap-2 items-center justify-center">
                            <p>S.No.</p>
                            <Plus
                              className="w-[20px] h-[20px] bg-green-400 text-white p-[3px] rounded-sm cursor-pointer stroke-2.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!spinner) {
                                  setDimensionData((prev) => [
                                    ...prev,
                                    {
                                      ...initDimension,
                                      item_description:
                                        dimensionData[dimensionData.length - 1]
                                          ?.item_description,
                                      hsn_code:
                                        dimensionData[dimensionData.length - 1]
                                          ?.hsn_code,
                                    },
                                  ]);
                                }
                              }}
                            />
                            <Minus
                              className="w-[20px] h-[20px] bg-red-500 text-white p-[3px] rounded-sm cursor-pointer stroke-2.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!spinner) {
                                  if (dimensionData?.length <= 1) {
                                    setDimensionData([initDimension]);
                                  } else {
                                    setDimensionData((prev) =>
                                      prev.slice(0, -1),
                                    );
                                  }
                                }
                              }}
                            />
                          </div>
                        ),
                      },
                      { field: "item_description", headerName: "DESCRIPTION" },
                      { field: "weight", headerName: "WEIGHT (in kgs)" },
                      { field: "length", headerName: "LENGTH (in cms)" },
                      { field: "breadth", headerName: "BREADTH (in cms)" },
                      { field: "height", headerName: "HEIGHT (in cms)" },
                      { field: "quantity", headerName: "QUANTITY" },
                      { field: "value", headerName: "VALUE (in INR)" },
                      { field: "hsn_code", headerName: "HSN CODE" },
                      { field: "action", headerName: "ACTION" },
                    ]}
                    row={dimensionData?.map((item: any, index: any) => {
                      const Action = (
                        <Trash2
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={(e) => {
                            if (!spinner) {
                              if (dimensionData?.length > 1) {
                                handleDelete(e, index);
                              } else {
                                handleDelete(e, index);
                                setDimensionData([initDimension]);
                              }
                            }
                          }}
                        />
                      );
                      const description = (
                        <FormInput
                          id="item_description"
                          type="text"
                          name="item_description"
                          placeholder="Enter Description"
                          value={item?.item_description}
                          onChange={(e) => {
                            handleDimensionChange(
                              e.target.name,
                              e.target.value?.replace(/[^a-zA-Z0-9 ]/g, ""),
                              index,
                            );
                          }}
                        />
                      );
                      const weight = (
                        <FormInput
                          id="weight"
                          type="text"
                          name="weight"
                          placeholder="Enter Weight"
                          value={item?.weight}
                          onChange={(e) => {
                            handleDimensionChange(
                              e.target.name,
                              e.target.value
                                .replace(/[^0-9.]/g, "")
                                .replace(/(\..*?)\./g, "$1")
                                .replace(/(\.\d{2})\d+/, "$1"),
                              index,
                            );
                          }}
                        />
                      );
                      const length = (
                        <FormInput
                          id="length"
                          type="text"
                          name="length"
                          placeholder="Enter Length"
                          value={item?.length}
                          onChange={(e) => {
                            handleDimensionChange(
                              e.target.name,
                              e.target.value
                                .replace(/[^0-9.]/g, "")
                                .replace(/(\..*?)\./g, "$1")
                                .replace(/(\.\d{2})\d+/, "$1"),
                              index,
                            );
                          }}
                        />
                      );
                      const breadth = (
                        <FormInput
                          id="breadth"
                          type="text"
                          name="breadth"
                          placeholder="Enter Breadth"
                          value={item?.breadth}
                          onChange={(e) => {
                            handleDimensionChange(
                              e.target.name,
                              e.target.value
                                .replace(/[^0-9.]/g, "")
                                .replace(/(\..*?)\./g, "$1")
                                .replace(/(\.\d{2})\d+/, "$1"),
                              index,
                            );
                          }}
                        />
                      );
                      const height = (
                        <FormInput
                          id="height"
                          type="text"
                          name="height"
                          placeholder="Enter Height"
                          value={item?.height}
                          onChange={(e) => {
                            handleDimensionChange(
                              e.target.name,
                              e.target.value
                                .replace(/[^0-9.]/g, "")
                                .replace(/(\..*?)\./g, "$1")
                                .replace(/(\.\d{2})\d+/, "$1"),
                              index,
                            );
                          }}
                        />
                      );
                      const quantity = (
                        <FormInput
                          id="quantity"
                          type="text"
                          name="quantity"
                          placeholder="Enter Quantity"
                          value={item?.quantity}
                          onChange={(e) => {
                            handleDimensionChange(
                              e.target.name,
                              e.target.value.replace(/[^0-9]/g, ""),
                              index,
                            );
                          }}
                        />
                      );
                      const value = (
                        <FormInput
                          id="value"
                          type="text"
                          name="value"
                          placeholder="Enter Value"
                          value={item?.value}
                          onChange={(e) => {
                            handleDimensionChange(
                              e.target.name,
                              e.target.value
                                .replace(/[^0-9.]/g, "")
                                .replace(/(\..*?)\./g, "$1")
                                .replace(/(\.\d{2})\d+/, "$1"),
                              index,
                            );
                          }}
                        />
                      );
                      const hsn_code = (
                        <FormInput
                          id="hsn_code"
                          type="text"
                          name="hsn_code"
                          placeholder="Enter HSN Code"
                          value={item?.hsn_code}
                          minLength={6}
                          maxLength={8}
                          onChange={(e) => {
                            handleDimensionChange(
                              e.target.name,
                              e.target.value
                                .replace(/[^0-9.]/g, "")
                                .replace(/(\..*?)\./g, "$1")
                                .replace(/(\.\d{2})\d+/, "$1"),
                              index,
                            );
                          }}
                        />
                      );
                      return {
                        ...item,
                        sno: index + 1,
                        item_description: description,
                        weight: weight,
                        length: length,
                        height: height,
                        breadth: breadth,
                        quantity: quantity,
                        value: value,
                        hsn_code: hsn_code,
                        action: Action,
                      };
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 border-2 p-4 rounded-md ">
              <div className="flex gap-4 items-center">
                {" "}
                <h1 className="font-bold text-sm md:text-lg whitespace-nowrap">
                  Sender Details
                </h1>
                <Tippy
                  content="Add Sender Details"
                  options={{ placement: "right" }}
                >
                  <Lucide
                    icon="PlusCircle"
                    className="w-6 h-6 cursor-pointer text-mustard"
                    onClick={() => {
                      setSenderOpen(true);
                    }}
                  />
                </Tippy>
              </div>
              <div className="flex gap-4 items-center">
                {" "}
                <h1 className="font-bold text-sm md:text-lg whitespace-nowrap">
                  Receiver Details
                </h1>
                <Tippy
                  content="Add Receiver Details"
                  options={{ placement: "right" }}
                >
                  <Lucide
                    icon="PlusCircle"
                    className="w-6 h-6 cursor-pointer text-mustard"
                    onClick={() => {
                      setReceiverOpen(true);
                    }}
                  />
                </Tippy>
              </div>
              <div>
                <p className="font-semibold ">
                  {jobData?.shipper_details?.consigner_first_name}
                </p>
                <p className="font-semibold ">
                  {jobData?.shipper_details?.consigner_address_1}
                </p>
                <p className="font-semibold ">
                  {jobData?.shipper_details?.consigner_city}
                </p>
                <p className="font-semibold ">
                  {jobData?.shipper_details?.consigner_pincode}
                </p>
              </div>
              <div>
                <p className="font-semibold ">
                  {jobData?.consignee_details?.consignee_first_name}
                </p>
                <p className="font-semibold ">
                  {jobData?.consignee_details?.consignee_address_1}
                </p>
                <p className="font-semibold ">
                  {jobData?.consignee_details?.consignee_city}
                </p>
                <p className="font-semibold ">
                  {jobData?.consignee_details?.consignee_pincode}
                </p>
              </div>
            </div>

            <SellBuyForm
              chargesdata={chargesList}
              spotData={editData}
              sellingcharges={sellingcharges}
              setSellingCharges={setSellingCharges}
              buycharges={buycharges}
              setBuyCharges={setBuyCharges}
              currencydata={currencyData}
              fun1={fun1}
              funtoempty={funtoempty}
              exchangedata={exchangedata}
              setExchangedata={setExchangedata}
              exchangedataSell={exchangedataSell}
              setExchangedataSell={setExchangedataSell}
              disableExchangeSell={true}
              disableExchangeBuy={false}
              importBookingType={importBookingType}
              totalbuy={totalbuy}
              totalSell={totalSell}
              toggle={toggle}
              setToggle={setToggle}
              alltypedata={alltypedata}
              chargeable_weight={totalWeight}
              oldCharges={oldCharges}
              currencyname={
                currencyData?.find(
                  (item: any) => item?.id == cargoOverseas?.currency,
                )?.currency || ""
              }
              singlefranchiseedata={cargoOverseas}
              gstStatus={editGstStatus}
            />
          </div>
        </div>
      </div>
    </>
  );

  const editBookingFooter = (
    <>
      <div className="flex justify-end gap-2">
        <div className="text-left">
          <FormLabel>Sub-Total (₹) : </FormLabel>
          <FormInput
            disabled
            className="text-right"
            value={
              toggle == 2
                ? indianFormat(Number(totalbuy))
                : indianFormat(Number(totalSell))
            }
          />
        </div>
        <div className="text-left">
          <FormLabel>
            GST{" "}
            {(toggle != 2 &&
              (cargoOverseas?.is_overseas == 1 || importBookingType == 3)) ||
            editGstStatus == 4
              ? "(0%) "
              : ""}
            (₹)
          </FormLabel>
          <FormInput
            disabled
            className="text-right"
            value={
              toggle == 2
                ? indianFormat(
                    parseFloat(
                      Number(
                        getgsttotal(buycharges, "inr_amount", "buy"),
                      ).toFixed(3),
                    ),
                  )
                : cargoOverseas?.is_overseas == 1 ||
                    editGstStatus == 4 ||
                    importBookingType == 3
                  ? "0.00"
                  : indianFormat(
                      getgsttotal(sellingcharges, "inr_amount", "sell"),
                    )
            }
          />
        </div>
        <div className="text-left">
          <FormLabel>Total Amt (₹): </FormLabel>
          <FormInput
            disabled
            className="text-right"
            value={
              toggle == 2
                ? indianFormat(
                    parseFloat(
                      (
                        Number(totalbuy) +
                        getgsttotal(buycharges, "inr_amount", "buy")
                      ).toFixed(3),
                    ),
                  )
                : indianFormat(
                    cargoOverseas?.is_overseas == 1 || importBookingType == 3
                      ? Number(totalSell)
                      : Number(totalSell) +
                          getgsttotal(sellingcharges, "inr_amount", "sell"),
                  )
            }
          />
        </div>
        {toggle != 2 && cargoOverseas?.is_overseas == 1 ? (
          <div className="text-left">
            <FormLabel>
              Total Amt (
              {cargoOverseasCurrency?.symbol || cargoOverseasCurrency?.currency}
              ):
            </FormLabel>
            <FormInput
              disabled
              className="text-right"
              value={indianFormat(
                Number(totalSell) / (Number(cargoOverseas?.exchange_rate) || 1),
              )}
            />
          </div>
        ) : null}
        <div className="flex items-end ">
          <Button
            variant="mustard"
            disabled={spinner || editSpinner || bookSpinner}
            onClick={handleEditDetails}
            className="ml-2 bg-mustard p-2 whitespace-nowrap"
          >
            Edit Booking
            {(editSpinner || bookSpinner) && (
              <LoadingIcon
                icon="puff"
                color="white"
                className="w-5 h-5 ml-2 stroke-2.5 text-white"
              />
            )}
          </Button>
        </div>
      </div>
    </>
  );

  // on scroll animatil this useffect load a card after one sec delay when you scroll

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(
      ".rte-reveal:not(.rte-reveal-visible)",
    );
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Number((a.target as HTMLElement).dataset.revealIndex) -
              Number((b.target as HTMLElement).dataset.revealIndex),
          )
          .forEach((entry, i) => {
            const el = entry.target as HTMLElement;
            el.style.transitionDelay = `${i * 600}ms`;
            el.classList.remove("opacity-0", "translate-y-6");
            el.classList.add(
              "opacity-100",
              "translate-y-0",
              "rte-reveal-visible",
            );
            const onEnd = (e: TransitionEvent) => {
              if (e.propertyName === "transform") {
                el.classList.remove("translate-y-0");
                el.removeEventListener("transitionend", onEnd);
              }
            };
            el.addEventListener("transitionend", onEnd);
            observer.unobserve(entry.target);
          });
      },
      { threshold: 0.1 },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [readyToExecute]);

  // end

  return (
    <>
      <div className=" NewtableBox min-h-auto lg:h-full bg-white rounded-md justify-between shadow-blue-900 border border-[#fff]  ">
        <div className=" tbaleTittle p-2 bg-[#e9edf2] flex justify-between items-center rounded-t-md  ">
          <div className="flex items-end gap-2">
            <h2 className="text-sm font-medium">
              {/* <button onClick={ToggleClass} className="p-0">
              <ChevronDown className="relative top-1 w-[18px]" />
            </button> */}
              Ready To Execute
            </h2>
          </div>

          <div className=" relative w-200">
            <FormInput
              className="h-[30px] w-full rounded-md border border-[#e5e7eb] pl-3 pr-10 text-sm focus:border-[#f0b646] focus:ring-[#f0b646]"
              id="vertical-form-1"
              type="text"
              placeholder="Search "
              onChange={(e) => {
                setDatatoget((pre: any) => ({
                  ...pre,
                  search2: e.target.value.replace(/\s/g, ""),
                  page2: 1,
                }));
              }}
            />

            <button className=" searchListTable absolute top-[6px] right-2 text-stone-300">
              <Search className="w-[17px] h-[17px]" />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-3 flex items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="tablelist p-3">
            {readyToExecute.length == 0 ? (
              <div className="flex items-center justify-center h-[40vh]">
                <img
                  src={NoData}
                  alt="No Data Found!"
                  className="w-1/2 rounded-full opacity-50"
                />
              </div>
            ) : (
              <>
                {/* Old table UI - commented out in favor of card UI below, functionality unchanged */}
                {/* <div className={`overflow-x-auto`}>
                  <CommonTable
                    minHeightTable="94%"
                    className="h-[100vh]"
                    columns={columns}
                    row={rows}
                    limit={5}
                    currentPage={page}
                    ops={1}
                  />
                </div> */}

                <div className="">
                  {rows?.map((item: any, index: number) => (
                    <div
                      key={item?.id || item?.job_id || index}
                      data-reveal-index={index}
                      className="rte-reveal w-full border rounded-lg mb-3 group bg-[#fff] border-[#fff1d3] even:bg-[#fff] even:border-[#eaf1f6] hover:bg-[#fff] hover:border-[#E6E6E6] opacity-0 translate-y-6 transition-all duration-700 ease-out"
                    >
                      <div className="justify-between border-[#fff1d3] border-b w-full block lg:flex pt-[5px] pb-[3px] px-2 items-center bg-[#fffbf2] group-even:bg-[#f6faff] rounded-t-lg group-even:border-[#eaf1f6] group-hover:bg-[#F8F8F8] group-hover:border-[#E6E6E6]">
                        <div className="flex relative mb-2 lg:mb-0">
                          <figure className="bg-[#FFF0CE] group-even:bg-[#E8F2FF] rounded-full p-[2px] w-[30px] h-[30px] justify-between flex items-center group-hover:bg-[#e3e3e3]">
                            <FileText className="w-[18px] h-[18px] text-[#B68F34] group-even:text-[#5A81B4] m-auto group-hover:text-[#303030]" />
                          </figure>
                          <aside className="ml-2 leading-[14px]">
                            <h2 className="text-[#9099a2] text-[12px] font-medium uppercase leading-[14px]">
                              {columns?.find((c) => c.field === "airwaybilno")
                                ?.headerName || "HAWB"}
                              : {item?.airwaybilno || "-"}
                            </h2>
                            <h3 className="text-[12px] font-bold text-[#e1a722] rounded-[10px]">
                              ENQUIRY NO: {item?.booking_no || "-"}
                            </h3>
                          </aside>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="text-left lg:text-right leading-[16px]">
                            <h4 className="font-medium text-[13px]">
                              WEIGHT :<span> {item?.weight}</span>
                            </h4>
                            <p className="text-[13px] text-[#797979]">
                              {item?.created_date || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 pt-3 pb-2">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-12 lg:col-span-8">
                            <div className="w-full">
                              <div className="w-full font-medium text-[14px]">
                                Name : {item?.franchisee_name || "-"}
                              </div>
                              <div className="w-full block lg:flex gap-x-5 mt-1">
                                <div className="leading-[16px] mb-2 lg:mb-0">
                                  <small className="text-[11px] text-[#797979] flex items-center">
                                    <i className="w-[5px] h-[5px] bg-green-500 group-even:bg-[#6EA8E0] rounded-full mr-1 inline-block group-hover:bg-[#a0a0a0]"></i>
                                    ORIGIN
                                  </small>
                                  <p className="text-[14px] text-[#303030]">
                                    {countryData?.find(
                                      (con: any) =>
                                        con?.country_id == item?.org_country_id,
                                    )?.country_name || "-"}
                                  </p>
                                </div>
                                <div className="leading-[16px]">
                                  <small className="text-[11px] text-[#797979] flex items-center">
                                    <i className="w-[5px] h-[5px] bg-[#efb847] group-even:bg-[#6EA8E0] rounded-full mr-1 inline-block group-hover:bg-[#a0a0a0]"></i>
                                    DESTINATION
                                  </small>
                                  <p className="text-[14px] text-[#303030]">
                                    {item?.country_name || "-"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-12 lg:col-span-4">
                            <div className="flex relative gap-2 justify-end items-center">
                              <div className="flex justify-center items-center">
                                {item?.action}
                              </div>
                            </div>
                            <div className="w-full text-[13px] mt-2 text-left lg:text-right">
                              {columns?.find((c) => c.field === "master")
                                ?.headerName || "MAWB"}
                              : <span>{item?.master}</span>
                            </div>
                          </div>

                          <div className="col-span-12 lg:col-span-12">
                            <div className=" block lg:flex justify-between  w-full  border-t border-[#f2f2f2] px-[0] pt-[4px]">
                              <h2 className="flex w-full lg:w-[50%] text-[#9099a2] text-[11px] items-center font-medium   leading-[20px]  ">
                                <i className="mr-1 bg-[#f1f5f9] border-none p-[2px] w-[24px] h-[24px] rounded-full flex justify-center items-center ">
                                  <User
                                    className="w-[14px] h-[14px]  text-[#959595]"
                                    strokeWidth={3}
                                  />
                                </i>
                                <h3 className="text-[#959595] flex">
                                  STATUS&nbsp;:&nbsp;
                                  <span className="text-[14px]">
                                    {item?.checklist}
                                  </span>
                                </h3>
                              </h2>

                              <div className=" text-[13px] w-full lg:w-[50%] lg:justify-end text-left lg:text-right flex items-center gap-1">
                                Checklist Docs &nbsp;:&nbsp;
                                <span className="text-[#959595]">
                                  {item?.checklist_docs}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <CommonPagination
                  onPageChange={(e) => handlePageChange(e, 2)}
                  page={Number(page)}
                  totalpages={Number(totalPages)}
                />
              </>
            )}
          </div>
        )}
      </div>
      <style>
        {`
          button[data-headlessui-state="open"] {
            border-color: #f0b646;
            color: #f0b646;
          }
          @keyframes rteCardReveal {
            from {
              opacity: 0;
              transform: translateY(24px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <Modal
        open={open}
        setOpen={setOpen}
        title="Tag House/Master"
        size="2xl"
        description={description}
        footer={footer}
      />
      <Modal
        open={scanOpen}
        setOpen={setScanOpen}
        title="Update Scan Events"
        size="lg"
        description={scanDescription}
        footer={scanFooter}
      />
      {senderOpen && (
        <SenderDetails
          open={senderOpen}
          onClose={() => {
            setSenderOpen(false);
          }}
          isEdit={true}
          booking={jobData}
          setJobData={setJobData}
        />
      )}
      {receiverOpen && (
        <ReceiverDetails
          open={receiverOpen}
          onClose={() => {
            setReceiverOpen(false);
          }}
          isEdit={true}
          countryData={countryData || []}
          booking={jobData}
          setJobData={setJobData}
          dimensionData={dimensionData || []}
        />
      )}
      <Modal
        open={showEditBooking}
        setOpen={setShowEditBooking}
        title="Edit Booking"
        size="2xl"
        description={editBookingDescription}
        footer={editBookingFooter}
      />
    </>
  );
};

export default ReadyToExecute;

function CircleCheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
