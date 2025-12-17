import { Appointment } from "./appointment";
import { Consultation } from "./consultation";
import { Patient } from "./patient";
import { Attachment } from "./reports";

export interface Payment {
  _id: string;
  patient: Patient | string;
  consultation?: Consultation | string;
  appointment?: Appointment | string;
  amount: number;
  currency: string;
  paymentDate?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check' | 'insurance' | 'other';
  status: 'unpaid' | 'partial' | 'paid';
  amountPaid: number;
  invoiceNumber?: string;
  notes?: string;
  receiptAttachment?: Attachment;
  createdAt: string;
  updatedAt: string;
}