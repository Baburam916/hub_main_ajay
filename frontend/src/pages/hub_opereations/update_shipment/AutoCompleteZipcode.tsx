import React, { useState, useEffect, useCallback } from "react";
import { FormInput } from "../../../base-components/Form";
import { getPincodeApi } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const Main = ({ setData, data, setReceiverDetails, setSenderDetails }) => {
  const { showAlert } = useAlert();
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = useCallback(
    debounce(async (inputValue: any) => {
      const countryCode = localStorage.getItem("dcode");
      try {
        if (inputValue) {
          const response: any = await getPincodeApi(countryCode, inputValue);
          if (response?.status == 200) {
            setFilteredSuggestions(response?.data?.data || []);
            setShowSuggestions(true);
          } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
          }
        } else {
          setFilteredSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }
    }, 1000),
    [] // Ensure dependencies are listed here if any
  );

  useEffect(() => {
    if (data?.import_booking == "2") {
      fetchSuggestions(data?.origin_pincode);
    } else {
      fetchSuggestions(data?.destination_pincode);
    }
  }, [data?.origin_pincode, data?.destination_pincode, fetchSuggestions]);

  const handleChange = (e) => {
    if (data?.import_booking == "2") {
      setData((prev: any) => ({
        ...prev,
        origin_pincode: e.target.value,
        consigner_pincode: e.target.value,
      }));
      setSenderDetails((prev) => ({
        ...prev,
        consigner_pincode: e.target.value,
      }));
    } else {
      setData((prev: any) => ({
        ...prev,
        destination_pincode: e.target.value,
        consignee_pincode: e.target.value,
      }));
      setReceiverDetails((prev) => ({
        ...prev,
        consignee_pincode: e.target.value,
      }));
    }
  };

  const onClick = (value) => {
    if (data?.import_booking == "2") {
      setFilteredSuggestions([]);
      setData((prev: any) => ({
        ...prev,
        origin_pincode: value?.zipcode,
        origin_city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
        origin_state:
          value?.state_code?.replaceAll(/[^a-zA-Z0-9 ]/g, "") ||
          localStorage.getItem("code"),
        origin_state_code: value?.state?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
        consigner_city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
        consigner_pincode: value?.zipcode,
        consigner_state:
          value?.state_code?.replaceAll(/[^a-zA-Z0-9 ]/g, "") ||
          localStorage.getItem("code"),
      }));
      setSenderDetails((prev) => ({
        ...prev,
        consigner_city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
        consigner_pincode: value?.zipcode,
        consigner_state:
          value?.state_code?.replaceAll(/[^a-zA-Z0-9 ]/g, "") ||
          localStorage.getItem("code"),
      }));
      setShowSuggestions(false);
      showAlert("Origin Zipcode or city changed", "warning");
    } else {
      setFilteredSuggestions([]);

      setData((prev: any) => ({
        ...prev,
        destination_pincode: value?.zipcode,
        city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
        state:
          value?.state_code?.replaceAll(/[^a-zA-Z0-9 ]/g, "") ||
          localStorage.getItem("code"),
        state_name: value?.state?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
        consignee_city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
        consignee_pincode: value?.zipcode,
        consignee_state:
          value?.state_code?.replaceAll(/[^a-zA-Z0-9 ]/g, "") ||
          localStorage.getItem("code"),
      }));
      setReceiverDetails((prev) => ({
        ...prev,
        consignee_city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
        consignee_pincode: value?.zipcode,
        consignee_state:
          value?.state_code?.replaceAll(/[^a-zA-Z0-9 ]/g, "") ||
          localStorage.getItem("code"),
      }));
      setShowSuggestions(false);
      showAlert("Destination Zipcode or city changed", "warning");
    }
  };

  const SuggestionsListComponent = () => {
    return filteredSuggestions.length > 0 ? (
      <div className="relative">
        <ul
          className={`border-gray-300 border-t-0 bg-white rounded absolute z-10 w-[100%] top-0`}
        >
          {filteredSuggestions.map((elem, index) => {
            return (
              <li
                className="cursor-pointer text-gray-400  text-sm font-medium p-1 px-2 border-b border-x "
                key={index}
                onClick={() => onClick(elem)}
              >
                {`${elem?.zipcode}${
                  elem?.city_area ? ` - ${elem.city_area}` : ""
                }${elem?.state_code ? `, ${elem.state_code}` : ""}`}
              </li>
            );
          })}
        </ul>
      </div>
    ) : (
      <div className="text-gray-400 p-1.5 text-sm">No Data Found</div>
    );
  };

  return (
    <>
      <FormInput
        type="text"
        onChange={handleChange}
        // onBlur={() => setShowSuggestions(false)}
        // onKeyDown={handleKeyDown}
        className="w-full rounded-0 h-10"
        placeholder={
          data?.import_booking == "2"
            ? "Select Origin Zipcode"
            : "Select Destination Zipcode"
        }
        value={
          data?.import_booking == "2"
            ? data?.origin_pincode
            : data?.destination_pincode
        }
      />
      {showSuggestions && data?.origin_pincode && data?.destination_pincode && (
        <SuggestionsListComponent />
      )}
    </>
  );
};

export default Main;
