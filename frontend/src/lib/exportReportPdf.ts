import jsPDF from "jspdf";
import { ExternalReport } from "../types/reports";

type Translate = (key: string, options?: Record<string, unknown>) => string;

const STATUS_KEYS: Record<ExternalReport["status"], string> = {
  requested: "requested",
  "in-progress": "inProgress",
  completed: "completed",
  delivered: "delivered",
};

function getPatientName(report: ExternalReport, t: Translate): string {
  if (!report.patient || typeof report.patient === "string") {
    return t("common.unknownPatient");
  }
  const { firstName = "", lastName = "" } = report.patient;
  return `${firstName} ${lastName}`.trim() || t("common.unknownPatient");
}

export function exportReportToPdf(report: ExternalReport, t: Translate, locale: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - marginX * 2;
  let y = 56;

  const addSection = (label: string, value?: string) => {
    if (!value) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(label, marginX, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(value, contentWidth);
    doc.text(lines, marginX, y);
    y += lines.length * 13 + 16;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(t("reports.externalReport"), marginX, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${t("reports.form.patient")}: ${getPatientName(report, t)}`, marginX, y);
  y += 16;
  doc.text(`${t("reports.form.type")}: ${t(`reports.types.${report.reportType}`)}`, marginX, y);
  y += 16;
  doc.text(`${t("reports.form.status")}: ${t(`reports.status.${STATUS_KEYS[report.status]}`)}`, marginX, y);
  y += 16;
  doc.text(
    `${t("reports.card.recipient")}: ${report.recipientName}${report.recipientOrganization ? ` (${report.recipientOrganization})` : ""}`,
    marginX,
    y
  );
  y += 16;
  doc.text(`${t("reports.form.requestDate")}: ${new Date(report.requestDate).toLocaleDateString(locale)}`, marginX, y);
  y += 16;
  if (report.completionDate) {
    doc.text(`${t("reports.form.completionDate")}: ${new Date(report.completionDate).toLocaleDateString(locale)}`, marginX, y);
    y += 16;
  }
  y += 12;

  addSection(t("reports.form.purpose"), report.purpose);
  addSection(t("reports.form.summary"), report.summary);
  addSection(t("reports.form.findings"), report.findings);
  addSection(t("reports.form.recommendations"), report.recommendations);

  const patientName = getPatientName(report, t).replace(/\s+/g, "_");
  doc.save(`report-${patientName}-${report._id.slice(-6)}.pdf`);
}
