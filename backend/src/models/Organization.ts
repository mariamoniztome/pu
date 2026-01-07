import mongoose, { Schema, Document } from 'mongoose';

interface ISubscription {
  plan: 'free' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  stripeId?: string;
}

interface IFeatures {
  chatbot: boolean;
  videoConsultation: boolean;
  documentManagement: boolean;
  liveAppointments: boolean;
  mobileApp: boolean;
}

interface ISettings {
  maxClients: number;
  maxAppointmentsPerDay: number;
  maxTherapists: number;
  features: IFeatures;
}

interface IMember {
  user: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'therapist';
}

export interface IOrganization extends Document {
  name: string;
  slug: string;
  owner: mongoose.Types.ObjectId;
  subscription: ISubscription;
  settings: ISettings;
  members: IMember[];
  logo?: string;
  website?: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Nome da organização é obrigatório'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'professional', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled'],
        default: 'active',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: Date,
      stripeId: String,
    },
    settings: {
      maxClients: {
        type: Number,
        default: 10,
      },
      maxAppointmentsPerDay: {
        type: Number,
        default: 8,
      },
      maxTherapists: {
        type: Number,
        default: 1,
      },
      features: {
        chatbot: {
          type: Boolean,
          default: false,
        },
        videoConsultation: {
          type: Boolean,
          default: false,
        },
        documentManagement: {
          type: Boolean,
          default: false,
        },
        liveAppointments: {
          type: Boolean,
          default: true,
        },
        mobileApp: {
          type: Boolean,
          default: false,
        },
      },
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'therapist'],
          default: 'therapist',
        },
      },
    ],
    logo: String,
    website: String,
    address: String,
    phone: String,
  },
  { timestamps: true }
);

// Índice para garantir slug único
organizationSchema.index({ slug: 1 }, { unique: true });

export default mongoose.model<IOrganization>('Organization', organizationSchema);