import { Eye } from "lucide-react";
import styles from "./mod.module.css"
import Table from "../../base-components/Table";
import LoadingIcon from "../../base-components/LoadingIcon";

export default function ReportCommonTable(data: any) {
  const { columns, row, loading,page,overflowvalue,height } = data;
  const keys = Object.keys(columns);
function transformKey(key:any) {
  return key.replace(/_/g, " ").toUpperCase();
}
let counter=0;
return (
  <>
    <div className="mt-4 bg-white">
    {loading ? (
      <LoadingIcon />
    ) : (
      <div className={`${overflowvalue?styles["table-container"]:""}`}>
        <Table
          sm
          striped
          // className={`${overflowvalue ? `overflow-auto h-[${height}px]` : ""}`}
        >
          <Table.Thead className="bg-mustard text-white whitespace-nowrap">
            <Table.Tr className="text-center">
              <Table.Th>SR.No.</Table.Th>
              {keys.map((key, index) => (
                <Table.Th className="text-left" key={index}>
                  {transformKey(key)}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody className="whitespace-nowrap">
            {row.map((item: any, rowIndex: number) => {
              counter++;
              return (
                <Table.Tr key={rowIndex}>
                  <Table.Td className="text-left" key={`srno-${rowIndex}`}>
                    {page * 20 + rowIndex + 1}
                  </Table.Td>
                  {keys.map((key, colIndex) => (
                    <Table.Td
                      key={`${rowIndex}-${colIndex}`}
                      className={`${
                        key == "Documents(shipper inv,kyc1,kyc2)"
                          ? "text-center"
                          : ""
                      }`}
                    >
                      {key === "dispatch_label" ||
                      key == "Documents(shipper inv,kyc1,kyc2)"
                        ? item[key]
                          ?<div className="flex justify-center items-center gap-2">{item[key].split(",").map((item2:any) => (
                              <div className="text-center  flex justify-center items-center">
                                {" "}
                                <a
                                  href={item2}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Eye className="text-mustard" />
                                </a>
                              </div>
                            ))}</div>
                          : "N/A"
                        : item[key] || item[key] === 0
                        ? item[key].toString()
                        : "N/A"}
                    </Table.Td>
                  ))}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </div>
    )}
    </div>
  </>
);
}