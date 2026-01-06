import { useState, useEffect } from 'react';
import { Users, Calendar, FileText, Plus, ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DashboardChart } from '../components/shared/DashboardChart';
import { AppointmentForm } from '../components/appointments/AppointmentForm';
import { appointmentsApi, patientsApi } from '../api';
import { Appointment } from '../types/appointment';
import { Patient } from '../types/patient';

export function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientFilter, setPatientFilter] = useState<'all' | 'new' | 'insurance'>('all');
  const [calendarFilter, setCalendarFilter] = useState<'weekly' | 'monthly' | 'all-time'>('monthly');
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appointmentsData, patientsData] = await Promise.all([
          appointmentsApi.getAll(),
          patientsApi.getAll(),
        ]);
        setAppointments(appointmentsData);
        setPatients(patientsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleAppointmentFormClose = () => {
    setIsAppointmentDialogOpen(false);
    // Refresh appointments after form closes
    fetchAppointments();
  };

  const fetchAppointments = async () => {
    try {
      const data = await appointmentsApi.getAll();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const weekDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

  // Filter today's appointments
  const today = new Date();
  const todayAppointments = appointments
    .filter((apt) => {
      const aptDate = new Date(apt.dateTime);
      return (
        aptDate.getDate() === today.getDate() &&
        aptDate.getMonth() === today.getMonth() &&
        aptDate.getFullYear() === today.getFullYear()
      );
    })
    .map((apt) => ({
      _id: apt._id,
      name:
        typeof apt.patient === 'string'
          ? apt.patient
          : `${apt.patient.firstName} ${apt.patient.lastName}`,
      time: new Date(apt.dateTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: apt.type,
      completed: apt.status === 'completed',
    }));

  const newPatients = patients.filter((p) => {
    const createdDate = new Date(p.createdAt);
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return createdDate > oneWeekAgo;
  });

  const insurancePatients = patients.length > 0 ? Math.floor(patients.length * 0.6) : 0;

  // Filter patients based on selected filter
  const getFilteredPatients = () => {
    switch (patientFilter) {
      case 'new':
        return newPatients;
      case 'insurance':
        return patients.filter((p) => {
          // Simple check: consider patient as insurance if they have all contact info
          return p.email && p.address && p.phone;
        });
      case 'all':
      default:
        return patients;
    }
  };

  const filteredPatients = getFilteredPatients();
  const displayPatientCount = filteredPatients.length;

  // Get calendar days with appointment indicators based on filter
  const getDaysWithAppointments = () => {
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysWithAppointments: Record<number, number> = {};

    appointments.forEach((apt) => {
      const aptDate = new Date(apt.dateTime);
      const aptYear = aptDate.getFullYear();
      const aptMonth = aptDate.getMonth();
      const aptDay = aptDate.getDate();

      // Check if appointment matches the calendar filter
      let shouldInclude = false;

      switch (calendarFilter) {
        case 'weekly':
          // Show appointments from this week
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          shouldInclude = aptDate >= weekStart && aptDate <= weekEnd;
          break;

        case 'monthly':
          // Show appointments from this month
          shouldInclude = aptYear === year && aptMonth === month;
          break;

        case 'all-time':
          // Show all appointments
          shouldInclude = true;
          break;
      }

      if (shouldInclude) {
        daysWithAppointments[aptDay] = (daysWithAppointments[aptDay] || 0) + 1;
      }
    });

    return daysWithAppointments;
  };

  const daysWithAppointments = getDaysWithAppointments();

  // Calculate week-over-week percentage change for patients
  const calculatePatientWeekChange = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Count patients from last week
    const lastWeekPatients = patients.filter((p) => {
      const createdDate = new Date(p.createdAt);
      return createdDate >= oneWeekAgo && createdDate <= today;
    }).length;

    // Count patients from the week before
    const prevWeekPatients = patients.filter((p) => {
      const createdDate = new Date(p.createdAt);
      return createdDate >= twoWeeksAgo && createdDate < oneWeekAgo;
    }).length;

    // Calculate percentage change
    if (prevWeekPatients === 0) {
      return { percentage: 0, isIncrease: lastWeekPatients > 0 };
    }

    const change = ((lastWeekPatients - prevWeekPatients) / prevWeekPatients) * 100;
    return {
      percentage: Math.abs(Math.round(change)),
      isIncrease: change > 0,
    };
  };

  const weekChange = calculatePatientWeekChange();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-red-500">Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Good morning, <span className="text-gray-700">Dr Luke</span>
        </h1>
        <p className="text-gray-500">Have great and productive day</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary-200 to-primary-300 border-0 rounded-5xl p-8 relative overflow-hidden shadow-2xl hover:shadow-primary-300/40 transition-all duration-300">
              <div className="relative z-10">
                <button className="mb-4 w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-300 shadow-xl">
                  <FileText className="h-6 w-6 text-white" />
                </button>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Write Prescription</h3>
                <p className="text-sm text-gray-700">to patient</p>
                <div className="mt-4 text-xs font-semibold text-gray-700 bg-white/40 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
                  TEMPLATE
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-lilac-200 to-lilac-300 border-0 rounded-5xl p-8 relative overflow-hidden shadow-2xl hover:shadow-lilac-300/40 transition-all duration-300">
              <div className="relative z-10">
                <div className="mb-4 w-14 h-14 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Users className="h-7 w-7 text-lilac-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Anna Jonson</h3>
                <p className="text-sm text-gray-700">Continue to fill out new patient profile</p>
                <div className="mt-4 text-xs font-semibold text-gray-700 bg-white/40 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
                  REMINDER
                </div>
              </div>
            </Card>
          </div>

          <Card className="rounded-5xl p-8 shadow-xl h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">{appointments.length}</h2>
                  <span className="text-sm text-primary-600 font-semibold">↑ 2% today</span>
                </div>
                <p className="text-sm text-gray-500">Patient appointments</p>
              </div>
              <Button 
                onClick={() => setIsAppointmentDialogOpen(true)}
                className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add new appointment
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient statistics</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPatientFilter('all')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    patientFilter === 'all'
                      ? 'bg-gradient-to-r from-lilac-200 to-lilac-300 text-gray-800 shadow-md'
                      : 'text-gray-600 hover:bg-white/60 backdrop-blur-sm'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPatientFilter('new')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    patientFilter === 'new'
                      ? 'bg-gradient-to-r from-lilac-200 to-lilac-300 text-gray-800 shadow-md'
                      : 'text-gray-600 hover:bg-white/60 backdrop-blur-sm'
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => setPatientFilter('insurance')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    patientFilter === 'insurance'
                      ? 'bg-gradient-to-r from-lilac-200 to-lilac-300 text-gray-800 shadow-md'
                      : 'text-gray-600 hover:bg-white/60 backdrop-blur-sm'
                  }`}
                >
                  Insurance
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {patientFilter === 'new'
                      ? newPatients.length
                      : patientFilter === 'insurance'
                      ? insurancePatients
                      : patients.length}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    {patientFilter === 'all'
                      ? 'Total patients'
                      : patientFilter === 'new'
                      ? 'New patients'
                      : 'Insurance patients'}
                    <span className={weekChange.isIncrease ? 'text-green-500' : 'text-red-500'}>
                      {weekChange.isIncrease ? '↑' : '↓'} {weekChange.percentage}% week
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{insurancePatients}</div>
                  <div className="text-sm text-gray-500">Insurance patients</div>
                </div>
              </div>

              <div className="h-48 bg-gradient-to-br from-lilac-50 to-primary-50 rounded-4xl flex items-center justify-center border border-white/60 overflow-hidden">
                <DashboardChart appointments={appointments} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-5xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-white/60 backdrop-blur-sm rounded-full transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white/60 backdrop-blur-sm rounded-full transition-all duration-300"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setCalendarFilter('weekly')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 shadow-lg ${
                  calendarFilter === 'weekly'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setCalendarFilter('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  calendarFilter === 'monthly'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setCalendarFilter('all-time')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  calendarFilter === 'all-time'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All time
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-xs text-gray-500 text-center font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const hasAppointments = daysWithAppointments[day] || 0;
                const isToday = day === new Date().getDate();

                return (
                  <button
                    key={day}
                    className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg hover:bg-gray-100 transition-all duration-300 relative ${
                      isToday ? 'bg-gray-900 text-white hover:bg-gray-800' : 'text-gray-700'
                    }`}
                  >
                    {day}
                    {hasAppointments > 0 && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-primary-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="rounded-5xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((apt, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-4xl hover:bg-white/60 backdrop-blur-sm transition-all duration-300">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-200 to-lilac-200 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-sm font-semibold text-gray-800">
                        {apt.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">{apt.name}</div>
                      <div className="text-xs text-gray-500">{apt.type}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">{apt.time}</div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                      apt.completed ? 'bg-gradient-to-r from-primary-400 to-primary-500' : 'bg-gradient-to-r from-gray-700 to-gray-900'
                    }`}>
                      {apt.completed ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <Clock className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No appointments scheduled for today</p>
                  <p className="text-gray-400 text-sm mt-1">Your schedule is clear!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm onClose={handleAppointmentFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
