import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { appointmentsApi, patientsApi } from '../api';
import { Appointment } from '../types/appointment';
import { Patient } from '../types/patient';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent extends Event {
  id: string;
  appointment: Appointment;
}

export function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    dateTime: '',
    type: 'consultation' as 'consultation' | 'follow-up' | 'initial' | 'emergency',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appointmentsData, patientsData] = await Promise.all([
        appointmentsApi.getAll(),
        patientsApi.getAll(),
      ]);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load calendar data');
      setAppointments([]);
      setPatients([]);
    }
  };

  const events: CalendarEvent[] = useMemo(() => {
    return appointments.map((apt) => ({
      id: apt._id,
      title: `${apt.patient.firstName} ${apt.patient.lastName} - ${apt.type}`,
      start: new Date(apt.dateTime),
      end: new Date(new Date(apt.dateTime).getTime() + 60 * 60 * 1000),
      appointment: apt,
    }));
  }, [appointments]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setFormData({
      patientId: '',
      dateTime: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
      type: 'consultation',
      notes: '',
    });
    setShowDialog(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setFormData({
      patientId: event.appointment.patient._id,
      dateTime: format(new Date(event.appointment.dateTime), "yyyy-MM-dd'T'HH:mm"),
      type: event.appointment.type,
      notes: event.appointment.notes || '',
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        patientId: formData.patientId,
        dateTime: new Date(formData.dateTime).toISOString(),
        type: formData.type,
        notes: formData.notes || undefined,
      };

      if (selectedEvent) {
        await appointmentsApi.update(selectedEvent.id, data);
        toast.success('Appointment updated successfully');
      } else {
        await appointmentsApi.create(data);
        toast.success('Appointment created successfully');
      }

      setShowDialog(false);
      loadData();
      setFormData({
        patientId: '',
        dateTime: '',
        type: 'consultation',
        notes: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await appointmentsApi.delete(selectedEvent.id);
      toast.success('Appointment deleted successfully');
      setShowDialog(false);
      loadData();
    } catch (error) {
      toast.error('Failed to delete appointment');
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const colors = {
      scheduled: { backgroundColor: '#22c55e', borderColor: '#16a34a' },
      completed: { backgroundColor: '#6b7280', borderColor: '#4b5563' },
      cancelled: { backgroundColor: '#ef4444', borderColor: '#dc2626' },
      'no-show': { backgroundColor: '#f59e0b', borderColor: '#d97706' },
    };

    const color = colors[event.appointment.status] || colors.scheduled;

    return {
      style: {
        backgroundColor: color.backgroundColor,
        borderColor: color.borderColor,
        borderRadius: '8px',
        border: 'none',
        color: 'white',
        fontSize: '0.875rem',
        padding: '4px 8px',
      },
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Calendar</h1>
          <p className="text-gray-500">View and manage all your appointments</p>
        </div>
        <Button
          onClick={() => {
            setSelectedSlot(null);
            setSelectedEvent(null);
            setFormData({
              patientId: '',
              dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
              type: 'consultation',
              notes: '',
            });
            setShowDialog(true);
          }}
          className="bg-gray-900 hover:bg-gray-900 text-white rounded-full px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Appointment
        </Button>
      </div>

      <Card className="rounded-3xl p-6 shadow-sm">
        <div style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="week"
            step={30}
            showMultiDayTimes
            style={{ height: '100%' }}
          />
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={(open) => !loading && setShowDialog(open)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Edit Appointment' : 'New Appointment'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="patientId">Patient *</Label>
              <Select
                id="patientId"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
                className="rounded-2xl"
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
              <Label htmlFor="dateTime">Date & Time *</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                required
                className="rounded-2xl"
              />
            </div>

            <div>
              <Label htmlFor="type">Appointment Type *</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                required
                className="rounded-2xl"
              >
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="initial">Initial Assessment</option>
                <option value="emergency">Emergency</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="rounded-2xl"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              {selectedEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="rounded-full mr-auto"
                  disabled={loading}
                >
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="rounded-full"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-full bg-gray-900 hover:bg-gray-900"
              >
                {loading ? 'Saving...' : selectedEvent ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
