import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  type: 'individual' | 'clinic';
  email: string;
  phone?: string;
  address?: string;
  subscription: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'past_due';
    startDate: Date;
    endDate?: Date;
    maxDoctors: number;
    maxPatients: number;
  };
  settings: {
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
    allowDataSharing: boolean; // If true, all doctors can see all patients
  };
  branding?: {
    logoFull?: string;
    logoMark?: string;
    primaryColor?: string;
    accentColor?: string;
    clinicName?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['individual', 'clinic'],
      required: [true, 'Organization type is required'],
      default: 'individual',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'professional', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'past_due'],
        default: 'active',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
      },
      maxDoctors: {
        type: Number,
        default: 1,
      },
      maxPatients: {
        type: Number,
        default: 50,
      },
    },
    settings: {
      timezone: {
        type: String,
        default: 'UTC',
      },
      language: {
        type: String,
        default: 'en',
      },
      dateFormat: {
        type: String,
        default: 'MM/DD/YYYY',
      },
      currency: {
        type: String,
        default: 'EUR',
      },
      allowDataSharing: {
        type: Boolean,
        default: false,
      },
    },
    branding: {
      logoFull: String,
      logoMark: String,
      primaryColor: String,
      accentColor: String,
      clinicName: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
organizationSchema.index({ isActive: 1 });

export default mongoose.model<IOrganization>('Organization', organizationSchema);
