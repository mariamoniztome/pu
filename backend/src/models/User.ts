import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IOrganizationRef {
  organizationId: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'therapist';
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  globalRole: 'superadmin' | 'psychologist' | 'therapist' | 'client';
  organizations: IOrganizationRef[];
  phone?: string;
  specialty?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'Password é obrigatória'],
      minlength: 6,
      select: false,
    },
    globalRole: {
      type: String,
      enum: ['superadmin', 'psychologist', 'therapist', 'client'],
      default: 'client',
    },
    organizations: [
      {
        organizationId: {
          type: Schema.Types.ObjectId,
          ref: 'Organization',
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'therapist'],
        },
      },
    ],
    phone: String,
    specialty: String,
    avatar: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);