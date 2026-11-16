"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { cn, getErrorMessage } from "@/lib/utils";
import { AdminFilterDropdown } from "./admin-filter-dropdown";
import { AdminPagination } from "./admin-pagination";

interface Offering {
  id: string;
  university_id: string;
  university_slug: string;
  university_name_en: string;
  university_name_km?: string;
  major_id: string;
  major_slug: string;
  major_name_en: string;
  major_name_km?: string;
  degree_level: string;
  duration_years: number | null;
  tuition_annual_usd: number | null;
  is_tuition_verified: boolean;
  language_of_instruction: string;
  official_curriculum_url?: string | null;
}

interface UniversityOption {
  id: string;
  slug: string;
  name_en: string;
  acronym_en?: string;
}

interface MajorOption {
  id: string;
  slug: string;
  name_en: string;
  name_km?: string;
  category: string;
}

type OfferingForm = {
  university_id: string;
  major_id: string;
  degree_level: string;
  duration_years: string;
  tuition_annual_usd: string;
  is_tuition_verified: boolean;
  language_of_instruction: string;
  official_curriculum_url: string;
};

const EMPTY_FORM: OfferingForm = {
  university_id: "",
  major_id: "",
  degree_level: "BACHELOR",
  duration_years: "4",
  tuition_annual_usd: "",
  is_tuition_verified: false,
  language_of_instruction: "BILINGUAL",
  official_curriculum_url: "",
};

const DEGREE_OPTIONS = ["ASSOCIATE", "BACHELOR", "MASTER", "DOCTORATE"];
const LANGUAGE_OPTIONS = [
  { value: "BILINGUAL", label: "Bilingual" },
  { value: "ENGLISH", label: "English" },
  { value: "KHMER", label: "Khmer" },
  { value: "FRENCH", label: "French" },
];
const PAGE_SIZE = 25;

const inputClass =
  "h-10 w-full rounded-xl border border-[#E6E8F0] bg-white px-3 text-[12px] font-medium text-[#111965] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#111965]/50 focus:ring-2 focus:ring-[#111965]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#F7CE4D]/60 dark:focus:ring-[#F7CE4D]/10";
const labelClass =
  "mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-[#68708A] dark:text-slate-400";

function formatTuition(value: number | null) {
  if (value == null) return "—";
  return `$${Math.round(value).toLocaleString("en-US")}/yr`;
}

