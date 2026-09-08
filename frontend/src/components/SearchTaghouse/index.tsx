import React, { useState, useEffect } from "react";
import { FormInput, FormLabel } from "../../base-components/Form";
import { useDebounce } from "../Search";
import { Tag_house_dropdown } from "../../AllServices/services";
const SearchableComp = (props:any) => {
  const {
    
    placeholder,
    zIndex,
    airwaybillNumber,
    setAirwaybillNumber,
    fun1,
    fun2,
    border,
    hubid
  } = props;
  const [query, setQuery] = useState(airwaybillNumber?.airwaybill_no||"");
  const [isUserTyping, setIsUserTyping] = useState(true); // Track whether the user is typing
  const debouncedSearchTerm = useDebounce<any>(airwaybillNumber?.airwaybill_no, 500);
  console.log("debounce", debouncedSearchTerm)
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  useEffect(() => {
    if (isUserTyping && debouncedSearchTerm?.length >=1) {
      // Trigger API call only when query length is greater than 2 and user is typing
      getdata();
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm, isUserTyping]);

  const getdata = async () => {
    try {
      setIsLoading(true);
      const res =await Tag_house_dropdown(hubid,debouncedSearchTerm)
    //   const res = await commongetrequest(
    //     `${apiEndpoint}?key=${debouncedSearchTerm}`
    //   );
      if (res?.status === 200) {
        setData(res?.data?.data?.airwaybillNumberList || []);

        setShowSuggestions(true);
      } else {
        setData([]);
        setShowSuggestions(false);
      }
    } catch (err:any) {
      console.log(err?.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSelect = (item: any) => {
    setIsUserTyping(false); // Stop the API call from being triggered
    setQuery(item?.airwaybill_no);
    fun1(item)// Set the query to the selected item
    setAirwaybillNumber(item)
    if(fun2){
 fun2()
    }
    setShowSuggestions(false);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value=e.target.value.toUpperCase()
    setIsUserTyping(true); // Reset typing state when the user types again
    setAirwaybillNumber((pre:any)=>({...pre,airwaybill_no:value}))
    if(!value){
        setAirwaybillNumber({
         id: "",  
         airwaybill_no:""})
    }
 fun2()
  };
  return (
    <div className="relative w-full  mx-auto ">
      <FormLabel>Airwaybill No</FormLabel>
      <FormInput
        type="text"
        className={`w-full ${border?"border border-red-400":""}`}
        placeholder={placeholder || "Search..."}
        value={airwaybillNumber?.airwaybill_no}
        onChange={handleInputChange} // Call this on input change
      />
      {isLoading && (
        <div className="absolute top-[80%] left-0 right-0 bg-white p-2 border border-gray-300 mt-1">
          Loading...
        </div>
      )}
      {showSuggestions && !isLoading && (
        <ul className={`absolute top-[80%] left-0 right-0 bg-white border border-gray-300 mt-1 rounded max-h-60 overflow-y-auto z-${zIndex?zIndex:"40"}`}>
          {data?.length > 0 ? (
            data?.map((item: any, index: number) => (
              <li
                key={index}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSelect(item)} // Handle selection
              >
                {item?.airwaybill_no}
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