import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITrialFeedback extends Document {
  organization: Types.ObjectId;
  doctor: Types.ObjectId;
  marketType: string;
  organizationSize: string;
  needs: string;
  willingnessToPay: string;
  createdAt: Date;
  updatedAt: Date;
}

const trialFeedbackSchema = new Schema<ITrialFeedback>(
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
    marketType: {
      type: String,
      required: [true, 'Market type is required'],
      trim: true,
    },
    organizationSize: {
      type: String,
      required: [true, 'Organization size is required'],
      trim: true,
    },
    needs: {
      type: String,
      required: [true, 'Needs is required'],
      trim: true,
    },
    willingnessToPay: {
      type: String,
      required: [true, 'Willingness to pay is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

trialFeedbackSchema.index({ organization: 1 });

export default mongoose.model<ITrialFeedback>('TrialFeedback', trialFeedbackSchema);
