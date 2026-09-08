import { ArrowLeft, Check, FileText, Trash2 } from "lucide-react";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import { useEffect, useState } from "react";
import { useAlert } from "../../../ContextProvider/AlertContext";
import {
  Type_value_list,
  Close_bag,
  Remove_bag_shipment,
  Generate_create_bag_pdf,
  Get_enable_vendor_btn,
  Check_airwaybill_courier,
  Route_matrix,
  common_post,
} from "../../../AllServices/services";
import Table from "../../../components/Table";
import Button from "../../../base-components/Button";
import {
  CloseBagData,
  RemoveShipmentData,
  RouteMatrixData,
} from "../../../DataTypes/dataTypes";
import LoadingIcon from "../../../base-components/LoadingIcon";
const intclosebagdatamother={
  length:0,
  height:0,
width:0,
weight:0,
}
export default function create_bag(data: any) {
  const { showAlert } = useAlert();
  const {
    bagNumber,
    setBagNumber,
    seal,
    emp_id,
    hub_id,
    typeList,
    createBag,
    spinner,
    setSpinner,
    setHubTypeId,
    setRegHubTypeId,
    setShowCreateBag,
    showCloseBag,
    setCourierTypeId,
    setBranchTypeId,
    shipmentInscanList,
    disableField,
    setShowCloseBag,
    getCreatedBagList,
    setDisableField,
    chargableWeightList,
    regHubTypeId,
    branchTypeId,
    hubTypeId,
    courierTypeId,
    incompleteCreatedBagData,
    forwhat,
    setForwhat,
    setShipmentInscanList,
  } = data;
  const [type, setType] = useState<any>(0);
  const [airwaybillNo, setAirwaybillNo] = useState<any>(null);
  const [checkedIds, setCheckedIds] = useState<Array<any>>([]);
  const [typeValueList, setTypeValueList] = useState<Array<any>>([]);
  const [hubCourierList, setHubCourierList] = useState<Array<any>>([]);
  const [hubRouteMatrixList, setHubRouteMatrixList] = useState<Array<any>>([]);
  const [closebagdata,setCloseBagdata]=useState<any>(intclosebagdatamother)
  const [regHubRouteMatrixList, setRegHubRouteMatrixList] = useState<
    Array<any>
  >([]);
  const [branchRouteMatrixList, setBranchRouteMatrixList] = useState<
    Array<any>
  >([]);
  const [pdfLink, setPdfLink] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadId, setDownloadId] = useState<any>(null);
  const [courierId, setCourierId] = useState<any>(null);

  useEffect(() => {
    if (type != null) getTypeValueList(type);
    if (incompleteCreatedBagData != null) {
      const typeCheck = typeList.find(
        (val: any) => val.name == incompleteCreatedBagData.destination_type
      )?.id;

      setHubTypeId(incompleteCreatedBagData.destination_hub_id);
      setRegHubTypeId(incompleteCreatedBagData.destination_reghub_id);
      setBranchTypeId(incompleteCreatedBagData.destination_branch_id);
      setCourierTypeId(incompleteCreatedBagData.courier_id);
      setBagNumber(incompleteCreatedBagData.bag_no);
      setType(typeCheck);
      // setAirwaybillNo(incompleteCreatedBagData.airwaybill_no);
      setDisableField(true);
    }
    getHubCourierList();
  }, [type, incompleteCreatedBagData]);

  useEffect(() => {
    if(forwhat=="Bag"){
  if (airwaybillNo) checkAirwaybillCourier();
    }
  
  }, [airwaybillNo]);

  useEffect(() => {
    if (type == 1 && courierId) setCourierTypeId(courierId);
  }, [courierId, type]);

  const checkAirwaybillCourier = async () => {
    try {
      const response = await Check_airwaybill_courier(airwaybillNo);
      if (response.status == 200) {
        setCourierId(response.data?.data[0].courier_id);
        routeMatrix(
          response.data?.data[0].from_pincode,
          response.data?.data[0].to_pincode
        );
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
    }
  };

  const routeMatrix = async (from_pincode: any, to_pincode: any) => {
    const routeMatrixData: RouteMatrixData = {
      from_pincode: from_pincode,
      to_pincode: to_pincode,
    };
    try {
      const response = await Route_matrix(routeMatrixData);
      if (response.status == 200) {
        setHubRouteMatrixList(response.data?.data?.hub);
        setRegHubRouteMatrixList(response.data?.data?.rhub);
        setBranchRouteMatrixList(response.data?.data?.branch);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getHubCourierList = async () => {
    try {
      const response = await Get_enable_vendor_btn(hub_id);
      if (response.status == 200)
        setHubCourierList(response.data?.data[0]?.hub_couriers);
      else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }
  };

  const getTypeValueList = async (type: any) => {
    try {
      const response = await Type_value_list(type);
      if (response.status == 200) setTypeValueList(response.data.data);
      else showAlert("Something went wrong!", "error");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }
  };

  const closeBag = async () => {
    const closeBagData: CloseBagData = {
      bag_no: bagNumber,
    };
    let response;
    try {
      setSpinner("Close");
      response =
        forwhat == "Bag"
          ? await Close_bag({ emp_id, hub_id }, closeBagData)
          : await common_post("/hub/widect/close_motherbox", {
              ...closebagdata,
              bag_no:bagNumber,
            });
      if (response.status == 201) {
        if(forwhat=="Mother"){
          await common_post("/hub/widect/create_motherbox_label",{bag_no:bagNumber});
        }
        getCreatedBagList();
        setShowCloseBag(false);
        setDisableField(false);
        setShowCreateBag(false);
        setCloseBagdata(intclosebagdatamother)
        setForwhat("")
        setShipmentInscanList([])
        showAlert(response.data.message, "success");
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert("Something went wrong!", "error");
    } finally {
      setSpinner('');
    }
  };

  const generateCreateBagPdf = async (airwaybill_no: any) => {
    try {
      setLoading(true);
      const response = await Generate_create_bag_pdf(airwaybill_no);
      if (response.status == 200) setPdfLink(response.data.data);
      else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdfLink != null) handleDownload(pdfLink);
  }, [pdfLink]);

  const handleDownload = (pdfLink: string) => {
    const link = document.createElement("a");
    link.href = pdfLink;
    link.download = "manifest_inward";
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { field: "airwaybill_no", headerName: "Airwaybill No." },
    { field: "weight", headerName: "Weight" },
    { field: "action", headerName: "Generate Label" },
    {
      field: "select",
      headerName: "Select Shipment",
      // headerName: (
      //   <FormCheck>
      //     <FormCheck.Input
      //       onChange={(e) => {
      //         if (e.target.checked)
      //           shipmentInscanList.map((val) =>
      //             setCheckedIds((prev) => [...prev, val.pickup_id])
      //           );
      //         else setCheckedIds([]);
      //       }}
      //       id="vertical-form-3"
      //       type="checkbox"
      //       value=""
      //     />
      //     <FormCheck.Label htmlFor="vertical-form-3">
      //       Select All
      //     </FormCheck.Label>
      //   </FormCheck>
      // ),
    },
  ];
 const  getTotalWeight=(arr:any)=> {
  return arr.reduce((sum, item) => sum + Number(item?.total_weight || 0), 0);
}
   const columns2 = [
     { field: "motherbox_no", headerName: "MotherBox No." },
     { field: "airwaybill_no", headerName: "Airwaybill No." },
     { field: "weight", headerName: "Weight" },
     { field: "injection_point", headerName: "Injection Point" },
   ];

  let total_weight = 0.0;
  const rows = shipmentInscanList.map((item: any) => {
    const chargableWeight = chargableWeightList?.find(
      (ele: any) => ele.pickup_id == item.pickup_id
    )?.chargableWeight;
    total_weight += chargableWeight;

    const ActionButton = (
      <Button
        onClick={() => {
          setDownloadId(item.airwaybill_no);
          generateCreateBagPdf(item.airwaybill_no);
        }}
        disabled={loading || !hubCourierList?.includes(item.courier_id)}
        className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-700"
      >
        <FileText className="w-5 h-4 mr-1" />
        Generate
        {loading && downloadId == item.airwaybill_no ? (
          <LoadingIcon icon="oval" color="white" className="w-4 h-4 ml-2" />
        ) : null}
      </Button>
    );

    const SelectId = (
      <FormCheck>
        <FormCheck.Input
          onChange={(e) => {
            if (e.target.checked)
              setCheckedIds((prev) => [...prev, item.pickup_id]);
            else
              setCheckedIds(checkedIds.filter((val) => val != item.pickup_id));
          }}
          id="vertical-form-3"
          type="checkbox"
          value=""
        />
      </FormCheck>
    );

    return {
      ...item,
      action: ActionButton,
      select: SelectId,
      weight: `${chargableWeight}${item.weight_unit}`,
    };
  });
  const rows2 = shipmentInscanList?.map((item: any) => {

// console.log(item,"item coming mother")
    

    return {
      motherbox_no: bagNumber || "",
      airwaybill_no: item?.airwaybill_no || "",
      weight: `${item?.total_weight}${item.weight_unit}`,
      // weight: `${chargableWeight}${item.weight_unit}`,
      injection_point: item?.injection_point,
    };
  });
  const removeShipment = async () => {
    const removeShipmentData: RemoveShipmentData = {
      id: checkedIds,
    };
    let response;
    try {
      response = await Remove_bag_shipment(hub_id, removeShipmentData);
      if (response.status == 200) {
        setShowCloseBag(false);
        setDisableField(false);
        showAlert(response.data.message, "success");
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center mb-2">
          <div
            className="p-2 cursor-pointer rounded-full shadow-lg mr-4"
            onClick={() => {setShowCreateBag(false)
            setForwhat("")
          setShipmentInscanList([])}}
          >
            <ArrowLeft className="w-5 h-4" />
          </div>
          <h1 className="text-base text-gray-500 font-bold">
            {forwhat == "Bag" ? "Create Bag" : "Mother Box"}
          </h1>
        </div>
        <hr />
        <div
          className={`mt-4 w-full grid ${
            forwhat == "Bag" ? "grid-cols-4" : "grid grid-cols-3"
          } gap-2`}
        >
          <div>
            <FormLabel>
              {forwhat == "Bag" ? "Bag No." : "MotherBox No."}
            </FormLabel>
            <FormInput
              className=""
              disabled={seal === 0 || disableField}
              placeholder="Bag Number"
              defaultValue={bagNumber}
              onChange={(e) => setBagNumber(e.target.value)}
            />
          </div>
          {forwhat == "Bag" ? (
            <div>
              <FormLabel>Destination</FormLabel>
              <FormSelect
                className=" "
                disabled={disableField}
                value={type}
                aria-label="Select type"
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">-- Select type --</option>
                {typeList.map((val: any) => (
                  <option key={val.id} value={val.id}>
                    {val.name}
                  </option>
                ))}
              </FormSelect>
            </div>
          ) : (
            ""
          )}
          {forwhat == "Bag" ? (
            <div className="col-span-1">
              <FormLabel>
                {type == 1
                  ? "Select Courier"
                  : type == 2
                  ? "Select Branch"
                  : type == 3
                  ? "Select Hub"
                  : type == 4
                  ? "Select Regional Hub"
                  : "First Select Destination"}
              </FormLabel>
              <FormSelect
                disabled={disableField}
                value={
                  type == 1
                    ? courierTypeId
                    : type == 2
                    ? branchTypeId
                    : type == 3
                    ? hubTypeId
                    : regHubTypeId
                }
                aria-label="Select type value"
                onChange={(e) => {
                  if (type == 1) setCourierTypeId(e.target.value);
                  else if (type == 2) setBranchTypeId(e.target.value);
                  else if (type == 3) setHubTypeId(e.target.value);
                  else setRegHubTypeId(e.target.value);
                }}
              >
                <option value="">-- Select --</option>
                {type != 1 ? (
                  <>
                    {typeValueList
                      .filter((val) =>
                        (type == 2
                          ? branchRouteMatrixList
                          : type == 3
                          ? hubRouteMatrixList
                          : regHubRouteMatrixList
                        )?.includes(
                          type == 4
                            ? val.id
                            : type == 2
                            ? val.branch_id
                            : val.hub_id
                        )
                      )
                      ?.map((val) => (
                        <option
                          key={
                            type == 4
                              ? val.id
                              : type == 2
                              ? val.branch_id
                              : val.hub_id
                          }
                          value={
                            type == 4
                              ? val.id
                              : type == 2
                              ? val.branch_id
                              : val.hub_id
                          }
                          style={{
                            backgroundColor: "rgb(213 213 213)",
                            fontWeight: "bold",
                          }}
                        >
                          {type == 4
                            ? val.reghub_name
                            : type == 2
                            ? val.branch_name
                            : val.hub_name}
                        </option>
                      ))}
                    {typeValueList
                      .filter(
                        (val) =>
                          !(
                            type == 2
                              ? branchRouteMatrixList
                              : type == 3
                              ? hubRouteMatrixList
                              : regHubRouteMatrixList
                          )?.includes(
                            type == 4
                              ? val.id
                              : type == 2
                              ? val.branch_id
                              : val.hub_id
                          )
                      )
                      ?.map((val) => (
                        <option
                          key={
                            type == 4
                              ? val.id
                              : type == 2
                              ? val.branch_id
                              : val.hub_id
                          }
                          value={
                            type == 4
                              ? val.id
                              : type == 2
                              ? val.branch_id
                              : val.hub_id
                          }
                        >
                          {type == 4
                            ? val.reghub_name
                            : type == 2
                            ? val.branch_name
                            : val.hub_name}
                        </option>
                      ))}{" "}
                  </>
                ) : (
                  typeValueList.map((val) => (
                    <option key={val.product_id} value={val.product_id}>
                      {val.product_name}
                    </option>
                  ))
                )}
              </FormSelect>
            </div>
          ) : (
            ""
          )}
       
          {forwhat == "Bag" || forwhat == "Mother" ? (
            <div>
              <FormLabel>Enter AirwayBill No.</FormLabel>
              <FormInput
                className=" "
                placeholder="Airwaybill Number"
                // disabled={disableField}
                value={airwaybillNo}
                onChange={(e) => setAirwaybillNo(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (forwhat == "Bag") {
                    if (e.key === "Enter") {
                      createBag(bagNumber, airwaybillNo, type,forwhat);
                      setAirwaybillNo("");
                    }
                  }else{
                     if (e.key === "Enter") {
                       createBag(bagNumber, airwaybillNo, type, forwhat);
                       setAirwaybillNo("");
                     }
                  }
                }}
              />
            </div>
          ) : (
            ""
          )}
          {forwhat == "Mother" && shipmentInscanList?.length >= 1 ? (
            <div>
              <FormLabel>Injection Point</FormLabel>
              <FormInput
                className=""
                placeholder="Injection Point"
                disabled
                value={shipmentInscanList[0]?.injection_point || ""}
              />
            </div>
          ) : (
            ""
          )}
          {forwhat == "Mother" && shipmentInscanList?.length >= 1 ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FormLabel>
                  Length (Cms)<span className="text-red-400">*</span>
                </FormLabel>
                <FormInput
                  className=""
                  placeholder="Length"
                  value={closebagdata?.length}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      // allow digits with optional decimal
                      setCloseBagdata((pre: any) => ({
                        ...pre,
                        length: value,
                      }));
                    }
                  }}
                />
              </div>
              <div>
                <FormLabel>
                  Height (Cms) <span className="text-red-400">*</span>
                </FormLabel>
                <FormInput
                  className=""
                  placeholder="Height"
                  value={closebagdata?.height}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      // allow digits with optional decimal
                      setCloseBagdata((pre: any) => ({
                        ...pre,
                        height: value,
                      }));
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            ""
          )}

          {forwhat == "Mother" && shipmentInscanList?.length >= 1 ? (
            <div>
              <FormLabel>
                Width (Cms)<span className="text-red-400">*</span>
              </FormLabel>
              <FormInput
                className=""
                placeholder="Width"
                value={closebagdata?.width}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    // allow digits with optional decimal
                    setCloseBagdata((pre: any) => ({
                      ...pre,
                      width: value,
                    }));
                  }
                }}
              />
            </div>
          ) : (
            ""
          )}
       {forwhat=="Mother"&&shipmentInscanList?.length>=1?
          <div>
            <FormLabel>
              Weight (Kgs)<span className="text-red-400">*</span>
            </FormLabel>
            <FormInput
              className=""
              placeholder="Weight
                  "
              value={closebagdata?.weight}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  // allow digits with optional decimal
                  setCloseBagdata((pre: any) => ({
                    ...pre,
                    weight: value,
                  }));
                }
              }}
            />
          </div>:""}
        </div>
        <div className="mt-4 w-full flex justify-between">
          {showCloseBag && (
            <div className="flex">
              <Button
                onClick={() => {
                  if (forwhat == "Bag") {
                    closeBag();
                  } else {
                    const isValid =
                      Object.values(closebagdata).length === 4 &&
                      Object.values(closebagdata).every(
                        (val) =>
                          val !== "" && !isNaN(Number(val)) && Number(val) > 0
                      );

                    if (isValid) {
                      closeBag();
                    } else {
                      showAlert(
                        "Please provide length , breadth, height , weight",
                        "warning"
                      );
                    }
                  }
                }}
                className="px-2 py-2 rounded-lg bg-green-500 text-white hover:bg-green-700"
              >
                <Check className="w-5 h-4 mr-1" />
             {spinner=="Close"?"Closing..":"Close Bag"}   
              </Button>
              {shipmentInscanList.length > 0 && (
                <div className="font-bold border-2 ml-8 border-yellow-400 px-3 py-1 rounded-lg text-yellow-400 flex items-center">
                  Total-Weight : {`${forwhat=="Bag"? total_weight:getTotalWeight(shipmentInscanList)}`}
                </div>
              )}
            </div>
          )}
          <div>
            <Button
              onClick={() => {
                if (forwhat == "Bag") {
                  createBag(bagNumber, airwaybillNo, type, forwhat);
                } else {
                  createBag(bagNumber, airwaybillNo, "", forwhat);
                }
                setAirwaybillNo("");
              }}
              // disabled={spinner || disableField}
              disabled={spinner || !airwaybillNo}
              className="px-4 py-1 rounded-lg bg-mustard text-white"
            >
              Inscan Shipment{" "}
              {spinner == forwhat && (
                <LoadingIcon icon="puff" className="ml-2" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {showCloseBag && forwhat == "Bag" && (
        <div className="w-full max-w-6xl mx-auto mt-4 px-4 py-2 bg-white rounded-lg shadow-lg">
          <Table columns={columns} row={rows} heightTable="33vh" />
          <Button
            onClick={() => removeShipment()}
            className="mt-4 px-2 py-2 rounded bg-red-500 text-white hover:bg-red-700"
          >
            <Trash2 className="w-5 h-4 mr-1" />
            Remove Shipment
          </Button>
        </div>
      )}
      {showCloseBag && forwhat == "Mother" && (
        <div className="w-full max-w-6xl mx-auto mt-4 px-4 py-2 bg-white rounded-lg shadow-lg">
          <Table columns={columns2} row={rows2} heightTable="33vh" />
          {/* <Button
            onClick={() => removeShipment()}
            className="mt-4 px-2 py-2 rounded bg-red-500 text-white hover:bg-red-700"
          >
            <Trash2 className="w-5 h-4 mr-1" />
            Remove Shipment
          </Button> */}
        </div>
      )}
    </>
  );
}
