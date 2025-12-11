import { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { externalReportsApi } from '../api';
import { ExternalReport } from '../types/reports';

export function ReportsPage() {
  const [reports, setReports] = useState<ExternalReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await externalReportsApi.getAll();
      setReports(data.data);
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
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">External Reports</h1>
          <p className="text-slate-500 mt-1">Reports for external entities</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report._id}>
            <CardHeader>
              <CardTitle className="text-lg">{getPatientName(report)}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-800">
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
    </div>
  );
}
