"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useLanguage } from "@/contexts/language-context";
import { cn, getErrorMessage } from "@/lib/utils";
import { AdminFilterDropdown } from "./admin-filter-dropdown";
import { AdminPagination } from "./admin-pagination";

export type AdminFieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "date"
  | "checkbox"
  | "image";

export interface AdminField {
  key: string;
  label: string;
  labelKm?: string;
  type?: AdminFieldType;
  options?: { value: string; label: string; labelKm?: string }[];
  required?: boolean;
  placeholder?: string;
  placeholderKm?: string;
  wide?: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  imageShape?: "square" | "wide" | "poster";
}

export interface AdminColumn {
  key: string;
  label: string;
  labelKm?: string;
  className?: string;
  render?: (row: Record<string, any>) => React.ReactNode;
}

export interface AdminFilterConfig {
  key: string;
  label: string;
  labelKm?: string;
  options?: { value: string; label: string; labelKm?: string }[];
  type?: "boolean";
  trueLabel?: string;
  falseLabel?: string;
  trueLabelKm?: string;
  falseLabelKm?: string;
}

interface ContentManagerProps {
  resource: "universities" | "majors" | "careers" | "scholarships";
  title: string;
  description: string;
  fields: AdminField[];
  columns: AdminColumn[];
  searchKeys: string[];
  filters?: AdminFilterConfig[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const PAGE_SIZE = 10;

const CONTENT_COPY = {
  en: {
    addNew: "Add new",
    clearSearch: "Clear search",
    reset: "Reset",
    resetTitle: "Reset all active filters",
    showing: "Showing",
    of: "of",
    records: "records",
    record: "record",
    loading: "Loading…",
    noRecords: "No records found.",
    noMatches: "No records match these filters.",
    resetAll: "Reset all filters",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    modalHint: "Changes are saved to the live directory immediately.",
    required: "This field is required.",
    imageUrlError: "Enter a valid image URL or upload a file.",
    slugError: "Use lowercase letters, numbers, and hyphens only.",
    emailError: "Enter a valid email address.",
    riasecError: "Use 1–3 RIASEC letters: R, I, A, S, E, or C.",
    urlError: "Enter a valid http(s) URL.",
    numberError: "Enter a valid number.",
    dateError: "Enter a valid date.",
    tuitionRangeError:
      "Max tuition must be greater than or equal to min tuition.",
    imagePlaceholder: "Paste a URL or upload from your laptop",
    uploadFromLaptop: "Upload from laptop",
    uploading: "Uploading…",
    remove: "Remove",
    uploadMax: "PNG, JPG, WebP, GIF · 5 MB max",
    enabled: "Enabled",
    disabled: "Disabled",
    cancel: "Cancel",
    saving: "Saving…",
    saveChanges: "Save changes",
    recordCreated: "Record created.",
    recordUpdated: "Record updated.",
    recordDeleted: "Record deleted.",
    saveError: "Could not save this record.",
    deleteError: "Could not delete this record.",
    fixFields: "Please fix the highlighted fields before saving.",
    chooseImage: "Choose a PNG, JPG, WebP, or GIF image.",
    imageTooLarge: "Images must be 5 MB or smaller.",
    uploadNoUrl: "The upload did not return an image URL.",
    uploadError: "Could not upload this image.",
    confirmDescription:
      "This will permanently remove the record from the live directory. This action cannot be undone.",
    confirmDelete: "Delete",
  },
  km: {
    addNew: "បន្ថែមថ្មី",
    clearSearch: "សម្អាតការស្វែងរក",
    reset: "កំណត់ឡើងវិញ",
    resetTitle: "កំណត់តម្រងសកម្មទាំងអស់ឡើងវិញ",
    showing: "បង្ហាញ",
    of: "ក្នុងចំណោម",
    records: "កំណត់ត្រា",
    record: "កំណត់ត្រា",
    loading: "កំពុងផ្ទុក…",
    noRecords: "រកមិនឃើញកំណត់ត្រាទេ។",
    noMatches: "គ្មានកំណត់ត្រាត្រូវនឹងតម្រងទាំងនេះទេ។",
    resetAll: "កំណត់តម្រងទាំងអស់ឡើងវិញ",
    actions: "សកម្មភាព",
    edit: "កែប្រែ",
    delete: "លុប",
    close: "បិទ",
    modalHint: "ការផ្លាស់ប្តូរត្រូវបានរក្សាទុកទៅបញ្ជីផ្ទាល់ភ្លាមៗ។",
    required: "វាលនេះត្រូវតែបំពេញ។",
    imageUrlError: "បញ្ចូល URL រូបភាពត្រឹមត្រូវ ឬផ្ទុកឯកសារឡើង។",
    slugError: "ប្រើអក្សរតូច លេខ និងសញ្ញាដកកណ្តាលប៉ុណ្ណោះ។",
    emailError: "បញ្ចូលអាសយដ្ឋានអ៊ីមែលត្រឹមត្រូវ។",
    riasecError: "ប្រើអក្សរ RIASEC ១–៣ តួ៖ R, I, A, S, E ឬ C។",
    urlError: "បញ្ចូល URL http(s) ត្រឹមត្រូវ។",
    numberError: "បញ្ចូលលេខត្រឹមត្រូវ។",
    dateError: "បញ្ចូលកាលបរិច្ឆេទត្រឹមត្រូវ។",
    tuitionRangeError: "តម្លៃសិក្សាអតិបរមាត្រូវធំជាង ឬស្មើតម្លៃអប្បបរមា។",
    imagePlaceholder: "បិទភ្ជាប់ URL ឬផ្ទុកពីកុំព្យូទ័ររបស់អ្នក",
    uploadFromLaptop: "ផ្ទុកពីកុំព្យូទ័រ",
    uploading: "កំពុងផ្ទុកឡើង…",
    remove: "ដកចេញ",
    uploadMax: "PNG, JPG, WebP, GIF · អតិបរមា 5 MB",
    enabled: "បើកដំណើរការ",
    disabled: "បិទដំណើរការ",
    cancel: "បោះបង់",
    saving: "កំពុងរក្សាទុក…",
    saveChanges: "រក្សាទុកការផ្លាស់ប្តូរ",
    recordCreated: "បានបង្កើតកំណត់ត្រា។",
    recordUpdated: "បានធ្វើបច្ចុប្បន្នភាពកំណត់ត្រា។",
    recordDeleted: "បានលុបកំណត់ត្រា។",
    saveError: "មិនអាចរក្សាទុកកំណត់ត្រានេះបានទេ។",
    deleteError: "មិនអាចលុបកំណត់ត្រានេះបានទេ។",
    fixFields: "សូមកែវាលដែលបានសម្គាល់មុនពេលរក្សាទុក។",
    chooseImage: "ជ្រើសរើសរូបភាព PNG, JPG, WebP ឬ GIF។",
    imageTooLarge: "រូបភាពត្រូវមានទំហំ 5 MB ឬតូចជាងនេះ។",
    uploadNoUrl: "ការផ្ទុកឡើងមិនបានផ្តល់ URL រូបភាពទេ។",
    uploadError: "មិនអាចផ្ទុករូបភាពនេះឡើងបានទេ។",
    confirmDescription:
      "កំណត់ត្រានេះនឹងត្រូវលុបចេញពីបញ្ជីផ្ទាល់ជាអចិន្ត្រៃយ៍។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
    confirmDelete: "លុប",
  },
} as const;

function emptyForm(fields: AdminField[]): Record<string, any> {
  return Object.fromEntries(
    fields.map((field) => [
      field.key,
      field.defaultValue !== undefined
        ? field.defaultValue
        : field.type === "checkbox"
          ? false
          : field.type === "select"
            ? field.options?.[0]?.value ?? ""
            : "",
    ])
  );
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isImageSource(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return isHttpUrl(value);
}

function validateForm(
  fields: AdminField[],
  form: Record<string, any>,
  isKm: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (field.type === "checkbox") continue;

    const raw = form[field.key];
    const value = typeof raw === "string" ? raw.trim() : raw;

    if (value === "" || value == null) {
      if (field.required)
        errors[field.key] = isKm
          ? "វាលនេះត្រូវតែបំពេញ។"
          : "This field is required.";
      continue;
    }

    if (field.type === "image") {
      if (!isImageSource(String(value))) {
        errors[field.key] = isKm
          ? "បញ្ចូល URL រូបភាពត្រឹមត្រូវ ឬផ្ទុកឯកសារឡើង។"
          : "Enter a valid image URL or upload a file.";
      }
      continue;
    }

    if (field.key === "slug" && !SLUG_PATTERN.test(String(value))) {
      errors[field.key] = isKm
        ? "ប្រើអក្សរតូច លេខ និងសញ្ញាដកកណ្តាលប៉ុណ្ណោះ។"
        : "Use lowercase letters, numbers, and hyphens only.";
      continue;
    }

    if (field.key === "contact_email" && !EMAIL_PATTERN.test(String(value))) {
      errors[field.key] = isKm
        ? "បញ្ចូលអាសយដ្ឋានអ៊ីមែលត្រឹមត្រូវ។"
        : "Enter a valid email address.";
      continue;
    }

    if (field.key === "riasec_code" && !/^[RIASEC]{1,3}$/.test(String(value))) {
      errors[field.key] = isKm
        ? "ប្រើអក្សរ RIASEC ១–៣ តួ៖ R, I, A, S, E ឬ C។"
        : "Use 1–3 RIASEC letters: R, I, A, S, E, or C.";
      continue;
    }

    if (field.key.endsWith("_url") && !isHttpUrl(String(value))) {
      errors[field.key] = isKm
        ? "បញ្ចូល URL http(s) ត្រឹមត្រូវ។"
        : "Enter a valid http(s) URL.";
      continue;
    }

    if (field.type === "number") {
      const numberValue = Number(value);
      if (!Number.isFinite(numberValue)) {
        errors[field.key] = isKm
          ? "បញ្ចូលលេខត្រឹមត្រូវ។"
          : "Enter a valid number.";
      } else if (field.min != null && numberValue < field.min) {
        errors[field.key] = isKm
          ? `ត្រូវធំជាង ឬស្មើ ${field.min}។`
          : `Must be at least ${field.min}.`;
      } else if (field.max != null && numberValue > field.max) {
        errors[field.key] = isKm
          ? `ត្រូវតូចជាង ឬស្មើ ${field.max}។`
          : `Must be at most ${field.max}.`;
      }
      continue;
    }

    if (field.type === "date" && Number.isNaN(Date.parse(String(value)))) {
      errors[field.key] = isKm
        ? "បញ្ចូលកាលបរិច្ឆេទត្រឹមត្រូវ។"
        : "Enter a valid date.";
    }
  }

  const minTuition = Number(form.tuition_range_min_usd);
  const maxTuition = Number(form.tuition_range_max_usd);
  if (
    !errors.tuition_range_max_usd &&
    form.tuition_range_min_usd !== "" &&
    form.tuition_range_max_usd !== "" &&
    Number.isFinite(minTuition) &&
    Number.isFinite(maxTuition) &&
    maxTuition < minTuition
  ) {
    errors.tuition_range_max_usd = isKm
      ? "តម្លៃសិក្សាអតិបរមាត្រូវធំជាង ឬស្មើតម្លៃអប្បបរមា។"
      : "Max tuition must be greater than or equal to min tuition.";
  }

  return errors;
}

function ImagePreview({
  src,
  shape,
}: {
  src?: string | null;
  shape?: AdminField["imageShape"];
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src) && failedSrc === src;

  const size =
    shape === "square"
      ? "h-16 w-16"
      : shape === "poster"
        ? "h-20 w-14"
        : "h-16 w-24";
  const canPreview =
    typeof src === "string" && src.length > 0 && isImageSource(src);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E6E8F0] bg-white",
        size
      )}
    >
      {canPreview && !failed ? (
        // Plain img so arbitrary admin-provided URLs work.
        <img
          src={src}
          alt="Image preview"
          className="h-full w-full object-contain"
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        <ImageIcon className="h-5 w-5 text-[#94A3B8]" />
      )}
    </div>
  );
}

