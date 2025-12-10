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
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        totalConsultations: consultations.length,
        paymentStats,
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Consultations',
      value: stats.totalConsultations,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Unpaid Invoices',
      value: stats.paymentStats?.unpaid.count || 0,
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome to Psychology Clinic Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {stats.paymentStats && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-slate-600">Total Paid</div>
                <div className="text-2xl font-bold text-green-600">
                  ${stats.paymentStats.paid.totalPaid.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500">
                  {stats.paymentStats.paid.count} payments
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Partial Payments</div>
                <div className="text-2xl font-bold text-orange-600">
                  ${stats.paymentStats.partial.totalPaid.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500">
                  {stats.paymentStats.partial.count} payments
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Unpaid</div>
                <div className="text-2xl font-bold text-red-600">
                  ${stats.paymentStats.unpaid.totalAmount.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500">
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
