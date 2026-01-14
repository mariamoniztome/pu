import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { appointmentsApi, patientsApi } from "../../api";
import { Appointment } from "../../types/appointment";
import { Patient } from "../../types/patient";
import { useTranslation } from "../../hooks/useTranslation";

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onClose: () => void;
}

export function AppointmentForm({
  appointment,
  onClose,
}: AppointmentFormProps) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState<{
    patient?: string;
    dateTime: string;
    duration: string;
    type?: Appointment["type"];
    status?: Appointment["status"];
    notes: string;
  }>({
    patient: undefined,
    dateTime: "",
    duration: "60",
    type: undefined,
    status: undefined,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();

    if (appointment) {
      const dateTime = new Date(appointment.dateTime)
        .toISOString()
        .slice(0, 16);

      setFormData({
        patient:
          typeof appointment.patient === "string"
            ? appointment.patient
            : appointment.patient._id,
        dateTime,
        duration: appointment.duration.toString(),
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes || "",
      });
    }
  }, [appointment]);

  const loadPatients = async () => {
    try {
      const data = await patientsApi.getAll();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load patients. Please ensure the backend server is running."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient || !formData.type || !formData.status) {
      setError(t('appointments.requiredFields'));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = {
        patient: formData.patient,
        dateTime: new Date(formData.dateTime).toISOString(),
        duration: parseInt(formData.duration, 10),
        type: formData.type,
        status: formData.status,
        notes: formData.notes || undefined,
      };

      if (appointment) {
        await appointmentsApi.update(appointment._id, data);
      } else {
        await appointmentsApi.create(data);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || t('appointments.failedToSave'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-slate-800">
            {appointment ? t('appointments.editAppointment') : t('appointments.scheduleNewAppointment')}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-12 pb-12">
          {/* Patient */}
          <div>
            <Label>{t('appointments.patient')} {t('common.required')}</Label>
            <Select
              value={formData.patient}
              onValueChange={(value) =>
                setFormData({ ...formData, patient: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('appointments.selectPatient')} />
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

          {/* Date & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('appointments.dateTime')} {t('common.required')}</Label>
              <Input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) =>
                  setFormData({ ...formData, dateTime: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>{t('appointments.durationMinutes')} {t('common.required')}</Label>
              <Input
                type="number"
                min="15"
                max="480"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('common.type')} {t('common.required')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as Appointment["type"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('appointments.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">{t('appointments.type.initial')}</SelectItem>
                  <SelectItem value="follow-up">{t('appointments.type.followUp')}</SelectItem>
                  <SelectItem value="assessment">{t('appointments.type.assessment')}</SelectItem>
                  <SelectItem value="therapy">{t('appointments.type.therapy')}</SelectItem>
                  <SelectItem value="other">{t('appointments.type.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('common.status')} {t('common.required')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as Appointment["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('appointments.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">{t('appointments.status.scheduled')}</SelectItem>
                  <SelectItem value="confirmed">{t('appointments.status.confirmed')}</SelectItem>
                  <SelectItem value="completed">{t('appointments.status.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('appointments.status.cancelled')}</SelectItem>
                  <SelectItem value="no-show">{t('appointments.status.noShow')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>{t('common.notes')}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              placeholder={t('appointments.notesPlaceholder')}
            />
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded-2xl border border-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : appointment ? t('common.update') : t('common.schedule')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}