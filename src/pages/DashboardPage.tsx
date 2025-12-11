import { useEffect, useState } from 'react';
import { Users, Calendar, FileText, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { patientsApi, appointmentsApi, consultationsApi, paymentsApi, PaymentStats } from '../api';

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalConsultations: 0,
    paymentStats: null as PaymentStats | null,
  });

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
        totalPatients: patients.data.length,
        totalAppointments: appointments.data.length,
        totalConsultations: consultations.data.length,
        paymentStats: paymentStats.data,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      gradient: 'from-primary-300 to-primary-400',
      shadow: 'shadow-primary-200',
    },
    {
      title: 'Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      gradient: 'from-sage-300 to-sage-400',
      shadow: 'shadow-sage-200',
    },
    {
      title: 'Sessions',
      value: stats.totalConsultations,
      icon: FileText,
      gradient: 'from-peach-300 to-peach-400',
      shadow: 'shadow-peach-200',
    },
    {
      title: 'Pending Payments',
      value: stats.paymentStats?.unpaid.count || 0,
      icon: DollarSign,
      gradient: 'from-lavender-300 to-lavender-400',
      shadow: 'shadow-lavender-200',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl shadow-primary-100/50">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          Hi there! <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-slate-600 text-lg">Let's help you manage your clinic today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`${stat.shadow} hover:scale-105`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-2xl`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {stats.paymentStats && (
        <Card className="shadow-xl shadow-sand-200/50">
          <CardHeader>
            <CardTitle className="text-slate-800">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-sage-50 to-sage-100 p-6 rounded-2xl">
                <div className="text-sm text-slate-600 mb-2">Total Paid</div>
                <div className="text-3xl font-bold text-sage-700">
                  ${stats.paymentStats.paid.totalPaid.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {stats.paymentStats.paid.count} payments
                </div>
              </div>
              <div className="bg-gradient-to-br from-sand-50 to-sand-100 p-6 rounded-2xl">
                <div className="text-sm text-slate-600 mb-2">Partial Payments</div>
                <div className="text-3xl font-bold text-sand-700">
                  ${stats.paymentStats.partial.totalPaid.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {stats.paymentStats.partial.count} payments
                </div>
              </div>
              <div className="bg-gradient-to-br from-peach-50 to-peach-100 p-6 rounded-2xl">
                <div className="text-sm text-slate-600 mb-2">Unpaid</div>
                <div className="text-3xl font-bold text-peach-700">
                  ${stats.paymentStats.unpaid.totalAmount.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {stats.paymentStats.unpaid.count} invoices
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
