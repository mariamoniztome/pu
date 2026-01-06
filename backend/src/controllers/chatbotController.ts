import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Conversation, { IConversation, IMessage } from '../models/Conversation.js';
import Patient from '../models/Patient.js';

// System prompt for the chatbot to maintain context
const SYSTEM_PROMPT = `You are a helpful support agent for a psychology clinic management system. You help users with:
1. Scheduling and managing appointments
2. Tracking consultation sessions
3. Resolving common issues with the platform
4. Providing general guidance about clinic services
5. Multi-step booking assistance

Always be professional, empathetic, and concise. Remember the conversation context and previous messages to provide coherent support. If a user asks about specific bookings or records, acknowledge that you'd need their confirmation before accessing details.`;

interface ChatRequest extends Request {
  body: {
    sessionId: string;
    message: string;
    patientId?: string;
    context?: {
      topic?: string;
      appointmentId?: string;
      consultationId?: string;
    };
  };
}

// Generate a simple response based on user message and context
const generateChatbotResponse = async (
  message: string,
  conversationHistory: IMessage[],
  context?: any
): Promise<string> => {
  // In a production app, you would integrate with:
  // - OpenAI API (GPT-3.5, GPT-4)
  // - Anthropic Claude
  // - Google's Vertex AI
  // - Or a custom ML model

  // For now, we'll implement intelligent rule-based responses
  const lowerMessage = message.toLowerCase();

  // Extract context from conversation history
  const recentMessages = conversationHistory.slice(-4).map((m) => `${m.role}: ${m.content}`).join('\n');

  // Appointment-related queries
  if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
    if (lowerMessage.includes('when') || lowerMessage.includes('available')) {
      return "I can help you find available appointment slots. Could you tell me what day or time works best for you? Our clinic typically has availability Monday through Friday, 9 AM to 6 PM.";
    }
    if (lowerMessage.includes('cancel') || lowerMessage.includes('reschedule')) {
      return "I can help you reschedule or cancel an appointment. Could you please provide the appointment ID or the date of your appointment?";
    }
    return "I'd be happy to help you with appointment scheduling. What would you like to know - finding available times, booking a new appointment, or managing an existing one?";
  }

  // Consultation/Session-related queries
  if (lowerMessage.includes('consultation') || lowerMessage.includes('session')) {
    if (lowerMessage.includes('notes') || lowerMessage.includes('what')) {
      return "Your consultation sessions are securely stored in our system. Each session includes detailed notes and progress tracking. Would you like to view details about a specific session?";
    }
    return "I can help you with information about your consultation sessions. Do you need details about a specific session, or are you looking to schedule a new one?";
  }

  // Payment-related queries
  if (lowerMessage.includes('payment') || lowerMessage.includes('billing') || lowerMessage.includes('cost')) {
    return "Our clinic uses secure payment processing. I can help you with payment history, outstanding balances, or payment options. What would you like to know?";
  }

  // General help
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return "I'm here to help! I can assist with:\n• Booking and managing appointments\n• Information about consultations\n• Payment and billing questions\n• General platform guidance\n\nWhat do you need help with?";
  }

  // Default response
  return "Thank you for your message. Based on our conversation, I'm here to help with appointments, consultations, payments, and general clinic services. Could you tell me more about what you need?";
};

export const sendMessage = async (req: ChatRequest, res: Response): Promise<void> => {
  try {
    const { sessionId, message, patientId, context } = req.body;

    if (!sessionId || !message) {
      res.status(400).json({
        success: false,
        message: 'Session ID and message are required',
      });
      return;
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      conversation = new Conversation({
        sessionId,
        patientId,
        messages: [],
        context: context || {},
        isActive: true,
      });
    } else {
      // Update context if provided
      if (context) {
        conversation.context = {
          topic: context.topic,
          appointmentId: context.appointmentId  
            ? (new mongoose.Types.ObjectId(context.appointmentId) as any) 
            : conversation.context.appointmentId,
          consultationId: context.consultationId 
            ? (new mongoose.Types.ObjectId(context.consultationId) as any) 
            : conversation.context.consultationId,
        };
      }
    }

    // Add user message
    const userMessage: IMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);

    // Generate bot response
    const botResponse = await generateChatbotResponse(message, conversation.messages, conversation.context);

    const assistantMessage: IMessage = {
      role: 'assistant',
      content: botResponse,
      timestamp: new Date(),
    };
    conversation.messages.push(assistantMessage);

    await conversation.save();

    res.json({
      success: true,
      message: botResponse,
      conversation: {
        sessionId: conversation.sessionId,
        messages: conversation.messages,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing chat message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const conversation = await Conversation.findOne({ sessionId }).populate('patientId', 'firstName lastName email');

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
      return;
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conversation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAllConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.query;
    const filter: any = { isActive: true };

    if (patientId) {
      filter.patientId = patientId;
    }

    const conversations = await Conversation.find(filter)
      .populate('patientId', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conversations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const closeConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const conversation = await Conversation.findOneAndUpdate(
      { sessionId },
      { isActive: false },
      { new: true }
    );

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Conversation closed',
      conversation,
    });
  } catch (error) {
    console.error('Close conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing conversation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
