import mongoose, { Schema, Document, Types } from 'mongoose';

export type CalendarProvider = 'google' | 'outlook' | 'icloud';

export interface ICalendarConnection extends Document {
  organization: Types.ObjectId;
  doctor: Types.ObjectId;
  provider: CalendarProvider;
  // Account identifier shown in the UI (email for google/outlook/icloud).
  accountLabel: string;
  // google/outlook only
  accessTokenEnc?: string;
  refreshTokenEnc?: string;
  tokenExpiresAt?: Date;
  // icloud only — app-specific password, plus the discovered CalDAV
  // calendar collection URLs so re-sync doesn't repeat principal discovery.
  credentialEnc?: string;
  calendarUrls?: string[];
  status: 'connected' | 'error';
  lastSyncedAt?: Date;
  lastSyncError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const calendarConnectionSchema = new Schema<ICalendarConnection>(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    provider: { type: String, enum: ['google', 'outlook', 'icloud'], required: true },
    accountLabel: { type: String, required: true, trim: true },
    accessTokenEnc: { type: String, select: false },
    refreshTokenEnc: { type: String, select: false },
    tokenExpiresAt: { type: Date },
    credentialEnc: { type: String, select: false },
    calendarUrls: [{ type: String }],
    status: { type: String, enum: ['connected', 'error'], default: 'connected' },
    lastSyncedAt: { type: Date },
    lastSyncError: { type: String },
  },
  { timestamps: true }
);

// One connection per doctor per provider — reconnecting replaces it instead
// of accumulating duplicates.
calendarConnectionSchema.index({ doctor: 1, provider: 1 }, { unique: true });

export default mongoose.model<ICalendarConnection>('CalendarConnection', calendarConnectionSchema);
