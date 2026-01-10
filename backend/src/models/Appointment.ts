import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAppointment extends Document {
  patient: Types.ObjectId;
  dateTime: Date;
  duration: number;
  type: 'initial' | 'follow-up' | 'assessment' | 'therapy' | 'other';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Appointment date and time is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      default: 60,
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
    },
    type: {
      type: String,
      enum: ['initial', 'follow-up', 'assessment', 'therapy', 'other'],
      default: 'follow-up',
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    notes: {
      type: String,
      trim: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ patient: 1, dateTime: -1 });
appointmentSchema.index({ dateTime: 1 });
appointmentSchema.index({ status: 1 });

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);
