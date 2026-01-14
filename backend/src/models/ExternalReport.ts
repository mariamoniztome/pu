import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReportAttachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

export interface IExternalReport extends Document {
  organization: Types.ObjectId;
  doctor: Types.ObjectId;
  patient: Types.ObjectId;
  reportType: 'court' | 'school' | 'employer' | 'insurance' | 'medical' | 'other';
  recipientName: string;
  recipientOrganization?: string;
  requestDate: Date;
  completionDate?: Date;
  purpose: string;
  summary: string;
  findings?: string;
  recommendations?: string;
  status: 'requested' | 'in-progress' | 'completed' | 'delivered';
  attachments: IReportAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const reportAttachmentSchema = new Schema<IReportAttachment>(
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

const externalReportSchema = new Schema<IExternalReport>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    reportType: {
      type: String,
      enum: ['court', 'school', 'employer', 'insurance', 'medical', 'other'],
      required: [true, 'Report type is required'],
    },
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
    },
    recipientOrganization: {
      type: String,
      trim: true,
    },
    requestDate: {
      type: Date,
      required: [true, 'Request date is required'],
      default: Date.now,
    },
    completionDate: {
      type: Date,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
    },
    findings: {
      type: String,
      trim: true,
    },
    recommendations: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['requested', 'in-progress', 'completed', 'delivered'],
      default: 'requested',
    },
    attachments: [reportAttachmentSchema],
  },
  {
    timestamps: true,
  }
);

externalReportSchema.index({ organization: 1, requestDate: -1 });
externalReportSchema.index({ organization: 1, doctor: 1 });
externalReportSchema.index({ patient: 1, requestDate: -1 });
externalReportSchema.index({ status: 1 });
externalReportSchema.index({ reportType: 1 });

export default mongoose.model<IExternalReport>('ExternalReport', externalReportSchema);
