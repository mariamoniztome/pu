import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { paymentsApi, patientsApi } from "../../api";
import { Payment } from "../../types/payment";
import { Patient } from "../../types/patient";
import { useTranslation } from "../../hooks/useTranslation";

interface PaymentFormProps {
  payment?: Payment | null;
  onClose: () => void;
}

export function PaymentForm({ payment, onClose }: PaymentFormProps) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<{
    patient?: string;
    amount: string;
    currency?: string;
    amountPaid: string;
    paymentDate: string;
    paymentMethod?: Payment["paymentMethod"];
    invoiceNumber: string;
    notes: string;
  }>({
    patient: undefined,
    amount: "",
    currency: "USD",
    amountPaid: "",
    paymentDate: "",
    paymentMethod: undefined,
    invoiceNumber: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();

    if (payment) {
      setFormData({
        patient:
          typeof payment.patient === "string"
            ? payment.patient
            : payment.patient._id,
        amount: payment.amount.toString(),
        currency: payment.currency,
        amountPaid: payment.amountPaid.toString(),
        paymentDate: payment.paymentDate
          ? payment.paymentDate.split("T")[0]
          : "",
        paymentMethod: payment.paymentMethod || undefined,
        invoiceNumber: payment.invoiceNumber || "",
        notes: payment.notes || "",
      });
    }
  }, [payment]);

  const loadPatients = async () => {
    try {
      const data = await patientsApi.getAll();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(t('payments.form.loadPatientsError'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient || !formData.currency) {
      setError(t('payments.form.requiredFields'));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("patient", formData.patient);
      formDataToSend.append("amount", formData.amount);
      formDataToSend.append("currency", formData.currency);
      formDataToSend.append("amountPaid", formData.amountPaid);

      if (formData.paymentDate) {
        formDataToSend.append(
          "paymentDate",
          new Date(formData.paymentDate).toISOString()
        );
      }

      if (formData.paymentMethod) {
        formDataToSend.append("paymentMethod", formData.paymentMethod);
      }

      if (formData.invoiceNumber) {
        formDataToSend.append("invoiceNumber", formData.invoiceNumber);
      }

      if (formData.notes) {
        formDataToSend.append("notes", formData.notes);
      }

      if (file) {
        formDataToSend.append("receipt", file);
      }

      if (payment) {
        await paymentsApi.update(payment._id, formDataToSend);
      } else {
        await paymentsApi.create(formDataToSend);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || t('payments.form.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
      <DialogHeader className="flex  flex-row items-center justify-between">
        <DialogTitle className="text-slate-800">
          {payment ? t('payments.form.titleEdit') : t('payments.form.titleNew')}
        </DialogTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </DialogHeader>      
        <form onSubmit={handleSubmit} className="space-y-4 px-12 pb-12">
          {/* Patient */}
          <div>
            <Label>{t('payments.form.patient')} *</Label>
            <Select
              value={formData.patient}
              onValueChange={(value) =>
                setFormData({ ...formData, patient: value })
              }
            >
                <SelectTrigger>
                  <SelectValue placeholder={t('payments.form.selectPatient')} />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t('payments.form.amountBilled')} *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>{t('payments.form.amountPaid')} *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amountPaid}
                onChange={(e) =>
                  setFormData({ ...formData, amountPaid: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>{t('payments.form.currency')} *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('payments.form.currencyPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('payments.form.paymentDate')}</Label>
              <Input
                type="date"
                value={formData.paymentDate}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDate: e.target.value })
                }
              />
            </div>

            <div>
              <Label>{t('payments.form.paymentMethod')}</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    paymentMethod: value as Payment["paymentMethod"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('payments.form.selectMethod')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t('payments.methods.cash')}</SelectItem>
                  <SelectItem value="card">{t('payments.methods.card')}</SelectItem>
                  <SelectItem value="transfer">{t('payments.methods.transfer')}</SelectItem>
                  <SelectItem value="check">{t('payments.methods.check')}</SelectItem>
                  <SelectItem value="insurance">{t('payments.methods.insurance')}</SelectItem>
                  <SelectItem value="other">{t('payments.methods.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Invoice + Notes */}
          <div>
            <Label>{t('payments.form.invoiceNumber')}</Label>
            <Input
              value={formData.invoiceNumber}
              onChange={(e) =>
                setFormData({ ...formData, invoiceNumber: e.target.value })
              }
              placeholder={t('payments.form.invoicePlaceholder')}
            />
          </div>

          <div>
            <Label>{t('payments.form.notes')}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Receipt */}
          <div>
            <Label>{t('payments.form.receipt')}</Label>
            <label className="mt-2 flex h-24 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-sand-200 bg-sand-50/30 transition hover:bg-sand-50">
              <div className="text-center">
                <Upload className="mx-auto mb-2 h-8 w-8 text-sand-400" />
                <p className="text-sm text-slate-600">
                  {file ? file.name : t('payments.form.uploadPrompt')}
                </p>
                <p className="text-xs text-slate-400">{t('payments.form.uploadHelp')}</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : payment ? t('payments.form.submitUpdate') : t('payments.form.submitNew')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}