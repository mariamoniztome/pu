import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { appointmentsApi, patientsApi } from '../../api';
import { Appointment } from '../../types/appointment';
import { Patient } from '../../types/patient';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onClose: () => void;
}

export function AppointmentForm({ appointment, onClose }: AppointmentFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    patient: '',
    dateTime: '',
    duration: '60',
    type: 'follow-up' as 'initial' | 'follow-up' | 'assessment' | 'therapy' | 'other',
    status: 'scheduled' as 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
    if (appointment) {
      const dateTime = new Date(appointment.dateTime);
      const formattedDateTime = dateTime.toISOString().slice(0, 16);

      setFormData({
        patient: typeof appointment.patient === 'string' ? appointment.patient : appointment.patient._id,
        dateTime: formattedDateTime,
        duration: appointment.duration.toString(),
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes || '',
      });
    }
  }, [appointment]);

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
      const data = {
        patient: formData.patient,
        dateTime: new Date(formData.dateTime).toISOString(),
        duration: parseInt(formData.duration),
        type: formData.type,
        status: formData.status,
        notes: formData.notes || undefined,
      };

      if (appointment) {
        await appointmentsApi.update(appointment._id, data);
      } else {
        await appointmentsApi.create(data);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sage-50 to-transparent">
          <DialogTitle className="text-slate-800">
            {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <DialogContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateTime">Date & Time *</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                >
                  <option value="initial">Initial</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="assessment">Assessment</option>
                  <option value="therapy">Therapy</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No-show</option>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any additional notes about this appointment..."
              />
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 p-3 rounded-2xl border border-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : appointment ? 'Update' : 'Schedule'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
}
