"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

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
  type?: AdminFieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  wide?: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  imageShape?: "square" | "wide" | "poster";
}

export interface AdminColumn {
  key: string;
  label: string;
  className?: string;
  render?: (row: Record<string, any>) => React.ReactNode;
}

interface ContentManagerProps {
  resource: "universities" | "majors" | "careers" | "scholarships";
  title: string;
  description: string;
  fields: AdminField[];
  columns: AdminColumn[];
  searchKeys: string[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

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
  form: Record<string, any>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (field.type === "checkbox") continue;

    const raw = form[field.key];
    const value = typeof raw === "string" ? raw.trim() : raw;

    if (value === "" || value == null) {
      if (field.required) errors[field.key] = "This field is required.";
      continue;
    }

    if (field.type === "image") {
      if (!isImageSource(String(value))) {
        errors[field.key] = "Enter a valid image URL or upload a file.";
      }
      continue;
    }

    if (field.key === "slug" && !SLUG_PATTERN.test(String(value))) {
      errors[field.key] = "Use lowercase letters, numbers, and hyphens only.";
      continue;
    }

    if (field.key === "contact_email" && !EMAIL_PATTERN.test(String(value))) {
      errors[field.key] = "Enter a valid email address.";
      continue;
    }

    if (field.key === "riasec_code" && !/^[RIASEC]{1,3}$/.test(String(value))) {
      errors[field.key] = "Use 1–3 RIASEC letters: R, I, A, S, E, or C.";
      continue;
    }

    if (field.key.endsWith("_url") && !isHttpUrl(String(value))) {
      errors[field.key] = "Enter a valid http(s) URL.";
      continue;
    }

    if (field.type === "number") {
      const numberValue = Number(value);
      if (!Number.isFinite(numberValue)) {
        errors[field.key] = "Enter a valid number.";
      } else if (field.min != null && numberValue < field.min) {
        errors[field.key] = `Must be at least ${field.min}.`;
      } else if (field.max != null && numberValue > field.max) {
        errors[field.key] = `Must be at most ${field.max}.`;
      }
      continue;
    }

    if (field.type === "date" && Number.isNaN(Date.parse(String(value)))) {
      errors[field.key] = "Enter a valid date.";
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
    errors.tuition_range_max_usd =
      "Max tuition must be greater than or equal to min tuition.";
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
}: ContentManagerProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>(() => emptyForm(fields));
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<"success" | "error">("success");

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", resource],
    queryFn: async () => apiFetch<Record<string, any>[]>(`/admin/${resource}`),
  });

  const filtered = useMemo(() => {
    if (!rows) return [];
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      searchKeys.some((key) =>
        String(row[key] ?? "").toLowerCase().includes(needle)
      )
    );
  }, [rows, search, searchKeys]);

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
      setDialogOpen(false);
      setFormError(null);
      setFieldErrors({});
      setUploadErrors({});
      setUploadingField(null);
      setNoticeTone("success");
      setNotice(editingId ? "Record updated." : "Record created.");
      setTimeout(() => setNotice(null), 3000);
    },
    onError: (error: any) => {
      setFormError(error?.message || "Could not save this record.");
    },
  });

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/admin/${resource}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", resource] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      setNoticeTone("success");
      setNotice("Record deleted.");
      setTimeout(() => setNotice(null), 3000);
    },
    onError: (error: any) => {
      setNoticeTone("error");
      setNotice(error?.message || "Could not delete this record.");
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
    setFormError(null);
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
    setFormError(null);
    setFieldErrors({});
    setUploadErrors({});
    setUploadingField(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFormError(null);
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
        [field.key]: "Choose a PNG, JPG, WebP, or GIF image.",
      }));
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadErrors((prev) => ({
        ...prev,
        [field.key]: "Images must be 5 MB or smaller.",
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
        throw new Error("The upload did not return an image URL.");
      }
      updateField(field.key, uploaded.url);
    } catch (error: any) {
      setUploadErrors((prev) => ({
        ...prev,
        [field.key]: error?.message || "Could not upload this image.",
      }));
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = () => {
    const errors = validateForm(fields, form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError("Please fix the highlighted fields before saving.");
      return;
    }
    setFormError(null);
    save();
  };

  const handleDelete = (row: Record<string, any>) => {
    const label = row.name_en || row.title_en || row.slug || "this record";
    if (!window.confirm(`Delete ${label}? This action cannot be undone.`)) return;
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
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F7CE4D] px-4 py-2.5 text-xs font-black text-[#111965] transition-colors hover:bg-[#E5BD3B]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add new</span>
        </button>
      </div>

      {notice && (
        <div
          className={cn(
            "rounded-xl border px-3 py-2 text-xs font-bold",
            noticeTone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          )}
        >
          {notice}
        </div>
      )}

      <div className="rounded-2xl border border-[#E6E8F0] bg-white shadow-2xs">
        <div className="flex flex-col gap-3 border-b border-[#E6E8F0] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68708A]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="h-9 w-full rounded-lg border border-[#E6E8F0] bg-[#F5F6FA]/70 pl-9 pr-3 text-xs text-[#171A2C] outline-none transition-colors focus:border-[#111965] focus:bg-white"
            />
          </div>
          <span className="text-xs font-bold text-[#68708A]">
            {filtered.length} {filtered.length === 1 ? "record" : "records"}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-[#68708A]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#68708A]">
            No records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6E8F0] bg-[#F8FAFD] text-[11px] uppercase tracking-wider text-[#68708A]">
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-3 font-bold">
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#E6E8F0] last:border-b-0 hover:bg-[#F8FAFD]/70"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn("px-4 py-3 text-[#171A2C]", column.className)}
                      >
                        {column.render ? column.render(row) : row[column.key] ?? "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          title="Edit"
                          className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-[#F0F2FA] hover:text-[#111965]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          disabled={deleting}
                          title="Delete"
                          className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
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
      </div>

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0A0F3D]/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? `Edit ${title}` : `Add ${title}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <div
            className="my-6 w-full max-w-3xl rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#E6E8F0] pb-3">
              <div>
                <h3 className="text-base font-black text-[#111965]">
                  {editingId ? `Edit ${title}` : `Add ${title}`}
                </h3>
                <p className="text-xs text-[#68708A]">
                  Changes are saved to the live directory immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-lg p-1.5 text-[#68708A] hover:bg-slate-100 hover:text-[#171A2C]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                {formError}
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fields.map((field) => {
                const fieldId = `${resource}-${field.key}`;
                const hasError = Boolean(fieldErrors[field.key]);
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
                          {field.label}
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
                                  field.placeholder ??
                                  "Paste a URL or upload from your laptop"
                                }
                                aria-label={field.label}
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
                                      ? "Uploading…"
                                      : "Upload from laptop"}
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
                                    Remove
                                  </button>
                                )}

                                <span className="text-[10px] text-[#94A3B8]">
                                  PNG, JPG, WebP, GIF · 5 MB max
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
                            {field.label}
                            {field.required && (
                              <span className="text-rose-500"> *</span>
                            )}
                          </span>
                        ) : (
                          <label
                            htmlFor={fieldId}
                            className="block text-[11px] font-black uppercase tracking-wider text-[#68708A]"
                          >
                            {field.label}
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
                            placeholder={field.placeholder}
                            rows={3}
                            className={inputClass}
                          />
                        ) : field.type === "select" ? (
                          <select
                            id={fieldId}
                            value={form[field.key] ?? ""}
                            onChange={(event) =>
                              updateField(field.key, event.target.value)
                            }
                            className={cn(inputClass, "font-semibold")}
                          >
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
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
                            {form[field.key] ? "Enabled" : "Disabled"}
                          </button>
                        ) : (
                          <input
                            id={fieldId}
                            type={
                              field.type === "number"
                                ? "number"
                                : field.type === "date"
                                ? "date"
                                : "text"
                            }
                            value={form[field.key] ?? ""}
                            onChange={(event) =>
                              updateField(field.key, event.target.value)
                            }
                            placeholder={field.placeholder}
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
                Cancel
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
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
