"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileSpreadsheet,
  GraduationCap,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, getErrorMessage } from "@/lib/utils";

type CoverageStatus = "VERIFIED" | "MISSING" | "UNVERIFIED";
type DegreeFilter = "ALL" | "BACHELOR" | "ASSOCIATE";
type StatusFilter = "ALL" | CoverageStatus;

interface CoverageProgram {
  id: string;
  university_id: string;
  university_slug: string;
  university_name_en: string;
  university_name_km: string;
  university_acronym_en: string;
  university_acronym_km: string;
  university_type: string;
  province: string;
  major_slug: string;
  major_name_en: string;
  major_name_km: string;
  major_category: string;
  degree_level: string;
  duration_years?: number | null;
  min_bacii_grade?: string | null;
  required_subjects?: string[] | null;
  is_admission_verified: boolean;
  admission_source_url?: string | null;
  admission_notes?: string | null;
  last_checked?: string | null;
  status: CoverageStatus;
}

interface CoverageInstitution {
  university_id: string;
  slug: string;
  name_en: string;
  name_km: string;
  acronym_en: string;
  acronym_km: string;
  university_type: string;
  province: string;
  total_programs: number;
  verified_programs: number;
  missing_programs: number;
  unverified_programs: number;
  coverage_percent: number;
  last_checked?: string | null;
}

interface CoverageSummary {
  total_programs: number;
  verified_programs: number;
  missing_programs: number;
  unverified_programs: number;
  coverage_percent: number;
  institutions_total: number;
  institutions_covered: number;
  institutions_with_missing: number;
  missing_source_programs: number;
  last_checked?: string | null;
}

interface CoverageData {
  summary: CoverageSummary;
  institutions: CoverageInstitution[];
  programs: CoverageProgram[];
}

interface ImportRow {
  offering_id: string;
  min_bacii_grade?: string | null;
  is_admission_verified?: boolean;
  admission_source_url?: string | null;
  admission_notes?: string | null;
}

const PAGE_SIZE = 12;

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (character !== "\r") {
      field += character;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((entry) => entry.some((cell) => cell.trim() !== ""));
}

function localDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

