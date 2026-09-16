import React, { useEffect, useState } from "react";
import Button from "../../../base-components/Button";
import Table from "../../../components/Table";
import { Shipment_not_dispatch_report } from "../../../AllServices/services";
import { Monitor, User } from "lucide-react";

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
<>


 <div className="w-full mt-2 mb-4">
        <div className="mt-1 w-full bg-white rounded-[10px]  border border-white">
		
          <div className=" w-full py-3  px-3 border-b border-white commonGradient  rounded-t-[10px]">
            <div className="flex-wrap lg:flex-nowrap flex gap-2 items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <i className=" w-[25px] h-[25px]  rounded-lg flex items-center justify-center bg-mustard">
                    <Monitor className="w-[17px]  text-[#fff] " />
                  </i>
                  <h4 className="text-[16px] font-medium">
                 Shipment not Dispatch
                  </h4>
                </div>
              </div>

            </div>
          </div>

          <div className="p-2  lg:p-6">
            
            

    <div className="w-full">
     

      {branchData.length > 0 ? (
        <Table columns={columns} row={row} heightTable="65vh" />
      ) : (
        <>
          <p className="text-gray-400 text-center mt-4">No Data Found!</p>
        </>
      )}
    </div>
          </div>
        </div>
      </div>
      







    </>
  );
};

export default index;
