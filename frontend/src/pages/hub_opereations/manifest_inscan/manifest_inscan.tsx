import { ArrowLeft, Search } from "lucide-react";
import Table from "../../../components/Table";
import { useEffect, useState } from "react";
import Button from "../../../base-components/Button";
import { FormInput } from "../../../base-components/Form";
import { Incomplete_manifest } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Link } from "react-router-dom";
import LoadingIcon from "../../../base-components/LoadingIcon";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";

export default function ManifestInscan(data: any) {
  const { showAlert } = useAlert();
  const [getPendingList, setGetPendingList] = useState([]);
  const [manifestSearch, setManifestSearch] = useState('')
  const [showPendingList, setShowPendingList] = useState<boolean>(false);
  const [pendingSpinner, setPendingSpinner] = useState<boolean>(false);
  const debouncedSearchTerm = useDebounce<string>(manifestSearch, 500);
  const [manifestClick, setManifestClick] = useState<any>()
  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);
 

 useEffect(() => {
  if(showPendingList){

    incompleteManifest()
  }
 }, [debouncedSearchTerm, page])

  const handlePagechange = (e: number) => {
    setPage(e);
  };

  const incompleteManifest = async () => {
    setPendingSpinner(true);
    try {
      const response: any = await Incomplete_manifest(data.hub_id, debouncedSearchTerm, 20, page -1);
      if (response.status == 200) {
        setGetPendingList(response.data.data);
        // console.log("RTY",response?.data?.count)
        setTotalPages(Math.ceil(response?.data?.count / 20));
        setShowPendingList(true);
      } else if (response.status == 204) {showAlert("No data found!", "warning");setGetPendingList([])}
      else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      showAlert("something went wrong", "error");
    } finally {
      setPendingSpinner(false);
    }
  };

  const columns = [
    { field: "manifest_code", headerName: "Manifest No." },
    { field: "bag_no", headerName: "Bag No." },
    { field: "created_date", headerName: "Created Date" },
    { field: "continue", headerName: "Continue" },
  ];

  const row = getPendingList.map((item: any) => {
    const actionButton = (
      <Button 
        className="bg-blue-600 border-none py-2 px-4 text-white"
        disabled= {item.manifest_code == manifestClick}
        onClick={() => {
          data?.setManifestNumber(item.manifest_code);
          data?.manifestInscan(item.manifest_code);
          setManifestClick(item.manifest_code)
        }}
      >
        Continue  {item.manifest_code == manifestClick &&  <LoadingIcon icon="puff" className="ml-2" />}
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
            disabled={pendingSpinner}
            className="bg-mustard border-none py-2 px-4 text-white"
            onClick={() => incompleteManifest()}
          >
            Show Pending Scans{" "}
            {pendingSpinner && <LoadingIcon icon="puff" className="ml-2" />}
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
                <h1 className="text-gray-500 text-sm sm:text-lg font-bold">
                  Pending Inscan List
                </h1>
                <div className="relative flex justify-between items-center">
                  <FormInput
                    placeholder="Search..."
                    className="pr-8 pt-1 pb-1 rounded-xl"
                    value={manifestSearch}
                    onChange={(e) => {
                      setManifestSearch(e.target.value.toUpperCase());
                      incompleteManifest();
                      setPage(1)
                    }}
                  />
                  <Search className="absolute right-1 w-5 h-5" />
                </div>
              </div>
            </div>

            {
              getPendingList.length > 0 ? (
                  <>
                    <Table columns={columns} row={row} heightTable="43.5vh" currentPage={page || 0}/>
                    <CommonPagination
                          totalpages={totalpages}
                          onPageChange={handlePagechange}
                          page={page}
                    />
                  </>
              ) : (
                <p className="text-gray-400 text-center">No Data Found!</p>
              )
            }
            
          </>
        )}
      </div>
    </>
  );
}
