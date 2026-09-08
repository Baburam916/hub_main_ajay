import React, { useEffect, useState } from "react";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import { Shipment_not_dispatch_report } from "../../../AllServices/services";

const index = () => {
  const [branchData, setBranchData] = useState<Array<any>>([]);
  const current_user = localStorage.getItem("current_user");
  const hub_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const columns = [
    { field: "branch_name", headerName: "Pud Center" },
    { field: "count", headerName: "Count" },
  ];

  const row: any = branchData?.map((item: any) => {
    return {
      ...item,
      count: <p className="text-end">{item.count}</p>
    };
  });

  const getAwaitingTabledata = async () => {
    const res: any = await Shipment_not_dispatch_report(hub_id);
    setBranchData(res?.data?.data);
  };

  useEffect(() => {
    getAwaitingTabledata();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
      <div className="w-full flex justify-between">
        <h1 className="font-bold text-lg">Shipment not Dispatch</h1>
        <div className="flex items-center"></div>
      </div>

      {branchData.length > 0 ? (
        <Table columns={columns} row={row} heightTable="65vh" />
      ) : (
        <>
          <p className="text-gray-400 text-center mt-4">No Data Found!</p>
        </>
      )}
    </div>
  );
};

export default index;
