import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { appointmentsApi } from '../api';
import { Appointment } from '../types/appointment';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await appointmentsApi.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getAppointmentsForDate = (day: number) => {
    const date = new Date(year, month, day);
    return appointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      return aptDate.getDate() === day &&
             aptDate.getMonth() === month &&
             aptDate.getFullYear() === year;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Calendar</h1>
          <p className="text-gray-500">View and manage all your appointments</p>
        </div>
        <Button className="bg-black hover:bg-gray-900 text-white rounded-full px-6">
          <Plus className="h-5 w-5 mr-2" />
          New Appointment
        </Button>
      </div>

      <Card className="rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={previousMonth}
              variant="outline"
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              onClick={nextMonth}
              variant="outline"
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            const today = isToday(day);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                className={`aspect-square p-2 rounded-2xl border-2 transition-all hover:border-primary-400 ${
                  today
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${today ? 'text-primary-600' : 'text-gray-700'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-1 rounded truncate ${
                        apt.status === 'scheduled'
                          ? 'bg-primary-100 text-primary-700'
                          : apt.status === 'completed'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-secondary-100 text-secondary-700'
                      }`}
                    >
                      {new Date(apt.dateTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {selectedDate && (
        <Card className="rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Appointments for {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <div className="space-y-3">
            {getAppointmentsForDate(selectedDate.getDate()).length === 0 ? (
              <p className="text-gray-500 py-4 text-center">No appointments scheduled</p>
            ) : (
              getAppointmentsForDate(selectedDate.getDate()).map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{apt.patient.firstName} {apt.patient.lastName}</div>
                    <div className="text-sm text-gray-600">{apt.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {new Date(apt.dateTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    <div className={`text-sm inline-block px-2 py-1 rounded-full ${
                      apt.status === 'scheduled'
                        ? 'bg-primary-100 text-primary-700'
                        : apt.status === 'completed'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-secondary-100 text-secondary-700'
                    }`}>
                      {apt.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
