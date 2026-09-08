import React, { useEffect, useState } from "react";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Button from "../../../base-components/Button";
import { Eye } from "lucide-react";
import Table from "../../../components/Table";
import { FormInput, FormLabel } from "../../../base-components/Form";
import LoadingIcon from "../../../base-components/LoadingIcon";
import CommonPagination from "../../../components/Pagination";
import {
  AwbDataSalesname,
  AwbDatafranchiseename,
  AwbDatapersonname,
  Countrydestination,
  Get_dispatch_status,
  Get_doctype,
  Get_document_type,
  Get_franchise,
  Get_search_awb_detail_report,
  Get_vendor_list,
  branchId,
} from "../../../AllServices/services";
import { convertJSONtoCSV, formatDateWithoutTime } from "../../../utils";

const AWBDetailsReports: React.FC = () => {
  //   const [allcharges, setAllcharges] = useState<allchargesdatatypes[]>([]);
  const [kyctypedata, setKycTypedata] = useState<any>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [itemId, setItemId] = useState<any>("");
  const [statusdata, setStatusData] = useState<any>([]);
  const [Modaldata, setModalData] = useState<any>([]);
  const [integratorsdata, setIntegratorsdata] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [franchiseedata, setFranchiseedata] = useState<any>([]);
  const [hit, setHit] = useState(1);
  const [downloadisLoading, setDownloadisLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState(1);
  const [condata, setCondata] = useState<any>([]);
  const [postisLoading, setPostisLoading] = useState<any>("");
  const [fromTo, setFromTo] = useState<any>({ from_date: "", to_date: "" });
  const [allgetdata, setAllgetData] = useState<any>([]);
  const [bookingData, setBookingData] = useState<boolean>(true);
  const [salesName, setSalesname] = useState<Array<any>>()
  const [countryData, setCountryData] = useState<Array<any>>([])
  const [branchItem, setBranchItem] = useState<Array<any>>([])
  const [docType, setDocType] = useState<Array<any>>([]);

  const { showAlert } = useAlert();
  const onPageChange = (page: number) => {
    setPage(page);
    setHit(2);
  };
  useEffect(() => {
    if (fromTo?.from_date && fromTo?.to_date) {
      getintdata(hit);
    }
  }, [page]);

  useEffect(() => {
    getallintdata();
    doctype()
  }, []);
  const getallintdata = async () => {
    try {
      const res = await Get_document_type();
      const res2 = await Get_vendor_list();
      const res3 = await Get_franchise();
      const res4 = await Get_dispatch_status();
      if (res?.status == 200) {
        setKycTypedata(res?.data?.data || []);
      }
      if (res2?.status == 200) {
        setIntegratorsdata(res2?.data?.data || []);
      }
      if (res3?.status == 200) {
        setFranchiseedata(res3?.data?.data || []);
      }
      if (res4?.status == 200) {
        setStatusData(res4?.data?.data || []);
      } else {
        setKycTypedata([]);
        setIntegratorsdata([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const doctype = async() => {
    const res = await Get_doctype();
    setDocType(res?.data?.data)
  }

  const getalldownloddata = async () => {
    try {
      setDownloadisLoading(true);
      const { from_date, to_date } = fromTo;
      const params: any = {};
      if (from_date) {
        params.from_date = from_date;
      }
      if (from_date) {
        params.to_date = to_date;
      }
      try {
        setDownloadisLoading(true);
        const response = await Get_search_awb_detail_report(
          "getAwbDetailsRportsDownload",
          params
        );

        if (response?.status == 200 || response?.status == 204) {
          const data = response?.data?.data;
          const newdata = data?.map((item: any) => {
        
            const newcourierid = item["courier_id"];
            const newfid = item["pickup_franchisee_id"];
            const newcodeid = item["dispatch_status_code"];
            const newbookid = item["booking_shipment_type_id"];
            const pickupitemy = item["pickup_item"]
           
                  const result = franchiseedata?.find((ele:any) => ele?.franchisee_id == newfid)?.field_sales;
               
            const salesper = salesName?.find((ele:any) => ele?.id == result)?.sales_person;
          

            const destination_countryy =  countryData?.find((ele:any) => ele?.country_id == item?.delivery_country_id)?.country_name;
            const branch = branchItem?.find((ele:any) => ele?.branch_id == item?.pickup_branch_id)?.branch_name
            const weightUnit = item?.weight_unit
            delete item["courier_id"];
            delete item["pickup_franchisee_id"];
            delete item["dispatch_status_code"];
            delete item["booking_shipment_type_id"];
         
            delete item['delivery_country_id'];
            delete item['pickup_item'];
         
            delete item['pickup_branch_id'];
            delete item['weight_unit']
            return {
              ...item,
              doc_type:
                docType?.find((ele) => ele?.id == item?.doc_type)?.value ||
                "N.A.",
              actual_weight: weightUnit == 'gms'? Number(item?.actual_weight) / 1000: item?.actual_weight, 
              sales_person: salesper || "N.A.",
              destination_country: destination_countryy,
              branch: branch,
              invoice_date: item?.invoice_date ? item?.invoice_date : "N.A.",
              shipper_address: `${item?.shipper_address_1} ${item?.shipper_address_2}`,
              consignee_address: `${item?.consignee_address1} ${item?.consignee_address2}`,
              updated_date: item?.updated_date
                ? formatDateWithoutTime(item?.updated_date)
                : "" || "",
              shipment_type:
                newbookid == 1
                  ? "Non-Document"
                  : newbookid == 2
                  ? "Document"
                  : newbookid == 4
                  ? "Commercial"
                  : "N.A.",
              kyc_type:
                getparticulardata("kyc", item?.doc_type, kyctypedata)?.value ||
                "",
              integrator:
                getparticulardata("int", newcourierid, integratorsdata)
                  ?.product_name || "",
              franchisee_name:
                getparticulardata("franchisee", newfid, franchiseedata)
                  ?.franchisee_name || "",
              booking_date: formatDateWithoutTime(item?.booking_date) || "",

              length:
                newbookid != 2
                  ? pickupitemy?.length >= 1
                    ? pickupitemy[0]?.length
                    : "0"
                  : "0",

              breadth:
                newbookid != 2
                  ? pickupitemy?.length >= 1
                    ? pickupitemy[0]?.breadth
                    : "0"
                  : "0",
              height:
                newbookid != 2
                  ? pickupitemy?.length >= 1
                    ? pickupitemy[0]?.height
                    : "0"
                  : "0",
              // newbookid != 2
              //   ? item?.pickup_item?.length >= 1
              //     ? item?.pickup_item[0]?.weight
              //     : "0"
              //   : item?.chargeable_weight + " " + item?.weight_unit,
              "gross_weight (kgs)": weightUnit== 'gms' ? Number(item?.actual_weight)/1000: item?.actual_weight,

              "volumetric_weight (kgs)": item?.volumetric_weight,
              last_scan_event:
                getparticulardata("status", newcodeid, statusdata)?.status ||
                "",
            };
          });

          convertJSONtoCSV(newdata || [], "awb_details_report");
        } else {
          showAlert("Something going wrong!..", "error");
        }
      } catch (err: any) {
        console.log(err, "error");
      } finally {
        setDownloadisLoading(false);
      }
    } catch (err: any) {
      console.log(err?.message);
    } finally {
      setDownloadisLoading(false);
    }
  };

  const country_destination = async() => {
     const res = await Countrydestination();
     setCountryData(res?.data?.data)

  }

  const branchData = async() => {
    const res = await branchId();
    setBranchItem(res?.data?.data);
  }
  const getintdata = async (value: any) => {
    const { from_date, to_date } = fromTo;
    const params: any = {
      page: page,
      per_page: 20,
    };
    if (from_date) {
      params.from_date = from_date;
    }
    if (from_date) {
      params.to_date = to_date;
    }
    if (value == 1 || value == 2) {
      setBookingData(true);
      try {
        setPostisLoading(value);
        const response = await Get_search_awb_detail_report(
          "getAwbDetailsRports",
          params
        );

        if (response?.status == 200 || response?.status == 204) {
          const data = response?.data?.data;

          setCondata(data || []);
          setTotalPages(
            Number(
              Math.ceil(response?.data?.total / response?.data?.per_page)
            ) || 0
          );

          const res: any = await AwbDatafranchiseename();
          setFranchiseedata(res?.data?.data)

          // console.log("awbData", data);
          const res1:any = await AwbDataSalesname();
          setSalesname(res1?.data?.data);
        } else {
          showAlert("Something going wrong!..", "error");
        }
      } catch (err: any) {
        console.log(err, "error");
      } finally {
        setPostisLoading("");
        setBookingData(false);
      }
    }
  };
  const handleint = () => {
    setPage(1);
    setHit(4);
    setAllgetData([]);
    setCondata([]);
  };
  // console.log(totalPages,"totalpages")

  // const salespersonnamedata = async() => {
  //    const res:any = await AwbDatafranchiseename();

  //    console.log("franchise",res?.data?.data)

  //    const res1:any = await AwbDataSalesname();
  //    console.log("sales",res1?.data?.data)
  // }

  const columns = [
    { field: "airwaybillno", headerName: "AWB No" },
    { field: "invoice_date", headerName: "Invoice Date"},
    { field: "booking_invoice_no", headerName: "Invoice Number" },
    { field: "sales_person", headerName: "Sales Person Name" },
    { field: "destination_country", headerName: "Destination" },
    { field: "number_of_pieces", headerName: "No of Pcs"},
    { field: "branch", headerName: "Branch Name"},
    { field: "length", headerName: "Length(cms)" },
    { field: "breadth", headerName: "Breadth(cms)" },
    { field: "height", headerName: "Height(cms)" },
    { field: "gross_weight", headerName: "Gross Weight(kgs)" },
    { field: "volumetric_weight", headerName: "Volumetric Weight(kgs)" },
    { field: "integrator", headerName: "Integrator" },
    { field: "last_scan_event", headerName: "Last Scan Event" },
    {
      field: "updated_date",
      headerName: "Updated Date",
    },
    { field: "shipper_name", headerName: "Shipper Name" },
    { field: "shipper_company_name", headerName: "Shipper Company" },
    { field: "shipper_email_id", headerName: "Shipper Email" },
    { field: "shipper_mobile", headerName: "Shipper Mobile" },
    { field: "shipper_address", headerName: "Shipper Address" },
    { field: "booking_date", headerName: "Booking Date" },
    { field: "franchisee_name", headerName: "Franchisee Name" },
    { field: "consignee_name", headerName: "Consignee Name" },
    { field: "consignee_company_name", headerName: "Consignee Company" },
    { field: "consignee_email", headerName: "Consignee Email" },
    { field: "consignee_mobile", headerName: "Consignee Mobile" },
    { field: "consignee_address", headerName: "Consignee Address" },
    { field: "shipment_type", headerName: "Shipment Type" },
    { field: "kyc_type", headerName: "KYC Type" },
    { field: "gstin", headerName: "KYC Number" },
  ];

  const getparticulardata = (forwhat?: string, id?: any, mydata?: any) => {
    if (forwhat == "int") {
      const singledata = mydata?.find((item: any) => item?.product_id == id);
      return singledata;
    } else if (forwhat == "kyc") {
      const singledata = mydata?.find((item: any) => item?.id == id);
      return singledata;
    } else if (forwhat == "franchisee") {
      const singledata = mydata?.find((item: any) => item?.franchisee_id == id);
      return singledata;
    } else if (forwhat == "status") {
      const singledata = mydata?.find((item: any) => item?.status_code == id);
      return singledata;
    } else {
      return;
    }
  };

  const row = condata?.map((item: any) => {
    const action = (
      <Button
        onClick={() => {
          setItemId(item?.id);
          setModalData([item?.pickup_item[0]]);
          setOpenModal(true);
        }}
      >
        <Eye />
      </Button>
    );

    const result = franchiseedata?.find((ele:any) => ele?.franchisee_id == item?.pickup_franchisee_id)?.field_sales;
    const salespe = salesName?.find((ele:any) => ele?.id == result)?.sales_person;
    const branch = branchItem?.find((ele:any) => ele?.branch_id == item?.pickup_branch_id)?.branch_name

     const destination_country =  countryData?.find((ele:any) => ele?.country_id == item?.delivery_country_id)?.country_name;

    const newbookid = item["booking_shipment_type_id"];
    return {
      ...item,
      sales_person: salespe || "N.A.",
      destination_country: destination_country,
      branch: branch,
      invoice_date: item?.invoice_date ? item?.invoice_date : "N.A.",
      shipper_address: `${item?.shipper_address_1} ${item?.shipper_address_2}`,
      consignee_address: `${item?.consignee_address1} ${item?.consignee_address2}`,
      updated_date: item?.updated_date
        ? formatDateWithoutTime(item?.updated_date)
        : "" || "",
      shipment_type:
        item?.booking_shipment_type_id == 1
          ? "Non-Document"
          : item?.booking_shipment_type_id == 2
          ? "Document"
          : item?.booking_shipment_type_id == 4
          ? "Commercial"
          : "N.A.",
      kyc_type:
        getparticulardata("kyc", item?.doc_type, kyctypedata)?.value || "",
      integrator:
        getparticulardata("int", item?.courier_id, integratorsdata)
          ?.product_name || "",
      franchisee_name:
        getparticulardata(
          "franchisee",
          item?.pickup_franchisee_id,
          franchiseedata
        )?.franchisee_name || "",
      booking_date: formatDateWithoutTime(item?.booking_date) || "",

      length:
        newbookid != 2
          ? item?.pickup_item?.length >= 1
            ? item?.pickup_item[0]?.length
            : "0"
          : "0",

      breadth:
        newbookid != 2
          ? item?.pickup_item?.length >= 1
            ? item?.pickup_item[0]?.breadth
            : "0"
          : "0",
      height:
        newbookid != 2
          ? item?.pickup_item?.length >= 1
            ? item?.pickup_item[0]?.height
            : "0"
          : "0",
      gross_weight: item?.actual_weight,
      volumetric_weight: item?.volumetric_weight,
      last_scan_event:
        getparticulardata("status", item?.dispatch_status_code, statusdata)
          ?.status || "",
    };
  });
  return (
    <div className="m-auto  rounded p-4 mt-2">
      <div className=" border-l border-gray-300  "></div>
      <div className="flex justify-between  border-b-2 mb-4 pb-2 ">
        <div className="flex items-centermb-2 w-full">
          <span className={`mr-auto text-2xl text-primary font-bold `}>
            AWB DETAILS REPORT
          </span>
        </div>

        {condata?.length >= 1 ? (
          <div>
            <Button
              className="p-2 text-white w-[120px]"
              variant="success"
              disabled={downloadisLoading}
              onClick={() => getalldownloddata()}
            >
              {/* <Download className="mr-2"/> */}
              Download
              {downloadisLoading && (
                <LoadingIcon
                  icon="puff"
                  color="white"
                  className="w-5 h-5 ml-2 stroke-2.5 text-white"
                />
              )}
            </Button>
            {/* <Commondownload
              data={tranfereddata(allgetdata)}
              forwhat={"consolidated_reports"}
              icon={true}
            /> */}
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="w-full">
        <div className="bg-white rounded p-8 shadow-lg">
          <div
            className={` w-full grid sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3 xl:grid-cols-4 gap-5 m-auto `}
          >
            <div className="grid col-span-1">
              <div>
                <FormLabel>Booking Date (From)</FormLabel>
                <span className="text-red-400">*</span>

                <FormInput
                  type="date"
                  name="from_date"
                  value={fromTo?.from_date}
                  onChange={(e) => {
                    setFromTo((prev: any) => ({
                      ...prev,
                      from_date: e.target.value,
                    }));
                    handleint();
                  }}
                />
              </div>
            </div>

            <div className="grid col-span-1">
              <div>
                <FormLabel>Booking Date (To)</FormLabel>
                <span className="text-red-400">*</span>

                <FormInput
                  type="date"
                  name="to_date"
                  value={fromTo?.to_date}
                  onChange={(e) => {
                    setFromTo((prev: any) => ({
                      ...prev,
                      to_date: e.target.value,
                    }));
                    setPage(1);
                    setHit(2);
                    setAllgetData([]);
                    setCondata([]);
                  }}
                />
              </div>
            </div>

            {/* <div className="grid col-span-1">
              <div>
                <FormLabel>STATUS</FormLabel>
           
                <FormSelect
                  name="status"
                  value={initialdatatoget?.status}
                  onChange={handlechange}
                >
                  <option value={""}>All</option>
                  <option value={1}>Delivered</option>
                  <option value={0}>Un-Delivered</option>
                </FormSelect>
              </div>
            </div> */}

            <div className=" mt-7 grid-cols-2">
              <div>
                <Button
                  variant="mustard"
                  disabled={
                    postisLoading || !fromTo?.from_date || !fromTo?.to_date
                  }
                  onClick={() => {
                    getintdata(1);
                    country_destination();
                    branchData()
                    // getalldownloddata();
                    // setCondata([]);
                  }}
                  className=" mr-1 p-2 w-full"
                >
                  Search
                  {postisLoading && postisLoading == 1 && (
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
        </div>
      </div>
      <div className="w-full h-full ">
        {condata?.length > 0 ? (
          bookingData ? (
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
            <>
              <Table
                columns={columns}
                row={row}
                loading={postisLoading == 2 ? true : false}
                page={page - 1}
                overflowvalue={true}
                heightTable="40vh"
              />
              <CommonPagination
                onPageChange={onPageChange}
                page={Number(page)}
                totalpages={Number(totalPages)}
              />
            </>
          )
        ) : (
          <p className="text-gray-400 text-center mt-4">No Data Found!</p>
        )}
      </div>
    </div>
  );
};

export default AWBDetailsReports;