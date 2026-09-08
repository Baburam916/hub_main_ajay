import React, { useState, useEffect } from "react";
import { useDebounce } from "../../components/Search";
import { FormInput } from "../Form";
import axios from "axios";
import { baseURL } from "../../AllServices/services";
const SearchableInput = (props: any) => {
  const {
    apiEndpoint,
    placeholder,
    zIndex,
    selecteddata,
    setSelecteddata,
    fun1,
    funtoempty,
    key1,
    border,
    comingselectedname,
    comingselectedid,
    key2,
    key2value,
    key3,
    key3value,
    questionmark,
    addcomingname2,
    addcomingname3,
    directapply,
    forwhat,
  } = props;
  const [query, setQuery] = useState(selecteddata[comingselectedname] || "");
  const [isUserTyping, setIsUserTyping] = useState(true); // Track whether the user is typing
  // console.log(selecteddata,"selecteddata",comingselectedname)
  const debouncedSearchTerm = useDebounce<any>(
    selecteddata[comingselectedname],
    500
  );
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  useEffect(() => {
    if (isUserTyping && debouncedSearchTerm.length > 2) {
      // Trigger API call only when query length is greater than 2 and user is typing
      getdata();
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm, apiEndpoint, isUserTyping]);
  const getdata = async () => {
    try {
      setIsLoading(true);
      let main;
      if (directapply) {
        main = apiEndpoint + debouncedSearchTerm;
      }
      const res = await axios.get(
        baseURL +
          `${
            directapply
              ? `${apiEndpoint + debouncedSearchTerm}`
              : `${apiEndpoint}${
                  !questionmark ? "?" : "&"
                }${key1}=${debouncedSearchTerm}${
                  key2 ? `&${key2}=key2value` : ""
                }${key3 ? `&${key3}=key3value` : ""}`
          }`
      );
      if (res?.status === 200) {
        setData(res?.data?.data || []);
        setShowSuggestions(true);
      } else {
        setData([]);
        setShowSuggestions(false);
      }
    } catch (err: any) {
      console.log(err?.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSelect = (item: any) => {
    setIsUserTyping(false); // Stop the API call from being triggered
    setQuery(item[comingselectedname]);
    if (forwhat) {
      fun1(item, forwhat);
    } else {
      fun1(item);
    }
    // Set the query to the selected item
    setSelecteddata(item);
    setShowSuggestions(false);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsUserTyping(true); // Reset typing state when the user types again
    setSelecteddata((pre: any) => ({
      ...pre,
      [comingselectedname]: value,
    }));
    if (!value) {
      setSelecteddata({
        [comingselectedid]: "",
        [comingselectedname]: "",
      });
      if (forwhat) {
        funtoempty(forwhat);
      } else {
        funtoempty();
      }
    }
  };
  return (
    <div className="relative w-full  mx-auto ">
      <FormInput
        type="text"
        className={`w-full ${border ? "border border-red-400" : ""}`}
        placeholder={placeholder || "Search..."}
        value={selecteddata[comingselectedname]}
        onChange={handleInputChange} // Call this on input change
      />
      {isLoading && (
        <div className="absolute top-[80%] left-0 right-0 bg-white p-2 border border-gray-300 mt-1">
          Loading...
        </div>
      )}
      {showSuggestions && !isLoading && (
        <ul
          className={`absolute top-[80%] left-0 right-0 bg-white border border-gray-300 mt-1 rounded max-h-60 overflow-y-auto z-${
            zIndex ? zIndex : "20"
          }`}
        >
          {data?.length > 0 ? (
            data?.map((item: any, index: number) => (
              <li
                key={index}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSelect(item)} // Handle selection
              >
                {`${item[comingselectedname]}${
                  addcomingname2 && item[addcomingname2]
                    ? ` - ${item[addcomingname2]}`
                    : ""
                }${
                  addcomingname3 && item[addcomingname3]
                    ? `, ${item[addcomingname3]}`
                    : ""
                }`}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};
export default SearchableInput;
