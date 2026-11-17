"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PLAN_DOCUMENT_TYPES,
  type Plan,
  type PlanDocument,
  type PlanDocumentType,
} from "@/lib/plan-types";
import { cn, getErrorMessage } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 text-xs text-[#171A2C] outline-none transition-colors focus:border-[#111965] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-[#F7CE4D]/60";

function daysUntil(value?: string | null) {
  if (!value) return null;
  const target = new Date(`${value}T00:00:00`);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function PlanChecklist({
  plan,
  onChanged,
}: {
  plan: Plan;
  onChanged: () => void;
}) {
  const { t, language } = useLanguage();
  const isKm = language === "km";
  const toast = useToast();
  const confirm = useConfirm();

  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlanDocument | null>(null);
  const [documentType, setDocumentType] = useState<PlanDocumentType>("OTHER");
  const [nameEn, setNameEn] = useState("");
  const [nameKm, setNameKm] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const requiredDocuments = useMemo(
    () => plan.documents.filter((document) => document.is_required),
    [plan.documents]
  );
  const requiredCompleted = requiredDocuments.filter(
    (document) => document.is_completed
  ).length;
  const missingRequired = requiredDocuments.length - requiredCompleted;
  const progress = requiredDocuments.length
    ? Math.round((requiredCompleted / requiredDocuments.length) * 100)
    : 100;

  const documentName = (document: PlanDocument) =>
    isKm && document.name_km ? document.name_km : document.name_en;

  const typeLabel = (type: PlanDocumentType) =>
    t(`planPage.documents.types.${type}`, type);

  const dueLabel = (document: PlanDocument) => {
    if (!document.due_date) return null;
    const days = daysUntil(document.due_date);
    if (days === null) return null;
    if (document.is_completed) return null;
    if (days < 0) {
      return {
        text: t("planPage.documents.overdue"),
        className: "border-rose-200 bg-rose-50 text-rose-700",
      };
    }
    if (days === 0) {
      return {
        text: t("planPage.documents.dueToday"),
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    }
    return {
      text: t("planPage.documents.dueIn").replace("{days}", String(days)),
      className:
        days <= 7
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-slate-50 text-slate-600",
    };
  };

  const resetForm = () => {
    setEditing(null);
    setDocumentType("OTHER");
    setNameEn("");
    setNameKm("");
    setIsRequired(true);
    setDueDate("");
    setNotes("");
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (document: PlanDocument) => {
    setEditing(document);
    setDocumentType(document.document_type);
    setNameEn(document.name_en || "");
    setNameKm(document.name_km || "");
    setIsRequired(document.is_required);
    setDueDate(document.due_date || "");
    setNotes(document.notes || "");
    setDialogOpen(true);
  };

  const { mutate: saveDocument, isPending: saving } = useMutation({
    mutationFn: async () => {
      if (documentType === "OTHER" && !nameEn.trim() && !nameKm.trim()) {
        throw new Error(t("planPage.documents.nameRequired"));
      }
      const body = {
        name_en: nameEn.trim() || null,
        name_km: nameKm.trim() || null,
        is_required: isRequired,
        due_date: dueDate || null,
        notes: notes.trim() || null,
      };

      if (editing) {
        return apiFetch(`/plans/${plan.id}/documents/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      }

      return apiFetch(`/plans/${plan.id}/documents`, {
        method: "POST",
        body: JSON.stringify({
          ...body,
          document_type: documentType,
        }),
      });
    },
    onSuccess: () => {
      toast.success(
        editing
          ? t("planPage.documents.updated")
          : t("planPage.documents.added")
      );
      setDialogOpen(false);
      resetForm();
      onChanged();
    },
    onError: (error: unknown) =>
      toast.error(
        getErrorMessage(error, t("planPage.documents.error"))
      ),
  });

  const { mutate: toggleDocument } = useMutation({
    mutationFn: async (document: PlanDocument) =>
      apiFetch(`/plans/${plan.id}/documents/${document.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_completed: !document.is_completed }),
      }),
    onSuccess: () => onChanged(),
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, t("planPage.documents.error"))),
  });

  const { mutate: addStandardChecklist, isPending: addingStandard } =
    useMutation({
      mutationFn: async () =>
        apiFetch(`/plans/${plan.id}/documents/defaults`, {
          method: "POST",
        }),
      onSuccess: () => {
        toast.success(t("planPage.documents.standardAdded"));
        onChanged();
      },
      onError: (error: unknown) =>
        toast.error(
          getErrorMessage(error, t("planPage.documents.standardError"))
        ),
    });

  const { mutate: removeDocument } = useMutation({
    mutationFn: async (document: PlanDocument) =>
      apiFetch(`/plans/${plan.id}/documents/${document.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success(t("planPage.documents.removed"));
      onChanged();
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, t("planPage.documents.error"))),
  });

  const handleRemove = async (document: PlanDocument) => {
    const confirmed = await confirm({
      title: t("planPage.documents.deleteTitle"),
      description: t("planPage.documents.deleteBody"),
      confirmLabel: t("planPage.documents.confirmDelete"),
      cancelLabel: t("planPage.cancel"),
      tone: "danger",
    });
    if (confirmed) removeDocument(document);
  };

  return (
    <div className="mt-3 rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-2 text-[11px] font-black text-[#111965]"
        >
          <ListChecks className="h-3.5 w-3.5 text-[#111965]" />
          {t("planPage.documents.title")}
          <span className="rounded-md border border-[#E6E8F0] bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#68708A]">
            {requiredCompleted}/{requiredDocuments.length}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-[#94A3B8] transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>
        {missingRequired > 0 ? (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
            {t("planPage.documents.missing").replace(
              "{count}",
              String(missingRequired)
            )}
          </span>
        ) : (
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
            {t("planPage.documents.allRequiredComplete")}
          </span>
        )}
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E6E8F0]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#111965] to-[#F7CE4D] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {expanded && (
        <div className="mt-3 space-y-2">
          {plan.documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#D9DEEA] bg-white px-3 py-4 text-center">
              <p className="text-[11px] font-semibold text-[#68708A]">
                {t("planPage.documents.noItemsBody")}
              </p>
              <button
                type="button"
                onClick={() => addStandardChecklist()}
                disabled={addingStandard}
                className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#111965] px-3 text-[10.5px] font-black text-white disabled:opacity-60"
              >
                {addingStandard ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
                {t("planPage.documents.addStandard")}
              </button>
            </div>
          ) : (
            <>
              {plan.documents.map((document) => {
                const due = dueLabel(document);
                return (
                  <div
                    key={document.id}
                    className="flex items-start gap-2 rounded-xl border border-[#E6E8F0] bg-white px-2.5 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => toggleDocument(document)}
                      className="mt-0.5 shrink-0 text-[#94A3B8] transition-colors hover:text-[#111965]"
                      aria-label={
                        document.is_completed
                          ? t("planPage.documents.markIncomplete")
                          : t("planPage.documents.markComplete")
                      }
                    >
                      {document.is_completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "text-[11px] font-bold text-[#171A2C]",
                            document.is_completed &&
                              "text-[#94A3B8] line-through"
                          )}
                        >
                          {documentName(document)}
                        </span>
                        <span
                          className={cn(
                            "rounded-md border px-1.5 py-0.5 text-[9px] font-bold",
                            document.is_required
                              ? "border-[#111965]/15 bg-[#F0F2FA] text-[#111965]"
                              : "border-slate-200 bg-slate-50 text-slate-500"
                          )}
                        >
                          {document.is_required
                            ? t("planPage.documents.required")
                            : t("planPage.documents.optional")}
                        </span>
                        {document.due_date && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-bold",
                              due?.className ||
                                "border-slate-200 bg-slate-50 text-slate-600"
                            )}
                          >
                            <CalendarDays className="h-2.5 w-2.5" />
                            {document.due_date}
                            {due ? ` · ${due.text}` : ""}
                          </span>
                        )}
                      </div>
                      {document.notes && (
                        <p className="mt-1 text-[10px] leading-relaxed text-[#68708A]">
                          {document.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => openEdit(document)}
                        className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#F0F2FA] hover:text-[#111965]"
                        aria-label={t("planPage.documents.edit")}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(document)}
                        className="rounded-lg p-1 text-[#94A3B8] hover:bg-rose-50 hover:text-rose-600"
                        aria-label={t("planPage.documents.delete")}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={openAdd}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E6E8F0] bg-white px-3 text-[10.5px] font-bold text-[#111965] hover:bg-[#F0F2FA]"
                >
                  <Plus className="h-3 w-3" />
                  {t("planPage.documents.add")}
                </button>
                <button
                  type="button"
                  onClick={() => addStandardChecklist()}
                  disabled={addingStandard}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[10.5px] font-bold text-[#68708A] hover:text-[#111965] disabled:opacity-60"
                >
                  {addingStandard ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  {t("planPage.documents.addStandard")}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        className="max-h-[90vh] max-w-lg overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {editing
              ? t("planPage.documents.editTitle")
              : t("planPage.documents.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? t("planPage.documents.editSubtitle")
              : t("planPage.documents.addSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveDocument();
          }}
          className="space-y-3.5"
        >
          {!editing && (
            <label className="block space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                {t("planPage.documents.type")}
              </span>
              <Select
                value={documentType}
                onChange={(value) =>
                  setDocumentType(value as PlanDocumentType)
                }
                options={PLAN_DOCUMENT_TYPES.map((type) => ({
                  value: type,
                  label: typeLabel(type),
                }))}
                label={t("planPage.documents.type")}
                className="w-full"
              />
            </label>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                {t("planPage.documents.nameEn")}
              </span>
              <input
                value={nameEn}
                onChange={(event) => setNameEn(event.target.value)}
                maxLength={120}
                className={inputClass}
                placeholder={typeLabel(documentType)}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                {t("planPage.documents.nameKm")}
              </span>
              <input
                value={nameKm}
                onChange={(event) => setNameKm(event.target.value)}
                maxLength={120}
                className={inputClass}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setIsRequired((value) => !value)}
            className="inline-flex items-center gap-2 text-[11px] font-bold text-[#475569]"
          >
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded border",
                isRequired
                  ? "border-[#111965] bg-[#111965] text-white"
                  : "border-[#D9DEEA] bg-white"
              )}
            >
              {isRequired && <Check className="h-3 w-3" />}
            </span>
            {t("planPage.documents.isRequired")}
          </button>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
                {t("planPage.documents.dueDate")}
              </span>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate("")}
                  className="text-[10px] font-bold text-[#68708A] hover:text-[#111965]"
                >
                  {t("planPage.documents.clearDate")}
                </button>
              )}
            </div>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              label={t("planPage.documents.dueDate")}
            />
          </div>

          <label className="block space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A]">
              {t("planPage.documents.notes")}
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              maxLength={1000}
              className="w-full rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 py-2.5 text-xs text-[#171A2C] outline-none focus:border-[#111965] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            />
          </label>

          <div className="flex items-center justify-end gap-2 border-t border-[#E6E8F0] pt-3">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="h-9 rounded-xl border border-[#E6E8F0] px-3.5 text-[11px] font-bold text-[#475569] hover:bg-[#F8FAFD]"
            >
              {t("planPage.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#111965] px-4 text-[11px] font-black text-white hover:bg-[#1E277A] disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              {saving
                ? t("planPage.documents.saving")
                : t("planPage.documents.save")}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
