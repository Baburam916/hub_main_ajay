import { useEffect, useRef, useState } from "react";
import { ShoppingBag, ClipboardCheck, Trash2, Plus, Minus } from "lucide-react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import { FormSelect } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { useLogin } from "../../../components/LoginContext";
import { useAlert } from "../../../ContextProvider/AlertContext";
import CommonSearchArr from "./CommonSearchArr";
import { indianFormat } from "../../../utils";
import Table from "../../../base-components/Table";

const SellBuyForm = (props: any) => {
  const bottomRef = useRef(null);

  const {
    chargesdata,
    spotData,
    sellingcharges,
    setSellingCharges,
    buycharges,
    setBuyCharges,
    currencydata,
    fun1,
    funtoempty,
    exchangedata,
    setExchangedata,
    totalbuy,
    totalSell,
    toggle,
    setToggle,
    getchweight,
    alltypedata,
    chargeable_weight,
    oldCharges,
    singlefranchiseedata,
    currencyname,
    gstStatus,
    exchangedataSell,
    setExchangedataSell,
    disableExchangeSell,
    disableExchangeBuy,
    importBookingType,
  } = props;
  const { showAlert } = useAlert();
  const { userdata } = useLogin();



  // handling selling charges here
  const handleSelectChange = (index: any, field: any, value: any) => {
    let newFormData = [...sellingcharges];
    if (field == "charge_id") {
      const singledata = chargesdata?.find(
        (item: any) => item.ref_sell_id == value
      );
      newFormData[index]["charge_id"] = value;
      newFormData[index]["enquiry_id"] = spotData?.id;
      newFormData[index]["sac_code"] = singledata["hsn_code"];
      newFormData[index]["charge_name"] = singledata["charge_name"];
      setSellingCharges(newFormData);
    } else {
      // For overseas sell rows: always lock to franchisee currency and exchange rate
      if (singlefranchiseedata?.is_overseas) {
        newFormData[index]["currency"] = String(singlefranchiseedata?.currency || "24");
        newFormData[index]["ex_rate"] = String(singlefranchiseedata?.exchange_rate || "1");
      }
      if (field == "per_kg") {
        const exRate = Number(newFormData[index]["ex_rate"]) || 1;
        if (value == "1") {
          newFormData[index]["weight"] = chargeable_weight;
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] =
            Number(newFormData[index]["rate"]) *
              Number(newFormData[index]["weight"]) * (exRate || 1) || 0;
          setSellingCharges(newFormData);
        } else {
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] = (newFormData[index]["rate"] || 0) * (exRate || 1);
          newFormData[index]["weight"] = 1;
          setSellingCharges(newFormData);
        }
      } else if (field == "rate") {
        const exRate = Number(newFormData[index]["ex_rate"]) || 1;
        if (newFormData[index]["per_kg"] == 1) {
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] =
            Number(newFormData[index]["rate"]) *
              Number(newFormData[index]["weight"]) * (exRate || 1) || 0;
          setSellingCharges(newFormData);
        } else {
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] = (newFormData[index]["rate"] || 0) * (exRate || 1);
          setSellingCharges(newFormData);
        }
      } else if (field == "weight") {
        const exRate = Number(newFormData[index]["ex_rate"]) || 1;
        if (newFormData[index]["per_kg"] == 1) {
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] =
            Number(newFormData[index]["rate"]) *
              Number(newFormData[index]["weight"]) * (exRate || 1) || 0;
          setSellingCharges(newFormData);
        } else {
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] = (newFormData[index]["rate"] || 0) * (exRate || 1);
          setSellingCharges(newFormData);
        }
      } else if (field == "currency") {
        const exRateFromSell = Number(exchangedataSell?.find((item: any) => item?.currency_id == value)?.ex_rate) || 0;
        newFormData[index][field] = value || 0;
        newFormData[index]["ex_rate"] = String(exRateFromSell);
        if (newFormData[index]["per_kg"] == 1) {
          newFormData[index]["inr_amount"] = Number(newFormData[index]["rate"]) * Number(newFormData[index]["weight"]) * (exRateFromSell || 1);
        } else {
          newFormData[index]["inr_amount"] = Number(newFormData[index]["rate"]) * exRateFromSell;
        }
        setSellingCharges(newFormData);
      } else {
        newFormData[index][field] = value || 0;
        setSellingCharges(newFormData);
      }
      setSellingCharges(newFormData);
    }
  };

  // handling buying charges
  const handleSelectChange2 = (index: any, field: any, value: any) => {
    let newFormData = [...buycharges];
    if (field == "charge_id") {
      const singledata = chargesdata?.find(
        (item: any) => item.charge_id == value
      );

      const singledata2 = sellingcharges.find(
        (item2: any) => item2?.charge_id == singledata?.ref_sell_id
      );

      newFormData[index]["charge_id"] = value;
      newFormData[index]["enquiry_id"] = spotData?.id;
      newFormData[index]["sac_code"] = singledata["hsn_code"];
      setBuyCharges(newFormData);
    } else {
      if (field == "per_kg") {
        // console.log(Number(newFormData[index]["ex_rate"]) || 1,"check")

        if (value == "1") {
          newFormData[index]["weight"] = chargeable_weight;
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] =
            Number(newFormData[index]["rate"]) *
              Number(newFormData[index]["weight"]) *
              (Number(newFormData[index]["ex_rate"]) || 1) || 0;
          setBuyCharges(newFormData);
        } else {
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] =
            newFormData[index]["rate"] *
              (Number(newFormData[index]["ex_rate"]) || 1) || 0;
          newFormData[index]["weight"] = 1;
          setBuyCharges(newFormData);
        }
      } else if (field == "rate") {
        if (newFormData[index]["per_kg"] == 1) {
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] =
            Number(newFormData[index]["rate"]) *
            Number(newFormData[index]["weight"]) *
            (Number(newFormData[index]["ex_rate"]) || 1);
          setBuyCharges(newFormData);
        } else {
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] =
            newFormData[index]["rate"] *
            (Number(newFormData[index]["ex_rate"]) || 1);
          setBuyCharges(newFormData);
        }
      } else if (field == "weight") {
        if (newFormData[index]["per_kg"] == 1) {
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] =
            Number(newFormData[index]["rate"]) *
            Number(newFormData[index]["weight"]) *
            (Number(newFormData[index]["ex_rate"]) || 1);
          setBuyCharges(newFormData);
        } else {
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] =
            newFormData[index]["rate"] *
            (Number(newFormData[index]["ex_rate"]) || 1);
          setBuyCharges(newFormData);
        }
      } else if (field == "currency") {
        // console.log(Number(
        //     exchangedata?.find((item: any) => item?.currency_id == value)?.ex_rate
        //   ) || 0, "check")
        if (newFormData[index]["per_kg"] == 1) {
          newFormData[index]["ex_rate"] =
            Number(
              exchangedata?.find((item: any) => item?.currency_id == value)
                ?.ex_rate
            ) || 0;
          newFormData[index][field] = value || 0;
          newFormData[index]["inr_amount"] =
            Number(newFormData[index]["rate"]) *
            Number(newFormData[index]["weight"]) *
            (Number(
              exchangedata?.find((item: any) => item?.currency_id == value)
                ?.ex_rate
            ) || 1);
          newFormData[index]["ex_rate"] =
            Number(
              exchangedata?.find((item: any) => item?.currency_id == value)
                ?.ex_rate
            ) || 0;
          setBuyCharges(newFormData);
        } else {
          newFormData[index][field] = value || 0;
          //  console.log("check2",exchangedata, Number(newFormData[index]["rate"]) *
          //      (Number(
          //        exchangedata?.find((item: any) => item.currency_id == Number(value))
          //          ?.ex_rate
          //      )) )
          newFormData[index]["ex_rate"] =
            Number(
              exchangedata?.find((item: any) => item?.currency_id == value)
                ?.ex_rate
            ) || 0;
          newFormData[index]["inr_amount"] =
            Number(newFormData[index]["rate"]) *
            Number(
              exchangedata?.find((item: any) => item?.currency_id == value)
                ?.ex_rate
            );
          setBuyCharges(newFormData);
        }
      } else {
        newFormData[index][field] = value || 0;
        setBuyCharges(newFormData);
      }
      // setBuyCharges(newFormData);
    }
  };
  // console.log(buycharges,"buychartes")
  //  deleting particuar row selling
  const removeRow = (index: any) => {
    if (sellingcharges?.length > 1) {
      const newFormData = [...sellingcharges];
      newFormData.splice(index, 1);
      setSellingCharges(newFormData);
    }
  };
  //  deleting particuar row buying
  const removeRow2 = (index: any) => {
    if (buycharges?.length > 1) {
      const newFormData = [...buycharges];
      newFormData.splice(index, 1);
      setBuyCharges(newFormData);
    }
  };

  // handling addrow here selling
  const addRow = () => {
    if (
      sellingcharges[sellingcharges?.length - 1]?.charge_id &&
      sellingcharges[sellingcharges?.length - 1]?.inr_amount
    ) {
      const newdata = [...sellingcharges];
      setSellingCharges([
        ...sellingcharges,
        {
          charge_id: "",
          sac_code: "",
          weight: 1 ,
          rate: 0,
          per_kg: 2,
          inr_amount: 0,
          currency: singlefranchiseedata?.is_overseas ? String(singlefranchiseedata?.currency || "24") : "24",
          ex_rate: singlefranchiseedata?.is_overseas ? String(singlefranchiseedata?.exchange_rate || "1") : "1",
          enquiry_id: spotData?.id,
        },
      ]);
    } else {
      showAlert("Please Provide Details First", "warning");
    }
  };

  // handling addrow here buying
  const addRow2 = () => {
    const isAllFilled = buycharges?.every((item: any) =>
      Object.values(item).every(
        (value) => value !== "" && value !== null && value !== undefined
      )
    );
    if (isAllFilled) {
      const newdata = [...buycharges];
      setBuyCharges([
        ...buycharges,
        {
          charge_id: "",
          sac_code: "",
          weight: 1,
          rate: 0,
          per_kg: 2,
          inr_amount: 0,
          currency: "24",
          enquiry_id: spotData?.id,
          ex_rate: "1",
          pp_cc: "1",
          party: "",
          party_name: "",
        },
      ]);
    } else {
      showAlert("Please Provide Details First", "warning");
    }
  };
  // console.log(franchiseedata,"franchisedata")
  // handling exchangereate data
  const handleexchangerate = (
    index?: any,
    forwhat?: string,
    value?: string,
    toggle?: number
  ) => {
    if (toggle == 1) {
      const data: any = [...exchangedataSell];
      const oldCurrencyId = data[index]["currency_id"];
      data[index][forwhat!] = value;
      setExchangedataSell(data);
      if (forwhat === "ex_rate" && oldCurrencyId) {
        const newExRate = Number(value) || 0;
        const updatedCharges = sellingcharges.map((charge: any) => {
          if (String(charge.currency) === String(oldCurrencyId)) {
            const inrAmount = charge.per_kg == 1
              ? Number(charge.rate) * Number(charge.weight) * newExRate
              : Number(charge.rate) * newExRate;
            return { ...charge, ex_rate: String(newExRate), inr_amount: inrAmount };
          }
          return charge;
        });
        setSellingCharges(updatedCharges);
      } else if (forwhat === "currency_id" && oldCurrencyId) {
        const exRate = Number(data[index]["ex_rate"]) || 0;
        const updatedCharges = sellingcharges.map((charge: any) => {
          if (String(charge.currency) === String(oldCurrencyId)) {
            const inrAmount = charge.per_kg == 1
              ? Number(charge.rate) * Number(charge.weight) * exRate
              : Number(charge.rate) * exRate;
            return { ...charge, currency: value, ex_rate: String(exRate), inr_amount: inrAmount };
          }
          return charge;
        });
        setSellingCharges(updatedCharges);
      }
    } else {
      // existing buying logic
      const data: any = [...exchangedata];
      data[index][forwhat!] = value;
      setExchangedata(data);
    }
  };
  // console.log(exchangedata,"ex data")

  return (
    <>
      <div className="box border-2 border-gray-200 p-4 pt-6 rounded-md">
        {toggle == 2 ? (
          <div className="border border-gray-200 shadow-lg p-2 w-[100%] m-auto mb-4 min-[759px]:grid grid-cols-3 gap-2 rounded-md">
            {exchangedata?.map((item: any, index: number) => {
              // Extract already selected currency IDs except the current one to allow re-selection in the same row
              const selectedCurrencyIds = exchangedata
                .map((ex: any, i: number) =>
                  i !== index ? ex.currency_id : null
                ) // Exclude current row's selection
                .filter(Boolean); // Remove null/empty values

              return (
                <div key={index} className="col-span-1 gap-2 mb-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      {/* {index === 0 && ( */}
                      <FormLabel>
                        {index + 1}
                        {index == 0 ? "st" : index == 1 ? "nd" : "rd"} Currency
                        {index == 0 && <span className="text-red-400">*</span>}
                      </FormLabel>
                      {/* )} */}
                      <FormSelect
                        onChange={(e: any) =>
                          handleexchangerate(
                            index,
                            "currency_id",
                            e.target.value
                          )
                        }
                        disabled={disableExchangeBuy || index == 0}
                        value={item?.currency_id}
                      >
                        <option value="">Select</option>
                        {currencydata
                          .filter(
                            (item2: any) =>
                              !selectedCurrencyIds.includes(String(item2.id))
                          ) // Ensure same type comparison
                          .map((item2: any) => (
                            <option key={item2?.id} value={item2?.id}>
                              {item2?.currency}
                            </option>
                          ))}
                      </FormSelect>
                    </div>

                    <div>
                      {/* {index === 0 && ( */}
                      <FormLabel>
                        Exchange Rate ({index + 1})
                        {index == 0 && <span className="text-red-400">*</span>}
                      </FormLabel>

                      <FormInput
                        disabled={disableExchangeBuy || index == 0}
                        onChange={(e: any) =>
                          handleexchangerate(index, "ex_rate", e.target.value)
                        }
                        min="0"
                        type="number"
                        placeholder="Enter Exchange rate"
                        value={item?.ex_rate}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          ""
        )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {/* LEFT SECTION — Toggle Buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className={`transition-colors ${
                  toggle == 1
                    ? "bg-mustard text-white border-mustard"
                    : "bg-gray-200 text-gray-600 border-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => {
                  setToggle(1);
                }}
              >
                Selling Charges
              </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    setToggle(2);
                  
                  }}
                  className={`transition-colors ${
                    toggle == 2
                      ? "bg-mustard text-white border-mustard"
                      : "bg-gray-200 text-gray-600 border-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Buying Charges
                </Button>
            
            </div>

            {/* RIGHT SECTION — Currency & Exchange Rate */}
            {singlefranchiseedata?.is_overseas && toggle == 1 ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Currency:</span>
                  <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1">
                    {currencyname || "INR"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Exchange Rate:</span>
                  <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1">
                    {singlefranchiseedata?.exchange_rate || "1"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
     

        {toggle == 1 && !singlefranchiseedata?.is_overseas ? (
          <div className="border border-gray-200 shadow-lg p-2 w-[100%] m-auto mb-4 min-[759px]:grid grid-cols-3 gap-2 rounded-md">
            {exchangedataSell?.map((item: any, index: number) => {
              const selectedCurrencyIds = exchangedataSell
                .map((ex: any, i: number) =>
                  i !== index ? ex.currency_id : null
                )
                .filter(Boolean);

              return (
                <div key={index} className="col-span-1 gap-2 mb-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FormLabel>
                        {index + 1}
                        {index == 0 ? "st" : index == 1 ? "nd" : "rd"} Currency
                        {index == 0 && <span className="text-red-400">*</span>}
                      </FormLabel>
                      <FormSelect
                        onChange={(e: any) =>
                          handleexchangerate(
                            index,
                            "currency_id",
                            e.target.value,
                            1
                          )
                        }
                        disabled={disableExchangeSell || index == 0}
                        value={item?.currency_id}
                      >
                        <option value="">Select</option>
                        {currencydata
                          .filter(
                            (item2: any) =>
                              !selectedCurrencyIds.includes(String(item2.id))
                          )
                          .map((item2: any) => (
                            <option key={item2?.id} value={item2?.id}>
                              {item2?.currency}
                            </option>
                          ))}
                      </FormSelect>
                    </div>

                    <div>
                      <FormLabel>
                        Exchange Rate ({index + 1})
                        {index == 0 && <span className="text-red-400">*</span>}
                      </FormLabel>
                      <FormInput
                        disabled={disableExchangeSell || index == 0}
                        onChange={(e: any) =>
                          handleexchangerate(index, "ex_rate", e.target.value, 1)
                        }
                        onBlur={(e: any) => {
                          if (index !== 0 && item?.currency_id && Number(e.target.value) <= 0) {
                            showAlert(
                              "Please Provide exchange rate against this currency",
                              "warning"
                            );
                          }
                        }}
                        min="0"
                        type="number"
                        placeholder="Enter Exchange rate"
                        value={item?.ex_rate}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {toggle == 1 ? (
          <div className="max-[982px]:overflow-auto">
            <Table className="whitespace-nowrap border">
              {/* Table headers */}
              <Table.Thead>
                <Table.Tr className="bg-mustard text-white ">
                  <Table.Th className="px-2 py-2 text-center border">
                    <div className="flex justify-center items-center">
                      <p className="flex items-center gap-2">
                        <Plus
                          onClick={addRow}
                          className="w-[24px] h-[24px] bg-green-400 text-white p-[3px] rounded-sm mr-1 cursor-pointer"
                        />
                        <Minus
                          onClick={() => {
                            if (sellingcharges?.length > 1) {
                              const newdata = [...sellingcharges];
                              newdata.pop();
                              setSellingCharges(newdata);
                            }
                          }}
                          className="w-[24px] h-[24px] bg-red-500 text-white p-[3px] rounded-sm mr-1 cursor-pointer"
                        />
                        CHARGES
                      </p>
                    </div>
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center border">
                    RATE
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center border">
                    RATE TYPE
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center border ">
                    WEIGHT / UNIT
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center border">
                    CURRENCY
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center border">
                    EX-RATE
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center border">
                    INR AMOUNT
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center border min-w-[70px]">GST %</Table.Th>
                  <Table.Th className="px-1 py-1 text-center border min-w-[110px]">TOTAL AMT</Table.Th>
                  <Table.Th className="px-1 py-1 text-center border">
                    ACTION
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              {/* Table body */}

              {sellingcharges?.map((row: any, index: number) => (
                <Table.Tr key={index}>
                  <Table.Td className="px-1 py-1 w-[20%] border">
                    <FormSelect
                      className="border w-full border-gray-300 rounded-lg"
                      value={`${row?.charge_id}`}
                      name="charge_id"
                      // disabled={index !== 0}
                      // options={{
                      //   placeholder: "Search Search",
                      // }}
                      onChange={(e: any) => {
                        const value = e.target.value;

                        if (value) {
                          handleSelectChange(
                            index,
                            "charge_id",
                            e.target.value
                          );
                        }
                      }}
                    >
                      <option value={0}>Select Charge</option>
                      {chargesdata
                        ?.filter(
                          (item: any) => !oldCharges?.includes(item?.charge_id)
                        )
                        ?.sort((a: any, b: any) =>
                          a?.charge_name?.localeCompare(b?.charge_name)
                        )
                        ?.map((item: any) => (
                          <option
                            className="w-full"
                            key={item?.ref_sell_id}
                            value={item?.ref_sell_id}
                          >
                            {item?.charge_name}
                          </option>
                        ))}
                    </FormSelect>
                  </Table.Td>

                  <Table.Td className="px-1 py-1 border">
                    <FormInput
                      type="number"
                      min="0"
                      value={row?.rate}
                      name="rate"
                      disabled={!Number(row?.charge_id) || row?.is_edit}
                      onChange={(e: any) => {
                        handleSelectChange(
                          index,
                          "rate",
                          e.target.value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*)\./g, "$1")
                        );
                      }}
                      className="w-full text-right p-2 border border-gray-300  rounded"
                    />
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border">
                    <FormSelect
                      value={row?.per_kg}
                      onChange={(e: any) => {
                        handleSelectChange(index, "per_kg", e.target.value);
                      }}
                    >
                      <option value="2">Absolute</option>
                      <option value="1">Per Kg / Piece</option>
                    </FormSelect>
                  </Table.Td>

                  <Table.Td className="px-1 py-1 border">
                    <FormInput
                      type="text"
                      min="0"
                      disabled={row?.per_kg == 2}
                      onChange={(e: any) => {
                        handleSelectChange(index, "weight", e.target.value);
                      }}
                      value={Number(row?.weight).toFixed(2)}
                      className="text-right w-full p-2 border border-gray-300 rounded"
                    />
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border">
                    <FormSelect
                      disabled={singlefranchiseedata?.is_overseas}
                      value={singlefranchiseedata?.is_overseas ? String(singlefranchiseedata?.currency || "") : row?.currency}
                      onChange={(e: any) => {
                        if (singlefranchiseedata?.is_overseas) return;
                        const value = e.target.value;
                        const singledata = exchangedataSell?.find(
                          (ex: any) => ex.currency_id == value
                        );
                        if (value && !singledata?.ex_rate) {
                          showAlert(
                            "Please provide exchange rate against this currency",
                            "warning"
                          );
                          return;
                        }
                        handleSelectChange(index, "currency", value);
                      }}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">Select</option>
                      {singlefranchiseedata?.is_overseas
                        ? currencydata?.filter((item2: any) => String(item2.id) == String(singlefranchiseedata?.currency))?.map((item2: any) => (
                            <option key={item2?.id} value={item2?.id}>{item2?.currency}</option>
                          ))
                        : currencydata
                            ?.filter((item2: any) => {
                              const ids = exchangedataSell
                                ?.map((ex: any) => String(ex.currency_id))
                                ?.filter(Boolean);
                              return ids.includes(String(item2.id));
                            })
                            ?.map((item2: any) => (
                              <option key={item2?.id} value={item2?.id}>{item2?.currency}</option>
                            ))}
                    </FormSelect>
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border">
                    <FormInput
                      type="text"
                      value={singlefranchiseedata?.is_overseas ? String(singlefranchiseedata?.exchange_rate || "1") : (row?.ex_rate || "")}
                      disabled
                      className="w-full p-2 text-right border border-gray-300 rounded"
                    />
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border">
                    <FormInput
                      type="text"
                      value={indianFormat(Number(row?.inr_amount))}
                      disabled
                      onChange={(e: any) => {
                        handleSelectChange(index, "inr_amount", e.target.value);
                      }}
                      className="w-full p-2 text-right border border-gray-300  rounded"
                    />
                  </Table.Td>

                  <Table.Td className="px-1 py-1 border min-w-[70px]">
                    <FormInput
                      type="text"
                      value={(() => {
                        const chargeInfo = chargesdata?.find((c: any) => c.ref_sell_id == row?.charge_id);
                        const zeroGST = gstStatus == 4 || importBookingType == 3 || singlefranchiseedata?.is_overseas;
                        if (zeroGST) return "0%";
                        const igst = chargeInfo?.tax_breakup?.igst;
                        return row?.charge_id ? (igst != null ? `${parseFloat(igst)}%` : "-") : "-";
                      })()}
                      disabled
                      className="w-full p-2 text-center border border-gray-300 rounded"
                    />
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border min-w-[110px]">
                    <FormInput
                      type="text"
                      value={(() => {
                        const inr = parseFloat(Number(row?.inr_amount).toFixed(3));
                        if (!row?.charge_id || row?.charge_id == 162) return indianFormat(inr);
                        const chargeInfo = chargesdata?.find((c: any) => c.ref_sell_id == row?.charge_id);
                        const zeroGST = gstStatus == 4 || importBookingType == 3 || singlefranchiseedata?.is_overseas;
                        if (zeroGST) return indianFormat(inr);
                        const igstRate = parseFloat(chargeInfo?.tax_breakup?.igst || "18") / 100;
                        return indianFormat(parseFloat((inr + inr * igstRate).toFixed(3)));
                      })()}
                      disabled
                      className="w-full p-2 text-right border border-gray-300 rounded"
                    />
                  </Table.Td>

                  <Table.Td className=" border">
                    <div className="h-[100%] flex justify-center items-center">
                      <Button
                        disabled={row?.is_edit}
                        onClick={() => removeRow(index)}
                        className="border-none"
                      >
                        <Trash2 className="text-red-500 hover:text-red-700" />
                      </Button>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table>
          </div>
        ) : (
          ""
        )}

        {toggle == 2 ? (
          <div className="max-[982px]:overflow-auto">
            <Table className="whitespace-nowrap border">
              {/* Table headers */}
              <Table.Thead>
                <Table.Tr className="bg-mustard text-white">
                  <Table.Th className="px-2 py-2 text-center border">
                    <div className="flex justify-center items-center">
                      <p className="flex items-center gap-2">
                        <Plus
                          onClick={addRow2}
                          className="w-[24px] h-[24px] bg-green-400 text-white p-[3px] rounded-sm mr-1 cursor-pointer"
                        />
                        <Minus
                          onClick={() => {
                            if (buycharges?.length > 1) {
                              const newdata = [...buycharges];
                              newdata.pop();
                              setBuyCharges(newdata);
                            }
                          }}
                          className="w-[24px] h-[24px] bg-red-500 text-white p-[3px] rounded-sm mr-1 cursor-pointer"
                        />
                        CHARGES
                      </p>
                    </div>
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center  w-[10%] border">
                    {" "}
                    PP/CC
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center w-[10%] border">
                    RATE
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center  w-[10%] border">
                    RATE TYPE
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center  w-[10%] border ">
                    WEIGHT / UNIT
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center  w-[10%] border">
                    CURRENCY
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center  w-[10%] border">
                    EX-RATE
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center border">
                    INR AMOUNT
                  </Table.Th>
                  <Table.Th className="px-1 py-1 text-center border min-w-[70px]">GST %</Table.Th>
                  <Table.Th className="px-1 py-1 text-center border min-w-[110px]">TOTAL AMT</Table.Th>

                  <Table.Th className="px-1 py-1 text-center ">
                    PARTY TYPE
                  </Table.Th>

                  <Table.Th className="px-1 py-1 text-center w-[10%] ">
                    PARTY
                  </Table.Th>

                  {/* <Table.Th className="px-1 py-1 text-center">EXRATE</Table.Th> */}
                  {/* <Table.Th className="px-1 py-1 text-center">
                    PAYABLE TO
                  </Table.Th> */}
                  <Table.Th className="px-1 py-1 text-center border">
                    ACTION
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              {/* Table body */}

              {buycharges?.map((row: any, index: number) => (
                <Table.Tr key={index}>
                  <Table.Td className="px-1 py-1 w-[20%] border">
                    <FormSelect
                      className="border w-full border-gray-300 rounded-lg"
                      value={row?.charge_id}
                      name="charge_id"
                      // disabled={index !== 0}
                      options={{
                        placeholder: "Search Search",
                      }}
                      onChange={(e: any) => {
                        const value = e.target.value;

                        if (value) {
                          handleSelectChange2(index, "charge_id", value);
                        }
                      }}
                    >
                      <option value={0}>Select Charge</option>
                      {chargesdata
                        ?.filter(
                          (item: any) => !oldCharges?.includes(item?.charge_id)
                        )
                        ?.sort((a: any, b: any) =>
                          a?.charge_name?.localeCompare(b?.charge_name)
                        )
                        ?.map((item: any) => (
                          <option
                            className="w-full"
                            key={item?.charge_id}
                            value={item?.charge_id}
                          >
                            {item?.charge_name}
                          </option>
                        ))}
                    </FormSelect>
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border">
                    <FormSelect
                      value={row?.pp_cc}
                      onChange={(e: any) => {
                        handleSelectChange2(index, "pp_cc", e.target.value);
                      }}
                    >
                      <option value="1">PP</option>
                      <option value="2">CC</option>
                    </FormSelect>
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border">
                    <FormInput
                      type="number"
                      min="0"
                      value={row?.rate}
                      name="rate"
                      disabled={!Number(row?.charge_id) || row?.is_edit}
                      onChange={(e: any) => {
                        handleSelectChange2(index, "rate", e.target.value);
                      }}
                      className="text-right w-full p-2 border border-gray-300  rounded"
                    />
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border">
                    <FormSelect
                      value={row?.per_kg}
                      disabled={!row?.currency || !row?.charge_id}
                      onChange={(e: any) => {
                        handleSelectChange2(index, "per_kg", e.target.value);
                      }}
                    >
                      <option value="2">Absolute</option>
                      <option value="1">Per Kg / Piece</option>
                    </FormSelect>
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border">
                    <FormInput
                      type="text"
                      min="0"
                      disabled={row?.per_kg == 2}
                      onChange={(e: any) => {
                        handleSelectChange2(index, "weight", e.target.value);
                      }}
                      value={Number(row?.weight).toFixed(2)}
                      className="text-right w-full p-2 border border-gray-300 rounded"
                    />
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border">
                    <FormSelect
                      onBlur={(e: any) => {
                        const value = e.target.value;
                        const singledata = exchangedata.find(
                          (ex: any) => ex.currency_id == value
                        );
                        // console.log(singledata, "singledaa");
                        if (value && !singledata?.ex_rate) {
                          showAlert(
                            "Please Provide exchange rate against this currency",
                            "warning"
                          );
                          const newdata = [...buycharges];
                          newdata[index]["currency"] = "";
                        }
                      }}
                      onChange={(e: any) => {
                        handleSelectChange2(index, "currency", e.target.value);
                      }}
                      className="w-full p-2 border border-gray-300  rounded"
                      value={row?.currency}
                    >
                      <option value="">Select</option>

                      {currencydata?.length
                        ? currencydata
                            .filter((item2: any) => {
                              const ids = exchangedata
                                ?.map((ex: any) => String(ex.currency_id))
                                .filter(Boolean);
                              // console.log(ids, "ids",String(item2?.id)); // Debugging output
                              return ids.includes(String(item2.id)); // Convert to string for comparison
                            })
                            .map((item: any) => (
                              <option key={item?.id} value={item?.id}>
                                {item?.currency}
                              </option>
                            ))
                        : ""}
                    </FormSelect>
                    {/* <FormInput
                      type="text"
                      value={row?.currency}
                      disabled
                      onChange={(e: any) => {
                        handleSelectChange2(index, "currency", e.target.value);
                      }}
                      className="w-full p-2 border border-gray-300  rounded"
                    /> */}
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border">
                    <FormInput
                      type="text"
                      value={indianFormat(Number(row?.ex_rate)) || 1}
                      disabled
                      onChange={(e: any) => {
                        handleSelectChange2(index, "ex_rate", e.target.value);
                      }}
                      className="text-right w-full p-2 border border-gray-300  rounded"
                    />
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border">
                    <FormInput
                      type="text"
                      value={indianFormat(Number(row?.inr_amount))}
                      disabled
                      onChange={(e: any) => {
                        handleSelectChange2(
                          index,
                          "inr_amount",
                          e.target.value
                        );
                      }}
                      className="text-right w-full p-2 border border-gray-300  rounded"
                    />
                  </Table.Td>

                  <Table.Td className="px-1 py-1 border min-w-[70px]">
                    <FormInput
                      type="text"
                      value={(() => {
                        const chargeInfo = chargesdata?.find((c: any) => c.charge_id == row?.charge_id);
                        const zeroGST = gstStatus == 4 || singlefranchiseedata?.is_overseas;
                        if (zeroGST) return "0%";
                        const igst = chargeInfo?.tax_breakup?.igst;
                        return row?.charge_id ? (igst != null ? `${parseFloat(igst)}%` : "-") : "-";
                      })()}
                      disabled
                      className="w-full p-2 text-center border border-gray-300 rounded"
                    />
                  </Table.Td>
                  <Table.Td className="px-1 py-1 border min-w-[110px]">
                    <FormInput
                      type="text"
                      value={(() => {
                        const inr = parseFloat(Number(row?.inr_amount).toFixed(3));
                        if (!row?.charge_id || row?.charge_id == 163) return indianFormat(inr);
                        const chargeInfo = chargesdata?.find((c: any) => c.charge_id == row?.charge_id);
                        const zeroGST = gstStatus == 4 || singlefranchiseedata?.is_overseas;
                        if (zeroGST) return indianFormat(inr);
                        const igstRate = parseFloat(chargeInfo?.tax_breakup?.igst || "18") / 100;
                        return indianFormat(parseFloat((inr + inr * igstRate).toFixed(3)));
                      })()}
                      disabled
                      className="w-full p-2 text-right border border-gray-300 rounded"
                    />
                  </Table.Td>

                  <Table.Td className="px-1 py-1">
                    <FormSelect
                      value={row?.party_type}
                      disabled={!row?.charge_id}
                      onChange={(e: any) => {
                        handleSelectChange2(
                          index,
                          "party_type",
                          e.target.value
                        );
                        const data = [...buycharges];
                        data[index]["party"] = "";
                        data[index]["party_name"] = "";
                        setBuyCharges(data);
                      }}
                    >
                      <option value="">Select</option>
                      {alltypedata?.length >= 1
                        ? alltypedata?.map((item: any) => (
                            <option value={item?.ctd_id}>
                              {item?.ctype_name}
                              {item?.ct_id == 1
                                ? "(C)"
                                : item?.ct_id == 2
                                ? "(V)"
                                : ""}
                            </option>
                          ))
                        : ""}
                    </FormSelect>
                  </Table.Td>
                  <Table.Td className="px-1 py-1">
                    {buycharges[index]["party_type"] ? (
                      <CommonSearchArr
                        // apiEndpoint={`/master/entity?cpy_id=1&type_data=${buycharges[index]["party_type"]}`}
                        apiEndpoint={`/admin/vendor-settings?c_type=${buycharges[index]["party_type"]}`}
                        placeholder={"Search For Franchisee"}
                        buycharges={buycharges}
                        setBuyCharges={setBuyCharges}
                        fun1={fun1}
                        comingselectedname={"party_name"}
                        comingselectedid={"party"}
                        funtoempty={funtoempty}
                        key1={"key"}
                        index={index}
                        questionmark={true}
                        zIndex={"20"}
                      />
                    ) : (
                      <FormInput placeholder="Search For Franchisee" disabled />
                    )}
                  </Table.Td>

                  <Table.Td className=" border">
                    <div className="h-[100%] flex justify-center items-center">
                      <Button
                        disabled={row?.is_edit}
                        onClick={() => removeRow2(index)}
                        className="border-none"
                      >
                        <Trash2 className="text-red-500 hover:text-red-700" />
                      </Button>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table>
          </div>
        ) : (
          ""
        )}

        <div className="">
          {/* <div className="text-right min-[767px]:w-[50%] max-[767px]:mt-2 min-[417px]:grid grid-cols-3 gap-2">
              <div>
                <FormLabel>Total Amt (Rs.): </FormLabel>
                <FormInput
                  disabled
                  value={
                    toggle == 2
                      ? indianFormat(Number(totalbuy))
                      : indianFormat(Number(totalSell))
                  }
                />
              </div>
              <div>
                <FormLabel>GST (18%) (Rs.): </FormLabel>
                <FormInput
                  disabled
                  value={
                    toggle == 2
                      ? indianFormat(Number(totalbuy) * 0.18)
                      : indianFormat(Number(totalSell) * 0.18)
                  }
                />
              </div>
              <div>
                <FormLabel>Sub-Total (Rs.) : </FormLabel>
                <FormInput
                  disabled
                  value={
                    toggle == 2
                      ? indianFormat(
                          Number(totalbuy) + Number(totalbuy) * 0.18
                        )
                      : indianFormat(
                          Number(totalSell) + Number(totalSell) * 0.18
                        )
                  }
                />
              </div>
            </div> */}
        </div>

        <div ref={bottomRef} className="h-1"></div>
      </div>
    </>
  );
};

export default SellBuyForm;
