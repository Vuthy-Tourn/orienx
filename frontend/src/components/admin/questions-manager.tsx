"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  Check,
  Compass,
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
import { cn, getErrorMessage } from "@/lib/utils";
import { AdminFilterDropdown } from "./admin-filter-dropdown";
import { AdminPagination } from "./admin-pagination";

type QuestionTab = "personality" | "riasec";

interface PersonalityOption {
  id?: string;
  label_en: string;
  label_km: string;
  target_trait: string;
  weight: number;
  order_index: number;
}

interface PersonalityQuestion {
  id: string;
  dimension: string;
  prompt_en: string;
  prompt_km: string;
  order_index: number;
  is_active: boolean;
  options: PersonalityOption[];
}

interface RiasecQuestion {
  id: string;
  category: string;
  prompt_en: string;
  prompt_km: string;
  order_index: number;
  is_active: boolean;
}

const DIMENSIONS = [
  { value: "EI", label: "EI — Extraversion / Introversion" },
  { value: "SN", label: "SN — Sensing / Intuition" },
  { value: "TF", label: "TF — Thinking / Feeling" },
  { value: "JP", label: "JP — Judging / Perceiving" },
];

const DIMENSION_TRAITS: Record<string, string[]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

const RIASEC_CATEGORIES = [
  { value: "R", label: "R — Realistic" },
  { value: "I", label: "I — Investigative" },
  { value: "A", label: "A — Artistic" },
  { value: "S", label: "S — Social" },
  { value: "E", label: "E — Enterprising" },
  { value: "C", label: "C — Conventional" },
];

const PAGE_SIZE = 10;

const inputClass =
  "h-10 w-full rounded-xl border border-[#E6E8F0] bg-white px-3 text-[12px] font-medium text-[#111965] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#111965]/50 focus:ring-2 focus:ring-[#111965]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#F7CE4D]/60 dark:focus:ring-[#F7CE4D]/10";
const textareaClass =
  "w-full rounded-xl border border-[#E6E8F0] bg-white px-3 py-2.5 text-[12px] font-medium leading-relaxed text-[#111965] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#111965]/50 focus:ring-2 focus:ring-[#111965]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#F7CE4D]/60 dark:focus:ring-[#F7CE4D]/10";
const labelClass =
  "mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-[#68708A] dark:text-slate-400";

function defaultOptions(dimension: string): PersonalityOption[] {
  return DIMENSION_TRAITS[dimension].map((trait, index) => ({
    label_en: index === 0 ? "Agree" : "Disagree",
    label_km: index === 0 ? "យល់ស្រប" : "មិនយល់ស្រប",
    target_trait: trait,
    weight: 1,
    order_index: index + 1,
  }));
}

type PersonalityForm = {
  dimension: string;
  prompt_en: string;
  prompt_km: string;
  order_index: string;
  is_active: boolean;
  options: PersonalityOption[];
};

const EMPTY_PERSONALITY: PersonalityForm = {
  dimension: "EI",
  prompt_en: "",
  prompt_km: "",
  order_index: "",
  is_active: true,
  options: defaultOptions("EI"),
};

type RiasecForm = {
  category: string;
  prompt_en: string;
  prompt_km: string;
  order_index: string;
  is_active: boolean;
};

const EMPTY_RIASEC: RiasecForm = {
  category: "R",
  prompt_en: "",
  prompt_km: "",
  order_index: "",
  is_active: true,
};

