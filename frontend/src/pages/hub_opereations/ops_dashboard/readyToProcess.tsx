import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Table from "../../../base-components/Table";
import CommonTable from "../../../components/Table";
import {
  Search,
  UserCog,
  ChevronDown,
  Trash2,
  Book,
  Hand,
  Upload,
  Minus,
  Plus,
  CalendarDays,
  User,
  Box,
} from "lucide-react";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
// import { Menu } from "../../../base-components/Headless";
import CommonPagination from "../../../components/Pagination";
import {
  Charge_head_drop_down,
  ApproveChecklist_Api,
  Generate_booking,
  Get_Cargo_Type,
  Get_Clearance_Type,
  Get_Commodity_Type,
  Get_country,
  Get_Currency,
  Get_Enquiry_list,
  Get_franchise,
  Get_house_draft,
  Get_Incoterm,
  Get_Job_Count,
  Get_Job_list,
  Get_proforma_invoice,
  Get_Service_Type,
  Get_shipment,
  Get_Weight_Unit,
  GetJobApi,
  HeldUp_Api,
  UpdateJobApi,
  UploadChecklist_Api,
  Status_code_list,
  MailChecklist_Api,
  GetChargesApi,
  Get_customer_type,
  Commercial_inscan_airwaybill,
  Billed_Outstanding,
  Unbilled_Outstanding,
  Get_Job_Type,
  Get_Chargeable_Weight,
  Get_Length_Unit,
  Get_franchise_overseas,
  Get_vendor,
  common_get,
  Get_Aramex_Product,
} from "../../../AllServices/services";
import {
  downloadAttachment,
  formatDateWithoutTime,
  indianFormat,
  isValidHsn,
} from "../../../utils";
import { Spinner } from "flowbite-react";
import Modal from "../../../components/Modal";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Tippy from "../../../base-components/Tippy";
import Lucide from "../../../base-components/Lucide";
import DocumentUploadModal from "./DocumentUploadModal";

import NoData from "../../../../src/assets/images/no-data.jpg";
import { Edit } from "lucide-react";
import SellBuyForm from "./SellBuyForm";
import SenderDetails from "./senderDetails";
import ReceiverDetails from "./receiverDetails";
import { FileText } from "lucide-react";
import { useDebounce } from "../../../components/Search";
import LoadingIcon from "../../../base-components/LoadingIcon";

import { Check } from "lucide-react";
import { Send } from "lucide-react";

import CommodityModal from "./CommodityModal";
import CommonSearchableAll from "../../../components/commonSearchableAll";

