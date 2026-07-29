import { useState, useEffect, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import withDragAndDrop, { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, pt } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "../../styles/calendar.css";
import { Plus, X, Upload, FileText, Video, Link as LinkIcon } from "lucide-react";
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
import { Switch } from "../../components/ui/switch";
import { appointmentsApi, patientsApi, consultationsApi, calendarIntegrationsApi } from "../../api";
import { Appointment } from "../../types/appointment";
import { Patient } from "../../types/patient";
import { Consultation } from "../../types/consultation";
import { ExternalCalendarEvent } from "../../types/calendarIntegration";
import { useTranslation } from "../../hooks/useTranslation";
import { fileUrl } from "../../lib/fileUrl";
import { PageHeaderAction } from "../../components/PageHeaderAction";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { authAPI } from "../../api/auth";
import { Doctor } from "../../types/auth";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { VideoCallDialog } from "../../components/calendar/VideoCallDialog";

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
  appointment?: Appointment;
  // Read-only "busy" block synced from a connected external calendar
  // (Google/Outlook/iCloud) — not editable, not a clinical appointment.
  isExternal?: boolean;
}

const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);

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
  const { doctor: currentDoctor } = useAuth();
  const { can } = usePermissions();
  const canViewAllCalendars = can("canViewAllCalendars");
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
  const [externalEvents, setExternalEvents] = useState<ExternalCalendarEvent[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [linkedConsultation, setLinkedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("8-20");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [viewedDoctorId, setViewedDoctorId] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const isViewingOthersCalendar = viewedDoctorId !== "" && viewedDoctorId !== currentDoctor?._id;

  const [formData, setFormData] = useState({
    patientId: "",
    dateTime: "",
    endTime: "",
    type: "initial" as AppointmentType,
    isOnline: false,
    notes: "",
  });
  const [consultationData, setConsultationData] = useState(emptyConsultationData);
  const [consultationFiles, setConsultationFiles] = useState<FileList | null>(null);

  useEffect(() => {
    loadData();
  }, [viewedDoctorId]);

  useEffect(() => {
    if (!canViewAllCalendars) return;
    authAPI.getDoctors().then(({ doctors }) => {
      setDoctors(doctors.filter((d) => d.isActive));
    }).catch((error) => {
      console.error("Failed to load doctors:", error);
    });
  }, [canViewAllCalendars]);

  const loadData = async () => {
    try {
      const [appointmentsData, patientsData, consultationsData] = await Promise.all([
        appointmentsApi.getAll(isViewingOthersCalendar ? { doctorId: viewedDoctorId } : undefined),
        patientsApi.getAll(),
        consultationsApi.getAll(),
      ]);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setConsultations(Array.isArray(consultationsData) ? consultationsData : []);

      // Connected calendars (Google/Outlook/iCloud) are personal to each
      // doctor's own account — there's no access to a colleague's, so this
      // overlay only applies to your own calendar view.
      if (!isViewingOthersCalendar) {
        calendarIntegrationsApi
          .getEvents()
          .then(setExternalEvents)
          .catch((error) => console.error("Failed to load external calendar events:", error));
      } else {
        setExternalEvents([]);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error(t('calendar.failedToLoad'));
      setAppointments([]);
      setPatients([]);
      setConsultations([]);
      setExternalEvents([]);
    }
  };

  const events: CalendarEvent[] = useMemo(() => {
    const appointmentEvents: CalendarEvent[] = appointments.map((apt) => {
      const patientName =
        typeof apt.patient === "string"
          ? apt.patient
          : apt.patient
          ? `${apt.patient.firstName} ${apt.patient.lastName}`
          : t('common.unknownPatient');

      const typeKey = apt.type === "follow-up" ? "followUp" : apt.type;

      const start = new Date(apt.dateTime);

      return {
        id: apt._id,
        title: `${patientName} - ${t(`appointments.type.${typeKey}`)}`,
        start,
        end: new Date(start.getTime() + (apt.duration || 60) * 60 * 1000),
        appointment: apt,
      };
    });

    const busyEvents: CalendarEvent[] = externalEvents.map((event) => ({
      id: `external-${event._id}`,
      title: event.title || t('calendar.external.busy'),
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      allDay: event.allDay,
      isExternal: true,
    }));

    return [...appointmentEvents, ...busyEvents];
  }, [appointments, externalEvents, t]);

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
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setFormData({
      patientId: "",
      dateTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      type: "initial",
      isOnline: false,
      notes: "",
    });
    setConsultationData(emptyConsultationData);
    setConsultationFiles(null);
    setShowDialog(true);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (isViewingOthersCalendar) return;

    setSelectedEvent(null);
    setLinkedConsultation(null);
    setFormData({
      patientId: "",
      dateTime: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(slotInfo.end, "yyyy-MM-dd'T'HH:mm"),
      type: "initial",
      isOnline: false,
      notes: "",
    });
    setConsultationData(emptyConsultationData);
    setConsultationFiles(null);
    setShowDialog(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (isViewingOthersCalendar || event.isExternal || !event.appointment) return;
    const appointment = event.appointment;

    const start = new Date(appointment.dateTime);
    const end = new Date(start.getTime() + (appointment.duration || 60) * 60 * 1000);

    setSelectedEvent(event);
    setFormData({
      patientId: getPatientId(appointment.patient),
      dateTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      type: appointment.type,
      isOnline: appointment.isOnline || false,
      notes: appointment.notes || "",
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

    if (!formData.patientId) {
      toast.error(t('appointments.requiredFields'));
      return;
    }

    const start = new Date(formData.dateTime);
    const end = new Date(formData.endTime);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    if (!(duration > 0)) {
      toast.error(t('appointments.endTimeBeforeStart'));
      return;
    }

    setLoading(true);

    try {
      const data = {
        patient: formData.patientId,
        dateTime: start.toISOString(),
        duration: Math.min(480, Math.max(15, duration)),
        type: formData.type,
        isOnline: formData.isOnline,
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

  const handleDelete = () => {
    if (!selectedEvent) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    if (!selectedEvent) return;

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

  const updateAppointmentTiming = async (
    appointmentId: string,
    start: Date,
    end: Date
  ) => {
    const duration = Math.max(
      15,
      Math.round((end.getTime() - start.getTime()) / 60000)
    );

    try {
      await appointmentsApi.update(appointmentId, {
        dateTime: start.toISOString(),
        duration,
      });
      await loadData();
    } catch (err: any) {
      toast.error(err.message || t('calendar.failedToSave'));
    }
  };

  const handleEventDrop = ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
    if (isViewingOthersCalendar || event.isExternal) return;
    updateAppointmentTiming(event.id, new Date(start), new Date(end));
  };

  const handleEventResize = ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
    if (isViewingOthersCalendar || event.isExternal) return;
    updateAppointmentTiming(event.id, new Date(start), new Date(end));
  };

  const videoCallRoomName = selectedEvent ? `clinicamente-${selectedEvent.id}` : "";
  const selectedPatientName = (() => {
    const patient = patients.find((p) => p._id === formData.patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : undefined;
  })();

  const handleCopyVideoLink = async () => {
    if (!videoCallRoomName) return;
    try {
      await navigator.clipboard.writeText(`https://meet.jit.si/${videoCallRoomName}`);
      toast.success(t('calendar.videoCall.linkCopied'));
    } catch {
      toast.error(t('calendar.videoCall.loadFailed'));
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
    if (event.isExternal) {
      return {
        style: {
          backgroundColor: "repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 6px, #f3f4f6 6px, #f3f4f6 12px)",
          background: "repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 6px, #f3f4f6 6px, #f3f4f6 12px)",
          borderRadius: "8px",
          border: "1px dashed #9ca3af",
          color: "#4b5563",
          fontSize: "0.875rem",
          padding: "4px 8px",
          fontWeight: "500",
          cursor: "default",
        },
      };
    }

    const colors = {
      scheduled: { backgroundColor: "#6366f1", borderColor: "#4f46e5" },
      completed: { backgroundColor: "#10b981", borderColor: "#059669" },
      cancelled: { backgroundColor: "#ef4444", borderColor: "#dc2626" },
      "no-show": { backgroundColor: "#f59e0b", borderColor: "#d97706" },
      confirmed: { backgroundColor: "#8b5cf6", borderColor: "#7c3aed" },
    };

    const color =
      colors[event.appointment?.status as keyof typeof colors] ||
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
          {canViewAllCalendars && (
            <Select
              value={viewedDoctorId || currentDoctor?._id || ""}
              onValueChange={(value) => setViewedDoctorId(value === currentDoctor?._id ? "" : value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('calendar.myCalendar')} />
              </SelectTrigger>
              <SelectContent>
                {currentDoctor && (
                  <SelectItem value={currentDoctor._id}>{t('calendar.myCalendar')}</SelectItem>
                )}
                {doctors
                  .filter((d) => d._id !== currentDoctor?._id)
                  .map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.firstName} {d.lastName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

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

          {!isViewingOthersCalendar && (
            <Button onClick={openNewAppointment}>
              <Plus className="h-5 w-5 mr-2" />
              {t('calendar.newAppointment')}
            </Button>
          )}
        </div>
      </PageHeaderAction>

      {isViewingOthersCalendar && (
        <div className="text-sm text-gray-600 bg-lilac-50 border border-lilac-100 rounded-2xl px-4 py-2">
          {t('calendar.viewingOthersCalendar', {
            name: `${doctors.find((d) => d._id === viewedDoctorId)?.firstName || ""} ${doctors.find((d) => d._id === viewedDoctorId)?.lastName || ""}`.trim(),
          })}
        </div>
      )}

      <Card className="rounded-2xl p-2 sm:p-4 border-gray-100 bg-white overflow-hidden">
        <div style={{ height: "calc(100vh - 166px)", minHeight: "600px" }}>
          <DnDCalendar
            localizer={localizer}
            culture={culture}
            messages={calendarMessages}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            selectable={!isViewingOthersCalendar}
            resizable={!isViewingOthersCalendar}
            draggableAccessor={(event) => !isViewingOthersCalendar && !event.isExternal}
            resizableAccessor={(event) => !isViewingOthersCalendar && !event.isExternal}
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

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    {t('appointments.startTime')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => {
                      const dateTime = e.target.value;
                      setFormData((prev) => {
                        // Shift endTime by the same amount so the duration
                        // the user already set is preserved when only the
                        // start is moved.
                        const prevStart = new Date(prev.dateTime);
                        const prevEnd = new Date(prev.endTime);
                        const nextStart = new Date(dateTime);
                        const durationMs = prevEnd.getTime() - prevStart.getTime();
                        const endTime =
                          prev.dateTime && durationMs > 0
                            ? format(new Date(nextStart.getTime() + durationMs), "yyyy-MM-dd'T'HH:mm")
                            : prev.endTime;
                        return { ...prev, dateTime, endTime };
                      });
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    {t('appointments.endTime')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    min={formData.dateTime || undefined}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                  />
                </div>
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

              {/* Online session */}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">{t('appointments.isOnline')}</Label>
                  <p className="text-xs text-gray-500 mt-0.5">{t('appointments.isOnlineHelp')}</p>
                </div>
                <Switch
                  checked={formData.isOnline}
                  onCheckedChange={(checked) => setFormData({ ...formData, isOnline: checked })}
                  aria-label={t('appointments.isOnline')}
                />
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

            {selectedEvent && formData.isOnline && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowVideoCall(true)}
                >
                  <Video className="h-4 w-4 mr-2" />
                  {t('calendar.videoCall.startButton')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyVideoLink}
                  title={t('calendar.videoCall.copyLink')}
                  aria-label={t('calendar.videoCall.copyLink')}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            )}

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
                            aria-label={t('consultations.form.removeAttachment')}
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

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t('calendar.confirmDelete')}
        confirmLabel={t('common.delete')}
        onConfirm={confirmDelete}
      />

      {videoCallRoomName && (
        <VideoCallDialog
          open={showVideoCall}
          onOpenChange={setShowVideoCall}
          roomName={videoCallRoomName}
          patientName={selectedPatientName}
        />
      )}
    </div>
  );
}
