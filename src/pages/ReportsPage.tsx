import { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { externalReportsApi } from '../api';
import { ExternalReport } from '../types';
import { ReportForm } from '../components/ReportForm';

export function ReportsPage() {
  const [reports, setReports] = useState<ExternalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ExternalReport | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await externalReportsApi.getAll();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (report: ExternalReport) => {
    if (typeof report.patient === 'string') return 'Unknown';
    return `${report.patient.firstName} ${report.patient.lastName}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-sage-200 to-sage-300 text-sage-800';
      case 'in-progress':
        return 'bg-gradient-to-r from-primary-200 to-primary-300 text-primary-800';
      case 'requested':
        return 'bg-gradient-to-r from-sand-200 to-sand-300 text-sand-800';
      case 'delivered':
        return 'bg-gradient-to-r from-lavender-200 to-lavender-300 text-lavender-800';
      default:
        return 'bg-gradient-to-r from-sand-200 to-sand-300 text-sand-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl shadow-lavender-100/50 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
          <p className="text-slate-600 mt-1">External reports for institutions</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-5 w-5 mr-2" />
          New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report._id}>
            <CardHeader>
              <CardTitle className="text-lg">{getPatientName(report)}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium px-3 py-1.5 rounded-xl ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-xl bg-gradient-to-r from-peach-100 to-peach-200 text-peach-800">
                  {report.reportType}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Recipient:</span> {report.recipientName}
              </div>
              {report.recipientOrganization && (
                <div className="text-sm">
                  <span className="font-medium">Organization:</span> {report.recipientOrganization}
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium">Requested:</span>{' '}
                {new Date(report.requestDate).toLocaleDateString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">Purpose:</span> {report.purpose}
              </div>
              {report.attachments.length > 0 && (
                <div className="flex items-center text-sm text-slate-500 mt-2">
                  <FileText className="h-4 w-4 mr-1" />
                  {report.attachments.length} attachment(s)
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
