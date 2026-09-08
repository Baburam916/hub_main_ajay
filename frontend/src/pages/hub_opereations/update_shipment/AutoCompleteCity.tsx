import React, { useState, useEffect, useCallback } from "react";
import { FormInput } from "../../../base-components/Form";
import { getCityStatesApi } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      +func(...args);
    }, delay);
  };
};

const Main = ({ setData, data, setReceiverDetails, setSenderDetails }) => {
  const { showAlert } = useAlert();
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  // const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // const [input, setInput] = useState("");

  const fetchSuggestions = useCallback(
    debounce(async (inputValue: any) => {
      const countryCode = localStorage.getItem("dcode");

      try {
        if (inputValue) {
          const response: any = await getCityStatesApi(
            countryCode,
            data?.import_booking == 2
              ? data?.origin_pincode
              : data?.destination_pincode || "",
            inputValue
          );
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

  // useEffect(() => {
  //   setInput(data?.city || "")
  // }, [data?.city]);

  useEffect(() => {
    if (data?.import_booking == 2) {
      fetchSuggestions(data?.origin_city);
    } else {
      fetchSuggestions(data?.city);
    }
  }, [data?.city, data?.origin_city]);

  const handleChange = (e) => {
    if (data?.import_booking == 2) {
      setData((prev) => ({
        ...prev,
        origin_city: e.target.value,
        consigner_city: e.target.value,
      }));
      setSenderDetails((prev) => ({
        ...prev,
        consigner_city: e.target.value,
      }));
    } else {
      setData((prev) => ({
        ...prev,
        city: e.target.value,
        consignee_city: e.target.value,
      }));
      setReceiverDetails((prev) => ({
        ...prev,
        consignee_city: e.target.value,
      }));
    }
  };

  const onClick = (value) => {
    if (data?.import_booking == 2) {
      setFilteredSuggestions([]);
      setData((prev: any) => ({
        ...prev,
        origin_city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
        consigner_city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
      }));

      setSenderDetails((prev) => ({
        ...prev,
        consigner_city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
      }));
      setShowSuggestions(false);
      showAlert("origin city changed", "warning");
    } else {
      setFilteredSuggestions([]);
      setData((prev: any) => ({
        ...prev,
        city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
        consignee_city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
      }));

      setReceiverDetails((prev) => ({
        ...prev,
        consignee_city: value?.city_area?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
      }));
      setShowSuggestions(false);
      showAlert("Destination city changed", "warning");
    }
  };

  // const handleKeyDown = (e) => {
  //   if (e.keyCode == 13) {
  //     setInput(filteredSuggestions[activeSuggestionIndex]);
  //     setActiveSuggestionIndex(0);
  //     setShowSuggestions(false);
  //   } else if (e.keyCode === 38) {
  //     if (activeSuggestionIndex == 0) {
  //       return;
  //     }
  //     setActiveSuggestionIndex(activeSuggestionIndex - 1);
  //   } else if (e.keyCode == 40) {
  //     if (activeSuggestionIndex + 1 == filteredSuggestions.length) {
  //       return;
  //     }
  //     setActiveSuggestionIndex(activeSuggestionIndex + 1);
  //   }
  // };

  const SuggestionsListComponent = () => {
    return filteredSuggestions.length > 0 ? (
      <div className="relative">
        <ul
          className={`border-gray-300 border-t-0 bg-white rounded absolute z-10 w-[100%] top-0`}
        >
          {filteredSuggestions?.map((elem, index) => {
            return (
              <li
                className="cursor-pointer text-gray-400  text-sm font-medium p-1 px-2 border-b border-x "
                key={index}
                onClick={() => onClick(elem)}
              >
                {`${elem?.city_area}${elem?.state ? ` , ${elem.state}` : ""}`}
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
          data?.import_booking == 2
            ? "Select Origin City"
            : "Select Destination City"
        }
        value={data?.import_booking == 2 ? data?.origin_city : data?.city}
      />
      {showSuggestions && data?.origin_city && data?.city && (
        <SuggestionsListComponent />
      )}
    </>
  );
};

export default Main;
