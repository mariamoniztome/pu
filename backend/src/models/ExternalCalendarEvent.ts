import mongoose, { Schema, Document, Types } from 'mongoose';
import { CalendarProvider } from './CalendarConnection.js';

// A read-only cache of "busy" blocks pulled from a connected external
// calendar. These are display-only overlays on the doctor's calendar view —
// unlike Appointment, they're never linked to a patient and can't be edited
// here, only re-synced or removed by disconnecting the source connection.
export interface IExternalCalendarEvent extends Document {
  organization: Types.ObjectId;
  doctor: Types.ObjectId;
  connection: Types.ObjectId;
  provider: CalendarProvider;
  externalId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const externalCalendarEventSchema = new Schema<IExternalCalendarEvent>(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    connection: { type: Schema.Types.ObjectId, ref: 'CalendarConnection', required: true },
    provider: { type: String, enum: ['google', 'outlook', 'icloud'], required: true },
    externalId: { type: String, required: true },
    title: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Lets a re-sync overwrite/dedupe by (connection, externalId) instead of
// growing the collection unbounded across syncs.
externalCalendarEventSchema.index({ connection: 1, externalId: 1 }, { unique: true });
externalCalendarEventSchema.index({ doctor: 1, startTime: 1, endTime: 1 });

export default mongoose.model<IExternalCalendarEvent>('ExternalCalendarEvent', externalCalendarEventSchema);
