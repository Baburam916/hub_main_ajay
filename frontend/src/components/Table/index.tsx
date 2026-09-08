import Table from "../../base-components/Table";
import IsLoading from "../Isloading/isLoading";
import "./index.css";

export default function index(data: any) {
  const {
    heightTable,
    columns,
    row,
    limit = 20,
    currentPage,
    minHeightTable = "",
    ops = 0,
    listheight,
    loading,
    margin,
    forReadyToExecuteEdit = 0,
  } = data;

  return (
    <>
      <div
        className={` tbl-overflow-x-auto ${listheight ? listheight : ""} ${
          ops == 1 ? "pb-20 h-[60vh]" : ""
        }`}
        style={{ maxHeight: heightTable, minHeight: minHeightTable }}
      >
        {loading ? (
          <IsLoading margin={margin} />
        ) : (
          <Table className="min-w-full table-auto">
            <Table.Thead className="bg-mustard text-white sticky top-0 z-10">
              <Table.Tr className="text-center">
                {forReadyToExecuteEdit == 0 ? (
                  <Table.Th className="whitespace-nowrap p-2">SR.No.</Table.Th>
                ) : (
                  ""
                )}
                {columns?.map((col: any, ind: number) => (
                  <Table.Th
                    className={`whitespace-nowrap p-2 ${
                      col?.textAlign ? col?.textAlign : ""
                    } `}
                    key={ind}
                  >
                    {col.headerName}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {row?.map((item: any, rowIndex: number) => (
                <Table.Tr key={rowIndex} className="text-center">
                  {forReadyToExecuteEdit == 0 ? (
                    <Table.Td className="whitespace-nowrap p-2">
                      {currentPage == undefined
                        ? rowIndex + 1
                        : (currentPage - 1) * limit + (rowIndex + 1)}
                      .
                    </Table.Td>
                  ) : (
                    ""
                  )}
                  {columns?.map((col: any, colIndex: number) => (
                    <Table.Td
                      className={`whitespace-nowrap p-2 ${
                        col.textAlign ? col.textAlign : ""
                      } `}
                      key={colIndex}
                    >
                      {item[col.field]}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </div>
    </>
  );
}
