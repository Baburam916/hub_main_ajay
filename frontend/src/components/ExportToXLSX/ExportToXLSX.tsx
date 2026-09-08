import * as XLSX from "xlsx-js-style";

type TableRow = Record<string, any>;

export const ExportToXLSX = (
  data:any 
) => {
  const {
  tableData,
  fileName = "table-data.xlsx",
  sheetName = "Data",
  leftAlignColumns,
  centerAlignColumns,
  rightAlignColumns} = data;
  const worksheet = XLSX.utils.json_to_sheet(tableData);

  // --- Format Header Row ---
  const range = XLSX.utils.decode_range(worksheet["!ref"] as string);

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    const cell = worksheet[cellAddress];
    if (cell && cell.v) {
      cell.v = String(cell.v).replace(/_/g, " ").toUpperCase();
    }
  }

  // --- Alignment Config (EDIT HERE) ---
  // const leftAlignColumns = [
  //   "ACTION",
  //   "UTRN NO",
  //   "FRANCHISEE NAME",
  //   "ADJUSTED BY",
  //   "REASON",
  // ];

  // const centerAlignColumns = [
  //   "ADJUSTED DATE",
  // ];

  // const rightAlignColumns = [
  //   "PREV AVAILABLE AMOUNT",
  //   "PREV RECHARGE AMOUNT",
  //   "MODIFIED AVAILABLE AMOUNT",
  //   "MODIFIED RECHARGE AMOUNT",
  // ];

  // --- Find column indexes ---
  const leftCols: number[] = [];
  const centerCols: number[] = [];
  const rightCols: number[] = [];

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
    if (!headerCell || !headerCell.v) continue;

    const header = String(headerCell.v).trim();

    if (leftAlignColumns.includes(header)) leftCols.push(C);
    if (centerAlignColumns.includes(header)) centerCols.push(C);
    if (rightAlignColumns.includes(header)) rightCols.push(C);
  }

  // --- Apply Alignment + Header Styling ---
  Object.keys(worksheet).forEach((cellAddress) => {
    if (cellAddress.startsWith("!")) return;

    const cell = worksheet[cellAddress];
    if (!cell || cell.v === undefined) return;

    const { r, c } = XLSX.utils.decode_cell(cellAddress);
    const isHeader = r === 0;

    let alignment: "left" | "center" | "right" = "left";

    if (centerCols.includes(c)) alignment = "center";
    else if (rightCols.includes(c)) alignment = "right";
    else if (leftCols.includes(c)) alignment = "left";

    cell.s = {
      alignment: {
        horizontal: alignment,
        vertical: "center",
      },
      font: {
        bold: isHeader,
      },
    };
  });

  // --- Auto Column Width ---
  const colWidths: number[] = [];

  Object.keys(worksheet).forEach((cellAddress) => {
    if (cellAddress.startsWith("!")) return;

    const cell = worksheet[cellAddress];
    if (!cell || cell.v == null) return;

    const col = XLSX.utils.decode_cell(cellAddress).c;
    const cellLength = String(cell.v)?.length;

    colWidths[col] = Math.max(colWidths[col] || 10, cellLength + 3);
  });

  worksheet["!cols"] = colWidths.map((w) => ({ wch: w }));

  // --- Workbook ---
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // --- Filename ---
  const getTodayFileName = (name: string) => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");

    const monthNames = [
      "JAN","FEB","MAR","APR","MAY","JUN",
      "JUL","AUG","SEP","OCT","NOV","DEC",
    ];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();

    const cleanName = name.replace(/\.xlsx$/i, "");
    return `${cleanName}_${day} ${month} ${year}.xlsx`;
  };

  XLSX.writeFile(workbook, getTodayFileName(fileName));
};



