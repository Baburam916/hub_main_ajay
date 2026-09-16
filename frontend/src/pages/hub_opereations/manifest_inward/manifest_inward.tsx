import { FileText, Search, User } from "lucide-react";
import { FormInput } from "../../../base-components/Form";
import Table from "../../../components/Table";
import { useEffect, useState } from "react";
import {
  Download_inward_manifest,
  Inward_manifest,
} from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";
import { indianFormat } from "../../../utils";

export default function Index() {
  const { showAlert } = useAlert();
  const [pdfLink, setPdfLink] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [gatManifestInward, setGatManifestInward] = useState([]);
  const [downloadId, setDownloadId] = useState("");
  const [manifestSearch, setManifestSearch] = useState('')

  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const debouncedSearchTerm = useDebounce<string>(manifestSearch, 500);
  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);

  const handlePagechange = (e: number) => {
    setPage(e);
  };

  useEffect(() => {
    manifestInward();
  }, [hub_id]);

  useEffect(() => {
    manifestInward();
  }, [debouncedSearchTerm, page])
  const manifestInward = async () => {
    try {
      const response = await Inward_manifest(hub_id, debouncedSearchTerm, 20, page - 1);
      if (response.status == 200) {setGatManifestInward(response.data.data);setTotalPages(Math.ceil(response?.data?.count / 20))}
      else if (response.status === 204)
       { setGatManifestInward([])
        showAlert("No data found!", "warning");}
      else if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.data.message, "error");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }
  };

  const columns = [
    { field: "manifest_code", headerName: "Manifest No." },
    { field: "branch_name", headerName: "PUD Center" },
    { field: "total_bag", headerName: "Total Bags" },
    { field: "created_date", headerName: "Created Date" },
    { field: "download", headerName: "Download" },
  ];

  const row = gatManifestInward.map((item: any) => {
    const actionButton = (id: any) => (
      <Button
        disabled={loading}
        className="bg-blue-600 border-none py-2 px-4 text-white"
        onClick={() => {
          downloadInwardManifest(id);
          setDownloadId(id);
        }}
      >
        Download Manifest
        {loading && downloadId == item.manifest_id ? (
          <LoadingIcon icon="oval" color="white" className="w-4 h-4 ml-2" />
        ) : null}
      </Button>
    );
    const totalbag = <p className="text-end">{indianFormat(item.total_bag)}</p>
    return {
      ...item,
      download: actionButton(item.manifest_id),
      total_bag : totalbag
    };
  });

  const downloadInwardManifest = async (id: any) => {
    setLoading(true);
    let response;
    try {
      response = await Download_inward_manifest(id);
      setLoading(false);
      if (response.status == 200) setPdfLink(response.data.data);
      else showAlert(response.data.message, "error");
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    }
  };

  useEffect(() => {
    if (pdfLink != null) handleDownload(pdfLink);
  }, [pdfLink]);

  const handleDownload = (pdfLink: string) => {
    const link = document.createElement("a");
    link.href = `${pdfLink}?${Math.random()}`;
    link.download = "manifest_inward";
    link.target = "_blank";
 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
 <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">

 <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-none flex gap-2 items-center justify-between w-full">


  <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <FileText className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                    {" "}
                  Manifest Inward List
                  </h4>
                </div>
              </div>


         
            <div className="flex-wrap lg:flex-nwrap flex gap-2 items-center"> 
              <div className="relative flex justify-between items-center w-full lg:w-auto">
                <FormInput
                  placeholder="Search..."
                  className="pr-8 pt-1 pb-1 rounded-md  w-full lg:w-auto h-[34px]"
                  value={manifestSearch} 
                  onChange={(e) => {
                    setManifestSearch(e.target.value.toUpperCase());
                    manifestInward();
                    setPage(1)
                  }}
                />
                <Search className="absolute right-1 w-45 h-4" />
              </div>
              <div>
                <div className="flex items-center ml-2">
                  <h1 className="text-sm sm:text-md font-bold">Next Manifest Inscan</h1>
                  <div className="p-2 cursor-pointer rounded-full shadow-lg mr-4 ml-2 bg-[#777] w-[34px] h-[34px]">
                    <Link
                      to="/hub/operation/manifest_inscan"
                      className="font-bold"
                    >
                      <ArrowRight className="w-4 h-4  text-white" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          
        </div>
     </div>
  








        <div className="p-2 lg:p-5">
          {gatManifestInward.length > 0 ? (
            <>
            <Table columns={columns} row={row} heightTable="60vh" currentPage={page || 0}/>
            <CommonPagination
                totalpages={totalpages}
                onPageChange={handlePagechange}
                page={page}
          />
            </>
          ) : (
            <p className="text-gray-400 text-center">No Data Found!</p>
          )}
        </div>
      </div>
    </div>


    </>
  );
}
