import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { paymentsApi, patientsApi } from '../../api';
import { Payment } from '../../types/payment';
import { Patient } from '../../types/patient';

interface PaymentFormProps {
  payment?: Payment | null;
  onClose: () => void;
}

export function PaymentForm({ payment, onClose }: PaymentFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    patient: '',
    amount: '',
    currency: 'USD',
    amountPaid: '',
    paymentDate: '',
    paymentMethod: '' as 'cash' | 'card' | 'transfer' | 'check' | 'insurance' | 'other' | '',
    invoiceNumber: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
    if (payment) {
      setFormData({
        patient: typeof payment.patient === 'string' ? payment.patient : payment.patient._id,
        amount: payment.amount.toString(),
        currency: payment.currency,
        amountPaid: payment.amountPaid.toString(),
        paymentDate: payment.paymentDate ? payment.paymentDate.split('T')[0] : '',
        paymentMethod: payment.paymentMethod || '',
        invoiceNumber: payment.invoiceNumber || '',
        notes: payment.notes || '',
      });
    }
  }, [payment]);

  const loadPatients = async () => {
    try {
      const data = await patientsApi.getAll();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load patients:', error);
      setPatients([]);
      setError('Unable to load patients. Please ensure the backend server is running.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('patient', formData.patient);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('amountPaid', formData.amountPaid);

      if (formData.paymentDate) formDataToSend.append('paymentDate', new Date(formData.paymentDate).toISOString());
      if (formData.paymentMethod) formDataToSend.append('paymentMethod', formData.paymentMethod);
      if (formData.invoiceNumber) formDataToSend.append('invoiceNumber', formData.invoiceNumber);
      if (formData.notes) formDataToSend.append('notes', formData.notes);

      if (file) {
        formDataToSend.append('receipt', file);
      }

      if (payment) {
        await paymentsApi.update(payment._id, formDataToSend);
      } else {
        await paymentsApi.create(formDataToSend);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sand-50 to-transparent">
          <DialogTitle className="text-slate-800">
            {payment ? 'Edit Payment' : 'Record New Payment'}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <DialogContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patient}
                onValueChange={(value) => setFormData({ ...formData, patient: value })}
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="amount">Amount Billed *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amountPaid">Amount Paid *</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as any })}
                >
                  <option value="">Select method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                  <option value="check">Check</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="e.g., INV-2024-001"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any additional notes about this payment..."
              />
            </div>

            <div>
              <Label htmlFor="receipt">Receipt / Invoice</Label>
              <div className="mt-2">
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-sand-200 rounded-2xl cursor-pointer bg-sand-50/30 hover:bg-sand-50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-sand-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                      {file ? file.name : 'Click to upload receipt'}
                    </p>
                    <p className="text-xs text-slate-400">PDF, images</p>
                  </div>
                  <input
                    id="receipt"
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 p-3 rounded-2xl border border-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : payment ? 'Update' : 'Record'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
}
