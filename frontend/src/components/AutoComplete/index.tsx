import { useState, useEffect, useCallback } from "react";
import { FormInput } from "../../base-components/Form";
import "./style.css";

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const index = (data: any) => {
  const {
    apiFunction,
    setMobileNumber,
    mobileNumber,
    setDriverName,
    setVehicleNo,
  } = data;
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = useCallback(
    debounce(async (mobileNumber: any) => {
      // const countryCode = localStorage.getItem("code");
      try {
        if (mobileNumber) {
          const response: any = await apiFunction(mobileNumber);
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
    fetchSuggestions(mobileNumber);
  }, [mobileNumber]);

  const onClick = (data: any) => {
    setFilteredSuggestions([]);
    setMobileNumber(data?.mobile_no);
    setDriverName(data?.driver_name);
    setVehicleNo(data?.vehicle_no);
    setShowSuggestions(false);
  };

  const SuggestionsListComponent = () => {
    return filteredSuggestions.length > 0 ? (
      <div className="custom-scrollbar  shadow-custom bg-white rounded  z-[300] p-2">
        <ul className="">
          {filteredSuggestions.map((elem: any, index) => {
            return (
              <li
                className="cursor-pointer text-gray-600 text-sm font-medium p-1 px-2"
                key={index}
                onClick={() => onClick(elem)}
              >
                {elem?.mobile_no}
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
        className="w-full rounded-0 h-10"
        placeholder="Contact Number"
        value={mobileNumber}
        onChange={(e) => {
          setMobileNumber(e.target.value);
          setDriverName("");
          setVehicleNo("");
        }}
      />
      {showSuggestions && mobileNumber && <SuggestionsListComponent />}
    </>
  );
};

export default index;
