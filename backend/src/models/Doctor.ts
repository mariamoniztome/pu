import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { effectivePermissions } from '../utils/permissions.js';

export interface IDoctor extends Document {
  organization: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  permissions: {
    canManageOrganization: boolean;
    canManageDoctors: boolean;
    canViewAllPatients: boolean;
    canManageBilling: boolean;
    canViewAllCalendars: boolean;
    canManageBranding: boolean;
    canManageTeamProfiles: boolean;
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const doctorSchema = new Schema<IDoctor>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    permissions: {
      canManageOrganization: {
        type: Boolean,
        default: false,
      },
      canManageDoctors: {
        type: Boolean,
        default: false,
      },
      canViewAllPatients: {
        type: Boolean,
        default: false,
      },
      canManageBilling: {
        type: Boolean,
        default: false,
      },
      canViewAllCalendars: {
        type: Boolean,
        default: false,
      },
      canManageBranding: {
        type: Boolean,
        default: false,
      },
      canManageTeamProfiles: {
        type: Boolean,
        default: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Computed, not persisted — see effectivePermissions() for why permissions
// aren't forced by a save hook on every write.
doctorSchema.virtual('effectivePermissions').get(function (this: IDoctor) {
  return effectivePermissions(this);
});

// Indexes for performance
doctorSchema.index({ organization: 1, isActive: 1 });

// Hash password before saving
doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
doctorSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Seed role-baseline permissions on the initial document only. This used to
// run on every save (including the lastLogin touch on every request), which
// made it impossible for an owner to ever revoke canManageDoctors/
// canViewAllPatients from an admin — the next save silently restored them.
// Role-based access is now computed at read time via effectivePermissions(),
// so this only needs to give a new document sane persisted defaults.
doctorSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next();
  }
  if (this.role === 'owner') {
    this.permissions = {
      canManageOrganization: true,
      canManageDoctors: true,
      canViewAllPatients: true,
      canManageBilling: true,
      canViewAllCalendars: true,
      canManageBranding: true,
      canManageTeamProfiles: true,
    };
  } else if (this.role === 'admin') {
    this.permissions.canManageDoctors = true;
    this.permissions.canViewAllPatients = true;
  }
  next();
});

export default mongoose.model<IDoctor>('Doctor', doctorSchema);
