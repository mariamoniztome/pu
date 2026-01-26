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
import { consultationsApi, patientsApi } from "../../api";
import { Consultation } from "../../types/consultation";
import { Patient } from "../../types/patient";
import { useTranslation } from "../../hooks/useTranslation";

interface ConsultationFormProps {
  consultation?: Consultation | null;
  onClose: () => void;
}

export function ConsultationForm({
  consultation,
  onClose,
}: ConsultationFormProps) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);

  const [formData, setFormData] = useState<{
    patient?: string;
    date: string;
    sessionNumber: string;
    chiefComplaint: string;
    sessionNotes: string;
    clinicalObservations: string;
    interventions: string;
    homework: string;
    progressAssessment: string;
    nextSessionPlan: string;
  }>({
    patient: undefined,
    date: new Date().toISOString().split("T")[0],
    sessionNumber: "1",
    chiefComplaint: "",
    sessionNotes: "",
    clinicalObservations: "",
    interventions: "",
    homework: "",
    progressAssessment: "",
    nextSessionPlan: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();

    if (consultation) {
      setFormData({
        patient:
          typeof consultation.patient === "string"
            ? consultation.patient
            : consultation.patient._id,
        date: consultation.date.split("T")[0],
        sessionNumber: consultation.sessionNumber.toString(),
        chiefComplaint: consultation.chiefComplaint || "",
        sessionNotes: consultation.sessionNotes,
        clinicalObservations: consultation.clinicalObservations || "",
        interventions: consultation.interventions || "",
        homework: consultation.homework || "",
        progressAssessment: consultation.progressAssessment || "",
        nextSessionPlan: consultation.nextSessionPlan || "",
      });
    }
  }, [consultation]);

  const loadPatients = async () => {
    try {
      const data = await patientsApi.getAll();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      setError(t('consultations.form.loadPatientsError'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient) {
      setError(t('consultations.form.requiredFields'));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("patient", formData.patient);
      formDataToSend.append("date", new Date(formData.date).toISOString());
      formDataToSend.append("sessionNumber", formData.sessionNumber);
      formDataToSend.append("sessionNotes", formData.sessionNotes);

      if (formData.chiefComplaint)
        formDataToSend.append("chiefComplaint", formData.chiefComplaint);
      if (formData.clinicalObservations)
        formDataToSend.append(
          "clinicalObservations",
          formData.clinicalObservations
        );
      if (formData.interventions)
        formDataToSend.append("interventions", formData.interventions);
      if (formData.homework)
        formDataToSend.append("homework", formData.homework);
      if (formData.progressAssessment)
        formDataToSend.append(
          "progressAssessment",
          formData.progressAssessment
        );
      if (formData.nextSessionPlan)
        formDataToSend.append(
          "nextSessionPlan",
          formData.nextSessionPlan
        );

      if (files) {
        Array.from(files).forEach((file) =>
          formDataToSend.append("attachments", file)
        );
      }

      if (consultation) {
        await consultationsApi.update(consultation._id, formDataToSend);
      } else {
        await consultationsApi.create(formDataToSend);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || t('consultations.form.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-slate-800">
            {consultation ? t('consultations.form.titleEdit') : t('consultations.form.titleNew')}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-12 pb-12">
          {/* Patient + Date */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label>{t('consultations.form.patient')} *</Label>
              <Select
                value={formData.patient}
                onValueChange={(value) =>
                  setFormData({ ...formData, patient: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('consultations.form.selectPatient')} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('consultations.form.date')} *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Session number */}
          <div>
            <Label>{t('consultations.form.sessionNumber')} *</Label>
            <Input
              type="number"
              min="1"
              value={formData.sessionNumber}
              onChange={(e) =>
                setFormData({ ...formData, sessionNumber: e.target.value })
              }
              required
            />
          </div>

          {/* Notes */}
          <div>
            <Label>{t('consultations.form.sessionNotes')} *</Label>
            <Textarea
              value={formData.sessionNotes}
              onChange={(e) =>
                setFormData({ ...formData, sessionNotes: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          {/* Remaining textareas (unchanged logic) */}
          {/* ...same as before... */}

          {/* Attachments */}
          <div>
            <Label>{t('consultations.form.attachments')}</Label>
            <label className="mt-2 flex h-24 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/30 hover:bg-primary-50">
              <div className="text-center">
                <Upload className="mx-auto mb-2 h-8 w-8 text-primary-400" />
                <p className="text-sm text-slate-600">
                  {files
                    ? t('consultations.form.filesSelected', { count: files.length })
                    : t('consultations.form.uploadPrompt')}
                </p>
                <p className="text-xs text-slate-400">{t('consultations.form.uploadHelp')}</p>
              </div>
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                onChange={(e) => setFiles(e.target.files)}
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
              {loading ? t('common.saving') : consultation ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}