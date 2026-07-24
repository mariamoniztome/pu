import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
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
import { externalReportsApi, patientsApi } from "../../api";
import { ExternalReport } from "../../types/reports";
import { Patient } from "../../types/patient";
import { useTranslation } from "../../hooks/useTranslation";

interface ReportFormProps {
  report?: ExternalReport | null;
  onClose: () => void;
}

export function ReportForm({ report, onClose }: ReportFormProps) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);

  const [formData, setFormData] = useState<{
    patient?: string;
    reportType?: ExternalReport["reportType"];
    recipientName: string;
    recipientOrganization: string;
    requestDate: string;
    completionDate: string;
    purpose: string;
    summary: string;
    findings: string;
    recommendations: string;
    status?: ExternalReport["status"];
  }>({
    patient: undefined,
    reportType: undefined,
    recipientName: "",
    recipientOrganization: "",
    requestDate: new Date().toISOString().split("T")[0],
    completionDate: "",
    purpose: "",
    summary: "",
    findings: "",
    recommendations: "",
    status: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();

    if (report) {
      setFormData({
        patient:
          typeof report.patient === "string"
            ? report.patient
            : report.patient?._id,
        reportType: report.reportType,
        recipientName: report.recipientName,
        recipientOrganization: report.recipientOrganization || "",
        requestDate: report.requestDate.split("T")[0],
        completionDate: report.completionDate
          ? report.completionDate.split("T")[0]
          : "",
        purpose: report.purpose,
        summary: report.summary,
        findings: report.findings || "",
        recommendations: report.recommendations || "",
        status: report.status,
      });
    }
  }, [report]);

  const loadPatients = async () => {
    try {
      const data = await patientsApi.getAll();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      setError(t('reports.form.loadPatientsError'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient || !formData.reportType || !formData.status) {
      setError(t('reports.form.requiredFields'));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("patient", formData.patient);
      formDataToSend.append("reportType", formData.reportType);
      formDataToSend.append("recipientName", formData.recipientName);
      formDataToSend.append(
        "requestDate",
        new Date(formData.requestDate).toISOString()
      );
      formDataToSend.append("purpose", formData.purpose);
      formDataToSend.append("summary", formData.summary);
      formDataToSend.append("status", formData.status);

      if (formData.recipientOrganization)
        formDataToSend.append(
          "recipientOrganization",
          formData.recipientOrganization
        );
      if (formData.completionDate)
        formDataToSend.append(
          "completionDate",
          new Date(formData.completionDate).toISOString()
        );
      if (formData.findings)
        formDataToSend.append("findings", formData.findings);
      if (formData.recommendations)
        formDataToSend.append(
          "recommendations",
          formData.recommendations
        );

      if (files) {
        Array.from(files).forEach((file) =>
          formDataToSend.append("attachments", file)
        );
      }

      if (report) {
        await externalReportsApi.update(report._id, formDataToSend);
      } else {
        await externalReportsApi.create(formDataToSend);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || t('reports.form.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
      <DialogHeader>
          <DialogTitle>
            {report ? t('reports.form.titleEdit') : t('reports.form.titleNew')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('reports.form.patient')} *</Label>
              <Select
                value={formData.patient}
                onValueChange={(value) =>
                  setFormData({ ...formData, patient: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('reports.form.selectPatient')} />
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
              <Label>{t('reports.form.type')} *</Label>
              <Select
                value={formData.reportType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    reportType: value as ExternalReport["reportType"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('reports.form.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="court">{t('reports.types.court')}</SelectItem>
                  <SelectItem value="school">{t('reports.types.school')}</SelectItem>
                  <SelectItem value="employer">{t('reports.types.employer')}</SelectItem>
                  <SelectItem value="insurance">{t('reports.types.insurance')}</SelectItem>
                  <SelectItem value="medical">{t('reports.types.medical')}</SelectItem>
                  <SelectItem value="other">{t('reports.types.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates + Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t('reports.form.requestDate')} *</Label>
              <Input
                type="date"
                value={formData.requestDate}
                onChange={(e) =>
                  setFormData({ ...formData, requestDate: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>{t('reports.form.completionDate')}</Label>
              <Input
                type="date"
                value={formData.completionDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    completionDate: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>{t('reports.form.status')} *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as ExternalReport["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('reports.form.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested">{t('reports.status.requested')}</SelectItem>
                  <SelectItem value="in-progress">{t('reports.status.inProgress')}</SelectItem>
                  <SelectItem value="completed">{t('reports.status.completed')}</SelectItem>
                  <SelectItem value="delivered">{t('reports.status.delivered')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text fields */}
          <div>
            <Label>{t('reports.form.purpose')} *</Label>
            <Textarea
              value={formData.purpose}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>{t('reports.form.summary')} *</Label>
            <Textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('reports.form.findings')}</Label>
              <Textarea
                value={formData.findings}
                onChange={(e) =>
                  setFormData({ ...formData, findings: e.target.value })
                }
              />
            </div>

            <div>
              <Label>{t('reports.form.recommendations')}</Label>
              <Textarea
                value={formData.recommendations}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recommendations: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <Label>{t('reports.form.attachments')}</Label>
            <label className="mt-2 flex h-24 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-lavender-200 bg-lavender-50/30 hover:bg-lavender-50">
              <div className="text-center">
                <Upload className="mx-auto mb-2 h-8 w-8 text-lavender-400" />
                <p className="text-sm text-slate-600">
                  {files
                    ? t('reports.form.filesSelected', { count: files.length })
                    : t('reports.form.uploadPrompt')}
                </p>
                <p className="text-xs text-slate-400">{t('reports.form.uploadHelp')}</p>
              </div>
              <input
                type="file"
                multiple
                className="hidden"
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
              {loading ? t('common.saving') : report ? t('reports.form.submitUpdate') : t('reports.form.submitNew')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}