export function QuestionsManager() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState<QuestionTab>("personality");
  const [search, setSearch] = useState("");
  const [dimensionFilter, setDimensionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [personalityForm, setPersonalityForm] =
    useState<PersonalityForm>(EMPTY_PERSONALITY);
  const [riasecForm, setRiasecForm] = useState<RiasecForm>(EMPTY_RIASEC);

  const { data: personalityQuestions = [], isLoading: loadingPersonality } =
    useQuery({
      queryKey: ["admin", "questions", "personality"],
      queryFn: async () =>
        apiFetch<PersonalityQuestion[]>("/admin/questions/personality"),
    });
  const { data: riasecQuestions = [], isLoading: loadingRiasec } = useQuery({
    queryKey: ["admin", "questions", "riasec"],
    queryFn: async () => apiFetch<RiasecQuestion[]>("/admin/questions/riasec"),
  });

  const activeList = tab === "personality" ? personalityQuestions : riasecQuestions;
  const activeCount = activeList.filter((question) => question.is_active).length;

  const dimensionFilterOptions = useMemo(() => {
    const source = tab === "personality" ? personalityQuestions : riasecQuestions;
    const categories =
      tab === "personality"
        ? DIMENSIONS.map(({ value }) => ({ value, label: value }))
        : RIASEC_CATEGORIES;

    return [
      { value: "", label: "All", count: source.length },
      ...categories.map((category) => ({
        ...category,
        count: source.filter(
          (question) =>
            (tab === "personality"
              ? (question as PersonalityQuestion).dimension
              : (question as RiasecQuestion).category) === category.value
        ).length,
      })),
    ];
  }, [tab, personalityQuestions, riasecQuestions]);

  const statusFilterOptions = useMemo(
    () => [
      { value: "", label: "All", count: activeList.length },
      {
        value: "active",
        label: "Active",
        count: activeList.filter((question) => question.is_active).length,
      },
      {
        value: "inactive",
        label: "Inactive",
        count: activeList.filter((question) => !question.is_active).length,
      },
    ],
    [activeList]
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return activeList.filter((question) => {
      const dimension =
        tab === "personality"
          ? (question as PersonalityQuestion).dimension
          : (question as RiasecQuestion).category;
      if (dimensionFilter && dimension !== dimensionFilter) return false;
      if (statusFilter === "active" && !question.is_active) return false;
      if (statusFilter === "inactive" && question.is_active) return false;
      if (!needle) return true;
      return (
        question.prompt_en.toLowerCase().includes(needle) ||
        question.prompt_km.toLowerCase().includes(needle)
      );
    });
  }, [activeList, tab, search, dimensionFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const hasActiveFilters = Boolean(search || dimensionFilter || statusFilter);

  const selectTab = (nextTab: QuestionTab) => {
    setTab(nextTab);
    setSearch("");
    setDimensionFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setDimensionFilter("");
    setStatusFilter("");
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

  const openCreate = () => {
    setEditingId(null);
    setPersonalityForm({
      ...EMPTY_PERSONALITY,
      options: defaultOptions("EI"),
    });
    setRiasecForm(EMPTY_RIASEC);
    setDialogOpen(true);
  };

  const openEditPersonality = (question: PersonalityQuestion) => {
    setTab("personality");
    setEditingId(question.id);
    setPersonalityForm({
      dimension: question.dimension,
      prompt_en: question.prompt_en,
      prompt_km: question.prompt_km,
      order_index: String(question.order_index),
      is_active: question.is_active,
      options: question.options.map((option) => ({ ...option })),
    });
    setDialogOpen(true);
  };

  const openEditRiasec = (question: RiasecQuestion) => {
    setTab("riasec");
    setEditingId(question.id);
    setRiasecForm({
      category: question.category,
      prompt_en: question.prompt_en,
      prompt_km: question.prompt_km,
      order_index: String(question.order_index),
      is_active: question.is_active,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const updatePersonalityOption = (
    index: number,
    patch: Partial<PersonalityOption>
  ) => {
    setPersonalityForm((prev) => ({
      ...prev,
      options: prev.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option
      ),
    }));
  };

  const addPersonalityOption = () => {
    setPersonalityForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          label_en: "",
          label_km: "",
          target_trait: DIMENSION_TRAITS[prev.dimension][0],
          weight: 1,
          order_index: prev.options.length + 1,
        },
      ],
    }));
  };

  const removePersonalityOption = (index: number) => {
    setPersonalityForm((prev) => {
      if (prev.options.length <= 2) return prev;
      return {
        ...prev,
        options: prev.options
          .filter((_, optionIndex) => optionIndex !== index)
          .map((option, optionIndex) => ({
            ...option,
            order_index: optionIndex + 1,
          })),
      };
    });
  };

  const validatePersonality = () => {
    if (!personalityForm.prompt_en.trim() || !personalityForm.prompt_km.trim()) {
      return "Both English and Khmer prompts are required.";
    }
    if (personalityForm.options.length < 2) {
      return "Add at least two answer options.";
    }
    const expected = DIMENSION_TRAITS[personalityForm.dimension];
    const traits = new Set(personalityForm.options.map((option) => option.target_trait));
    if (!expected.every((trait) => traits.has(trait))) {
      return `Options for ${personalityForm.dimension} must include ${expected.join(" and ")}.`;
    }
    if (
      personalityForm.options.some(
        (option) => !option.label_en.trim() || !option.label_km.trim()
      )
    ) {
      return "Every option needs English and Khmer labels.";
    }
    return null;
  };

  const validateRiasec = () => {
    if (!riasecForm.prompt_en.trim() || !riasecForm.prompt_km.trim()) {
      return "Both English and Khmer prompts are required.";
    }
    return null;
  };

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      if (tab === "personality") {
        const validation = validatePersonality();
        if (validation) throw new Error(validation);
        const payload = {
          dimension: personalityForm.dimension,
          prompt_en: personalityForm.prompt_en.trim(),
          prompt_km: personalityForm.prompt_km.trim(),
          order_index: personalityForm.order_index
            ? Number(personalityForm.order_index)
            : null,
          is_active: personalityForm.is_active,
          options: personalityForm.options.map((option, index) => ({
            ...(option.id ? { id: option.id } : {}),
            label_en: option.label_en.trim(),
            label_km: option.label_km.trim(),
            target_trait: option.target_trait,
            weight: Number(option.weight) || 1,
            order_index: index + 1,
          })),
        };
        return apiFetch(
          `/admin/questions/personality${editingId ? `/${editingId}` : ""}`,
          {
            method: editingId ? "PATCH" : "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      const validation = validateRiasec();
      if (validation) throw new Error(validation);
      return apiFetch(
        `/admin/questions/riasec${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify({
            category: riasecForm.category,
            prompt_en: riasecForm.prompt_en.trim(),
            prompt_km: riasecForm.prompt_km.trim(),
            order_index: riasecForm.order_index
              ? Number(riasecForm.order_index)
              : null,
            is_active: riasecForm.is_active,
          }),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "questions", tab],
      });
      toast.success(editingId ? "Question updated." : "Question added.");
      setDialogOpen(false);
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Could not save this question.")),
  });

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/admin/questions/${tab}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "questions", tab],
      });
      toast.success("Question deleted.");
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Could not delete this question."));
    },
  });

  const tabLabel = tab === "personality" ? "Personality" : "RIASEC";
  const isLoading = tab === "personality" ? loadingPersonality : loadingRiasec;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#111965] dark:text-white sm:text-2xl">
            Add and manage assessment questions
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#68708A] dark:text-slate-400">
            Questions added here appear in the live student assessments. Personality
            questions include scored answer options; RIASEC questions are rated on the
            five-point interest scale.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#111965] px-4 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#1E277A] dark:bg-[#F7CE4D] dark:text-[#111965] dark:hover:bg-[#E5BD3B]"
        >
          <Plus className="h-4 w-4" />
          Add question
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => selectTab("personality")}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-xl border px-3.5 text-[11px] font-bold transition-colors",
            tab === "personality"
              ? "border-[#111965] bg-[#111965] text-white dark:border-[#F7CE4D] dark:bg-[#F7CE4D] dark:text-[#111965]"
              : "border-[#E6E8F0] bg-white text-[#68708A] hover:border-slate-300 dark:border-white/10 dark:bg-[#090D24] dark:text-slate-400"
          )}
        >
          <BrainCircuit className="h-3.5 w-3.5" />
          Personality ({personalityQuestions.length})
        </button>
        <button
          type="button"
          onClick={() => selectTab("riasec")}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-xl border px-3.5 text-[11px] font-bold transition-colors",
            tab === "riasec"
              ? "border-[#111965] bg-[#111965] text-white dark:border-[#F7CE4D] dark:bg-[#F7CE4D] dark:text-[#111965]"
              : "border-[#E6E8F0] bg-white text-[#68708A] hover:border-slate-300 dark:border-white/10 dark:bg-[#090D24] dark:text-slate-400"
          )}
        >
          <Compass className="h-3.5 w-3.5" />
          RIASEC ({riasecQuestions.length})
        </button>
        <span className="ml-auto text-[11px] font-semibold text-[#68708A] dark:text-slate-400">
          {activeCount} active · {activeList.length - activeCount} inactive
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white dark:border-white/10 dark:bg-[#090D24]">
        <div className="flex flex-col gap-2.5 border-b border-[#E6E8F0] p-3 dark:border-white/10 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68708A] dark:text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={`Search ${tabLabel.toLowerCase()} prompts…`}
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
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AdminFilterDropdown
              label={tab === "personality" ? "Dimension" : "Category"}
              value={dimensionFilter}
              onChange={(value) => {
                setDimensionFilter(value);
                setPage(1);
              }}
              options={dimensionFilterOptions}
              menuWidth="w-64"
            />

            <AdminFilterDropdown
              label="Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={statusFilterOptions}
              menuWidth="w-60"
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
              of {activeList.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: "8%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "52%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-[#E6E8F0] bg-[#F8FAFD] text-[10px] font-black uppercase tracking-[0.12em] text-[#68708A] dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                <th className="px-3 py-3">Order</th>
                <th className="px-3 py-3">
                  {tab === "personality" ? "Dimension" : "Category"}
                </th>
                <th className="px-3 py-3">Prompt</th>
                <th className="px-3 py-3">Options</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8F0] dark:divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#111965] dark:text-[#F7CE4D]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-xs text-[#68708A] dark:text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <span>
                        {activeList.length === 0
                          ? "No questions in this bank yet."
                          : "No questions match these filters."}
                      </span>
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
                visible.map((question) => {
                  const dimension =
                    "dimension" in question
                      ? question.dimension
                      : question.category;
                  const optionsSummary =
                    "dimension" in question
                      ? question.options.length
                      : "5-point scale";

                  return (
                    <tr
                      key={question.id}
                      className="transition-colors hover:bg-[#F8FAFD] dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-3 py-3 text-[12px] font-black text-[#94A3B8]">
                        {question.order_index}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-md border border-[#E6E8F0] bg-[#F8FAFD] px-2 py-1 text-[10px] font-black text-[#111965] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#F7CE4D]">
                          {dimension}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="truncate text-[12px] font-semibold text-[#171A2C] dark:text-slate-200">
                          {question.prompt_en}
                        </div>
                        <div className="truncate text-[10px] text-[#94A3B8]">
                          {question.prompt_km}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[12px] font-semibold text-[#475569] dark:text-slate-300">
                        {optionsSummary}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge active={question.is_active} />
                      </td>
                      <td className="px-3 py-3">
                        <QuestionActions
                          onEdit={() => {
                            if ("dimension" in question) {
                              openEditPersonality(question);
                            } else {
                              openEditRiasec(question);
                            }
                          }}
                          onDelete={() => {
                            if (window.confirm("Delete this question?")) {
                              remove(question.id);
                            }
                          }}
                          deleting={deleting}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && (
          <AdminPagination
            page={currentPage}
            pageCount={pageCount}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="questions"
            itemSingular="question"
          />
        )}
      </div>

      {dialogOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#050814]/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? `Edit ${tabLabel} question` : `Add ${tabLabel} question`}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-[#E6E8F0] bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#090D24] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                  {editingId ? "Edit question" : "New question"}
                </div>
                <h3 className="mt-1 text-lg font-black text-[#111965] dark:text-white">
                  {editingId ? `Update ${tabLabel} question` : `Add ${tabLabel} question`}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeDialog}
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
              {tab === "personality" ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label>
                      <span className={labelClass}>Dimension</span>
                      <Select
                        value={personalityForm.dimension}
                        onChange={(dimension) =>
                          setPersonalityForm((prev) => ({
                            ...prev,
                            dimension,
                            options:
                              prev.options.length === 2 &&
                              prev.options.every((option) => option.id == null)
                                ? defaultOptions(dimension)
                                : prev.options,
                          }))
                        }
                        options={DIMENSIONS}
                        label="Dimension"
                        className="w-full"
                      />
                    </label>
                    <label>
                      <span className={labelClass}>Order</span>
                      <input
                        type="number"
                        min={1}
                        value={personalityForm.order_index}
                        onChange={(event) =>
                          setPersonalityForm((prev) => ({
                            ...prev,
                            order_index: event.target.value,
                          }))
                        }
                        placeholder="Auto"
                        className={inputClass}
                      />
                    </label>
                    <label className="flex items-end pb-2">
                      <span className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-[#475569] dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={personalityForm.is_active}
                          onChange={(event) =>
                            setPersonalityForm((prev) => ({
                              ...prev,
                              is_active: event.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-[#D8D1C5] accent-[#111965] dark:accent-[#F7CE4D]"
                        />
                        Active
                      </span>
                    </label>
                  </div>

                  <label>
                    <span className={labelClass}>Prompt (English)</span>
                    <textarea
                      rows={2}
                      required
                      value={personalityForm.prompt_en}
                      onChange={(event) =>
                        setPersonalityForm((prev) => ({
                          ...prev,
                          prompt_en: event.target.value,
                        }))
                      }
                      className={textareaClass}
                    />
                  </label>
                  <label>
                    <span className={labelClass}>Prompt (Khmer)</span>
                    <textarea
                      rows={2}
                      required
                      value={personalityForm.prompt_km}
                      onChange={(event) =>
                        setPersonalityForm((prev) => ({
                          ...prev,
                          prompt_km: event.target.value,
                        }))
                      }
                      className={textareaClass}
                    />
                  </label>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={labelClass}>Answer options & scoring</span>
                      <button
                        type="button"
                        onClick={addPersonalityOption}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#111965] hover:underline dark:text-[#F7CE4D]"
                      >
                        <Plus className="h-3 w-3" /> Add option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {personalityForm.options.map((option, index) => (
                        <div
                          key={index}
                          className="grid gap-2 rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] p-2.5 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-[1fr_1fr_90px_80px_32px]"
                        >
                          <input
                            value={option.label_en}
                            onChange={(event) =>
                              updatePersonalityOption(index, {
                                label_en: event.target.value,
                              })
                            }
                            placeholder="Label (EN)"
                            className={inputClass}
                            required
                          />
                          <input
                            value={option.label_km}
                            onChange={(event) =>
                              updatePersonalityOption(index, {
                                label_km: event.target.value,
                              })
                            }
                            placeholder="Label (KM)"
                            className={inputClass}
                            required
                          />
                          <Select
                            value={option.target_trait}
                            onChange={(target_trait) =>
                              updatePersonalityOption(index, { target_trait })
                            }
                            options={DIMENSION_TRAITS[
                              personalityForm.dimension
                            ].map((trait) => ({ value: trait, label: trait }))}
                            label="Trait"
                            className="w-full"
                          />
                          <input
                            type="number"
                            min={0.1}
                            max={10}
                            step={0.1}
                            value={option.weight}
                            onChange={(event) =>
                              updatePersonalityOption(index, {
                                weight: Number(event.target.value),
                              })
                            }
                            aria-label="Weight"
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={() => removePersonalityOption(index)}
                            disabled={personalityForm.options.length <= 2}
                            className="inline-flex h-10 items-center justify-center rounded-lg text-[#68708A] transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-rose-500/10"
                            aria-label="Remove option"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[10px] text-[#94A3B8]">
                      Cover both traits of {personalityForm.dimension}. Weight controls how
                      strongly an answer contributes to the trait score.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label>
                      <span className={labelClass}>Category</span>
                      <Select
                        value={riasecForm.category}
                        onChange={(category) =>
                          setRiasecForm((prev) => ({ ...prev, category }))
                        }
                        options={RIASEC_CATEGORIES}
                        label="RIASEC category"
                        className="w-full"
                      />
                    </label>
                    <label>
                      <span className={labelClass}>Order</span>
                      <input
                        type="number"
                        min={1}
                        value={riasecForm.order_index}
                        onChange={(event) =>
                          setRiasecForm((prev) => ({
                            ...prev,
                            order_index: event.target.value,
                          }))
                        }
                        placeholder="Auto"
                        className={inputClass}
                      />
                    </label>
                    <label className="flex items-end pb-2">
                      <span className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-[#475569] dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={riasecForm.is_active}
                          onChange={(event) =>
                            setRiasecForm((prev) => ({
                              ...prev,
                              is_active: event.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-[#D8D1C5] accent-[#111965] dark:accent-[#F7CE4D]"
                        />
                        Active
                      </span>
                    </label>
                  </div>
                  <label>
                    <span className={labelClass}>Prompt (English)</span>
                    <textarea
                      rows={2}
                      required
                      value={riasecForm.prompt_en}
                      onChange={(event) =>
                        setRiasecForm((prev) => ({
                          ...prev,
                          prompt_en: event.target.value,
                        }))
                      }
                      className={textareaClass}
                    />
                  </label>
                  <label>
                    <span className={labelClass}>Prompt (Khmer)</span>
                    <textarea
                      rows={2}
                      required
                      value={riasecForm.prompt_km}
                      onChange={(event) =>
                        setRiasecForm((prev) => ({
                          ...prev,
                          prompt_km: event.target.value,
                        }))
                      }
                      className={textareaClass}
                    />
                  </label>
                  <p className="rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3.5 py-2.5 text-[11px] leading-relaxed text-[#68708A] dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                    Students answer this question on the standard 1–5 interest scale. No
                    answer options are needed.
                  </p>
                </>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-[#E6E8F0] pt-4 dark:border-white/10">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="h-10 rounded-xl border border-[#E6E8F0] px-4 text-xs font-bold text-[#475569] transition-colors hover:bg-[#F8FAFD] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111965] px-5 text-xs font-black text-white transition-colors hover:bg-[#1E277A] disabled:opacity-60 dark:bg-[#F7CE4D] dark:text-[#111965] dark:hover:bg-[#E5BD3B]"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  {editingId ? "Save changes" : "Add question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
      <Check className="h-3 w-3" /> Active
    </span>
  ) : (
    <span className="rounded-full border border-[#E6E8F0] bg-[#F8FAFD] px-2 py-1 text-[10px] font-bold text-[#94A3B8] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
      Inactive
    </span>
  );
}

function QuestionActions({
  onEdit,
  onDelete,
  deleting,
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        aria-label="Edit question"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
        aria-label="Delete question"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
