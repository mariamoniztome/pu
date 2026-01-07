import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  organizationId: mongoose.Types.ObjectId;
  therapist: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  videoLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    therapist: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['in-person', 'video', 'phone'],
      default: 'in-person',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    notes: String,
    videoLink: String,
  },
  { timestamps: true }
);

appointmentSchema.index({ organizationId: 1, therapist: 1, startTime: 1 });
appointmentSchema.index({ organizationId: 1, client: 1 });

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);