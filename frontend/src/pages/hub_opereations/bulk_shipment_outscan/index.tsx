import { useState, useRef } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { useAlert } from "../../../ContextProvider/AlertContext";
import { Bulk_shipment_outscan } from "../../../AllServices/services";
import CsvDownloader from "react-csv-downloader";
import { Upload } from "lucide-react";

const BulkShipmentOutscan = () => {
  const { showAlert } = useAlert();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadFailedCsv = (failed: string[]) => {
    const rows = ["Airwaybill_no", ...failed].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "failed_shipments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetInput = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) {
      showAlert("Please select a file.", "warning");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await Bulk_shipment_outscan(formData);
      if (response?.status === 200) {
        const failed: string[] = response.data.data || [];
        showAlert(response.data.message, "success");
        if (failed.length > 0) downloadFailedCsv(failed);
        resetInput();
      } else {
        showAlert(
          response?.data?.message || "Something went wrong!",
          "warning",
        );
      }
    } catch (error) {
      showAlert("Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 px-6 py-5 bg-white rounded-lg shadow-lg">
      <h1 className="font-bold text-lg mb-1">Bulk Shipment Outscan</h1>
      <p className="text-sm text-gray-500 mb-4">
        Upload a CSV file with airwaybill numbers to bulk outscan shipments.
      </p>
      <hr className="mb-4" />

      <div className="flex flex-col gap-4 max-w-sm">
        <div>
          <FormLabel>Upload File</FormLabel>
          <FormInput
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            disabled={loading || !file}
            className="bg-mustard border-none py-1 px-4 text-white rounded-xl flex items-center gap-1"
            onClick={handleSubmit}
          >
            <Upload size={14} />
            Submit {loading && <LoadingIcon icon="puff" className="ml-2" />}
          </Button>

          <CsvDownloader
            filename="bulk_shipment_template"
            extension=".csv"
            datas={[{ Airwaybill_no: "" }]}
            text="Download Template"
            style={{
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              padding: "4px 12px",
              borderRadius: "8px",
              background: "#1976d2",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BulkShipmentOutscan;
