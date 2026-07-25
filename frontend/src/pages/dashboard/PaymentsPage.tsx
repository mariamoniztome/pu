import { useState, useEffect } from "react";
import { Plus, Euro, FileText, Eye, Edit, Download, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import { paymentsApi } from "../../api";
import { Payment } from "../../types/payment";
import { PaymentForm } from "../../components/payments/PaymentForm";
import { PaymentCharts } from "../../components/payments/PaymentCharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useTranslation } from "../../hooks/useTranslation";
import { formatCurrency } from "../../lib/currency";
import { PageHeaderAction } from "../../components/PageHeaderAction";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";

export function PaymentsPage() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentsApi.getAll();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load payments:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (payment: Payment) => {
    if (!payment.patient || typeof payment.patient === 'string') {
      return t('common.unknownPatient');
    }
    const { firstName = '', lastName = '' } = payment.patient;
    const name = `${firstName} ${lastName}`.trim();
    return name || t('common.unknownPatient');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return 'bg-green-100 text-green-800';
      case "partial":
        return 'bg-blue-100 text-blue-800';
      case "unpaid":
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (id: string) => {
    setPaymentToDelete(id);
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    try {
      await paymentsApi.delete(paymentToDelete);
      loadPayments();
    } catch (error) {
      console.error('Failed to delete payment:', error);
    } finally {
      setPaymentToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {t('payments.loadingPayments')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeaderAction>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('payments.recordPayment')}
        </Button>
      </PageHeaderAction>

      <PaymentCharts />

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t('payments.recentPayments')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map((payment) => (
            <Card key={payment._id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{getPatientName(payment)}</span>
                  <Euro className="h-5 w-5 text-slate-400" />
                </CardTitle>
                <span
                  className={`text-xs font-medium px-3 py-1.5 rounded-xl capitalize ${getStatusColor(
                    payment.status
                  )} w-fit`}
                >
                  {t(`payments.status.${payment.status}`)}
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                {payment.invoiceNumber && (
                  <div className="text-sm">
                    <span className="font-medium">{t('payments.card.invoice')}:</span>{" "}
                    {payment.invoiceNumber}
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium">{t('payments.card.amount')}:</span>{" "}
                  {formatCurrency(payment.amount, payment.currency)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">{t('payments.card.paid')}:</span>{" "}
                  {formatCurrency(payment.amountPaid, payment.currency)}
                </div>
                {payment.amountPaid < payment.amount && (
                  <div className="text-sm text-red-600">
                    <span className="font-medium">{t('payments.card.balance')}:</span>{" "}
                    {formatCurrency(payment.amount - payment.amountPaid, payment.currency)}
                  </div>
                )}
                {payment.paymentMethod && (
                  <div className="text-sm">
                    <span className="font-medium">{t('payments.card.method')}:</span>{" "}
                    {t(`payments.methods.${payment.paymentMethod}`)}
                  </div>
                )}
                {payment.paymentDate && (
                  <div className="text-sm">
                    <span className="font-medium">{t('payments.card.date')}:</span>{" "}
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </div>
                )}
                {payment.receiptAttachment && (
                  <div className="mt-2">
                    <a
                      href={`http://localhost:5000/${payment.receiptAttachment.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-lilac-600 hover:text-lilac-800 hover:underline"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      {t('payments.card.viewReceipt')}
                    </a>
                  </div>
                )}
                {payment.notes && (
                  <div className="text-sm text-slate-600 mt-2">
                    {payment.notes}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setViewPayment(payment)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {t('common.view')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPayment(payment);
                    setShowForm(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(payment._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {showForm && (
        <PaymentForm
          payment={selectedPayment}
          onClose={() => {
            setShowForm(false);
            setSelectedPayment(null);
            loadPayments();
          }}
        />
      )}

      {viewPayment && (
        <Dialog open onOpenChange={() => setViewPayment(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t('payments.details')} - {getPatientName(viewPayment)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('common.status')}</div>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-xl capitalize ${getStatusColor(viewPayment.status)}`}>
                    {t(`payments.status.${viewPayment.status}`)}
                  </span>
                </div>
                {viewPayment.invoiceNumber && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">{t('payments.card.invoice')}</div>
                    <div className="text-sm">{viewPayment.invoiceNumber}</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('payments.card.amount')}</div>
                  <div className="text-lg font-bold">{formatCurrency(viewPayment.amount, viewPayment.currency)}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('payments.card.paid')}</div>
                  <div className="text-lg font-bold text-green-600">{formatCurrency(viewPayment.amountPaid, viewPayment.currency)}</div>
                </div>
              </div>

              {viewPayment.amountPaid < viewPayment.amount && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('payments.card.balance')}</div>
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(viewPayment.amount - viewPayment.amountPaid, viewPayment.currency)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {viewPayment.paymentMethod && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">{t('payments.card.method')}</div>
                    <div className="text-sm">{t(`payments.methods.${viewPayment.paymentMethod}`)}</div>
                  </div>
                )}
                {viewPayment.paymentDate && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">{t('payments.card.date')}</div>
                    <div className="text-sm">{new Date(viewPayment.paymentDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              {viewPayment.notes && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{t('common.notes')}</div>
                  <div className="text-sm bg-slate-50 p-3 rounded-lg">{viewPayment.notes}</div>
                </div>
              )}

              {viewPayment.receiptAttachment && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-2">{t('payments.receipt')}</div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-slate-500" />
                      <div>
                        <div className="text-sm font-medium">{viewPayment.receiptAttachment.originalName}</div>
                        <div className="text-xs text-slate-500">
                          {(viewPayment.receiptAttachment.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <a
                          href={`http://localhost:5000/${viewPayment.receiptAttachment.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t('common.view')}
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (viewPayment.receiptAttachment) {
                            const link = document.createElement('a');
                            link.href = `http://localhost:5000/${viewPayment.receiptAttachment.path}`;
                            link.download = viewPayment.receiptAttachment.originalName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={!!paymentToDelete}
        onOpenChange={(open) => !open && setPaymentToDelete(null)}
        title={t('payments.confirmDelete')}
        confirmLabel={t('common.delete')}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
