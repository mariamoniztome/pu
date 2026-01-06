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

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onClose: () => void;
}

export function AppointmentForm({
  appointment,
  onClose,
}: AppointmentFormProps) {
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
      setError("Please fill in all required fields.");
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
      setError(err.message || "Failed to save appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-slate-800">
            {appointment ? "Edit Appointment" : "Schedule New Appointment"}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-12 pb-12">
          {/* Patient */}
          <div>
            <Label>Patient *</Label>
            <Select
              value={formData.patient}
              onValueChange={(value) =>
                setFormData({ ...formData, patient: value })
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

          {/* Date & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date & Time *</Label>
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
              <Label>Duration (minutes) *</Label>
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
              <Label>Type *</Label>
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
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="therapy">Therapy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status *</Label>
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
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No-show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              placeholder="Any additional notes about this appointment..."
            />
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
              {loading ? "Saving..." : appointment ? "Update" : "Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}