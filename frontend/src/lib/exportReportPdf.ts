import jsPDF from "jspdf";
import { ExternalReport } from "../types/reports";

function getPatientName(report: ExternalReport): string {
  if (!report.patient || typeof report.patient === "string") {
    return "Unknown Patient";
  }
  const { firstName = "", lastName = "" } = report.patient;
  return `${firstName} ${lastName}`.trim() || "Unknown Patient";
}

export function exportReportToPdf(report: ExternalReport) {
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
  doc.text("External Report", marginX, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Patient: ${getPatientName(report)}`, marginX, y);
  y += 16;
  doc.text(`Type: ${report.reportType}`, marginX, y);
  y += 16;
  doc.text(`Status: ${report.status}`, marginX, y);
  y += 16;
  doc.text(`Recipient: ${report.recipientName}${report.recipientOrganization ? ` (${report.recipientOrganization})` : ""}`, marginX, y);
  y += 16;
  doc.text(`Request date: ${new Date(report.requestDate).toLocaleDateString()}`, marginX, y);
  y += 16;
  if (report.completionDate) {
    doc.text(`Completion date: ${new Date(report.completionDate).toLocaleDateString()}`, marginX, y);
    y += 16;
  }
  y += 12;

  addSection("Purpose", report.purpose);
  addSection("Summary", report.summary);
  addSection("Findings", report.findings);
  addSection("Recommendations", report.recommendations);

  const patientName = getPatientName(report).replace(/\s+/g, "_");
  doc.save(`report-${patientName}-${report._id.slice(-6)}.pdf`);
}
