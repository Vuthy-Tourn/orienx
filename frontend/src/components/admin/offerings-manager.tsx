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
import { useLanguage } from "@/contexts/language-context";
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
  min_bacii_grade?: string | null;
  required_subjects?: string[] | null;
  is_admission_verified?: boolean;
  admission_source_url?: string | null;
  admission_notes?: string | null;
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
  min_bacii_grade: string;
  required_subjects: string;
  is_admission_verified: boolean;
  admission_source_url: string;
  admission_notes: string;
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
  min_bacii_grade: "",
  required_subjects: "",
  is_admission_verified: false,
  admission_source_url: "",
  admission_notes: "",
};

const DEGREE_OPTIONS = ["ASSOCIATE", "BACHELOR", "MASTER", "DOCTORATE"];
const LANGUAGE_OPTIONS = [
  { value: "BILINGUAL", label: "Bilingual", labelKm: "ពីរភាសា" },
  { value: "ENGLISH", label: "English", labelKm: "អង់គ្លេស" },
  { value: "KHMER", label: "Khmer", labelKm: "ខ្មែរ" },
  { value: "FRENCH", label: "French", labelKm: "បារាំង" },
];
const PAGE_SIZE = 25;

const OFFERINGS_COPY = {
  en: {
    title: "Majors offered by each university",
    subtitle:
      "Link an existing major to an institution, set the degree level, duration, tuition, and verification status. These links power the public university program lists.",
    addProgram: "Add program",
    statLinks: "Program links",
    statUniversities: "Universities covered",
    statVerified: "Verified tuition",
    searchPlaceholder: "Search university, major, degree…",
    allUniversities: "All universities",
    university: "University",
    degree: "Degree",
    tuition: "Tuition",
    reset: "Reset",
    resetTitle: "Reset all active filters",
    showing: "Showing",
    of: "of",
    programs: "programs",
    program: "program",
    all: "All",
    verified: "Verified",
    unverified: "Unverified",
    tableUniversity: "University",
    tableMajor: "Major",
    tableDegree: "Degree",
    tableDuration: "Duration",
    tableTuition: "Tuition",
    tableLanguage: "Language",
    tableStatus: "Status",
    tableBacii: "BACII",
    tableActions: "Actions",
    minBaciiGrade: "Minimum BACII grade",
    noMinimum: "No minimum grade",
    requiredSubjects: "Required subjects",
    requiredSubjectsPlaceholder: "Mathematics, Physics, English",
    admissionSourceUrl: "Admission source URL",
    admissionNotes: "Admission notes",
    admissionNotesPlaceholder: "e.g. Entrance exam in Mathematics, Physics and English proficiency required.",
    admissionVerified: "Admission requirement verified against an official source",
    noMatches: "No program links match these filters.",
    resetAll: "Reset all filters",
    editProgram: "Edit program",
    removeProgram: "Remove program",
    removeConfirmTitle: "Remove this program?",
    removeConfirmBody:
      "This program will be removed from the university. This action cannot be undone.",
    removeConfirmLabel: "Remove program",
    newProgramLink: "New program link",
    updateProgram: "Update university major",
    addProgramTitle: "Add a major to a university",
    closeDialog: "Close dialog",
    chooseUniversity: "Choose a university",
    chooseMajor: "Choose a major",
    degreeLevel: "Degree level",
    durationYears: "Duration (years)",
    annualTuition: "Annual tuition (USD)",
    language: "Language",
    curriculumUrl: "Official curriculum URL",
    verifiedAgainstSource: "Tuition verified against an official source",
    cancel: "Cancel",
    saveChanges: "Save changes",
    chooseBoth: "Choose both a university and a major.",
    updated: "Program updated.",
    added: "Program added to university.",
    removed: "Program removed.",
    saveError: "Could not save this program.",
    removeError: "Could not remove this program.",
    yearsShort: "yrs",
    perYear: "yr",
    tuitionPlaceholder: "e.g. 580",
    degreeLabels: {
      ASSOCIATE: "Associate",
      BACHELOR: "Bachelor",
      MASTER: "Master",
      DOCTORATE: "Doctorate",
    },
  },
  km: {
    title: "មុខជំនាញដែលផ្តល់ដោយសាកលវិទ្យាល័យនីមួយៗ",
    subtitle:
      "ភ្ជាប់មុខជំនាញដែលមានស្រាប់ទៅគ្រឹះស្ថាន កំណត់កម្រិតសញ្ញាបត្រ រយៈពេល តម្លៃសិក្សា និងស្ថានភាពផ្ទៀងផ្ទាត់។ តំណទាំងនេះផ្គត់ផ្គង់បញ្ជីកម្មវិធីសិក្សាសាធារណៈ។",
    addProgram: "បន្ថែមកម្មវិធី",
    statLinks: "តំណកម្មវិធី",
    statUniversities: "សាកលវិទ្យាល័យដែលគ្របដណ្តប់",
    statVerified: "តម្លៃសិក្សាបានផ្ទៀងផ្ទាត់",
    searchPlaceholder: "ស្វែងរកសាកលវិទ្យាល័យ មុខជំនាញ កម្រិតសញ្ញាបត្រ…",
    allUniversities: "សាកលវិទ្យាល័យទាំងអស់",
    university: "សាកលវិទ្យាល័យ",
    degree: "សញ្ញាបត្រ",
    tuition: "តម្លៃសិក្សា",
    reset: "កំណត់ឡើងវិញ",
    resetTitle: "កំណត់តម្រងសកម្មទាំងអស់ឡើងវិញ",
    showing: "បង្ហាញ",
    of: "ក្នុងចំណោម",
    programs: "កម្មវិធី",
    program: "កម្មវិធី",
    all: "ទាំងអស់",
    verified: "បានផ្ទៀងផ្ទាត់",
    unverified: "មិនបានផ្ទៀងផ្ទាត់",
    tableUniversity: "សាកលវិទ្យាល័យ",
    tableMajor: "មុខជំនាញ",
    tableDegree: "សញ្ញាបត្រ",
    tableDuration: "រយៈពេល",
    tableTuition: "តម្លៃសិក្សា",
    tableLanguage: "ភាសា",
    tableStatus: "ស្ថានភាព",
    tableBacii: "BACII",
    tableActions: "សកម្មភាព",
    minBaciiGrade: "ពិន្ទុ BACII អប្បបរមា",
    noMinimum: "គ្មានពិន្ទុអប្បបរមា",
    requiredSubjects: "មុខវិជ្ជាដែលត្រូវការ",
    requiredSubjectsPlaceholder: "គណិតវិទ្យា, រូបវិទ្យា, អង់គ្លេស",
    admissionSourceUrl: "URL ប្រភពចូលរៀន",
    admissionNotes: "កំណត់ចំណាំចូលរៀន",
    admissionNotesPlaceholder: "ឧ. ត្រូវប្រឡងគណិតវិទ្យា រូបវិទ្យា និងតម្រូវការភាសាអង់គ្លេស។",
    admissionVerified: "លក្ខខណ្ឌចូលរៀនបានផ្ទៀងផ្ទាត់ជាមួយប្រភពផ្លូវការ",
    noMatches: "គ្មានតំណកម្មវិធីត្រូវនឹងតម្រងទាំងនេះទេ។",
    resetAll: "កំណត់តម្រងទាំងអស់ឡើងវិញ",
    editProgram: "កែប្រែកម្មវិធី",
    removeProgram: "ដកកម្មវិធីចេញ",
    removeConfirmTitle: "ដកកម្មវិធីនេះចេញមែនទេ?",
    removeConfirmBody:
      "កម្មវិធីនេះនឹងត្រូវដកចេញពីសាកលវិទ្យាល័យ។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
    removeConfirmLabel: "ដកកម្មវិធីចេញ",
    newProgramLink: "តំណកម្មវិធីថ្មី",
    updateProgram: "ធ្វើបច្ចុប្បន្នភាពមុខជំនាញសាកលវិទ្យាល័យ",
    addProgramTitle: "បន្ថែមមុខជំនាញទៅសាកលវិទ្យាល័យ",
    closeDialog: "បិទប្រអប់សន្ទនា",
    chooseUniversity: "ជ្រើសរើសសាកលវិទ្យាល័យ",
    chooseMajor: "ជ្រើសរើសមុខជំនាញ",
    degreeLevel: "កម្រិតសញ្ញាបត្រ",
    durationYears: "រយៈពេល (ឆ្នាំ)",
    annualTuition: "តម្លៃសិក្សាប្រចាំឆ្នាំ (USD)",
    language: "ភាសា",
    curriculumUrl: "URL កម្មវិធីសិក្សាផ្លូវការ",
    verifiedAgainstSource: "តម្លៃសិក្សាបានផ្ទៀងផ្ទាត់ជាមួយប្រភពផ្លូវការ",
    cancel: "បោះបង់",
    saveChanges: "រក្សាទុកការផ្លាស់ប្តូរ",
    chooseBoth: "ជ្រើសរើសទាំងសាកលវិទ្យាល័យ និងមុខជំនាញ។",
    updated: "បានធ្វើបច្ចុប្បន្នភាពកម្មវិធី។",
    added: "បានបន្ថែមកម្មវិធីទៅសាកលវិទ្យាល័យ។",
    removed: "បានដកកម្មវិធីចេញ។",
    saveError: "មិនអាចរក្សាទុកកម្មវិធីនេះបានទេ។",
    removeError: "មិនអាចដកកម្មវិធីនេះចេញបានទេ។",
    yearsShort: "ឆ្នាំ",
    perYear: "ឆ្នាំ",
    tuitionPlaceholder: "ឧ. 580",
    degreeLabels: {
      ASSOCIATE: "បរិញ្ញាបត្ររង",
      BACHELOR: "បរិញ្ញាបត្រ",
      MASTER: "អនុបណ្ឌិត",
      DOCTORATE: "បណ្ឌិត",
    },
  },
} as const;

