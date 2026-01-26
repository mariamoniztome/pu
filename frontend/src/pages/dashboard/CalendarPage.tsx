import { useState, useEffect, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/calendar.css";
import { Plus, X } from "lucide-react";
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
import { appointmentsApi, patientsApi } from "../../api";
import { Appointment } from "../../types/appointment";
import { Patient } from "../../types/patient";
import { useTranslation } from "../../hooks/useTranslation";

const locales = {
  "en-US": enUS,
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

export function CalendarPage() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patientId: "",
    dateTime: "",
    type: "initial" as
      | "follow-up"
      | "initial"
      | "assessment"
      | "therapy"
      | "other",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appointmentsData, patientsData] = await Promise.all([
        appointmentsApi.getAll(),
        patientsApi.getAll(),
      ]);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error(t('calendar.failedToLoad'));
      setAppointments([]);
      setPatients([]);
    }
  };

  const events: CalendarEvent[] = useMemo(() => {
    return appointments.map((apt) => {
      const patientName =
        typeof apt.patient === "string"
          ? apt.patient
          : `${apt.patient.firstName} ${apt.patient.lastName}`;

      return {
        id: apt._id,
        title: `${patientName} - ${apt.type}`,
        start: new Date(apt.dateTime),
        end: new Date(new Date(apt.dateTime).getTime() + 60 * 60 * 1000),
        appointment: apt,
      };
    });
  }, [appointments]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setFormData({
      patientId: "",
      dateTime: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
      type: "initial",
      notes: "",
    });
    setShowDialog(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      patientId:
        typeof event.appointment.patient === "string"
          ? event.appointment.patient
          : event.appointment.patient._id,
      dateTime: format(
        new Date(event.appointment.dateTime),
        "yyyy-MM-dd'T'HH:mm"
      ),
      type: event.appointment.type,
      notes: event.appointment.notes || "",
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        patientId: formData.patientId,
        dateTime: new Date(formData.dateTime).toISOString(),
        type: formData.type,
        notes: formData.notes || undefined,
      };

      if (selectedEvent) {
        await appointmentsApi.update(selectedEvent.id, data);
        toast.success(t('calendar.appointmentUpdated'));
      } else {
        await appointmentsApi.create(data);
        toast.success(t('calendar.appointmentCreated'));
      }

      setShowDialog(false);
      loadData();
      setFormData({
        patientId: "",
        dateTime: "",
        type: "initial",
        notes: "",
      });
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
      await appointmentsApi.delete(selectedEvent.id);
      toast.success(t('calendar.appointmentDeleted'));
      setShowDialog(false);
      loadData();
    } catch (error) {
      toast.error(t('calendar.failedToDelete'));
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Calendar</h1>
          <p className="text-gray-500">View and manage all your appointments</p>
        </div>
        <Button
          onClick={() => {
            setSelectedEvent(null);
            setFormData({
              patientId: "",
              dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
              type: "initial",
              notes: "",
            });
            setShowDialog(true);
          }}
          className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white rounded-full px-6 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Appointment
        </Button>
      </div>

      <Card className="rounded-3xl p-6 shadow-xl overflow-hidden">
        <div style={{ height: "calc(100vh - 250px)", minHeight: "600px" }}>
          <Calendar
            localizer={localizer}
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
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {selectedEvent ? "Edit Appointment" : "New Appointment"}
            </DialogTitle>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowDialog(false)}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 px-12 pb-12 ">
            {/* Patient */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Patient <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) =>
                  setFormData({ ...formData, patientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
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
                Date & Time <span className="text-red-500">*</span>
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
                Appointment Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Initial Assessment</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="therapy">Therapy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Notes
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Add any additional notes..."
              />
            </div>

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
                  Delete
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : selectedEvent ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
