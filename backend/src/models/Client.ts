import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  medicalHistory?: string;
  notes?: string;
  assignedTherapist?: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Nome do cliente é obrigatório'],
    },
    email: {
      type: String,
      lowercase: true,
    },
    phone: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    medicalHistory: String,
    notes: String,
    assignedTherapist: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Índice para isolamento de dados
clientSchema.index({ organizationId: 1, email: 1 }, { unique: true, sparse: true });
clientSchema.index({ organizationId: 1, status: 1 });

export default mongoose.model<IClient>('Client', clientSchema);