export type EligibilityReportFormat = "pdf" | "excel" | "csv" | "json";

export interface EligibilityReportOffering {
  id: string;
  university_name: Record<string, string>;
  university_acronym: Record<string, string>;
  major_name: Record<string, string>;
  degree_level: string;
  duration_years: number;
  tuition_annual_usd?: number | null;
  min_bacii_grade?: string | null;
  admission_notes?: string | null;
  admission_source_url?: string | null;
}

export interface EligibilityReportRow {
  id: string;
  university: string;
  acronym: string;
  major: string;
  degree: string;
  durationYears: number;
  tuitionUsd: number | null;
  minGrade: string;
  notes: string;
  sourceUrl: string;
}

export interface EligibilityReportSection {
  key: "eligible" | "below" | "unverified";
  title: string;
  status: string;
  rows: EligibilityReportRow[];
}

export interface EligibilityReportLabels {
  title: string;
  grade: string;
  generated: string;
  scope: string;
  search: string;
  summary: string;
  eligible: string;
  below: string;
  unverified: string;
  missing: string;
  status: string;
  university: string;
  acronym: string;
  major: string;
  degree: string;
  duration: string;
  tuition: string;
  minGrade: string;
  notes: string;
  source: string;
  statusEligible: string;
  statusBelow: string;
  statusUnverified: string;
  bachelor: string;
  associate: string;
  degreeNote: string;
  disclaimer: string;
  preparedFor: string;
  noPrograms: string;
  print: string;
  close: string;
  officialSource: string;
  generatedBy: string;
  footer: string;
  subtitle: string;
  eyebrow: string;
}

export interface EligibilityReportModel {
  title: string;
  grade: string;
  locale: string;
  generatedAt: Date;
  generatedLabel: string;
  studentName: string;
  scopeLabel: string;
  search: string;
  summary: {
    eligible: number;
    below: number;
    unverified: number;
    missing: number;
  };
  note: string;
  disclaimer: string;
  sections: EligibilityReportSection[];
  labels: EligibilityReportLabels;
}

