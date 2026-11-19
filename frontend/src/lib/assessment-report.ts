import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export type AssessmentReportFormat =
  | "pdf"
  | "excel"
  | "csv"
  | "json"
  | "markdown"
  | "html"
  | "text"
  | "png"
  | "share";

export interface AssessmentDimension {
  label: string;
  value: number;
  detail?: string;
}

export interface AssessmentHighlight {
  title: string;
  items: string[];
}

export interface AssessmentRecommendation {
  major: string;
  fit: number;
  universities: number;
}

export interface AssessmentReportLabels {
  preparedFor: string;
  generated: string;
  summary: string;
  dimensions: string;
  highlights: string;
  recommendedMajors: string;
  archetype: string;
  profile: string;
  eyebrow: string;
  fitScore: string;
  universities: string;
  print: string;
  close: string;
  footer: string;
  noResult: string;
}

export interface AssessmentReportModel {
  kind: "personality" | "riasec";
  title: string;
  subtitle: string;
  studentName: string;
  generatedAt: Date;
  generatedLabel: string;
  locale: string;
  headline: string;
  headlineLabel: string;
  archetype: string;
  role?: string;
  tagline: string;
  characterImageUrl?: string;
  dimensions: AssessmentDimension[];
  highlights: AssessmentHighlight[];
  recommendations: AssessmentRecommendation[];
  labels: AssessmentReportLabels;
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

function fileBase(model: AssessmentReportModel, extension: string): string {
  const date = model.generatedAt.toISOString().slice(0, 10);
  const kind = model.kind === "personality" ? "Personality" : "RIASEC";
  const headline = model.headline.replace(/[^A-Za-z0-9-]/g, "");
  return `OrienX-${kind}-Report-${headline}-${date}.${extension}`;
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

export function downloadAssessmentCsv(model: AssessmentReportModel) {
  const rows: string[][] = [];
  const addRow = (...cells: Array<string | number | null | undefined>) => {
    rows.push(cells.map((cell) => (cell == null ? "" : String(cell))));
  };

  addRow(model.title);
  addRow(model.subtitle);
  addRow(model.labels.preparedFor, model.studentName || "—");
  addRow(model.labels.generated, model.generatedLabel);
  addRow(model.headlineLabel, model.headline);
  addRow(model.labels.archetype, model.archetype);
  if (model.role) addRow(model.labels.profile, model.role);
  addRow(model.tagline);
  addRow("");
  addRow(model.labels.dimensions);
  addRow(model.labels.dimensions, "Score (%)", "Detail");
  model.dimensions.forEach((dimension) => {
    addRow(dimension.label, Math.round(dimension.value), dimension.detail || "");
  });
  addRow("");
  model.highlights.forEach((highlight) => {
    addRow(highlight.title);
    highlight.items.forEach((item) => addRow("", item));
    addRow("");
  });
  addRow(model.labels.recommendedMajors);
  addRow("Major", model.labels.fitScore, model.labels.universities);
  model.recommendations.forEach((recommendation) => {
    addRow(
      recommendation.major,
      Math.round(recommendation.fit),
      recommendation.universities
    );
  });

  const csv = `\uFEFF${rows
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n")}`;
  downloadBlob(csv, "text/csv;charset=utf-8;", fileBase(model, "csv"));
}

export function downloadAssessmentJson(model: AssessmentReportModel) {
  const payload = {
    report: model.title,
    version: 1,
    kind: model.kind,
    generatedAt: model.generatedAt.toISOString(),
    student: model.studentName || null,
    headline: {
      label: model.headlineLabel,
      value: model.headline,
    },
    archetype: model.archetype,
    role: model.role || null,
    tagline: model.tagline,
    dimensions: model.dimensions.map((dimension) => ({
      label: dimension.label,
      score: Math.round(dimension.value),
      detail: dimension.detail || null,
    })),
    highlights: model.highlights,
    recommendations: model.recommendations,
  };
  downloadBlob(
    JSON.stringify(payload, null, 2),
    "application/json;charset=utf-8;",
    fileBase(model, "json")
  );
}

export async function downloadAssessmentExcel(model: AssessmentReportModel) {
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
    height: 28,
  };
  const dataStyle = (index: number) => ({
    alignVertical: "top" as const,
    wrap: true,
    backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F8FAFD",
    borderColor: "#E6E8F0",
    borderStyle: "thin" as const,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const summaryRows: any[][] = [
    [{ value: model.title, columnSpan: 4, ...titleStyle }, null, null, null],
    [{ value: model.subtitle, columnSpan: 4, ...valueStyle, textColor: "#68708A" }, null, null, null],
    [],
    [{ value: model.labels.preparedFor, ...labelStyle }, { value: model.studentName || "—", ...valueStyle }],
    [{ value: model.labels.generated, ...labelStyle }, { value: model.generatedLabel, ...valueStyle }],
    [{ value: model.headlineLabel, ...labelStyle }, { value: model.headline, ...valueStyle, fontWeight: "bold" as const }],
    [{ value: model.labels.archetype, ...labelStyle }, { value: model.archetype, ...valueStyle }],
    [{ value: model.labels.profile, ...labelStyle }, { value: model.role || "", ...valueStyle }],
    [{ value: model.tagline, columnSpan: 4, ...valueStyle, backgroundColor: "#FFFBEB" }, null, null, null],
    [],
    [{ value: model.labels.dimensions, columnSpan: 4, ...labelStyle }, null, null, null],
    [
      { value: model.labels.dimensions, ...headerStyle },
      { value: "Score (%)", ...headerStyle },
      { value: "Detail", ...headerStyle },
      null,
    ],
    ...model.dimensions.map((dimension, index) => [
      { value: dimension.label, ...dataStyle(index) },
      { value: Math.round(dimension.value), ...dataStyle(index), align: "right" as const },
      { value: dimension.detail || "—", ...dataStyle(index) },
      null,
    ]),
    [],
    ...model.highlights.flatMap((highlight, index) => [
      [{ value: highlight.title, columnSpan: 4, ...labelStyle }, null, null, null],
      ...highlight.items.map((item) => [
        { value: item, ...dataStyle(index) },
        null,
        null,
        null,
      ]),
      [],
    ]),
    [{ value: model.labels.footer, columnSpan: 4, ...valueStyle, textColor: "#94A3B8" }, null, null, null],
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recommendationRows: any[][] = [
    [
      { value: `${model.labels.recommendedMajors} — ${model.title}`, columnSpan: 3, ...titleStyle },
      null,
      null,
    ],
    [
      { value: "Major", ...headerStyle },
      { value: model.labels.fitScore, ...headerStyle },
      { value: model.labels.universities, ...headerStyle },
    ],
    ...model.recommendations.map((recommendation, index) => [
      { value: recommendation.major, ...dataStyle(index) },
      { value: Math.round(recommendation.fit), ...dataStyle(index), align: "right" as const },
      { value: recommendation.universities, ...dataStyle(index), align: "right" as const },
    ]),
  ];

  const blob = await writeExcelFile(
    [
      {
        data: summaryRows,
        sheet: "Summary",
        columns: [{ width: 30 }, { width: 24 }, { width: 42 }, { width: 6 }],
        showGridLines: false,
      },
      {
        data: recommendationRows,
        sheet: "Recommended majors",
        columns: [{ width: 40 }, { width: 14 }, { width: 14 }],
        stickyRowsCount: 2,
        showGridLines: false,
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any,
    { fontFamily: "Calibri", fontSize: 10 }
  ).toBlob();

  downloadBlob(
    blob,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileBase(model, "xlsx")
  );
}

function buildAssessmentPdfHtml(
  model: AssessmentReportModel,
  autoPrint = true
): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const logoUrl = `${origin}/images/orienx-mark.png`;
  const dimensions = model.dimensions
    .map(
      (dimension) => `<div class="dimension">
        <div class="dimension-head">
          <span>${escapeHtml(dimension.label)}</span>
          <strong>${Math.round(dimension.value)}%</strong>
        </div>
        <div class="bar"><div class="bar-fill" style="width:${Math.max(
          0,
          Math.min(100, dimension.value)
        )}%"></div></div>
        ${dimension.detail ? `<div class="dimension-detail">${escapeHtml(dimension.detail)}</div>` : ""}
      </div>`
    )
    .join("");

  const highlights = model.highlights
    .map(
      (highlight) => `<div class="highlight">
        <h3>${escapeHtml(highlight.title)}</h3>
        <ul>${highlight.items
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("")}</ul>
      </div>`
    )
    .join("");

  const recommendations = model.recommendations
    .map(
      (recommendation, index) => `<tr>
        <td class="rank">${index + 1}</td>
        <td><strong>${escapeHtml(recommendation.major)}</strong></td>
        <td class="num">${Math.round(recommendation.fit)}%</td>
        <td class="num">${recommendation.universities}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="${escapeHtml(model.locale.startsWith("km") ? "km" : "en")}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(model.title)} — ${escapeHtml(model.headline)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm 16mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Khmer", Arial, sans-serif;
    color: #171A2C; background: #FFFFFF; font-size: 10px; line-height: 1.45;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .actions { position: sticky; top: 0; z-index: 10; display: flex; justify-content: flex-end; gap: 8px; padding: 10px 14px; background: #F5F6FA; border-bottom: 1px solid #E6E8F0; }
  .actions button { border: 0; border-radius: 8px; padding: 8px 14px; font-size: 11px; font-weight: 700; cursor: pointer; }
  .actions .print { background: #111965; color: #FFFFFF; }
  .actions .close { background: #FFFFFF; color: #111965; border: 1px solid #D9DEEA; }
  .page { padding: 18px 22px 8px; }
  .report-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 2px solid #111965; padding-bottom: 12px; }
  .brand { display: flex; align-items: center; gap: 8px; }
  .brand-logo { width: 34px; height: 38px; object-fit: contain; flex-shrink: 0; }
  .character-card { width: 112px; border-radius: 12px; background: linear-gradient(145deg, #111965, #1A2580); border: 1px solid #111965; display: flex; align-items: center; justify-content: center; padding: 6px; overflow: hidden; }
  .character-card img { max-width: 100%; max-height: 120px; object-fit: contain; }
  .brand-name { font-size: 20px; font-weight: 900; letter-spacing: -0.4px; color: #111965; }
  .brand-name span { color: #F69D0D; }
  .eyebrow { margin-top: 10px; font-size: 8.5px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #68708A; }
  h1 { margin: 3px 0 0; font-size: 23px; line-height: 1.15; font-weight: 900; color: #111965; }
  .subtitle { margin-top: 3px; font-size: 9.5px; color: #68708A; max-width: 520px; }
  .meta { text-align: right; font-size: 9px; color: #68708A; line-height: 1.7; }
  .meta b { color: #111965; }
  .hero { display: flex; gap: 10px; margin: 14px 0 12px; }
  .headline-card { min-width: 132px; border-radius: 12px; background: #111965; color: #FFFFFF; padding: 12px 16px; display: flex; flex-direction: column; justify-content: center; }
  .headline-card .label { font-size: 8px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #C7CCE8; }
  .headline-card .value { font-size: 34px; font-weight: 900; line-height: 1; color: #F7CE4D; margin-top: 2px; }
  .info-card { flex: 1; border: 1px solid #E6E8F0; border-radius: 12px; padding: 9px 12px; }
  .info-row { display: flex; justify-content: space-between; gap: 12px; font-size: 9px; padding: 2.5px 0; }
  .info-row span { color: #68708A; }
  .info-row b { color: #111965; text-align: right; }
  .tagline { margin: 2px 0 12px; border: 1px solid #FDE68A; background: #FFFBEB; color: #92400E; border-radius: 10px; padding: 8px 10px; font-size: 9px; line-height: 1.5; }
  h2 { margin: 16px 0 7px; padding-bottom: 4px; border-bottom: 1px solid #E6E8F0; font-size: 12px; font-weight: 900; color: #111965; }
  .dimensions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; }
  .dimension { break-inside: avoid; }
  .dimension-head { display: flex; justify-content: space-between; gap: 8px; font-size: 8.5px; font-weight: 700; color: #111965; }
  .dimension-head strong { color: #111965; }
  .bar { margin-top: 3px; height: 7px; border-radius: 999px; background: #EEF0F6; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #111965, #F7CE4D); }
  .dimension-detail { margin-top: 2px; font-size: 7.5px; color: #68708A; }
  .highlights { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .highlight { border: 1px solid #E6E8F0; border-radius: 10px; padding: 8px 10px; break-inside: avoid; }
  .highlight h3 { margin: 0 0 4px; font-size: 8.5px; font-weight: 900; color: #111965; text-transform: uppercase; letter-spacing: 0.04em; }
  .highlight ul { margin: 0; padding-left: 12px; }
  .highlight li { margin: 2px 0; font-size: 8px; line-height: 1.4; color: #475569; }
  table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
  thead th { background: #111965; color: #FFFFFF; text-align: left; padding: 5px 6px; font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.04em; }
  tbody td { border-bottom: 1px solid #EEF0F6; padding: 5px 6px; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #FAFBFE; }
  tbody tr { break-inside: avoid; }
  .rank { width: 22px; color: #94A3B8; font-weight: 800; }
  .num { text-align: right; white-space: nowrap; }
  .footer { margin-top: 16px; padding-top: 7px; border-top: 1px solid #E6E8F0; display: flex; justify-content: space-between; gap: 12px; font-size: 7px; color: #94A3B8; }
  .empty { border: 1px dashed #D9DEEA; border-radius: 10px; padding: 18px; text-align: center; color: #68708A; font-size: 9px; }
  @media print { .actions { display: none !important; } .page { padding: 0; } thead { display: table-header-group; } }
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
        <h1>${escapeHtml(model.title)}</h1>
        <div class="subtitle">${escapeHtml(model.subtitle)}</div>
      </div>
      <div class="meta">
        <div>${escapeHtml(model.labels.generated)}<br /><b>${escapeHtml(model.generatedLabel)}</b></div>
      </div>
    </header>

    <div class="hero">
      <div class="headline-card">
        <div class="label">${escapeHtml(model.headlineLabel)}</div>
        <div class="value">${escapeHtml(model.headline)}</div>
      </div>
      ${model.characterImageUrl ? `<div class="character-card"><img src="${escapeHtml(model.characterImageUrl)}" alt="" /></div>` : ""}
      <div class="info-card">
        <div class="info-row"><span>${escapeHtml(model.labels.preparedFor)}</span><b>${escapeHtml(model.studentName || "—")}</b></div>
        <div class="info-row"><span>${escapeHtml(model.labels.archetype)}</span><b>${escapeHtml(model.archetype)}</b></div>
        ${model.role ? `<div class="info-row"><span>${escapeHtml(model.labels.profile)}</span><b>${escapeHtml(model.role)}</b></div>` : ""}
        <div class="info-row"><span>${escapeHtml(model.labels.generated)}</span><b>${escapeHtml(model.generatedLabel)}</b></div>
      </div>
    </div>

    <div class="tagline">${escapeHtml(model.tagline)}</div>

    <h2>${escapeHtml(model.labels.dimensions)}</h2>
    <div class="dimensions">${dimensions}</div>

    <h2>${escapeHtml(model.labels.highlights)}</h2>
    <div class="highlights">${highlights}</div>

    ${
      model.recommendations.length
        ? `<h2>${escapeHtml(model.labels.recommendedMajors)}</h2>
          <table>
            <thead><tr><th>#</th><th>Major</th><th class="num">${escapeHtml(model.labels.fitScore)}</th><th class="num">${escapeHtml(model.labels.universities)}</th></tr></thead>
            <tbody>${recommendations}</tbody>
          </table>`
        : `<div class="empty">${escapeHtml(model.labels.noResult)}</div>`
    }

    <footer class="footer">
      <span>${escapeHtml(model.labels.footer)}</span>
      <span>OrienX</span>
    </footer>
  </div>
  ${
    autoPrint
      ? `<script>
    window.addEventListener("load", function () {
      setTimeout(function () { window.print(); }, 350);
    });
  </script>`
      : ""
  }
</body>
</html>`;
}

export function openAssessmentPdf(model: AssessmentReportModel): boolean {
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) return false;

  reportWindow.opener = null;
  reportWindow.document.open();
  reportWindow.document.write(buildAssessmentPdfHtml(model));
  reportWindow.document.close();
  reportWindow.focus();

  return true;
}
export function downloadAssessmentMarkdown(model: AssessmentReportModel) {
  const lines: string[] = [
    `# ${model.title}`,
    "",
    model.subtitle,
    "",
    `**${model.labels.preparedFor}:** ${model.studentName || "—"}  `,
    `**${model.labels.generated}:** ${model.generatedLabel}  `,
    `**${model.headlineLabel}:** ${model.headline}  `,
    `**${model.labels.archetype}:** ${model.archetype}`,
  ];
  if (model.role) lines.push(`**${model.labels.profile}:** ${model.role}`);
  lines.push("", `> ${model.tagline}`, "");
  lines.push(`## ${model.labels.dimensions}`, "");
  lines.push("| Dimension | Score | Detail |");
  lines.push("| --- | ---: | --- |");
  model.dimensions.forEach((dimension) => {
    lines.push(
      `| ${dimension.label.replace(/\|/g, "\\|")} | ${Math.round(
        dimension.value
      )}% | ${(dimension.detail || "—").replace(/\|/g, "\\|")} |`
    );
  });
  lines.push("", `## ${model.labels.highlights}`, "");
  model.highlights.forEach((highlight) => {
    lines.push(`### ${highlight.title}`, "");
    highlight.items.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  });
  lines.push(`## ${model.labels.recommendedMajors}`, "");
  lines.push(
    `| Major | ${model.labels.fitScore} | ${model.labels.universities} |`
  );
  lines.push("| --- | ---: | ---: |");
  model.recommendations.forEach((recommendation) => {
    lines.push(
      `| ${recommendation.major.replace(/\|/g, "\\|")} | ${Math.round(
        recommendation.fit
      )}% | ${recommendation.universities} |`
    );
  });
  lines.push("", "---", "", model.labels.footer);

  downloadBlob(
    `\uFEFF${lines.join("\n")}`,
    "text/markdown;charset=utf-8;",
    fileBase(model, "md")
  );
}

export function downloadAssessmentHtml(model: AssessmentReportModel) {
  const html = buildAssessmentPdfHtml(model, false);
  downloadBlob(html, "text/html;charset=utf-8;", fileBase(model, "html"));
}

export function downloadAssessmentText(model: AssessmentReportModel) {
  const lines: string[] = [
    model.title,
    model.subtitle,
    "",
    `${model.labels.preparedFor}: ${model.studentName || "—"}`,
    `${model.labels.generated}: ${model.generatedLabel}`,
    `${model.headlineLabel}: ${model.headline}`,
    `${model.labels.archetype}: ${model.archetype}`,
  ];
  if (model.role) lines.push(`${model.labels.profile}: ${model.role}`);
  lines.push("", model.tagline, "", model.labels.dimensions);
  model.dimensions.forEach((dimension) => {
    lines.push(
      `- ${dimension.label}: ${Math.round(dimension.value)}%${
        dimension.detail ? ` (${dimension.detail})` : ""
      }`
    );
  });
  lines.push("", model.labels.highlights);
  model.highlights.forEach((highlight) => {
    lines.push(highlight.title);
    highlight.items.forEach((item) => lines.push(`  - ${item}`));
  });
  lines.push("", model.labels.recommendedMajors);
  model.recommendations.forEach((recommendation) => {
    lines.push(
      `- ${recommendation.major}: ${Math.round(recommendation.fit)}% (${
        recommendation.universities
      } ${model.labels.universities})`
    );
  });
  lines.push("", model.labels.footer);

  downloadBlob(
    `\uFEFF${lines.join("\n")}`,
    "text/plain;charset=utf-8;",
    fileBase(model, "txt")
  );
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 3
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (ctx.measureText(last).width > maxWidth) {
      let trimmed = last;
      while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
        trimmed = trimmed.slice(0, -1);
      }
      lines[maxLines - 1] = `${trimmed}…`;
    }
  }
  return lines;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

export async function downloadAssessmentPng(model: AssessmentReportModel) {
  if (typeof document === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const background = ctx.createLinearGradient(0, 0, 1080, 1350);
  background.addColorStop(0, "#111965");
  background.addColorStop(0.5, "#1A2580");
  background.addColorStop(1, "#0D134E");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1080, 1350);

  const glow = ctx.createRadialGradient(980, 100, 10, 980, 100, 420);
  glow.addColorStop(0, "rgba(247,206,77,0.22)");
  glow.addColorStop(1, "rgba(247,206,77,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 600);

  const glow2 = ctx.createRadialGradient(80, 1200, 10, 80, 1200, 460);
  glow2.addColorStop(0, "rgba(96,165,250,0.18)");
  glow2.addColorStop(1, "rgba(96,165,250,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 700, 700, 650);

  const fontFamily = "'Plus Jakarta Sans', 'Noto Sans Khmer', Arial, sans-serif";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `900 34px ${fontFamily}`;
  ctx.fillText("Orien", 64, 92);
  ctx.fillStyle = "#F7CE4D";
  ctx.fillText("X", 64 + ctx.measureText("Orien").width, 92);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `800 13px ${fontFamily}`;
  ctx.fillText(model.labels.eyebrow.toUpperCase(), 64, 122);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = `700 14px ${fontFamily}`;
  ctx.fillText(model.generatedLabel, 1016, 92);
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  roundedRect(ctx, 64, 176, 360, 42, 21);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#F7CE4D";
  ctx.font = `800 13px ${fontFamily}`;
  ctx.fillText(model.headlineLabel.toUpperCase(), 82, 203);

  let headlineSize = 150;
  ctx.font = `900 ${headlineSize}px ${fontFamily}`;
  while (ctx.measureText(model.headline).width > 760 && headlineSize > 92) {
    headlineSize -= 6;
    ctx.font = `900 ${headlineSize}px ${fontFamily}`;
  }
  ctx.fillStyle = "#F7CE4D";
  ctx.fillText(model.headline, 60, 356);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 31px ${fontFamily}`;
  const archetypeLines = wrapCanvasText(ctx, model.archetype, 780, 2);
  archetypeLines.forEach((line, index) => {
    ctx.fillText(line, 64, 420 + index * 40);
  });

  if (model.role) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = `700 14px ${fontFamily}`;
    ctx.fillText(model.role.toUpperCase(), 64, 490);
  }

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = `500 18px ${fontFamily}`;
  const taglineY = model.role ? 526 : 500;
  wrapCanvasText(ctx, model.tagline, 700, 2).forEach((line, index) => {
    ctx.fillText(line, 64, taglineY + index * 27);
  });

  // Dimensions column
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = `800 13px ${fontFamily}`;
  ctx.fillText(model.labels.dimensions.toUpperCase(), 64, 620);

  const dimensions = model.dimensions.slice(0, 6);
  dimensions.forEach((dimension, index) => {
    const y = 660 + index * 66;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = `700 16px ${fontFamily}`;
    const label = wrapCanvasText(ctx, dimension.label, 420, 1)[0] ?? "";
    ctx.fillText(label, 64, y);

    ctx.textAlign = "right";
    ctx.fillStyle = "#F7CE4D";
    ctx.font = `800 16px ${fontFamily}`;
    ctx.fillText(`${Math.round(dimension.value)}%`, 560, y);
    ctx.textAlign = "left";

    ctx.fillStyle = "rgba(255,255,255,0.14)";
    roundedRect(ctx, 64, y + 12, 496, 9, 5);
    ctx.fill();

    const bar = ctx.createLinearGradient(64, 0, 560, 0);
    bar.addColorStop(0, "#F7CE4D");
    bar.addColorStop(1, "#FDE68A");
    ctx.fillStyle = bar;
    roundedRect(
      ctx,
      64,
      y + 12,
      Math.max(6, (496 * Math.max(0, Math.min(100, dimension.value))) / 100),
      9,
      5
    );
    ctx.fill();
  });

  // Recommendations card
  const cardX = 620;
  const cardY = 620;
  const cardW = 396;
  const cardH = 430;
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  roundedRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = `800 13px ${fontFamily}`;
  ctx.fillText(model.labels.recommendedMajors.toUpperCase(), cardX + 24, cardY + 36);

  const recommendations = model.recommendations.slice(0, 3);
  recommendations.forEach((recommendation, index) => {
    const y = cardY + 78 + index * 108;
    if (index > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(cardX + 24, y - 22, cardW - 48, 1);
    }
    ctx.fillStyle = "#F7CE4D";
    ctx.font = `900 18px ${fontFamily}`;
    ctx.fillText(`${index + 1}`, cardX + 24, y + 8);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `700 17px ${fontFamily}`;
    wrapCanvasText(ctx, recommendation.major, cardW - 110, 2).forEach((line, lineIndex) => {
      ctx.fillText(line, cardX + 54, y + 2 + lineIndex * 23);
    });

    ctx.textAlign = "right";
    ctx.fillStyle = "#F7CE4D";
    ctx.font = `800 17px ${fontFamily}`;
    ctx.fillText(`${Math.round(recommendation.fit)}%`, cardX + cardW - 24, y + 8);
    ctx.textAlign = "left";
  });

  if (recommendations.length === 0) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = `500 15px ${fontFamily}`;
    ctx.fillText(model.labels.noResult, cardX + 24, cardY + 90);
  }

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(64, 1240, 952, 1);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `600 14px ${fontFamily}`;
  ctx.fillText(model.studentName || "—", 64, 1280);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = `600 13px ${fontFamily}`;
  ctx.fillText(model.labels.footer, 1016, 1280);
  ctx.fillStyle = "#F7CE4D";
  ctx.font = `800 15px ${fontFamily}`;
  ctx.fillText("orienx", 1016, 1305);
  ctx.textAlign = "left";

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = fileBase(model, "png");
  link.click();
}

export interface SharedAssessmentPayload {
  version: 1;
  kind: "personality" | "riasec";
  headline: string;
  headlineLabel: string;
  archetype: string;
  role?: string;
  tagline: string;
  studentName?: string;
  generatedAt: string;
  dimensions: AssessmentDimension[];
  highlights: AssessmentHighlight[];
  recommendations: AssessmentRecommendation[];
}

function toSharePayload(model: AssessmentReportModel): SharedAssessmentPayload {
  return {
    version: 1,
    kind: model.kind,
    headline: model.headline,
    headlineLabel: model.headlineLabel,
    archetype: model.archetype,
    role: model.role,
    tagline: model.tagline,
    studentName: model.studentName,
    generatedAt: model.generatedAt.toISOString(),
    dimensions: model.dimensions.map((dimension) => ({
      label: dimension.label,
      value: Math.round(dimension.value),
      detail: dimension.detail,
    })),
    highlights: model.highlights,
    recommendations: model.recommendations,
  };
}

export function encodeAssessmentShareUrl(model: AssessmentReportModel): string {
  const payload = toSharePayload(model);
  const encoded = compressToEncodedURIComponent(JSON.stringify(payload));
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/assessments/shared#r=${encoded}`;
}

export function decodeAssessmentShare(
  encoded: string
): SharedAssessmentPayload | null {
  if (!encoded) return null;
  try {
    const raw = decompressFromEncodedURIComponent(encoded);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SharedAssessmentPayload;
    if (parsed.version !== 1 || !parsed.headline) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function exportAssessmentReport(
  model: AssessmentReportModel,
  format: AssessmentReportFormat
): Promise<{ shareUrl?: string } | void> {
  switch (format) {
    case "pdf": {
      const opened = openAssessmentPdf(model);
      if (!opened) throw new Error("PDF popup blocked");
      return;
    }
    case "excel":
      await downloadAssessmentExcel(model);
      return;
    case "csv":
      downloadAssessmentCsv(model);
      return;
    case "json":
      downloadAssessmentJson(model);
      return;
    case "markdown":
      downloadAssessmentMarkdown(model);
      return;
    case "html":
      downloadAssessmentHtml(model);
      return;
    case "text":
      downloadAssessmentText(model);
      return;
    case "png":
      await downloadAssessmentPng(model);
      return;
    case "share":
      return { shareUrl: encodeAssessmentShareUrl(model) };
    default:
      return;
  }
}
