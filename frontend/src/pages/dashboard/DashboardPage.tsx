import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Video,
  X,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { DashboardChart } from "../../components/shared/DashboardChart";
import { AppointmentForm } from "../../components/appointments/AppointmentForm";
import { ConsultationForm } from "../../components/consultations/ConsultationForm";
import { appointmentsApi, patientsApi } from "../../api";
import { Appointment } from "../../types/appointment";
import { Patient } from "../../types/patient";
import { useTranslation } from "../../hooks/useTranslation";
import { useAuth } from "../../contexts/AuthContext";

export function DashboardPage() {
  const { t } = useTranslation();
  const { doctor } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientFilter, setPatientFilter] = useState<
    "all" | "new" | "insurance"
  >("all");
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isConsultationDialogOpen, setIsConsultationDialogOpen] =
    useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appointmentsData, patientsData] = await Promise.all([
          appointmentsApi.getAll(),
          patientsApi.getAll(),
        ]);
        setAppointments(appointmentsData);
        setPatients(patientsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("dashboard.failedToLoadData"));
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleAppointmentFormClose = () => {
    setIsAppointmentDialogOpen(false);
    // Refresh appointments after form closes
    fetchAppointments();
  };

  const fetchAppointments = async () => {
    try {
      const data = await appointmentsApi.getAll();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = t("dashboard.weekDaysShort", { returnObjects: true }) as string[];

  // Filter today's appointments
  const today = new Date();
  const todayAppointments = appointments
    .filter((apt) => {
      const aptDate = new Date(apt.dateTime);
      return (
        aptDate.getDate() === today.getDate() &&
        aptDate.getMonth() === today.getMonth() &&
        aptDate.getFullYear() === today.getFullYear()
      );
    })
    .map((apt) => ({
      _id: apt._id,
      name:
        typeof apt.patient === "string"
          ? apt.patient
          : apt.patient
          ? `${apt.patient.firstName} ${apt.patient.lastName}`
          : t("dashboard.unknownPatient"),
      time: new Date(apt.dateTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: apt.type,
      completed: apt.status === "completed",
    }));

  const newPatients = patients.filter((p) => {
    const createdDate = new Date(p.createdAt);
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return createdDate > oneWeekAgo;
  });

  const insurancePatients =
    patients.length > 0 ? Math.floor(patients.length * 0.6) : 0;

  // Get calendar days with appointment indicators based on filter
  const getDaysWithAppointments = () => {
    const daysWithAppointments: Record<number, number> = {};

    appointments.forEach((apt) => {
      const aptDate = new Date(apt.dateTime);
      const aptDay = aptDate.getDate();

      // Check if appointment matches the calendar filter
      let shouldInclude = false;

      // switch (calendarFilter) {
      //   case 'weekly':
      //     // Show appointments from this week
      //     const weekStart = new Date(today);
      //     weekStart.setDate(today.getDate() - today.getDay());
      //     const weekEnd = new Date(weekStart);
      //     weekEnd.setDate(weekStart.getDate() + 6);

      //     shouldInclude = aptDate >= weekStart && aptDate <= weekEnd;
      //     break;

      //   case 'monthly':
      //     // Show appointments from this month
      //     shouldInclude = aptYear === year && aptMonth === month;
      //     break;

      //   case 'all-time':
      //     // Show all appointments
      //     shouldInclude = true;
      //     break;
      // }

      if (shouldInclude) {
        daysWithAppointments[aptDay] = (daysWithAppointments[aptDay] || 0) + 1;
      }
    });

    return daysWithAppointments;
  };

  const daysWithAppointments = getDaysWithAppointments();

  // Calculate week-over-week percentage change for patients
  const calculatePatientWeekChange = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Count patients from last week
    const lastWeekPatients = patients.filter((p) => {
      const createdDate = new Date(p.createdAt);
      return createdDate >= oneWeekAgo && createdDate <= today;
    }).length;

    // Count patients from the week before
    const prevWeekPatients = patients.filter((p) => {
      const createdDate = new Date(p.createdAt);
      return createdDate >= twoWeeksAgo && createdDate < oneWeekAgo;
    }).length;

    // Calculate percentage change
    if (prevWeekPatients === 0) {
      return { percentage: 0, isIncrease: lastWeekPatients > 0 };
    }

    const change =
      ((lastWeekPatients - prevWeekPatients) / prevWeekPatients) * 100;
    return {
      percentage: Math.abs(Math.round(change)),
      isIncrease: change > 0,
    };
  };

  const weekChange = calculatePatientWeekChange();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {t("dashboard.title")}
          </h1>
          <p className="text-red-500">
            {t("dashboard.errorLoading", { error })}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-slate-600">
          {t("dashboard.loadingDashboard")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {t("dashboard.greeting", {
            name: 
                `${doctor?.firstName}!`
              
          })}
        </h1>
        {/* <p className="text-gray-500">{t("dashboard.subtitle")}</p> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-row-reverse items-stretch gap-6">
            <Card className="flex-1 bg-gradient-to-br from-primary-200 to-primary-300 border-0 rounded-5xl p-8 relative overflow-hidden shadow-2xl hover:shadow-primary-300/40 transition-all duration-300">
              <div className="relative z-10 text-center h-full flex flex-col justify-center">
                <div className="mb-4 w-14 h-14 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-lg mx-auto">
                  <Clock className="h-7 w-7 text-gray-800" />
                </div>
                <div className="text-6xl font-bold text-gray-900 mb-1">
                  {currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-sm text-gray-700">
                  {currentTime.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </Card>

            <Card className="flex-1 bg-gradient-to-br from-lilac-200 to-lilac-300 border-0 rounded-5xl p-8 relative overflow-hidden shadow-2xl hover:shadow-lilac-300/40 transition-all duration-300">
              <div className="relative z-10 text-center h-full flex flex-col justify-center">
                <div className="mb-4 w-14 h-14 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-lg mx-auto">
                  <Video className="h-7 w-7 text-lilac-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {t("dashboard.onlineSession")}
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  {t("dashboard.videoConsultationReady")}
                </p>
                <div className="flex gap-2 justify-center">
                  <div className="text-xs font-semibold text-gray-700 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full">
                    {t("dashboard.available")}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="rounded-5xl p-8 shadow-xl h-[700px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {appointments.length}
                  </h2>
                  <span className="text-sm text-primary-600 font-semibold">
                    {t("dashboard.todayIncrease", { percentage: 2 })}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {t("dashboard.patientAppointments")}
                </p>
              </div>
              <Button
                onClick={() => setIsAppointmentDialogOpen(true)}
                className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t("dashboard.addNewAppointment")}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("dashboard.patientStatistics")}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPatientFilter("all")}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    patientFilter === "all"
                      ? "bg-gradient-to-r from-lilac-200 to-lilac-300 text-gray-800 shadow-md"
                      : "text-gray-600 hover:bg-white/60 backdrop-blur-sm"
                  }`}
                >
                  {t("dashboard.allPatients")}
                </button>
                <button
                  onClick={() => setPatientFilter("new")}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    patientFilter === "new"
                      ? "bg-gradient-to-r from-lilac-200 to-lilac-300 text-gray-800 shadow-md"
                      : "text-gray-600 hover:bg-white/60 backdrop-blur-sm"
                  }`}
                >
                  {t("dashboard.newPatients")}
                </button>
                <button
                  onClick={() => setPatientFilter("insurance")}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    patientFilter === "insurance"
                      ? "bg-gradient-to-r from-lilac-200 to-lilac-300 text-gray-800 shadow-md"
                      : "text-gray-600 hover:bg-white/60 backdrop-blur-sm"
                  }`}
                >
                  {t("dashboard.insurance")}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {patientFilter === "new"
                      ? newPatients.length
                      : patientFilter === "insurance"
                      ? insurancePatients
                      : patients.length}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    {patientFilter === "all"
                      ? t("dashboard.totalPatientsLabel")
                      : patientFilter === "new"
                      ? t("dashboard.newPatients")
                      : t("dashboard.insurancePatientsLabel")}
                    <span
                      className={
                        weekChange.isIncrease
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {weekChange.isIncrease ? "↑" : "↓"}{" "}
                      {t("dashboard.percentWeekChange", { percentage: weekChange.percentage })}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {insurancePatients}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t("dashboard.insurancePatientsLabel")}
                  </div>
                </div>
              </div>

              <div className="h-80 bg-gradient-to-br from-lilac-50 to-primary-50 rounded-xl flex items-center justify-center border border-white/60 overflow-scroll">
                <DashboardChart appointments={appointments} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-5xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {monthName}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-white/60 backdrop-blur-sm rounded-full transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white/60 backdrop-blur-sm rounded-full transition-all duration-300"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-xs text-gray-500 text-center font-medium"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({
                length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1,
              }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const hasAppointments = daysWithAppointments[day] || 0;
                const isToday = day === new Date().getDate();

                return (
                  <button
                    key={day}
                    className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg hover:bg-gray-100 transition-all duration-300 relative ${
                      isToday
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                    {hasAppointments > 0 && (
                      <span
                        className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                          isToday ? "bg-white" : "bg-primary-500"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="rounded-5xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("dashboard.todaysSchedule")}
            </h3>
            <div className="space-y-3">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((apt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-4xl hover:bg-white/60 backdrop-blur-sm transition-all duration-300"
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-200 to-lilac-200 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-sm font-semibold text-gray-800">
                        {apt.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">
                        {apt.name}
                      </div>
                      <div className="text-xs text-gray-500">{apt.type}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {apt.time}
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                        apt.completed
                          ? "bg-gradient-to-r from-primary-400 to-primary-500"
                          : "bg-gradient-to-r from-gray-700 to-gray-900"
                      }`}
                    >
                      {apt.completed ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <Clock className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">
                    {t("dashboard.noAppointmentsToday")}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {t("dashboard.scheduleClear")}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Dialog
        open={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>{t("dashboard.addAppointmentDialogTitle")}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsAppointmentDialogOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <AppointmentForm onClose={handleAppointmentFormClose} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isConsultationDialogOpen}
        onOpenChange={setIsConsultationDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>{t("dashboard.newConsultationDialogTitle")}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsConsultationDialogOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <ConsultationForm
            onClose={() => {
              setIsConsultationDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}