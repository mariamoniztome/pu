import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

export interface IConsultation extends Document {
  patient: Types.ObjectId;
  appointment?: Types.ObjectId;
  date: Date;
  sessionNumber: number;
  chiefComplaint?: string;
  sessionNotes: string;
  clinicalObservations?: string;
  interventions?: string;
  homework?: string;
  progressAssessment?: string;
  nextSessionPlan?: string;
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const consultationSchema = new Schema<IConsultation>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    date: {
      type: Date,
      required: [true, 'Consultation date is required'],
      default: Date.now,
    },
    sessionNumber: {
      type: Number,
      required: [true, 'Session number is required'],
      min: [1, 'Session number must be at least 1'],
    },
    chiefComplaint: {
      type: String,
      trim: true,
    },
    sessionNotes: {
      type: String,
      required: [true, 'Session notes are required'],
      trim: true,
    },
    clinicalObservations: {
      type: String,
      trim: true,
    },
    interventions: {
      type: String,
      trim: true,
    },
    homework: {
      type: String,
      trim: true,
    },
    progressAssessment: {
      type: String,
      trim: true,
    },
    nextSessionPlan: {
      type: String,
      trim: true,
    },
    attachments: [attachmentSchema],
  },
  {
    timestamps: true,
  }
);

consultationSchema.index({ patient: 1, date: -1 });
consultationSchema.index({ patient: 1, sessionNumber: 1 });

export default mongoose.model<IConsultation>('Consultation', consultationSchema);
