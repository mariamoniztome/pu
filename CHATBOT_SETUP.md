# Context-Aware Chatbot Integration

## Overview

A context-aware support chatbot has been added to your psychology clinic management app. The chatbot remembers conversations, provides intelligent support for multi-step bookings, and troubleshoots common issues.

## Features

### 1. **Persistent Conversation Context**
- Each conversation is stored with a unique `sessionId`
- Full chat history is maintained in the database
- Users can continue conversations across sessions
- Context can include appointment IDs, consultation IDs, or custom topics

### 2. **Intelligent Response Generation**
- Rule-based responses that understand appointment, consultation, payment, and general queries
- Context-aware responses based on conversation history
- Graceful handling of multi-step conversations
- Integration points for advanced AI models (OpenAI, Claude, etc.)

### 3. **User-Friendly Interface**
- Floating chat widget that can be minimized/maximized
- Clean message bubbles with timestamps
- Loading indicator during message processing
- Responsive design that works on all devices
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

### 4. **Patient-Specific Support**
- Track conversations per patient
- Link conversations to specific appointments or consultations
- Access conversation history from patient records

## Architecture

### Backend Components

#### Model: `Conversation` (`backend/src/models/Conversation.ts`)
```typescript
interface IConversation {
  patientId?: ObjectId;           // Optional patient reference
  sessionId: string;               // Unique session identifier
  messages: IMessage[];            // Array of chat messages
  context: {
    topic?: string;                // Current conversation topic
    appointmentId?: ObjectId;      // Related appointment
    consultationId?: ObjectId;     // Related consultation
  };
  isActive: boolean;               // Conversation status
  createdAt: Date;
  updatedAt: Date;
}
```

#### Controller: `chatbotController.ts`
- `sendMessage()` - Process user messages and generate responses
- `getConversation()` - Retrieve specific conversation history
- `getAllConversations()` - Get conversations for a patient
- `closeConversation()` - Archive a conversation

#### Routes: `chatbotRoutes.ts`
- `POST /api/chatbot/message` - Send a message
- `GET /api/chatbot/:sessionId` - Get conversation
- `GET /api/chatbot` - Get all conversations
- `DELETE /api/chatbot/:sessionId` - Close conversation

### Frontend Components

#### API Client: `frontend/src/api/chatbot.ts`
- `sendChatMessage()` - Send message to chatbot
- `getConversation()` - Fetch conversation history
- `getAllConversations()` - Get all patient conversations
- `closeConversation()` - Close a conversation

#### Component: `frontend/src/components/Chatbot.tsx`
- Complete chat UI with message rendering
- Input handling and message sending
- Auto-scrolling to latest messages
- Loading states and error handling
- Minimize/maximize functionality

## Usage

### Basic Implementation

The chatbot is automatically integrated into your app's layout. It appears as a floating button in the bottom-right corner:

```tsx
// In Layout.tsx (already integrated)
<Chatbot />
```

### With Patient Context

Pass patient-specific information to the chatbot:

```tsx
<Chatbot 
  patientId="patient-123"
  context={{
    topic: "appointment_booking",
    appointmentId: "appt-456"
  }}
/>
```

### Sending Messages Programmatically

```typescript
import { sendChatMessage } from '../api/chatbot';

const response = await sendChatMessage(
  'session-id',
  'I need to book an appointment',
  'patient-123',
  { topic: 'appointment_booking' }
);

console.log(response.message); // Bot's response
```

## Conversation Flow Examples

### Example 1: Multi-Step Appointment Booking
```
User: "I need to book an appointment"
Bot: "I can help you find available appointment slots. Could you tell me what day or time works best for you?"
User: "Next Tuesday at 2 PM"
Bot: "Great! I'll help you find available therapists for next Tuesday at 2 PM. Who would you prefer to see?"
```

### Example 2: Payment Inquiry
```
User: "What's my balance?"
Bot: "Our clinic uses secure payment processing. I can help you with payment history, outstanding balances, or payment options. What would you like to know?"
User: "I want to pay my invoice"
Bot: "I can assist with payment processing. Do you have a specific invoice number?"
```

