import { unparse } from "papaparse";

export const isValidHsn = (inputString: string) => {
  const invalidStrings = [
    "00000000",
    "11111111",
    "22222222",
    "33333333",
    "44444444",
    "55555555",
    "66666666",
    "77777777",
    "88888888",
    "99999999",
    "01234567",
    "12345678",
    "23456789",
    "34567890",
    "45678901",
    "56789012",
    "67890123",
    "78901234",
    "89012345",
    "90123456",
  ];

  if (inputString.length >= 6) {
    if (/^[0-9]+$/.test(inputString)) {
      if (invalidStrings.includes(inputString)) {
        // console.log("Invalid HSN Code");
        return false;
      } else {
        // console.log("Valid HSN Code");
        return true;
      }
    } else {
      // console.log("Invalid HSN Code");
      return false;
    }
  } else {
    // console.log("Invalid HSN Code");
    return false;
  }
};

export const disableSymbols = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const prohibitedSymbols = /[,.\/\\|'"`;:{}[\]()*&^%$?#@!`~+=<>_-]/;

  if (
    !e.ctrlKey &&
    !e.altKey &&
    !e.metaKey &&
    e.key.length === 1 &&
    prohibitedSymbols.test(e.key)
  ) {
    e.preventDefault();
  }
};

export const formatDate = (dateString: any) => {
  if (!dateString) {
    return "-";
  }
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", options);
};

export const formatDateWithoutTime = (dateString: any) => {
  if (!dateString) {
    return "-";
  }
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", options);
};

export const onlyNumbers = (e: KeyboardEvent) => {
  const prohibitedSymbolsAndLetters =
    /[a-zA-Z,.\/\\|'"`;:{}[\]()*&^%$?#@!`~+=<>_-]/;
  if (
    !e.ctrlKey &&
    !e.altKey &&
    !e.metaKey &&
    e.key.length === 1 &&
    prohibitedSymbolsAndLetters.test(e.key)
  ) {
    e.preventDefault();
  }
};

export const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;

  return `${year}-${month}-${day}`;
};

export const convertJSONtoCSV = async (data: any = [], fileName: string) => {
  try {
    const csv = unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${fileName}` + " " + getCurrentDate();
    document.body.appendChild(link);
    link.click();
    document.removeChild(link);
  } catch (error: any) {
    console.log(error.message);
  }
};

export const handlePaste = (value: any, e: any, maxLength: any) => {
  const pastedData = value + e.clipboardData.getData("Text");
  const totalLength = pastedData.length;

  if (totalLength > maxLength) {
    e.preventDefault();
    return pastedData.slice(0, maxLength);
  }

  return pastedData;
};

export function indianFormat(number?: any) {
  const [integerPart, decimalPart] = Number(number).toFixed(2).split(".");
  const lastThreeDigits = integerPart.slice(-3);
  const otherDigits = integerPart.slice(0, -3);
  const formattedInteger =
    otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
    (otherDigits ? "," : "") +
    lastThreeDigits;
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

export function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[today.getMonth()];
  const day = String(today.getDate()).padStart(2, "0");

  return `${day}-${month}-${year}`;
}

export function downloadAttachment(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = `${url}?${Math.random()}`;
  anchor.download = filename;
  anchor.target = "_blank";
  anchor.click();
  anchor.remove();
}

export function formatIndianNumber(number?: any) {
  const [integerPart, decimalPart] = number.toFixed(2).split(".");
  const lastThreeDigits = integerPart.slice(-3);
  const otherDigits = integerPart.slice(0, -3);

  const formattedInteger =
    otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
    (otherDigits ? "," : "") +
    lastThreeDigits;

  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

export const checkisEmpty = (obj: any) => {
  return Object.values(obj).every(
    (value) =>
      value === "" ||
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" &&
        value !== null &&
        Object.keys(value).length === 0)
  );
};

export const get90DaysBeforeDate = () => {
  const today = new Date();
  const before90Days = new Date(today);
  before90Days.setDate(today.getDate() - 90);

  const year = before90Days.getFullYear();
  let month = before90Days.getMonth() + 1;
  let day = before90Days.getDate();

  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;

  return `${year}-${month}-${day}`;
};

export function foreignFormat(number?: any) {
  const [integerPart, decimalPart] = Number(number)?.toFixed(2)?.split(".");
  const formattedInteger = integerPart?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger
}



export const getCourierMaxLength = (courierCode: any) => {
  if (!courierCode) return 60;

  if (courierCode.includes("dhl")) return 45;
  if (courierCode.includes("widect")) return 40;
  if (courierCode.includes("fedex")) return 35;

  return 60;
};


type HandleConditionalPasteParams = {
  key: string;
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
  event: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>;
  courierCode?: string;
};

export const handleConditionalPaste = ({
  key,
  state,
  setState,
  event,
  courierCode,
}: HandleConditionalPasteParams) => {
  if (!courierCode) return;

  let maxLength = 60;

  if (courierCode.includes("dhl")) {
    maxLength = 45;
  } else if (courierCode.includes("widect")) {
    maxLength = 40;
  } else if (courierCode.includes("fedex")) {
    maxLength = 35;
  }

  event.preventDefault();

  const data = handlePaste(state?.[key], event, maxLength);

  setState((prev: any) => ({
    ...prev,
    [key]: data,
  }));
};