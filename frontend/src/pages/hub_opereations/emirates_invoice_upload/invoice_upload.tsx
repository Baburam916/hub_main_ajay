import { useState, useRef, useCallback } from "react";
import {
  Info,
  Package,
  FileUp,
  X,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package2,
} from "lucide-react";
import { Fragment } from "react";
import { Upload_Emirates_Invoice } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";

const ACCEPTED_TYPES = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/jpg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
};

// ─── Detail field ─────────────────────────────────────────────────────────────
function DetailField({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1">
        {label}
      </p>
      <div className="text-sm font-semibold text-slate-800 leading-snug">
        {children}
      </div>
    </div>
  );
}

// ─── Booking Details card ─────────────────────────────────────────────────────
function BookingDetails({ awb }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Info size={13} className="text-amber-500" />
        </span>
        <span className="font-semibold text-slate-800 text-sm">
          Booking Details
        </span>
      </div>
      <div className="px-5 py-4 grid grid-cols-3 gap-x-6 gap-y-4">
        <DetailField label="Origin">
          {awb?.pickup_data?.origin_city} , {awb?.pickup_data?.origin_state}
        </DetailField>
        <DetailField label="Destination">
          {awb?.pickup_data?.city} , {awb?.pickup_data?.destination_country}
        </DetailField>
        <DetailField label="Service Type">
          <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-0.5 mt-0.5">
            {awb?.pickup_data?.booking_shipment_type_id == 1
              ? "Parcel / Sample"
              : ""}
          </span>
        </DetailField>
        <DetailField label="Shipper">
          <div>{awb?.shipper_data?.[0]?.shipper_name}</div>
          <div className="text-xs font-normal text-slate-400 mt-0.5">
            {awb?.shipper_data?.[0]?.gst_registered_address}
          </div>
        </DetailField>
        <DetailField label="Consignee">
          <div>{awb?.consignee_data?.[0]?.first_name}</div>
          <div className="text-xs font-normal text-slate-400 mt-0.5">
            {awb?.consignee_data?.[0]?.address1}
          </div>
        </DetailField>
      </div>
    </div>
  );
}


