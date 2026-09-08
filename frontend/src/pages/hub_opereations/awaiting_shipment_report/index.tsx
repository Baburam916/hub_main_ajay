import { useEffect, useState } from "react";
import Table from "../../../components/Table";
import {
  Awaiting_pud_branch,
  Awaiting_shipment_report,
} from "../../../AllServices/services";

const index = () => {
  const [branchData, setBranchData] = useState<Array<any>>([]);
  const [pudHub, setPudHub] = useState<Array<any>>([]);
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const columns = [
    { field: "branch_name", headerName: "Pud Center" },
    { field: "count", headerName: "Count" },
  ];

  const row: any = branchData?.map((item: any) => {
    const branch = (
      <p>
        {pudHub?.find((elem) => elem?.branch_id == item?.pickup_branch_id)
          ?.branch_name || "N.A."}
      </p>
    );
    const count = <p className="text-end">{item?.count}</p>
    return {
      ...item,
      branch_name: branch,
      count : count
    };
  });

  const getAwaitingTabledata = async () => {
    const res: any = await Awaiting_shipment_report(hub_id);
    setBranchData(res?.data?.data);
  };

  const getPubHubBranch = async () => {
    const res: any = await Awaiting_pud_branch(); 
    setPudHub(res?.data?.data);
  };

  useEffect(() => {
    getPubHubBranch();
    getAwaitingTabledata();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
      <div className="w-full flex justify-between">
        <h1 className="font-bold text-lg">Awaiting Shipments</h1>
      </div>

      {branchData?.length > 0 ? (
        <Table columns={columns} row={row} heightTable="65vh" />
      ) : (
        <>
          <p className="text-gray-400 text-center">No Data Found!</p>
        </>
      )}
    </div>
  );
};

export default index;
