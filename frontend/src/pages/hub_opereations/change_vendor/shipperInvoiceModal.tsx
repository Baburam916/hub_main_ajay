import { Dialog } from "../../../base-components/Headless";
import Button from "../../../base-components/Button";
import {
  FormCheck,
  FormInput,
  FormSelect,
} from "../../../base-components/Form";
import Lucide from "../../../base-components/Lucide";
import { useEffect, useState } from "react";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Table from "../../../base-components/Table";
import Tippy from "../../../base-components/Tippy";
import { Get_tax_slab } from "../../../AllServices/services";
import { indianFormat } from "../../../utils";

interface ShipperInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  checkAcl: () => void;
  setBooking: () => void;
  booking: any;
}

const ShipperInvoiceModal: React.FC<ShipperInvoiceModalProps> = ({
  open,
  onClose,
  checkAcl,
  setBooking,
  booking,
}) => {
  const initialData = {
    box_no: "",
    description: "",
    hsn: "",
    quantity: "",
    rate: "",
    uom: "",
  };

  const [data, setData] = useState(
    booking?.invoiceData?.shipperInvoice || [initialData]
  );

  const [dimensionData, setDimensionData] = useState(
    JSON.parse(booking?.shipment_dimensions) || []
  );
  const totalValue = dimensionData?.reduce(
    (acc: any, curr: any) => acc + parseFloat(curr?.value),
    0
  );

  const [gstType, setGstType] = useState(
    booking?.invoiceData?.gstData?.igst
      ? 2
      : booking?.invoiceData?.gstData?.cgst &&
        booking?.invoiceData?.gstData?.sgst
        ? 1
        : ""
  );
  const { showAlert } = useAlert();
  const [taxSlabData, setTaxSlabData] = useState([]);
  const [gst, setGst] = useState(
    booking?.invoiceData?.gstData || {
      id: "104",
      name: "",
      cgst: 0,
      sgst: 0,
      igst: 0,
    }
  );

  const [slab, setSlab] = useState(
    booking?.invoiceData?.gstData || {
      id: "104",
      name: "",
      cgst: 0,
      sgst: 0,
      igst: 0,
    }
  );
  const subTotal = data?.reduce((acc, item) => {
    return acc + Number(item?.quantity) * Number(item?.rate);
  }, 0);

  const gstAmount =
    gstType == 1
      ? (subTotal * (Number(slab?.cgst) + Number(slab?.sgst)) || 0) / 100
      : (subTotal * Number(slab?.igst) || 0) / 100;

  const total = subTotal + gstAmount;

  const getData = async () => {
    try {
      const res = await Get_tax_slab();
      setTaxSlabData(res?.data?.data);
    } catch (error) { }
  };

  const handleAddRow = () => {
    const allHaveData = data?.every(
      (obj) =>
        obj.box_no &&
        obj.description &&
        obj.hsn &&
        obj.quantity &&
        obj.rate &&
        obj.uom
    );

    if (allHaveData) {
      setData((prev) => [...prev, initialData]);
    } else {
      showAlert(
        "Please fill all the details of the above row first",
        "warning"
      );
    }
  };

  const handleDeleteRow = (index: any) => {
    if (data?.length > 1) {
      const newData = data?.filter((ele, ind) => ind !== index);
      setData(newData);
    }
  };

  const handleUpdateData = (e, index) => {
    const editData = [...data];

    editData[index] = {
      ...editData[index],
      [e.target.name]:
        e.target.name == "quantity"
          ? e.target.value.replace(/[^0-9.]/g, "")
          : e.target.name == "rate"
            ? e.target.value.replace(/[^0-9.]/g, "")
            : e.target.value,
    };

    setData(editData);
  };

  const handleSubmit = () => {
    const allHaveData = data?.every(
      (obj) =>
        obj.box_no &&
        obj.description &&
        obj.hsn &&
        obj.quantity &&
        obj.rate &&
        obj.uom
    );

    if (allHaveData) {
      if (!gst?.id) {
        showAlert("Please select gst slab", "warning");
      } else if (gst?.id != "104" && !gstType) {
        showAlert("Please select gst type", "warning");
      } else {
        setBooking((prev: any) => ({
          ...prev,
          invoiceData: { shipperInvoice: data, gstData: gst },
        }));
        onClose();
        checkAcl(booking?.shipment_charges?.grand_total_with_gst);
      }
    } else {
      showAlert("Please fill the details in the all rows ", "warning");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (taxSlabData?.length > 0 && booking?.invoiceData?.gstData) {
      const matchedItem =
        taxSlabData?.find(
          (item) => item.id == booking?.invoiceData?.gstData?.id
        ) || {};

      setSlab((prev) => ({ ...prev, ...matchedItem }));
    }
  }, [taxSlabData]);
  return (
    <Dialog staticBackdrop open={open} size={"xl"} onClose={onClose}>
      <Dialog.Panel className={"mt-32"}>
        <Dialog.Title className="flex justify-between">
          <h2 className="mr-auto text-base font-medium">Invoice Details</h2>
          <Lucide
            icon="XCircle"
            className="w-5 h-5 cursor-pointer hover:text-red-500"
            onClick={() => {
              onClose();
            }}
          />
        </Dialog.Title>
        <Dialog.Description className="overflow-y-auto max-h-[65vh] p-2 pb-4">
          <div className="w-full ">
            <Table className="table table-text-small mb-0">
              <Table.Thead
                variant="dark"
                className="thead-primary table-sorting bg-mustard"
              >
                <Table.Tr className="text-center ">
                  <Table.Th className="whitespace-nowrap border">
                    Box No.
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    Description
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">HSN</Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    Quantity
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">Rate</Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    Unit of Measure
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    Amount
                  </Table.Th>
                  <Table.Th className="whitespace-nowrap border">
                    Action
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data?.map((item, index) => (
                  <Table.Tr key={index} className={`text-center`}>
                    <Table.Td className="p-2 bg-gray-100 border whitespace-nowrap">
                      <FormInput
                        name="box_no"
                        type="text"
                        formInputSize="sm"
                        className="text-center"
                        value={item?.box_no}
                        onChange={(e) => handleUpdateData(e, index)}
                      />
                    </Table.Td>
                    <Table.Td className="p-2 bg-gray-100 border whitespace-nowrap">
                      <FormInput
                        name="description"
                        type="text"
                        formInputSize="sm"
                        className="text-center"
                        value={item?.description}
                        onChange={(e) => handleUpdateData(e, index)}
                      />
                    </Table.Td>
                    <Table.Td className="p-2 bg-gray-100 border whitespace-nowrap">
                      <FormInput
                        name="hsn"
                        type="text"
                        formInputSize="sm"
                        className="text-center"
                        minLength={6}
                        maxLength={8}
                        value={item?.hsn}
                        onChange={(e) => handleUpdateData(e, index)}
                      />
                    </Table.Td>
                    <Table.Td className="p-2 bg-gray-100 border whitespace-nowrap">
                      <FormInput
                        name="quantity"
                        type="text"
                        formInputSize="sm"
                        className="text-center"
                        value={item?.quantity}
                        onChange={(e) => handleUpdateData(e, index)}
                      />
                    </Table.Td>
                    <Table.Td className="p-2 bg-gray-100 border whitespace-nowrap">
                      <FormInput
                        name="rate"
                        type="text"
                        formInputSize="sm"
                        className="text-center"
                        value={item?.rate}
                        onChange={(e) => handleUpdateData(e, index)}
                      />
                    </Table.Td>
                    <Table.Td className="p-2 bg-gray-100 border whitespace-nowrap">
                      <FormInput
                        name="uom"
                        type="text"
                        formInputSize="sm"
                        className="text-center"
                        value={item?.uom}
                        onChange={(e) => handleUpdateData(e, index)}
                      />
                    </Table.Td>
                    <Table.Td className="p-2 bg-gray-100 border whitespace-nowrap ">
                      <FormInput
                        type="text"
                        formInputSize="sm"
                        disabled
                        className="text-center"
                        value={indianFormat(
                          Number(item?.quantity) * Number(item?.rate)
                        )}
                      />
                    </Table.Td>
                    <Table.Td className="p-2.5 bg-gray-100 border whitespace-nowrap flex gap-4 justify-center">
                      {data?.length > 1 && (
                        <Tippy
                          content="Delete Row"
                          options={{
                            placement: "top",
                          }}
                        >
                          <Lucide
                            icon="Trash"
                            className="text-red-400 stroke-2.5"
                            onClick={() => handleDeleteRow(index)}
                          />
                        </Tippy>
                      )}
                      {index == data?.length - 1 && (
                        <Tippy
                          content="Add Row"
                          options={{
                            placement: "top",
                          }}
                        >
                          <Lucide
                            icon="PlusCircle"
                            className="text-green-500 stroke-2.5"
                            onClick={handleAddRow}
                          />
                        </Tippy>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}

                <Table.Tr className={`text-center`}>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="p-2 border font-bold whitespace-nowrap">
                    Sub-Total
                  </Table.Td>
                  <Table.Td
                    className="p-2 border whitespace-nowrap"
                    colSpan="2"
                  >
                    {indianFormat(subTotal) || 0}
                  </Table.Td>
                </Table.Tr>
                <Table.Tr className={`text-center`}>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="p-2 border font-bold whitespace-nowrap">
                    GST Slab
                  </Table.Td>
                  <Table.Td className="p-2 border border-r-0">
                    <FormSelect
                      formSelectSize="sm"
                      value={slab?.id}
                      onChange={(e) => {
                        const value = e.target.value;
                        const selectedData = taxSlabData?.find(
                          (ele: any) => ele?.id == value
                        ) || {
                          id: "",
                          name: "",
                          cgst: 0,
                          sgst: 0,
                          igst: 0,
                        };

                        setSlab({
                          id: selectedData?.id || "",
                          name: selectedData?.name || "",
                          cgst: selectedData?.cgst || 0,
                          sgst: selectedData?.sgst || 0,
                          igst: selectedData?.igst || 0,
                        });

                        setGst((prev) => ({
                          ...prev,
                          id: selectedData?.id || "",
                          name: selectedData?.name || "",
                          cgst: selectedData?.cgst || 0,
                          sgst: selectedData?.sgst || 0,
                          igst: selectedData?.igst || 0,
                        }));
                      }}
                    >
                      <option value="0">Select</option>
                      {taxSlabData &&
                        taxSlabData?.map((data, index) => (
                          <option key={index} value={data?.id}>
                            {data?.name} {data?.igst}%
                          </option>
                        ))}
                    </FormSelect>
                  </Table.Td>
                  <Table.Td className="p-2 border border-l-0">
                    <FormInput
                      type="text"
                      formInputSize="sm"
                      disabled
                      className="text-center"
                      value={indianFormat(gstAmount) || 0}
                    />
                  </Table.Td>
                </Table.Tr>
                <Table.Tr className={`text-center`}>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="p-2 border font-bold whitespace-nowrap">
                    GST Type
                  </Table.Td>
                  {slab?.id == "104" ||
                    (slab?.cgst == 0 && slab?.sgst == 0 && slab?.igst == 0) ? (
                    <Table.Td
                      className="p-2 border whitespace-nowrap"
                      colSpan="2"
                    >
                      N/A
                    </Table.Td>
                  ) : (
                    <>
                      <Table.Td className="p-2 border border-r-0">
                        <FormCheck className="mr-2">
                          <FormCheck.Input
                            id="radio-switch-4"
                            type="radio"
                            name="gst_type_button"
                            checked={gstType == 1}
                            onChange={() => {
                              setGst((prev) => ({
                                ...prev,
                                id: slab?.id || "",
                                name: slab?.name || "",
                                cgst: slab?.cgst || 0,
                                sgst: slab?.sgst || 0,
                                igst: 0,
                              }));
                              setGstType(1);
                            }}
                          />
                          <FormCheck.Label htmlFor="radio-switch-4">
                            CGST+SGST
                          </FormCheck.Label>
                        </FormCheck>
                      </Table.Td>
                      <Table.Td className="p-2 border border-l-0">
                        <FormCheck className="mr-2">
                          <FormCheck.Input
                            id="radio-switch-4"
                            type="radio"
                            name="gst_type_button"
                            checked={gstType == 2}
                            onChange={() => {
                              setGst((prev) => ({
                                ...prev,
                                id: slab?.id || "",
                                name: slab?.name || "",
                                cgst: 0,
                                sgst: 0,
                                igst: slab?.igst || 0,
                              }));
                              setGstType(2);
                            }}
                          />
                          <FormCheck.Label htmlFor="radio-switch-4">
                            IGST
                          </FormCheck.Label>
                        </FormCheck>
                      </Table.Td>
                    </>
                  )}
                </Table.Tr>
                <Table.Tr className={`text-center`}>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="border-none whitespace-nowrap"></Table.Td>
                  <Table.Td className="p-2 border font-bold whitespace-nowrap">
                    Total
                  </Table.Td>
                  <Table.Td
                    className="p-2 border whitespace-nowrap"
                    colSpan="2"
                  >
                    {indianFormat(total) || 0}
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </div>
        </Dialog.Description>
        <Dialog.Footer>
          {" "}
          <Button
            type="button"
            className="text-white bg-mustard border-none"
            size="sm"
            onClick={handleSubmit}
          >
            SAVE
          </Button>
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default ShipperInvoiceModal;