const PortalMenu = ({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 200;
    const left =
      window.innerWidth - rect.right >= menuWidth
        ? rect.right + 4
        : rect.left - menuWidth - 4;
    setMenuStyle({
      position: "fixed",
      top: rect.top,
      left,
      zIndex: 9999,
      maxHeight: window.innerHeight - rect.top - 12,
      overflowY: "auto",
    });
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const onScroll = () => setIsOpen(false);
    document.addEventListener("mousedown", onOutside);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={openMenu}>
        {trigger}
      </div>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="bg-white rounded-md shadow-[0px_3px_10px_#00000017] border border-gray-200 py-1 min-w-[180px]"
            onClick={() => setIsOpen(false)}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
};

const initDimension = {
  box_no: "",
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
  {
    id: "1",
    currency_id: "24",
    currency: "INR",
    ex_rate: "1",
  },
  {
    id: "2",
    currency_id: "",
    currency: "",
    ex_rate: "",
  },
  {
    id: "3",
    currency_id: "",
    currency: "",
    ex_rate: "",
  },
];
const intexchangedataSell = [
  {
    id: "1",
    currency_id: "24",
    currency: "INR",
    ex_rate: "1",
  },
  {
    id: "2",
    currency_id: "",
    currency: "",
    ex_rate: "",
  },
];
const fun1 = (value: any) => {};
const funtoempty = () => {};
const ReadyToProcess = ({
  countryData,
  franchiseeData,
  loadCountData,
  page,
  search,
  totalPages,
  handlePageChange,
  datatoget,
  setDatatoget,
}) => {
  const { showAlert } = useAlert();
  const [statusList, setStatusList] = useState<Array<any>>([]);
  const debouncedSearch = useDebounce(search, 500);
  const [isActive, setActive] = useState(false);
  const [readyToProcess, setReadyToProcess] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [counter, setCounter] = useState(0);
  const [showBtn, setShowBtn] = useState(false);
  const [modalData, setModalData] = useState({});
  const [modalGstStatus, setModalGstStatus] = useState(0);
  const [openDimension, setOpenDimension] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState({});
  const [currencyData, setCurrencyData] = useState([]);
  const [aramexProductList, setAramexProductList] = useState<Array<any>>([]);
  const [cargoTypeData, setCargoTypeData] = useState([]);
  const [clearanceType, setClearanceType] = useState([]);
  const [commodityType, setCommodityType] = useState([]);
  const [commoditySearch, setCommoditySearch] = useState<any>({
    commodity_id: "",
    commodity: "",
  });
  const [commoditySearchBooking, setCommoditySearchBooking] = useState<any>({
    commodity_id: "",
    commodity: "",
  });
  const [shipmentType, setShipmentType] = useState([]);
  const [weightUnit, setWeightUnit] = useState([]);
  const [lengthUnit, setLengthUnit] = useState([]);
  const [dimensionUnit, setDimensionUnit] = useState("1");
  const [incoterm, setIncoterm] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [editGstStatus, setEditGstStatus] = useState(0);
  const [dimensionData, setDimensionData] = useState([initDimension]);
  const [spinner, setSpinner] = useState(false);
  // const [dimensionPreview, setDimensionPreview] = useState(false);
  // const [isEditDimension, setIsEditDimension] = useState(false);
  // const [editDimensionData, setEditDimensionData] = useState({});
  // const [editIndex, setEditIndex] = useState(null);
  const [serviceType, setServiceType] = useState([]);
  const [alltypedata, setAlltypedata] = useState<any>([]);
  const [senderOpen, setSenderOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [receiverOpen, setReceiverOpen] = useState(false);
  const [bookSpinner, setBookSpinner] = useState(false);
  const [selfSpinner, setSelfSpinner] = useState(false);
  const [jobTypeList, setJobTypeList] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [jobData, setJobData] = useState({
    franchisee_id: "",
    job_id: "",
    shipment_dimensions: editData?.shipment_dimensions || [],
    shipper_details: {},
    consignee_details: {},
    sell_charges: [],
    buy_charges: [],
  });
  const [confirm, setConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState({
    job_id: "",
    forWhat: "",
    enquiry_id: "",
    remark: "",
    reason: "",
    franchisee_id: "",
    booking_no: "",
  });
  const [confirmSpinner, setConfirmSpinner] = useState(false);
  const [oldCharges, setOldCharges] = useState([]);

  //SellBuyForm States
  const [toggle, setToggle] = useState<any>(1);
  const [chargesList, setChargesList] = useState<Array<any>>([]);
  const [sellingcharges, setSellingCharges] = useState<any>([
    { ...intarrcharges, weight: editData?.weight },
  ]);
  const [totalbuy, setTotalBuy] = useState<any>(0);
  const [totalSell, setTotalsell] = useState<any>(0);
  const [buycharges, setBuyCharges] = useState<any>([
    { ...intarrcharges2, weight: editData?.weight },
  ]);
  const [exchangedata, setExchangedata] = useState<any>(intexchangedata);
  const [exchangedataSell, setExchangedataSell] =
    useState<any>(intexchangedataSell);
  const [exchangeSellLocked, setExchangeSellLocked] = useState(false);
  const [importBookingType, setImportBookingType] = useState<any>(null);
  const uploadSingleFile = useRef<HTMLInputElement | null>(null);
  const [singleFile, setSingleFile] = useState(null);
  const uploadMultipleFile = useRef<HTMLInputElement | null>(null);
  const [multipleFile, setMultipleFile] = useState(null);

  const uploadMailFile = useRef<HTMLInputElement | null>(null);
  const [mailFile, setMailFile] = useState(null);
  const [uploadSpinner, setUploadSpinner] = useState(false);
  const [approveSpinner, setApproveSpinner] = useState(false);
  const [mailSpinner, setMailSpinner] = useState(false);

  const [outstandingData, setOutstandingData] = useState({
    billed: "",
    unbilled: "",
  });
  const [outstandingSpinner, setOutstandingSpinner] = useState(false);
  const [editChWeight, setEditChWeight] = useState(0);
  const [grossWeight, setGrossWeight] = useState(0);
  const [chWeight, setChWeight] = useState(0);
  const [grWeight, setGrWeight] = useState(0);
  const [bookChWeight, setBookChWeight] = useState(0);
  const [convertedDimension, setConvertedDimension] = useState([]);
  const [weightSpinner, setWeightSpinner] = useState(false);
  const [courierData, setCourierData] = useState([]);
  const [commodityPreview, setCommodityPreview] = useState(false);
  const [overseasdata, setOverseasdata] = useState<Array<any>>([]);
  const [cargoOverseas, setCargoOverseas] = useState({});
  const [cargoOverseasCurrency, setCargoOverseasCurrency] = useState({});

  const funcOverseas = async () => {
    const res = await Get_franchise_overseas();
    if (res?.status == 200) {
      // const data = res?.data?.data || [];
      // const newdata = data?.filter((item: any) => item?.is_overseas == 1);
      setOverseasdata(res?.data?.data);
    }
  };
  const getChargeableWeight = async (
    forWhat: any = "",
    shipment_dimensions: any = [],
    courier_id: any = "",
    immediate: any = "",
  ) => {
    if (!courier_id) {
      return;
    }
    try {
      setWeightSpinner(true);
      const courier_data = await Get_Chargeable_Weight(courier_id)?.then(
        (res) => res?.data?.data,
      );

      const bill_type = courier_data[0]?.courier_wt_bill_type;
      setCourierData(courier_data[0] || {});

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

      if (forWhat == 1) {
        setEditChWeight(Number(chargeable_weight?.toFixed(2)) || 0);
        if (immediate) {
          setChWeight(Number(chargeable_weight?.toFixed(2)) || 0);
        }
      } else if (forWhat == 2) {
        setBookChWeight(Number(chargeable_weight?.toFixed(2)) || 0);
      }
    } catch (error) {
      if (forWhat == 1) {
        setEditChWeight(0);
      } else if (forWhat == 2) {
        setBookChWeight(0);
      }
      return 0;
    } finally {
      setWeightSpinner(false);
    }
  };

  useEffect(() => {
    getChargeableWeight(
      1,
      dimensionUnit == 2 ? convertedDimension : dimensionData,
      editData?.courier_id,
    );
  }, [dimensionData]);

  useEffect(() => {
    if (!open) {
      setModalData({});
      setModalGstStatus(0);
      setBookChWeight(0);
    }
  }, [open]);

  useEffect(() => {
    if (!editModal) {
      setEditData({});
      setEditGstStatus(0);
      setEditChWeight(0);
      setDimensionData([initDimension]);
    }
  }, [editModal]);

  const handleFileChange = (event: any, forWhat: any) => {
    const files = event.target.files;

    if (forWhat == 1 && files.length == 1) {
      setSingleFile(files[0]);
    } else if (forWhat == 2 && files.length >= 1) {
      setMultipleFile(files);
    } else if (forWhat == 3 && files.length == 1) {
      setMailFile(files[0]);
    } else {
      if (forWhat == 1) {
        uploadSingleFile.current.value = null;
        setSingleFile(null);
      } else if (forWhat == 2) {
        uploadMultipleFile.current.value = null;
        setMultipleFile(null);
      } else if (forWhat == 3) {
        uploadMailFile.current.value = null;
        setMailFile(null);
      }
    }
  };

  const gettotal = (data?: any, key?: any) => {
    const total = data?.reduce(
      (total: any, item: any) => total + Number(item[key] || 0),
      0,
    );
    return total;
  };

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

  // get totalsumint
  useEffect(() => {
    setTotalBuy(gettotal(buycharges, "inr_amount"));
  }, [JSON.stringify(buycharges)]);
  useEffect(() => {
    setTotalsell(gettotal(sellingcharges, "inr_amount"));
  }, [JSON.stringify(sellingcharges)]);

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

  const handleBook = async (job_id: any = "", self: any = false) => {
    if (!job_id) return showAlert("Job id is required", "warning");
    try {
      const res = await Generate_booking(job_id, self == true ? 4 : counter);
      if (res?.status == 200) {
        showAlert(res?.data?.message);
        setOpen(false);
        getEnquiryData();
        loadCountData();
        setDatatoget((pre: any) => ({ ...pre, refresh: !pre?.refresh }));
      } else if (res?.status == 400) {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
        setOpen(false);
        getEnquiryData();
        loadCountData();
        setDatatoget((pre: any) => ({ ...pre, refresh: !pre?.refresh }));
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      if (error) showAlert("something went wrong", "error");
    } finally {
      setBookSpinner(false);
      setSelfSpinner(false);
      setCounter((pre: any) => pre + 1);
      setShowBtn(true);
    }
  };

  const generateProformaInvoice = async (job_id: any = "") => {
    if (!job_id) return showAlert("Job id is required", "warning");
    try {
      const res = await Get_proforma_invoice(job_id);
      if (res?.status == 200) {
        downloadAttachment(res?.data?.url, "Prodorma Invoice");
        setConfirm(false);
        getEnquiryData();
        setConfirmData({
          job_id: "",
          forWhat: "",
          enquiry_id: "",
          remark: "",
          reason: "",
        });
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      if (error) showAlert("something went wrong", "error");
    } finally {
      setConfirmSpinner(false);
    }
  };
  const generateHouseDraft = async (job_id: any = "") => {
    if (!job_id) return showAlert("Job id is required", "warning");
    try {
      const res = await Get_house_draft(job_id);
      if (res?.status == 200) {
        downloadAttachment(res?.data?.url, "House Draft");
        setConfirm(false);
        getEnquiryData();
        showAlert(res?.data?.message);
        setConfirmData({
          job_id: "",
          forWhat: "",
          enquiry_id: "",
          remark: "",
          reason: "",
        });
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      if (error) showAlert("something went wrong", "error");
    } finally {
      setConfirmSpinner(false);
    }
  };
  const uploadChecklist = async () => {
    setUploadSpinner(true);

    try {
      const formData = new FormData();
      formData.append("job_id", confirmData?.job_id);
      if (!multipleFile) {
        showAlert("Please upload a file", "warning");
        return;
      }
      Array.from(multipleFile)?.forEach((file: any) => {
        formData.append("files", file);
      });
      const res = await UploadChecklist_Api(formData);
      if (res?.status == 200) {
        uploadMultipleFile.current.value = null;
        setMultipleFile(null);
        getEnquiryData();
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
      if (error) showAlert("something went wrong", "error");
    } finally {
      setUploadSpinner(false);
    }
  };
  const sendChecklistMail = async () => {
    setMailSpinner(true);

    try {
      const formData = new FormData();
      formData.append("job_id", confirmData?.job_id);
      if (!mailFile) {
        showAlert("Please upload a file", "warning");
        return;
      }
      formData.append("file", mailFile);

      const res = await MailChecklist_Api(formData);
      if (res?.status == 200) {
        uploadMailFile.current.value = null;
        setMailFile(null);
        setConfirm(false);
        getEnquiryData();
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
      if (error) showAlert("something went wrong", "error");
    } finally {
      setMailSpinner(false);
    }
  };
  const approveChecklist = async () => {
    setApproveSpinner(true);
    try {
      const formData = new FormData();
      formData.append("job_id", confirmData?.job_id);
      if (!singleFile) {
        showAlert("Please upload a file", "warning");
        return;
      }
      formData.append("file", singleFile);
      const res = await ApproveChecklist_Api(formData);
      if (res?.status == 200) {
        uploadSingleFile.current.value = null;
        setSingleFile(null);
        setConfirm(false);
        getEnquiryData();
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
      if (error) showAlert("something went wrong", "error");
    } finally {
      setApproveSpinner(false);
    }
  };
  const heldUpEnquiry = async (
    enquiry_id: any = "",
    reason: any = "",
    remark: any = "",
  ) => {
    try {
      if (!enquiry_id) return showAlert("Enquiry id is required", "warning");
      if (!reason) return showAlert("Held Up Reason is required", "warning");
      if (reason == "264" && !remark)
        return showAlert("Remarks is required", "warning");

      const res = await HeldUp_Api(
        enquiry_id,
        reason == "264" ? remark : reason,
      );
      if (res?.status == 200) {
        getEnquiryData();
        loadCountData();
        setDatatoget((pre: any) => ({ ...pre, refresh: !pre?.refresh }));
        setConfirm(false);
        showAlert(res?.data?.message);
        setConfirmData({
          job_id: "",
          forWhat: "",
          enquiry_id: "",
          remark: "",
          reason: "",
        });
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      if (error) showAlert("something went wrong", "error");
    } finally {
      setConfirmSpinner(false);
    }
  };

  const ToggleClass = () => {
    setActive(!isActive);
  };

  const getEnquiryData = async () => {
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
          booking_status: [1, 3, 8, 9, 10, 14, 15],
          ...(datatoget?.franchisee_id
            ? { franchisee_id: [datatoget?.franchisee_id] }
            : {}),
        },
        debouncedSearch.trim() || "",
        datatoget?.weight || "",
        datatoget?.destination_country || "",
      );
      if (res?.status == 200) {
        setReadyToProcess(res?.data?.data || []);
        setDatatoget((pre: any) => ({
          ...pre,
          totalpages1: Math.ceil(res?.data?.total / 5),
        }));
      } else {
        setReadyToProcess([]);
        setDatatoget((pre: any) => ({
          ...pre,
          totalpages1: 1,
        }));
      }
    } catch (error) {
      showAlert(error?.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const getOutstandingData = async (franchisee_id: any = "") => {
    try {
      setOutstandingSpinner(true);
      const res = await Billed_Outstanding(franchisee_id);
      const res2 = await Unbilled_Outstanding(franchisee_id);

      if (res?.status == 200 || res?.status == 204) {
        setOutstandingData((prev: any) => ({
          ...prev,
          billed: Number(res?.data?.total_amount || 0),
        }));
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
      if (res2?.status == 200 || res2?.status == 204) {
        setOutstandingData((prev: any) => ({
          ...prev,
          unbilled: Number(res2?.data?.billed_outstandig || 0),
        }));
      } else {
        showAlert(
          res2?.data?.message || res2?.response?.data?.message || res2?.message,
          "error",
        );
      }
    } catch (error) {
      showAlert(error?.message, "error");
    } finally {
      setOutstandingSpinner(false);
    }
  };

  useEffect(() => {
    Get_Currency().then((res) => setCurrencyData(res?.data?.data));
    Get_shipment().then((res) => setShipmentType(res?.data?.data));
    Get_Weight_Unit().then((res) => setWeightUnit(res?.data?.data));
    Get_Length_Unit().then((res) => setLengthUnit(res?.data?.data));
    Get_Commodity_Type().then((res) => setCommodityType(res?.data?.data));
    // Get_Cargo_Type().then((res) => setCargoTypeData(res?.data?.data));
    Get_Clearance_Type().then((res) => setClearanceType(res?.data?.data));
    Get_Incoterm().then((res) => setIncoterm(res?.data?.data));
    // Get_Service_Type().then((res) => setServiceType(res?.data?.data));
    Charge_head_drop_down(1).then((res) => setChargesList(res?.data?.data));
    Status_code_list().then((res) => setStatusList(res?.data?.data));
    Get_customer_type().then((res) => setAlltypedata(res?.data?.data));
    Get_Job_Type().then((res) => setJobTypeList(res?.data?.data));
    Get_vendor().then((res) => setVendorData(res?.data?.data || []));
    Get_Aramex_Product().then((res) =>
      setAramexProductList(res?.data?.data || []),
    );
  }, []);

  useEffect(() => {
    getEnquiryData();
  }, [
    page,
    debouncedSearch,
    datatoget?.franchisee_id,
    datatoget?.destination_country,
    datatoget?.weight,
    datatoget?.refresh,
  ]);

  const totalWeight = editChWeight;

  useEffect(() => {
    if (dimensionData?.length > 0) {
      setEditData((prev) => ({
        ...prev,
        weight: totalWeight || "",
      }));
    }
  }, [totalWeight]);

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

  useEffect(() => {
    const commodityId = modalData?.commodity;
    if (commodityId) {
      if (
        String(commoditySearchBooking?.commodity_id ?? "") !==
        String(commodityId)
      ) {
        common_get(`/admin/commodity-type/${commodityId}`).then((res) => {
          if (res?.status === 200) {
            const commodityData = Array.isArray(res?.data?.data)
              ? res?.data?.data[0]
              : res?.data?.data;
            setCommoditySearchBooking({
              commodity_id: commodityData?.commodity_id ?? commodityId,
              commodity: commodityData?.commodity ?? "",
            });
          }
        });
      }
    } else if (commoditySearchBooking?.commodity_id) {
      setCommoditySearchBooking({ commodity_id: "", commodity: "" });
    }
  }, [modalData?.commodity]);

  const handleCommoditySelectBooking = (item: any) => {
    setModalData((prev: any) => ({
      ...prev,
      commodity: item?.commodity_id ?? "",
    }));
  };

  const handleCommodityClearBooking = () => {
    setModalData((prev: any) => ({
      ...prev,
      commodity: "",
    }));
  };

  const columns = [
    { field: "action", headerName: "Action" },
    { field: "booking_no", headerName: "Enquiry No." },
    { field: "created_date", headerName: "Date" },
    { field: "franchisee_name", headerName: "Franchisee" },
    { field: "country_name", headerName: "Destination" },
    { field: "checklist", headerName: "Checklist" },
    { field: "checklist_docs", headerName: "Checklist Docs" },
    { field: "weight", headerName: "Weight" },
    { field: "booking_status", headerName: "Status" },
  ];

  const rows = readyToProcess?.map((item: any, index: any) => {
    const Action = (
      <PortalMenu
        trigger={
          <Button className="bg-blue-100 text-blue-500 border-blue-500">
            <UserCog className="w-5 stroke-2.5" />
            <ChevronDown className="w-4 stroke-2.5 mt-1" />
          </Button>
        }
      >
        <div
          onClick={async () => {
            const checkOverseas = await franchiseeData?.find(
              (cus) => cus?.franchisee_id == item?.franchisee_id,
            );
            setCargoOverseas(checkOverseas || {});
            if (checkOverseas?.is_overseas == 1) {
              const currency = currencyData?.find(
                (cur) => cur?.id == checkOverseas?.currency,
              );
              setCargoOverseasCurrency(currency || {});
            }
            const data = JSON.parse(
              JSON.stringify(item?.shipment_dimensions || [initDimension]),
            );
            setDimensionData(data);
            setEditData(item);
            const gstStatus =
              franchiseeData?.find(
                (cus: any) => cus.franchisee_id == item.franchisee_id,
              )?.gst_status || 0;
            setEditGstStatus(gstStatus || 0);
            setChWeight(item?.chargeable_weight);
            setGrWeight(item?.gross_weight);
            getChargeableWeight(
              1,
              dimensionUnit == 2 ? convertedDimension : data,
              item?.courier_id,
            );
            setSellingCharges([
              {
                ...intarrcharges,
                ex_rate: Number(checkOverseas?.exchange_rate || 1),
                currency: Number(checkOverseas?.currency) || 24,
                enquiry_id: item?.id,
              },
            ]);
            setBuyCharges([
              {
                ...intarrcharges2,
                enquiry_id: item?.id,
              },
            ]);
            setImportBookingType(item?.import_booking ?? null);
            handleCharges(item?.id, totalWeight);
            handleGetJob(
              item?.job_id,
              1,
              item?.shipment_type,
              item?.shipment_type == 8 ? item?.fair_data?.mode_value : null,
            );
            setJobData((prev) => ({
              ...prev,
              franchisee_id: item?.franchisee_id,
              job_id: item?.job_id,
              shipment_dimensions: item?.shipment_dimensions || [],
            }));
            setEditModal(true);
          }}
          className="flex items-center justify-left hover:bg-gray-200 mb-1 px-2 pt-1 cursor-pointer text-sm"
        >
          <Edit className="w-4 mr-2 " /> Edit Details
        </div>
        {item?.clearence_type != 2 && !item?.inscan_date ? (
          <div
            onClick={() => {
              setConfirmSpinner(false);
              setConfirm(true);
              setConfirmData({
                enquiry_id: item?.id,
                forWhat: 5,
                booking_no: item?.booking_no,
                franchisee_id: item?.franchisee_id,
                job_id: item?.job_id,
              });
            }}
            className="flex items-center justify-left hover:bg-gray-200 mb-1 px-2 pt-1 cursor-pointer text-sm"
          >
            <Search className="w-4 mr-2" /> Shipment Inscan
          </div>
        ) : (
          <div className="text-green-500 flex items-center justify-left hover:bg-gray-200 mb-1 px-2 pt-1 text-sm">
            <Check className="w-4 mr-2 text-green-500 stroke-2.5 font-bold" />{" "}
            Shipment Inscan Done
          </div>
        )}
        <div
          onClick={() => {
            setConfirmSpinner(false);
            setConfirm(true);
            setConfirmData({
              enquiry_id: item?.id,
              forWhat: 4,
              booking_no: item?.booking_no,
              franchisee_id: item?.franchisee_id,
            });
          }}
          className="flex items-center justify-left hover:bg-gray-200 mb-1 px-2 pt-1 cursor-pointer text-sm"
        >
          <Hand className="w-4 mr-2" /> Held Up
        </div>
        {/* {item?.is_checklist == 0 && (
           <Menu.Item
             onClick={() => {
               setConfirmSpinner(false);
               setConfirm(true);
               setConfirmData({
                 job_id: item?.job_id,
                 forWhat: 3,
                 checklist_email_doc: item?.checklist_email_doc,
               });
             }}
           >
             <ListChecks className="w-4 mr-2" /> Checklist
           </Menu.Item>
         )} */}
        {!item?.is_edit && (
          <>
            {item?.job_id ? (
              <div
                onClick={() => {
                  setConfirmSpinner(false);
                  setConfirm(true);
                  setConfirmData({
                    job_id: item?.job_id,
                    forWhat: 1,
                    booking_no: item?.booking_no,
                    franchisee_id: item?.franchisee_id,
                  });
                }}
                className="flex items-center justify-left hover:bg-gray-200 mb-1 px-2 pt-1 cursor-pointer text-sm"
              >
                <FileText className="w-4 mr-2" />
                Proforma Invoice
              </div>
            ) : null}
            {item?.job_id ? (
              <div
                onClick={() => {
                  setConfirmSpinner(false);
                  setConfirm(true);
                  setConfirmData({
                    job_id: item?.job_id,
                    forWhat: 2,
                    booking_no: item?.booking_no,
                    franchisee_id: item?.franchisee_id,
                  });
                }}
                className="flex items-center justify-left hover:bg-gray-200 mb-1 px-2 pt-1 cursor-pointer text-sm"
              >
                <FileText className="w-4 mr-2" /> Create House Draft
              </div>
            ) : null}
          </>
        )}
        {!item?.is_edit && (
          <div
            onClick={() => {
              getOutstandingData(item?.franchisee_id);
              handleGetJob(
                item?.job_id,
                2,
                item?.shipment_type,
                item?.shipment_type == 8 ? item?.fair_data?.mode_value : null,
              );
              setModalData(item);
              setImportBookingType(item?.import_booking ?? null);
              const gstStatus =
                franchiseeData?.find(
                  (cus: any) => cus.franchisee_id == item.franchisee_id,
                )?.gst_status || 0;
              setModalGstStatus(gstStatus || 0);
              getChargeableWeight(
                2,
                item?.shipment_dimensions,
                item?.courier_id,
              );
              setOpen(true);
            }}
            className="flex items-center justify-left hover:bg-gray-200 mb-1 px-2 pt-1 cursor-pointer text-sm"
          >
            <Book className="w-4 mr-2" /> Create Booking
          </div>
        )}
      </PortalMenu>
    );

    const Status = (
      <>
        {item?.booking_status == 1 ? (
          <p className=" text-green-500 text-[13px] ">Pricing Approved</p>
        ) : item?.booking_status == 8 ? (
          <p className=" text-mustard text-[13px] ">CC Pending</p>
        ) : item?.booking_status == 9 ? (
          <p className=" text-green-500 text-[13px]  ">CC Approved</p>
        ) : item?.booking_status == 10 ? (
          <p className=" text-red-500 text-[13px]  ">CC Rejected</p>
        ) : item?.booking_status == 14 ? (
          <p className=" text-red-500 text-[13px]  ">Insufficient Balance</p>
        ) : item?.booking_status == 15 && item?.is_checklist == 1 ? (
          <p className=" text-green-500 text-[13px]  ">Checklist Done</p>
        ) : item?.booking_status == 15 && item?.is_checklist == 0 ? (
          <p className=" text-mustard text-[13px]  ">Checklist Pending</p>
        ) : (
          "N.A."
        )}
      </>
    );
    const Docs =
      item?.checklist_docs?.length > 0 ? (
        <PortalMenu
          trigger={
            <Button className="bg-blue-100 text-blue-500 border-blue-500">
              <FileText className="w-5 stroke-2.5" />
              <ChevronDown className="w-4 stroke-2.5 mt-1" />
            </Button>
          }
        >
          {item?.checklist_docs?.map((ele, index) => (
            <div
              key={index}
              onClick={() => downloadAttachment(ele, `Document ${index + 1}`)}
              className="flex items-center justify-left hover:bg-gray-200 mb-1 px-2 pt-1 cursor-pointer text-sm"
            >
              <FileText className="w-4 mr-2" /> Document {index + 1}
            </div>
          ))}
        </PortalMenu>
      ) : (
        <p className="text-gray-400">Not Available</p>
      );

    const Checklist = (
      <>
        {item?.is_checklist == 1 ? (
          <p className=" text-green-500 text-base ">Done</p>
        ) : item?.is_checklist == 0 ? (
          <p className=" text-mustard text-base ">Pending</p>
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
      created_date: formatDateWithoutTime(item.created_date),
      weight: Number(item.weight)?.toFixed(2) + " " + item.weight_unit,
      booking_status: Status,
      checklist: Checklist,
      checklist_docs: Docs,
      action: Action,
    };
  });

  const confirmDescription = (
    <>

<div className="flex-wrap lg:flex-nowrap flex gap-2 mb-3">
<div className="bg-[#fff3dc] rounded-lg p-[7px] flex w-full lg:w-[50%]">
    <figure className="w-[35px] flex items-center justify-center">
      <FileText className="w-[35px]  text-[#ba9650] " />
    </figure>
    <aside className="md:border-l md:border-[#fbe9c7] md:pl-2 w-[80%] leading-[18px]">
        <p className="text-[12px] uppercase text-[#757575] w-full">ENQUIRY No.</p>
        <h4 className="font-medium text-[14px] text-[#383838] w-full flex justify-between items-center">
            <span className="capitalize font-bold cursor-pointer"> {confirmData?.booking_no} </span>
           
        </h4>
    </aside>
</div>

<div className="bg-[#f2f7ff] rounded-lg p-[7px] flex  w-full lg:w-[50%]">
    <figure className="w-[35px] flex items-center justify-center">
      <User className="w-[30px]  text-[#4478cb] " />
    </figure>
    <aside className="md:border-l md:border-[#d8e7ff] md:pl-2 w-[80%] leading-[18px]">
        <p className="text-[12px] uppercase text-[#757575] w-full">FRANCHISEE </p>
        <h4 className="font-medium text-[14px] text-[#383838] w-full flex justify-between items-center">
            <span className="capitalize font-bold cursor-pointer">{
            franchiseeData?.find(
              (item: any) => item?.franchisee_id == confirmData?.franchisee_id,
            )?.franchisee_name
          } </span>
           
        </h4>
    </aside>
</div>


</div>






{/* 
      <div className="  justify-between gap-4 mb-2 border border-[#ffe7b1]   bg-gradient-to-r from-[#FFF9EB] via-[#FDFDFD] to-[#FDFDFD] rounded-lg">
        <div className="border-b border-[#ffe7b1] px-2 py-[5px]">
          <b>ENQUIRY No: </b>
          {confirmData?.booking_no}
        </div>
        <div className=" px-2 py-[5px]">
          <b>FRANCHISEE : </b>
          {
            franchiseeData?.find(
              (item: any) => item?.franchisee_id == confirmData?.franchisee_id,
            )?.franchisee_name
          }
        </div>
      </div> */}
      <div className="text-center text-[18px] font-bold mt-4">
        {confirmData?.forWhat == 1 ? (
          "Are you sure you want to Generate Proforma Invoice ?"
        ) : confirmData?.forWhat == 2 ? (
          "Are you sure you want to Generate House Draft ?"
        ) : confirmData?.forWhat == 3 ? (
          <>
            <div className="text-left">
              <FormLabel htmlFor="regular-form-1">
                KYC Documents <span className="text-red-500">*</span>
              </FormLabel>
              <div className="flex gap-4 items-end justify-between">
                <FormInput
                  type="file"
                  placeholder="Choose File"
                  multiple
                  className="w-2/3"
                  onChange={(e) => handleFileChange(e, 2)}
                  ref={uploadMultipleFile}
                />
                <Button
                  className="text-white bg-mustard p-2"
                  disabled={uploadSpinner}
                  onClick={uploadChecklist}
                >
                  <Upload className="mr-2 h-5 w-5" />
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
            <div className="flex justify-center w-full my-4 border-t border-slate-200 dark:border-darkmode-400"></div>
            <div className="text-left">
              <FormLabel htmlFor="regular-form-1">
                Upload Checklist <span className="text-red-500">*</span>
              </FormLabel>
              <div className="flex gap-4 items-end justify-between">
                <FormInput
                  type="file"
                  placeholder="Choose File"
                  className="w-2/3"
                  onChange={(e) => handleFileChange(e, 3)}
                  ref={uploadMailFile}
                />
                <Button
                  className="text-white bg-mustard p-2 "
                  disabled={mailSpinner}
                  onClick={sendChecklistMail}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send
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
            {confirmData?.checklist_email_doc && (
              <>
                <div className="flex justify-center w-full my-4 border-t border-slate-200 dark:border-darkmode-400"></div>
                <div className="text-left">
                  <FormLabel htmlFor="regular-form-1">
                    Approved Checklist <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="flex gap-4 items-end justify-between">
                    <FormInput
                      type="file"
                      placeholder="Choose File"
                      className="w-2/3"
                      onChange={(e) => handleFileChange(e, 1)}
                      ref={uploadSingleFile}
                    />
                    <Button
                      className="text-white bg-mustard p-2"
                      disabled={approveSpinner}
                      onClick={approveChecklist}
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Approve
                      {approveSpinner && (
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
            )}
          </>
        ) : confirmData?.forWhat == 4 ? (
          <>
            <div className="text-left mb-4">
              <FormLabel htmlFor="remarks">
                Held Up Reason <span className="text-red-500">*</span>
              </FormLabel>
              <FormSelect
                className=""
                value={confirmData?.reason}
                onChange={(e) =>
                  setConfirmData({ ...confirmData, reason: e.target.value })
                }
              >
                <option value="">Select held up reason</option>
                {statusList?.map((item: any, index: number) => (
                  <option key={index} value={item?.status}>
                    {item?.status}
                  </option>
                ))}
                <option value="264">Other reason</option>
              </FormSelect>
            </div>
            {confirmData?.reason == 264 && (
              <div className="text-left">
                <FormLabel htmlFor="remarks">
                  Remarks <span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  id="remarks"
                  type="text"
                  placeholder="Enter Remarks"
                  value={confirmData?.remark}
                  onChange={(e) => {
                    setConfirmData({
                      ...confirmData,
                      remark: e.target.value,
                    });
                  }}
                />
              </div>
            )}
          </>
        ) : confirmData?.forWhat == 5 ? (
          "Are you sure you want to Inscan this Shipment ?"
        ) : (
          "Are you sure you want to perform this action ?"
        )}
      </div>
    </>
  );
  const confirmFooter = (
    <>
      {confirmData?.forWhat != 3 && (
        <div className="flex justify-end gap-4">
          <Button
            className="px-4 py-1 rounded-lg bg-mustard text-white hover:bg-gray-500 border-none"
            onClick={() => {
              setConfirmSpinner(true);
              if (confirmData?.forWhat == 1) {
                generateProformaInvoice(confirmData?.job_id);
              } else if (confirmData?.forWhat == 2) {
                generateHouseDraft(confirmData?.job_id);
                // } else if (confirmData?.forWhat == 3) {
                //   confirmChecklist(confirmData?.job_id);
              } else if (confirmData?.forWhat == 4) {
                heldUpEnquiry(
                  confirmData?.enquiry_id,
                  confirmData?.reason,
                  confirmData?.remark,
                );
              } else if (confirmData?.forWhat == 5) {
                handleShipmentInscan(confirmData?.job_id);
              }
            }}
            disabled={confirmSpinner}
          >
            Yes
            {confirmSpinner && (
              <LoadingIcon
                icon="puff"
                color="white"
                className="w-5 h-5 ml-2 stroke-2.5 text-white"
              />
            )}
          </Button>
          <Button
            className="px-4 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 border-none"
            onClick={() => setConfirm(false)}
            disabled={confirmSpinner}
          >
            No
          </Button>
        </div>
      )}
    </>
  );

  const description = (
    <>








<div className="flex-wrap lg:flex-nowrap flex gap-2 mb-3">
<div className="bg-[#fff3dc] rounded-lg p-[7px] flex w-full lg:w-[50%]">
    <figure className="w-[35px] flex items-center justify-center">
      <FileText className="w-[35px]  text-[#ba9650] " />
    </figure>
    <aside className="md:border-l md:border-[#fbe9c7] md:pl-2 w-[80%] leading-[18px]">
        <p className="text-[12px] uppercase text-[#757575] w-full">ENQUIRY No.</p>
        <h4 className="font-medium text-[14px] text-[#383838] w-full flex justify-between items-center">
            <span className="capitalize font-bold cursor-pointer">         {modalData?.booking_no} </span>
           
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
         ₹  {indianFormat(
            franchiseeData?.find(
              (item: any) => item?.franchisee_id == modalData?.franchisee_id,
            )?.available_credit_limit_show || 0,
          )}</span>
           
        </h4>
    </aside>
</div>




<div className="bg-[#eafffa] rounded-lg p-[7px] flex  w-full lg:w-[50%]">
    <figure className="w-[35px] flex items-center justify-center">
      <User className="w-[30px]  text-[#18a080] " />
    </figure>
    <aside className="md:border-l md:border-[#b7ffee] md:pl-2 w-[80%] leading-[18px]">
        <p className="text-[12px] uppercase text-[#757575] w-full">Total Sell </p>
        <h4 className="font-medium text-[14px] text-[#383838] w-full flex justify-between items-center">
            <span className="capitalize font-bold cursor-pointer">
        ₹  {indianFormat(
            franchiseeData?.find(
              (item: any) => item?.franchisee_id == modalData?.franchisee_id,
            )?.is_overseas == 1
              ? Number(modalData?.spot_price)
              : Number(modalData?.spot_price) * 1.18,
          )}</span>
           
        </h4>
    </aside>
</div>


<div className="bg-[#faf5ff] rounded-lg p-[7px] flex  w-full lg:w-[50%]">
    <figure className="w-[35px] flex items-center justify-center">
      <User className="w-[30px]  text-[#9c51e7] " />
    </figure>
    <aside className="md:border-l md:border-[#ecd9ff] md:pl-2 w-[80%] leading-[18px]">
        <p className="text-[12px] uppercase text-[#757575] w-full">Total Outstanding  </p>
        <h4 className="font-medium text-[14px] text-[#383838] w-full flex justify-between items-center">
            <span className="capitalize font-bold cursor-pointer">
       
          
            {outstandingSpinner ? (
            <div className="flex items-center justify-center">
              <Spinner className="h-2 w-4 stroke-2.5" />
            </div>
          ) : (
            <>
     
             ₹ {indianFormat(
                Number(outstandingData?.billed || 0) +
                  Number(outstandingData?.unbilled || 0),
              )}
            </>
          )}
          
          </span>
           
        </h4>
    </aside>
</div>


</div>




{/* 
      <div className=" flex justify-between gap-4  mb-2">
        <div className=" bg-gray-200 rounded p-2">
          <b>ENQUIRY No: </b>
          {modalData?.booking_no}
        </div>
        <div className=" bg-gray-200 rounded p-2">
          <b>ACL : </b>₹
          {indianFormat(
            franchiseeData?.find(
              (item: any) => item?.franchisee_id == modalData?.franchisee_id,
            )?.available_credit_limit_show || 0,
          )}
        </div>
        <div className="bg-gray-200 rounded p-2">
          <b>Total Sell : </b> ₹
          {indianFormat(
            franchiseeData?.find(
              (item: any) => item?.franchisee_id == modalData?.franchisee_id,
            )?.is_overseas == 1
              ? Number(modalData?.spot_price)
              : Number(modalData?.spot_price) * 1.18,
          )}
        </div>
        <div className=" bg-gray-200 rounded p-2">
          {outstandingSpinner ? (
            <div className="flex items-center justify-center">
              <Spinner className="h-2 w-4 stroke-2.5" />
            </div>
          ) : (
            <>
              <b>Total Outstanding : </b>₹
              {indianFormat(
                Number(outstandingData?.billed || 0) +
                  Number(outstandingData?.unbilled || 0),
              )}
            </>
          )}
        </div>
      </div> */}

      
      <div className="col-span-12 h-[370px] overflow-auto ">
        <div className="box">
          <div className="space-y-4 px-2 py-1">
            <div className="w-full mt-2  grid grid-cols-1 gap-4">
              <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-0 justify-between w-full">
                <div
                  className="box w-full border-2 border-gray-200 px-4 py-2  font-medium cursor-pointer text-sm flex flex-col md:flex-row justify-between gap-4 rounded-lg bg-white h-auto"
                  // onClick={() => setShowChangeVendor(false)}
                >
                  <div>
                    <div className="flex gap-2">
                      <span className="mt-2 text-sm md:text-lg font-bold">
                        ORIGIN
                      </span>
                    </div>

                    <div className="flex gap-2 ">
                      <div className="text-center p-1 border-2  h-14 w-10 rounded">
                        <img
                          src={`https://flagsapi.com/${modalData?.origin_country_code}/flat/32.png`}
                          alt="origin-flag"
                        />
                        <span className="text-sm">
                          ({modalData?.origin_country_code || "IN"})
                        </span>
                      </div>
                      <div className="p-1 pt-2 h-14 min-w-28 border-2 rounded flex flex-col  justify-center w-full">
                        <h1 className="font-medium text-sm md:text-lg">
                          (
                          {countryData?.find(
                            (ele) =>
                              ele?.country_id == modalData?.org_country_id,
                          )?.country_name || "INDIA"}
                          )
                        </h1>
                        <p className="">({modalData?.org_zip})</p>
                      </div>
                    </div>
                  </div>

                  <div className=" mt-11 hidden sm:flex">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                      className="w-5 h-5 opacity-25 hidden md:block"
                      alt="dot-icon"
                    />
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                      className="w-5 h-5 opacity-50 hidden md:block"
                      alt="dot-icon"
                    />
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                      className="w-5 h-5 opacity-75 hidden md:block"
                      alt="dot-icon"
                    />
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                      className="w-5 h-5 hidden md:block"
                      alt="dot-icon"
                    />
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/61/61212.png"
                      className="w-5 h-5 "
                      alt="plane-icon"
                    />
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                      className="w-5 h-5 hidden md:block"
                      alt="dot-icon"
                    />
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                      className="w-5 h-5 opacity-75 hidden md:block"
                      alt="dot-icon"
                    />
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                      className="w-5 h-5 opacity-50 hidden md:block"
                      alt="dot-icon"
                    />
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/7500/7500224.png"
                      className="w-5 h-5 opacity-25 hidden md:block"
                      alt="dot-icon"
                    />
                  </div>

                  <div className="flex sm:hidden rotate-90 justify-center">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/61/61212.png"
                      className="w-6 h-6 "
                      alt="plane-icon"
                    />
                  </div>

                  <div>
                    <div className="flex gap-2">
                      <span className="mt-2 text-sm md:text-lg font-bold">
                        DESTINATION
                      </span>
                    </div>

                    <div className="flex gap-2 ">
                      <div className="text-center p-1 border-2  h-14 w-10 rounded ">
                        <img
                          src={`https://flagsapi.com/${
                            countryData?.find(
                              (ele) =>
                                ele?.country_id == modalData?.dest_country_id,
                            )?.country_code
                          }/flat/32.png`}
                          alt="destination-flag"
                        />
                        <span className="text-sm">
                          (
                          {countryData?.find(
                            (ele) =>
                              ele?.country_id == modalData?.dest_country_id,
                          )?.country_code || ""}
                          )
                        </span>
                      </div>
                      <div
                        className={`w-full p-1 pt-2 min-w-28 h-14 border-2 rounded flex flex-col  justify-center text-wrap `}
                      >
                        <h1 className="font-medium text-sm md:text-lg">
                          (
                          {countryData?.find(
                            (ele) =>
                              ele?.country_id == modalData?.dest_country_id,
                          )?.country_name || ""}
                          )
                        </h1>
                        <p>({modalData?.dest_zip || "0000"})</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {modalData?.jobData?.shipment_dimensions?.length > 0 ? (
                <div>
                  <FormLabel
                    htmlFor="regular-form-1"
                    className="text-base font-medium text-gray-900"
                  >
                    Shipment Dimensions
                  </FormLabel>

                  <div className=" p-2 w-full box cursor-pointer  border-2 border-gray-200 flex justify-between items-end">
                    <div className=" flex flex-wrap gap-2 ">
                      {modalData?.jobData?.shipment_dimensions?.length > 0 &&
                        modalData?.jobData?.shipment_dimensions?.map(
                          (elem, index) =>
                            elem?.item_description && (
                              <div
                                key={index}
                                className={`flex px-2 py-1 gap-4 mr-2 bg-slate-300 items-center justify-between rounded-lg `}
                              >
                                <span
                                  className=" text-lg flex capitalize "
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.isPropagationStopped();
                                    setSelectedDimension(elem);
                                    setOpenDimension(true);
                                  }}
                                >
                                  {elem?.item_description}
                                </span>
                              </div>
                            ),
                        )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3">
                  <div>
                    <FormLabel
                      htmlFor="regular-form-1"
                      className="text-base font-medium text-gray-900"
                    >
                      Chargeable Weight
                      {modalData?.weight_unit && (
                        <> (in {modalData?.weight_unit})</>
                      )}
                    </FormLabel>
                    <FormInput
                      type="text"
                      placeholder="Weight"
                      id="weight"
                      value={modalData?.weight}
                      disabled
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
              <div className=" col-span-3 md:col-span-3 lg:col-span-1">
                <div>
                  <FormLabel className="text-base text-slate-500">
                    FRANCHISEE <span className="text-red-400">*</span>
                  </FormLabel>
                </div>
                <FormInput
                  value={
                    franchiseeData?.find(
                      (cus) => cus?.franchisee_id == modalData?.franchisee_id,
                    )?.franchisee_name || "-"
                  }
                  disabled
                />
              </div>
              <div className=" col-span-3 md:col-span-3 lg:col-span-1">
                <FormLabel
                  htmlFor="origin-country"
                  className="text-base text-slate-500"
                >
                  SHIPMENT TYPE <span className="text-red-400">*</span>
                </FormLabel>
                <FormSelect
                  id="default"
                  disabled
                  value={modalData.shipment_type}
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
              <div className=" col-span-3 md:col-span-3 lg:col-span-1">
                <FormLabel
                  htmlFor="origin-country"
                  className="text-base text-slate-500"
                >
                  CHARGEABLE & GROSS WEIGHT{" "}
                  <span className="text-red-400">*</span>
                </FormLabel>

                <div className="flex items-center gap-2">
                  <FormInput
                    // className={`w-full ${
                    //   errors?.weight ? "border border-red-400" : ""
                    // }`}
                    id="weight"
                    type="text"
                    disabled
                    value={modalData?.chargeable_weight || modalData?.weight}
                    // onChange={(e) => {
                    //   setEditData((prev: any) => ({
                    //     ...prev,
                    //     weight: e.target.value.replace(/[^0-9.]/g, ""),
                    //   }));
                    // }}
                  />
                  <FormInput
                    // className={`w-full ${
                    //   errors?.weight ? "border border-red-400" : ""
                    // }`}
                    id="weight"
                    type="text"
                    disabled
                    value={modalData?.gross_weight || modalData?.weight}
                    // onChange={(e) => {
                    //   setEditData((prev: any) => ({
                    //     ...prev,
                    //     weight: e.target.value.replace(/[^0-9.]/g, ""),
                    //   }));
                    // }}
                  />

                  <FormSelect
                    disabled
                    value={modalData?.weight_unit}
                    // onChange={(e) => {
                    //   setSpotData((prev: any) => ({
                    //     ...prev,
                    //     weight_unit: e.target.value,
                    //   }));
                    // }}
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
              </div>
              <div className=" col-span-3 md:col-span-3 lg:col-span-1">
                {" "}
                <FormLabel
                  htmlFor="quoted_by"
                  className="text-base text-slate-500"
                >
                  QUOTED BY <span className="text-red-400">*</span>
                </FormLabel>
                <div className="flex items-center gap-2 w-[100%]">
                  <FormInput
                    className="w-[100%]"
                    id="quoted_by"
                    value={modalData?.quoted_by}
                    disabled
                  />
                </div>
              </div>
              <div className=" col-span-3 md:col-span-3 lg:col-span-1">
                {" "}
                <FormLabel
                  htmlFor="commodity"
                  className="text-base text-slate-500"
                >
                  COMMODITY <span className="text-red-400">*</span>
                </FormLabel>
                <CommonSearchableAll
                  apiEndpoint="/admin/commodity-type"
                  placeholder="Search Commodity"
                  zIndex="40"
                  selecteddata={commoditySearchBooking}
                  setSelecteddata={setCommoditySearchBooking}
                  fun1={handleCommoditySelectBooking}
                  funtoempty={handleCommodityClearBooking}
                  key1={"key"}
                  comingselectedname={"commodity"}
                  comingselectedid={"commodity_id"}
                  id={modalData?.commodity}
                  isdisabled
                />
              </div>

              <div className=" col-span-3 md:col-span-3 lg:col-span-1">
                <FormLabel>CREDIT LIMIT</FormLabel>
                <FormInput
                  placeholder="CREDIT LIMIT"
                  value={
                    indianFormat(Number(modalData?.credit_limit || 0)) || 0
                  }
                  disabled
                />
              </div>
              {(modalData?.shipment_type == 4 ||
                modalData?.shipment_type == 5 ||
                modalData?.shipment_type == 8) && (
                <div className="col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-2 items-center">
                    {/* <div>
                      <FormLabel
                        htmlFor="destination-country"
                        className="text-base text-slate-500"
                      >
                        CARGO TYPE <span className="text-red-400">*</span>
                      </FormLabel>

                      <FormSelect value={modalData?.cargo_type} disabled>
                        <option value="">Select Cargo Type</option>
                        {cargoTypeData &&
                          cargoTypeData?.map((ele, index) => (
                            <option key={index} value={ele?.id}>
                              {ele?.name}
                            </option>
                          ))}
                      </FormSelect>
                    </div> */}
                    <div>
                      <FormLabel
                        htmlFor="clearence-type"
                        className="text-base text-slate-500"
                      >
                        CLEARANCE TYPE <span className="text-red-400">*</span>
                      </FormLabel>

                      <FormSelect value={modalData?.clearence_type} disabled>
                        <option value="">Select Clearance Type</option>
                        {clearanceType &&
                          clearanceType?.map((ele, index) => (
                            <option key={index} value={ele.id}>
                              {ele.name}
                            </option>
                          ))}
                      </FormSelect>
                    </div>

                    <div>
                      <FormLabel
                        htmlFor="incoterm"
                        className="text-base text-slate-500"
                      >
                        INCOTERM <span className="text-red-400">*</span>
                      </FormLabel>

                      <FormSelect
                        id="incoterm"
                        value={modalData?.incoterm}
                        disabled
                      >
                        <option value="">Select Incoterm</option>
                        {incoterm &&
                          incoterm?.map((ele, index) => (
                            <option key={index} value={ele?.id}>
                              {ele?.name}
                            </option>
                          ))}
                      </FormSelect>
                    </div>

                    {modalData?.jobData?.consignee_details?.mode == 2 ? (
                      <div className="flex items-center gap-5  mx-4 mt-4">
                        <FormLabel
                          htmlFor="mode_value"
                          className="mt-6 flex whitespace-nowrap"
                        >
                          MODE <span className="text-red-400">*</span>
                        </FormLabel>
                        <div className="flex flex-row gap-5 mt-4">
                          <FormCheck className="mr-2">
                            <FormCheck.Input
                              id="mode_value_1"
                              type="radio"
                              checked={
                                modalData?.jobData?.consignee_details
                                  ?.mode_value == "LCL"
                              }
                              disabled
                              name="mode_value"
                            />
                            <FormCheck.Label htmlFor="mode_value_1">
                              {"LCL"}
                            </FormCheck.Label>
                          </FormCheck>
                          <FormCheck className="mt-2 mr-2 sm:mt-0">
                            <FormCheck.Input
                              // value={switchLogs}
                              id="mode_value_2"
                              type="radio"
                              checked={
                                modalData?.jobData?.consignee_details
                                  ?.mode_value == "FCL"
                              }
                              disabled
                              name="mode_value"
                            />
                            <FormCheck.Label htmlFor="mode_value_2">
                              FCL
                            </FormCheck.Label>
                          </FormCheck>
                        </div>
                      </div>
                    ) : modalData?.jobData?.consignee_details?.mode == 3 ? (
                      <div className="flex items-center gap-5  mx-4 mt-4">
                        <FormLabel
                          htmlFor="mode_value"
                          className="mt-6 flex whitespace-nowrap"
                        >
                          MODE <span className="text-red-400">*</span>
                        </FormLabel>
                        <div className="flex flex-row gap-5 mt-4">
                          <FormCheck className="mr-2">
                            <FormCheck.Input
                              // value={spotData?.mode_value}
                              id="mode_value_4"
                              type="radio"
                              checked={
                                modalData?.jobData?.consignee_details
                                  ?.mode_value == "LTL"
                              }
                              disabled
                              name="mode_value"
                            />
                            <FormCheck.Label htmlFor="mode_value_4">
                              {"LTL"}
                            </FormCheck.Label>
                          </FormCheck>
                          <FormCheck className="mt-2 mr-2 sm:mt-0">
                            <FormCheck.Input
                              // value={switchLogs}
                              id="mode_value_5"
                              type="radio"
                              checked={
                                modalData?.jobData?.consignee_details
                                  ?.mode_value == "FTL"
                              }
                              disabled
                              name="mode_value"
                            />
                            <FormCheck.Label htmlFor="mode_value_5">
                              FTL
                            </FormCheck.Label>
                          </FormCheck>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}

                    {modalData?.job_type && (
                      <div>
                        <FormLabel
                          htmlFor="destination-country"
                          className="text-base text-slate-500"
                        >
                          JOB TYPE <span className="text-red-400">*</span>
                        </FormLabel>

                        <FormSelect value={modalData?.job_type} disabled>
                          <option value="">Select Job Type</option>
                          {jobTypeList &&
                            jobTypeList?.map((ele, index) => (
                              <option key={index} value={ele?.id}>
                                {ele?.job_type_name}
                              </option>
                            ))}
                        </FormSelect>
                      </div>
                    )}

                    {/* <div className=" col-span-3 md:col-span-3 lg:col-span-1">
                      <FormLabel
                        htmlFor="service_type"
                        className="text-base text-slate-500"
                      >
                        SERVICE TYPE<span className="text-red-400">*</span>
                      </FormLabel>
                      <FormSelect value={modalData?.service_type} disabled>
                        <option value={""}>Select</option>
                        {serviceType?.length >= 1
                          ? serviceType
                              ?.filter((item: any) => item?.is_active == 1)
                              ?.map((item: any) => (
                                <option value={item?.id}>
                                  {item?.service_type}
                                </option>
                              ))
                          : ""}
                      </FormSelect>
                    </div> */}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2">
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
                {senderOpen && (
                  <SenderDetails
                    open={senderOpen}
                    onClose={() => {
                      setSenderOpen(false);
                    }}
                    isEdit={false}
                    booking={modalData?.jobData?.shipper_details}
                  />
                )}
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
                {receiverOpen && (
                  <ReceiverDetails
                    open={receiverOpen}
                    onClose={() => {
                      setReceiverOpen(false);
                    }}
                    isEdit={false}
                    countryData={countryData || []}
                    booking={modalData?.jobData}
                    dimensionData={
                      modalData?.jobData?.shipment_dimensions || []
                    }
                  />
                )}
              </div>
              <div>
                <p className="font-semibold ">
                  {modalData?.jobData?.shipper_details?.consigner_first_name}
                </p>
                <p className="font-semibold ">
                  {modalData?.jobData?.shipper_details?.consigner_address_1}
                </p>
                <p className="font-semibold ">
                  {modalData?.jobData?.shipper_details?.consigner_city}
                </p>
                <p className="font-semibold ">
                  {" "}
                  {modalData?.jobData?.shipper_details?.consigner_pincode}
                </p>
              </div>
              <div>
                <p className="font-semibold ">
                  {modalData?.jobData?.consignee_details?.consignee_first_name}
                </p>
                <p className="font-semibold ">
                  {modalData?.jobData?.consignee_details?.consignee_address_1}
                </p>
                <p className="font-semibold ">
                  {modalData?.jobData?.consignee_details?.consignee_city}
                </p>
                <p className="font-semibold ">
                  {" "}
                  {modalData?.jobData?.consignee_details?.consignee_pincode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const footer = (
    <div className="flex justify-end ">
      <Button
        className="px-4 py-1 rounded-lg bg-mustard text-white  ml-2"
        onClick={() => {
          handleBook(modalData?.job_id);
          setBookSpinner(true);
        }}
        disabled={bookSpinner || selfSpinner}
      >
        Submit
        {bookSpinner && (
          <LoadingIcon
            icon="puff"
            color="white"
            className="w-5 h-5 ml-2 stroke-2.5 text-white"
          />
        )}
      </Button>
      {showBtn && (
        <Button
          className="px-4 py-1 rounded-lg bg-mustard text-white  ml-4"
          onClick={() => {
            handleBook(modalData?.job_id, true);
            setSelfSpinner(true);
          }}
          disabled={bookSpinner || selfSpinner}
        >
          Generate Skart Label
          {selfSpinner && (
            <LoadingIcon
              icon="puff"
              color="white"
              className="w-5 h-5 ml-2 stroke-2.5 text-white"
            />
          )}
        </Button>
      )}
    </div>
  );

  const dimensionDescription = (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8  p-2 rounded-lg ">
        <div>
          <FormLabel htmlFor="regular-form-1">Box No</FormLabel>
          <FormInput
            type="text"
            placeholder="Box No"
            id="box_no"
            value={selectedDimension?.box_no}
            disabled
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">Description</FormLabel>
          <FormInput
            type="text"
            placeholder="Description"
            id="item_description"
            value={selectedDimension?.item_description}
            disabled
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">
            Weight{" "}
            {modalData?.weight_unit && <> (in {modalData?.weight_unit})</>}
          </FormLabel>
          <FormInput
            type="text"
            placeholder="Weight"
            id="weight"
            value={selectedDimension?.weight}
            disabled
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">
            Value{" "}
            {modalData?.currency_id && (
              <>
                (in{" "}
                {`${
                  currencyData?.find(
                    (data) => data?.id == modalData?.currency_id,
                  )?.currency || ""
                }`}
                )
              </>
            )}
          </FormLabel>
          <FormInput
            type="text"
            placeholder="Value"
            id="value"
            value={selectedDimension?.value}
            disabled
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">Quantity</FormLabel>
          <FormInput
            type="text"
            placeholder="Quantity"
            id="quantity"
            value={selectedDimension?.quantity}
            disabled
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">Length (in cm)</FormLabel>
          <FormInput
            type="text"
            placeholder="Length"
            id="length"
            value={selectedDimension?.length}
            disabled
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">Breadth (in cm)</FormLabel>
          <FormInput
            type="text"
            placeholder="Breadth"
            id="breadth"
            value={selectedDimension?.breadth}
            disabled
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">Height (in cm)</FormLabel>
          <FormInput
            type="text"
            placeholder="Height"
            id="height"
            value={selectedDimension?.height}
            disabled
          />
        </div>
        <div>
          <FormLabel htmlFor="regular-form-1">HSN Code</FormLabel>
          <FormInput
            type="text"
            placeholder="HSN Code"
            id="hsn_code"
            value={selectedDimension?.hsn_code}
            disabled
          />
        </div>
      </div>
    </>
  );

  const handleDelete = (e: any, index?: any) => {
    e.stopPropagation();
    e.isPropagationStopped();
    const newData = [...dimensionData];
    newData.splice(index, 1);
    setJobData((prev) => ({ ...prev, shipment_dimensions: newData }));
    setDimensionData(newData);
    getChargeableWeight(
      1,
      dimensionUnit == 2 ? convertedDimension : newData,
      editData?.courier_id,
    );
  };

  useEffect(() => {
    const gross_weight = dimensionData?.reduce((acc: any, curr: any) => {
      acc += Number(curr?.weight);
      return acc;
    }, 0);
    setGrossWeight(gross_weight);
  }, [dimensionData]);

  useEffect(() => {
    funcOverseas();
  }, []);
  const editDescription = (
    <>
      <div className=" inline-block justify-between gap-4 mb-2 border border-[#ffe7b1]   bg-gradient-to-r from-[#FFF9EB] via-[#FDFDFD] to-[#FDFDFD] rounded-lg">
        <div className=" px-4 py-2 ">
          <b>ENQUIRY No: </b>
          {editData?.booking_no}
        </div>
      </div>


      <div className="col-span-12 h-[50vh] overflow-auto ">
        <div className="box">
          <div className="space-y-4 px-2 py-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
              <div className=" col-span-3 md:col-span-3 lg:col-span-1">
                <div>
                  <FormLabel className="text-base text-slate-500">
                    FRANCHISEE <span className="text-red-400">*</span>
                  </FormLabel>
                </div>
                <FormInput
                  value={
                    franchiseeData?.find(
                      (cus) => cus?.franchisee_id == editData?.franchisee_id,
                    )?.franchisee_name || "-"
                  }
                  disabled
                />
              </div>
              <div className=" col-span-3 md:col-span-3 lg:col-span-1">
                <FormLabel
                  htmlFor="origin-country"
                  className="text-base text-slate-500"
                >
                  SHIPMENT TYPE <span className="text-red-400">*</span>
                </FormLabel>
                <FormSelect
                  id="default"
                  disabled
                  value={editData.shipment_type}
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
              <div className="flex justify-between items-end gap-4">
                <div className=" gap-2">
                  <FormLabel
                    htmlFor="chargeable_weight"
                    className=" text-slate-500 text-sm"
                  >
                    CHARGEABLE WEIGHT <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormInput
                    // className={`w-full ${
                    //   errors?.weight ? "border border-red-400" : ""
                    // }`}
                    id="weight"
                    type="text"
                    value={chWeight}
                    onChange={(e) => {
                      setChWeight(
                        e.target.value
                          .replace(/[^0-9.]/g, "")
                          .replace(/(\..*?)\./g, "$1"),
                      );
                    }}
                  />
                </div>
                <div className=" gap-2">
                  <FormLabel
                    htmlFor="gross_weight"
                    className="text-sm text-slate-500"
                  >
                    GROSS WEIGHT <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormInput
                    // className={`w-full ${
                    //   errors?.weight ? "border border-red-400" : ""
                    // }`}
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
                  // onChange={(e) => {
                  //   setSpotData((prev: any) => ({
                  //     ...prev,
                  //     weight_unit: e.target.value,
                  //   }));
                  // }}
                  className="w-20 h-10"
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
              <div className=" col-span-3 md:col-span-3 lg:col-span-1">
                {" "}
                <FormLabel
                  htmlFor="quoted_by"
                  className="text-base text-slate-500"
                >
                  QUOTED BY <span className="text-red-400">*</span>
                </FormLabel>
                <div className="flex items-center gap-2 w-[100%]">
                  <FormInput
                    className="w-[100%]"
                    id="quoted_by"
                    value={editData?.quoted_by}
                    disabled
                  />
                </div>
              </div>
              <div className=" grid grid-cols-1 gap-4">
                <div>
                  <FormLabel
                    htmlFor="commodity"
                    className="text-base text-slate-500"
                  >
                    COMMODITY <span className="text-red-400">*</span>
                  </FormLabel>
                  <CommonSearchableAll
                    apiEndpoint="/admin/commodity-type"
                    placeholder="Search Commodity"
                    zIndex="40"
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
                {/* <div>
                  <FormLabel
                    htmlFor="service_type"
                    className="text-base text-slate-500"
                  >
                    SERVICE TYPE<span className="text-red-400">*</span>
                  </FormLabel>
                  <FormSelect value={editData?.service_type} disabled>
                    <option value={""}>Select</option>
                    {serviceType?.length >= 1
                      ? serviceType
                          ?.filter((item: any) => item?.is_active == 1)
                          ?.map((item: any) => (
                            <option value={item?.id}>
                              {item?.service_type}
                            </option>
                          ))
                      : ""}
                  </FormSelect>
                </div> */}
              </div>

              <div className=" col-span-3 md:col-span-3 lg:col-span-1">
                {" "}
                <FormLabel
                  htmlFor="credit_limit"
                  className="text-base text-slate-500"
                >
                  CREDIT LIMIT <span className="text-red-400">*</span>
                </FormLabel>
                <div className="flex items-center gap-2 w-[100%]">
                  <FormInput
                    className="w-[100%]"
                    id="quoted_by"
                    value={indianFormat(Number(editData?.credit_limit || 0))}
                    disabled
                  />
                </div>
              </div>

              {(editData?.shipment_type == 4 ||
                editData?.shipment_type == 5 ||
                editData?.shipment_type == 8) && (
                <div className="col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-2 items-center">
                    {/* <div>
                      <FormLabel
                        htmlFor="destination-country"
                        className="text-base text-slate-500"
                      >
                        CARGO TYPE <span className="text-red-400">*</span>
                      </FormLabel>

                      <FormSelect
                        value={editData?.cargo_type}
                        onChange={(e) => {
                          setEditData((prev) => {
                            return {
                              ...prev,
                              cargo_type: e.target.value,
                              clearence_type: e.target.value == "1" ? "3" : "1",
                            };
                          });
                        }}
                      >
                        <option value="">Select Cargo Type</option>
                        {cargoTypeData &&
                          cargoTypeData?.map((ele, index) => (
                            <option key={index} value={ele?.id}>
                              {ele?.name}
                            </option>
                          ))}
                      </FormSelect>
                    </div> */}

                    <div>
                      <FormLabel
                        htmlFor="clearence-type"
                        className="text-base text-slate-500"
                      >
                        CLEARANCE TYPE <span className="text-red-400">*</span>
                      </FormLabel>

                      <FormSelect
                        value={editData?.clearence_type}
                        onChange={(e) => {
                          const evalue = e.target.value;
                          setEditData((prev) => ({
                            ...prev,
                            clearence_type: e.target.value,
                          }));
                        }}
                      >
                        <option value="">Select Clearance Type</option>
                        {clearanceType &&
                          clearanceType
                            ?.filter((ele) => {
                              if (editData?.shipment_type == 8) {
                                return ele.id !== 3;
                              }
                              return true;
                            })
                            ?.map((ele, index) => (
                              <option key={index} value={ele.id}>
                                {ele.name}
                              </option>
                            ))}
                      </FormSelect>
                    </div>

                    <div>
                      <FormLabel
                        htmlFor="incoterm"
                        className="text-base text-slate-500"
                      >
                        INCOTERM <span className="text-red-400">*</span>
                      </FormLabel>

                      <FormSelect
                        id="incoterm"
                        value={editData?.incoterm}
                        onChange={(e) => {
                          setEditData((prev) => ({
                            ...prev,
                            incoterm: e.target.value,
                          }));
                        }}
                      >
                        <option value="">Select Incoterm</option>
                        {incoterm &&
                          incoterm?.map((ele, index) => (
                            <option key={index} value={ele?.id}>
                              {ele?.name}
                            </option>
                          ))}
                      </FormSelect>
                    </div>

                    <div>
                      <FormLabel
                        htmlFor="job_type"
                        className="text-base text-slate-500"
                      >
                        JOB TYPE <span className="text-red-400">*</span>
                      </FormLabel>

                      <FormSelect
                        id="job_type"
                        value={editData?.job_type}
                        onChange={(e) => {
                          setEditData((prev) => ({
                            ...prev,
                            job_type: e.target.value,
                          }));
                        }}
                      >
                        <option value="">Select Job Type</option>
                        {jobTypeList &&
                          jobTypeList?.map((ele, index) => (
                            <option key={index} value={ele?.id}>
                              {ele?.job_type_name}
                            </option>
                          ))}
                      </FormSelect>
                    </div>

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

                    {editData?.shipment_type == 8 &&
                      (editData?.fair_data?.mode == 2 ? (
                        <div className="col-span-12 sm:col-span-6 flex item-center gap-5  mx-4 mt-4">
                          <FormLabel
                            htmlFor="mode_value"
                            className="mt-2 flex whitespace-nowrap"
                          >
                            MODE <span className="text-red-400">*</span>
                          </FormLabel>
                          <div className="flex flex-row gap-5">
                            <FormCheck className="mr-2">
                              <FormCheck.Input
                                id="mode_value_1"
                                type="radio"
                                checked={
                                  jobData?.consignee_details?.mode_value ==
                                  "LCL"
                                }
                                onChange={(e: any) => {
                                  if (e.target.checked) {
                                    setJobData((pre: any) => ({
                                      ...pre,
                                      consignee_details: {
                                        ...pre.consignee_details,
                                        mode_value: "LCL",
                                      },
                                    }));
                                  }
                                }}
                                name="mode_value"
                              />
                              <FormCheck.Label htmlFor="mode_value_1">
                                {"LCL"}
                              </FormCheck.Label>
                            </FormCheck>
                            <FormCheck className="mt-2 mr-2 sm:mt-0">
                              <FormCheck.Input
                                // value={switchLogs}
                                id="mode_value_2"
                                type="radio"
                                checked={
                                  jobData?.consignee_details?.mode_value ==
                                  "FCL"
                                }
                                onChange={(e: any) => {
                                  if (e.target.checked) {
                                    setEditData((pre: any) => ({
                                      ...pre,
                                      consignee_details: {
                                        ...pre.consignee_details,

                                        mode_value: "FCL",
                                      },
                                    }));
                                  }
                                }}
                                name="mode_value"
                              />
                              <FormCheck.Label htmlFor="mode_value_2">
                                FCL
                              </FormCheck.Label>
                            </FormCheck>
                          </div>
                        </div>
                      ) : editData?.fair_data?.mode === 3 ? (
                        <div className="col-span-12 sm:col-span-6 flex item-center gap-5  mx-4 mt-4">
                          <FormLabel
                            htmlFor="mode_value"
                            className="mt-2 flex whitespace-nowrap"
                          >
                            MODE <span className="text-red-400">*</span>
                          </FormLabel>
                          <div className="flex flex-row gap-5">
                            <FormCheck className="mr-2">
                              <FormCheck.Input
                                // value={spotData?.mode_value}
                                id="mode_value_4"
                                type="radio"
                                checked={
                                  jobData?.consignee_details?.mode_value ==
                                  "LTL"
                                }
                                onChange={(e: any) => {
                                  if (e.target.checked) {
                                    setEditData((pre: any) => ({
                                      ...pre,
                                      consignee_details: {
                                        ...pre.consignee_details,

                                        mode_value: "LTL",
                                      },
                                    }));
                                  }
                                }}
                                name="mode_value"
                              />
                              <FormCheck.Label htmlFor="mode_value_4">
                                {"LTL"}
                              </FormCheck.Label>
                            </FormCheck>
                            <FormCheck className="mt-2 mr-2 sm:mt-0">
                              <FormCheck.Input
                                // value={switchLogs}
                                id="mode_value_5"
                                type="radio"
                                checked={
                                  jobData?.consignee_details?.mode_value ==
                                  "FTL"
                                }
                                onChange={(e: any) => {
                                  if (e.target.checked) {
                                    setEditData((pre: any) => ({
                                      ...pre,
                                      consignee_details: {
                                        ...pre.consignee_details,

                                        mode_value: "FTL",
                                      },
                                    }));
                                  }
                                }}
                                name="mode_value"
                              />
                              <FormCheck.Label htmlFor="mode_value_5">
                                FTL
                              </FormCheck.Label>
                            </FormCheck>
                          </div>
                        </div>
                      ) : (
                        <></>
                      ))}
                    <div>
                      <FormLabel
                        htmlFor="dimension-unit"
                        className="text-base text-slate-500"
                      >
                        PRIMARY OVERSEAS
                      </FormLabel>
                      <FormSelect
                        value={editData?.primary_overseas}
                        onChange={(e) => {
                          setEditData((prev) => ({
                            ...prev,
                            primary_overseas: e.target.value,
                          }));
                        }}
                        className="uppercase"
                      >
                        <option value="">Select one</option>
                        {overseasdata &&
                          overseasdata?.map((data: any, index: any) => (
                            <option
                              className="uppercase"
                              key={index}
                              value={data?.party_id}
                            >
                              {data?.party_name}
                            </option>
                          ))}
                      </FormSelect>
                    </div>

                    <div>
                      <FormLabel
                        htmlFor="dimension-unit"
                        className="text-base text-slate-500"
                      >
                        SECONDARY OVERSEAS
                      </FormLabel>
                      <FormSelect
                        value={editData?.secondary_overseas}
                        onChange={(e) => {
                          setEditData((prev) => ({
                            ...prev,
                            secondary_overseas: e.target.value,
                          }));
                        }}
                        className="uppercase"
                      >
                        <option value="">Select one</option>
                        {overseasdata &&
                          overseasdata?.map((data: any, index: any) => (
                            <option
                              className="uppercase"
                              key={index}
                              value={data?.party_id}
                            >
                              {data?.party_name}
                            </option>
                          ))}
                      </FormSelect>
                    </div>

                    <div>
                      <FormLabel
                        htmlFor="currency-select"
                        className="text-base text-slate-500"
                      >
                        CURRENCY
                      </FormLabel>
                      <FormSelect
                        id="currency-select"
                        value={editData?.currency_id || "24"}
                        onChange={(e) => {
                          setEditData((prev) => ({
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

                    {(editData?.shipment_type == 4 ||
                      editData?.shipment_type == 5) &&
                      vendorData
                        ?.find(
                          (item: any) =>
                            item?.product_id == editData?.courier_id,
                        )
                        ?.product_name?.toLowerCase()
                        .includes("fedex") && (
                        <div>
                          <FormLabel
                            htmlFor="fedex-services"
                            className="text-base text-slate-500"
                          >
                            Fedex Services{" "}
                            <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormSelect
                            id="fedex-services"
                            value={editData?.fedex_services}
                            onChange={(e) => {
                              setEditData((prev) => ({
                                ...prev,
                                fedex_services: e.target.value,
                              }));
                            }}
                          >
                            <option value={""}>Select fedex services</option>
                            <option value={1}>IPF</option>
                            <option value={2}>IEF</option>
                            <option value={3}>IP</option>
                          </FormSelect>
                        </div>
                      )}

                    {(editData?.shipment_type == 4 ||
                      editData?.shipment_type == 5) &&
                      vendorData
                        ?.find(
                          (item: any) =>
                            item?.product_id == editData?.courier_id,
                        )
                        ?.product_name?.toLowerCase()
                        .includes("aramex") && (
                        <div>
                          <FormLabel
                            htmlFor="courier-vendor-code"
                            className="text-base text-slate-500"
                          >
                            Aramex Product Code{" "}
                            <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormSelect
                            id="courier-vendor-code"
                            value={editData?.courier_vendor_code || ""}
                            onChange={(e) => {
                              setEditData((prev) => ({
                                ...prev,
                                courier_vendor_code: e.target.value,
                              }));
                            }}
                          >
                            <option value={""}>Select</option>
                            {aramexProductList?.map(
                              (item: any) =>
                                item?.is_active == 1 && (
                                  <option key={item.id} value={item.code}>
                                    {item.code}
                                  </option>
                                ),
                            )}
                          </FormSelect>
                        </div>
                      )}
                  </div>
                </div>
              )}
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
                  <div className="flex items-center gap-2">
                    {typeof courierData?.product_name == "string" &&
                      courierData?.product_name
                        ?.toLowerCase()
                        .includes("emirates") && (
                        <Button
                          className="bg-mustard text-white p-2"
                          onClick={() => {
                            setCommodityPreview(true);
                          }}
                        >
                          Emirates Invoice Details
                        </Button>
                      )}
                    <Button
                      className="bg-mustard text-white p-2"
                      disabled={weightSpinner}
                      onClick={() =>
                        getChargeableWeight(
                          1,
                          dimensionUnit == 2
                            ? convertedDimension
                            : dimensionData,
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
                    </Button>
                    <Button
                      className="bg-mustard text-white p-2"
                      onClick={() => setDocModalOpen(true)}
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Document
                    </Button>
                    <div className="relative group">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center cursor-pointer shadow-md hover:shadow-blue-300 hover:scale-110 transition-all duration-200">
                        <Lucide
                          icon="Info"
                          className="w-3 h-3 text-white stroke-[2.5]"
                        />
                      </div>
                      <div className="absolute bottom-8 right-0 z-50 hidden group-hover:block w-72 pointer-events-none">
                        <div className="bg-white text-gray-800 text-xs rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Lucide
                                icon="Zap"
                                className="w-3 h-3 text-blue-500"
                              />
                            </div>
                            <span className="font-bold text-blue-600 text-[11px] uppercase tracking-wide">
                              Smart Auto-Fill
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed mb-2">
                            Save time! Upload your document and we'll read it
                            automatically to fill in your details.
                          </p>
                          <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-2 py-1.5">
                            <Lucide
                              icon="FileCheck"
                              className="w-3 h-3 text-green-500 flex-shrink-0"
                            />
                            <span className="text-gray-500">
                              Supported:{" "}
                              <span className="text-green-600 font-semibold">
                                JPG, PNG, PDF
                              </span>
                            </span>
                          </div>
                          <p className="text-gray-400 mt-2 text-[10px]">
                            You can always edit the pre-filled information
                            before submitting.
                          </p>
                        </div>
                        <div className="w-2.5 h-2.5 bg-white border-r border-b border-blue-100 rotate-45 absolute -bottom-1.5 right-2"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table
                    sm
                    hover
                    striped
                    className="bg-white shadow-lg rounded-md"
                  >
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
                                  e.stopPropagation();
                                  e.isPropagationStopped();
                                  if (dimensionData?.length == 1) {
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
                        </Table.Th>
                        <Table.Th className="whitespace-nowrap border">
                          BOX NO
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
                        <Table.Th className="whitespace-nowrap border">
                          ACTION
                        </Table.Th>
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
                              id="box_no"
                              type="text"
                              name="box_no"
                              placeholder="Box No"
                              value={item?.box_no}
                              onChange={(e) => {
                                handleDimensionChange(
                                  e.target.name,
                                  e.target.value.replace(/[^0-9]/g, ""),
                                  index,
                                );
                              }}
                            />
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
            </div>

            <div className="grid grid-cols-2 border-1 p-4 rounded-md bg-[#fff8eb] ">
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
                <SenderDetails
                  open={senderOpen}
                  onClose={() => {
                    setSenderOpen(false);
                  }}
                  booking={editData}
                  isEdit={true}
                  setJobData={setJobData}
                  vendorData={vendorData}
                />
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
                <ReceiverDetails
                  open={receiverOpen}
                  onClose={() => {
                    setReceiverOpen(false);
                  }}
                  booking={{
                    ...editData,
                    courier_name:
                      vendorData?.find(
                        (item: any) => item?.product_id == editData?.courier_id,
                      )?.product_name || "N.A.",
                  }}
                  isEdit={true}
                  countryData={countryData || []}
                  setJobData={setJobData}
                  dimensionData={dimensionData || []}
                  vendorData={vendorData}
                />
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
              disableExchangeSell={exchangeSellLocked}
              importBookingType={importBookingType}
            />
          </div>
        </div>
      </div>
      {commodityPreview && (
        <CommodityModal
          open={commodityPreview}
          onClose={() => {
            setCommodityPreview(false);
          }}
          dimensionData={dimensionData}
          setDimensionData={setDimensionData}
          currencyData={currencyData}
        />
      )}
    </>
  );

  const editFooter = (
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
            disabled={spinner}
            onClick={() => {
              let buy = false;
              let sell = false;

              if (!sellingcharges[0]?.charge_id == "") {
                const isAllFilled = sellingcharges?.every((item: any) =>
                  Object.values(item).every(
                    (value) =>
                      value != "" && value != null && value != undefined,
                  ),
                );

                if (!isAllFilled) {
                  showAlert(
                    "Please fill all the details in the sell Charges",
                    "warning",
                  );
                  return;
                }

                const sellMissingCurrency = sellingcharges?.some(
                  (item: any) => item?.charge_id && !item?.currency,
                );
                if (sellMissingCurrency) {
                  showAlert(
                    "Please select currency for all selling charges",
                    "warning",
                  );
                  return;
                }

                const sellMissingExRate = sellingcharges?.some(
                  (item: any) =>
                    item?.charge_id &&
                    (!item?.ex_rate || Number(item?.ex_rate) <= 0),
                );
                if (sellMissingExRate) {
                  showAlert(
                    "Please provide exchange rate for all selling charges",
                    "warning",
                  );
                  return;
                }

                sell = true;
              } else {
                sell = true;
              }

              if (!buycharges[0]?.charge_id == "") {
                const isAllFilled = buycharges?.every((item: any) =>
                  Object.values(item).every(
                    (value) =>
                      value != "" && value != null && value != undefined,
                  ),
                );
                if (
                  !isAllFilled &&
                  buycharges[0]?.charge_id == 163 &&
                  buycharges?.length == 1
                ) {
                  setJobData((pre) => ({ ...pre, buy_charges: [] }));
                } else {
                  const buyMissingCurrency = buycharges?.some(
                    (item: any) => item?.charge_id && !item?.currency,
                  );
                  if (buyMissingCurrency) {
                    showAlert(
                      "Please select currency for all buying charges",
                      "warning",
                    );
                    return;
                  }

                  const buyMissingExRate = buycharges?.some(
                    (item: any) =>
                      item?.charge_id &&
                      (!item?.ex_rate || Number(item?.ex_rate) <= 0),
                  );
                  if (buyMissingExRate) {
                    showAlert(
                      "Please provide exchange rate for all buying charges",
                      "warning",
                    );
                    return;
                  }

                  buy = true;
                }
              } else {
                buy = true;
              }

              if (sell == true) {
                checkEmptyFields(jobData);
              }
            }}
            className="ml-2 bg-mustard p-2 w-[100px]"
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );

  useEffect(() => {
    if (editData?.incoterm == 2) {
      setSellingCharges((prev: any) => {
        const updatedCharges = [...prev];

        const chargeExists = updatedCharges?.some(
          (charge) => charge.charge_id == 162,
        );

        if (updatedCharges[0]?.charge_id == "" && !chargeExists) {
          updatedCharges[0] = {
            ...intarrcharges,
            charge_id: 162,
            enquiry_id: editData?.id,
            weight: 1,
            sac_code:
              chargesList?.find((item2: any) => item2?.charge_id == 163)
                ?.hsn_code || "",
            inr_amount: 0,
          };
        } else if (!chargeExists) {
          updatedCharges.push({
            ...intarrcharges,
            weight: editData?.weight,
            inr_amount: 0,
          });
        }

        return updatedCharges;
      });
    } else {
      setSellingCharges((prev: any) => {
        const updatedCharges = prev?.filter(
          (charge: any) => charge.charge_id != 162,
        );
        if (updatedCharges.length == 0) {
          setSellingCharges([{ ...intarrcharges, weight: editData?.weight }]);
        } else {
          return updatedCharges;
        }
      });
    }
  }, [editData?.incoterm, editData?.weight]);

  const checkEmptyFields = (data: any) => {
    if (!editData?.clearence_type) {
      showAlert("Clearance type is required", "warning");
      return;
    }
    if (!editData?.incoterm) {
      showAlert("Incoterm is required", "warning");
      return;
    }

    if (!editData?.job_type) {
      showAlert("Job type is required", "warning");
      return;
    }

    if (
      (editData?.shipment_type == 4 || editData?.shipment_type == 5) &&
      vendorData
        ?.find((item: any) => item?.product_id == editData?.courier_id)
        ?.product_name?.toLowerCase()
        .includes("fedex") &&
      !editData?.fedex_services
    ) {
      showAlert("Fedex services is required", "warning");
      return;
    }

    if (
      (editData?.shipment_type == 4 || editData?.shipment_type == 5) &&
      vendorData
        ?.find((item: any) => item?.product_id == editData?.courier_id)
        ?.product_name?.toLowerCase()
        .includes("aramex") &&
      !editData?.courier_vendor_code
    ) {
      showAlert("Aramex product code is required", "warning");
      return;
    }

    if (dimensionData?.length == 0) {
      showAlert("Please add at least one shipment dimension", "warning");
      return;
    } else {
      for (let i = 0; i < dimensionData.length; i++) {
        const item = dimensionData[i] as Record<string, any>;

        for (const key in item) {
          if (item.hasOwnProperty(key) && item[key]) {
            if (
              (key === "weight" ||
                key === "value" ||
                key === "length" ||
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

    for (const key in data) {
      if (key == "buy_charges" || key == "sell_charges") {
        continue;
      }
      if (
        data[key] == "" ||
        data[key] == null ||
        (Array?.isArray(data[key]) && data[key]?.length === 0) ||
        (typeof data[key] == "object" && Object?.keys(data[key])?.length === 0)
      ) {
        showAlert(`${key.replaceAll("_", " ")} is required.`, "warning");
        return;
      }
    }

    if (
      editData?.shipment_type == 8 &&
      !jobData?.consignee_details?.mode_value &&
      jobData?.consignee_details?.mode == "2"
    ) {
      showAlert("mode value is required", "warning");
      return;
    }

    handleUpdateJob();
  };

  const handleUpdateJob = async () => {
    const hasCommodity =
      dimensionData?.some((item) => "commodity" in item) || false;
    if (
      courierData?.product_name?.toLowerCase().includes("emirates") &&
      !hasCommodity
    ) {
      showAlert("Custom Details are mandatory for Emirates", "warning");
      return;
    }
    const selectedCourierName = vendorData
      ?.find((item: any) => item?.product_id == editData?.courier_id)
      ?.product_name?.toLowerCase();
    const isFedexApplicable =
      (editData?.shipment_type == 4 || editData?.shipment_type == 5) &&
      selectedCourierName?.includes("fedex");
    const isAramexApplicable =
      (editData?.shipment_type == 4 || editData?.shipment_type == 5) &&
      selectedCourierName?.includes("aramex");
    try {
      const res = await UpdateJobApi({
        ...jobData,
        sell_charges: sellingcharges[0]?.charge_id ? sellingcharges : [],
        buy_charges: buycharges[0]?.charge_id ? buycharges : [],
        job_type: editData?.job_type || "",
        clearance_type: editData?.clearence_type || "",
        inco_term: editData?.incoterm || "",
        commodity: editData?.commodity || "",
        gross_weight: grWeight || grossWeight || 0,
        chargeable_weight: chWeight || editChWeight || 0,
        primary_overseas: editData?.primary_overseas,
        secondary_overseas: editData?.secondary_overseas,
        shipment_dimensions:
          dimensionUnit == 2 ? convertedDimension : dimensionData,
        currency_id: editData?.currency_id || 24,
        ...(isFedexApplicable && {
          fedex_services: editData?.fedex_services || "",
        }),
        ...(isAramexApplicable && {
          courier_vendor_code: editData?.courier_vendor_code || "",
        }),
      });
      if (res?.status == 200) {
        getEnquiryData();
        setEditModal(false);
        showAlert(res?.data?.msg || res?.data?.message);
        setDimensionUnit("1");
      } else if (res?.response?.status == 406) {
        showAlert(res?.response?.data?.errors[0]?.msg, "warning");
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

  const handleCharges = async (id: any = "", chargeable_weight: any) => {
    try {
      const res = await GetChargesApi(id);
      if (res?.status == 200) {
        if (res?.data?.data?.length > 0) {
          const oldCharge =
            res?.data?.data
              ?.filter(
                (item: any) => item?.charge_id != 162 && item?.charge_id != 163,
              )
              ?.map((item: any) => item?.charge_id) || [];
          setOldCharges(oldCharge);

          const customDuty = res?.data?.data?.find(
            (item: any) => item?.charge_id == 162,
          );
          if (customDuty) {
            const sellData = {
              enquiry_id: id,
              charge_id: customDuty?.charge_id || "",
              weight: 1,
              sac_code:
                chargesList?.find(
                  (item2: any) => item2?.ref_sell_id == customDuty?.charge_id,
                )?.hsn_code || "",
              per_kg: customDuty?.per_kg || 0,
              inr_amount: customDuty?.inr_amount || 0,
              currency: customDuty?.currency || "24",
              rate: Number(customDuty?.rate) || 0,
              old_sell: customDuty?.inr_amount || 0,
              charge_name:
                chargesList?.find(
                  (item2: any) => item2?.ref_sell_id == customDuty?.charge_id,
                )?.charge_name || "",
            };
            setSellingCharges([sellData]);
          }

          // Extract unique foreign currencies from selling charges (charge_type == 2)
          const sellingChargesData =
            res?.data?.data?.filter((item: any) => item?.charge_type == 2) ||
            [];
          const uniqueForeignCurrencies: any[] = [];
          sellingChargesData.forEach((charge: any) => {
            const cId = String(charge?.currency || "24");
            if (
              cId &&
              cId !== "24" &&
              !uniqueForeignCurrencies.find((c: any) => c.currency_id === cId)
            ) {
              uniqueForeignCurrencies.push({
                currency_id: cId,
                ex_rate: String(charge?.ex_rate || ""),
              });
            }
          });
          if (uniqueForeignCurrencies.length > 0) {
            setExchangedataSell([
              { id: "1", currency_id: "24", ex_rate: "1" },
              {
                id: "2",
                currency_id: uniqueForeignCurrencies[0]?.currency_id || "",
                ex_rate: uniqueForeignCurrencies[0]?.ex_rate || "",
              },
            ]);
            setExchangeSellLocked(true);
          }

          // Extract unique foreign currencies from buying charges (charge_type == 1)
          const buyingChargesData =
            res?.data?.data?.filter((item: any) => item?.charge_type == 1) ||
            [];
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
          }
        }
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

  const handleGetJob = async (
    job_id: any,
    type: any = "",
    shipment_type: any,
    mode_value: any,
  ) => {
    try {
      const res = await GetJobApi(job_id);
      if (res?.status == 200) {
        if (type == 1 && res?.data?.data) {
          setEditData((prev) => ({ ...prev, ...res?.data?.data }));
          setJobData((prev) => ({
            ...prev,
            shipper_details: res?.data?.data?.shipper_details,
            consignee_details: {
              ...res?.data?.data?.consignee_details,
              ...(shipment_type == 8 && {
                mode_value: res?.data?.data?.consignee_details?.mode_value
                  ? res?.data?.data?.consignee_details?.mode_value
                  : mode_value,
              }),
            },
          }));
        } else if (type == 2) {
          setModalData((prev) => ({
            ...prev,
            jobData: {
              ...res?.data?.data,
              consignee_details: {
                ...res?.data?.data?.consignee_details,
                mode_value: mode_value,
              },
              import_booking: prev?.import_booking || 1,
              import_booking_type: prev?.import_booking_type || 1,
            },
          }));
        }
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      showAlert(error?.message || error?.msg, "error");
    }
  };

  const handleShipmentInscan = async (job_id: any) => {
    try {
      const res = await Commercial_inscan_airwaybill(job_id);
      if (res?.status == 200) {
        setConfirm(false);
        getEnquiryData();
        showAlert(res?.data?.message);
      } else {
        showAlert(
          res?.data?.message || res?.response?.data?.message || res?.message,
          "error",
        );
      }
    } catch (error) {
      showAlert(error?.message || error?.msg, "error");
    } finally {
      setConfirmSpinner(false);
    }
  };

  const handleDimensionChange = (name: any, Value: any, index: any) => {
    const updatedDimensions = [...dimensionData];
    updatedDimensions[index] = { ...updatedDimensions[index], [name]: Value };
    setDimensionData(updatedDimensions);
    setJobData((prev) => ({
      ...prev,
      shipment_dimensions: updatedDimensions,
    }));
  };

  // on scroll animatil this useffect load a card after one sec delay when you scroll

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(
      ".rtp-reveal:not(.rtp-reveal-visible)",
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
              "rtp-reveal-visible",
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
  }, [readyToProcess]);
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
              Ready To Process
            </h2>
          </div>
          <div className="tableSearch relative w-200">
            <FormInput
              className="h-[30px] w-full rounded-md border border-[#e5e7eb] pl-3 pr-10 text-sm focus:border-[#f0b646] focus:ring-[#f0b646]"
              id="vertical-form-1"
              type="text"
              placeholder="Search "
              onChange={(e) => {
                setDatatoget((pre: any) => ({
                  ...pre,
                  search1: e.target.value.replace(/\s/g, ""),
                  page1: 1,
                }));
              }}
            />

            <button className=" searchListTable absolute top-[6px] right-2 text-stone-300">
              <Search className="w-[17px] h-[17px]" />
            </button>
          </div>
        </div>
        {loading == true ? (
          <div className="p-3 flex items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="tablelist p-3">
            {readyToProcess?.length == 0 ? (
              <div className="flex items-center justify-center h-[40vh]">
                <img
                  src={NoData}
                  alt="No Data Found!"
                  className="w-1/2 rounded-full opacity-50"
                />
              </div>
            ) : (
              <>
                <div className="w-full">
                  {rows?.map((row: any, index: number) => (
                    <div
                      key={row?.id || index}
                      data-reveal-index={index}
                      className="rtp-reveal w-full border rounded-lg mb-3 group bg-[#fff] border-[#fff1d3] even:bg-[#fff] even:border-[#eaf1f6] hover:bg-[#fff] hover:border-[#E6E6E6] opacity-0 translate-y-6 transition-all duration-700 ease-out"
                    >
                      <div className="justify-between border-[#fff1d3] border-b w-full block lg:flex pt-[5px] pb-[3px] px-2 items-center bg-[#fffbf2] group-even:bg-[#f6faff] rounded-t-lg group-even:border-[#eaf1f6] group-hover:bg-[#F8F8F8] group-hover:border-[#E6E6E6]">
                        <div className="flex relative mb-2 lg:mb-0">
                          <figure className="bg-[#FFF0CE] group-even:bg-[#E8F2FF] rounded-full p-[2px] w-[30px] h-[30px] justify-between flex items-center group-hover:bg-[#e3e3e3]">
                            <FileText className="w-[18px] h-[18px] text-[#B68F34] group-even:text-[#5A81B4] m-auto group-hover:text-[#303030]" />
                          </figure>
                          <aside className="ml-2 leading-[14px]">
                            <h2 className="text-[#9099a2] text-[12px] font-medium uppercase leading-[14px]">
                              ENQUIRY Number
                            </h2>
                            <h3 className="text-[12px] font-bold text-[#e1a722] rounded-[10px]">
                              {row?.booking_no || "-"}
                            </h3>
                          </aside>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="text-left lg:text-right leading-[16px]">
                            <h4 className="font-medium text-[13px]">
                              WEIGHT :<span> {row?.weight}</span>
                            </h4>
                            <p className="text-[13px] text-[#797979]">
                              {row?.created_date || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 pt-3 pb-2">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-12 lg:col-span-8">
                            <div className="w-full">
                              <div className="w-full font-medium text-[14px]">
                                Franchisee : {row?.franchisee_name || "-"}
                              </div>
                              <div className="w-full  flex gap-x-5 mt-1">
                                <div className="leading-[16px] mb-2 lg:mb-0">
                                  <small className="text-[11px] text-[#797979] flex items-center">
                                    <i className="w-[5px] h-[5px] bg-green-500 group-even:bg-[#6EA8E0] rounded-full mr-1 inline-block group-hover:bg-[#a0a0a0]"></i>
                                    ORIGIN
                                  </small>
                                  <p className="text-[14px] text-[#303030]">
                                    {countryData?.find(
                                      (con: any) =>
                                        con?.country_id == row?.org_country_id,
                                    )?.country_name || "-"}
                                  </p>
                                </div>
                                <div className="leading-[16px]">
                                  <small className="text-[11px] text-[#797979] flex items-center">
                                    <i className="w-[5px] h-[5px] bg-[#efb847] group-even:bg-[#6EA8E0] rounded-full mr-1 inline-block group-hover:bg-[#a0a0a0]"></i>
                                    DESTINATION
                                  </small>
                                  <p className="text-[14px] text-[#303030]">
                                    {row?.country_name || "-"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-12 lg:col-span-4">
                            <div className="flex relative gap-2 justify-end">
                              <div className="flex justify-center items-center">
                                {row?.action}
                              </div>
                            </div>
                            <div className="w-full text-[13px] mt-2 text-left lg:text-right flex justify-end">
                              Checklist :&nbsp;<span>{row?.checklist}</span>
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
                                    {row?.booking_status || "-"}
                                  </span>
                                </h3>
                              </h2>

                              <div className=" text-[13px] w-full lg:w-[50%] lg:justify-end text-left lg:text-right flex">
                                Checklist Docs &nbsp;:&nbsp;
                                <span className="text-[#959595]">
                                  {row?.checklist_docs || "-"}
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
                  onPageChange={(e) => handlePageChange(e, 1)}
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
          @keyframes rtpCardReveal {
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
        title="Create sKart Airwaybill"
        size="2xl"
        description={description}
        footer={footer}
      />
      <Modal
        open={openDimension}
        setOpen={setOpenDimension}
        title="Dimension Details"
        size="lg"
        description={dimensionDescription}
      />
      <Modal
        open={editModal}
        setOpen={setEditModal}
        title="Shipment Details"
        size="2xl"
        description={editDescription}
        footer={editFooter}
      />
      <Modal
        open={confirm}
        setOpen={setConfirm}
        title="Confirmation"
        size="lg"
        description={confirmDescription}
        footer={confirmFooter}
      />
      <DocumentUploadModal
        open={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        onSubmit={(data: any) => {
          if (
            data?.shipment_dimensions &&
            data?.shipment_dimensions?.length > 0
          ) {
            setDimensionData(data?.shipment_dimensions || [initDimension]);
            setJobData((prev) => ({
              ...prev,
              shipment_dimensions: data?.shipment_dimensions || [initDimension],
            }));
            getChargeableWeight(
              1,
              dimensionUnit == 2 ? convertedDimension : dimensionData,
              editData?.courier_id,
              1,
            );
          }
          setEditData({ ...editData, ...data });
          setDocModalOpen(false);
        }}
        shipmentTypes={shipmentType}
        editData={editData}
        dimensionData={dimensionData}
        franchiseeName={
          franchiseeData?.find(
            (f: any) => f.franchisee_id == editData?.franchisee_id,
          )?.franchisee_name || ""
        }
      />
    </>
  );
};

export default ReadyToProcess;