export function ContentManager({
  resource,
  title,
  description,
  fields,
  columns,
  searchKeys,
  filters = [],
}: ContentManagerProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { language } = useLanguage();
  const isKm = language === "km";
  const copy = CONTENT_COPY[language];
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>(() => emptyForm(fields));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", resource],
    queryFn: async () => apiFetch<Record<string, any>[]>(`/admin/${resource}`),
  });

  const filterGroups = useMemo(() => {
    const allRows = rows ?? [];
    return filters.map((filter) => {
      const configuredOptions = filter.options?.map((option) => ({
        ...option,
        label: isKm ? option.labelKm ?? option.label : option.label,
      }));
      const baseOptions =
        configuredOptions ??
        (filter.type === "boolean"
          ? [
            {
              value: "true",
              label: isKm
                ? filter.trueLabelKm ?? filter.trueLabel ?? "បាទ/ចាស"
                : filter.trueLabel ?? "Yes",
            },
            {
              value: "false",
              label: isKm
                ? filter.falseLabelKm ?? filter.falseLabel ?? "ទេ"
                : filter.falseLabel ?? "No",
            },
          ]
          : Array.from(
            new Set(
              allRows
                .map((row) => String(row[filter.key] ?? "").trim())
                .filter(Boolean)
            )
          )
            .sort((left, right) => left.localeCompare(right))
            .map((value) => ({ value, label: value })));

      return {
        ...filter,
        label: isKm ? filter.labelKm ?? filter.label : filter.label,
        options: [
          { value: "", label: isKm ? "ទាំងអស់" : "All", count: allRows.length },
          ...baseOptions.map((option) => ({
            ...option,
            count: allRows.filter(
              (row) => String(row[filter.key] ?? "") === option.value
            ).length,
          })),
        ],
      };
    });
  }, [filters, rows, isKm]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      for (const filter of filters) {
        const active = filterValues[filter.key];
        if (!active) continue;
        if (String(row[filter.key] ?? "") !== active) return false;
      }
      if (!needle) return true;
      return searchKeys.some((key) =>
        String(row[key] ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, search, searchKeys, filters, filterValues]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const hasActiveFilters =
    Boolean(search) || Boolean(Object.values(filterValues).find(Boolean));

  const resetFilters = () => {
    setSearch("");
    setFilterValues({});
    setPage(1);
  };

  useEffect(() => {
    if (!dialogOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialogOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogOpen]);

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = {};
      for (const field of fields) {
        const value = form[field.key];
        if (field.type === "checkbox") {
          payload[field.key] = Boolean(value);
        } else if (field.type === "number") {
          payload[field.key] = value === "" || value == null ? null : Number(value);
        } else if (field.type === "date") {
          payload[field.key] = value || null;
        } else {
          payload[field.key] = typeof value === "string" ? value.trim() : value ?? "";
        }
      }
      if (editingId) {
        return apiFetch(`/admin/${resource}/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      return apiFetch(`/admin/${resource}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", resource] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: [resource] });
      if (resource === "universities") {
        queryClient.invalidateQueries({ queryKey: ["landing-universities"] });
      }
      setDialogOpen(false);
      setFieldErrors({});
      setUploadErrors({});
      setUploadingField(null);
      toast.success(editingId ? copy.recordUpdated : copy.recordCreated);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, copy.saveError));
    },
  });

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/admin/${resource}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", resource] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: [resource] });
      if (resource === "universities") {
        queryClient.invalidateQueries({ queryKey: ["landing-universities"] });
      }
      toast.success(copy.recordDeleted);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, copy.deleteError));
    },
  });

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm(fields));
    setFieldErrors({});
    setUploadErrors({});
    setUploadingField(null);
    setDialogOpen(true);
  };

  const openEdit = (row: Record<string, any>) => {
    setEditingId(String(row.id));
    setForm(
      Object.fromEntries(
        fields.map((field) => [
          field.key,
          row[field.key] ?? (field.type === "checkbox" ? false : ""),
        ])
      )
    );
    setFieldErrors({});
    setUploadErrors({});
    setUploadingField(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFieldErrors({});
    setUploadErrors({});
    setUploadingField(null);
  };

  const handleImageFile = async (field: AdminField, file: File) => {
    setUploadErrors((prev) => {
      if (!prev[field.key]) return prev;
      const next = { ...prev };
      delete next[field.key];
      return next;
    });

    if (!UPLOAD_TYPES.includes(file.type)) {
      setUploadErrors((prev) => ({
        ...prev,
        [field.key]: copy.chooseImage,
      }));
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadErrors((prev) => ({
        ...prev,
        [field.key]: copy.imageTooLarge,
      }));
      return;
    }

    setUploadingField(field.key);
    try {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await apiFetch<{ url: string }>("/uploads", {
        method: "POST",
        body,
      });
      if (!uploaded?.url) {
        throw new Error(copy.uploadNoUrl);
      }
      updateField(field.key, uploaded.url);
    } catch (error: any) {
      setUploadErrors((prev) => ({
        ...prev,
        [field.key]: error?.message || copy.uploadError,
      }));
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = () => {
    const errors = validateForm(fields, form, isKm);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.warning(copy.fixFields);
      return;
    }
    save();
  };

  const handleDelete = async (row: Record<string, any>) => {
    const label = isKm
      ? row.name_km || row.title_km || row.slug || "កំណត់ត្រានេះ"
      : row.name_en || row.title_en || row.slug || "this record";
    const confirmed = await confirm({
      title: isKm ? `លុប ${label}?` : `Delete ${label}?`,
      description: copy.confirmDescription,
      confirmLabel: copy.confirmDelete,
      cancelLabel: copy.cancel,
      tone: "danger",
    });
    if (!confirmed) return;
    remove(String(row.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-black text-[#111965]">{title}</h2>
          <p className="text-xs text-[#68708A]">{description}</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#111965] px-4 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#1E277A] dark:bg-[#F7CE4D] dark:text-white dark:hover:bg-[#E5BD3B]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{copy.addNew}</span>
        </button>
      </div>

      <div className="rounded-2xl border border-[#E6E8F0] bg-white shadow-2xs dark:border-white/10 dark:bg-[#090D24]">
        <div className="flex flex-col gap-2.5 border-b border-[#E6E8F0] p-3 dark:border-white/10 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68708A] dark:text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={
                isKm ? `ស្វែងរក${title}...` : `Search ${title.toLowerCase()}...`
              }
              className="h-9 w-full rounded-xl border border-[#E6E8F0] bg-[#F5F6FA]/70 pl-9 pr-8 text-xs text-[#171A2C] outline-none transition-colors focus:border-[#111965] focus:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#68708A] hover:text-[#171A2C] dark:text-slate-400 dark:hover:text-white"
                title={copy.clearSearch}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {filterGroups.map((filter) => (
              <AdminFilterDropdown
                key={filter.key}
                label={filter.label}
                value={filterValues[filter.key] ?? ""}
                onChange={(value) => {
                  setFilterValues((prev) => ({ ...prev, [filter.key]: value }));
                  setPage(1);
                }}
                options={filter.options}
                menuWidth="w-60"
              />
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-[#E6E8F0] px-2.5 text-xs font-bold text-[#68708A] transition-colors hover:border-slate-400 hover:text-[#111965] dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
                title={copy.resetTitle}
              >
                <RotateCcw className="h-3 w-3" />
                <span>{copy.reset}</span>
              </button>
            )}

            <span className="border-l border-[#E6E8F0] pl-2 text-[11px] font-semibold text-[#68708A] dark:border-slate-800 dark:text-slate-400">
              {copy.showing}{" "}
              <strong className="text-[#111965] dark:text-slate-200">{filtered.length}</strong>{" "}
              {copy.of} {rows?.length || 0}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-[#68708A]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {copy.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-xs text-[#68708A] dark:text-slate-400">
            <span>
              {hasActiveFilters ? copy.noMatches : copy.noRecords}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#111965] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1E277A] dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {copy.resetAll}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6E8F0] bg-[#F8FAFD] text-[11px] uppercase tracking-wider text-[#68708A] dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-3 font-bold">
                      {isKm ? column.labelKm ?? column.label : column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-bold">{copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row, index) => (
                  <tr
                    key={row.id}
                    className="admin-table-row border-b border-[#E6E8F0] last:border-b-0 hover:bg-[#F8FAFD]/70 dark:border-white/10 dark:hover:bg-white/[0.03]"
                    style={{ animationDelay: `${Math.min(index, 12) * 22}ms` }}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-3 text-[#171A2C] dark:text-slate-200",
                          column.className
                        )}
                      >
                        {column.render ? column.render(row) : row[column.key] ?? "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          title={copy.edit}
                          className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          disabled={deleting}
                          title={copy.delete}
                          className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && (
          <AdminPagination
            page={currentPage}
            pageCount={pageCount}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel={isKm ? "កំណត់ត្រា" : "records"}
            itemSingular={isKm ? "កំណត់ត្រា" : "record"}
          />
        )}
      </div>

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#0A0F3D]/50 p-4 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={
            editingId
              ? isKm
                ? `កែប្រែ${title}`
                : `Edit ${title}`
              : isKm
                ? `បន្ថែម${title}`
                : `Add ${title}`
          }
          onClick={(event) => {
            if (!dialogRef.current?.contains(event.target as Node)) closeDialog();
          }}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              ref={dialogRef}
              className="w-full max-w-3xl rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-2xl sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#E6E8F0] pb-3">
                <div>
                  <h3 className="text-base font-black text-[#111965]">
                    {editingId
                      ? isKm
                        ? `កែប្រែ${title}`
                        : `Edit ${title}`
                      : isKm
                        ? `បន្ថែម${title}`
                        : `Add ${title}`}
                  </h3>
                  <p className="text-xs text-[#68708A]">{copy.modalHint}</p>
                </div>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-lg p-1.5 text-[#68708A] hover:bg-slate-100 hover:text-[#171A2C]"
                  aria-label={copy.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {fields.map((field) => {
                  const fieldId = `${resource}-${field.key}`;
                  const hasError = Boolean(fieldErrors[field.key]);
                  const fieldLabel = isKm ? field.labelKm ?? field.label : field.label;
                  const fieldPlaceholder = isKm
                    ? field.placeholderKm ?? field.placeholder
                    : field.placeholder;
                  const inputClass = cn(
                    "w-full rounded-xl border bg-[#F8FAFD] px-3 text-xs text-[#171A2C] outline-none focus:bg-white",
                    hasError
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-[#E6E8F0] focus:border-[#111965]",
                    field.type === "textarea" ? "py-2" : "h-10"
                  );

                  return (
                    <div
                      key={field.key}
                      className={cn("space-y-1.5", field.wide && "sm:col-span-2")}
                    >
                      {field.type === "image" ? (
                        <>
                          <span className="block text-[11px] font-black uppercase tracking-wider text-[#68708A]">
                            {fieldLabel}
                            {field.required && <span className="text-rose-500"> *</span>}
                          </span>
                          <div
                            className={cn(
                              "rounded-xl border p-2.5",
                              hasError
                                ? "border-rose-300 bg-rose-50/40"
                                : "border-[#E6E8F0] bg-[#F8FAFD]"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <ImagePreview
                                src={form[field.key]}
                                shape={field.imageShape}
                              />
                              <div className="min-w-0 flex-1 space-y-2">
                                <input
                                  id={fieldId}
                                  type="text"
                                  value={form[field.key] ?? ""}
                                  onChange={(event) =>
                                    updateField(field.key, event.target.value)
                                  }
                                  placeholder={
                                    fieldPlaceholder ?? copy.imagePlaceholder
                                  }
                                  aria-label={fieldLabel}
                                  maxLength={500}
                                  className={cn(
                                    "h-9 w-full rounded-lg border bg-white px-2.5 text-xs text-[#171A2C] outline-none",
                                    hasError
                                      ? "border-rose-400 focus:border-rose-500"
                                      : "border-[#E6E8F0] focus:border-[#111965]"
                                  )}
                                />
                                <div className="flex flex-wrap items-center gap-2">
                                  <label
                                    className={cn(
                                      "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E6E8F0] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#111965] transition-colors hover:border-[#111965]/30",
                                      uploadingField === field.key &&
                                      "pointer-events-none opacity-60"
                                    )}
                                  >
                                    {uploadingField === field.key ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Upload className="h-3 w-3" />
                                    )}
                                    <span>
                                      {uploadingField === field.key
                                        ? copy.uploading
                                        : copy.uploadFromLaptop}
                                    </span>
                                    <input
                                      type="file"
                                      accept={UPLOAD_TYPES.join(",")}
                                      className="sr-only"
                                      disabled={uploadingField === field.key}
                                      onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        event.target.value = "";
                                        if (file) handleImageFile(field, file);
                                      }}
                                    />
                                  </label>

                                  {form[field.key] && (
                                    <button
                                      type="button"
                                      onClick={() => updateField(field.key, "")}
                                      className="rounded-lg px-2 py-1.5 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-50"
                                    >
                                      {copy.remove}
                                    </button>
                                  )}

                                  <span className="text-[10px] text-[#94A3B8]">
                                    {copy.uploadMax}
                                  </span>
                                </div>
                                {uploadErrors[field.key] && (
                                  <p className="text-[11px] font-semibold text-rose-600">
                                    {uploadErrors[field.key]}
                                  </p>
                                )}
                              </div>
                            </div>
                            {hasError && (
                              <p className="mt-1.5 text-[11px] font-semibold text-rose-600">
                                {fieldErrors[field.key]}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {field.type === "checkbox" ? (
                            <span className="block text-[11px] font-black uppercase tracking-wider text-[#68708A]">
                              {fieldLabel}
                              {field.required && (
                                <span className="text-rose-500"> *</span>
                              )}
                            </span>
                          ) : (
                            <label
                              htmlFor={fieldId}
                              className="block text-[11px] font-black uppercase tracking-wider text-[#68708A]"
                            >
                              {fieldLabel}
                              {field.required && (
                                <span className="text-rose-500"> *</span>
                              )}
                            </label>
                          )}

                          {field.type === "textarea" ? (
                            <textarea
                              id={fieldId}
                              value={form[field.key] ?? ""}
                              onChange={(event) =>
                                updateField(field.key, event.target.value)
                              }
                              placeholder={fieldPlaceholder}
                              rows={3}
                              className={inputClass}
                            />
                          ) : field.type === "select" ? (
                            <Select
                              id={fieldId}
                              value={form[field.key] ?? ""}
                              onChange={(value) => updateField(field.key, value)}
                              options={(field.options ?? []).map((option) => ({
                                value: option.value,
                                label: isKm ? option.labelKm ?? option.label : option.label,
                              }))}
                              label={fieldLabel}
                              searchable={(field.options?.length ?? 0) > 8}
                              className="w-full"
                            />
                          ) : field.type === "checkbox" ? (
                            <button
                              type="button"
                              role="switch"
                              aria-checked={Boolean(form[field.key])}
                              onClick={() =>
                                updateField(field.key, !form[field.key])
                              }
                              className={cn(
                                "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-colors",
                                form[field.key]
                                  ? "border-[#111965] bg-[#111965] text-white"
                                  : "border-[#E6E8F0] bg-white text-[#68708A]"
                              )}
                            >
                              <Check className="h-3.5 w-3.5" />
                              {form[field.key] ? copy.enabled : copy.disabled}
                            </button>
                          ) : field.type === "date" ? (
                            <DatePicker
                              id={fieldId}
                              value={form[field.key] ?? ""}
                              onChange={(value) => updateField(field.key, value)}
                              label={fieldLabel}
                              placeholder={fieldPlaceholder}
                            />
                          ) : (
                            <input
                              id={fieldId}
                              type={field.type === "number" ? "number" : "text"}
                              value={form[field.key] ?? ""}
                              onChange={(event) =>
                                updateField(field.key, event.target.value)
                              }
                              placeholder={fieldPlaceholder}
                              min={field.min}
                              max={field.max}
                              maxLength={field.key.endsWith("_url") ? 500 : undefined}
                              className={inputClass}
                            />
                          )}

                          {hasError && (
                            <p className="text-[11px] font-semibold text-rose-600">
                              {fieldErrors[field.key]}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#E6E8F0] pt-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-xl border border-[#E6E8F0] px-4 py-2 text-xs font-bold text-[#68708A] hover:bg-slate-50"
                >
                  {copy.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#F7CE4D] px-4 py-2 text-xs font-black text-[#111965] hover:bg-[#E5BD3B] disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {saving ? copy.saving : copy.saveChanges}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
