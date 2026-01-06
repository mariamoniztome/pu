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
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <Button onClick={() => setShowForm(true)} className="rounded-full bg-gray-900 hover:bg-gray-900">
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
