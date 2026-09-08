import { useState } from "react";
import { FormInput, FormLabel } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import { Add_courier_stock } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import CsvDownloader from "react-csv-downloader";
import LoadingIcon from "../../../base-components/LoadingIcon";
import {
  X,
  Plus,
  Hash,
  Save,
  FileText,
  FileDown,
  UploadCloud,
  ListPlus,
  CalendarDays,
} from "lucide-react";

type Mode = "file" | "manual";

const courier_form = (data: any) => {
  const { hub_id, getCourierStockList, setShowCourierStockForm } = data;
  const { showAlert } = useAlert();
  const [mode, setMode] = useState<Mode>("file");
  const [date, setDate] = useState<any>(null);
  const [upload, setUpload] = useState<any>(null);
  const [airwaybillInput, setAirwaybillInput] = useState<string>("");
  const [airwaybillChips, setAirwaybillChips] = useState<Array<string>>([]);
  const [spinner, setSpinner] = useState<boolean>(false);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setUpload(null);
    setAirwaybillInput("");
    setAirwaybillChips([]);
  };

  const addChip = () => {
    const value = airwaybillInput.trim();
    if (!value) return;
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      showAlert(
        "Airwaybill no. can only contain alphabets and numbers!",
        "warning"
      );
      return;
    }
    if (value.length > 30) {
      showAlert("Airwaybill no. cannot exceed 30 characters!", "warning");
      return;
    }
    if (airwaybillChips.includes(value)) {
      showAlert("Airwaybill no. already added!", "warning");
      setAirwaybillInput("");
      return;
    }
    setAirwaybillChips([...airwaybillChips, value]);
    setAirwaybillInput("");
  };

  const removeChip = (value: string) => {
    setAirwaybillChips(airwaybillChips.filter((chip) => chip !== value));
  };

  const handleAirwaybillInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAirwaybillInput(
      e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30)
    );
  };

  const handleAirwaybillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addChip();
    }
  };

  const addCourierStock = async () => {
    if (mode === "file" && !upload) {
      showAlert("Please choose a file to upload!", "warning");
      return;
    }
    if (mode === "manual" && airwaybillChips.length === 0) {
      showAlert("Please add at least one airwaybill no.!", "warning");
      return;
    }

    setSpinner(true);
    try {
      let response;
      if (mode === "file") {
        const formData = new FormData();
        formData.append("date", date);
        formData.append("file", upload);
        response = await Add_courier_stock(hub_id, formData);
      } else {
        response = await Add_courier_stock(hub_id, {
          date,
          airwaybill_no_list: airwaybillChips,
        });
      }

      if (response.status == 201) {
        showAlert(response.data.message, "success");
        setShowCourierStockForm(false);
        getCourierStockList();
        setDate(null);
        setUpload(null);
        setAirwaybillChips([]);
        setAirwaybillInput("");
      } else showAlert(response.data.message, "warning");
    } catch (error) {
      if (error) showAlert("Something went wrong!", "error");
    } finally {
      setSpinner(false);
    }
  };

  return (
    <div className="mt-4 max-w-3xl space-y-6">
      <div className="w-full sm:w-64">
        <FormLabel className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-slate-600">
          <CalendarDays className="w-4 h-4 text-slate-400" />
          Date
        </FormLabel>
        <FormInput
          type="date"
          className="w-full rounded-xl"
          value={date || ""}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-600 mb-2">
          Choose how you want to add stock
        </p>
        <div className="grid grid-cols-2 sm:inline-grid sm:grid-cols-2 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => switchMode("file")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              mode === "file"
                ? "bg-white text-slate-800 shadow"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <UploadCloud className="w-4 h-4 shrink-0" />
            Upload CSV
          </button>
          <button
            type="button"
            onClick={() => switchMode("manual")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              mode === "manual"
                ? "bg-white text-slate-800 shadow"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ListPlus className="w-4 h-4 shrink-0" />
            Add Manually
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div className="p-4 sm:p-6 border border-slate-200 rounded-2xl bg-slate-50">
          <FormLabel className="flex items-center gap-1.5 mb-3 text-sm font-medium text-slate-600">
            <FileText className="w-4 h-4 text-slate-400" />
            Upload CSV File
          </FormLabel>
          <label className="relative flex flex-col items-center justify-center gap-2 w-full sm:w-96 border-2 border-dashed border-slate-300 rounded-2xl py-8 px-4 bg-white hover:border-mustard hover:bg-mustard/5 transition-colors cursor-pointer">
            <div className="p-3 rounded-full bg-mustard bg-opacity-10 text-mustard">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-600 text-center">
              <span className="font-semibold text-mustard">
                Click to upload
              </span>{" "}
              a CSV file
            </p>
            {upload ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full max-w-full">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{upload.name}</span>
                <X
                  className="w-3.5 h-3.5 shrink-0 hover:text-red-500"
                  onClick={(e) => {
                    e.preventDefault();
                    setUpload(null);
                  }}
                />
              </span>
            ) : (
              <span className="text-xs text-slate-400">No file chosen</span>
            )}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) =>
                setUpload(e.target.files ? e.target.files[0] : null)
              }
            />
          </label>
        </div>
      ) : (
        <div className="p-4 sm:p-6 border border-slate-200 rounded-2xl bg-slate-50">
          <div className="flex items-center justify-between mb-1.5">
            <FormLabel className="flex items-center gap-1.5 mb-0 text-sm font-medium text-slate-600">
              <Hash className="w-4 h-4 text-slate-400" />
              Airwaybill No.
            </FormLabel>
            {airwaybillChips.length > 0 && (
              <span className="text-xs font-semibold text-mustard bg-mustard bg-opacity-10 px-2.5 py-1 rounded-full">
                {airwaybillChips.length} added
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <FormInput
              type="text"
              placeholder="Type an airwaybill no. and press Enter"
              className="w-full rounded-xl bg-white"
              value={airwaybillInput}
              maxLength={30}
              onChange={handleAirwaybillInputChange}
              onKeyDown={handleAirwaybillKeyDown}
            />
            <button
              type="button"
              onClick={addChip}
              className="shrink-0 flex items-center justify-center w-10 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Alphabets and numbers only, up to 30 characters.
          </p>
          {airwaybillChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {airwaybillChips.map((chip) => (
                <span
                  key={chip}
                  className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-mustard bg-opacity-10 text-mustard border border-mustard text-sm font-medium"
                >
                  <Hash className="w-3 h-3 opacity-60" />
                  {chip}
                  <button
                    type="button"
                    onClick={() => removeChip(chip)}
                    className="p-0.5 rounded-full hover:bg-mustard hover:bg-opacity-20"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
        <Button
          disabled={spinner}
          className="flex items-center justify-center gap-2 bg-mustard border-none py-1.5 px-5 text-white rounded-xl w-full sm:w-auto"
          onClick={() => addCourierStock()}
        >
          {spinner ? <LoadingIcon icon="puff" className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
        {mode === "file" && (
          <CsvDownloader
            filename="CourierStock"
            extension=".csv"
            datas={[
              {
                Airwaybill_no: "",
              },
            ]}
            className="w-full sm:w-auto"
            style={{
              color: "#fff",
              alignItems: "center",
              display: "inline-flex",
              justifyContent: "center",
              gap: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              lineHeight: "1.75",
              letterSpacing: "0.02857em",
              padding: "6px 14px",
              borderRadius: "12px",
              background: "#1976d2",
            }}
          >
            <FileDown className="w-4 h-4" />
            Download Dummy CSV
          </CsvDownloader>
        )}
      </div>
    </div>
  );
};

export default courier_form;
