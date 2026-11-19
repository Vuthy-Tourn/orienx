"use client";

import React from "react";
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
import type { AssessmentReportFormat } from "@/lib/assessment-report";

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
