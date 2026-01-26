import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { appointmentsApi } from '../../api';
import { Appointment } from '../../types/appointment';
import { AppointmentForm } from '../../components/appointments/AppointmentForm';
import { useTranslation } from '../../hooks/useTranslation';

export function AppointmentsPage() {
  const { t } = useTranslation();
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
    if (typeof appointment.patient === 'string') return t('common.unknownPatient');
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
    return <div className="flex justify-center items-center h-64">{t('appointments.loadingAppointments')}</div>;
  }

  return (
    <div className="space-y-6">
    <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{t('appointments.title')}</h1>
          <p className="text-slate-600 mt-1">{t('appointments.subtitle')}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-full bg-gray-900 hover:bg-black">
          <Plus className="h-5 w-5 mr-2" />
          {t('appointments.scheduleAppointment')}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment._id}>
            <CardHeader>
              <CardTitle className="text-lg">{getPatientName(appointment)}</CardTitle>
              <span className={`text-xs capitalize font-medium px-3 py-1.5 rounded-xl ${getStatusColor(appointment.status)} w-fit`}>
                {t(`appointments.status.${appointment.status === 'no-show' ? 'noShow' : appointment.status}`)}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">{t('common.date')}:</span>{' '}
                {new Date(appointment.dateTime).toLocaleDateString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">{t('common.time')}:</span>{' '}
                {new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm">
                <span className="font-medium">{t('common.duration')}:</span> {appointment.duration} {t('common.minutes')}
              </div>
              <div className="text-sm">
                <span className="font-medium">{t('common.type')}:</span> {t(`appointments.type.${appointment.type === 'follow-up' ? 'followUp' : appointment.type}`)}
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
