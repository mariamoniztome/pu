import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { appointmentsApi } from '../api';
import { Appointment } from '../types/appointment';

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsApi.getAll();
      setAppointments(data.data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
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
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading appointments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage appointment schedules</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment._id}>
            <CardHeader>
              <CardTitle className="text-lg">{getPatientName(appointment)}</CardTitle>
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(appointment.status)} w-fit`}>
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
    </div>
  );
}
