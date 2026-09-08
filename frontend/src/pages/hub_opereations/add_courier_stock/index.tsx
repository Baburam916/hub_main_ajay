import { useEffect, useState } from "react";
import CourierForm from "./courier_form";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import { Courier_stock_list } from "../../../AllServices/services";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Package,
  PackagePlus,
  PackageX,
  Search,
  X,
} from "lucide-react";
import CommonPagination from "../../../components/Pagination";
import { useDebounce } from "../../../components/Search";
import { FormInput } from "../../../base-components/Form";

const index = () => {
  const { showAlert } = useAlert();
  const [showCourierStockForm, setShowCourierStockForm] =
    useState<boolean>(false);
  const [courierStockList, setCourierStockList] = useState<Array<any>>([]);
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
    getCourierStockList();
  }, [debouncedSearchTerm, page]);

  const getCourierStockList = async () => {
    let response;
    try {
      response = await Courier_stock_list(hub_id, debouncedSearchTerm, 20, page - 1);
      if (response?.status == 200) {setCourierStockList(response?.data.data);setTotalPages(Math.ceil(response?.data?.count / 20))}
      else if (response?.status == 204) {
        setCourierStockList([])
        // setShowCourierStockForm(true);
        showAlert("No data found!", "warning");
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      if (response.response.status == 406)
        showAlert(response.response.data.errors[0].msg, "warning");
      else showAlert(response.response.data.message, "error");
      if (error) showAlert("something went wrong", "error");
      setShowCourierStockForm(true);
    }
  };

  const columns = [
    { field: "airwaybill_no", headerName: "Airwaybill No" },
    { field: "stock_date", headerName: "Stock Date" },
    { field: "used", headerName: "Status" },
  ];

  const row = courierStockList?.map((item: any) => {
    return {
      ...item,
      airwaybill_no: (
        <span className="font-mono font-medium text-slate-700">
          {item.airwaybill_no}
        </span>
      ),
      used:
        item.is_used == 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Not Used
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
            <Clock3 className="w-3.5 h-3.5" />
            Used
          </span>
        ),
    };
  });

  return (
    <>
      <div
        className={`w-full ${
          showCourierStockForm ? "max-w-xl" : "max-w-8xl"
        } mx-auto mt-4 px-4 sm:px-6 py-4 bg-white rounded-xl shadow-lg`}
      >
        <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            {courierStockList.length > 0 && showCourierStockForm && (
              <div
                className="p-2 cursor-pointer rounded-full hover:bg-slate-100 shadow-sm"
                onClick={() => setShowCourierStockForm(false)}
              >
                <ArrowLeft className="w-5 h-4" />
              </div>
            )}
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-mustard bg-opacity-10 text-mustard">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800 leading-tight">
                Courier Stock List
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Manage and track your courier stock inventory
              </p>
            </div>
          </div>
          {!showCourierStockForm && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Button
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-mustard text-white hover:bg-opacity-90 w-full sm:w-auto"
                onClick={() => setShowCourierStockForm(true)}
              >
                <PackagePlus className="w-4 h-4" />
                Add Courier Stock
              </Button>
              <div className="relative flex justify-between items-center">
                <FormInput
                  placeholder="Search..."
                  className="w-full pr-8 pt-1.5 pb-1.5 rounded-xl"
                  value={manifestSearch}
                  onChange={(e) => {
                    setManifestSearch(e.target.value.toUpperCase());
                    getCourierStockList();
                    setPage(1)
                  }}
                />
                {manifestSearch ? (
                  <X
                    className="absolute right-2.5 w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                    onClick={() => {
                      setManifestSearch("");
                      setPage(1);
                    }}
                  />
                ) : (
                  <Search className="absolute right-2.5 w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>
          )}
        </div>

        <hr className="mt-3" />

        {showCourierStockForm ? (
          <CourierForm
            hub_id={hub_id}
            getCourierStockList={getCourierStockList}
            setShowCourierStockForm={setShowCourierStockForm}
          />
        ) : (
          <>
            {courierStockList.length > 0 ? (
              <>
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-100">
                  <Table columns={columns} row={row} heightTable="66vh" />
                </div>
                <CommonPagination
                  totalpages={totalpages}
                  onPageChange={handlePagechange}
                  page={page}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                <PackageX className="w-10 h-10" />
                <p className="text-sm font-medium">No Data Found!</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default index;