function ShipmentDetails({ awb }) {
  // Use shipment_dimensions if available, fallback to pickup_item
  const items = awb?.pickup_item || [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Package2 size={13} className="text-amber-500" />
          </span>
          <span className="font-semibold text-slate-800 text-sm">
            Shipment Details
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {items?.length} Item(s) Total
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-amber-400">
              {[
                { label: "Box", cls: "text-left w-24" },
                { label: "Dimensions\n(L/B/H)", cls: "text-left w-36" },
                { label: "Sr No.", cls: "text-left w-16" },
                { label: "Description", cls: "text-left" },
                { label: "HSN Code", cls: "text-left" },
                { label: "Unit Value (₹)", cls: "text-left" },
                { label: "Quantity", cls: "text-left" },
                { label: "Rate (₹)", cls: "text-left" },
              ]?.map(({ label, cls }) => (
                <th
                  key={label}
                  className={`px-4 py-3 text-[11px] font-semibold tracking-wide text-white whitespace-pre-line ${cls}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items?.map((item, itemIdx) => {
              const commodities = item?.commodity || [];

              // Calculate total for this specific box
              const commodityTotal = commodities?.reduce(
                (s, c) => s + Number(c?.invoice_value || 0) * Number(c?.quantity || 0),
                0
              );

              return (
                // Using Fragment to group commodity rows + total row
                <Fragment key={itemIdx}>
                  {/* Loop through commodities inside this box */}
                  {commodities?.map((commodity, comIdx) => (
                    <tr
                      key={`${itemIdx}-${comIdx}`}
                      className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Box name — only on first commodity row, spans all commodity rows + total row */}
                      {comIdx === 0 && (
                        <td
                          rowSpan={commodities?.length + 1}
                          className="px-4 py-3 text-xs font-bold text-slate-800 align-top border-r border-slate-100"
                        >
                          {item?.item_description}
                        </td>
                      )}

                      {/* Dimensions — only on first commodity row, spans only commodity rows */}
                      {comIdx === 0 && (
                        <td
                          rowSpan={commodities?.length}
                          className="px-4 py-3 text-xs text-slate-600 align-middle border-r border-slate-100 whitespace-nowrap"
                        >
                          {Number(item?.length).toFixed(0)} x{" "}
                          {Number(item?.breadth).toFixed(0)} x{" "}
                          {Number(item?.height).toFixed(0)}
                        </td>
                      )}

                      {/* Sr No. */}
                      <td className="px-4 py-3 text-xs text-slate-500 text-center">
                        {comIdx + 1}.
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3">
                        <span className="inline-block text-xs text-slate-700 rounded px-2 py-1 bg-white min-w-[80px]">
                          {commodity?.description}
                        </span>
                      </td>

                      {/* HSN Code */}
                      <td className="px-4 py-3">
                        <span className="inline-block text-xs text-slate-700 rounded px-2 py-1 bg-white font-mono min-w-[80px]">
                          {commodity?.hsn_code}
                        </span>
                      </td>

                      {/* Unit Value */}
                      <td className="px-4 py-3">
                        <span className="inline-block text-xs text-slate-700 rounded px-2 py-1 bg-white min-w-[60px]">
                          {Number(commodity?.invoice_value).toFixed(1)}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3">
                        <span className="inline-block text-xs text-slate-700 rounded px-2 py-1 bg-white min-w-[40px] text-center">
                          {Number(commodity?.quantity)}
                        </span>
                      </td>

                      {/* Rate (Value * Qty) */}
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                        ₹{" "}
                        {(
                          Number(commodity?.invoice_value) * Number(commodity?.quantity)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* Total row per box */}
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    {/* Empty cells to align with Sr No, Desc, HSN, Unit Val, Qty */}
                    <td
                      colSpan={6}
                      className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500"
                    >
                      Total
                    </td>
                    {/* Total Value */}
                    <td className="px-4 py-2.5 text-xs font-bold text-amber-500">
                      ₹ {commodityTotal.toFixed(2)}
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ─── File row ─────────────────────────────────────────────────────────────────
function FileRow({ file, onRemove, uploading }) {
  const display =
    file.size > 1024 * 1024
      ? `${file.size / 1024 / 1024} MB`
      : `${file.size / 1024} KB`;

  return (
    <div className="flex items-center gap-3 border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
      <div className="w-8 h-9 rounded-md flex items-center justify-center bg-red-500 flex-shrink-0">
        <span className="text-white text-[9px] font-bold tracking-wide">
          {file?.name?.split(".")?.pop()?.toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">
          {file?.name}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">{display}</p>
      </div>
      <button
        onClick={() => onRemove()}
        disabled={uploading}
        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
        aria-label="Remove"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Invoice Verification panel ───────────────────────────────────────────────
function InvoicePanel({ awb, setShowUpload, setAwbNo }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef(null);
  const { showAlert } = useAlert();

  const validateAndAdd = useCallback((incoming) => {
    setError("");
    const f = incoming[0];
    if (!f) return;
    if (!ACCEPTED_TYPES[f.type]) {
      setError(`"${f.name}" is not a supported format. Use PDF, JPEG, or PNG.`);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError(`"${f.name}" exceeds the 10 MB limit.`);
      return;
    }
    setFiles([f]);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      validateAndAdd([e.dataTransfer.files[0]]);
    },
    [validateAndAdd],
  );

  const removeFile = () => setFiles([]);

  const handleUpload = async () => {
    if (!files?.length) {
      setError("Please select a file to upload.");
      return;
    }

    if (!awb?.pickup_data?.airwaybilno) {
      setError("Airway bill number is missing.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("airwaybilno", awb?.pickup_data?.airwaybilno);
      formData.append("shipper_invoice", files[0]);

      const response = await Upload_Emirates_Invoice(formData);

      const { status, data } = response;

      switch (status) {
        case 200:
        case 201:
          setUploaded(true);
          showAlert(data?.message || "File uploaded successfully.", "success");
          break;

        case 400:
          setError(data?.message || "Bad request.");
          break;

        case 401:
          setError("Unauthorized. Please login again.");
          break;

        case 403:
          setError("Permission denied.");
          break;

        case 404:
          setError("API not found.");
          break;

        case 413:
          setError("File too large.");
          break;

        case 422:
          setError(data?.message || "Validation error.");
          break;

        case 500:
          setError("Server error. Please try later.");
          break;

        default:
          setError("Unexpected error occurred.");
      }
    } catch (error) {
      // This will now only catch network errors
      console.error("Network error:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setUploading(false);
    }
  };

  if (uploaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-green-500" />
        </div>
        <div>
          <p className="font-semibold text-green-400 text-sm">
            Upload Complete
          </p>
          <p className="text-xs text-green-500 mt-1">
            Invoice submitted successfully.
          </p>
        </div>
        <button
          onClick={() => {
            setShowUpload(false);
            setAwbNo("");
            setUploaded(false);
            setFiles([]);
            setError("");
          }}
          className="text-base text-mustard underline underline-offset-2"
        >
          Upload more
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <FileUp size={13} className="text-amber-500" />
        </span>
        <span className="font-semibold text-slate-800 text-sm">
          Invoice Verification
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed -mt-1">
        Verify physical invoice details against digital records. Upload the
        document to initiate OCR verification.
      </p>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 py-8 px-4 ${isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/80"
          }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            validateAndAdd([e.target.files[0]]);
            e.target.value = "";
          }}
        />
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-3">
          <FileUp size={22} className="text-amber-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {isDragging ? "Release to drop" : "Drag and drop invoice here"}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          PDF, JPG, or PNG up to 10MB
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-600">
          <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Selected file
            </span>
            <button
              onClick={() => setFiles([])}
              disabled={uploading}
              className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto">
            {files?.map((f) => (
              <FileRow key={f.name} file={f} onRemove={removeFile} uploading={uploading} />
            ))}
          </div>
        </div>
      )}

      {/* CTA button */}
      <button
        onClick={handleUpload}
        disabled={!files.length || uploading}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 ${files.length && !uploading
            ? "bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white shadow-md shadow-amber-100"
            : "bg-slate-100 text-slate-300 cursor-not-allowed"
          }`}
      >
        {uploading ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 1 1-6.219-8.56"
              />
            </svg>
            Uploading…
          </>
        ) : (
          <>
            <Upload size={16} />
            Upload Invoice
          </>
        )}
      </button>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function InvoiceUpload({ awbData, setShowUpload, setAwbNo }) {
  const awb = awbData || {};

  const handleClose = () => {
    if (setShowUpload) setShowUpload(false);
    if (setAwbNo) setAwbNo("");
  };

  return (
    <div className="max-w-8xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-4">
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            Verify Shipment Details
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
            AWB - {awb?.pickup_data?.airwaybilno}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors mt-0.5"
        >
          <X size={15} />
          <span className="font-medium">Close</span>
        </button>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex flex-col lg:flex-row">
        {/* Left – booking + shipment */}
        <div className="flex-1 p-5 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-100 min-w-0">
          <BookingDetails awb={awb} />
          <ShipmentDetails awb={awb} />
        </div>

        {/* Right – invoice verification */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 p-5">
          <InvoicePanel
            awb={awb}
            setShowUpload={setShowUpload}
            setAwbNo={setAwbNo}
          />
        </div>
      </div>
    </div>
  );
}
