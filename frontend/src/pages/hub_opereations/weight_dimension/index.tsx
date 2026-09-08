import { useState } from "react";
import WeightDimensionList from "./weight_dimension_list";
import WeightDimensionAirwaybill from "./weight_dimension_airwaybill";
import { Weight_dimension_list } from "../../../AllServices/services";
import { useDebounce } from "../../../components/Search";
import { useAlert } from "../../../ContextProvider/AlertContext";

export default function Index() {
  const [showWeightDimensionList, setShowWeightDimensionList] =
    useState<boolean>(false);
  const [scanApprove, setScanApprove] = useState<any>();
  const [airwaybillNo, setAirwaybillNo] = useState<any>(null);
  const [manifestSearch, setManifestSearch] = useState("");
  const debouncedSearchTerm = useDebounce<string>(manifestSearch, 500);
  const current_user = localStorage.getItem("current_user");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [getList, setGetList] = useState([]);
  const [totalpages, setTotalPages] = useState<number>(1);
  const { showAlert } = useAlert();
  const user_id = current_user ? JSON.parse(current_user).mapped_id : null;
  const handleApprove = (value: any) => {
   
    setScanApprove(value);
  };

  const handlewtdimlist = () => {
    weightDimensionList();
  };
  const weightDimensionList = async () => {
    try {
      const response = await Weight_dimension_list(
        user_id,
        debouncedSearchTerm,
        limit,
        page - 1
      );

      if (response.status == 200) {
        const data = response?.data?.data || [];

        setGetList(response.data.data);
        setTotalPages(Math.ceil(response?.data?.count / limit));
      } else if (response.status == 204) {
        showAlert("No data found!", "warning");
        setGetList([]);
        showAlert("No data found!", "warning");
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      if (error) showAlert("something went wrong", "error");
    }
  };

  const singleweightDimensionList = async (id: any) => {
    try {
      const response = await Weight_dimension_list(
        user_id,
        debouncedSearchTerm,
        limit,
        page - 1
      );

      if (response.status == 200) {
        const data = response?.data?.data || [];

        const singledata = data?.find((item: any) => item?.id == id);
       
        
        setScanApprove(singledata);
      } else if (response.status == 204) {
        showAlert("No data found!", "warning");
        setGetList([]);
        showAlert("No data found!", "warning");
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      console.log(error);
      if (error) showAlert("something went wrong", "error");
    }
  };

  return (
    <>
      {!showWeightDimensionList ? (
        <WeightDimensionList
          user_id={user_id}
          setShowWeightDimensionList={setShowWeightDimensionList}
          singleweightDimensionList={singleweightDimensionList}
          setAirwaybillNo={setAirwaybillNo}
          handleApprove={handleApprove}
          handlewtdimlist={handlewtdimlist}
          manifestSearch={manifestSearch}
          setManifestSearch={setManifestSearch}
          debouncedSearchTerm={debouncedSearchTerm}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalpages={totalpages}
          setTotalPages={setTotalPages}
          getList={getList}
          setGetList={setGetList}
          scanApprove={scanApprove}
        />
      ) : (
        <WeightDimensionAirwaybill
          airwaybillNo={airwaybillNo}
          setShowWeightDimensionList={setShowWeightDimensionList}
          scanApprove={scanApprove}
          handlewtdimlist={handlewtdimlist}
          singleweightDimensionList={singleweightDimensionList}
        />
      )}
    </>
  );
}
