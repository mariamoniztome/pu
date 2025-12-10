import { useState, useEffect } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { paymentsApi } from '../api';
import { Payment } from '../types';

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentsApi.getAll();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (payment: Payment) => {
    if (typeof payment.patient === 'string') return 'Unknown';
    return `${payment.patient.firstName} ${payment.patient.lastName}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 mt-1">Financial records and invoices</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payments.map((payment) => (
          <Card key={payment._id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{getPatientName(payment)}</span>
                <DollarSign className="h-5 w-5 text-slate-400" />
              </CardTitle>
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(payment.status)} w-fit`}>
                {payment.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              {payment.invoiceNumber && (
                <div className="text-sm">
                  <span className="font-medium">Invoice:</span> {payment.invoiceNumber}
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium">Amount:</span>{' '}
                {payment.currency} {payment.amount.toFixed(2)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Paid:</span>{' '}
                {payment.currency} {payment.amountPaid.toFixed(2)}
              </div>
              {payment.amountPaid < payment.amount && (
                <div className="text-sm text-red-600">
                  <span className="font-medium">Balance:</span>{' '}
                  {payment.currency} {(payment.amount - payment.amountPaid).toFixed(2)}
                </div>
              )}
              {payment.paymentMethod && (
                <div className="text-sm">
                  <span className="font-medium">Method:</span> {payment.paymentMethod}
                </div>
              )}
              {payment.paymentDate && (
                <div className="text-sm">
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </div>
              )}
              {payment.notes && (
                <div className="text-sm text-slate-600 mt-2">
                  {payment.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
