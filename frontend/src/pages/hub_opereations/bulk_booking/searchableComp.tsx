import React, { useState, useEffect } from "react";
import { useDebounce } from "../../../components/Search";
import { FormInput } from "../../../base-components/Form";
import { Get_franchisee_details } from "../../../AllServices/services";

const SearchableComp = (props: any) => {
  const {
    placeholder,
    zIndex,
    selectedData,
    setSelectedData,
    fun1,
    fun2,
    border,
  } = props;
    const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const [query, setQuery] = useState(selectedData?.franchisee_name || "");
  const [isUserTyping, setIsUserTyping] = useState(true); // Track whether the user is typing
  const debouncedSearchTerm = useDebounce<any>(
    selectedData?.franchisee_name,
    500
  );
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (isUserTyping && debouncedSearchTerm.length > 0) {
      // Trigger API call only when query length is greater than 2 and user is typing
      getdata();
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm, isUserTyping]);

  const getdata = async () => {
    try {
      setIsLoading(true);
      const res = await Get_franchisee_details(`?hub=${hub_id}&key=${debouncedSearchTerm}`);
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
    setQuery(item?.franchisee_name);
    fun1(item); // Set the query to the selected item
    setSelectedData(item);
    if (fun2) {
      fun2();
    }

    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsUserTyping(true); // Reset typing state when the user types again
    setSelectedData((pre: any) => ({
      ...pre,
      franchisee_name: value,
    }));
    if (!value) {
      setSelectedData({
        franchisee_id: "",
        franchisee_name: "",
      });
    }
    fun2();
  };

  return (
    <div className="relative w-full  mx-auto ">
      <FormInput
        type="text"
        className={`w-[100%] ${border ? "border border-red-400" : ""}`}
        placeholder={placeholder || "Search..."}
        value={selectedData?.franchisee_name}
        onChange={handleInputChange} // Call this on input change
      />

      {isLoading && (
        <div className="absolute top-[80%] left-0 right-0 bg-white p-2 border border-gray-300 mt-1 w-[100%]">
          Loading...
        </div>
      )}

      {showSuggestions && !isLoading && (
        <ul
          className={`absolute top-[80%] left-0 right-0 bg-white border border-gray-300 mt-1 rounded max-h-60 overflow-y-auto w-[100%] z-${
            zIndex ? zIndex : "40"
          }`}
        >
          {data?.length > 0 ? (
            data?.map((item: any, index: number) => (
              <li
                key={index}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSelect(item)} // Handle selection
              >
                {item?.franchisee_name}
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

export default SearchableComp;