interface BuildReportParams {
  grade: string;
  generatedAt: Date;
  locale: string;
  studentName?: string;
  scopeLabel: string;
  search?: string;
  missing: number;
  note: string;
  disclaimer: string;
  eligible: EligibilityReportOffering[];
  below: EligibilityReportOffering[];
  unverified: EligibilityReportOffering[];
  labels: EligibilityReportLabels;
  getLocalized: (value?: { en?: string; km?: string } | null) => string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatUsd(value: number | null): string {
  return value == null ? "—" : `$${Math.round(value).toLocaleString("en-US")}`;
}

function fileBase(model: EligibilityReportModel, extension: string): string {
  const date = model.generatedAt.toISOString().slice(0, 10);
  return `OrienX-BACII-Report-Grade-${model.grade}-${date}.${extension}`;
}

function downloadBlob(content: BlobPart, mime: string, fileName: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function buildEligibilityReport(
  params: BuildReportParams
): EligibilityReportModel {
  const degreeLabel = (level: string) =>
    level === "ASSOCIATE"
      ? params.labels.associate
      : level === "BACHELOR"
      ? params.labels.bachelor
      : level;

  const toRow = (offering: EligibilityReportOffering): EligibilityReportRow => ({
    id: offering.id,
    university: params.getLocalized(offering.university_name) || "—",
    acronym: params.getLocalized(offering.university_acronym) || "",
    major: params.getLocalized(offering.major_name) || "—",
    degree: degreeLabel(offering.degree_level),
    durationYears: offering.duration_years,
    tuitionUsd: offering.tuition_annual_usd ?? null,
    minGrade: offering.min_bacii_grade || "—",
    notes: offering.admission_notes || "",
    sourceUrl: offering.admission_source_url || "",
  });

  return {
    title: params.labels.title,
    grade: params.grade,
    locale: params.locale,
    generatedAt: params.generatedAt,
    generatedLabel: params.generatedAt.toLocaleString(params.locale),
    studentName: params.studentName || "",
    scopeLabel: params.scopeLabel,
    search: params.search?.trim() || "",
    summary: {
      eligible: params.eligible.length,
      below: params.below.length,
      unverified: params.unverified.length,
      missing: params.missing,
    },
    note: params.note,
    disclaimer: params.disclaimer,
    labels: params.labels,
    sections: [
      {
        key: "eligible",
        title: params.labels.eligible,
        status: params.labels.statusEligible,
        rows: params.eligible.map(toRow),
      },
      {
        key: "below",
        title: params.labels.below,
        status: params.labels.statusBelow,
        rows: params.below.map(toRow),
      },
      {
        key: "unverified",
        title: params.labels.unverified,
        status: params.labels.statusUnverified,
        rows: params.unverified.map(toRow),
      },
    ],
  };
}

export function downloadCsvReport(model: EligibilityReportModel) {
  const rows: string[][] = [];
  const addRow = (...cells: Array<string | number | null | undefined>) => {
    rows.push(cells.map((cell) => (cell == null ? "" : String(cell))));
  };

  addRow(model.title);
  addRow(model.labels.grade, model.grade);
  addRow(model.labels.generated, model.generatedLabel);
  if (model.studentName) addRow(model.labels.preparedFor, model.studentName);
  addRow(model.labels.scope, model.scopeLabel);
  if (model.search) addRow(model.labels.search, model.search);
  addRow("");
  addRow(model.labels.summary);
  addRow(model.labels.eligible, model.summary.eligible);
  addRow(model.labels.below, model.summary.below);
  addRow(model.labels.unverified, model.summary.unverified);
  addRow(model.labels.missing, model.summary.missing);
  addRow("");
  addRow(model.note);
  addRow(model.disclaimer);
  addRow("");

  const header = [
    model.labels.status,
    model.labels.university,
    model.labels.acronym,
    model.labels.major,
    model.labels.degree,
    model.labels.duration,
    model.labels.tuition,
    model.labels.minGrade,
    model.labels.notes,
    model.labels.source,
  ];

  model.sections.forEach((section) => {
    if (section.rows.length === 0) return;
    addRow(section.title);
    addRow(...header);
    section.rows.forEach((row) => {
      addRow(
        section.status,
        row.university,
        row.acronym,
        row.major,
        row.degree,
        row.durationYears,
        row.tuitionUsd ?? "",
        row.minGrade,
        row.notes,
        row.sourceUrl
      );
    });
    addRow("");
  });

  if (model.sections.every((section) => section.rows.length === 0)) {
    addRow(model.labels.noPrograms);
  }

  const csv = `\uFEFF${rows
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n")}`;
  downloadBlob(csv, "text/csv;charset=utf-8;", fileBase(model, "csv"));
}

export function downloadJsonReport(model: EligibilityReportModel) {
  const payload = {
    report: model.title,
    version: 1,
    generatedAt: model.generatedAt.toISOString(),
    student: model.studentName || null,
    grade: model.grade,
    filters: {
      scope: model.scopeLabel,
      search: model.search || null,
    },
    summary: model.summary,
    note: model.note,
    disclaimer: model.disclaimer,
    sections: model.sections.map((section) => ({
      key: section.key,
      title: section.title,
      status: section.status,
      programs: section.rows,
    })),
  };
  downloadBlob(
    JSON.stringify(payload, null, 2),
    "application/json;charset=utf-8;",
    fileBase(model, "json")
  );
}

export async function downloadExcelReport(model: EligibilityReportModel) {
  const { default: writeExcelFile } = await import("write-excel-file/universal");

  const titleStyle = {
    fontWeight: "bold" as const,
    fontSize: 16,
    textColor: "#111965",
    alignVertical: "center" as const,
    height: 28,
  };
  const labelStyle = {
    fontWeight: "bold" as const,
    textColor: "#111965",
    alignVertical: "top" as const,
  };
  const valueStyle = {
    alignVertical: "top" as const,
    wrap: true,
  };
  const headerStyle = {
    fontWeight: "bold" as const,
    textColor: "#FFFFFF",
    backgroundColor: "#111965",
    align: "center" as const,
    alignVertical: "center" as const,
    wrap: true,
    borderColor: "#111965",
    borderStyle: "thin" as const,
    height: 30,
  };
  const dataStyle = (index: number) => ({
    alignVertical: "top" as const,
    wrap: true,
    backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F8FAFD",
    borderColor: "#E6E8F0",
    borderStyle: "thin" as const,
  });
  const summarySheet: any[][] = [
    [{ value: model.title, columnSpan: 4, ...titleStyle }, null, null, null],
    [{ value: model.labels.generated, ...labelStyle }, { value: model.generatedLabel, ...valueStyle }],
    ...(model.studentName
      ? [[{ value: model.labels.preparedFor, ...labelStyle }, { value: model.studentName, ...valueStyle }]]
      : []),
    [{ value: model.labels.grade, ...labelStyle }, { value: model.grade, ...valueStyle }],
    [{ value: model.labels.scope, ...labelStyle }, { value: model.scopeLabel, ...valueStyle }],
    ...(model.search
      ? [[{ value: model.labels.search, ...labelStyle }, { value: model.search, ...valueStyle }]]
      : []),
    [],
    [{ value: model.labels.summary, columnSpan: 4, ...labelStyle }, null, null, null],
    [{ value: model.labels.eligible, ...labelStyle }, { value: model.summary.eligible, ...valueStyle }],
    [{ value: model.labels.below, ...labelStyle }, { value: model.summary.below, ...valueStyle }],
    [{ value: model.labels.unverified, ...labelStyle }, { value: model.summary.unverified, ...valueStyle }],
    [{ value: model.labels.missing, ...labelStyle }, { value: model.summary.missing, ...valueStyle }],
    [],
    [{ value: model.note, columnSpan: 4, ...valueStyle, backgroundColor: "#FFFBEB" }, null, null, null],
    [],
    [{ value: model.disclaimer, columnSpan: 4, ...valueStyle, textColor: "#68708A" }, null, null, null],
  ];

  const programHeader = [
    model.labels.status,
    model.labels.university,
    model.labels.acronym,
    model.labels.major,
    model.labels.degree,
    model.labels.duration,
    model.labels.tuition,
    model.labels.minGrade,
    model.labels.notes,
    model.labels.source,
  ];

  const programSheets = model.sections
    .filter((section) => section.rows.length > 0)
    .map((section) => {
      const rows: any[][] = [
        [
          {
            value: `${section.title} — ${model.title}`,
            columnSpan: 10,
            ...titleStyle,
          },
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        programHeader.map((value) => ({ value, ...headerStyle })),
        ...section.rows.map((row, index) => [
          { value: section.status, ...dataStyle(index), fontWeight: "bold" as const },
          { value: row.university, ...dataStyle(index) },
          { value: row.acronym, ...dataStyle(index) },
          { value: row.major, ...dataStyle(index) },
          { value: row.degree, ...dataStyle(index) },
          { value: row.durationYears, ...dataStyle(index), align: "right" as const },
          { value: row.tuitionUsd ?? "—", ...dataStyle(index), align: "right" as const },
          { value: row.minGrade, ...dataStyle(index), align: "center" as const, fontWeight: "bold" as const },
          { value: row.notes || "—", ...dataStyle(index) },
          { value: row.sourceUrl || "—", ...dataStyle(index) },
        ]),
      ];
      return {
        data: rows,
        sheet: section.title.slice(0, 31),
        columns: [
          { width: 14 },
          { width: 30 },
          { width: 10 },
          { width: 28 },
          { width: 12 },
          { width: 10 },
          { width: 14 },
          { width: 10 },
          { width: 52 },
          { width: 42 },
        ],
        stickyRowsCount: 2,
        showGridLines: false,
      };
    });

  const sheets = [
    {
      data: summarySheet,
      sheet: "Summary",
      columns: [{ width: 36 }, { width: 24 }, { width: 18 }, { width: 18 }],
      showGridLines: false,
    },
    ...programSheets,
  ];

  const blob = await writeExcelFile(sheets as any, {
    fontFamily: "Calibri",
    fontSize: 10,
  }).toBlob();
  downloadBlob(
    blob,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileBase(model, "xlsx")
  );
}

function buildPdfHtml(model: EligibilityReportModel): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const logoUrl = `${origin}/images/orienx-mark.png`;
  const rowsFor = (section: EligibilityReportSection) => {
    if (section.rows.length === 0) return "";
    return section.rows
      .map((row) => {
        const source = row.sourceUrl
          ? `<div class="source"><a href="${escapeHtml(row.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(model.labels.officialSource)}</a></div>`
          : "";
        const gradeClass = row.minGrade === "F" ? "grade-badge grade-f" : "grade-badge";
        return `<tr>
          <td><strong>${escapeHtml(row.university)}</strong><div class="muted">${escapeHtml(row.acronym)}</div></td>
          <td>${escapeHtml(row.major)}</td>
          <td>${escapeHtml(row.degree)}</td>
          <td class="num">${row.durationYears}</td>
          <td class="num">${escapeHtml(formatUsd(row.tuitionUsd))}</td>
          <td class="center"><span class="${gradeClass}">${escapeHtml(row.minGrade)}</span></td>
          <td>${escapeHtml(row.notes || "—")}${source}</td>
        </tr>`;
      })
      .join("");
  };

  const sectionBlocks = model.sections
    .filter((section) => section.rows.length > 0)
    .map(
      (section) => `<section class="report-section ${section.key}">
        <h2>${escapeHtml(section.title)} <span>${section.rows.length}</span></h2>
        <table>
          <thead>
            <tr>
              <th style="width:16%">${escapeHtml(model.labels.university)}</th>
              <th style="width:19%">${escapeHtml(model.labels.major)}</th>
              <th style="width:9%">${escapeHtml(model.labels.degree)}</th>
              <th style="width:7%">${escapeHtml(model.labels.duration)}</th>
              <th style="width:8%">${escapeHtml(model.labels.tuition)}</th>
              <th style="width:7%">${escapeHtml(model.labels.minGrade)}</th>
              <th style="width:34%">${escapeHtml(model.labels.notes)}</th>
            </tr>
          </thead>
          <tbody>${rowsFor(section)}</tbody>
        </table>
      </section>`
    )
    .join("");

  const noPrograms =
    model.sections.every((section) => section.rows.length === 0)
      ? `<div class="empty">${escapeHtml(model.labels.noPrograms)}</div>`
      : "";

  return `<!doctype html>
<html lang="${escapeHtml(model.locale.startsWith("km") ? "km" : "en")}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(model.title)} — ${escapeHtml(model.grade)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm 16mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Khmer", Arial, sans-serif;
    color: #171A2C;
    background: #FFFFFF;
    font-size: 10px;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .actions {
    position: sticky; top: 0; z-index: 10;
    display: flex; justify-content: flex-end; gap: 8px;
    padding: 10px 14px;
    background: #F5F6FA;
    border-bottom: 1px solid #E6E8F0;
  }
  .actions button {
    border: 0; border-radius: 8px; padding: 8px 14px;
    font-size: 11px; font-weight: 700; cursor: pointer;
  }
  .actions .print { background: #111965; color: #FFFFFF; }
  .actions .close { background: #FFFFFF; color: #111965; border: 1px solid #D9DEEA; }
  .page { padding: 18px 22px 8px; }
  .report-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    gap: 16px; border-bottom: 2px solid #111965; padding-bottom: 12px;
  }
  .brand { display: flex; align-items: center; gap: 8px; }
  .brand-logo { width: 34px; height: 38px; object-fit: contain; flex-shrink: 0; }
  .brand-name { font-size: 20px; font-weight: 900; letter-spacing: -0.4px; color: #111965; }
  .brand-name span { color: #F69D0D; }
  .eyebrow { margin-top: 10px; font-size: 8.5px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #68708A; }
  h1 { margin: 3px 0 0; font-size: 23px; line-height: 1.15; font-weight: 900; color: #111965; }
  .subtitle { margin-top: 3px; font-size: 9.5px; color: #68708A; }
  .meta { text-align: right; font-size: 9px; color: #68708A; line-height: 1.7; }
  .meta b { color: #111965; }
  .hero { display: flex; gap: 10px; margin: 14px 0 12px; }
  .grade-card {
    min-width: 112px; border-radius: 12px; background: #111965; color: #FFFFFF;
    padding: 10px 14px; display: flex; flex-direction: column; justify-content: center;
  }
  .grade-card .label { font-size: 8px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #C7CCE8; }
  .grade-card .value { font-size: 34px; font-weight: 900; line-height: 1; color: #F7CE4D; margin-top: 2px; }
  .info-card { flex: 1; border: 1px solid #E6E8F0; border-radius: 12px; padding: 8px 12px; }
  .info-row { display: flex; justify-content: space-between; gap: 12px; font-size: 9px; padding: 2.5px 0; }
  .info-row span { color: #68708A; }
  .info-row b { color: #111965; text-align: right; }
  .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin: 10px 0 12px; }
  .summary-card { border: 1px solid #E6E8F0; border-radius: 10px; padding: 8px 10px; background: #FFFFFF; }
  .summary-card .num { font-size: 20px; font-weight: 900; color: #111965; line-height: 1.1; }
  .summary-card .lbl { margin-top: 2px; font-size: 7.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #68708A; }
  .summary-card.eligible { border-color: #A7F3D0; background: #ECFDF5; }
  .summary-card.eligible .num { color: #047857; }
  .summary-card.below { border-color: #FDE68A; background: #FFFBEB; }
  .summary-card.below .num { color: #B45309; }
  .summary-card.unverified { border-color: #E2E8F0; background: #F8FAFC; }
  .summary-card.missing { border-color: #C7CCE8; background: #F0F2FA; }
  .note {
    border: 1px solid #FDE68A; background: #FFFBEB; color: #92400E;
    border-radius: 10px; padding: 8px 10px; font-size: 8.5px; line-height: 1.5;
    margin-bottom: 12px;
  }
  .report-section { margin-top: 14px; }
  .report-section h2 {
    margin: 0 0 6px; padding: 0 0 4px; border-bottom: 1px solid #E6E8F0;
    font-size: 12px; font-weight: 900; color: #111965;
  }
  .report-section h2 span {
    display: inline-block; margin-left: 4px; border-radius: 999px;
    padding: 1px 7px; background: #F0F2FA; color: #68708A; font-size: 8px;
  }
  .report-section.eligible h2 { border-bottom-color: #A7F3D0; }
  .report-section.below h2 { border-bottom-color: #FDE68A; }
  .report-section.unverified h2 { border-bottom-color: #CBD5E1; }
  table { width: 100%; border-collapse: collapse; font-size: 7.8px; }
  thead th {
    background: #111965; color: #FFFFFF; text-align: left; vertical-align: bottom;
    padding: 4px 4px; font-size: 7.2px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  tbody td {
    border-bottom: 1px solid #EEF0F6; padding: 4px 4px; vertical-align: top;
  }
  tbody tr:nth-child(even) td { background: #FAFBFE; }
  tbody tr { page-break-inside: avoid; }
  .muted { color: #94A3B8; font-size: 7px; margin-top: 1px; }
  .num { text-align: right; white-space: nowrap; }
  .center { text-align: center; }
  .grade-badge {
    display: inline-block; min-width: 18px; border-radius: 5px;
    padding: 1px 5px; background: #E8F5EF; color: #047857;
    font-size: 7.5px; font-weight: 900; text-align: center;
  }
  .grade-badge.grade-f { background: #FEF3C7; color: #B45309; }
  .source { margin-top: 2px; }
  .source a { color: #2563EB; text-decoration: none; font-size: 7px; }
  .empty {
    border: 1px dashed #D9DEEA; border-radius: 10px; padding: 18px;
    text-align: center; color: #68708A; font-size: 9px;
  }
  .footer {
    margin-top: 16px; padding-top: 7px; border-top: 1px solid #E6E8F0;
    display: flex; justify-content: space-between; gap: 12px;
    font-size: 7px; color: #94A3B8;
  }
  @media print {
    .actions { display: none !important; }
    .page { padding: 0; }
    body { font-size: 9.5px; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
  }
</style>
</head>
<body>
  <div class="actions">
    <button class="print" onclick="window.print()">${escapeHtml(model.labels.print)}</button>
    <button class="close" onclick="window.close()">${escapeHtml(model.labels.close)}</button>
  </div>
  <div class="page">
    <header class="report-header">
      <div>
        <div class="brand">
          <img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="OrienX" />
          <div class="brand-name">Orien<span>X</span></div>
        </div>
        <div class="eyebrow">${escapeHtml(model.labels.eyebrow)}</div>
        <h1>${escapeHtml(model.labels.title)}</h1>
        <div class="subtitle">${escapeHtml(model.labels.subtitle)}</div>
      </div>
      <div class="meta">
        <div>${escapeHtml(model.labels.generated)}<br /><b>${escapeHtml(model.generatedLabel)}</b></div>
        <div style="margin-top:6px">${escapeHtml(model.labels.grade)}<br /><b>${escapeHtml(model.grade)}</b></div>
      </div>
    </header>

    <div class="hero">
      <div class="grade-card">
        <div class="label">${escapeHtml(model.labels.grade)}</div>
        <div class="value">${escapeHtml(model.grade)}</div>
      </div>
      <div class="info-card">
        ${model.studentName ? `<div class="info-row"><span>${escapeHtml(model.labels.preparedFor)}</span><b>${escapeHtml(model.studentName)}</b></div>` : ""}
        <div class="info-row"><span>${escapeHtml(model.labels.scope)}</span><b>${escapeHtml(model.scopeLabel)}</b></div>
        ${model.search ? `<div class="info-row"><span>${escapeHtml(model.labels.search)}</span><b>${escapeHtml(model.search)}</b></div>` : ""}
        <div class="info-row"><span>${escapeHtml(model.labels.generated)}</span><b>${escapeHtml(model.generatedLabel)}</b></div>
      </div>
    </div>

    <div class="summary">
      <div class="summary-card eligible">
        <div class="num">${model.summary.eligible}</div>
        <div class="lbl">${escapeHtml(model.labels.eligible)}</div>
      </div>
      <div class="summary-card below">
        <div class="num">${model.summary.below}</div>
        <div class="lbl">${escapeHtml(model.labels.below)}</div>
      </div>
      <div class="summary-card unverified">
        <div class="num">${model.summary.unverified}</div>
        <div class="lbl">${escapeHtml(model.labels.unverified)}</div>
      </div>
      <div class="summary-card missing">
        <div class="num">${model.summary.missing}</div>
        <div class="lbl">${escapeHtml(model.labels.missing)}</div>
      </div>
    </div>

    <div class="note">${escapeHtml(model.note)}</div>

    ${sectionBlocks}
    ${noPrograms}

    <footer class="footer">
      <span>${escapeHtml(model.labels.footer)}</span>
      <span>${escapeHtml(model.labels.generatedBy)}</span>
    </footer>
  </div>
  <script>
    window.addEventListener("load", function () {
      setTimeout(function () { window.print(); }, 350);
    });
  </script>
</body>
</html>`;
}

export function openPdfReport(model: EligibilityReportModel): boolean {
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) return false;

  reportWindow.opener = null;
  reportWindow.document.open();
  reportWindow.document.write(buildPdfHtml(model));
  reportWindow.document.close();
  reportWindow.focus();

  return true;
}