export function AdmissionsCoverageManager() {
  const { t, language } = useLanguage();
  const isKm = language === "km";
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [degreeFilter, setDegreeFilter] = useState<DegreeFilter>("ALL");
  const [universityFilter, setUniversityFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<CoverageProgram | null>(null);
  const [grade, setGrade] = useState("");
  const [verified, setVerified] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [importing, setImporting] = useState(false);

  const copy = useMemo(
    () => ({
      title: isKm ? "គម្របទិន្នន័យចូលរៀន" : "Admission data coverage",
      subtitle: isKm
        ? "តាមដានលក្ខខណ្ឌ BACII ដែលបានផ្ទៀងផ្ទាត់ និងរកឃើញកម្មវិធីដែលនៅខ្វះទិន្នន័យ។"
        : "Track verified BACII requirements and find programs that still need admission data.",
      total: isKm ? "កម្មវិធីសរុប" : "Total programs",
      verified: isKm ? "បានផ្ទៀងផ្ទាត់" : "Verified requirements",
      missing: isKm ? "ខ្វះលក្ខខណ្ឌ" : "Missing requirements",
      unverified: isKm ? "មិនបានផ្ទៀងផ្ទាត់" : "Unverified requirements",
      coverage: isKm ? "គម្រប" : "Coverage",
      institutions: isKm ? "គ្រឹះស្ថានដែលគ្របដណ្តប់" : "Institutions covered",
      missingSource: isKm ? "ខ្វះ URL ប្រភព" : "Missing official source",
      overallCoverage: isKm ? "គម្របសរុប" : "Overall coverage",
      lastChecked: isKm ? "ផ្ទៀងផ្ទាត់ចុងក្រោយ" : "Last checked",
      institutionCoverage: isKm ? "គម្របតាមគ្រឹះស្ថាន" : "Institution coverage",
      institutionHint: isKm
        ? "ចុចលើគ្រឹះស្ថានដើម្បីត្រងកម្មវិធីខាងក្រោម។"
        : "Select an institution to filter the programs below.",
      allInstitutions: isKm ? "គ្រឹះស្ថានទាំងអស់" : "All institutions",
      programRequirements: isKm ? "លក្ខខណ្ឌកម្មវិធីសិក្សា" : "Program requirements",
      programHint: isKm
        ? "ពិនិត្យ កែប្រែ និងនាំចេញទិន្នន័យលក្ខខណ្ឌចូលរៀន។"
        : "Review, edit, and export admission requirement data.",
      searchPlaceholder: isKm
        ? "ស្វែងរកសាកលវិទ្យាល័យ ឬកម្មវិធីសិក្សា…"
        : "Search university or program…",
      allStatuses: isKm ? "ស្ថានភាពទាំងអស់" : "All statuses",
      allDegrees: isKm ? "កម្រិតទាំងអស់" : "All degree levels",
      bachelor: isKm ? "បរិញ្ញាបត្រ" : "Bachelor",
      associate: isKm ? "បរិញ្ញាបត្ររង" : "Associate",
      program: isKm ? "កម្មវិធីសិក្សា" : "Program",
      institution: isKm ? "គ្រឹះស្ថាន" : "Institution",
      degree: isKm ? "កម្រិត" : "Degree",
      minGrade: isKm ? "ពិន្ទុអប្បបរមា" : "Min grade",
      status: isKm ? "ស្ថានភាព" : "Status",
      source: isKm ? "ប្រភព" : "Source",
      actions: isKm ? "សកម្មភាព" : "Actions",
      review: isKm ? "ពិនិត្យ" : "Review",
      exportCsv: isKm ? "នាំចេញ CSV" : "Export CSV",
      importCsv: isKm ? "នាំចូល CSV" : "Import CSV",
      refresh: isKm ? "ផ្ទុកឡើងវិញ" : "Refresh",
      verifiedStatus: isKm ? "បានផ្ទៀងផ្ទាត់" : "Verified",
      missingStatus: isKm ? "ខ្វះ" : "Missing",
      unverifiedStatus: isKm ? "មិនបានផ្ទៀងផ្ទាត់" : "Unverified",
      noResults: isKm ? "គ្មានកម្មវិធីត្រូវនឹងតម្រងទេ។" : "No programs match these filters.",
      exportEmpty: isKm ? "គ្មានជួរសម្រាប់នាំចេញទេ។" : "There are no rows to export.",
      exported: isKm ? "បាននាំចេញ CSV។" : "CSV exported.",
      importTitle: isKm ? "នាំចូលទិន្នន័យចូលរៀន?" : "Import admission data?",
      importBody: isKm
        ? "ឯកសារនេះនឹងធ្វើបច្ចុប្បន្នភាពលក្ខខណ្ឌចូលរៀន។ សូមពិនិត្យជួរឈរ offering_id, min_bacii_grade, is_admission_verified, admission_source_url និង admission_notes។"
        : "This file will update admission requirements. Use the columns offering_id, min_bacii_grade, is_admission_verified, admission_source_url, and admission_notes.",
      importConfirm: isKm ? "នាំចូល" : "Import",
      importSuccess: isKm ? "បានធ្វើបច្ចុប្បន្នភាព {count} កម្មវិធី។" : "Updated {count} program(s).",
      importErrors: isKm ? "{count} ជួរមានបញ្ហា។" : "{count} row(s) had errors.",
      importFailed: isKm ? "មិនអាចនាំចូល CSV បានទេ។" : "Could not import the CSV.",
      importInvalid: isKm
        ? "ឯកសារ CSV ត្រូវការជួរឈរ offering_id។"
        : "The CSV must include an offering_id column.",
      reviewTitle: isKm ? "ពិនិត្យលក្ខខណ្ឌចូលរៀន" : "Review admission requirement",
      reviewSubtitle: isKm
        ? "កែប្រែពិន្ទុអប្បបរមា ប្រភព និងកំណត់ចំណាំសម្រាប់កម្មវិធីនេះ។"
        : "Update the minimum grade, source, and notes for this program.",
      minGradeLabel: isKm ? "ពិន្ទុ BACII អប្បបរមា" : "Minimum BACII grade",
      verifiedLabel: isKm ? "បានផ្ទៀងផ្ទាត់ជាមួយប្រភពផ្លូវការ" : "Verified against an official source",
      sourceLabel: isKm ? "URL ប្រភពផ្លូវការ" : "Official source URL",
      notesLabel: isKm ? "កំណត់ចំណាំចូលរៀន" : "Admission notes",
      save: isKm ? "រក្សាទុក" : "Save changes",
      saving: isKm ? "កំពុងរក្សាទុក…" : "Saving…",
      saved: isKm ? "បានធ្វើបច្ចុប្បន្នភាពលក្ខខណ្ឌ។" : "Admission requirement updated.",
      saveError: isKm ? "មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ។" : "Could not update the requirement.",
      noSource: isKm ? "គ្មានប្រភព" : "No source",
      previous: isKm ? "មុន" : "Previous",
      next: isKm ? "បន្ទាប់" : "Next",
      page: isKm ? "ទំព័រ" : "Page",
      showing: isKm ? "បង្ហាញ" : "Showing",
      of: isKm ? "ក្នុង" : "of",
    }),
    [isKm]
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admission-coverage"],
    queryFn: async () => apiFetch<CoverageData>("/admin/admission-coverage"),
  });

  const summary = data?.summary;
  const institutions = useMemo(() => data?.institutions ?? [], [data]);
  const programs = useMemo(() => data?.programs ?? [], [data]);

  const filteredInstitutions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return institutions;
    return institutions.filter((institution) =>
      [
        institution.name_en,
        institution.name_km,
        institution.acronym_en,
        institution.acronym_km,
        institution.province,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle))
    );
  }, [institutions, search]);

  const scopedPrograms = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return programs.filter((program) => {
      if (universityFilter !== "ALL" && program.university_id !== universityFilter) {
        return false;
      }
      if (degreeFilter !== "ALL" && program.degree_level !== degreeFilter) {
        return false;
      }
      if (!needle) return true;
      return [
        program.university_name_en,
        program.university_name_km,
        program.university_acronym_en,
        program.university_acronym_km,
        program.major_name_en,
        program.major_name_km,
        program.province,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle));
    });
  }, [programs, search, universityFilter, degreeFilter]);

  const filteredPrograms = useMemo(() => {
    const ranked =
      statusFilter === "ALL"
        ? scopedPrograms
        : scopedPrograms.filter((program) => program.status === statusFilter);
    return [...ranked].sort((left, right) => {
      const rank = { MISSING: 0, UNVERIFIED: 1, VERIFIED: 2 };
      return (
        rank[left.status] - rank[right.status] ||
        left.university_name_en.localeCompare(right.university_name_en) ||
        left.major_name_en.localeCompare(right.major_name_en)
      );
    });
  }, [scopedPrograms, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredPrograms.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const selectedUniversity = institutions.find(
    (institution) => institution.university_id === universityFilter
  );

  const statusCounts = useMemo(
    () => ({
      ALL: scopedPrograms.length,
      VERIFIED: scopedPrograms.filter((program) => program.status === "VERIFIED").length,
      MISSING: scopedPrograms.filter((program) => program.status === "MISSING").length,
      UNVERIFIED: scopedPrograms.filter((program) => program.status === "UNVERIFIED").length,
    }),
    [scopedPrograms]
  );

  const statusLabel = (status: CoverageStatus) =>
    status === "VERIFIED"
      ? copy.verifiedStatus
      : status === "MISSING"
      ? copy.missingStatus
      : copy.unverifiedStatus;

  const statusClass = (status: CoverageStatus) =>
    status === "VERIFIED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
      : status === "MISSING"
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
      : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";

  const institutionName = (institution: CoverageInstitution) =>
    isKm && institution.name_km
      ? institution.name_km
      : institution.name_en || institution.name_km;

  const programName = (program: CoverageProgram) =>
    isKm && program.major_name_km
      ? program.major_name_km
      : program.major_name_en || program.major_name_km;

  const programUniversity = (program: CoverageProgram) =>
    isKm && program.university_name_km
      ? program.university_name_km
      : program.university_name_en || program.university_name_km;

  const openReview = (program: CoverageProgram) => {
    setEditing(program);
    setGrade(program.min_bacii_grade || "");
    setVerified(program.is_admission_verified);
    setSourceUrl(program.admission_source_url || "");
    setNotes(program.admission_notes || "");
  };

  const { mutate: saveRequirement, isPending: saving } = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      return apiFetch(`/admin/offerings/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          min_bacii_grade: grade || null,
          is_admission_verified: verified,
          admission_source_url: sourceUrl.trim() || null,
          admission_notes: notes.trim() || null,
        }),
      });
    },
    onSuccess: () => {
      toast.success(copy.saved);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admission-coverage"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "offerings"] });
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, copy.saveError)),
  });

  const { mutate: importRows, isPending: importingNow } = useMutation({
    mutationFn: async (rows: ImportRow[]) =>
      apiFetch<{ updated: number; errors: { offering_id: string; error: string }[] }>(
        "/admin/admission-coverage/import",
        {
          method: "POST",
          body: JSON.stringify({ rows }),
        }
      ),
    onSuccess: (result) => {
      toast.success(copy.importSuccess.replace("{count}", String(result.updated)));
      if (result.errors?.length) {
        toast.warning(
          copy.importErrors.replace("{count}", String(result.errors.length))
        );
      }
      queryClient.invalidateQueries({ queryKey: ["admission-coverage"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "offerings"] });
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, copy.importFailed)),
    onSettled: () => setImporting(false),
  });

  const exportCsv = () => {
    if (filteredPrograms.length === 0) {
      toast.warning(copy.exportEmpty);
      return;
    }
    const headers = [
      "offering_id",
      "university",
      "acronym",
      "major",
      "degree_level",
      "min_bacii_grade",
      "is_admission_verified",
      "admission_source_url",
      "admission_notes",
      "last_checked",
    ];
    const rows = filteredPrograms.map((program) => [
      program.id,
      program.university_name_en,
      program.university_acronym_en,
      program.major_name_en,
      program.degree_level,
      program.min_bacii_grade || "",
      String(program.is_admission_verified),
      program.admission_source_url || "",
      program.admission_notes || "",
      program.last_checked || "",
    ]);
    const csv = `\uFEFF${[headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `orienx-admission-coverage-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(copy.exported);
  };

  const importCsv = async (file: File) => {
    try {
      const text = await file.text();
      const rows = parseCsv(text.replace(/^\uFEFF/, ""));
      if (rows.length < 2) throw new Error(copy.importInvalid);
      const headers = rows[0].map((header) => header.trim().toLowerCase());
      const idIndex = headers.indexOf("offering_id");
      if (idIndex === -1) throw new Error(copy.importInvalid);
      const indexOf = (name: string) => headers.indexOf(name);
      const gradeIndex = indexOf("min_bacii_grade");
      const verifiedIndex = indexOf("is_admission_verified");
      const sourceIndex = indexOf("admission_source_url");
      const notesIndex = indexOf("admission_notes");

      const parsed: ImportRow[] = rows
        .slice(1)
        .map((cells) => {
          const offeringId = (cells[idIndex] || "").trim();
          if (!offeringId) return null;
          const parsedRow: ImportRow = { offering_id: offeringId };
          if (gradeIndex >= 0) {
            parsedRow.min_bacii_grade =
              (cells[gradeIndex] || "").trim().toUpperCase() || null;
          }
          if (verifiedIndex >= 0) {
            const rawVerified = (cells[verifiedIndex] || "").trim().toLowerCase();
            if (rawVerified) {
              parsedRow.is_admission_verified = [
                "true",
                "1",
                "yes",
                "verified",
              ].includes(rawVerified);
            }
          }
          if (sourceIndex >= 0) {
            parsedRow.admission_source_url =
              (cells[sourceIndex] || "").trim() || null;
          }
          if (notesIndex >= 0) {
            parsedRow.admission_notes =
              (cells[notesIndex] || "").trim() || null;
          }
          return parsedRow;
        })
        .filter((row): row is ImportRow => row !== null);

      if (parsed.length === 0) throw new Error(copy.importInvalid);
      setImporting(true);
      const confirmed = await confirm({
        title: copy.importTitle,
        description: `${parsed.length} ${copy.of} ${copy.program.toLowerCase()} — ${copy.importBody}`,
        confirmLabel: copy.importConfirm,
        cancelLabel: isKm ? "បោះបង់" : "Cancel",
        tone: "primary",
      });
      if (!confirmed) {
        setImporting(false);
        return;
      }
      importRows(parsed);
    } catch (error) {
      setImporting(false);
      toast.error(
        error instanceof Error ? error.message : copy.importFailed
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void importCsv(file);
  };

  const clearUniversity = () => setUniversityFilter("ALL");

  return (
    <div data-dashboard-page="sections" className="space-y-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-[#111965] dark:text-white">
            <ShieldCheck className="h-5 w-5 text-[#F69D0D]" />
            <h1 className="text-xl font-black tracking-tight sm:text-3xl">
              {copy.title}
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-[#68708A] dark:text-slate-400 sm:text-sm">
            {copy.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing || importingNow}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E6E8F0] dark:border-white/10 bg-white dark:bg-white/[0.04] px-3 text-[11px] font-bold text-[#111965] dark:text-white hover:bg-[#F8FAFD] dark:hover:bg-white/10 disabled:opacity-60"
          >
            {importing || importingNow ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {copy.importCsv}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E6E8F0] dark:border-white/10 bg-white dark:bg-white/[0.04] px-3 text-[11px] font-bold text-[#111965] dark:text-white hover:bg-[#F8FAFD] dark:hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" />
            {copy.exportCsv}
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#111965] dark:bg-indigo-600 px-3 text-[11px] font-black text-white hover:bg-[#1E277A] dark:hover:bg-indigo-500 disabled:opacity-60"
          >
            {isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {copy.refresh}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-xs text-[#68708A] dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("common.loading", "Loading...")}
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#E6E8F0] dark:border-white/10 bg-white dark:bg-[#090D24] p-4 shadow-2xs">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0F2FA] dark:bg-white/10 text-[#111965] dark:text-white">
                <GraduationCap className="h-4 w-4" />
              </span>
              <div className="mt-2 text-2xl font-black tabular-nums text-[#111965] dark:text-white">
                {summary.total_programs}
              </div>
              <div className="text-[11px] font-semibold text-[#68708A] dark:text-slate-400">
                {copy.total}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-4 shadow-2xs">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div className="mt-2 text-2xl font-black tabular-nums text-emerald-800 dark:text-emerald-300">
                {summary.verified_programs}
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                {copy.verified} · {summary.coverage_percent}%
              </div>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/10 p-4 shadow-2xs">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div className="mt-2 text-2xl font-black tabular-nums text-rose-800 dark:text-rose-300">
                {summary.missing_programs}
              </div>
              <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                {copy.missing}
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10 p-4 shadow-2xs">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="mt-2 text-2xl font-black tabular-nums text-amber-800 dark:text-amber-300">
                {summary.institutions_covered}/{summary.institutions_total}
              </div>
              <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                {copy.institutions}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E6E8F0] dark:border-white/10 bg-white dark:bg-[#090D24] p-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#111965] dark:text-white">
                <ShieldCheck className="h-4 w-4 text-[#F69D0D]" />
                {copy.overallCoverage}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10.5px] font-semibold text-[#68708A] dark:text-slate-400">
                <span>
                  {copy.unverified}: {summary.unverified_programs}
                </span>
                <span>
                  {copy.missingSource}: {summary.missing_source_programs}
                </span>
                <span>
                  {copy.lastChecked}: {localDate(summary.last_checked)}
                </span>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F0F2FA] dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#111965] to-[#F7CE4D]"
                style={{ width: `${summary.coverage_percent}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E6E8F0] dark:border-white/10 bg-white dark:bg-[#090D24] p-4 shadow-2xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-black text-[#111965] dark:text-white">
                  {copy.institutionCoverage}
                </h2>
                <p className="mt-0.5 text-[11px] text-[#68708A] dark:text-slate-400">
                  {copy.institutionHint}
                </p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#68708A] dark:text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder={copy.searchPlaceholder}
                  className="h-9 w-full rounded-xl border border-[#E6E8F0] dark:border-white/10 bg-[#F8FAFD] dark:bg-white/[0.04] pl-8 pr-3 text-[11px] text-[#171A2C] dark:text-slate-200 outline-none focus:border-[#111965] focus:bg-white dark:focus:bg-[#090D24]"
                />
              </div>
            </div>

            <div className="mt-3 max-h-[320px] overflow-auto rounded-xl border border-[#E6E8F0] dark:border-white/10">
              <table className="w-full min-w-[680px] text-left text-[11px]">
                <thead className="sticky top-0 z-10 bg-[#F8FAFD] dark:bg-white/[0.04] text-[9px] uppercase tracking-[0.08em] text-[#68708A] dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2">{copy.institution}</th>
                    <th className="px-3 py-2 text-right">{copy.total}</th>
                    <th className="px-3 py-2 text-right">{copy.verified}</th>
                    <th className="px-3 py-2 text-right">{copy.missing}</th>
                    <th className="px-3 py-2">{copy.coverage}</th>
                    <th className="px-3 py-2">{copy.lastChecked}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2FA] dark:divide-white/10">
                  {filteredInstitutions.map((institution) => {
                    const active =
                      institution.university_id === universityFilter;
                    return (
                      <tr
                        key={institution.university_id}
                        onClick={() =>
                          setUniversityFilter(
                            active ? "ALL" : institution.university_id
                          )
                        }
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-[#F8FAFD] dark:hover:bg-white/10",
                          active && "bg-[#F0F2FA] dark:bg-white/10"
                        )}
                      >
                        <td className="px-3 py-2">
                          <div className="font-bold text-[#111965] dark:text-white">
                            {institutionName(institution)}
                          </div>
                          <div className="text-[10px] text-[#68708A] dark:text-slate-400">
                            {institution.acronym_en} · {institution.province}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-[#475569] dark:text-slate-300">
                          {institution.total_programs}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold text-emerald-700 dark:text-emerald-300">
                          {institution.verified_programs}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold text-rose-700 dark:text-rose-300">
                          {institution.missing_programs +
                            institution.unverified_programs}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#F0F2FA] dark:bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#111965] to-[#F7CE4D]"
                                style={{
                                  width: `${institution.coverage_percent}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-[#68708A] dark:text-slate-400">
                              {institution.coverage_percent}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-[10px] text-[#68708A] dark:text-slate-400">
                          {localDate(institution.last_checked)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div
            id="admission-program-table"
            className="rounded-2xl border border-[#E6E8F0] dark:border-white/10 bg-white dark:bg-[#090D24] p-4 shadow-2xs"
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-sm font-black text-[#111965] dark:text-white">
                    {copy.programRequirements}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#68708A] dark:text-slate-400">
                    {copy.programHint}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="w-[150px]">
                    <Select
                      value={degreeFilter}
                      onChange={(value) => {
                        setDegreeFilter(value as DegreeFilter);
                        setPage(1);
                      }}
                      options={[
                        { value: "ALL", label: copy.allDegrees },
                        { value: "BACHELOR", label: copy.bachelor },
                        { value: "ASSOCIATE", label: copy.associate },
                      ]}
                      label={copy.degree}
                      size="sm"
                      className="w-full"
                    />
                  </div>
                  {selectedUniversity && (
                    <button
                      type="button"
                      onClick={clearUniversity}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#111965]/20 bg-[#F0F2FA] dark:bg-white/10 px-3 text-[10.5px] font-bold text-[#111965] dark:text-white"
                    >
                      {institutionName(selectedUniversity)}
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["ALL", copy.allStatuses],
                    ["MISSING", copy.missingStatus],
                    ["UNVERIFIED", copy.unverifiedStatus],
                    ["VERIFIED", copy.verifiedStatus],
                  ] as Array<[StatusFilter, string]>
                ).map(([value, label]) => {
                  const active = statusFilter === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(value);
                        setPage(1);
                      }}
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10.5px] font-bold transition-colors",
                        active
                          ? "border-[#111965] dark:border-indigo-600 bg-[#111965] dark:bg-indigo-600 text-white"
                          : "border-[#E6E8F0] dark:border-white/10 bg-white dark:bg-[#090D24] text-[#68708A] dark:text-slate-400 hover:text-[#111965] dark:text-white"
                      )}
                    >
                      {label}
                      <span
                        className={cn(
                          "rounded-md px-1 py-0.5 text-[9px] tabular-nums",
                          active
                            ? "bg-white/15 text-white"
                            : "bg-[#F0F2FA] dark:bg-white/10 text-[#68708A] dark:text-slate-400"
                        )}
                      >
                        {statusCounts[value]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-[11px]">
                <thead className="bg-[#F8FAFD] dark:bg-white/[0.04] text-[9px] uppercase tracking-[0.08em] text-[#68708A] dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2">{copy.institution}</th>
                    <th className="px-3 py-2">{copy.program}</th>
                    <th className="px-3 py-2">{copy.degree}</th>
                    <th className="px-3 py-2">{copy.minGrade}</th>
                    <th className="px-3 py-2">{copy.status}</th>
                    <th className="px-3 py-2">{copy.source}</th>
                    <th className="px-3 py-2">{copy.lastChecked}</th>
                    <th className="px-3 py-2 text-right">{copy.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2FA] dark:divide-white/10">
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-xs text-[#68708A] dark:text-slate-400">
                        {copy.noResults}
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((program) => (
                      <tr key={program.id} className="hover:bg-[#F8FAFD] dark:hover:bg-white/10">
                        <td className="px-3 py-2">
                          <div className="font-bold text-[#111965] dark:text-white">
                            {programUniversity(program)}
                          </div>
                          <div className="text-[10px] text-[#68708A] dark:text-slate-400">
                            {program.university_acronym_en} · {program.province}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-semibold text-[#171A2C] dark:text-slate-200">
                            {programName(program)}
                          </div>
                          <div className="text-[10px] text-[#68708A] dark:text-slate-400">
                            {program.major_category}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="rounded-md border border-[#E6E8F0] dark:border-white/10 bg-[#F8FAFD] dark:bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-bold text-[#68708A] dark:text-slate-400">
                            {program.degree_level === "ASSOCIATE"
                              ? copy.associate
                              : copy.bachelor}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {program.min_bacii_grade ? (
                            <span
                              className={cn(
                                "rounded-md border px-1.5 py-0.5 text-[10px] font-black",
                                program.min_bacii_grade === "F"
                                  ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                                  : "border-[#111965]/15 bg-[#F0F2FA] dark:bg-white/10 text-[#111965] dark:text-white"
                              )}
                            >
                              {program.min_bacii_grade}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#94A3B8] dark:text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              "rounded-md border px-1.5 py-0.5 text-[9px] font-bold",
                              statusClass(program.status)
                            )}
                          >
                            {statusLabel(program.status)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {program.admission_source_url ? (
                            <a
                              href={program.admission_source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] hover:underline dark:text-blue-400"
                            >
                              {copy.source}
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-[#94A3B8] dark:text-slate-500">
                              {copy.noSource}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-[#68708A] dark:text-slate-400">
                          {localDate(program.last_checked)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => openReview(program)}
                            className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#E6E8F0] dark:border-white/10 bg-white dark:bg-white/[0.04] px-2 text-[10px] font-bold text-[#111965] dark:text-white hover:bg-[#F0F2FA] dark:hover:bg-white/10"
                          >
                            <Pencil className="h-2.5 w-2.5" />
                            {copy.review}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-[#68708A] dark:text-slate-400">
              <span>
                {copy.showing} {pageRows.length} {copy.of}{" "}
                {filteredPrograms.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#E6E8F0] dark:border-white/10 bg-white dark:bg-white/[0.04] px-2 font-bold text-[#111965] dark:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="h-3 w-3" />
                  {copy.previous}
                </button>
                <span className="font-bold text-[#475569] dark:text-slate-300">
                  {copy.page} {currentPage}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#E6E8F0] dark:border-white/10 bg-white dark:bg-white/[0.04] px-2 font-bold text-[#111965] dark:text-white disabled:opacity-40"
                >
                  {copy.next}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#D9DEEA] dark:border-white/10 bg-white dark:bg-[#090D24] p-8 text-center text-xs text-[#68708A] dark:text-slate-400">
          <FileSpreadsheet className="mx-auto h-6 w-6 text-[#94A3B8] dark:text-slate-500" />
          <p className="mt-2">{copy.noResults}</p>
        </div>
      )}

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        className="max-h-[90vh] max-w-lg overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{copy.reviewTitle}</DialogTitle>
          <DialogDescription>{copy.reviewSubtitle}</DialogDescription>
        </DialogHeader>
        {editing && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveRequirement();
            }}
            className="space-y-3.5"
          >
            <div className="rounded-xl border border-[#E6E8F0] dark:border-white/10 bg-[#F8FAFD] dark:bg-white/[0.04] px-3 py-2">
              <div className="text-[11px] font-black text-[#111965] dark:text-white">
                {programName(editing)}
              </div>
              <div className="text-[10px] text-[#68708A] dark:text-slate-400">
                {programUniversity(editing)} ·{" "}
                {editing.degree_level === "ASSOCIATE"
                  ? copy.associate
                  : copy.bachelor}
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                {copy.minGradeLabel}
              </span>
              <Select
                value={grade}
                onChange={setGrade}
                options={[
                  { value: "", label: isKm ? "គ្មានពិន្ទុ" : "No minimum grade" },
                  ...["A", "B", "C", "D", "E", ...(editing.degree_level === "ASSOCIATE" ? ["F"] : [])].map(
                    (value) => ({ value, label: value })
                  ),
                ]}
                label={copy.minGradeLabel}
                className="w-full"
              />
            </label>

            <button
              type="button"
              onClick={() => setVerified((value) => !value)}
              className="inline-flex items-center gap-2 text-[11px] font-bold text-[#475569] dark:text-slate-300"
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded border",
                  verified
                    ? "border-[#111965] dark:border-indigo-600 bg-[#111965] dark:bg-indigo-600 text-white"
                    : "border-[#D9DEEA] dark:border-white/10 bg-white dark:bg-[#090D24]"
                )}
              >
                {verified && <CheckCircle2 className="h-3 w-3" />}
              </span>
              {copy.verifiedLabel}
            </button>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                {copy.sourceLabel}
              </span>
              <input
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                maxLength={500}
                placeholder="https://"
                className="h-10 w-full rounded-xl border border-[#E6E8F0] dark:border-white/10 bg-[#F8FAFD] dark:bg-white/[0.04] px-3 text-xs text-[#171A2C] dark:text-slate-200 outline-none focus:border-[#111965] focus:bg-white dark:focus:bg-[#090D24]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                {copy.notesLabel}
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full rounded-xl border border-[#E6E8F0] dark:border-white/10 bg-[#F8FAFD] dark:bg-white/[0.04] px-3 py-2.5 text-xs text-[#171A2C] dark:text-slate-200 outline-none focus:border-[#111965] focus:bg-white dark:focus:bg-[#090D24]"
              />
            </label>

            <div className="flex items-center justify-end gap-2 border-t border-[#E6E8F0] dark:border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-9 rounded-xl border border-[#E6E8F0] dark:border-white/10 px-3.5 text-[11px] font-bold text-[#475569] dark:text-slate-300 hover:bg-[#F8FAFD] dark:hover:bg-white/10"
              >
                {isKm ? "បោះបង់" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#111965] dark:bg-indigo-600 px-4 text-[11px] font-black text-white hover:bg-[#1E277A] dark:hover:bg-indigo-500 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                {saving ? copy.saving : copy.save}
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
