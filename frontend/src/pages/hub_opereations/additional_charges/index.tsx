import { useEffect, useState } from "react";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import {
  Additional_charges,
  Charge_head_drop_down,
  Get_Additional_list,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { AdditionalChargeData } from "../../../DataTypes/dataTypes";
import LoadingIcon from "../../../base-components/LoadingIcon";
import Table from "../../../components/Table";
import { formatDate, indianFormat } from "../../../utils";

const index = () => {
  const { showAlert } = useAlert();
  const [remarks, setRemarks] = useState<String>("");
  const [chargeHeadDropdown, setchargeHeadDropdown] = useState<Array<any>>([]);
  const [airwaybillNumber, setAirwaybillNumber] = useState<any>(null);
  const [sellingAmount, setSellingAmount] = useState<any>(null);
  const [buyingAmount, setBuyingAmount] = useState<any>(null);
  const [chargeHead, setChargeHead] = useState<any>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [chargesloading, setChargesloading] = useState<boolean>(false);
  const [additionalchargeslist, setAdditionalchargeslist] = useState([]);
  const [selling_ref_id, setSelling_ref_id] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");

  useEffect(() => {
    getChargeHeadDropdown();
    getaddcharg();
  }, []);

  const getaddcharg = async () => {
    try {
      setChargesloading(true);
      const res: any = await Get_Additional_list();
      if (res?.status == 200 || res?.status == 204) {
        setAdditionalchargeslist(res?.data?.data || []);
      }
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setChargesloading(false);
    }
  };

  const getChargeHeadDropdown = async () => {
    const response = await Charge_head_drop_down();
    if (response?.status == 200) {
      setchargeHeadDropdown(response.data.data);
    }
  };

  const submitAdditionalCharges = async () => {
    if (!airwaybillNumber) {
      showAlert("Please enter Airway Bill Number", "warning");
      return;
    } else if (!sellingAmount) {
      showAlert("Please enter Selling Amount", "warning");
      return;
    } else if (Number(sellingAmount) <= 0) {
      showAlert("Selling Amount sholud be greater than 0", "warning");
      return;
    } else if (!buyingAmount) {
      showAlert("Please enter Buying Amount", "warning");
      return;
    } else if (Number(buyingAmount) <= 0) {
      showAlert("Buying Amount sholud be greater than 0", "warning");
      return;
    } else if (!chargeHead) {
      showAlert("Please select Charge Head", "warning");
      return;
    } else if (!invoiceNo) {
      showAlert("Please enter Invoice Number", "warning");
      return;
    } else if (!invoiceDate) {
      showAlert("Please enter Invoice Date", "warning");
      return;
    }

    if (
      chargeHeadDropdown &&
      airwaybillNumber &&
      sellingAmount &&
      buyingAmount &&
      chargeHead &&
      invoiceNo &&
      invoiceDate
    ) {
      const chargeData = chargeHeadDropdown?.find(
        (item) => item.charge_id == chargeHead
      );

      const additionalChargeData: AdditionalChargeData = {
        airwaybill_no: airwaybillNumber?.trim(),
        flag: 2,
        remarks: chargeHead == 55 ? remarks : "",
        is_kawach: chargeData?.is_kawach || 0,
        invoice_no: invoiceNo?.trim(),
        invoice_date: invoiceDate,
        shipment_charges: {
          buying_charges: [
            {
              charge_id: chargeHead,
              charge_name: chargeData.charge_name,
              charge_amount: buyingAmount?.trim(),
              hsn_code: chargeData.hsn_code,
              tax_rate: chargeData.tax_rate,
              cgst: chargeData.tax_breakup.cgst,
              igst: chargeData.tax_breakup.igst,
              sgst: chargeData.tax_breakup.sgst,
            },
          ],
          selling_charges: [
            {
              charge_id: selling_ref_id,
              charge_name: chargeData.charge_name?.trim(),
              charge_amount: sellingAmount?.trim(),
              hsn_code: chargeData.hsn_code,
              tax_rate: chargeData.tax_rate,
              cgst: chargeData.tax_breakup.cgst,
              igst: chargeData.tax_breakup.igst,
              sgst: chargeData.tax_breakup.sgst,
            },
          ],
        },
      };
      if (Number(buyingAmount?.trim()) <= Number(sellingAmount?.trim())) {
        let response: any;
        try {
          setSpinner(true);
          response = await Additional_charges(additionalChargeData);
          if (response?.status == 200) {
            showAlert("Charges added successfully!");
            setAirwaybillNumber("");
            setSellingAmount("");
            setBuyingAmount("");
            setChargeHead("");
            setSelling_ref_id("");
            setInvoiceNo("");
            setInvoiceDate("");
          } else if (response?.status == 204) {
            showAlert("Invalid AWB Number!..", "error");
          } else if (response?.data?.status == 406) {
            showAlert("Fill all the data", "error");
          } else if (response?.name == "AxiosError") {
            showAlert(response?.message, "error");
          } else {
            showAlert("Something went wrong", "error");
          }
        } catch (err: any) {
          if (err?.message) {
            showAlert(err?.message, "error");
          } else {
            showAlert("Something went wrong", "error");
          }
        } finally {
          setSpinner(false);
        }
      } else {
        showAlert(
          "Buying amount can be less than or equal to selling amount",
          "warning"
        );
      }
    } else {
      showAlert("Something went wrong", "error");
    }
  };

  const findChargeName = (id?: any, data?: any) => {
    const newdata = data.find(
      (item?: any) => item?.charge_id == id || item?.ref_sell_id == id
    );
    return newdata;
  };

  const columns = [
    { field: "added_date", headerName: "Date" },
    { field: "airwaybilno", headerName: "Airwaybill No." },
    { field: "charges_id", headerName: "Charge Head" },
    { field: "total_amount", headerName: "Total Amount (&#8377;)" },
  ];

  const row: any = additionalchargeslist?.map((item: any) => {
    const Date = <p className="uppercase">{formatDate(item?.added_date)}</p>;
    const Amount = <p className="text-end">{indianFormat(item?.total_amount)}</p>;
    const ChargeHead = (
      <p className="uppercase">
        {findChargeName(item?.charges_id, chargeHeadDropdown)?.charge_name ||
          "N.A."}
      </p>
    );
    return {
      ...item,
      added_date: Date,
      total_amount: Amount,
      charges_id: ChargeHead,
    };
  });

  return (
    <>
      <div className="w-full max-w-8xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        <div className="w-full flex justify-between">
          <h1 className="font-bold text-lg">Additional Charges</h1>
        </div>
        <hr className="my-2" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
          <div>
            <FormLabel className={`flex items-center text-500`}>
              Airwaybill No.
            </FormLabel>
            <FormInput
              value={airwaybillNumber}
              onChange={(e) => setAirwaybillNumber(e.target.value)}
            />
          </div>

          <div>
            <FormLabel className={`flex items-center text-500`}>
              Selling Amount
            </FormLabel>
            <FormInput
              value={sellingAmount}
              onChange={(e) => setSellingAmount(e.target.value)}
            />
          </div>
          <div>
            <FormLabel className={`flex items-center text-500`}>
              Buying Amount
            </FormLabel>
            <FormInput
              value={buyingAmount}
              onChange={(e) => setBuyingAmount(e.target.value)}
            />
          </div>
          <div>
            <FormLabel className={`flex items-center text-500`}>
              Charge Head
            </FormLabel>
            <FormSelect
              value={chargeHead}
              onChange={(e) => {
                setRemarks("");
                setChargeHead(e.target.value);
                const data = chargeHeadDropdown.find(
                  (item?: any) => item?.charge_id == e.target.value
                );

                setSelling_ref_id(data?.ref_sell_id);
              }}
              name="charge"
              aria-label="Select State"
            >
              <option value="">Select Head</option>
              {chargeHeadDropdown?.map(
                (item) =>
                  item?.debit_note_charge == 0 && (
                    <option value={item.charge_id} key={item.charge_id}>
                      {item.charge_name}
                    </option>
                  )
              )}
            </FormSelect>
          </div>
          {chargeHead == 55 && (
            <div>
              <FormLabel className={`flex items-center text-500`}>
                Remarks
              </FormLabel>
              <FormInput
                value={remarks}
                maxLength={25}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          )}
          <div>
            <FormLabel className={`flex items-center text-500`}>
              Invoice Number
            </FormLabel>
            <FormInput
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </div>
          <div>
            <FormLabel className={`flex items-center text-500`}>
              Invoice Date
            </FormLabel>
            <FormInput
              value={invoiceDate}
              type="date"
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div>
            <Button
              disabled={spinner}
              onClick={submitAdditionalCharges}
              className="mt-4 h-8 bg-mustard border-none py-1 px-4 mr-2 text-white rounded-xl mb-1"
            >
              Add Charges{" "}
              {spinner && <LoadingIcon icon="puff" className="ml-2" />}
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full max-w-8xl mx-auto mt-4 px-6 py-3 bg-white rounded-lg shadow-lg">
        <h1 className="font-bold text-lg">Pending Additional Charges </h1>
        {additionalchargeslist?.length > 0 ? (
          <div className="overflow-x-auto">
            <Table heightTable="35vh" columns={columns} row={row} />
          </div>
        ) : chargesloading ? (
          <LoadingIcon icon="tail-spin" className="block m-auto w-[5%] " />
        ) : (
          <p className="mt-4 text-gray-400 text-center">No Data Found!</p>
        )}
      </div>
    </>
  );
};

export default index;
