import { useState, useEffect, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, pt } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/calendar.css";
import { Plus, X, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { appointmentsApi, patientsApi, consultationsApi } from "../../api";
import { Appointment } from "../../types/appointment";
import { Patient } from "../../types/patient";
import { Consultation } from "../../types/consultation";
import { useTranslation } from "../../hooks/useTranslation";
import { fileUrl } from "../../lib/fileUrl";
import { PageHeaderAction } from "../../components/PageHeaderAction";

const locales = {
  "en-US": enUS,
  "pt-PT": pt,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent extends Event {
  id: string;
  appointment: Appointment;
}

const TIME_RANGE_PRESETS = {
  "8-18": { startHour: 8, endHour: 18, label: "08:00 - 18:00" },
  "8-20": { startHour: 8, endHour: 20, label: "08:00 - 20:00" },
  "7-21": { startHour: 7, endHour: 21, label: "07:00 - 21:00" },
  "0-24": { startHour: 0, endHour: 24, label: "00:00 - 24:00" },
} as const;

type TimeRangeKey = keyof typeof TIME_RANGE_PRESETS;

type AppointmentType = "follow-up" | "initial" | "assessment" | "therapy" | "other";

const emptyConsultationData = {
  chiefComplaint: "",
  sessionNotes: "",
  clinicalObservations: "",
  interventions: "",
  homework: "",
  progressAssessment: "",
};

function getPatientId(patient: Patient | string | null | undefined): string {
  if (!patient) return "";
  return typeof patient === "string" ? patient : patient._id;
}

export function CalendarPage() {
  const { t, i18n } = useTranslation();
  const culture = i18n.language?.startsWith("pt") ? "pt-PT" : "en-US";
  const calendarMessages = useMemo(
    () => ({
      today: t('calendar.today'),
      previous: t('calendar.back'),
      next: t('calendar.next'),
      month: t('calendar.month'),
      week: t('calendar.week'),
      day: t('calendar.day'),
      agenda: t('calendar.agenda'),
      date: t('calendar.rbcDate'),
      time: t('calendar.rbcTime'),
      event: t('calendar.rbcEvent'),
      allDay: t('calendar.allDay'),
      noEventsInRange: t('calendar.noEventsInRange'),
      showMore: (total: number) => t('calendar.showMore', { count: total }),
    }),
    [t]
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [linkedConsultation, setLinkedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("8-20");

  const [formData, setFormData] = useState({
    patientId: "",
    dateTime: "",
    type: "initial" as AppointmentType,
    notes: "",
  });
  const [consultationData, setConsultationData] = useState(emptyConsultationData);
  const [consultationFiles, setConsultationFiles] = useState<FileList | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appointmentsData, patientsData, consultationsData] = await Promise.all([
        appointmentsApi.getAll(),
        patientsApi.getAll(),
        consultationsApi.getAll(),
      ]);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setConsultations(Array.isArray(consultationsData) ? consultationsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error(t('calendar.failedToLoad'));
      setAppointments([]);
      setPatients([]);
      setConsultations([]);
    }
  };

  const events: CalendarEvent[] = useMemo(() => {
    return appointments.map((apt) => {
      const patientName =
        typeof apt.patient === "string"
          ? apt.patient
          : apt.patient
          ? `${apt.patient.firstName} ${apt.patient.lastName}`
          : t('common.unknownPatient');

      const typeKey = apt.type === "follow-up" ? "followUp" : apt.type;

      return {
        id: apt._id,
        title: `${patientName} - ${t(`appointments.type.${typeKey}`)}`,
        start: new Date(apt.dateTime),
        end: new Date(new Date(apt.dateTime).getTime() + 60 * 60 * 1000),
        appointment: apt,
      };
    });
  }, [appointments, t]);

  const { minTime, maxTime } = useMemo(() => {
    const { startHour, endHour } = TIME_RANGE_PRESETS[timeRange];
    const min = new Date();
    min.setHours(startHour, 0, 0, 0);
    const max = new Date();
    if (endHour >= 24) {
      max.setHours(23, 59, 59, 999);
    } else {
      max.setHours(endHour, 0, 0, 0);
    }
    return { minTime: min, maxTime: max };
  }, [timeRange]);

  const findConsultationForAppointment = (appointmentId: string) =>
    consultations.find((c) => {
      const linkedId = typeof c.appointment === "string" ? c.appointment : c.appointment?._id;
      return linkedId === appointmentId;
    }) || null;

  const openNewAppointment = () => {
    setSelectedEvent(null);
    setLinkedConsultation(null);
    setFormData({
      patientId: "",
      dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      type: "initial",
      notes: "",
    });
    setConsultationData(emptyConsultationData);
    setConsultationFiles(null);
    setShowDialog(true);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setLinkedConsultation(null);
    setFormData({
      patientId: "",
      dateTime: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
      type: "initial",
      notes: "",
    });
    setConsultationData(emptyConsultationData);
    setConsultationFiles(null);
    setShowDialog(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      patientId: getPatientId(event.appointment.patient),
      dateTime: format(new Date(event.appointment.dateTime), "yyyy-MM-dd'T'HH:mm"),
      type: event.appointment.type,
      notes: event.appointment.notes || "",
    });

    const existing = findConsultationForAppointment(event.id);
    setLinkedConsultation(existing);
    setConsultationData(
      existing
        ? {
            chiefComplaint: existing.chiefComplaint || "",
            sessionNotes: existing.sessionNotes || "",
            clinicalObservations: existing.clinicalObservations || "",
            interventions: existing.interventions || "",
            homework: existing.homework || "",
            progressAssessment: existing.progressAssessment || "",
          }
        : emptyConsultationData
    );
    setConsultationFiles(null);
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        patient: formData.patientId,
        dateTime: new Date(formData.dateTime).toISOString(),
        type: formData.type,
        notes: formData.notes || undefined,
      };

      let appointmentId = selectedEvent?.id;

      if (selectedEvent) {
        await appointmentsApi.update(selectedEvent.id, data);
      } else {
        const created = await appointmentsApi.create(data);
        appointmentId = created._id;
      }

      if (selectedEvent && consultationData.sessionNotes.trim()) {
        const fd = new FormData();
        fd.append("patient", formData.patientId);
        fd.append("appointment", appointmentId!);
        fd.append("date", new Date(formData.dateTime).toISOString());
        const sessionNumber = linkedConsultation
          ? linkedConsultation.sessionNumber
          : consultations.filter((c) => getPatientId(c.patient) === formData.patientId).length + 1;
        fd.append("sessionNumber", String(sessionNumber));
        fd.append("sessionNotes", consultationData.sessionNotes);
        if (consultationData.chiefComplaint) fd.append("chiefComplaint", consultationData.chiefComplaint);
        if (consultationData.clinicalObservations) fd.append("clinicalObservations", consultationData.clinicalObservations);
        if (consultationData.interventions) fd.append("interventions", consultationData.interventions);
        if (consultationData.homework) fd.append("homework", consultationData.homework);
        if (consultationData.progressAssessment) fd.append("progressAssessment", consultationData.progressAssessment);
        if (consultationFiles) {
          Array.from(consultationFiles).forEach((file) => fd.append("attachments", file));
        }

        if (linkedConsultation) {
          await consultationsApi.update(linkedConsultation._id, fd);
        } else {
          await consultationsApi.create(fd);
        }
      }

      toast.success(selectedEvent ? t('calendar.appointmentUpdated') : t('calendar.appointmentCreated'));
      setShowDialog(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || t('calendar.failedToSave'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    if (!confirm(t('calendar.confirmDelete'))) return;

    try {
      if (linkedConsultation) {
        await consultationsApi.delete(linkedConsultation._id);
      }
      await appointmentsApi.delete(selectedEvent.id);
      toast.success(t('calendar.appointmentDeleted'));
      setShowDialog(false);
      loadData();
    } catch (error) {
      toast.error(t('calendar.failedToDelete'));
    }
  };

  const handleDeleteAttachment = async (filename: string) => {
    if (!linkedConsultation) return;
    try {
      await consultationsApi.deleteAttachment(linkedConsultation._id, filename);
      setLinkedConsultation({
        ...linkedConsultation,
        attachments: linkedConsultation.attachments.filter((a) => a.filename !== filename),
      });
    } catch {
      toast.error(t('calendar.failedToSave'));
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const colors = {
      scheduled: { backgroundColor: "#6366f1", borderColor: "#4f46e5" },
      completed: { backgroundColor: "#10b981", borderColor: "#059669" },
      cancelled: { backgroundColor: "#ef4444", borderColor: "#dc2626" },
      "no-show": { backgroundColor: "#f59e0b", borderColor: "#d97706" },
      confirmed: { backgroundColor: "#8b5cf6", borderColor: "#7c3aed" },
    };

    const color =
      colors[event.appointment.status as keyof typeof colors] ||
      colors.scheduled;

    return {
      style: {
        backgroundColor: color.backgroundColor,
        borderColor: color.borderColor,
        borderRadius: "8px",
        border: "none",
        color: "white",
        fontSize: "0.875rem",
        padding: "4px 8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        fontWeight: "500",
      },
    };
  };

  return (
    <div className="space-y-6">
      <PageHeaderAction>
        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRangeKey)}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t('calendar.timeRange')} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_RANGE_PRESETS).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={openNewAppointment}>
            <Plus className="h-5 w-5 mr-2" />
            {t('calendar.newAppointment')}
          </Button>
        </div>
      </PageHeaderAction>

      <Card className="rounded-2xl p-2 sm:p-4 border-gray-100 bg-white overflow-hidden">
        <div style={{ height: "calc(100vh - 166px)", minHeight: "600px" }}>
          <Calendar
            localizer={localizer}
            culture={culture}
            messages={calendarMessages}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day", "agenda"]}
            defaultView="week"
            step={30}
            min={minTime}
            max={maxTime}
            showMultiDayTimes
            style={{ height: "100%" }}
          />
        </div>
      </Card>

      <Dialog
        open={showDialog}
        onOpenChange={(open) => !loading && setShowDialog(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? t('calendar.editAppointmentTitle') : t('calendar.newAppointmentTitle')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              

              {/* Patient */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  {t('appointments.patient')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, patientId: value })
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

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  {t('appointments.dateTime')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) =>
                    setFormData({ ...formData, dateTime: e.target.value })
                  }
                  required
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  {t('appointments.appointmentType')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as AppointmentType })
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

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  {t('common.notes')}
                </Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  placeholder={t('appointments.notesPlaceholder')}
                />
              </div>
            </div>

            {selectedEvent && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                 
                  {!linkedConsultation && (
                    <span className="text-xs text-gray-400">{t('calendar.sessionInfoHint')}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">{t('consultations.chiefComplaint')}</Label>
                  <Input
                    value={consultationData.chiefComplaint}
                    onChange={(e) => setConsultationData({ ...consultationData, chiefComplaint: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">{t('consultations.sessionNotes')}</Label>
                  <Textarea
                    value={consultationData.sessionNotes}
                    onChange={(e) => setConsultationData({ ...consultationData, sessionNotes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">{t('consultations.clinicalObservations')}</Label>
                  <Textarea
                    value={consultationData.clinicalObservations}
                    onChange={(e) => setConsultationData({ ...consultationData, clinicalObservations: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">{t('consultations.interventions')}</Label>
                  <Textarea
                    value={consultationData.interventions}
                    onChange={(e) => setConsultationData({ ...consultationData, interventions: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">{t('consultations.homework')}</Label>
                  <Textarea
                    value={consultationData.homework}
                    onChange={(e) => setConsultationData({ ...consultationData, homework: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">{t('consultations.progressAssessment')}</Label>
                  <Textarea
                    value={consultationData.progressAssessment}
                    onChange={(e) => setConsultationData({ ...consultationData, progressAssessment: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">{t('consultations.form.attachments')}</Label>
                  {linkedConsultation && linkedConsultation.attachments.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {linkedConsultation.attachments.map((attachment) => (
                        <div
                          key={attachment.filename}
                          className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2"
                        >
                          <a
                            href={fileUrl(attachment.path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-lilac-600 hover:text-lilac-800 hover:underline"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {attachment.originalName}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(attachment.filename)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex h-20 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/30 hover:bg-primary-50">
                    <div className="text-center">
                      <Upload className="mx-auto mb-1 h-6 w-6 text-primary-400" />
                      <p className="text-xs text-slate-600">
                        {consultationFiles
                          ? t('consultations.form.filesSelected', { count: consultationFiles.length })
                          : t('consultations.form.uploadPrompt')}
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                      onChange={(e) => setConsultationFiles(e.target.files)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              {selectedEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="rounded-full mr-auto"
                  disabled={loading}
                >
                  {t('common.delete')}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? t('common.saving') : selectedEvent ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
