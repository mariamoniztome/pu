import { Appointment } from "./appointment";
import { Patient } from "./patient";
import { Attachment } from "./reports";

export interface Consultation {
  _id: string;
  patient: Patient | string;
  appointment?: Appointment | string;
  date: string;
  sessionNumber: number;
  chiefComplaint?: string;
  sessionNotes: string;
  clinicalObservations?: string;
  interventions?: string;
  homework?: string;
  progressAssessment?: string;
  nextSessionPlan?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}