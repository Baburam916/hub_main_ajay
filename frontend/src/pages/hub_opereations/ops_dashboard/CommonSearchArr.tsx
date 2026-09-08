import { useEffect, useState } from "react";
// import { useDebounce } from "../JsonToCsv/useDebounce/useDebounce";

// import { commongetrequest } from "../../../../AllServices/services";
import { useDebounce } from "../../../components/Search";
import { FormInput } from "../../../base-components/Form";
import { common_get } from "../../../AllServices/services";


const CommonSearchArr = (props: any) => {
  const {
    apiEndpoint,
    placeholder,
    index,
    buycharges, // Array of charges
    setBuyCharges, // Function to update state
    fun1,
    funtoempty,
    comingselectedname,
    comingselectedid,
    key1,
    key2,
    key2value,
    key3,
    key3value,
    questionmark,
    addcomingname2,
    addcomingname3,
    directapply,
    forwhat,
    zIndex,
    border,
    isdisable
  } = props;

  const [query, setQuery] = useState(
    buycharges[index]?.[comingselectedname] || ""
  );
  const [isUserTyping, setIsUserTyping] = useState(true);
  const debouncedSearchTerm = useDebounce(query, 500);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [count, setCount] = useState(
    buycharges[index][comingselectedname] ? 1 : 0
  );
  useEffect(() => {
    if (isUserTyping && debouncedSearchTerm.length > 2) {
      if (!count) {
        getdata();
      }
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm, apiEndpoint, isUserTyping]);

  const getdata = async () => {
    try {
      setIsLoading(true);
      const res = await common_get(
        `${
          directapply
            ? `${apiEndpoint + debouncedSearchTerm}`
            : `${apiEndpoint}${
                !questionmark ? "?" : "&"
              }${key1}=${debouncedSearchTerm}${
                key2 ? `&${key2}=${key2value}` : ""
              }${key3 ? `&${key3}=${key3value}` : ""}`
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
      setShowSuggestions(false)
      setData([])
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    setIsUserTyping(false);
    // setCount(0)
    setQuery(item["vendor_name"]);

    // Update the specific index in buycharges
    setBuyCharges((prev) => {
      const updatedArray = [...prev];
      updatedArray[index] = {
        ...updatedArray[index], // Keep existing data
        [comingselectedid]: item["vendor_id"],
        [comingselectedname]: item["vendor_name"],
      };
      return updatedArray;
    });

    if (forwhat) {
      fun1(item, forwhat);
    } else {
      fun1(item);
    }

    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsUserTyping(true);
    setCount(0);
    setQuery(value);

    setBuyCharges((prev) => {
      const updatedArray = [...prev];
      updatedArray[index] = {
        ...updatedArray[index],
        [comingselectedname]: value,
      };
      return updatedArray;
    });

    if (!value) {
      setBuyCharges((prev) => {
        const updatedArray = [...prev];
        updatedArray[index] = {
          ...updatedArray[index],
          [comingselectedid]: "",
          [comingselectedname]: "",
        };
        return updatedArray;
      });

      if (forwhat) {
        funtoempty(forwhat);
      } else {
        funtoempty();
      }
    }
  };

  return (
    <div className="relative w-full mx-auto">
      <FormInput
        type="text"
        disabled={isdisable}
        className={`w-full p-2 border ${
          border ? "border-red-400" : "border-gray-300"
        } rounded`}
        placeholder={placeholder || "Search..."}
        value={buycharges[index]?.[comingselectedname] || ""}
        onChange={handleInputChange}
      />

      {isLoading && (
        <div className="absolute top-[80%] left-0 right-0 bg-white p-2 border border-gray-300 mt-1">
          Loading...
        </div>
      )}

      {showSuggestions && !isLoading && (
        <ul
          className={`absolute top-[80%] left-0 right-0 bg-white border border-gray-300 mt-1 rounded max-h-60 overflow-y-auto z-${
            zIndex ? zIndex : "40"
          }`}
        >
          {data?.length > 0 ? (
            data?.map((item: any, idx: number) => (
              <li
                key={idx}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSelect(item)}
              >
                {`${item["vendor_name"]}${
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


export default CommonSearchArr;
