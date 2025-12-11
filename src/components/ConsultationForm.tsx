import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { consultationsApi, patientsApi } from '../api';
import { Consultation } from '../types/consultation';
import { Patient } from '../types/patient';

interface ConsultationFormProps {
  consultation?: Consultation | null;
  onClose: () => void;
}

export function ConsultationForm({ consultation, onClose }: ConsultationFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState({
    patient: '',
    date: new Date().toISOString().split('T')[0],
    sessionNumber: '1',
    chiefComplaint: '',
    sessionNotes: '',
    clinicalObservations: '',
    interventions: '',
    homework: '',
    progressAssessment: '',
    nextSessionPlan: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
    if (consultation) {
      setFormData({
        patient: typeof consultation.patient === 'string' ? consultation.patient : consultation.patient._id,
        date: consultation.date.split('T')[0],
        sessionNumber: consultation.sessionNumber.toString(),
        chiefComplaint: consultation.chiefComplaint || '',
        sessionNotes: consultation.sessionNotes,
        clinicalObservations: consultation.clinicalObservations || '',
        interventions: consultation.interventions || '',
        homework: consultation.homework || '',
        progressAssessment: consultation.progressAssessment || '',
        nextSessionPlan: consultation.nextSessionPlan || '',
      });
    }
  }, [consultation]);

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
      formDataToSend.append('date', new Date(formData.date).toISOString());
      formDataToSend.append('sessionNumber', formData.sessionNumber);
      formDataToSend.append('sessionNotes', formData.sessionNotes);

      if (formData.chiefComplaint) formDataToSend.append('chiefComplaint', formData.chiefComplaint);
      if (formData.clinicalObservations) formDataToSend.append('clinicalObservations', formData.clinicalObservations);
      if (formData.interventions) formDataToSend.append('interventions', formData.interventions);
      if (formData.homework) formDataToSend.append('homework', formData.homework);
      if (formData.progressAssessment) formDataToSend.append('progressAssessment', formData.progressAssessment);
      if (formData.nextSessionPlan) formDataToSend.append('nextSessionPlan', formData.nextSessionPlan);

      if (files) {
        Array.from(files).forEach((file) => {
          formDataToSend.append('attachments', file);
        });
      }

      if (consultation) {
        await consultationsApi.update(consultation._id, formDataToSend);
      } else {
        await consultationsApi.create(formDataToSend);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save consultation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Dialog open={true} onOpenChange={onClose}>
        <DialogHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-peach-50 to-transparent">
          <DialogTitle className="text-slate-800">
            {consultation ? 'Edit Session' : 'New Session Record'}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <DialogContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
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
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sessionNumber">Session Number *</Label>
              <Input
                id="sessionNumber"
                type="number"
                min="1"
                value={formData.sessionNumber}
                onChange={(e) => setFormData({ ...formData, sessionNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="chiefComplaint">Chief Complaint</Label>
              <Textarea
                id="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                rows={2}
                placeholder="Main concern or reason for session..."
              />
            </div>

            <div>
              <Label htmlFor="sessionNotes">Session Notes *</Label>
              <Textarea
                id="sessionNotes"
                value={formData.sessionNotes}
                onChange={(e) => setFormData({ ...formData, sessionNotes: e.target.value })}
                rows={4}
                placeholder="Detailed notes from the session..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clinicalObservations">Clinical Observations</Label>
                <Textarea
                  id="clinicalObservations"
                  value={formData.clinicalObservations}
                  onChange={(e) => setFormData({ ...formData, clinicalObservations: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="interventions">Interventions</Label>
                <Textarea
                  id="interventions"
                  value={formData.interventions}
                  onChange={(e) => setFormData({ ...formData, interventions: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homework">Homework</Label>
                <Textarea
                  id="homework"
                  value={formData.homework}
                  onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="progressAssessment">Progress Assessment</Label>
                <Textarea
                  id="progressAssessment"
                  value={formData.progressAssessment}
                  onChange={(e) => setFormData({ ...formData, progressAssessment: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nextSessionPlan">Next Session Plan</Label>
              <Textarea
                id="nextSessionPlan"
                value={formData.nextSessionPlan}
                onChange={(e) => setFormData({ ...formData, nextSessionPlan: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="attachments">Attachments</Label>
              <div className="mt-2">
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-primary-200 rounded-2xl cursor-pointer bg-primary-50/30 hover:bg-primary-50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-primary-400 mx-auto mb-2" />
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
                {loading ? 'Saving...' : consultation ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