## Database Schema

The chatbot uses MongoDB to store:
- **Conversations collection** with indexed fields:
  - `sessionId` (unique) - for quick session lookup
  - `patientId` (with date index) - for patient history queries
  - `context.appointmentId` - for appointment-related queries

Example conversation document:
```json
{
  "_id": "ObjectId",
  "sessionId": "session-1704501600000",
  "patientId": "patient-123",
  "messages": [
    {
      "role": "user",
      "content": "I need help with my appointment",
      "timestamp": "2024-01-06T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "I'd be happy to help with your appointment...",
      "timestamp": "2024-01-06T10:00:05Z"
    }
  ],
  "context": {
    "topic": "appointment_booking",
    "appointmentId": "appt-456"
  },
  "isActive": true,
  "createdAt": "2024-01-06T10:00:00Z",
  "updatedAt": "2024-01-06T10:00:05Z"
}
```

## Response Generation Logic

The chatbot uses intelligent rule-based responses:

1. **Appointment Queries** - Responds to booking, scheduling, rescheduling, cancellation
2. **Consultation Queries** - Provides session information and history
3. **Payment Queries** - Handles billing and payment processing questions
4. **General Queries** - Provides help menu and general guidance
5. **Context-Aware** - References previous conversation topics for coherent responses

## Extending the Chatbot

### Add AI Integration (OpenAI Example)

Update `chatbotController.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateChatbotResponse = async (
  message: string,
  conversationHistory: IMessage[],
  context?: any
): Promise<string> => {
  const messages = conversationHistory.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...messages,
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content || '';
};
```

### Add Message Filtering/Moderation

```typescript
const isAppropriate = await moderateContent(message);
if (!isAppropriate) {
  return "I can't respond to that. Please keep messages appropriate.";
}
```

### Add Analytics

```typescript
// Track chatbot interactions
await ChatAnalytics.create({
  sessionId,
  messageCount: conversation.messages.length,
  topic: context.topic,
  resolution: wasResolved,
  timestamp: new Date(),
});
```

## Configuration

Set environment variables in `.env`:

```bash
# MongoDB (backend)
MONGODB_URI=mongodb://localhost:27017/psychology-clinic

# OpenAI (optional, for AI integration)
OPENAI_API_KEY=your-api-key-here

# Frontend
VITE_API_URL=http://localhost:5000/api
```

## Testing

### Test Chatbot Endpoints

```bash
# Send a message
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-123",
    "message": "I need an appointment",
    "patientId": "patient-123"
  }'

# Get conversation history
curl http://localhost:5000/api/chatbot/session-123

# Get all patient conversations
curl http://localhost:5000/api/chatbot?patientId=patient-123

# Close conversation
curl -X DELETE http://localhost:5000/api/chatbot/session-123
```

## Security Considerations

1. **Session Management** - Each conversation has a unique session ID
2. **Patient Privacy** - Conversations are linked to patient records
3. **Input Validation** - All messages are validated before processing
4. **Rate Limiting** - Consider adding rate limiting to prevent abuse
5. **Data Encryption** - Consider encrypting sensitive conversation data

## Future Enhancements

- [ ] Integration with OpenAI/Claude for advanced NLP
- [ ] Multi-language support
- [ ] Sentiment analysis to detect frustrated users
- [ ] Automatic escalation to human support agents
- [ ] Conversation analytics and insights
- [ ] Chatbot training from successful interactions
- [ ] Integration with calendar API for real-time availability
- [ ] SMS/WhatsApp channel support
- [ ] Voice interface support

## Troubleshooting

### Chatbot not appearing
- Ensure `<Chatbot />` is in your Layout component
- Check browser console for errors
- Verify backend API is running

### Messages not sending
- Check network connectivity
- Verify backend endpoint: `POST /api/chatbot/message`
- Check browser console for error messages

### Responses not showing
- Ensure MongoDB is running
- Check backend logs for errors
- Verify Conversation model is properly imported

## Support

For issues or feature requests, check:
1. Backend logs: Check terminal where backend is running
2. Frontend console: F12 → Console tab
3. Network tab: Check API responses
