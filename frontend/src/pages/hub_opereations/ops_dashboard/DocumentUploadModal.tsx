import React, { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import Modal from "../../../components/Modal";
import { common_get, getLocalPincodeApi, getPincodeApi } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const UPLOAD_API =
    "https://n8n.srv965283.hstgr.cloud/webhook/6e171586-10c6-4b2d-a27b-741fb7f90ef8";


// ── Deep immutable set ────────────────────────────────────────────────────────
const deepSet = (obj: any, path: (string | number)[], value: any): any => {
    if (path.length === 0) return value;
    const [head, ...rest] = path;
    if (typeof head === "number") {
        const arr = Array.isArray(obj) ? [...obj] : [];
        arr[head] = deepSet(arr[head], rest, value);
        return arr;
    }
    return {
        ...obj,
        [head as string]: deepSet(obj?.[head as string], rest, value),
    };
};

// ── Value type detection ──────────────────────────────────────────────────────
type ValueType =
    | "primitive"
    | "object"
    | "array-of-objects"
    | "array-of-primitives";

const getValueType = (value: any): ValueType => {
    if (value === null || typeof value !== "object") return "primitive";
    if (Array.isArray(value)) {
        if (value.length === 0) return "array-of-primitives";
        if (typeof value[0] === "object" && value[0] !== null)
            return "array-of-objects";
        return "array-of-primitives";
    }
    return "object";
};

const COLUMN_FIRST = ["box_no"];

const getArrayKeys = (arr: Record<string, any>[]): string[] => {
    const keys = new Set<string>();
    arr.forEach((item) => Object.keys(item).forEach((k) => keys.add(k)));
    const allKeys = Array.from(keys);
    const priority = COLUMN_FIRST.filter((k) => keys.has(k));
    const rest = allKeys.filter((k) => !COLUMN_FIRST.includes(k));
    return [...priority, ...rest];
};

const FIELD_LABEL_OVERRIDES: Record<string, string> = {
    quantity: "No. of pieces",
};

const formatLabel = (key: string) =>
    FIELD_LABEL_OVERRIDES[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const inputCls =
    "w-full border border-slate-200 rounded-md px-2 py-1.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white";

// ── Chevron ───────────────────────────────────────────────────────────────────
const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
    <svg
        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
        />
    </svg>
);

// ── Sub-editors ───────────────────────────────────────────────────────────────
interface EditorProps {
    path: (string | number)[];
    value: any;
    onChange: (path: (string | number)[], value: any) => void;
}

const PrimitiveInput: React.FC<{
    value: any;
    onChange: (v: string) => void;
    maxLength?: number;
}> = ({ value, onChange, maxLength }) => (
    <input
        type="text"
        maxLength={maxLength}
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
    />
);

// Collapsible object editor — stacked on mobile, side-by-side on sm+
const ValidationContext = React.createContext<Set<string>>(new Set());
const MobileConstraintContext = React.createContext<{ consignerMax: number; consigneeMax: number }>({ consignerMax: 15, consigneeMax: 15 });
const RequiredFieldsContext = React.createContext<Set<string>>(new Set());

const SHIPPER_REQUIRED = new Set(["consigner_address_1", "consigner_address_2", "consigner_city"]);

const MOBILE_FIELDS = new Set(["consigner_mobile_numer", "consignee_mobile_numer"]);

const ObjectEditor: React.FC<EditorProps> = ({ path, value, onChange }) => {
    const errors = React.useContext(ValidationContext);
    const mobileConstraints = React.useContext(MobileConstraintContext);
    const requiredFields = React.useContext(RequiredFieldsContext);
    const entries = Object.entries(value as Record<string, any>);
    const hasErrors = entries.some(([k]) => errors.has([...path, k].join(".")));
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (hasErrors) setOpen(true);
    }, [hasErrors]);

    const getMobileMax = (k: string): number | undefined => {
        if (k === "consigner_mobile_numer") return mobileConstraints.consignerMax;
        if (k === "consignee_mobile_numer") return mobileConstraints.consigneeMax;
        return undefined;
    };

    return (
        <div className={`w-full border rounded-lg overflow-hidden bg-white ${hasErrors ? "border-red-300" : "border-slate-200"}`}>
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-600"
            >
                <span className="flex items-center gap-2">
                    {open
                        ? "Hide fields"
                        : `Show ${entries.length} field${entries.length !== 1 ? "s" : ""}`}
                    {hasErrors && <span className="text-red-500">• Required fields missing</span>}
                </span>
                <Chevron open={open} />
            </button>
            {open && (
                <div className="divide-y divide-slate-100">
                    {entries.map(([k, v], idx) => {
                        const fieldPath = [...path, k].join(".");
                        const hasError = errors.has(fieldPath);
                        const mobileMax = getMobileMax(k);
                        const mobileExceeded = mobileMax !== undefined && String(v ?? "").length > mobileMax;
                        return (
                            <div
                                key={k}
                                className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 px-3 py-2 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
                            >
                                <span className={`text-xs font-semibold sm:w-[200px] sm:min-w-[200px] sm:pt-1.5 whitespace-nowrap ${hasError || mobileExceeded ? "text-red-500" : "text-slate-500"}`}>
                                    {formatLabel(k)} :{(requiredFields.has(k) || hasError || mobileExceeded) && <span className={`ml-1 ${hasError || mobileExceeded ? "" : "text-red-500"}`}>*</span>}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className={hasError || mobileExceeded ? "ring-1 ring-red-400 rounded-md" : ""}>
                                        {k.endsWith("_country") ? (
                                            <CountryDropdown
                                                value={v}
                                                onChange={(val) => onChange([...path, k], val)}
                                            />
                                        ) : (
                                            <FieldEditor
                                                path={[...path, k]}
                                                value={v}
                                                onChange={onChange}
                                                maxLength={mobileMax}
                                            />
                                        )}
                                    </div>
                                    {hasError && !mobileExceeded && <p className="text-red-400 text-[10px] mt-0.5">Required</p>}
                                    {mobileExceeded && <p className="text-red-400 text-[10px] mt-0.5">Max {mobileMax} digits</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const DATE_FIELDS = new Set(["booking_invoice_date"]);
const NUMERIC_FIELDS = new Set(["weight", "value", "length", "breadth", "height", "hsncode", "hsn_code", "quantity", "box_no"]);
const SHIPMENT_TYPE_ALLOWED: Record<number, number[]> = {
    1: [1, 2, 4, 5, 6, 7],
    2: [1, 2, 4, 5],
};
const INTEGER_FIELDS = new Set(["quantity", "hsncode", "hsn_code", "box_no"]);
const TWO_DECIMAL_FIELDS = new Set(["weight", "value", "length", "breadth", "height"]);
const HSN_FIELDS = new Set(["hsncode", "hsn_code"]);
const QUANTITY_FIELDS = new Set(["quantity"]);

// Max digits allowed in the integer part
const MAX_INT_DIGITS: Record<string, number> = {
    weight: 7,
    value: 10,
    length: 6,
    breadth: 6,
    height: 6,
    quantity: 5,
    box_no: 5,
};

// HTML maxLength: decimal fields get integer digits + "." + 2; integer fields get integer digits only
const getMaxLength = (k: string): number | undefined => {
    if (HSN_FIELDS.has(k)) return 10;
    if (TWO_DECIMAL_FIELDS.has(k) && MAX_INT_DIGITS[k] !== undefined) return MAX_INT_DIGITS[k] + 3;
    if (MAX_INT_DIGITS[k] !== undefined) return MAX_INT_DIGITS[k];
    return undefined;
};

const filterNumericInput = (val: string, integerOnly: boolean, twoDecimal?: boolean, maxIntDigits?: number): string => {
    if (integerOnly) {
        const parsed = parseFloat(val);
        const intStr = !isNaN(parsed) ? String(Math.trunc(parsed)) : val.replace(/[^0-9]/g, "");
        return maxIntDigits !== undefined ? intStr.slice(0, maxIntDigits) : intStr;
    }
    const cleaned = val.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    let integer = parts[0];
    if (maxIntDigits !== undefined) integer = integer.slice(0, maxIntDigits);
    const decimal = parts.slice(1).join("");
    if (parts.length === 1) return integer;
    return integer + "." + (twoDecimal ? decimal.slice(0, 2) : decimal);
};

const sanitizeShipmentDimensions = (rows: any[]): any[] =>
    rows.map((row) =>
        Object.fromEntries(
            Object.entries(row).map(([k, v]) => [
                k,
                NUMERIC_FIELDS.has(k) ? filterNumericInput(String(v ?? ""), INTEGER_FIELDS.has(k), TWO_DECIMAL_FIELDS.has(k), MAX_INT_DIGITS[k]) : v,
            ])
        )
    );

// Collapsible array-of-objects — accordion with horizontally scrollable table
const ArrayOfObjectsEditor: React.FC<EditorProps> = ({
    path,
    value,
    onChange,
}) => {
    const errors = React.useContext(ValidationContext);
    const [open, setOpen] = useState(false);
    const arr = value as Record<string, any>[];
    const keys = getArrayKeys(arr);

    const hasErrors = arr.some((_, rowIdx) =>
        keys.some((k) => errors.has([...path, rowIdx, k].join(".")))
    );

    useEffect(() => {
        if (hasErrors) setOpen(true);
    }, [hasErrors]);

    const addRow = () => {
        const newRow = Object.fromEntries(keys.map((k) => [k, ""]));
        onChange(path, [...arr, newRow]);
    };

    const removeRow = (idx: number) => {
        onChange(
            path,
            arr.filter((_, i) => i !== idx),
        );
    };

    return (
        <div className={`w-full border rounded-lg overflow-hidden ${hasErrors ? "border-red-300" : "border-slate-200"}`}>
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-600"
            >
                <span className="flex items-center gap-2">
                    {arr.length} item{arr.length !== 1 ? "s" : ""}
                    {hasErrors && <span className="text-red-500">• Required fields missing</span>}
                </span>
                <Chevron open={open} />
            </button>
            {open && (
                <>
                    <div className="w-full overflow-x-auto">
                        <table className="text-xs w-max min-w-full">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="px-2 py-2 text-center font-semibold text-slate-500 border-b border-slate-200 w-8">
                                        #
                                    </th>
                                    {keys.map((k) => (
                                        <th
                                            key={k}
                                            className="px-2 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 whitespace-nowrap"
                                        >
                                            {formatLabel(k)}
                                        </th>
                                    ))}
                                    <th className="px-2 py-2 border-b border-slate-200 w-8" />
                                </tr>
                            </thead>
                            <tbody>
                                {arr.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        className={rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                                    >
                                        <td className="px-2 py-1.5 border-b border-slate-100 text-center text-slate-400 font-medium">
                                            {rowIdx + 1}
                                        </td>
                                        {keys.map((k) => (
                                            <td
                                                key={k}
                                                className="px-2 py-1 border-b border-slate-100"
                                            >
                                                <input
                                                    type="text"
                                                    inputMode={NUMERIC_FIELDS.has(k) ? "decimal" : "text"}
                                                    value={
                                                        row[k] === null || row[k] === undefined
                                                            ? ""
                                                            : String(row[k])
                                                    }
                                                    maxLength={getMaxLength(k)}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        const filtered = NUMERIC_FIELDS.has(k)
                                                            ? filterNumericInput(raw, INTEGER_FIELDS.has(k), TWO_DECIMAL_FIELDS.has(k), MAX_INT_DIGITS[k])
                                                            : raw;
                                                        onChange([...path, rowIdx, k], filtered);
                                                    }}
                                                    className={`w-full min-w-[80px] border rounded px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white ${(HSN_FIELDS.has(k) && String(row[k] ?? "").length > 0 && (String(row[k] ?? "").length < 6 || String(row[k] ?? "").length > 10)) ||
                                                        (QUANTITY_FIELDS.has(k) && String(row[k] ?? "").length > 0 && Number(row[k]) < 1) ||
                                                        errors.has([...path, rowIdx, k].join("."))
                                                        ? "border-red-400"
                                                        : "border-slate-200"
                                                        }`}
                                                />
                                                {HSN_FIELDS.has(k) && String(row[k] ?? "").length > 0 && String(row[k] ?? "").length < 6 && (
                                                    <p className="text-red-400 text-[10px] mt-0.5 whitespace-nowrap">Min 6 digits</p>
                                                )}
                                                {QUANTITY_FIELDS.has(k) && String(row[k] ?? "").length > 0 && Number(row[k]) < 1 && (
                                                    <p className="text-red-400 text-[10px] mt-0.5 whitespace-nowrap">Min 1</p>
                                                )}
                                                {errors.has([...path, rowIdx, k].join(".")) && (String(row[k] ?? "") === "") && (
                                                    <p className="text-red-400 text-[10px] mt-0.5 whitespace-nowrap">Required</p>
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-2 py-1 border-b border-slate-100 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeRow(rowIdx)}
                                                title="Remove row"
                                                className="text-red-400 hover:text-red-600 font-bold text-lg leading-none"
                                            >
                                                &times;
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {arr.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={keys.length + 2}
                                            className="text-center text-slate-400 py-4 text-xs"
                                        >
                                            No rows yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <button
                        type="button"
                        onClick={addRow}
                        className="w-full text-xs text-slate-500 hover:text-yellow-600 hover:bg-yellow-50 py-2 transition-colors flex items-center justify-center gap-1 border-t border-slate-200"
                    >
                        <span className="text-sm font-bold">+</span> Add Row
                    </button>
                </>
            )}
        </div>
    );
};

// Array of primitives — scrollable list
const ArrayOfPrimitivesEditor: React.FC<EditorProps> = ({
    path,
    value,
    onChange,
}) => {
    const arr = value as any[];
    return (
        <div className="w-full flex flex-col gap-1.5">
            {arr.map((item, idx) => (
                <div key={idx} className="flex gap-1.5 items-center">
                    <input
                        type="text"
                        value={item === null || item === undefined ? "" : String(item)}
                        onChange={(e) => onChange([...path, idx], e.target.value)}
                        className="flex-1 min-w-0 border border-slate-200 rounded-md px-2 py-1.5 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            onChange(
                                path,
                                arr.filter((_, i) => i !== idx),
                            )
                        }
                        title="Remove"
                        className="text-red-400 hover:text-red-600 font-bold text-lg leading-none px-1 shrink-0"
                    >
                        &times;
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() => onChange(path, [...arr, ""])}
                className="text-xs text-slate-400 hover:text-yellow-600 text-left flex items-center gap-1 mt-0.5"
            >
                <span className="text-sm font-bold">+</span> Add item
            </button>
        </div>
    );
};

// ── Country list cache (shared across all CountryDropdown instances) ──────────
type Country = { country_id: number; country_name: string; country_code?: string };
let _countriesCache: Country[] = [];
let _countriesFetching: Promise<Country[]> | null = null;

const fetchCountries = (): Promise<Country[]> => {
    if (_countriesCache.length > 0) return Promise.resolve(_countriesCache);
    if (_countriesFetching) return _countriesFetching;
    _countriesFetching = common_get("/admin/country")
        .then((res: any) => {
            _countriesCache = res?.data?.data ?? [];
            return _countriesCache;
        })
        .catch(() => [])
        .finally(() => { _countriesFetching = null; });
    return _countriesFetching;
};

// ── Country searchable dropdown ───────────────────────────────────────────────
const CountryDropdown: React.FC<{
    value: any;
    onChange: (v: string) => void;
}> = ({ value, onChange }) => {
    const [countries, setCountries] = useState<Country[]>(_countriesCache);
    const [search, setSearch] = useState(value === null || value === undefined ? "" : String(value));
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (_countriesCache.length === 0) {
            fetchCountries().then(setCountries);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                // reset search to current value if nothing selected
                setSearch(value === null || value === undefined ? "" : String(value));
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    const filtered = countries.filter((c) =>
        c.country_name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (name: string) => {
        setSearch(name);
        onChange(name);
        setOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder="Search country..."
                className={inputCls}
            />
            {open && filtered.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg text-sm">
                    {filtered.map((c) => (
                        <li
                            key={c.country_id}
                            onMouseDown={() => handleSelect(c.country_name)}
                            className="px-3 py-1.5 cursor-pointer hover:bg-yellow-50 hover:text-yellow-700 text-slate-800"
                        >
                            {c.country_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ── Shipment type dropdown ────────────────────────────────────────────────────
const ShipmentTypeDropdown: React.FC<{
    value: any;
    importBooking: number;
    shipmentTypes: any[];
    onChange: (v: number) => void;
}> = ({ value, importBooking, shipmentTypes, onChange }) => {
    const allowedIds = SHIPMENT_TYPE_ALLOWED[importBooking] ?? SHIPMENT_TYPE_ALLOWED[2];
    const filtered = shipmentTypes?.filter((s) =>
        allowedIds.includes(s.booking_shipment_type_id)
    );
    return (
        <select
            value={Number(value) || 1}
            onChange={(e) => onChange(Number(e.target.value))}
            className={inputCls}
            disabled
        >
            {filtered.map((s) => (
                <option key={s.booking_shipment_type_id} value={s.booking_shipment_type_id}>
                    {s.shipment_type}
                </option>
            ))}
        </select>
    );
};

// Dispatcher
const FieldEditor: React.FC<EditorProps & { maxLength?: number }> = ({ path, value, onChange, maxLength }) => {
    const key = String(path[path.length - 1] ?? "");
    const type = getValueType(value);
    if (type === "primitive") {
        if (DATE_FIELDS.has(key)) {
            return (
                <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={value === null || value === undefined ? "" : String(value)}
                    onChange={(e) => onChange(path, e.target.value)}
                    className={inputCls}
                />
            );
        }
        return <PrimitiveInput value={value} maxLength={maxLength} onChange={(v) => onChange(path, v)} />;
    }
    if (type === "object")
        return <ObjectEditor path={path} value={value} onChange={onChange} />;
    if (type === "array-of-objects")
        return (
            <ArrayOfObjectsEditor path={path} value={value} onChange={onChange} />
        );
    return (
        <ArrayOfPrimitivesEditor path={path} value={value} onChange={onChange} />
    );
};

// ── Chargeable weight ─────────────────────────────────────────────────────────
const getChargeableWeight = (value?: any[]): number => {
    if (!Array.isArray(value) || value.length === 0) return 0;
    const total = value.reduce((acc: number, item: any) => {
        return (
            acc +
            Math.max(
                Number(item?.weight) || 0,
                (Number(item?.height) *
                    Number(item?.breadth) *
                    Number(item?.length) *
                    Number(item?.quantity)) /
                5000,
            )
        );
    }, 0);
    return Number((total || 0).toFixed(2));
};


// ── Main modal ────────────────────────────────────────────────────────────────
type Step = "upload" | "confirm-dims" | "review";

interface DocumentUploadModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, any>) => void;
    shipmentTypes: any[];
    editData?: Record<string, any>;
    franchiseeName?: string;
    dimensionData?: any[];
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
    open,
    onClose,
    onSubmit,
    shipmentTypes,
    editData,
    franchiseeName,
    dimensionData,
}) => {
    const { showAlert } = useAlert();
    const [step, setStep] = useState<Step>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [editedData, setEditedData] = useState<Record<string, any>>({});
    const [submitErrors, setSubmitErrors] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetAll = () => {
        setStep("upload");
        setFile(null);
        setUploading(false);
        setEditedData({});
        setSubmitErrors(new Set());
    };

    const handleClose = () => {
        resetAll();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        if (!selected) return;
        const allowed = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
        ];
        if (!allowed.includes(selected.type)) {
            showAlert("Only image files (JPG, PNG, GIF, WEBP) or PDF are allowed.", "warning");
            setFile(null);
            return;
        }
        if (selected.size > MAX_FILE_SIZE_BYTES) {
            showAlert(`File size must not exceed ${MAX_FILE_SIZE_MB} MB.`, "warning");
            setFile(null);
            return;
        }
        setFile(selected);
    };

    const handleUpload = async () => {
        if (!file) {
            showAlert("Please select a file first.", "warning");
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("document", file);

            const res = await fetch(UPLOAD_API, { method: "POST", body: formData });
            if (!res.ok)
                throw new Error(`Server responded with status ${res.status}`);
            const { pickup_required: _pr, ...json } = await res.json();
            if (!json.shipper_details.consigner_pincode) json.shipper_details.consigner_pincode = json.origin_pincode || "0000";
            if (!json.consignee_details.consignee_pincode) json.consignee_details.consignee_pincode = json.destination_pincode || "0000";
            if (json.origin_country) json.origin_country = String(json.origin_country).toUpperCase();
            if (json.destination_country) json.destination_country = String(json.destination_country).toUpperCase();
            if (json.shipper_details)
                json.shipper_details.consigner_gst_number = json.shipper_details.consigner_gst_number?.trim() || "N.A.";
            if (json.consignee_details)
                json.consignee_details.consignee_gst_number = json.consignee_details.consignee_gst_number?.trim() || "N.A.";

            if (
                json.shipper_details?.consigner_pincode !== "0000" &&
                (!json.shipper_details?.consigner_city || !json.shipper_details?.consigner_state)
            ) {
                try {
                    const pinRes: any = await getLocalPincodeApi(json.shipper_details?.consigner_pincode);
                    const pinData = pinRes?.data?.data?.[0];
                    if (pinData) {
                        if (!json.shipper_details.consigner_city) json.shipper_details.consigner_city = pinData?.city || "";
                        if (!json.shipper_details.consigner_state) json.shipper_details.consigner_state = pinData?.state || "";
                    }
                } catch {
                    // leave consigner city/state empty if lookup fails
                }
            }

            if (
                json.consignee_details?.consignee_pincode !== "0000" &&
                (!json.consignee_details?.consignee_city || !json.consignee_details?.consignee_state)
            ) {
                try {
                    const countries = await fetchCountries();
                    const countryName = json.consignee_details?.consignee_country || json.destination_country || "";
                    const countryCode = countries.find(
                        (c) => c.country_name?.toLowerCase() === String(countryName).toLowerCase()
                    )?.country_code;
                    if (countryCode) {
                        const pinRes: any = await getPincodeApi(countryCode, json.consignee_details?.consignee_pincode);
                        const pinData = pinRes?.data?.data?.[0];
                        if (pinData) {
                            if (!json.consignee_details.consignee_city) json.consignee_details.consignee_city = pinData?.city_area || "";
                            if (!json.consignee_details.consignee_state) json.consignee_details.consignee_state = pinData?.state || "";
                        }
                    }
                } catch {
                    // leave consignee city/state empty if lookup fails
                }
            }

            const sanitizedDimensions = Array.isArray(json.shipment_dimensions)
                ? sanitizeShipmentDimensions(
                    json.shipment_dimensions.map((row: any, idx: number) => ({
                        box_no: row.box_no ?? String(idx + 1),
                        ...row,
                    }))
                )
                : undefined;
            const today = new Date().toISOString().split("T")[0];
            const extractedData = {
                ...json,
                consignee_details: {
                    ...json.consignee_details,
                    booking_invoice_date: json.consignee_details?.booking_invoice_date || today,
                },
                ...(sanitizedDimensions ? { shipment_dimensions: sanitizedDimensions } : {}),
                franchisee_id: editData?.franchisee_id || null,
                chargeable_weight: getChargeableWeight(sanitizedDimensions ?? json.shipment_dimensions),
                import_booking: editData?.import_booking ?? 1,
                shipment_type: editData?.shipment_type ?? 1,
            };

            setEditedData(extractedData);
            setStep("review");
        } catch (err: any) {
            showAlert(err?.message || "Upload failed. Please try again.", "error");
        } finally {
            setUploading(false);
        }
    };

    // Recalculate chargeable_weight whenever shipment_dimensions changes
    useEffect(() => {
        if (!editedData.shipment_dimensions) return;
        const cw = getChargeableWeight(editedData.shipment_dimensions);
        setEditedData((prev) => ({ ...prev, chargeable_weight: cw }));
    }, [editedData.shipment_dimensions]);

    const handleChange = (path: (string | number)[], value: any) => {
        const lastKey = path[path.length - 1];
        const finalValue = (lastKey === "origin_country" || lastKey === "destination_country") && typeof value === "string"
            ? value.toUpperCase()
            : value;
        setEditedData((prev) => deepSet(prev, path, finalValue));
        const pathStr = path.join(".");
        setSubmitErrors((prev) => {
            if (!prev.has(pathStr)) return prev;
            const next = new Set(prev);
            next.delete(pathStr);
            return next;
        });
    };

    const handleFormSubmit = () => {
        const errors = new Set<string>();

        const SHIPPER_REQUIRED = new Set(["consigner_address_1", "consigner_address_2", "consigner_city"]);
        const shipper = editedData.shipper_details ?? {};
        SHIPPER_REQUIRED.forEach((k) => {
            const v = shipper[k];
            if (v === "" || v === null || v === undefined) {
                errors.add(`shipper_details.${k}`);
            }
        });

        if (errors.size > 0) {
            setSubmitErrors(errors);
            return;
        }

        const dims = dimensionData || [{}];
        const isBlankRow = (row: any) =>
            ["item_description", "weight", "length", "breadth", "height", "quantity", "value", "hsn_code"]
                .every((k) => row[k] === "" || row[k] === null || row[k] === undefined);
        const hasRealDims =
            Array.isArray(dims) &&
            dims.length > 0 &&
            !dims.every(isBlankRow);

        if (hasRealDims) {
            setStep("confirm-dims");
        } else {
            onSubmit({
                shipment_dimensions: editedData?.shipment_dimensions,
                shipper_details: editedData?.shipper_details,
                consignee_details: editedData?.consignee_details,
            });
        }
    };

    const modalTitle = (
        <div className="flex flex-col gap-1 w-full">
            <span>
                {step === "upload" ? "Upload Document" : step === "confirm-dims" ? "Confirm Shipment Dimensions" : "Review & Edit Data"}
            </span>
            {step === "review" && (
                <p className="text-red-500 text-xs font-medium">
                    <span className="font-bold">Note : </span> All data input will be taken from this uploaded document.
                </p>
            )}
        </div>
    );

    const modalFooter = (
        <div className="flex items-center justify-end gap-2 sm:gap-3 w-full">
            <button
                type="button"
                onClick={handleClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
                Cancel
            </button>
            {step === "upload" && (
                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-mustard text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    {uploading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Uploading...
                        </>
                    ) : (
                        "Upload & Extract"
                    )}
                </button>
            )}
            {step === "review" && (
                <button
                    type="button"
                    onClick={handleFormSubmit}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                    Submit
                </button>
            )}
        </div>
    );

    const modalBody = (
        <div className="w-full max-h-[60vh] overflow-y-auto min-w-0">
            {/* ── Step 1: Upload ── */}
            {step === "upload" && (
                <div className="flex flex-col items-center gap-4 sm:gap-5">
                    <div
                        className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 sm:p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-yellow-400 active:border-yellow-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <svg
                            className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 16v-8m0 0-3 3m3-3 3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"
                            />
                        </svg>
                        <p className="text-slate-500 text-sm text-center">
                            Tap to browse or drag &amp; drop
                            <br />
                            <span className="text-xs text-slate-400">
                                JPG · PNG · PDF &nbsp;|&nbsp; Max {MAX_FILE_SIZE_MB} MB
                            </span>
                        </p>
                        {file && (
                            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-mustard font-medium max-w-full">
                                <svg
                                    className="w-4 h-4 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                    />
                                </svg>
                                <span className="truncate">{file.name}</span>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            )}

            {/* ── Step 1.5: Confirm dimensions replacement ── */}
            {step === "confirm-dims" && (
                <div className="flex flex-col items-center gap-6 py-4 px-2">
                    <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                        <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    </div>
                    <div className="text-center flex flex-col gap-2">
                        <h3 className="text-base font-semibold text-slate-800">Update Shipment Dimensions?</h3>
                        <p className="text-sm text-slate-500 max-w-sm">
                            This booking already has shipment dimensions on record. Would you like to replace them with the dimensions extracted from the uploaded document, or keep the existing ones?
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => {
                                onSubmit({
                                    shipper_details: editedData?.shipper_details,
                                    consignee_details: editedData?.consignee_details,
                                })
                                setStep("upload");
                            }}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                            Keep Existing Dimensions
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onSubmit({
                                    shipment_dimensions: editedData?.shipment_dimensions,
                                    shipper_details: editedData?.shipper_details,
                                    consignee_details: editedData?.consignee_details,
                                })
                                setStep("upload");
                            }}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-mustard text-white text-sm font-semibold hover:opacity-90 transition-colors"
                        >
                            Use Document Dimensions
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 2: Review & Edit ── */}
            {step === "review" && (
                <div className="flex flex-col gap-3 sm:gap-4">
                    <p className="text-xs sm:text-sm text-slate-500">
                        Review and edit the extracted data below before submitting.
                    </p>

                    {/* Mobile: stacked card layout | sm+: two-column table */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                        {/* ── Mobile stacked view (hidden on sm+) ── */}
                        <div className="divide-y divide-slate-100 sm:hidden">
                            <div className="px-3 py-3 flex flex-col gap-1.5 bg-slate-50/50">
                                <span className="text-xs font-semibold text-slate-600">Booking Type</span>
                                <span className="text-sm text-slate-800">
                                    {editData?.import_booking == 1 ? "Export Booking" : "Import Booking"}
                                </span>
                            </div>
                            <div className="px-3 py-3 flex flex-col gap-1.5 bg-white">
                                <span className="text-xs font-semibold text-slate-600">Shipment Type</span>
                                <ShipmentTypeDropdown
                                    value={editData?.shipment_type}
                                    importBooking={Number(editData?.import_booking) || 1}
                                    shipmentTypes={shipmentTypes}
                                    onChange={(val) => handleChange(["shipment_type"], val)}
                                />
                            </div>
                            {franchiseeName && (
                                <div className="px-3 py-3 flex flex-col gap-1.5 bg-slate-50/50">
                                    <span className="text-xs font-semibold text-slate-600">Franchisee</span>
                                    <span className="text-sm text-slate-800">{franchiseeName}</span>
                                </div>
                            )}
                            {Object.entries(editedData)
                                .filter(([key]) => key !== "franchisee_id" && key !== "chargeable_weight" && key !== "import_booking" && key !== "shipment_type" && key !== "consigner_pincode" && key !== "consignee_pincode" && key !== "origin_country" && key !== "destination_country" && key !== "currency_code" && key !== "origin_pincode" && key !== "destination_pincode")
                                .map(([key, value], idx) => (
                                    <React.Fragment key={key}>
                                        <div className={`px-3 py-3 flex flex-col gap-1.5 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                                            {key !== "sell_charges" && (
                                                <span className="text-xs font-semibold text-slate-600">
                                                    {formatLabel(key)} <span className="text-red-500">*</span>
                                                </span>
                                            )}
                                            {key === "origin_country" || key === "destination_country" ? (
                                                <CountryDropdown
                                                    value={value}
                                                    onChange={(val) => handleChange([key], val)}
                                                />
                                            ) : key === "shipment_type" ? (
                                                <ShipmentTypeDropdown
                                                    value={value}
                                                    importBooking={Number(editedData.import_booking) || 2}
                                                    shipmentTypes={shipmentTypes}
                                                    onChange={(val) => handleChange([key], val)}
                                                />
                                            ) : (
                                                <FieldEditor
                                                    path={[key]}
                                                    value={value}
                                                    onChange={handleChange}
                                                />
                                            )}
                                        </div>
                                        {key === "shipment_dimensions" && (
                                            <div className="px-3 py-3 flex flex-col gap-1.5 bg-yellow-50/60">
                                                <span className="text-xs font-semibold text-slate-600">Chargeable Weight</span>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={editedData.chargeable_weight ?? ""}
                                                        disabled
                                                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 pr-8 text-slate-500 text-sm bg-slate-50 cursor-not-allowed"
                                                    />
                                                    <button
                                                        type="button"
                                                        title="Recalculate Chargeable Weight"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-500 transition-colors"
                                                        onClick={() =>
                                                            setEditedData((prev) => ({
                                                                ...prev,
                                                                chargeable_weight: getChargeableWeight(prev.shipment_dimensions),
                                                            }))
                                                        }
                                                    >
                                                        <RefreshCw className="w-4 h-4 stroke-2.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                        </div>

                        {/* ── Desktop table view (hidden on mobile) ── */}
                        <table className="hidden sm:table w-full text-sm table-fixed">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 border-b border-slate-200 w-[28%]">Field</th>
                                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 border-b border-slate-200 w-[72%]">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {franchiseeName && (
                                    <tr className="bg-slate-50/50">
                                        <td className="px-4 py-3 text-slate-600 font-semibold align-top border-b border-slate-100 w-[28%]">
                                            Franchisee
                                        </td>
                                        <td className="px-4 py-3 border-b border-slate-100 w-[72%] text-sm text-slate-800">
                                            {franchiseeName}
                                        </td>
                                    </tr>
                                )}
                                <tr className="bg-slate-50/50">
                                    <td className="px-4 py-3 text-slate-600 font-semibold align-top border-b border-slate-100 w-[28%]">
                                        Booking Type
                                    </td>
                                    <td className="px-4 py-3 border-b border-slate-100 w-[72%] text-sm text-slate-800">
                                        {editData?.import_booking == 1 ? "Export Booking" : "Import Booking"}
                                    </td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-4 py-3 text-slate-600 font-semibold align-top border-b border-slate-100 w-[28%]">
                                        Shipment Type
                                    </td>
                                    <td className="px-4 py-3 border-b border-slate-100 w-[72%] max-w-0">
                                        <ShipmentTypeDropdown
                                            value={editData?.shipment_type}
                                            importBooking={Number(editData?.import_booking) || 1}
                                            shipmentTypes={shipmentTypes}
                                            onChange={(val) => handleChange(["shipment_type"], val)}
                                        />
                                    </td>
                                </tr>
                                {Object.entries(editedData)
                                    .filter(([key]) => key !== "franchisee_id" && key !== "chargeable_weight" && key !== "import_booking" && key !== "shipment_type" && key !== "origin_country" && key !== "destination_country" && key !== "currency_code" && key !== "origin_pincode" && key !== "destination_pincode")
                                    .map(([key, value], idx) => (
                                        <React.Fragment key={key}>
                                            <tr className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                                <td className="px-4 py-3 text-slate-600 font-semibold align-top border-b border-slate-100 w-[28%]">
                                                    {formatLabel(key)} <span className="text-red-500">*</span>
                                                </td>
                                                <td className="px-4 py-3 border-b border-slate-100 w-[72%] max-w-0">
                                                    {key === "origin_country" || key === "destination_country" ? (
                                                        <CountryDropdown
                                                            value={value}
                                                            onChange={(val) => handleChange([key], val)}
                                                        />
                                                    ) : key === "shipment_type" ? (
                                                        <ShipmentTypeDropdown
                                                            value={value}
                                                            importBooking={Number(editData?.import_booking) || 1}
                                                            shipmentTypes={shipmentTypes}
                                                            onChange={(val) => handleChange([key], val)}
                                                        />
                                                    ) : (
                                                        <FieldEditor
                                                            path={[key]}
                                                            value={value}
                                                            onChange={handleChange}
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                            {key === "shipment_dimensions" && (
                                                <tr className="bg-yellow-50/60">
                                                    <td className="px-4 py-3 text-slate-600 font-semibold align-top border-b border-slate-100 w-[28%]">
                                                        Chargeable Weight
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-slate-100 w-[72%]">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={editedData.chargeable_weight ?? ""}
                                                                disabled
                                                                className="w-full border border-slate-200 rounded-md px-2 py-1.5 pr-8 text-slate-500 text-sm bg-slate-50 cursor-not-allowed"
                                                            />
                                                            <button
                                                                type="button"
                                                                title="Recalculate Chargeable Weight"
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-500 transition-colors"
                                                                onClick={() =>
                                                                    setEditedData((prev) => ({
                                                                        ...prev,
                                                                        chargeable_weight: getChargeableWeight(prev.shipment_dimensions),
                                                                    }))
                                                                }
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const isExport = Number(editData?.import_booking) == 1;
    const mobileConstraints = { consignerMax: isExport ? 10 : 15, consigneeMax: isExport ? 15 : 10 };

    return (
        <MobileConstraintContext.Provider value={mobileConstraints}>
            <ValidationContext.Provider value={submitErrors}>
                <RequiredFieldsContext.Provider value={SHIPPER_REQUIRED}>
                    <Modal
                        open={open}
                        setOpen={handleClose}
                        title={modalTitle}
                        description={modalBody}
                        footer={modalFooter}
                        size="xl"
                        gridColumns={1}
                    />
                </RequiredFieldsContext.Provider>
            </ValidationContext.Provider>
        </MobileConstraintContext.Provider>
    );
};

export default DocumentUploadModal;