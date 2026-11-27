"use client";

import React, { useEffect, useMemo } from "react";
import {
  Download,
  FileCode2,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileType2,
  Image as ImageIcon,
  Link2,
  Loader2,
  Share2,
  Table2,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type {
  AssessmentPngPreview,
  AssessmentReportFormat,
} from "@/lib/assessment-report";

interface AssessmentExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  includes: string[];
  exportingFormat: AssessmentReportFormat | null;
  onExport: (format: AssessmentReportFormat) => void;
  footer: string;
  formats?: AssessmentReportFormat[];
}

const DEFAULT_FORMATS: AssessmentReportFormat[] = [
  "pdf",
  "excel",
  "csv",
  "json",
];

export function AssessmentExportDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  includes,
  exportingFormat,
  onExport,
  footer,
  formats: allowedFormats = DEFAULT_FORMATS,
}: AssessmentExportDialogProps) {
  const { t } = useLanguage();

  const allFormats: Array<{
    format: AssessmentReportFormat;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
  }> = [
    {
      format: "pdf",
      title: t("assessmentReport.pdf"),
      description: t("assessmentReport.pdfDesc"),
      icon: FileText,
      iconClass: "bg-rose-50 text-rose-600",
    },
    {
      format: "excel",
      title: t("assessmentReport.excel"),
      description: t("assessmentReport.excelDesc"),
      icon: FileSpreadsheet,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      format: "csv",
      title: t("assessmentReport.csv"),
      description: t("assessmentReport.csvDesc"),
      icon: Table2,
      iconClass: "bg-sky-50 text-sky-600",
    },
    {
      format: "json",
      title: t("assessmentReport.json"),
      description: t("assessmentReport.jsonDesc"),
      icon: FileJson,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      format: "markdown",
      title: t("assessmentReport.markdown"),
      description: t("assessmentReport.markdownDesc"),
      icon: FileType2,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      format: "html",
      title: t("assessmentReport.html"),
      description: t("assessmentReport.htmlDesc"),
      icon: FileCode2,
      iconClass: "bg-orange-50 text-orange-600",
    },
    {
      format: "text",
      title: t("assessmentReport.text"),
      description: t("assessmentReport.textDesc"),
      icon: FileText,
      iconClass: "bg-slate-100 text-slate-600",
    },
    {
      format: "png",
      title: t("assessmentReport.png"),
      description: t("assessmentReport.pngDesc"),
      icon: ImageIcon,
      iconClass: "bg-pink-50 text-pink-600",
    },
    {
      format: "share",
      title: t("assessmentReport.share"),
      description: t("assessmentReport.shareDesc"),
      icon: Link2,
      iconClass: "bg-cyan-50 text-cyan-600",
    },
  ];
  const formats = allFormats.filter((option) =>
    allowedFormats.includes(option.format)
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!exportingFormat) onOpenChange(next);
      }}
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      <DialogHeader>
        <div className="flex items-start gap-3 pr-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111965] text-[#F7CE4D]">
            <Download className="h-5 w-5" />
          </span>
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{subtitle}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="rounded-2xl border border-[#E6E8F0] bg-[#F8FAFD] px-4 py-3">
        <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#68708A]">
          {t("assessmentReport.exportIncludes")}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {includes.map((item) => (
            <span
              key={item}
              className="rounded-lg border border-[#E6E8F0] bg-white px-2 py-1 text-[10.5px] font-bold text-[#475569]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {formats.map((option) => {
          const Icon = option.icon;
          const isBusy = exportingFormat === option.format;
          return (
            <button
              key={option.format}
              type="button"
              onClick={() => onExport(option.format)}
              disabled={Boolean(exportingFormat)}
              className="group flex min-h-[96px] items-start gap-3 rounded-2xl border border-[#E6E8F0] bg-white p-3.5 text-left transition-colors hover:border-[#111965]/30 hover:bg-[#F8FAFD] disabled:cursor-wait disabled:opacity-70"
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  option.iconClass
                )}
              >
                {isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5 text-xs font-black text-[#111965]">
                  {option.title}
                  {isBusy && (
                    <span className="text-[9px] font-bold text-[#68708A]">
                      {t("assessmentReport.preparing")}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-[10.5px] leading-relaxed text-[#68708A]">
                  {option.description}
                </span>
              </span>
              <Download className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#94A3B8] transition-colors group-hover:text-[#111965]" />
            </button>
          );
        })}
      </div>

      <p className="mt-4 rounded-xl border border-[#E6E8F0] bg-white px-3 py-2 text-[10px] leading-relaxed text-[#68708A]">
        {footer}
      </p>
    </Dialog>
  );
}

export function PngSaveModal({
  preview,
  onClose,
}: {
  preview: AssessmentPngPreview | null;
  onClose: () => void;
}) {
  const { getLocalized } = useLanguage();

  const blobUrl = useMemo(() => {
    if (!preview || typeof URL === "undefined") return "";
    return URL.createObjectURL(preview.blob);
  }, [preview]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const canShareFile = (() => {
    if (!preview || typeof navigator === "undefined" || !navigator.canShare) {
      return false;
    }
    try {
      const file = new File([preview.blob], preview.fileName, {
        type: "image/png",
      });
      return navigator.canShare({ files: [file] });
    } catch {
      return false;
    }
  })();

  const handleShareOrSave = async () => {
    if (!preview) return;
    if (canShareFile && navigator.share) {
      try {
        const file = new File([preview.blob], preview.fileName, {
          type: "image/png",
        });
        await navigator.share({
          files: [file],
          title: preview.fileName,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }
    if (blobUrl) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = preview.fileName;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  return (
    <Dialog
      open={Boolean(preview)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      className="max-h-[92vh] max-w-md overflow-y-auto"
    >
      <DialogHeader>
        <div className="flex items-start gap-3 pr-8">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#111965] text-[#F7CE4D]">
            <ImageIcon className="h-5 w-5" />
          </span>
          <div>
            <DialogTitle>
              {getLocalized({
                en: "Save your result image",
                km: "រក្សាទុករូបភាពលទ្ធផល",
              })}
            </DialogTitle>
            <DialogDescription>
              {getLocalized({
                en: "Tap Save to Photos / Share below, or press and hold the image to save directly.",
                km: "ចុច Save / Share ខាងក្រោម ឬចុចឱ្យជាប់លើរូបភាពដើម្បីរក្សាទុកចូល Photos។",
              })}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {preview && (
        <div className="mt-3 space-y-3">
          <div className="overflow-hidden rounded-2xl border border-[#E6E8F0] bg-[#0D134E] shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.dataUrl}
              alt={preview.fileName}
              className="mx-auto max-h-[52vh] w-auto object-contain select-auto"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleShareOrSave}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#F7CE4D] px-4 text-xs font-black text-[#0F1754] dark:text-[#0F1754] shadow-sm transition-colors hover:bg-[#E5BD3B] cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              <span>
                {getLocalized({
                  en: canShareFile ? "Save / Share Image" : "Save Image",
                  km: canShareFile ? "រក្សាទុក / ចែករំលែក" : "រក្សាទុករូបភាព",
                })}
              </span>
            </button>

            <a
              href={blobUrl || preview.dataUrl}
              download={preview.fileName}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E6E8F0] bg-white px-4 text-xs font-bold text-[#111965] transition-colors hover:bg-[#F8FAFD]"
            >
              <Download className="h-4 w-4" />
              <span>
                {getLocalized({
                  en: "Download PNG",
                  km: "ទាញយក PNG",
                })}
              </span>
            </a>
          </div>
        </div>
      )}
    </Dialog>
  );
}