export function OfferingsManager() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [universityFilter, setUniversityFilter] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Offering | null>(null);
  const [form, setForm] = useState<OfferingForm>(EMPTY_FORM);

  const { data: offerings = [], isLoading } = useQuery({
    queryKey: ["admin", "offerings"],
    queryFn: async () => apiFetch<Offering[]>("/admin/offerings"),
  });
  const { data: universities = [] } = useQuery({
    queryKey: ["admin", "universities"],
    queryFn: async () => apiFetch<UniversityOption[]>("/admin/universities"),
  });
  const { data: majors = [] } = useQuery({
    queryKey: ["admin", "majors"],
    queryFn: async () => apiFetch<MajorOption[]>("/admin/majors"),
  });

  useEffect(() => {
    if (!dialogOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialogOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogOpen]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return offerings.filter((item) => {
      if (universityFilter && item.university_id !== universityFilter) return false;
      if (degreeFilter && item.degree_level !== degreeFilter) return false;
      if (verifiedFilter && String(item.is_tuition_verified) !== verifiedFilter) {
        return false;
      }
      if (!needle) return true;
      return [
        item.university_name_en,
        item.university_name_km,
        item.major_name_en,
        item.major_name_km,
        item.major_slug,
        item.degree_level,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [offerings, search, universityFilter, degreeFilter, verifiedFilter]);

  const degreeFilterOptions = useMemo(
    () => [
      { value: "", label: "All", count: offerings.length },
      ...DEGREE_OPTIONS.map((degree) => ({
        value: degree,
        label: degree.charAt(0) + degree.slice(1).toLowerCase(),
        count: offerings.filter((item) => item.degree_level === degree).length,
      })),
    ],
    [offerings]
  );

  const verifiedFilterOptions = useMemo(
    () => [
      { value: "", label: "All", count: offerings.length },
      {
        value: "true",
        label: "Verified",
        count: offerings.filter((item) => item.is_tuition_verified).length,
      },
      {
        value: "false",
        label: "Unverified",
        count: offerings.filter((item) => !item.is_tuition_verified).length,
      },
    ],
    [offerings]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const hasActiveFilters = Boolean(
    search || universityFilter || degreeFilter || verifiedFilter
  );

  const resetFilters = () => {
    setSearch("");
    setUniversityFilter("");
    setDegreeFilter("");
    setVerifiedFilter("");
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (offering: Offering) => {
    setEditing(offering);
    setForm({
      university_id: offering.university_id,
      major_id: offering.major_id,
      degree_level: offering.degree_level,
      duration_years: String(offering.duration_years ?? 4),
      tuition_annual_usd:
        offering.tuition_annual_usd == null ? "" : String(offering.tuition_annual_usd),
      is_tuition_verified: offering.is_tuition_verified,
      language_of_instruction: offering.language_of_instruction,
      official_curriculum_url: offering.official_curriculum_url || "",
    });
    setDialogOpen(true);
  };

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      if (!form.university_id || !form.major_id) {
        throw new Error("Choose both a university and a major.");
      }
      const payload = {
        university_id: form.university_id,
        major_id: form.major_id,
        degree_level: form.degree_level,
        duration_years: Number(form.duration_years || 4),
        tuition_annual_usd: form.tuition_annual_usd
          ? Number(form.tuition_annual_usd)
          : null,
        is_tuition_verified: form.is_tuition_verified,
        language_of_instruction: form.language_of_instruction,
        official_curriculum_url: form.official_curriculum_url.trim() || null,
      };
      return apiFetch(`/admin/offerings${editing ? `/${editing.id}` : ""}`, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "offerings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "universities"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      setDialogOpen(false);
      toast.success(editing ? "Program updated." : "Program added to university.");
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Could not save this program.")),
  });

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/admin/offerings/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "offerings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "universities"] });
      toast.success("Program removed.");
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Could not remove this program.")),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#111965] dark:text-white sm:text-2xl">
            Majors offered by each university
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#68708A] dark:text-slate-400">
            Link an existing major to an institution, set the degree level, duration,
            tuition, and verification status. These links power the public university
            program lists.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#111965] px-4 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#1E277A] dark:bg-[#F7CE4D] dark:text-[#111965] dark:hover:bg-[#E5BD3B]"
        >
          <Plus className="h-4 w-4" />
          Add program
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#090D24]">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
            Program links
          </div>
          <div className="mt-1 text-2xl font-black text-[#111965] dark:text-white">
            {offerings.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#090D24]">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
            Universities covered
          </div>
          <div className="mt-1 text-2xl font-black text-[#111965] dark:text-white">
            {new Set(offerings.map((item) => item.university_id)).size}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#090D24]">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
            Verified tuition
          </div>
          <div className="mt-1 text-2xl font-black text-[#111965] dark:text-white">
            {offerings.filter((item) => item.is_tuition_verified).length}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-[#E6E8F0] bg-white p-3 dark:border-white/10 dark:bg-[#090D24] xl:flex-row xl:items-center">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search university, major, degree…"
            className={cn(inputClass, "pl-9")}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={universityFilter}
            onChange={(value) => {
              setUniversityFilter(value);
              setPage(1);
            }}
            options={[
              { value: "", label: "All universities" },
              ...universities.map((university) => ({
                value: university.id,
                label: `${university.name_en}${university.acronym_en ? ` (${university.acronym_en})` : ""}`,
              })),
            ]}
            label="University"
            searchable
            align="end"
            className="w-full sm:w-64"
            menuClassName="min-w-[280px]"
          />

          <AdminFilterDropdown
            label="Degree"
            value={degreeFilter}
            onChange={(value) => {
              setDegreeFilter(value);
              setPage(1);
            }}
            options={degreeFilterOptions}
            menuWidth="w-56"
          />

          <AdminFilterDropdown
            label="Tuition"
            value={verifiedFilter}
            onChange={(value) => {
              setVerifiedFilter(value);
              setPage(1);
            }}
            options={verifiedFilterOptions}
            menuWidth="w-56"
            align="end"
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-[#E6E8F0] px-2.5 text-xs font-bold text-[#68708A] transition-colors hover:border-slate-400 hover:text-[#111965] dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
              title="Reset all active filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}

          <span className="border-l border-[#E6E8F0] pl-2 text-[11px] font-semibold text-[#68708A] dark:border-slate-800 dark:text-slate-400">
            Showing{" "}
            <strong className="text-[#111965] dark:text-slate-200">{filtered.length}</strong>{" "}
            of {offerings.length}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white dark:border-white/10 dark:bg-[#090D24]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: "21%" }} />
              <col style={{ width: "27%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "7%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-[#E6E8F0] bg-[#F8FAFD] text-[10px] font-black uppercase tracking-[0.12em] text-[#68708A] dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                <th className="px-4 py-3">University</th>
                <th className="px-4 py-3">Major</th>
                <th className="px-4 py-3">Degree</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Tuition</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8F0] dark:divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#111965] dark:text-[#F7CE4D]" />
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-xs text-[#68708A] dark:text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <span>No program links match these filters.</span>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#111965] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1E277A] dark:bg-indigo-600 dark:hover:bg-indigo-500"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reset all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                visible.map((offering) => (
                  <tr
                    key={offering.id}
                    className="transition-colors hover:bg-[#F8FAFD] dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0F2FA] text-[#111965] dark:bg-white/10 dark:text-[#F7CE4D]">
                          <Building2 className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-[12px] font-bold text-[#111965] dark:text-white">
                            {offering.university_name_en}
                          </div>
                          <div className="text-[10px] text-[#94A3B8]">
                            {offering.university_slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[280px] truncate text-[12px] font-semibold text-[#171A2C] dark:text-slate-200">
                        {offering.major_name_en}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">{offering.major_slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-2 py-1 text-[10px] font-black text-[#475569] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                        {offering.degree_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-[#475569] dark:text-slate-300">
                      {offering.duration_years ? `${offering.duration_years} yrs` : "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-bold text-[#111965] dark:text-white">
                      {formatTuition(offering.tuition_annual_usd)}
                    </td>
                    <td className="px-4 py-3 text-[11px] font-semibold text-[#475569] dark:text-slate-300">
                      {offering.language_of_instruction}
                    </td>
                    <td className="px-4 py-3">
                      {offering.is_tuition_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <Check className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="rounded-full border border-[#E6E8F0] bg-[#F8FAFD] px-2 py-1 text-[10px] font-bold text-[#94A3B8] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(offering)}
                          className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                          aria-label="Edit program"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: "Remove this program?",
                              description: `${offering.major_name_en} will be removed from ${offering.university_name_en}. This action cannot be undone.`,
                              confirmLabel: "Remove program",
                              tone: "danger",
                            });
                            if (confirmed) remove(offering.id);
                          }}
                          disabled={deleting}
                          className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                          aria-label="Remove program"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={currentPage}
          pageCount={pageCount}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="programs"
          itemSingular="program"
        />
      </div>

      {dialogOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#050814]/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Edit university program" : "Add a major to a university"}
          onClick={(event) => {
            if (event.target === event.currentTarget) setDialogOpen(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[24px] border border-[#E6E8F0] bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#090D24] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                  {editing ? "Edit program" : "New program link"}
                </div>
                <h3 className="mt-1 text-lg font-black text-[#111965] dark:text-white">
                  {editing ? "Update university major" : "Add a major to a university"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-[#F0F2FA] dark:text-slate-400 dark:hover:bg-white/10"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                save();
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>University</span>
                  <Select
                    value={form.university_id}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, university_id: value }))
                    }
                    options={universities.map((university) => ({
                      value: university.id,
                      label: `${university.name_en}${university.acronym_en ? ` (${university.acronym_en})` : ""}`,
                    }))}
                    label="University"
                    placeholder="Choose a university"
                    searchable
                    className="w-full"
                    menuClassName="min-w-[280px]"
                  />
                </label>
                <label>
                  <span className={labelClass}>Major</span>
                  <Select
                    value={form.major_id}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, major_id: value }))
                    }
                    options={majors.map((major) => ({
                      value: major.id,
                      label: major.name_en,
                      description: major.category,
                    }))}
                    label="Major"
                    placeholder="Choose a major"
                    searchable
                    className="w-full"
                    menuClassName="min-w-[280px]"
                  />
                </label>
                <label>
                  <span className={labelClass}>Degree level</span>
                  <Select
                    value={form.degree_level}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, degree_level: value }))
                    }
                    options={DEGREE_OPTIONS.map((degree) => ({
                      value: degree,
                      label: degree.charAt(0) + degree.slice(1).toLowerCase(),
                    }))}
                    label="Degree level"
                    className="w-full"
                  />
                </label>
                <label>
                  <span className={labelClass}>Duration (years)</span>
                  <input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={form.duration_years}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, duration_years: event.target.value }))
                    }
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className={labelClass}>Annual tuition (USD)</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.tuition_annual_usd}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        tuition_annual_usd: event.target.value,
                      }))
                    }
                    placeholder="e.g. 580"
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className={labelClass}>Language</span>
                  <Select
                    value={form.language_of_instruction}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        language_of_instruction: value,
                      }))
                    }
                    options={LANGUAGE_OPTIONS}
                    label="Language"
                    className="w-full"
                  />
                </label>
              </div>

              <label>
                <span className={labelClass}>Official curriculum URL</span>
                <input
                  value={form.official_curriculum_url}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      official_curriculum_url: event.target.value,
                    }))
                  }
                  placeholder="https://…"
                  className={inputClass}
                />
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-[#475569] dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.is_tuition_verified}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      is_tuition_verified: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-[#D8D1C5] accent-[#111965] dark:accent-[#F7CE4D]"
                />
                Tuition verified against an official source
              </label>

              <div className="flex items-center justify-end gap-2 border-t border-[#E6E8F0] pt-4 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="h-10 rounded-xl border border-[#E6E8F0] px-4 text-xs font-bold text-[#475569] transition-colors hover:bg-[#F8FAFD] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111965] px-5 text-xs font-black text-white transition-colors hover:bg-[#1E277A] disabled:opacity-60 dark:bg-[#F7CE4D] dark:text-[#111965] dark:hover:bg-[#E5BD3B]"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editing ? "Save changes" : "Add program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
