import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReceiptAttachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

export interface IPayment extends Document {
  organization: Types.ObjectId;
  doctor: Types.ObjectId;
  patient: Types.ObjectId;
  consultation?: Types.ObjectId;
  appointment?: Types.ObjectId;
  amount: number;
  currency: string;
  paymentDate?: Date;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check' | 'insurance' | 'other';
  status: 'unpaid' | 'partial' | 'paid';
  amountPaid: number;
  invoiceNumber?: string;
  notes?: string;
  receiptAttachment?: IReceiptAttachment;
  createdAt: Date;
  updatedAt: Date;
}

const receiptAttachmentSchema = new Schema<IReceiptAttachment>(
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

const paymentSchema = new Schema<IPayment>(
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
    consultation: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'check', 'insurance', 'other'],
    },
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid cannot be negative'],
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    receiptAttachment: receiptAttachmentSchema,
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ organization: 1, createdAt: -1 });
paymentSchema.index({ organization: 1, doctor: 1 });
paymentSchema.index({ patient: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ consultation: 1 });

paymentSchema.pre('save', function (next) {
  if (this.amountPaid >= this.amount) {
    this.status = 'paid';
  } else if (this.amountPaid > 0) {
    this.status = 'partial';
  } else {
    this.status = 'unpaid';
  }
  next();
});

export default mongoose.model<IPayment>('Payment', paymentSchema);
