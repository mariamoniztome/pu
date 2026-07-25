import { useState, useEffect } from "react";
import { Plus, FileText, Eye, Edit, Download, Trash2, FileDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import { externalReportsApi } from "../../api";
import { ExternalReport } from "../../types/reports";
import { ReportForm } from "../../components/reports/ReportForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useTranslation } from "../../hooks/useTranslation";
import { exportReportToPdf } from "../../lib/exportReportPdf";
import { PageHeaderAction } from "../../components/PageHeaderAction";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";

export function ReportsPage() {
  const { t, i18n } = useTranslation();
  const culture = i18n.language?.startsWith("pt") ? "pt-PT" : "en-US";
  const [reports, setReports] = useState<ExternalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ExternalReport | null>(
    null
  );
  const [viewReport, setViewReport] = useState<ExternalReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await externalReportsApi.getAll();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (report: ExternalReport) => {
   if (!report.patient || typeof report.patient === 'string') {
      return t('common.unknownPatient');
    }
    const { firstName = '', lastName = '' } = report.patient;
    const name = `${firstName} ${lastName}`.trim();
    return name || t('common.unknownPatient');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = (id: string) => {
    setReportToDelete(id);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    try {
      await externalReportsApi.delete(reportToDelete);
      loadReports();
    } catch (error) {
      console.error('Failed to delete report:', error);
    } finally {
      setReportToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {t('reports.loadingReports')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeaderAction>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('reports.newReport')}
        </Button>
      </PageHeaderAction>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report._id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {getPatientName(report)}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs capitalize font-medium px-3 py-1.5 rounded-xl ${getStatusColor(
                    report.status
                  )}`}
                >
                  {t(`reports.status.${report.status === 'in-progress' ? 'inProgress' : report.status}`)}
                </span>
                <span className="text-xs capitalize font-medium px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-100 to-red-200 text-red-800">
                  {t(`reports.types.${report.reportType || 'other'}`)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">{t('reports.card.recipient')}:</span>{" "}
                {report.recipientName}
              </div>
              {report.recipientOrganization && (
                <div className="text-sm">
                  <span className="font-medium">{t('reports.card.organization')}:</span>{" "}
                  {report.recipientOrganization}
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium">{t('reports.card.requested')}:</span>{" "}
                {new Date(report.requestDate).toLocaleDateString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">{t('reports.card.purpose')}:</span> {report.purpose}
              </div>
              {report.attachments.length > 0 && (
                <div className="space-y-1 mt-2">
                  <div className="text-sm font-medium text-slate-700">{t('reports.card.attachments', { count: report.attachments.length })}:</div>
                  <div className="space-y-1">
                    {report.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={`http://localhost:5000/${attachment.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-lilac-600 hover:text-lilac-800 hover:underline"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {attachment.originalName}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setViewReport(report)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {t('common.view')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedReport(report);
                  setShowForm(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                title={t('reports.exportPdf')}
                onClick={() => exportReportToPdf(report, t, culture)}
              >
                <FileDown className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(report._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {showForm && (
        <ReportForm
          report={selectedReport}
          onClose={() => {
            setShowForm(false);
            setSelectedReport(null);
            loadReports();
          }}
        />
      )}

      {viewReport && (
        <Dialog open onOpenChange={() => setViewReport(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle>
                {t('reports.details')} - {getPatientName(viewReport)}
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportReportToPdf(viewReport, t, culture)}
              >
                <FileDown className="h-4 w-4 mr-1" />
                {t('reports.exportPdf')}
              </Button>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className={`text-xs capitalize font-medium px-3 py-1.5 rounded-xl ${getStatusColor(viewReport.status)}`}>
                  {t(`reports.status.${viewReport.status === 'in-progress' ? 'inProgress' : viewReport.status}`)}
                </span>
                <span className="text-xs capitalize font-medium px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-100 to-red-200 text-red-800">
                  {t(`reports.types.${viewReport.reportType || 'other'}`)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('reports.card.recipient')}</div>
                  <div className="text-sm">{viewReport.recipientName}</div>
                </div>
                {viewReport.recipientOrganization && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">{t('reports.card.organization')}</div>
                    <div className="text-sm">{viewReport.recipientOrganization}</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('reports.card.requested')}</div>
                  <div className="text-sm">{new Date(viewReport.requestDate).toLocaleDateString()}</div>
                </div>
                {viewReport.completionDate && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">{t('reports.completionDate')}</div>
                    <div className="text-sm">{new Date(viewReport.completionDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-700 mb-1">{t('reports.card.purpose')}</div>
                <div className="text-sm bg-slate-50 p-3 rounded-lg">{viewReport.purpose}</div>
              </div>

              {viewReport.attachments.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-2">{t('reports.card.attachments', { count: viewReport.attachments.length })}</div>
                  <div className="space-y-2">
                    {viewReport.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-slate-500" />
                          <div>
                            <div className="text-sm font-medium">{attachment.originalName}</div>
                            <div className="text-xs text-slate-500">
                              {(attachment.size / 1024).toFixed(2)} KB • {new Date(attachment.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <a
                              href={`http://localhost:5000/${attachment.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t('common.view')}
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `http://localhost:5000/${attachment.path}`;
                              link.download = attachment.originalName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={!!reportToDelete}
        onOpenChange={(open) => !open && setReportToDelete(null)}
        title={t('reports.confirmDelete')}
        confirmLabel={t('common.delete')}
        onConfirm={confirmDelete}
      />
    </div>
  );
}