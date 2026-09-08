import { useEffect, useState } from "react";
import {
  FormInput,
  FormLabel,
  FormSelect,
} from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import { useAlert } from "../../../ContextProvider/AlertContext";
import {
  Tagged_house_list,
  Tag_house_dropdown,
  Tag_house,
  Untag_house,
  Edit_house_detail,
  Tagged_house_csv,
  Print_house_list,
} from "../../../AllServices/services";
import { ArrowLeft, Search } from "lucide-react";
import TomSelect from "../../../base-components/TomSelect";
import { TagHouseData } from "../../../DataTypes/dataTypes";
import LoadingIcon from "../../../base-components/LoadingIcon";
import TagHouseDetail from "./tag_house_detail";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";
import { unparse } from "papaparse";
import Lucide from "../../../base-components/Lucide";
import Modal from "../../../components/Modal";
import SearchableComp from "../../../components/SearchTaghouse/index";
const initialData = {
  id: "",
  airwaybill_no: "",
};
const index = () => {
  const { showAlert } = useAlert();
  // const [houseNo, setHouseNo] = useState<any>(null);
  const [houseNo, setHouseNo] = useState<Array<any>>([]);
  const [houseList, setHouseList] = useState<Array<any>>([]);
  const [airwaybillNumber, setAirwaybillNumber] = useState<any>(initialData);
  const [taggedHouseList, setTaggedHouseList] = useState<Array<any>>([]);
  const [airwaybillNoList, setAirwaybillNoList] = useState<Array<any>>([]);
  const [editHouseData, setEditHouseData] = useState<any>(null);
  const [showTagHouseForm, setShowTagHouseForm] = useState<boolean>(false);
  const [showTagHouseDetail, setShowTagHouseDetail] = useState<boolean>(false);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [untagSpinner, setUntagSpinner] = useState<boolean>(false);
  const [editSpinner, setEditSpinner] = useState<boolean>(false);
  const [untagId, setUntagId] = useState<any>();
  const [editId, setEditId] = useState<any>(null);
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user)?.mapped_id : null;
  const [manifestSearch, setManifestSearch] = useState("");

  const debouncedSearchTerm = useDebounce<string>(manifestSearch, 500);
  const [page, setPage] = useState<number>(1);
  const [totalpages, setTotalPages] = useState<number>(1);
  const [printCsvData, setPrintCsv] = useState<Array<any>>([]);
  const [csvSpinner, setCsvSpinner] = useState<boolean>(false);
  const [printTableToggle, setPrintTableToggle] = useState<boolean>(false);

  const [printClick, setPrintClick] = useState<any>();
  const [openmodal, setOpenModal] = useState<boolean>(false)
  const [id, setId] = useState<any>('')
  const handlePagechange = (e: number) => {
    setPage(e);
  };

  useEffect(() => {
    getTaggedHouseList();
    getTagHouseDropdown();
  }, [debouncedSearchTerm, page]);
  // useEffect(() => {
  //   getTaggedHouseList()
  // }, [])
  const description = (
    <>
      <div className="w-full text-center">
        Are You Sure!! You want to perform this action ?
      </div>
    </>
  );

  const footer = (
    <>
      <Button
        type="button"
        className="bg-mustard border-none py-2 px-4 text-white rounded-xl"
        onClick={() => untagHouse(id)}
      >
        UnTag
        {untagSpinner && (
          <LoadingIcon icon="puff" className="ml-2" />
        )}
      </Button>
    </>
  );
  const getTaggedHouseList = async () => {
    try {
      const response: any = await Tagged_house_list(
        hub_id,
        debouncedSearchTerm,
        20,
        page - 1
      );
      console.log("Rest", response);
      if (response?.status == 200) {
        setTaggedHouseList(response?.data.data || []);
        setTotalPages(Math.ceil(response?.data?.count / 20));
        setShowTagHouseForm(false);
      } else if (response?.status == 204) {
        setShowTagHouseForm(true);
        setTaggedHouseList([]);
      } else setShowTagHouseForm(true);
    } catch (error) {
      setShowTagHouseForm(true);
      if (error) showAlert("something went wrong", "error");
    }
  };

  const untagHouse = async (id: any) => {
    setUntagSpinner(true);
    let response;
    try {
      response = await Untag_house(id);
      if (response.status == 200) {
        showAlert(response.data.message, "success");
        getTagHouseDropdown();
        getTaggedHouseList();
        setUntagId(null);
        setShowTagHouseForm(false)
        setOpenModal(false)
        setId("")
      } else if (response.status == 204) setShowTagHouseForm(true);
    } catch (error) {
      showAlert(response.response.data.message, "error");
    } finally {
      setUntagSpinner(false);
    }
  };

  const printTableData = async (dataa: any) => {
    const data = {
      pickup_id: dataa?.pickup_id,
      house_no: dataa?.house_no,
    };
    let response: any;
    setPrintTableToggle(true);
    try {
      response = await Print_house_list(data);
      console.log("TREy", response?.data?.house_url);
      if (response?.status == 200) {
        const resUrl = response?.data?.house_url;
        window.open(`${resUrl}?${Math.random()}`, "_blank");
      } else if (response?.status == 204) {
        {
          showAlert("No data found!", "warning");
        }
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setPrintTableToggle(false);
    }
  };
  const columns = [
    { field: "airwaybill_no", headerName: "Airwaybill No." },
    { field: "house_no", headerName: "House No" },
    { field: "stock_date", headerName: "Tagging Date" },
    { field: "events", headerName: "Events" },
  ];

  const row: any = taggedHouseList?.map((item: any) => {
    const eventButtons = (
      <div>
        <Button
          className="ml-2 px-2 py-0.5 rounded-lg bg-blue-500 text-white hover:bg-blue-800 ml-2"
          disabled={printTableToggle && item?.pickup_id == printClick}
          onClick={() => {
            printTableData(item);
            setPrintClick(item?.pickup_id);
          }}
        >
          Print{" "}
          {item?.pickup_id == printClick && printTableToggle && (
            <LoadingIcon icon="puff" className="ml-2" />
          )}
        </Button>
        <Button
          className="ml-2 px-2 py-0.5 rounded-lg bg-orange-500 text-white hover:bg-orange-700 ml-2"
          onClick={() => {
            editHouseDetails(item?.pickup_id);
            setEditId(item?.pickup_id);
          }}
        >
          Edit
          {editSpinner && editId == item.pickup_id && (
            <LoadingIcon icon="puff" className="ml-2" />
          )}
        </Button>
        <Button
          disabled={untagSpinner}
          className="ml-2 px-2 py-0.5 rounded-lg bg-red-600 text-white hover:bg-red-800 ml-2"
          onClick={() => {
            setId(item?.id)
            setOpenModal(true)
            // untagHouse(item.id);
            // setUntagId(item.id);
          }}
        >
          Untag

        </Button>
      </div>
    );
    return {
      ...item,
      events: eventButtons,
    };
  });

  const getTagHouseDropdown = async () => {
    try {
      const response: any = await Tag_house_dropdown(hub_id);
      if (response?.status == 200) {
        setAirwaybillNoList(response?.data.data.airwaybillNumberList || []);
        setHouseList(response?.data.data.houseNumberList || []);
        // console.log("JUI",response?.data.data.houseNumberList)
      }
    } catch (error) {
      if (error) showAlert("something went wrong", "error");
    }
  };

  const submitTagHouse = async () => {
    setSpinner(true);
    const tagHouseData: TagHouseData = {
      id: airwaybillNumber.id,
      house_list: houseNo,
    };
    console.log("taghousedata", tagHouseData);
    let response;
    try {
      response = await Tag_house(hub_id, tagHouseData);
      if (response.status == 201) {
        showAlert(response.data.message, "success");
        setHouseNo(null);
        setAirwaybillNumber(null);
        getTaggedHouseList();
        setShowTagHouseForm(false);
      } else if (response.status == 204) showAlert("No data found!", "warning");
      else showAlert(response.data.message, "warning");
    } catch (error) {
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
    } finally {
      setSpinner(false);
    }
  };

  const editHouseDetails = async (id: any) => {
    setEditSpinner(true);
    let response;
    try {
      response = await Edit_house_detail(id);
      if (response?.status == 200) {
        setEditHouseData(response?.data?.data);
        setShowTagHouseDetail(true);
      } else if (response?.status == 203) {
        setEditHouseData(null);
        showAlert(response?.data?.message, "warning");
      } else if (response?.status == 204) {
        setEditHouseData(null);
        showAlert("No data found!", "warning");
      }
    } catch (error) {
      showAlert(response?.response?.data?.message, "error");
    } finally {
      setEditSpinner(false);
    }
  };

  const convertJSONtoCSV = async (data: any[] = [], fileName: string) => {
    // try {
    setCsvSpinner(true);
    const csv = unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove(); // Use remove() instead of removeChild
    // } catch (error: any) {
    // console.error("Error converting JSON to CSV:", error.message);
    setCsvSpinner(false);
    // }finally{
    //     setCsvSpinner(false);
    // }
  };

  const formatData = (data: any) => {
    if (!data?.length > 0) return [{ "No Data Found": "" }];
    return data?.map((item: any, index: number) => ({
      "Sr. No.": `${index + 1}.`,
      "Airwaybill Number": item?.airwaybill_no,
      "House No": item?.house_no,
      "Taging Date": item?.stock_date,
    }));
  };

  const csvDataForPrint = async () => {
    try {
      setCsvSpinner(true);
      const res: any = await Tagged_house_csv(hub_id);
      if (res?.status == 200) {
        setPrintCsv(res?.data?.data);
        // setPrintCsv([])
      } else if (res?.status == 204) {
        setPrintCsv([]);
      } else {
        showAlert("Something went wrong!", "error");
      }
    } catch (err: any) {
      console.error("Error fetching CSV data:", err);
    } finally {
      setCsvSpinner(false);
    }
  };
  const fun1 = (a?: any) => { };
  const fun2 = () => { };
  useEffect(() => {
    csvDataForPrint();
  }, []);
  // console.log("showTagHouseDetail", showTagHouseDetail)
  console.log("showTagHouseForm", showTagHouseForm);
  // console.log("taggedHouseList", taggedHouseList?.length)
  return (
    <>
      {!showTagHouseDetail ? (
        <div className="w-full max-w-6xl mx-auto mt-4 py-3 px-6 bg-white rounded-lg shadow-lg">
          <div className="w-full flex justify-between">
            <div className=" flex">
              {taggedHouseList?.length > 0 &&
                showTagHouseForm && (
                  <div
                    className="p-2 cursor-pointer rounded-full shadow-lg mr-4"
                    onClick={() => {
                      setShowTagHouseForm(false);
                      setAirwaybillNumber({}), setHouseNo([]);
                    }}
                  >
                    <ArrowLeft className="w-5 h-4" />
                  </div>
                )}
              <h1 className="font-bold text-lg">Tag House</h1>
            </div>
            {!showTagHouseForm && (
              <>
                <div className="flex items-center">
                  <Button
                    className="px-4 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-700 ml-2"
                    onClick={() => {
                      setShowTagHouseForm(true);
                      getTagHouseDropdown();
                    }}
                  >
                    Tag House
                  </Button>

                  <div className="relative flex justify-between items-center ml-2 mr-2">
                    <FormInput
                      placeholder="Search..."
                      className="pr-8 pt-1 pb-1 rounded-xl"
                      value={manifestSearch}
                      onChange={(e) => {
                        setManifestSearch(e.target.value.toUpperCase());
                        getTaggedHouseList();
                        setPage(1);
                      }}
                    />
                    <Search className="absolute right-1 w-5 h-5" />
                  </div>
                  <div className="mr-2 ">
                    <Button
                      variant="outline-secondary"
                      className="w-full sm:w-auto pt-1 pb-1 pl-2 pr-2 rounded-xl"
                      disabled={csvSpinner}
                      onClick={() =>
                        convertJSONtoCSV(
                          formatData(printCsvData),
                          "inscan_outscan.csv"
                        )
                      }
                    >
                      <Lucide icon="FileText" className="w-4 h-4 mr-2" />
                      Export
                      {csvSpinner && (
                        <LoadingIcon icon="puff" className="ml-2" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <hr className="mt-2 mb-4" />
          {showTagHouseForm ? (
            <div className="flex flex-col">
              <div className="sm:flex flex-row">
                <div className="sm:w-[25%] mr-2 mb-2 sm:mb-0">
                  <SearchableComp
                    // apiEndpoint="admin/franchisee-settings"

                    zIndex="50"
                    airwaybillNumber={airwaybillNumber}
                    setAirwaybillNumber={setAirwaybillNumber}
                    fun1={fun1}
                    fun2={fun2}
                    hubid={hub_id}
                  />
                </div>
                <div className="sm:w-[40%] mr-2 mb-2 sm:mb-0">
                  <FormLabel>House No</FormLabel>
                  <TomSelect
                    value={houseNo}
                    onChange={(e: any) => {
                      setHouseNo(e);
                    }}
                    className="w-full"
                    multiple
                  >
                    {houseList?.map((val, index) => {
                      return (
                        <option key={index} value={val.pickup_id}>
                          {val.airwaybill_no}
                        </option>
                      );
                    })}
                  </TomSelect>
                </div>
                <div className="sm:w-[40%] mr-2 sm:mb-0">
                  <Button
                    disabled={spinner}
                    onClick={() => submitTagHouse()}
                    className="sm:w-[50%] mt-[28px] p-2 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-mustard text-white"
                  >
                    Tag House{" "}
                    {spinner && <LoadingIcon icon="puff" className="ml-2" />}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Table columns={columns} row={row} heightTable="65.5vh" />
              <CommonPagination
                totalpages={totalpages}
                onPageChange={handlePagechange}
                page={page}
              />
            </>
          )}
        </div>
      ) : (
        <TagHouseDetail
          editId={editId}
          editHouseData={editHouseData}
          setEditHouseData={setEditHouseData}
          setShowTagHouseDetail={setShowTagHouseDetail}
        />
      )}
      <Modal
        size="lg"
        title={"Confirmation"}
        open={openmodal}
        setOpen={setOpenModal}
        description={description}
        footer={footer}
      />
    </>
  );
};

export default index;
