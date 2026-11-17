"use client";

import React, { useState } from "react";
import {
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Link2,
  Loader2,
  Share2,
  ShieldCheck,
  Trash2,
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
import type {
  ReportAudience,
  ReportSection,
  ReportShare,
} from "@/lib/shared-report-types";

interface ShareReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECTION_KEYS: ReportSection[] = [
  "profile",
  "assessments",
  "recommendations",
  "plans",
  "eligibility",
];

export function ShareReportDialog({
  open,
  onOpenChange,
}: ShareReportDialogProps) {
  const { language } = useLanguage();
  const isKm = language === "km";
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [audience, setAudience] = useState<ReportAudience>("PARENT");
  const [expiry, setExpiry] = useState("30");
  const [sections, setSections] = useState<ReportSection[]>(SECTION_KEYS);
  const [note, setNote] = useState("");
  const [created, setCreated] = useState<ReportShare | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const copy = {
    title: isKm ? "ចែករំលែករបាយការណ៍" : "Share progress report",
    subtitle: isKm
      ? "បង្កើតតំណឯកជនសម្រាប់មាតាបិតា ឬទីប្រឹក្សារបស់អ្នក។ ពួកគេមិនចាំបាច់មានគណនីទេ។"
      : "Create a private link for a parent or counselor. They do not need an account.",
    audience: isKm ? "អ្នកទទួល" : "Prepared for",
    parent: isKm ? "មាតាបិតា / អ្នកអាណាព្យាបាល" : "Parent / guardian",
    counselor: isKm ? "ទីប្រឹក្សា" : "Counselor",
    other: isKm ? "ផ្សេងៗ" : "Other",
    expiry: isKm ? "តំណដំណើរការ" : "Link expires",
    days7: isKm ? "៧ ថ្ងៃ" : "7 days",
    days30: isKm ? "៣០ ថ្ងៃ" : "30 days",
    days90: isKm ? "៩០ ថ្ងៃ" : "90 days",
    sections: isKm ? "ផ្នែកដែលត្រូវចែករំលែក" : "Sections to share",
    note: isKm ? "សារផ្ទាល់ខ្លួន (ស្រេចចិត្ត)" : "Personal note (optional)",
    notePlaceholder: isKm
      ? "ឧ. សូមមើលលទ្ធផល និងផែនការដាក់ពាក្យរបស់ខ្ញុំ…"
      : "e.g. Please review my results and application plan…",
    create: isKm ? "បង្កើតតំណ" : "Create share link",
    creating: isKm ? "កំពុងបង្កើត…" : "Creating…",
    linkReady: isKm ? "តំណរបាយការណ៍រួចរាល់" : "Your report link is ready",
    copy: isKm ? "ចម្លងតំណ" : "Copy link",
    open: isKm ? "បើករបាយការណ៍" : "Open report",
    copied: isKm ? "បានចម្លងតំណ។" : "Link copied.",
    copyError: isKm ? "មិនអាចចម្លងតំណបានទេ។" : "Could not copy the link.",
    existing: isKm ? "តំណដែលមានស្រាប់" : "Existing links",
    noExisting: isKm ? "មិនទាន់មានតំណដែលបានចែករំលែកទេ។" : "No shared links yet.",
    views: isKm ? "ការមើល" : "views",
    active: isKm ? "សកម្ម" : "Active",
    expired: isKm ? "ផុតកំណត់" : "Expired",
    revoke: isKm ? "ផ្ដាច់តំណ" : "Revoke",
    revokeTitle: isKm ? "ផ្ដាច់តំណរបាយការណ៍?" : "Revoke this report link?",
    revokeBody: isKm
      ? "អ្នកដែលមានតំណនេះនឹងមិនអាចបើករបាយការណ៍បានទៀតទេ។"
      : "Anyone with this link will no longer be able to open the report.",
    cancel: isKm ? "បោះបង់" : "Cancel",
    revoked: isKm ? "បានផ្ដាច់តំណ។" : "Report link revoked.",
    created: isKm ? "បានបង្កើតតំណរបាយការណ៍។" : "Report link created.",
    createError: isKm ? "មិនអាចបង្កើតតំណបានទេ។" : "Could not create the link.",
    needSection: isKm ? "ជ្រើសរើសយ៉ាងហោចណាស់ផ្នែកមួយ។" : "Select at least one section.",
    privacy: isKm
      ? "តំណនេះបង្ហាញតែផ្នែកដែលអ្នកជ្រើសរើស។ ព័ត៌មានទំនាក់ទំនងមិនត្រូវបានចែករំលែកទេ។"
      : "The link only shows the sections you choose. Contact details are never shared.",
  };

  const sectionOptions: Array<{
    key: ReportSection;
    title: string;
    description: string;
  }> = [
    {
      key: "profile",
      title: isKm ? "ប្រវត្តិសិស្ស" : "Student profile",
      description: isKm ? "សាលា ខេត្ត និងពិន្ទុ BACII" : "School, province, and BACII grade",
    },
    {
      key: "assessments",
      title: isKm ? "លទ្ធផលវាយតម្លៃ" : "Assessment results",
      description: isKm ? "MBTI, RIASEC និងចំណូលចិត្ត" : "MBTI, RIASEC, and preferences",
    },
    {
      key: "recommendations",
      title: isKm ? "ការណែនាំជំនាញ" : "Major recommendations",
      description: isKm ? "ជំនាញដែលសាកសមបំផុត" : "Top matching majors",
    },
    {
      key: "plans",
      title: isKm ? "ផែនការដាក់ពាក្យ" : "Application plans",
      description: isKm
        ? "កាលកំណត់ និងវឌ្ឍនភាពឯកសារ"
        : "Deadlines and document progress",
    },
    {
      key: "eligibility",
      title: isKm ? "ឱកាសចូលរៀន" : "BACII eligibility",
      description: isKm
        ? "កម្មវិធីដែលស្ថិតក្នុងលទ្ធភាព"
        : "Verified programs within reach",
    },
  ];

  const { data: shares = [], isLoading: loadingShares } = useQuery({
    queryKey: ["report-shares"],
    queryFn: async () => apiFetch<ReportShare[]>("/reports/shares"),
    enabled: open,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["report-shares"] });

  const { mutate: createShare, isPending: creating } = useMutation({
    mutationFn: async () =>
      apiFetch<ReportShare>("/reports/shares", {
        method: "POST",
        body: JSON.stringify({
          audience,
          language,
          expires_in_days: Number(expiry),
          sections,
          note: note.trim() || null,
        }),
      }),
    onSuccess: (share) => {
      setCreated(share);
      toast.success(copy.created);
      invalidate();
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, copy.createError)),
  });

  const { mutate: revokeShare } = useMutation({
    mutationFn: async (share: ReportShare) =>
      apiFetch<ReportShare>(`/reports/shares/${share.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success(copy.revoked);
      invalidate();
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, copy.createError)),
    onSettled: () => setPendingId(null),
  });

  const toggleSection = (key: ReportSection) => {
    setSections((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };

  const shareUrl = (share: ReportShare) =>
    typeof window === "undefined"
      ? share.url
      : `${window.location.origin}${share.url}`;

  const copyLink = async (share: ReportShare) => {
    try {
      await navigator.clipboard.writeText(shareUrl(share));
      toast.success(copy.copied);
    } catch {
      toast.error(copy.copyError);
    }
  };

  const handleRevoke = async (share: ReportShare) => {
    const confirmed = await confirm({
      title: copy.revokeTitle,
      description: copy.revokeBody,
      confirmLabel: copy.revoke,
      cancelLabel: copy.cancel,
      tone: "danger",
    });
    if (confirmed) {
      setPendingId(share.id);
      revokeShare(share);
    }
  };

  const isExpired = (share: ReportShare) =>
    new Date(share.expires_at).getTime() < now;

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(isKm ? "km-KH" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));

  const canCreate = sections.length > 0 && !creating;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!creating) onOpenChange(next);
      }}
      className="max-h-[92vh] max-w-2xl overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <DialogHeader>
        <div className="flex items-start gap-3 pr-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111965] text-[#F7CE4D]">
            <Share2 className="h-5 w-5" />
          </span>
          <div>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.subtitle}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
              {copy.audience}
            </span>
            <Select
              value={audience}
              onChange={(value) => setAudience(value as ReportAudience)}
              options={[
                { value: "PARENT", label: copy.parent },
                { value: "COUNSELOR", label: copy.counselor },
                { value: "OTHER", label: copy.other },
              ]}
              label={copy.audience}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
              {copy.expiry}
            </span>
            <Select
              value={expiry}
              onChange={setExpiry}
              options={[
                { value: "7", label: copy.days7 },
                { value: "30", label: copy.days30 },
                { value: "90", label: copy.days90 },
              ]}
              label={copy.expiry}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
            {copy.sections}
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {sectionOptions.map((option) => {
              const selected = sections.includes(option.key);
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleSection(option.key)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors",
                    selected
                      ? "border-[#111965] bg-[#F0F2FA] dark:border-[#F7CE4D]/40 dark:bg-[#F7CE4D]/10"
                      : "border-[#E6E8F0] bg-white hover:border-[#111965]/30 dark:border-white/10 dark:bg-white/[0.03]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      selected
                        ? "border-[#111965] bg-[#111965] text-white dark:border-[#F7CE4D] dark:bg-[#F7CE4D] dark:text-[#111965]"
                        : "border-[#D9DEEA] bg-white dark:border-white/20 dark:bg-transparent"
                    )}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                  <span>
                    <span className="block text-[11px] font-black text-[#111965] dark:text-white">
                      {option.title}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-relaxed text-[#68708A] dark:text-slate-400">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
            {copy.note}
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            maxLength={1000}
            placeholder={copy.notePlaceholder}
            className="w-full rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 py-2.5 text-xs text-[#171A2C] outline-none focus:border-[#111965] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-[#F7CE4D]/60 dark:focus:bg-[#090D24]"
          />
        </label>

        <div className="rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 py-2 text-[10px] leading-relaxed text-[#68708A] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
          <ShieldCheck className="mr-1 inline h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          {copy.privacy}
        </div>

        <button
          type="button"
          onClick={() => createShare()}
          disabled={!canCreate}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#111965] px-4 text-xs font-black text-white transition-colors hover:bg-[#1E277A] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          {creating ? copy.creating : copy.create}
        </button>
        {sections.length === 0 && (
          <p className="text-center text-[10px] font-semibold text-rose-600 dark:text-rose-400">
            {copy.needSection}
          </p>
        )}

        {created && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <div className="flex items-center gap-2 text-[11px] font-black text-emerald-800 dark:text-emerald-300">
              <Check className="h-4 w-4" />
              {copy.linkReady}
            </div>
            <div className="mt-2 break-all rounded-lg border border-emerald-200/70 bg-white px-2.5 py-2 text-[10px] text-[#475569] dark:border-emerald-500/20 dark:bg-white/5 dark:text-slate-300">
              {shareUrl(created)}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyLink(created)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#111965] px-3 text-[10px] font-black text-white hover:bg-[#1E277A] dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                <Copy className="h-3 w-3" />
                {copy.copy}
              </button>
              <a
                href={created.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E6E8F0] bg-white px-3 text-[10px] font-bold text-[#111965] hover:bg-[#F8FAFD] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <ExternalLink className="h-3 w-3" />
                {copy.open}
              </a>
            </div>
          </div>
        )}

        <div className="border-t border-[#E6E8F0] pt-3 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
              {copy.existing}
            </div>
            <span className="text-[10px] font-semibold text-[#94A3B8] dark:text-slate-500">
              {shares.length}
            </span>
          </div>

          {loadingShares ? (
            <div className="flex items-center justify-center gap-2 py-6 text-[10px] text-[#68708A] dark:text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {isKm ? "កំពុងផ្ទុក…" : "Loading…"}
            </div>
          ) : shares.length === 0 ? (
            <p className="py-4 text-center text-[10px] text-[#68708A] dark:text-slate-400">
              {copy.noExisting}
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {shares.map((share) => {
                const expired = isExpired(share);
                return (
                  <li
                    key={share.id}
                    className="rounded-xl border border-[#E6E8F0] bg-white p-2.5 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10.5px] font-black text-[#111965] dark:text-white">
                            {share.audience === "COUNSELOR"
                              ? copy.counselor
                              : share.audience === "OTHER"
                                ? copy.other
                                : copy.parent}
                          </span>
                          <span
                            className={cn(
                              "rounded-md border px-1.5 py-0.5 text-[8.5px] font-black uppercase",
                              expired
                                ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                            )}
                          >
                            {expired ? copy.expired : copy.active}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[9.5px] text-[#68708A] dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-2.5 w-2.5" />
                            {formatDate(share.expires_at)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-2.5 w-2.5" />
                            {share.view_count} {copy.views}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => copyLink(share)}
                          className="rounded-lg p-1.5 text-[#68708A] hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                          aria-label={copy.copy}
                          title={copy.copy}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRevoke(share)}
                          disabled={pendingId === share.id}
                          className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                          aria-label={copy.revoke}
                          title={copy.revoke}
                        >
                          {pendingId === share.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Dialog>
  );
}
