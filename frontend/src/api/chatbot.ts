import api from './axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  conversation: {
    sessionId: string;
    messages: ChatMessage[];
  };
}

export interface ConversationData {
  _id: string;
  sessionId: string;
  patientId?: string;
  messages: ChatMessage[];
  context?: {
    topic?: string;
    appointmentId?: string;
    consultationId?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Send a message to the chatbot
export const sendChatMessage = async (
  sessionId: string,
  message: string,
  patientId?: string,
  context?: {
    topic?: string;
    appointmentId?: string;
    consultationId?: string;
  }
): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>('/chatbot/message', {
    sessionId,
    message,
    patientId,
    context,
  });
  return response.data;
};

// Get conversation history
export const getConversation = async (sessionId: string): Promise<ConversationData> => {
  const response = await api.get<{ success: boolean; conversation: ConversationData }>(
    `/chatbot/${sessionId}`
  );
  return response.data.conversation;
};

// Get all conversations for a patient
export const getAllConversations = async (patientId?: string): Promise<ConversationData[]> => {
  const params = patientId ? { patientId } : {};
  const response = await api.get<{ success: boolean; conversations: ConversationData[] }>(
    '/chatbot',
    { params }
  );
  return response.data.conversations;
};

// Close a conversation
export const closeConversation = async (sessionId: string): Promise<void> => {
  await api.delete(`/chatbot/${sessionId}`);
};
