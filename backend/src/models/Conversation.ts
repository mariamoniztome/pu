import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  organization: mongoose.Schema.Types.ObjectId;
  doctor: mongoose.Schema.Types.ObjectId;
  patientId?: mongoose.Schema.Types.ObjectId;
  sessionId: string;
  messages: IMessage[];
  context: {
    topic?: string;
    appointmentId?: mongoose.Schema.Types.ObjectId;
    consultationId?: mongoose.Schema.Types.ObjectId;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [messageSchema],
    context: {
      topic: String,
      appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
      consultationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation',
      },
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

// Index for faster queries
conversationSchema.index({ organization: 1, doctor: 1 });
conversationSchema.index({ sessionId: 1 });
conversationSchema.index({ patientId: 1, createdAt: -1 });
conversationSchema.index({ 'context.appointmentId': 1 });

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation;
