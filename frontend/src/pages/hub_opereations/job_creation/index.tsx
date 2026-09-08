import React from "react";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import JobImg from "../../../assets/images/job.png";

const index = () => {
  return (
    <div className="flex flex-col md:flex-row bg-white rounded-md shadow-lg p-5 md:p-10 gap-10 mt-10">
      {/* Left Side - Form */}
      <div className="md:w-1/2 w-full pr-0 md:pr-10">
        <div className="mb-4">
          <FormLabel htmlFor="customer-name" className="mb-1">
            Customer Name
          </FormLabel>
          <FormSelect
            id="customer-name"
            className="w-full h-[40px] border border-gray-300 rounded-md"
            aria-label="Select Customer"
          >
            <option>Select Customer</option>
            <option>Customer 1</option>
            <option>Customer 2</option>
            <option>Customer 3</option>
          </FormSelect>
        </div>
        <div className="mb-4">
          <FormLabel htmlFor="shipper-name" className="mb-1">
            Shipper Name
          </FormLabel>
          <FormInput
            id="shipper-name"
            type="text"
            className="w-full h-[40px] border border-gray-300 rounded-md"
            placeholder=""
          />
        </div>
        <div className="mb-4">
          <FormLabel htmlFor="destination-country" className="mb-1">
            Destination Country
          </FormLabel>
          <FormInput
            id="destination-country"
            type="text"
            className="w-full h-[40px] border border-gray-300 rounded-md"
            placeholder=""
          />
        </div>
        <Button
          variant="primary"
          className="mt-4 w-full  px-6 py-2 bg-mustard text-white border-none rounded-md"
        >
          ADD DIMENSIONS
        </Button>
      </div>

      {/* Right Side - Image */}
      <div className="hidden  md:w-1/2 w-full md:flex justify-center items-center md:justify-end mt-5 md:mt-0">
        <div className="border-l border-gray-200 pl-10 w-full flex justify-center">
          <img src={JobImg} alt="Job Image" />
        </div>
      </div>
    </div>
  );
};

export default index;
