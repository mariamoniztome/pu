import { useEffect, useState } from 'react';
import { Users, Calendar, FileText, Plus, Bell, Search, ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react';
import { Card } from '../components/ui/card';
import { patientsApi, appointmentsApi, consultationsApi, paymentsApi, PaymentStats } from '../api';
import { Button } from '../components/ui/button';

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalConsultations: 0,
    paymentStats: null as PaymentStats | null,
  });

  const [currentMonth] = useState(new Date());

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [patients, appointments, consultations, paymentStats] = await Promise.all([
        patientsApi.getAll(),
        appointmentsApi.getAll(),
        consultationsApi.getAll(),
        paymentsApi.getStats(),
      ]);

      setStats({
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        totalConsultations: consultations.length,
        paymentStats: paymentStats,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const weekDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

  const todayAppointments = [
    { name: 'Matt Smith', time: '11:30 AM', type: 'Emergency', completed: true },
    { name: 'Angelika Kravets', time: '1:30 PM', type: 'Video consultation', completed: true },
    { name: 'Emily Blunt', time: '4:00 PM', type: 'Check-up', completed: false },
    { name: 'John Krasinski', time: '5:30 PM', type: 'Consultation', completed: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-lilac-100 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-lilac-300 focus:bg-white/90 transition-all duration-300"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg transition-all duration-300">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-full px-5 py-2 shadow-lg">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-300 to-lilac-300 flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-semibold">DL</span>
            </div>
            <span className="text-sm font-medium text-gray-800">Dr Luke</span>
          </div>
        </div>
      </div>

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

          <Card className="rounded-5xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">12</h2>
                  <span className="text-sm text-primary-600 font-semibold">↑ 2% today</span>
                </div>
                <p className="text-sm text-gray-500">Patient appointments</p>
              </div>
              <Button className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-xl">
                <Plus className="h-5 w-5 mr-2" />
                Add new appointment
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient statistics</h3>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2 rounded-full bg-gradient-to-r from-lilac-200 to-lilac-300 text-sm font-semibold text-gray-800 shadow-md">All</button>
                <button className="px-5 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-white/60 backdrop-blur-sm transition-all duration-300">New</button>
                <button className="px-5 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-white/60 backdrop-blur-sm transition-all duration-300">Insurance</button>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">12</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    New patients <span className="text-red-500">↓ 11% week</span>
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">24</div>
                  <div className="text-sm text-gray-500">Insurance patients</div>
                </div>
              </div>

              <div className="h-48 bg-gradient-to-br from-lilac-50 to-primary-50 rounded-4xl flex items-center justify-center border border-white/60">
                <div className="text-gray-400">Chart visualization</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-5xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/60 backdrop-blur-sm rounded-full transition-all duration-300">
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-white/60 backdrop-blur-sm rounded-full transition-all duration-300">
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="mb-4 flex gap-2">
              <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg">Weekly</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-100">Monthly</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-100">All time</button>
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
              {days.map((day) => (
                <button
                  key={day}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg hover:bg-gray-100 ${
                    day === new Date().getDate() ? 'bg-gray-900 text-white hover:bg-gray-800' : 'text-gray-700'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </Card>

          <Card className="rounded-5xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {todayAppointments.map((apt, idx) => (
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
              ))}
            </div>
          </Card>

          <Card className="rounded-5xl p-8 shadow-xl bg-gradient-to-br from-amber-50/80 via-primary-50/80 to-lilac-50/80 border-white/60 backdrop-blur-sm">
            <div className="mb-3 text-xs font-bold text-gray-600 uppercase tracking-wide">
              MUST TO READ
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Patient testing tracker feature
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              How to enhance your documental work
            </p>
            <button className="w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full flex items-center justify-center hover:from-gray-900 hover:to-black transition-all duration-300 shadow-xl">
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
