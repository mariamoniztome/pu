import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Euro, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { paymentsApi } from '../../api';
import { Payment } from '../../types/payment';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, normalizeCurrency } from '../../lib/currency';

interface ChartData {
  label: string;
  value: number;
  percentage: number;
}

export function PaymentCharts() {
  const { t } = useTranslation();
  const { organization } = useAuth();
  const orgCurrency = normalizeCurrency(organization?.settings.currency);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await paymentsApi.getAll();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from backend data
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidInvoices = payments.filter(p => p.status === 'paid').length;
  const pendingInvoices = payments.filter(p => p.status === 'unpaid').length;
  
  // Calculate average payment time (simplified - using payment dates)
  const paymentsWithDates = payments.filter(p => p.paymentDate);
  const avgPaymentTime = paymentsWithDates.length > 0 
    ? Math.round(paymentsWithDates.reduce((sum, p) => {
        const created = new Date(p.createdAt || p.paymentDate!);
        const paid = new Date(p.paymentDate!);
        return sum + Math.abs(paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / paymentsWithDates.length)
    : 0;

  // Group payments by month for chart
  const monthlyData: ChartData[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthPayments = payments.filter(p => {
      const paymentDate = new Date(p.paymentDate || p.createdAt);
      return paymentDate.getMonth() === month.getMonth() && 
             paymentDate.getFullYear() === month.getFullYear();
    });
    const monthTotal = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const monthLabel = month.toLocaleDateString('en-US', { month: 'short' });
    monthlyData.push({
      label: monthLabel,
      value: monthTotal,
      percentage: monthTotal > 0 ? 100 : 0
    });
  }

  // Normalize percentages to max value
  const maxValue = Math.max(...monthlyData.map(d => d.value), 1);
  monthlyData.forEach(d => {
    d.percentage = Math.round((d.value / maxValue) * 100);
  });

  // Calculate payment methods distribution
  const paymentMethods: Record<string, number> = {};
  payments.forEach(p => {
    if (p.paymentMethod) {
      paymentMethods[p.paymentMethod] = (paymentMethods[p.paymentMethod] || 0) + p.amountPaid;
    }
  });

  const paymentMethodsArray = Object.entries(paymentMethods).map(([method, amount]) => ({
    method,
    amount,
    percentage: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0
  }));

  // Calculate payment status distribution
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const partialAmount = payments.filter(p => p.status === 'partial').reduce((sum, p) => sum + p.amount, 0);
  const unpaidAmount = payments.filter(p => p.status === 'unpaid').reduce((sum, p) => sum + p.amount, 0);
  const totalAmount = paidAmount + partialAmount + unpaidAmount;

  const paidPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
  const partialPercentage = totalAmount > 0 ? Math.round((partialAmount / totalAmount) * 100) : 0;
  const unpaidPercentage = totalAmount > 0 ? Math.round((unpaidAmount / totalAmount) * 100) : 0;

  const stats = {
    totalRevenue,
    paidInvoices,
    pendingInvoices,
    avgPaymentTime: `${avgPaymentTime} days`,
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">{t('payments.charts.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('payments.charts.totalRevenue')}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue, orgCurrency)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
              <Euro className="h-6 w-6 text-gray-800" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-semibold">
                {monthlyData.length > 1 && monthlyData[monthlyData.length - 1].value > monthlyData[monthlyData.length - 2].value ? '+' : ''}
                {monthlyData.length > 1 
                  ? Math.round(((monthlyData[monthlyData.length - 1].value - monthlyData[monthlyData.length - 2].value) / (monthlyData[monthlyData.length - 2].value || 1)) * 100)
                  : 0}%
              </span>
            <span className="text-gray-500">{t('payments.charts.vsLastMonth')}</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('payments.charts.paidInvoices')}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.paidInvoices}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lilac-200 to-lilac-300 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-gray-800" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">{t('payments.charts.successRate')} </span>
            <span className="text-gray-900 font-semibold">
              {payments.length > 0 ? Math.round((paidInvoices / payments.length) * 100) : 0}%
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('payments.charts.pendingInvoices')}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-gray-800" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">{t('payments.charts.totalValue')} </span>
            <span className="">
              {formatCurrency(payments.filter(p => p.status === 'unpaid').reduce((sum, p) => sum + p.amount, 0), orgCurrency)}
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('payments.charts.avgPaymentTime')}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.avgPaymentTime}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-gray-800" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-semibold">{t('payments.charts.optimized')}</span>
            <span className="text-gray-500">{t('payments.charts.paymentTime')}</span>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('payments.charts.revenueOverview')}</h3>
        <div className="space-y-4">
          {monthlyData.map((data) => (
            <div key={data.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{data.label}</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(data.value, orgCurrency)}
                </span>
              </div>
              <div className="relative h-10 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-300 to-lilac-300 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                  style={{ width: `${(data.value / maxValue) * 100}%` }}
                >
                  <span className="text-xs font-semibold text-gray-800">
                    {data.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payments.charts.paymentMethods')}</h3>
          <div className="space-y-3">
            {paymentMethodsArray.length > 0 ? (
              paymentMethodsArray.map((item) => (
                <div key={item.method}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 capitalize">{item.method}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(item.amount, orgCurrency)}</span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-400 to-lilac-400 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">{t('payments.charts.noPaymentMethods')}</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payments.charts.paymentStatus')}</h3>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - paidPercentage / 100)}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b8ff58" />
                    <stop offset="100%" stopColor="#d8cdff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{paidPercentage}%</span>
                <span className="text-sm text-gray-600">{t('payments.status.paid')}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{paidPercentage}%</div>
              <div className="text-xs text-green-600">{t('payments.status.paid')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{partialPercentage}%</div>
              <div className="text-xs text-amber-600">{t('payments.status.partial')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{unpaidPercentage}%</div>
              <div className="text-xs text-red-600">{t('payments.status.unpaid')}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
