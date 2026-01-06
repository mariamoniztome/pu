import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { appointmentsApi } from '../api';
import { Appointment } from '../types/appointment';
import { AppointmentForm } from '../components/appointments/AppointmentForm';

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsApi.getAll();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (appointment: Appointment) => {
    if (typeof appointment.patient === 'string') return 'Unknown';
    return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-gradient-to-r from-sage-200 to-sage-300 text-sage-800';
      case 'scheduled':
        return 'bg-gradient-to-r from-primary-200 to-primary-300 text-primary-800';
      case 'completed':
        return 'bg-gradient-to-r from-sand-200 to-sand-300 text-sand-800';
      case 'cancelled':
        return 'bg-gradient-to-r from-peach-200 to-peach-300 text-peach-800';
      case 'no-show':
        return 'bg-gradient-to-r from-lavender-200 to-lavender-300 text-lavender-800';
      default:
        return 'bg-gradient-to-r from-sand-200 to-sand-300 text-sand-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading appointments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl shadow-sage-100/50 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-600 mt-1">Manage appointment schedules</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-full bg-black hover:bg-gray-900">
          <Plus className="h-5 w-5 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment._id}>
            <CardHeader>
              <CardTitle className="text-lg">{getPatientName(appointment)}</CardTitle>
              <span className={`text-xs capitalize font-medium px-3 py-1.5 rounded-xl ${getStatusColor(appointment.status)} w-fit`}>
                {appointment.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Date:</span>{' '}
                {new Date(appointment.dateTime).toLocaleDateString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">Time:</span>{' '}
                {new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm">
                <span className="font-medium">Duration:</span> {appointment.duration} minutes
              </div>
              <div className="text-sm">
                <span className="font-medium">Type:</span> {appointment.type}
              </div>
              {appointment.notes && (
                <div className="text-sm text-slate-600 mt-2">
                  {appointment.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <AppointmentForm
          appointment={selectedAppointment}
          onClose={() => {
            setShowForm(false);
            setSelectedAppointment(null);
            loadAppointments();
          }}
        />
      )}
    </div>
  );
}