const inputClass =
  "h-10 w-full rounded-xl border border-[#E6E8F0] bg-white px-3 text-[12px] font-medium text-[#111965] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#111965]/50 focus:ring-2 focus:ring-[#111965]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#F7CE4D]/60 dark:focus:ring-[#F7CE4D]/10";
const labelClass =
  "mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-[#68708A] dark:text-slate-400";

function formatTuition(value: number | null, perYear: string) {
  if (value == null) return "—";
  return `$${Math.round(value).toLocaleString("en-US")}/${perYear}`;
}

export function OfferingsManager() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { language } = useLanguage();
  const isKm = language === "km";
  const copy = OFFERINGS_COPY[language];
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
      { value: "", label: copy.all, count: offerings.length },
      ...DEGREE_OPTIONS.map((degree) => ({
        value: degree,
        label: copy.degreeLabels[degree as keyof typeof copy.degreeLabels],
        count: offerings.filter((item) => item.degree_level === degree).length,
      })),
    ],
    [offerings, copy]
  );

  const verifiedFilterOptions = useMemo(
    () => [
      { value: "", label: copy.all, count: offerings.length },
      {
        value: "true",
        label: copy.verified,
        count: offerings.filter((item) => item.is_tuition_verified).length,
      },
      {
        value: "false",
        label: copy.unverified,
        count: offerings.filter((item) => !item.is_tuition_verified).length,
      },
    ],
    [offerings, copy]
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
      min_bacii_grade: offering.min_bacii_grade || "",
      required_subjects: (offering.required_subjects || []).join(", "),
      is_admission_verified: Boolean(offering.is_admission_verified),
      admission_source_url: offering.admission_source_url || "",
      admission_notes: offering.admission_notes || "",
    });
    setDialogOpen(true);
  };

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      if (!form.university_id || !form.major_id) {
        throw new Error(copy.chooseBoth);
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
        min_bacii_grade: form.min_bacii_grade || null,
        required_subjects: form.required_subjects
          .split(",")
          .map((subject) => subject.trim())
          .filter(Boolean),
        is_admission_verified: form.is_admission_verified,
        admission_source_url: form.admission_source_url.trim() || null,
        admission_notes: form.admission_notes.trim() || null,
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
      toast.success(editing ? copy.updated : copy.added);
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, copy.saveError)),
  });

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/admin/offerings/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "offerings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "universities"] });
      toast.success(copy.removed);
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, copy.removeError)),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#111965] dark:text-white sm:text-2xl">
            {copy.title}
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#68708A] dark:text-slate-400">
            {copy.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#111965] px-4 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#1E277A] dark:bg-[#F7CE4D] dark:text-white dark:hover:bg-[#E5BD3B]"
        >
          <Plus className="h-4 w-4" />
          {copy.addProgram}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#090D24]">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
            {copy.statLinks}
          </div>
          <div className="mt-1 text-2xl font-black text-[#111965] dark:text-white">
            {offerings.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#090D24]">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
            {copy.statUniversities}
          </div>
          <div className="mt-1 text-2xl font-black text-[#111965] dark:text-white">
            {new Set(offerings.map((item) => item.university_id)).size}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E6E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#090D24]">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
            {copy.statVerified}
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
            placeholder={copy.searchPlaceholder}
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
              { value: "", label: copy.allUniversities },
              ...universities.map((university) => ({
                value: university.id,
                label: `${university.name_en}${university.acronym_en ? ` (${university.acronym_en})` : ""}`,
              })),
            ]}
            label={copy.university}
            searchable
            align="end"
            className="w-full sm:w-64"
            menuClassName="min-w-[280px]"
          />

          <AdminFilterDropdown
            label={copy.degree}
            value={degreeFilter}
            onChange={(value) => {
              setDegreeFilter(value);
              setPage(1);
            }}
            options={degreeFilterOptions}
            menuWidth="w-56"
          />

          <AdminFilterDropdown
            label={copy.tuition}
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
              title={copy.resetTitle}
            >
              <RotateCcw className="h-3 w-3" />
              <span>{copy.reset}</span>
            </button>
          )}

          <span className="border-l border-[#E6E8F0] pl-2 text-[11px] font-semibold text-[#68708A] dark:border-slate-800 dark:text-slate-400">
            {copy.showing}{" "}
            <strong className="text-[#111965] dark:text-slate-200">{filtered.length}</strong>{" "}
            {copy.of} {offerings.length}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white dark:border-white/10 dark:bg-[#090D24]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: "18%" }} />
              <col style={{ width: "23%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-[#E6E8F0] bg-[#F8FAFD] text-[10px] font-black uppercase tracking-[0.12em] text-[#68708A] dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                <th className="px-4 py-3">{copy.tableUniversity}</th>
                <th className="px-4 py-3">{copy.tableMajor}</th>
                <th className="px-4 py-3">{copy.tableDegree}</th>
                <th className="px-4 py-3">{copy.tableDuration}</th>
                <th className="px-4 py-3">{copy.tableTuition}</th>
                <th className="px-4 py-3">{copy.tableLanguage}</th>
                <th className="px-4 py-3">{copy.tableBacii}</th>
                <th className="px-4 py-3">{copy.tableStatus}</th>
                <th className="px-4 py-3 text-right">{copy.tableActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8F0] dark:divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#111965] dark:text-[#F7CE4D]" />
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-xs text-[#68708A] dark:text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <span>{copy.noMatches}</span>
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
                  </td>
                </tr>
              ) : (
                visible.map((offering, index) => (
                  <tr
                    key={offering.id}
                    className="admin-table-row transition-colors hover:bg-[#F8FAFD] dark:hover:bg-white/[0.03]"
                    style={{ animationDelay: `${Math.min(index, 12) * 22}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0F2FA] text-[#111965] dark:bg-white/10 dark:text-[#F7CE4D]">
                          <Building2 className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-[12px] font-bold text-[#111965] dark:text-white">
                            {isKm && offering.university_name_km
                              ? offering.university_name_km
                              : offering.university_name_en}
                          </div>
                          <div className="text-[10px] text-[#94A3B8]">
                            {offering.university_slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[280px] truncate text-[12px] font-semibold text-[#171A2C] dark:text-slate-200">
                        {isKm && offering.major_name_km
                          ? offering.major_name_km
                          : offering.major_name_en}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">{offering.major_slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-2 py-1 text-[10px] font-black text-[#475569] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                        {copy.degreeLabels[offering.degree_level as keyof typeof copy.degreeLabels] ?? offering.degree_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-[#475569] dark:text-slate-300">
                      {offering.duration_years
                        ? `${offering.duration_years} ${copy.yearsShort}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-bold text-[#111965] dark:text-white">
                      {formatTuition(offering.tuition_annual_usd, copy.perYear)}
                    </td>
                    <td className="px-4 py-3 text-[11px] font-semibold text-[#475569] dark:text-slate-300">
                      {(() => {
                        const option = LANGUAGE_OPTIONS.find(
                          (item) => item.value === offering.language_of_instruction
                        );
                        return option
                          ? isKm
                            ? option.labelKm
                            : option.label
                          : offering.language_of_instruction;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      {offering.min_bacii_grade ? (
                        <span
                          title={
                            offering.is_admission_verified
                              ? "Verified admission requirement"
                              : "Admission requirement not verified"
                          }
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-black",
                            offering.is_admission_verified
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          )}
                        >
                          {offering.min_bacii_grade}
                          {offering.is_admission_verified && (
                            <Check className="h-3 w-3" />
                          )}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {offering.is_tuition_verified ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <Check className="h-3 w-3" />
                          {copy.verified}
                        </span>
                      ) : (
                        <span className="whitespace-nowrap rounded-full border border-[#E6E8F0] bg-[#F8FAFD] px-2 py-1 text-[10px] font-bold text-[#94A3B8] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                          {copy.unverified}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(offering)}
                          className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                          aria-label={copy.editProgram}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: copy.removeConfirmTitle,
                              description: isKm
                                ? `${offering.major_name_en} នឹងត្រូវដកចេញពី ${offering.university_name_en}។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`
                                : `${offering.major_name_en} will be removed from ${offering.university_name_en}. This action cannot be undone.`,
                              confirmLabel: copy.removeConfirmLabel,
                              cancelLabel: copy.cancel,
                              tone: "danger",
                            });
                            if (confirmed) remove(offering.id);
                          }}
                          disabled={deleting}
                          className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                          aria-label={copy.removeProgram}
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
          itemLabel={isKm ? "កម្មវិធី" : "programs"}
          itemSingular={isKm ? "កម្មវិធី" : "program"}
        />
      </div>

      {dialogOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#050814]/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={editing ? copy.editProgram : copy.addProgramTitle}
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
                  {editing ? copy.editProgram : copy.newProgramLink}
                </div>
                <h3 className="mt-1 text-lg font-black text-[#111965] dark:text-white">
                  {editing ? copy.updateProgram : copy.addProgramTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-[#F0F2FA] dark:text-slate-400 dark:hover:bg-white/10"
                aria-label={copy.closeDialog}
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
                  <span className={labelClass}>{copy.university}</span>
                  <Select
                    value={form.university_id}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, university_id: value }))
                    }
                    options={universities.map((university) => ({
                      value: university.id,
                      label: `${university.name_en}${university.acronym_en ? ` (${university.acronym_en})` : ""}`,
                    }))}
                    label={copy.university}
                    placeholder={copy.chooseUniversity}
                    searchable
                    className="w-full"
                    menuClassName="min-w-[280px]"
                  />
                </label>
                <label>
                  <span className={labelClass}>{copy.tableMajor}</span>
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
                    label={copy.tableMajor}
                    placeholder={copy.chooseMajor}
                    searchable
                    className="w-full"
                    menuClassName="min-w-[280px]"
                  />
                </label>
                <label>
                  <span className={labelClass}>{copy.degreeLevel}</span>
                  <Select
                    value={form.degree_level}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        degree_level: value,
                        min_bacii_grade:
                          value !== "ASSOCIATE" &&
                          prev.min_bacii_grade === "F"
                            ? ""
                            : prev.min_bacii_grade,
                      }))
                    }
                    options={DEGREE_OPTIONS.map((degree) => ({
                      value: degree,
                      label:
                        copy.degreeLabels[
                          degree as keyof typeof copy.degreeLabels
                        ],
                    }))}
                    label={copy.degreeLevel}
                    className="w-full"
                  />
                </label>
                <label>
                  <span className={labelClass}>{copy.durationYears}</span>
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
                  <span className={labelClass}>{copy.annualTuition}</span>
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
                    placeholder={copy.tuitionPlaceholder}
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className={labelClass}>{copy.language}</span>
                  <Select
                    value={form.language_of_instruction}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        language_of_instruction: value,
                      }))
                    }
                    options={LANGUAGE_OPTIONS.map((option) => ({
                      value: option.value,
                      label: isKm ? option.labelKm : option.label,
                    }))}
                    label={copy.language}
                    className="w-full"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>{copy.minBaciiGrade}</span>
                  <Select
                    value={form.min_bacii_grade}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, min_bacii_grade: value }))
                    }
                    options={[
                      { value: "", label: copy.noMinimum },
                      ...(
                        form.degree_level === "ASSOCIATE"
                          ? ["A", "B", "C", "D", "E", "F"]
                          : ["A", "B", "C", "D", "E"]
                      ).map((grade) => ({
                        value: grade,
                        label: grade,
                      })),
                    ]}
                    label={copy.minBaciiGrade}
                    className="w-full"
                  />
                </label>
                <label>
                  <span className={labelClass}>{copy.requiredSubjects}</span>
                  <input
                    value={form.required_subjects}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        required_subjects: event.target.value,
                      }))
                    }
                    placeholder={copy.requiredSubjectsPlaceholder}
                    className={inputClass}
                  />
                </label>
              </div>

              <label>
                <span className={labelClass}>{copy.admissionSourceUrl}</span>
                <input
                  value={form.admission_source_url}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      admission_source_url: event.target.value,
                    }))
                  }
                  placeholder="https://…"
                  className={inputClass}
                />
              </label>

              <label>
                <span className={labelClass}>{copy.admissionNotes}</span>
                <textarea
                  value={form.admission_notes}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      admission_notes: event.target.value,
                    }))
                  }
                  rows={2}
                  placeholder={copy.admissionNotesPlaceholder}
                  className="w-full rounded-xl border border-[#E6E8F0] bg-white px-3 py-2.5 text-[12px] font-medium text-[#111965] outline-none placeholder:text-[#94A3B8] focus:border-[#111965]/50 focus:ring-2 focus:ring-[#111965]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#F7CE4D]/60 dark:focus:ring-[#F7CE4D]/10"
                />
              </label>

              <label>
                <span className={labelClass}>{copy.curriculumUrl}</span>
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
                {copy.verifiedAgainstSource}
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-[#475569] dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.is_admission_verified}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      is_admission_verified: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-[#D8D1C5] accent-[#111965] dark:accent-[#F7CE4D]"
                />
                {copy.admissionVerified}
              </label>

              <div className="flex items-center justify-end gap-2 border-t border-[#E6E8F0] pt-4 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="h-10 rounded-xl border border-[#E6E8F0] px-4 text-xs font-bold text-[#475569] transition-colors hover:bg-[#F8FAFD] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  {copy.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111965] px-5 text-xs font-black text-white transition-colors hover:bg-[#1E277A] disabled:opacity-60 dark:bg-[#F7CE4D] dark:text-[#111965] dark:hover:bg-[#E5BD3B]"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editing ? copy.saveChanges : copy.addProgram}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
