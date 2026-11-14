"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
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
  | "checkbox";

export interface AdminField {
  key: string;
  label: string;
  type?: AdminFieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  wide?: boolean;
  defaultValue?: any;
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
          payload[field.key] = value ?? "";
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

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm(fields));
    setFormError(null);
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
    setDialogOpen(true);
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
        >
          <div className="my-6 w-full max-w-3xl rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-2xl sm:p-6">
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
                onClick={() => setDialogOpen(false)}
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
              {fields.map((field) => (
                <label
                  key={field.key}
                  className={cn("space-y-1.5", field.wide && "sm:col-span-2")}
                >
                  <span className="block text-[11px] font-black uppercase tracking-wider text-[#68708A]">
                    {field.label}
                    {field.required && <span className="text-rose-500"> *</span>}
                  </span>
                  {field.type === "textarea" ? (
                    <textarea
                      value={form[field.key] ?? ""}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 py-2 text-xs text-[#171A2C] outline-none focus:border-[#111965] focus:bg-white"
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={form[field.key] ?? ""}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                      className="h-10 w-full rounded-xl border border-[#E6E8F0] bg-white px-3 text-xs font-semibold text-[#171A2C] outline-none focus:border-[#111965]"
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
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: !prev[field.key],
                        }))
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
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      value={form[field.key] ?? ""}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="h-10 w-full rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 text-xs text-[#171A2C] outline-none focus:border-[#111965] focus:bg-white"
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#E6E8F0] pt-4">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl border border-[#E6E8F0] px-4 py-2 text-xs font-bold text-[#68708A] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => save()}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F7CE4D] px-4 py-2 text-xs font-black text-[#111965] hover:bg-[#E5BD3B] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
