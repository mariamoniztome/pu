import { useEffect, useState } from 'react';
import { Users, Calendar, FileText, DollarSign, Plus, Bell, Search, ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react';
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
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-0 bg-white shadow-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 rounded-2xl bg-white hover:bg-gray-50 shadow-sm">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
              <span className="text-white text-sm font-medium">DL</span>
            </div>
            <span className="text-sm font-medium">Dr Luke</span>
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
            <Card className="bg-gradient-to-br from-primary-300 to-primary-400 border-0 rounded-3xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <button className="mb-4 w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-900 transition">
                  <FileText className="h-5 w-5 text-white" />
                </button>
                <h3 className="text-xl font-semibold text-black mb-1">Write Prescription</h3>
                <p className="text-sm text-black/70">to patient</p>
                <div className="mt-4 text-xs text-black/60 bg-black/10 inline-block px-3 py-1 rounded-full">
                  TEMPLATE
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-secondary-300 to-secondary-400 border-0 rounded-3xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="mb-4 w-12 h-12 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <Users className="h-6 w-6 text-secondary-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-black mb-1">Anna Jonson</h3>
                <p className="text-sm text-black/70">Continue to fill out new patient profile</p>
                <div className="mt-4 text-xs text-black/60 bg-black/10 inline-block px-3 py-1 rounded-full">
                  REMINDER
                </div>
              </div>
            </Card>
          </div>

          <Card className="rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">12</h2>
                  <span className="text-sm text-primary-600">↑ 2% today</span>
                </div>
                <p className="text-sm text-gray-500">Patient appointments</p>
              </div>
              <Button className="bg-black hover:bg-gray-900 text-white rounded-full px-6">
                <Plus className="h-5 w-5 mr-2" />
                Add new appointment
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient statistics</h3>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 rounded-full bg-gray-100 text-sm font-medium">All</button>
                <button className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100">New</button>
                <button className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100">Insurance</button>
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

              <div className="h-48 bg-gray-50 rounded-2xl flex items-center justify-center">
                <div className="text-gray-400">Chart visualization</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="mb-4 flex gap-2">
              <button className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-900 text-white">Weekly</button>
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

          <Card className="rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {todayAppointments.map((apt, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">
                      {apt.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">{apt.name}</div>
                    <div className="text-xs text-gray-500">{apt.type}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">{apt.time}</div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    apt.completed ? 'bg-primary-500' : 'bg-gray-900'
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

          <Card className="rounded-3xl p-6 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 border-0">
            <div className="mb-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              MUST TO READ
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Patient testing tracker feature
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              How to enhance your documental work
            </p>
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-900 transition">
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
