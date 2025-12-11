import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { externalReportsApi, patientsApi } from '../api';
import { ExternalReport } from '../types/reports';
import { Patient } from '../types/patient';

interface ReportFormProps {
  report?: ExternalReport | null;
  onClose: () => void;
}

export function ReportForm({ report, onClose }: ReportFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState({
    patient: '',
    reportType: 'court' as 'court' | 'school' | 'employer' | 'insurance' | 'medical' | 'other',
    recipientName: '',
    recipientOrganization: '',
    requestDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    purpose: '',
    summary: '',
    findings: '',
    recommendations: '',
    status: 'requested' as 'requested' | 'in-progress' | 'completed' | 'delivered',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
    if (report) {
      setFormData({
        patient: typeof report.patient === 'string' ? report.patient : report.patient._id,
        reportType: report.reportType,
        recipientName: report.recipientName,
        recipientOrganization: report.recipientOrganization || '',
        requestDate: report.requestDate.split('T')[0],
        completionDate: report.completionDate ? report.completionDate.split('T')[0] : '',
        purpose: report.purpose,
        summary: report.summary,
        findings: report.findings || '',
        recommendations: report.recommendations || '',
        status: report.status,
      });
    }
  }, [report]);

  const loadPatients = async () => {
    try {
      const data = await patientsApi.getAll();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load patients:', error);
      setPatients([]);
      setError('Unable to load patients. Please ensure the backend server is running.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('patient', formData.patient);
      formDataToSend.append('reportType', formData.reportType);
      formDataToSend.append('recipientName', formData.recipientName);
      formDataToSend.append('requestDate', new Date(formData.requestDate).toISOString());
      formDataToSend.append('purpose', formData.purpose);
      formDataToSend.append('summary', formData.summary);
      formDataToSend.append('status', formData.status);

      if (formData.recipientOrganization) formDataToSend.append('recipientOrganization', formData.recipientOrganization);
      if (formData.completionDate) formDataToSend.append('completionDate', new Date(formData.completionDate).toISOString());
      if (formData.findings) formDataToSend.append('findings', formData.findings);
      if (formData.recommendations) formDataToSend.append('recommendations', formData.recommendations);

      if (files) {
        Array.from(files).forEach((file) => {
          formDataToSend.append('attachments', file);
        });
      }

      if (report) {
        await externalReportsApi.update(report._id, formDataToSend);
      } else {
        await externalReportsApi.create(formDataToSend);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-lavender-50 to-transparent">
          <DialogTitle className="text-slate-800">
            {report ? 'Edit Report' : 'New External Report'}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <DialogContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient">Patient *</Label>
                <Select
                  id="patient"
                  value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="reportType">Report Type *</Label>
                <Select
                  id="reportType"
                  value={formData.reportType}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value as any })}
                  required
                >
                  <option value="court">Court</option>
                  <option value="school">School</option>
                  <option value="employer">Employer</option>
                  <option value="insurance">Insurance</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientName">Recipient Name *</Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="recipientOrganization">Organization</Label>
                <Input
                  id="recipientOrganization"
                  value={formData.recipientOrganization}
                  onChange={(e) => setFormData({ ...formData, recipientOrganization: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="requestDate">Request Date *</Label>
                <Input
                  id="requestDate"
                  type="date"
                  value={formData.requestDate}
                  onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="completionDate">Completion Date</Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                >
                  <option value="requested">Requested</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delivered">Delivered</option>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="purpose">Purpose *</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={2}
                placeholder="Purpose of this report..."
                required
              />
            </div>

            <div>
              <Label htmlFor="summary">Summary *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={3}
                placeholder="Brief summary of the report..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="findings">Findings</Label>
                <Textarea
                  id="findings"
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="attachments">Attachments</Label>
              <div className="mt-2">
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-lavender-200 rounded-2xl cursor-pointer bg-lavender-50/30 hover:bg-lavender-50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-lavender-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                      {files ? `${files.length} file(s) selected` : 'Click to upload files'}
                    </p>
                    <p className="text-xs text-slate-400">PDF, images, documents</p>
                  </div>
                  <input
                    id="attachments"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => setFiles(e.target.files)}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  />
                </label>
              </div>
            </div>

            {error && (
              <div className="text-sm text-peach-700 bg-peach-50 p-3 rounded-2xl border border-peach-200">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : report ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
}
