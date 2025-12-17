import { Card } from './ui/card';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  percentage: number;
}

export function PaymentCharts() {
  const monthlyData: ChartData[] = [
    { label: 'Jan', value: 12500, percentage: 80 },
    { label: 'Feb', value: 15000, percentage: 95 },
    { label: 'Mar', value: 13800, percentage: 88 },
    { label: 'Apr', value: 16200, percentage: 100 },
    { label: 'May', value: 14500, percentage: 90 },
    { label: 'Jun', value: 17800, percentage: 110 },
  ];

  const stats = {
    totalRevenue: 89800,
    paidInvoices: 45,
    pendingInvoices: 8,
    avgPaymentTime: '12 days',
  };

  const maxValue = Math.max(...monthlyData.map(d => d.value));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">
                ${stats.totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-gray-800" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-semibold">+12.5%</span>
            <span className="text-gray-500">vs last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Paid Invoices</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.paidInvoices}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lilac-200 to-lilac-300 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-gray-800" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Success rate: </span>
            <span className="text-gray-900 font-semibold">84.9%</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-gray-800" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Total value: </span>
            <span className="text-gray-900 font-semibold">$8,400</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Payment Time</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.avgPaymentTime}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-gray-800" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-semibold">-3 days</span>
            <span className="text-gray-500">improved</span>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Overview</h3>
        <div className="space-y-4">
          {monthlyData.map((data) => (
            <div key={data.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{data.label}</span>
                <span className="font-semibold text-gray-900">
                  ${data.value.toLocaleString()}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {[
              { method: 'Credit Card', percentage: 45, amount: 40410 },
              { method: 'Cash', percentage: 30, amount: 26940 },
              { method: 'Bank Transfer', percentage: 20, amount: 17960 },
              { method: 'Insurance', percentage: 5, amount: 4490 },
            ].map((item) => (
              <div key={item.method}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.method}</span>
                  <span className="font-semibold text-gray-900">${item.amount.toLocaleString()}</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-400 to-lilac-400 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
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
                  strokeDashoffset="62.8"
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
                <span className="text-3xl font-bold text-gray-900">75%</span>
                <span className="text-sm text-gray-600">Paid</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">75%</div>
              <div className="text-xs text-green-600">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">15%</div>
              <div className="text-xs text-amber-600">Partial</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">10%</div>
              <div className="text-xs text-red-600">Unpaid</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
