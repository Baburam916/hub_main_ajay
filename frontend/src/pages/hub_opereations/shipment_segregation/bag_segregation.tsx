import Button from "../../../base-components/Button";
import { FormInput } from "../../../base-components/Form";
import Table from "../../../components/Table";
import { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Incomplete_segregation } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Search } from "lucide-react";
import LoadingIcon from "../../../base-components/LoadingIcon";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";

const bag_segregation = (data: any) => {
  const { showAlert } = useAlert();
  const [getPendingList, setGetPendingList] = useState([]);
  const [showPendingList, setShowPendingList] = useState<boolean>(false);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [manifestSearch, setManifestSearch] = useState("");
  const [manifestClick, setManifestClick] = useState<any>();

  const debouncedSearchTerm = useDebounce<string>(manifestSearch, 500);
  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);
  const handlePagechange = (e: number) => {
    setPage(e);
  };

  useEffect(() => {
    if (showPendingList) {
      incompleteSegregation();
    }
  }, [debouncedSearchTerm, page]);

  const incompleteSegregation = async () => {
    setSpinner(true);
    try {
      const response: any = await Incomplete_segregation(
        data.hub_id,
        debouncedSearchTerm,
        20,
        page - 1
      );
      if (response.status == 200) {
        setGetPendingList(response.data.data);
        setTotalPages(Math.ceil(response?.data?.count / 20));
        setShowPendingList(true);
      } else if (response?.status == 204) {
        setGetPendingList([]);
        showAlert("No data found!", "warning");
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      showAlert("something went wrong", "error");
    } finally {
      setSpinner(false);
    }
  };

  const columns = [
    { field: "bag_no", headerName: "Bag No." },
    { field: "airwaybill_no", headerName: "Airwaybill No." },
    { field: "created_date", headerName: "Created Date" },
    { field: "continue", headerName: "Continue" },
  ];

  const row = getPendingList.map((item: any) => {
    console.log("UYT", item);
    const actionButton = (
      <Button
        className="bg-blue-600 border-none py-2 px-4 text-white"
        disabled={item.bag_no == manifestClick}
        onClick={() => {
          data.setBagNumber(item.bag_no);
          data.bagInscan(item.bag_no);
          setManifestClick(item.bag_no);
        }}
      >
        Continue{" "}
        {item.bag_no == manifestClick && (
          <LoadingIcon icon="puff" className="ml-2" />
        )}
      </Button>
    );

    return {
      ...item,
      continue: actionButton,
    };
  });

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 px-6 py-3 bg-white rounded-lg shadow-lg">
        {!showPendingList ? (
          <Button
            className="bg-mustard border-none py-2 px-4 text-white"
            disabled={spinner}
            onClick={() => incompleteSegregation()}
          >
            Show Pending Scans{" "}
            {spinner && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>
        ) : (
          <>
            <div className="flex items-center">
              <div
                className="p-2 cursor-pointer rounded-full shadow-lg mr-4"
                onClick={() => setShowPendingList(false)}
              >
                <ArrowLeft className="w-5 h-4" />
              </div>
              <div className="flex justify-between items-center w-full">
                <h1 className="text-base text-gray-500 font-bold">
                  Pending Inscan List
                </h1>
                <div className="relative flex justify-between items-center">
                  <FormInput
                    placeholder="Search..."
                    className="pr-8 pt-1 pb-1 rounded-xl"
                    value={manifestSearch}
                    onChange={(e) => {
                      setManifestSearch(e.target.value);
                      incompleteSegregation();
                      setPage(1);
                    }}
                  />
                  <Search className="absolute right-1 w-5 h-5" />
                </div>
              </div>
            </div>
            {getPendingList?.length > 0 ? (
              <>
                <Table columns={columns} row={row} heightTable="42.5vh" />
                <CommonPagination
                  totalpages={totalpages}
                  onPageChange={handlePagechange}
                  page={page}
                />
              </>
            ) : (
              <p className="text-gray-400 text-center">No Data Found!</p>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default bag_segregation;
