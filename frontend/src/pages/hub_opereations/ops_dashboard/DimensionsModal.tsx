import { Dialog } from "../../../base-components/Headless";
import Button from "../../../base-components/Button";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Lucide from "../../../base-components/Lucide";
import { useEffect, useState } from "react";
import { disableSymbols, isValidHsn } from "../../../utils";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Link } from "react-router-dom";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { common_get } from "../../../AllServices/services";

interface DimensionModalProps {
  open: boolean;
  onClose: () => void;
  dimensionData: any;
  setDimensionData: () => void;
  setCurrentStep: () => void;
  setCurrentFaq: () => void;
  setBooking: () => void;
  setSelectVendor: () => void;
  booking: any;
  weightData: any;
  isEditDimension?: boolean;
  editDimensionData?: any;
  editIndex?: number;
  currencyData: any;
  showHsn?: boolean;
  setShipmentResponse: () => void;
  minLimit?: any;
  isSpot?: boolean;
  setJobData?: () => void;
  getChWeight?: () => void;
}

const DimensionModal: React.FC<DimensionModalProps> = ({
  open,
  onClose,
  dimensionData,
  setDimensionData,
  setCurrentStep,
  setCurrentFaq,
  booking,
  setBooking,
  setSelectVendor,
  currencyData,
  isEditDimension,
  editDimensionData,
  editIndex,
  showHsn = false,
  setShipmentResponse,
  minLimit,
  isSpot = false,
  setJobData,
  getChWeight,
}) => {
  const initialData = {
    item_description: "",
    weight: "",
    value: "",
    quantity: "",
    length: "",
    breadth: "",
    height: "",
    ...(booking?.booking_type == "1" ? { hsn_code: "" } : {}),
  };

  const [data, setData] = useState(initialData);
  const [hsnDescription, setHsnDescription] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const { showAlert } = useAlert();

  const handleSubmit = () => {
    if (
      data.item_description &&
      data.weight &&
      data.value &&
      data.quantity &&
      data.length &&
      data.breadth &&
      data.height
    ) {
      if (Number(data.weight) <= 0) {
        showAlert("Weight should be greater than 0", "warning");
        return;
      }
      if (Number(data.value) <= 0) {
        showAlert("Value should be greater than 0", "warning");
        return;
      }
      if (Number(data.quantity) < 1) {
        showAlert("Quantity should not be less than 1", "warning");
        return;
      }
      if (Number(data.length) <= 0) {
        showAlert("Length should be greater than 0", "warning");
        return;
      }
      if (Number(data.breadth) <= 0) {
        showAlert("Breadth should be greater than 0", "warning");
        return;
      }
      if (Number(data.height) <= 0) {
        showAlert("Height should be greater than 0", "warning");
        return;
      }

      if (isSpot && isValidHsn(data.hsn_code)) {
        setDimensionData((prev) => [...prev, data]);
        setJobData((prev) => ({
          ...prev,
          shipment_dimensions: [...prev.shipment_dimensions, data],
        }));
        setData(initialData);
        onClose();
      } else if (booking?.booking_type == "1" && isValidHsn(data.hsn_code)) {
        setDimensionData((prev) => [...prev, data]);
        setData(initialData);
        setCurrentFaq(1);
        setCurrentStep(1);
        setBooking((prev) => ({
          ...prev,
          shipment_charges: {},
          courier_id: "",
          courier_code: "",
          courier_name: "",
          courier_vendor_code: "",
        }));
        onClose();
      } else if (booking?.booking_type == "2") {
        setDimensionData((prev) => [...prev, data]);
        setData(initialData);
        setCurrentFaq(1);
        setCurrentStep(1);
        setBooking((prev) => ({
          ...prev,
          shipment_charges: {},
          courier_id: "",
          courier_code: "",
          courier_name: "",
          courier_vendor_code: "",
        }));
        onClose();
      } else {
        showAlert("Please Enter Valid HSN Code", "warning");
        return;
      }
    } else {
      showAlert("Please fill all the fields", "error");
    }
  };

  const handleEdit = () => {
    if (
      data.item_description &&
      data.weight &&
      data.value &&
      data.quantity &&
      data.length &&
      data.breadth &&
      data.height
    ) {
      if (Number(data.weight) <= 0) {
        showAlert("Weight should be greater than 0", "warning");
        return;
      }
      if (Number(data.value) <= 0) {
        showAlert("Value should be greater than 0", "warning");
        return;
      }
      if (Number(data.quantity) < 1) {
        showAlert("Quantity should not be less than 1", "warning");
        return;
      }
      if (Number(data.length) <= 0) {
        showAlert("Length should be greater than 0", "warning");
        return;
      }
      if (Number(data.breadth) <= 0) {
        showAlert("Breadth should be greater than 0", "warning");
        return;
      }
      if (Number(data.height) <= 0) {
        showAlert("Height should be greater than 0", "warning");
        return;
      }

      if (isSpot && isValidHsn(data.hsn_code)) {
        const newData = dimensionData;
        newData[editIndex] = { ...data };

        setDimensionData(newData);
        setJobData((prev) => ({
          ...prev,
          shipment_dimensions: newData,
        }));
        setData(initialData);
        getChWeight();
        onClose();
      } else if (booking?.booking_type == "1" && isValidHsn(data.hsn_code)) {
        // console.log(data);

        const newData = dimensionData;

        newData[editIndex] = { ...data };

        setDimensionData(newData);
        setCurrentStep(1);
        setCurrentFaq(1);
        setShipmentResponse("");
        setSelectVendor(false);
        setBooking((prev) => ({
          ...prev,
          shipment_charges: {},
          courier_id: "",
          courier_code: "",
          courier_name: "",
          courier_vendor_code: "",
        }));
        getChWeight();
        onClose();
      } else if (booking?.booking_type == "2") {
        const newData = dimensionData;

        newData[editIndex] = { ...data };

        setDimensionData(newData);
        setCurrentStep(1);
        setCurrentFaq(1);
        setShipmentResponse("");
        setSelectVendor(false);
        setBooking((prev) => ({
          ...prev,
          shipment_charges: {},
          courier_id: "",
          courier_code: "",
          courier_name: "",
          courier_vendor_code: "",
        }));
        getChWeight();
        onClose();
      } else {
        showAlert("Please Enter Valid HSN Code", "error");
      }
    } else {
      showAlert("Please fill all the fields", "error");
    }
  };

  const getHsnDescription = async () => {
    if (!data?.hsn_code) {
      showAlert("Please enter hsn code", "warning");
      return;
    }

    setSpinner(true);

    try {
      const response = await common_get(
        `/admin/hsn-codes?hsn_code=${data?.hsn_code}`
      );
      if (response?.status == 200) {
        if (response?.data?.data?.length > 0) {
          setHsnDescription(response?.data?.data);
        } else {
          setHsnDescription([]);
          showAlert("HSN Code Not Found", "warning");
        }
      }
    } catch (error) {
      showAlert("Something went wrong", "error");
    } finally {
      setSpinner(false);
    }
  };

  useEffect(() => {
    if (isEditDimension && editDimensionData) {
      setData({
        item_description: editDimensionData?.item_description || "",
        weight: editDimensionData?.weight || "",
        value: editDimensionData?.value || "",
        quantity: editDimensionData?.quantity || "",
        length: editDimensionData?.length || "",
        breadth: editDimensionData?.breadth || "",
        height: editDimensionData?.height || "",
        ...(booking?.booking_type == "1" || isSpot
          ? { hsn_code: editDimensionData?.hsn_code || "" }
          : {}),
      });
    } else {
      setData(initialData);
    }
  }, [isEditDimension]);

  return (
    <Dialog staticBackdrop open={open} size={"lg"} onClose={onClose}>
      <Dialog.Panel className={"mt-32"}>
        <Dialog.Title className="flex justify-between">
          <h2 className="mr-auto text-base font-medium">Shipment Dimension </h2>
          <Lucide
            icon="XCircle"
            className="w-5 h-5 cursor-pointer hover:text-red-500"
            onClick={() => {
              onClose();
              setData(initialData);
              setHsnDescription([]);
            }}
          />
        </Dialog.Title>
        <Dialog.Description>
          <div className="w-full h-auto overflow-y-auto text-left ">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8  p-2 rounded-lg ">
              <div>
                <FormLabel htmlFor="regular-form-1">Description</FormLabel>
                <FormInput
                  type="text"
                  placeholder="Description"
                  id="item_description"
                  value={data?.item_description}
                  onKeyDown={(e) => disableSymbols(e)}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      item_description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <FormLabel htmlFor="regular-form-1">
                  Weight (in{" "}
                  {`${
                    booking?.unit?.weight_unit ? booking?.unit?.weight_unit : ""
                  }`}
                  )
                </FormLabel>
                <FormInput
                  type="number"
                  placeholder="Weight"
                  id="weight"
                  min={0.1}
                  value={data?.weight}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, weight: e.target.value }))
                  }
                />
                <div className="text-red-500 whitespace-nowrap text-xs mt-1 text-center">
                  {data?.weight &&
                  data?.quantity &&
                  minLimit?.min_overweight &&
                  Number(data?.weight) / (Number(data?.quantity) || 1) >=
                    Number(minLimit?.min_overweight)
                    ? "Overweight Shipment"
                    : ""}
                </div>
              </div>
              <div>
                <FormLabel htmlFor="regular-form-1">
                  Value (in {""}
                  {`${
                    booking?.unit?.currency
                      ? currencyData?.find(
                          (data) => data?.id == booking?.unit?.currency
                        )?.currency
                      : ""
                  }`}
                  )
                </FormLabel>
                <FormInput
                  type="number"
                  placeholder="Value"
                  id="value"
                  value={data?.value}
                  min={1}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, value: e.target.value }))
                  }
                />
              </div>
              <div>
                <FormLabel htmlFor="regular-form-1">Quantity</FormLabel>
                <FormInput
                  type="number"
                  placeholder="Quantity"
                  id="quantity"
                  step="1"
                  min={1}
                  value={data?.quantity}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, quantity: e.target.value }))
                  }
                  onKeyDown={(e) => disableSymbols(e)}
                />
              </div>
              <div>
                <FormLabel htmlFor="regular-form-1">Length (in cm)</FormLabel>
                <FormInput
                  type="number"
                  placeholder="Length"
                  id="length"
                  min={0.1}
                  value={data?.length}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, length: e.target.value }))
                  }
                />
                <div className="text-red-500 whitespace-nowrap text-xs mt-1 text-center">
                  {data?.length &&
                  minLimit?.min_odc &&
                  Number(data?.length) >= Number(minLimit?.min_odc)
                    ? "Odd Dimension"
                    : ""}
                </div>
              </div>
              <div>
                <FormLabel htmlFor="regular-form-1">Breadth (in cm)</FormLabel>
                <FormInput
                  type="number"
                  placeholder="Breadth"
                  id="breadth"
                  min={0.1}
                  value={data?.breadth}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, breadth: e.target.value }))
                  }
                />
                <div className="text-red-500 whitespace-nowrap text-xs mt-1 text-center">
                  {data?.breadth &&
                  minLimit?.min_odc &&
                  Number(data?.breadth) >= Number(minLimit?.min_odc)
                    ? "Odd Dimension"
                    : ""}
                </div>
              </div>
              <div>
                <FormLabel htmlFor="regular-form-1">Height (in cm)</FormLabel>
                <FormInput
                  type="number"
                  placeholder="Height"
                  id="height"
                  min={0.1}
                  value={data?.height}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, height: e.target.value }))
                  }
                />
                <div className="text-red-500 whitespace-nowrap text-xs mt-1 text-center">
                  {data?.height &&
                  minLimit?.min_odc &&
                  Number(data?.height) >= Number(minLimit?.min_odc)
                    ? "Odd Dimension"
                    : ""}
                </div>
              </div>
              {showHsn && (
                <div>
                  <FormLabel htmlFor="regular-form-1">HSN Code</FormLabel>
                  <FormInput
                    type="text"
                    placeholder="HSN Code"
                    minLength={6}
                    maxLength={8}
                    id="hsn_code"
                    value={data?.hsn_code}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        hsn_code: e.target.value.replaceAll(" ", ""),
                      }))
                    }
                  />
                </div>
              )}
            </div>
            {showHsn && (
              <div className=" w-full flex justify-between p-2 ">
                <Button
                  type="button"
                  className="text-white bg-blue-500 border-none"
                  size="sm"
                  onClick={getHsnDescription}
                  disabled={!data?.hsn_code || spinner}
                >
                  HSN DESCRIPTION{" "}
                  {spinner && (
                    <LoadingIcon
                      icon="puff"
                      color="white"
                      className="w-4 h-4 ml-2 stroke-2.5 text-white"
                    />
                  )}
                </Button>
                <Link
                  to="https://www.skart-express.com/hsn-code-finder/"
                  target="_blank"
                >
                  <Button
                    type="button"
                    size="sm"
                    className="text-white bg-blue-500 border-none"
                  >
                    HSN CODE FINDER
                  </Button>
                </Link>
              </div>
            )}

            {showHsn && hsnDescription.length > 0 && (
              <address className="text-xs px-2 font-medium">
                {hsnDescription[0]?.description}
              </address>
            )}
          </div>
        </Dialog.Description>
        <Dialog.Footer>
          {isEditDimension ? (
            <Button
              type="button"
              className="text-white bg-mustard border-none"
              size="sm"
              onClick={handleEdit}
            >
              SAVE
            </Button>
          ) : (
            <Button
              type="button"
              className="text-white bg-mustard border-none"
              size="sm"
              onClick={handleSubmit}
            >
              ADD
            </Button>
          )}
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default DimensionModal;
