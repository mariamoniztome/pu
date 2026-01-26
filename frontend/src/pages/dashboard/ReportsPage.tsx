import { useState, useEffect } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { externalReportsApi } from "../../api";
import { ExternalReport } from "../../types/reports";
import { ReportForm } from "../../components/reports/ReportForm";
import { useTranslation } from "../../hooks/useTranslation";

export function ReportsPage() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ExternalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ExternalReport | null>(
    null
  );

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
    if (typeof report.patient === "string") return t('common.unknownPatient');
    return `${report.patient.firstName} ${report.patient.lastName}`;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {t('reports.loadingReports')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{t('reports.title')}</h1>
          <p className="text-slate-600 mt-1">
            {t('reports.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="rounded-full bg-gray-900 hover:bg-black"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('reports.newReport')}
        </Button>
      </div>

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
                <div className="flex items-center text-sm text-slate-500 mt-2">
                  <FileText className="h-4 w-4 mr-1" />
                  {t('reports.card.attachments', { count: report.attachments.length })}
                </div>
              )}
            </CardContent>
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
    </div>
  );
}